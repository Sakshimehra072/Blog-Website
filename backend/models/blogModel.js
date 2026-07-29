const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const FILE_PATH = path.join(DATA_DIR, 'blogs.json');

// Safely ensure data directory exists without breaking Vercel read-only filesystem
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {}

function readPersistentBlogs() {
  try {
    if (fs.existsSync(FILE_PATH)) {
      const raw = fs.readFileSync(FILE_PATH, 'utf8');
      return raw ? JSON.parse(raw) : [];
    }
  } catch (e) {}
  return [];
}

function writePersistentBlogs(blogs) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(blogs, null, 2), 'utf8');
  } catch (e) {}
}

const memoryBlogsFallback = [];
const inMemoryLikes = [];

function generateSlug(title) {
  const base = (title || 'blog').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `${base}-${Date.now().toString(36)}`;
}

// 1. Create a new blog post directly in MySQL (Adaptive schema)
async function createBlogInDb({ title, category, coverImage, description, authorId, authorName, authorAvatar, readTime }) {
  if (!title || !category || !description) {
    throw new Error('Title, category, and description are required.');
  }

  const cleanReadTime = readTime || '5 min read';
  const cleanCoverImage = coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80';
  const cleanAuthorName = authorName || 'Registered Author';
  const slug = generateSlug(title);

  let result;
  try {
    // Try Schema Option 1 (Railway production schema: user_id, slug, status)
    const [res] = await pool.query(
      `INSERT INTO blogs (title, slug, description, cover_image, user_id, read_time, status)
       VALUES (?, ?, ?, ?, ?, ?, 'published')`,
      [
        title.trim(),
        slug,
        description.trim(),
        cleanCoverImage,
        authorId || null,
        cleanReadTime
      ]
    );
    result = res;
  } catch (err1) {
    try {
      // Try Schema Option 2 (Legacy schema: category, author_id, author_name)
      const [res] = await pool.query(
        `INSERT INTO blogs (title, category, cover_image, description, author_id, author_name, author_avatar, read_time, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          title.trim(),
          category.trim(),
          cleanCoverImage,
          description.trim(),
          authorId || null,
          cleanAuthorName,
          authorAvatar || null,
          cleanReadTime
        ]
      );
      result = res;
    } catch (err2) {
      console.error('MySQL backend createBlogInDb Error:', err2);
      throw new Error(err2.message || 'Failed to insert blog post into database.');
    }
  }

  const insertedId = result.insertId;

  // Fetch inserted row from database to ensure exact schema response
  const [rows] = await pool.query('SELECT * FROM blogs WHERE id = ?', [insertedId]);
  if (rows && rows.length > 0) {
    return formatBlogResponse(rows[0]);
  }

  return formatBlogResponse({
    id: insertedId,
    title: title.trim(),
    category: category.trim(),
    cover_image: cleanCoverImage,
    description: description.trim(),
    author_id: authorId || null,
    author_name: cleanAuthorName,
    author_avatar: authorAvatar || null,
    read_time: cleanReadTime,
    created_at: new Date().toISOString()
  });
}

// 2. Fetch ALL blogs published by real users (Sorted by createdAt DESC)
async function getBlogsFromDb({ category = null, page = 1, limit = 100 }) {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, parseInt(limit) || 100);
  const offset = (pageNum - 1) * limitNum;

  let totalBlogs = 0;
  let blogs = [];

  try {
    // Total count query
    let countQuery = `SELECT COUNT(*) as total FROM blogs`;
    const countParams = [];
    if (category && category.trim() && category !== 'All') {
      countQuery += ` WHERE LOWER(category) = LOWER(?)`;
      countParams.push(category.trim());
    }

    const [countRows] = await pool.query(countQuery, countParams);
    if (countRows && countRows.length > 0) {
      totalBlogs = Number(countRows[0].total);
    }

    try {
      let query = `
        SELECT b.*, 
               (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as real_comments_count,
               (SELECT COUNT(*) FROM likes WHERE blog_id = b.id) as real_likes_count,
               u.name as live_author_name, 
               u.avatar_url as live_author_avatar 
        FROM blogs b 
        LEFT JOIN users u ON b.author_id = u.id
      `;
      const params = [];

      if (category && category.trim() && category !== 'All') {
        query += ` WHERE LOWER(b.category) = LOWER(?)`;
        params.push(category.trim());
      }

      query += ` ORDER BY b.created_at DESC LIMIT ${limitNum} OFFSET ${offset}`;

      const [rows] = await pool.query(query, params);
      if (Array.isArray(rows)) {
        blogs = rows.map(r => formatBlogResponse(r));
      }
    } catch (subErr) {
      let fallbackQuery = `SELECT * FROM blogs`;
      const fallbackParams = [];
      if (category && category.trim() && category !== 'All') {
        fallbackQuery += ` WHERE LOWER(category) = LOWER(?)`;
        fallbackParams.push(category.trim());
      }
      fallbackQuery += ` ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offset}`;
      const [rows] = await pool.query(fallbackQuery, fallbackParams);
      if (Array.isArray(rows)) {
        blogs = rows.map(r => formatBlogResponse(r));
      }
    }
  } catch (err) {}

  if (blogs.length === 0) {
    // Fallback to persistent file & memory fallback
    let allBlogsMap = new Map();
    const fileBlogs = readPersistentBlogs();
    fileBlogs.forEach(b => {
      allBlogsMap.set(String(b.id), formatBlogResponse(b));
    });
    memoryBlogsFallback.forEach(b => {
      allBlogsMap.set(String(b.id), formatBlogResponse(b));
    });

    let combined = Array.from(allBlogsMap.values());

    if (category && category.trim() && category !== 'All') {
      combined = combined.filter(b => b.category && b.category.toLowerCase() === category.trim().toLowerCase());
    }

    combined.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
    totalBlogs = Math.max(totalBlogs, combined.length);
    blogs = combined.slice(offset, offset + limitNum);
  }

  const totalPages = Math.ceil(totalBlogs / limitNum) || 1;

  return {
    blogs,
    totalBlogs,
    currentPage: pageNum,
    totalPages
  };
}

// 3. Fetch single blog by ID
async function getBlogByIdFromDb(blogId) {
  const bId = Number(blogId);
  try {
    const [rows] = await pool.query(
      `SELECT b.*, 
              (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as real_comments_count,
              (SELECT COUNT(*) FROM likes WHERE blog_id = b.id) as real_likes_count,
              u.name as live_author_name, 
              u.avatar_url as live_author_avatar 
       FROM blogs b 
       LEFT JOIN users u ON b.author_id = u.id 
       WHERE b.id = ?`,
      [bId]
    );
    if (rows.length > 0) {
      return formatBlogResponse(rows[0]);
    }
  } catch (err) {}

  const fileBlogs = readPersistentBlogs();
  const match = fileBlogs.find(b => Number(b.id) === bId || String(b.id) === String(blogId)) ||
                memoryBlogsFallback.find(b => Number(b.id) === bId || String(b.id) === String(blogId));
  if (match) return formatBlogResponse(match);
  return null;
}

// 4. Toggle Like on a Blog
async function toggleLikeBlogInDb(userId, blogId) {
  const uId = Number(userId);
  const bId = Number(blogId);

  try {
    const [existing] = await pool.query(
      'SELECT * FROM likes WHERE user_id = ? AND blog_id = ?',
      [uId, bId]
    );

    let liked = false;
    if (existing.length > 0) {
      await pool.query('DELETE FROM likes WHERE id = ?', [existing[0].id]);
      await pool.query('UPDATE blogs SET likes_count = GREATEST(0, likes_count - 1) WHERE id = ?', [bId]);
      liked = false;
    } else {
      await pool.query('INSERT INTO likes (user_id, blog_id) VALUES (?, ?)', [uId, bId]);
      await pool.query('UPDATE blogs SET likes_count = likes_count + 1 WHERE id = ?', [bId]);
      liked = true;
    }

    const [updatedRows] = await pool.query('SELECT COUNT(*) as real_likes FROM likes WHERE blog_id = ?', [bId]);
    const likesCount = updatedRows.length > 0 ? Number(updatedRows[0].real_likes) : 0;

    return { liked, likesCount };
  } catch (err) {
    const fileBlogs = readPersistentBlogs();
    const blog = fileBlogs.find(b => Number(b.id) === bId) || memoryBlogsFallback.find(b => Number(b.id) === bId);
    let liked = false;

    const index = inMemoryLikes.findIndex(l => Number(l.user_id) === uId && Number(l.blog_id) === bId);
    if (index !== -1) {
      inMemoryLikes.splice(index, 1);
      if (blog) blog.likes_count = Math.max(0, (blog.likes_count || 1) - 1);
      liked = false;
    } else {
      inMemoryLikes.push({ user_id: uId, blog_id: bId });
      if (blog) blog.likes_count = (blog.likes_count || 0) + 1;
      liked = true;
    }
    writePersistentBlogs(fileBlogs);

    return { liked, likesCount: blog ? blog.likes_count : 0 };
  }
}

// 5. Get Real Category Counts
async function getCategoryCountsFromDb() {
  const countsMap = {};

  try {
    const [totalRows] = await pool.query('SELECT COUNT(*) as total FROM blogs');
    countsMap['All'] = totalRows.length > 0 ? Number(totalRows[0].total) : 0;

    const [rows] = await pool.query('SELECT category, COUNT(*) as count FROM blogs GROUP BY category');
    rows.forEach(r => {
      if (r.category) {
        countsMap[r.category] = Number(r.count);
      }
    });

    return countsMap;
  } catch (err) {}

  const fileBlogs = readPersistentBlogs();
  const allList = [...fileBlogs, ...memoryBlogsFallback];
  countsMap['All'] = allList.length;
  allList.forEach(b => {
    if (b.category) {
      countsMap[b.category] = (countsMap[b.category] || 0) + 1;
    }
  });

  return countsMap;
}

// Delete a blog post by ID
async function deleteBlogFromDb(blogId) {
  if (!blogId) {
    return { success: false, affectedRows: 0, message: 'Invalid blog ID parameter.' };
  }

  const idStr = String(blogId).trim();
  const bId = isNaN(Number(idStr)) ? 0 : Number(idStr);

  // 1. Delete from MySQL Database if connected
  let conn;
  let affectedRows = 0;
  try {
    conn = await pool.getConnection();
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');

    if (bId !== 0) {
      try { await conn.query('DELETE FROM comments WHERE blog_id = ?', [bId]); } catch (e) {}
      try { await conn.query('DELETE FROM likes WHERE blog_id = ?', [bId]); } catch (e) {}
      try { await conn.query('DELETE FROM favourites WHERE blog_id = ?', [bId]); } catch (e) {}
    }

    const [result] = await conn.query(
      'DELETE FROM blogs WHERE id = ? OR (id = ? AND ? != 0) OR slug = ?',
      [idStr, bId, bId, idStr]
    );

    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    conn.release();

    affectedRows = result ? result.affectedRows : 0;
    console.log(`🗑 Backend MySQL DB DELETE result for blog ID "${blogId}": affectedRows = ${affectedRows}`);
  } catch (err) {
    console.error('Backend MySQL deleteBlogFromDb error:', err);
    if (conn) {
      try { await conn.query('SET FOREIGN_KEY_CHECKS = 1'); } catch (e) {}
      conn.release();
    }
  }

  // 2. Delete from persistent JSON file storage
  try {
    const currentList = readPersistentBlogs();
    const filtered = currentList.filter(b => Number(b.id) !== bId && String(b.id) !== idStr);
    writePersistentBlogs(filtered);
  } catch (err) {}

  // 3. Delete from memory fallback list
  const memIndex = memoryBlogsFallback.findIndex(b => Number(b.id) === bId || String(b.id) === idStr);
  if (memIndex !== -1) {
    memoryBlogsFallback.splice(memIndex, 1);
  }

  return {
    success: affectedRows > 0,
    affectedRows,
    message: affectedRows > 0 ? 'Article deleted successfully.' : 'Article not found.'
  };
}

// Update an existing blog post
async function updateBlogInDb(blogId, { title, category, coverImage, description }) {
  const bId = Number(blogId);

  // 1. Update in MySQL Database if connected
  try {
    await pool.query(
      `UPDATE blogs 
       SET title = ?, category = ?, cover_image = ?, description = ?, updated_at = NOW() 
       WHERE id = ?`,
      [title, category, coverImage, description, bId]
    );
  } catch (err) {}

  // 2. Update in persistent JSON file storage
  try {
    const currentList = readPersistentBlogs();
    const blogIndex = currentList.findIndex(b => Number(b.id) === bId || String(b.id) === String(blogId));
    if (blogIndex !== -1) {
      if (title) currentList[blogIndex].title = title;
      if (category) currentList[blogIndex].category = category;
      if (coverImage) currentList[blogIndex].cover_image = coverImage;
      if (description) currentList[blogIndex].description = description;
      writePersistentBlogs(currentList);
    }
  } catch (err) {}

  // 3. Update in memory fallback list
  const memIndex = memoryBlogsFallback.findIndex(b => Number(b.id) === bId || String(b.id) === String(blogId));
  if (memIndex !== -1) {
    if (title) memoryBlogsFallback[memIndex].title = title;
    if (category) memoryBlogsFallback[memIndex].category = category;
    if (coverImage) memoryBlogsFallback[memIndex].cover_image = coverImage;
    if (description) memoryBlogsFallback[memIndex].description = description;
  }

  return await getBlogByIdFromDb(blogId);
}

// Helper to format consistent Blog JSON payload
function formatBlogResponse(b) {
  const likesCount = typeof b.real_likes_count === 'number' ? Number(b.real_likes_count) : (b.likes_count || b.likes || 0);
  const commentsCount = typeof b.real_comments_count === 'number' ? Number(b.real_comments_count) : (b.comments_count || b.comments || 0);

  // Dynamically resolve author username from database (live user JOIN or author fields)
  let displayName = b.live_author_name || b.u_username || b.username || b.user_name || b.name || b.author_name;

  if (!displayName || displayName === 'Registered Author' || displayName.toLowerCase() === 'registered author') {
    if (b.author && b.author.name && b.author.name.toLowerCase() !== 'registered author') {
      displayName = b.author.name;
    } else if (b.email || b.live_author_email) {
      const em = b.live_author_email || b.email;
      displayName = em.split('@')[0];
    }
  }

  if (!displayName || displayName === 'Registered Author' || displayName.toLowerCase() === 'registered author') {
    displayName = 'Anonymous Author';
  }

  return {
    id: b.id,
    title: b.title,
    category: b.category,
    coverImage: b.cover_image || b.coverImage,
    description: b.description || b.excerpt,
    excerpt: b.description ? (b.description.slice(0, 140) + '...') : '',
    author: {
      id: b.user_id || b.author_id,
      name: displayName,
      avatar: b.live_author_avatar || b.author_avatar || (b.author ? b.author.avatar : null)
    },
    readTime: b.read_time || b.readTime || '5 min read',
    likes: likesCount,
    comments: commentsCount,
    createdAt: b.created_at || b.createdAt || new Date().toISOString()
  };
}

module.exports = {
  createBlogInDb,
  getBlogsFromDb,
  getBlogByIdFromDb,
  toggleLikeBlogInDb,
  getCategoryCountsFromDb,
  deleteBlogFromDb,
  updateBlogInDb
};
