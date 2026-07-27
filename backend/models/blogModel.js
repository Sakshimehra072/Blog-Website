const { pool } = require('../config/database');

// Pure Database & In-Memory Store (Zero sample/hardcoded blogs - Only real registered user blogs)
const inMemoryBlogs = [];
const inMemoryLikes = []; // { user_id, blog_id }

// 1. Create a new blog post for real registered user
async function createBlogInDb({ title, category, coverImage, description, authorId, authorName, authorAvatar, readTime }) {
  const cleanReadTime = readTime || '5 min read';
  const cleanCoverImage = coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80';

  const newBlog = {
    title,
    category,
    cover_image: cleanCoverImage,
    description,
    author_id: authorId || null,
    author_name: authorName || 'Registered Author',
    author_avatar: authorAvatar || null,
    read_time: cleanReadTime,
    likes_count: 0,
    comments_count: 0,
    created_at: new Date().toISOString()
  };

  try {
    const [result] = await pool.query(
      `INSERT INTO blogs (title, category, cover_image, description, author_id, author_name, author_avatar, read_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newBlog.title,
        newBlog.category,
        newBlog.cover_image,
        newBlog.description,
        newBlog.author_id,
        newBlog.author_name,
        newBlog.author_avatar,
        newBlog.read_time
      ]
    );
    newBlog.id = result.insertId;
  } catch (err) {
    newBlog.id = Date.now();
  }

  inMemoryBlogs.unshift(newBlog);
  return formatBlogResponse(newBlog);
}

// 2. Fetch all blogs published by real users (With category filter, pagination page & limit)
async function getBlogsFromDb({ category = null, page = 1, limit = 50 }) {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, parseInt(limit) || 50);
  const offset = (pageNum - 1) * limitNum;

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

    if (category && category.trim()) {
      query += ` WHERE LOWER(b.category) = LOWER(?)`;
      params.push(category.trim());
    }

    query += ` ORDER BY b.created_at DESC LIMIT ${limitNum} OFFSET ${offset}`;

    const [rows] = await pool.query(query, params);
    if (rows.length > 0) {
      const dbBlogs = rows.map(formatBlogResponse);
      inMemoryBlogs.forEach(m => {
        if (!dbBlogs.some(b => String(b.id) === String(m.id))) {
          if (!category || (m.category && m.category.toLowerCase() === category.trim().toLowerCase())) {
            dbBlogs.push(formatBlogResponse(m));
          }
        }
      });
      dbBlogs.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
      return dbBlogs;
    }
  } catch (err) {}

  // Memory fallback filter for real published blogs
  let filtered = inMemoryBlogs;
  if (category && category.trim()) {
    filtered = filtered.filter(b => b.category && b.category.toLowerCase() === category.trim().toLowerCase());
  }
  filtered.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
  const sliced = filtered.slice(offset, offset + limitNum);
  return sliced.map(formatBlogResponse);
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

  const blog = inMemoryBlogs.find(b => Number(b.id) === bId || String(b.id) === String(blogId));
  if (blog) return formatBlogResponse(blog);
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
    const index = inMemoryLikes.findIndex(l => Number(l.user_id) === uId && Number(l.blog_id) === bId);
    const blog = inMemoryBlogs.find(b => Number(b.id) === bId);
    let liked = false;

    if (index !== -1) {
      inMemoryLikes.splice(index, 1);
      if (blog) blog.likes_count = Math.max(0, (blog.likes_count || 1) - 1);
      liked = false;
    } else {
      inMemoryLikes.push({ user_id: uId, blog_id: bId });
      if (blog) blog.likes_count = (blog.likes_count || 0) + 1;
      liked = true;
    }

    return { liked, likesCount: blog ? blog.likes_count : 0 };
  }
}

// 5. Get Real Category Counts
async function getCategoryCountsFromDb() {
  const countsMap = {};

  try {
    const [totalRows] = await pool.query('SELECT COUNT(*) as total FROM blogs');
    countsMap['All'] = totalRows.length > 0 ? totalRows[0].total : 0;

    const [rows] = await pool.query('SELECT category, COUNT(*) as count FROM blogs GROUP BY category');
    rows.forEach(r => {
      if (r.category) {
        countsMap[r.category] = r.count;
      }
    });
  } catch (err) {}

  inMemoryBlogs.forEach(b => {
    if (b.category) {
      countsMap[b.category] = (countsMap[b.category] || 0) + 1;
    }
  });

  countsMap['All'] = Math.max(countsMap['All'] || 0, inMemoryBlogs.length);
  return countsMap;
}

// Helper to format consistent Blog JSON payload
function formatBlogResponse(b) {
  const likesCount = typeof b.real_likes_count === 'number' ? Number(b.real_likes_count) : (b.likes_count || b.likes || 0);
  const commentsCount = typeof b.real_comments_count === 'number' ? Number(b.real_comments_count) : (b.comments_count || b.comments || 0);

  return {
    id: b.id,
    title: b.title,
    category: b.category,
    coverImage: b.cover_image || b.coverImage,
    description: b.description || b.excerpt,
    excerpt: b.description ? (b.description.slice(0, 140) + '...') : '',
    author: {
      id: b.author_id,
      name: b.live_author_name || b.author_name || (b.author ? b.author.name : 'Registered Author'),
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
  getCategoryCountsFromDb
};
