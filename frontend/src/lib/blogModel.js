import pool from './db';

function generateSlug(title) {
  const base = (title || 'blog').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `${base}-${Date.now().toString(36)}`;
}

// Helper to format consistent Blog JSON payload
function formatBlogResponse(b, defaultCategory = 'Technology') {
  const likesCount = typeof b.real_likes_count === 'number' ? Number(b.real_likes_count) : (b.likes_count || b.likes || 0);
  const commentsCount = typeof b.real_comments_count === 'number' ? Number(b.real_comments_count) : (b.comments_count || b.comments || 0);

  let displayName = b.live_author_name || b.u_username || b.username || b.user_name || b.name;
  if (!displayName || displayName === 'Registered Author' || displayName.toLowerCase() === 'registered author') {
    if (b.author_name && b.author_name.toLowerCase() !== 'registered author') {
      displayName = b.author_name;
    } else if (b.author && b.author.name && b.author.name.toLowerCase() !== 'registered author') {
      displayName = b.author.name;
    } else if (b.email) {
      displayName = b.email.split('@')[0];
    }
  }
  if (!displayName || displayName === 'Registered Author' || displayName.toLowerCase() === 'registered author') {
    displayName = 'Sakshi';
  }

  return {
    id: b.id,
    title: b.title,
    category: b.category || b.category_name || defaultCategory || 'Technology',
    coverImage: b.cover_image || b.coverImage,
    description: b.description || b.excerpt,
    excerpt: b.description ? (b.description.slice(0, 140) + '...') : '',
    author: {
      id: b.user_id || b.author_id,
      name: displayName,
      avatar: b.live_author_avatar || b.profile_image || b.author_avatar || (b.author ? b.author.avatar : null)
    },
    readTime: b.read_time || b.readTime || '5 min read',
    likes: likesCount,
    comments: commentsCount,
    createdAt: b.created_at || b.createdAt || new Date().toISOString()
  };
}

// 1. Create a new blog post directly in MySQL (Adaptive for all DB schemas)
export async function createBlogInDb({ title, category, coverImage, description, authorId, authorName, authorAvatar, readTime }) {
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
      console.error('MySQL createBlogInDb Error:', err2);
      throw new Error(err2.message || 'Failed to insert blog post into database.');
    }
  }

  const insertedId = result.insertId;

  // Fetch inserted row from database to ensure exact schema response
  const [rows] = await pool.query('SELECT * FROM blogs WHERE id = ?', [insertedId]);
  if (rows && rows.length > 0) {
    return formatBlogResponse(rows[0], category);
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

// 2. Fetch ALL blogs with pagination metadata
export async function getBlogsFromDb({ category = null, page = 1, limit = 100 }) {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, parseInt(limit) || 100);
  const offset = (pageNum - 1) * limitNum;

  let totalBlogs = 0;
  let blogs = [];

  try {
    // Total count query
    let countQuery = `SELECT COUNT(*) as total FROM blogs`;
    const countParams = [];
    const [countRows] = await pool.query(countQuery, countParams);
    if (countRows && countRows.length > 0) {
      totalBlogs = Number(countRows[0].total);
    }

    // Main fetch query
    try {
      let query = `
        SELECT b.*, 
               (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as real_comments_count,
               (SELECT COUNT(*) FROM likes WHERE blog_id = b.id) as real_likes_count,
               u.username as live_author_name, 
               u.profile_image as live_author_avatar 
        FROM blogs b 
        LEFT JOIN users u ON (b.user_id = u.id OR b.author_id = u.id)
      `;
      const params = [];
      query += ` ORDER BY b.created_at DESC LIMIT ${limitNum} OFFSET ${offset}`;

      const [rows] = await pool.query(query, params);
      if (Array.isArray(rows)) {
        blogs = rows.map(r => formatBlogResponse(r));
      }
    } catch (subErr) {
      let fallbackQuery = `SELECT * FROM blogs ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offset}`;
      const [rows] = await pool.query(fallbackQuery);
      if (Array.isArray(rows)) {
        blogs = rows.map(r => formatBlogResponse(r));
      }
    }
  } catch (err) {
    console.error('MySQL Fetch Blogs Error:', err);
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
export async function getBlogByIdFromDb(blogId) {
  const bId = Number(blogId);
  try {
    const [rows] = await pool.query(
      `SELECT b.*, 
              (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as real_comments_count,
              (SELECT COUNT(*) FROM likes WHERE blog_id = b.id) as real_likes_count,
              u.username as live_author_name, 
              u.profile_image as live_author_avatar 
       FROM blogs b 
       LEFT JOIN users u ON (b.user_id = u.id OR b.author_id = u.id) 
       WHERE b.id = ?`,
      [bId]
    );
    if (rows.length > 0) {
      return formatBlogResponse(rows[0]);
    }
  } catch (err) {}

  return null;
}

// 4. Get Category Counts
export async function getCategoryCountsFromDb() {
  const countsMap = {};

  try {
    const [totalRows] = await pool.query('SELECT COUNT(*) as total FROM blogs');
    countsMap['All'] = totalRows.length > 0 ? Number(totalRows[0].total) : 0;
  } catch (err) {}

  return countsMap;
}

// 5. Delete blog by ID cleanly from MySQL database
export async function deleteBlogFromDb(blogId) {
  if (!blogId) {
    return { success: false, affectedRows: 0, message: 'Invalid blog ID parameter.' };
  }

  const idStr = String(blogId).trim();
  const bId = isNaN(Number(idStr)) ? 0 : Number(idStr);

  let conn;
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

    const affectedRows = result ? result.affectedRows : 0;
    console.log(`🗑 MySQL DB DELETE result for blog ID "${blogId}": affectedRows = ${affectedRows}`);

    if (affectedRows > 0) {
      return { success: true, affectedRows, message: 'Article deleted successfully from database.' };
    }

    return { success: false, affectedRows: 0, message: `Article with ID "${blogId}" not found in database.` };
  } catch (err) {
    console.error('MySQL deleteBlogFromDb error:', err);
    if (conn) {
      try { await conn.query('SET FOREIGN_KEY_CHECKS = 1'); } catch (e) {}
      conn.release();
    }
    throw new Error(`Failed to delete blog ID "${blogId}" from database: ${err.message}`);
  }
}

// 6. Update blog post
export async function updateBlogInDb(blogId, { title, category, coverImage, description }) {
  const bId = Number(blogId);

  try {
    await pool.query(
      `UPDATE blogs 
       SET title = ?, cover_image = ?, description = ?, updated_at = NOW() 
       WHERE id = ?`,
      [title, coverImage, description, bId]
    );
  } catch (err) {}

  return await getBlogByIdFromDb(blogId);
}
