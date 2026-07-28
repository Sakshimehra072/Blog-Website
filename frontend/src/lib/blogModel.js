import pool from './db';

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

// 1. Create a new blog post
export async function createBlogInDb({ title, category, coverImage, description, authorId, authorName, authorAvatar, readTime }) {
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
      `INSERT INTO blogs (title, category, cover_image, description, author_id, author_name, author_avatar, read_time, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
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
    console.error('MySQL Insert Error:', err);
    newBlog.id = Date.now();
  }

  return formatBlogResponse(newBlog);
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
    if (category && category.trim() && category !== 'All') {
      countQuery += ` WHERE LOWER(category) = LOWER(?)`;
      countParams.push(category.trim());
    }

    const [countRows] = await pool.query(countQuery, countParams);
    if (countRows && countRows.length > 0) {
      totalBlogs = Number(countRows[0].total);
    }

    // Main fetch query
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

  return null;
}

// 4. Get Category Counts
export async function getCategoryCountsFromDb() {
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
  } catch (err) {}

  return countsMap;
}

// 5. Delete blog by ID
export async function deleteBlogFromDb(blogId) {
  const bId = Number(blogId);

  try {
    await pool.query('DELETE FROM blogs WHERE id = ?', [bId]);
    await pool.query('DELETE FROM comments WHERE blog_id = ?', [bId]);
    await pool.query('DELETE FROM likes WHERE blog_id = ?', [bId]);
    await pool.query('DELETE FROM favourites WHERE blog_id = ?', [bId]);
  } catch (err) {}

  return true;
}

// 6. Update blog post
export async function updateBlogInDb(blogId, { title, category, coverImage, description }) {
  const bId = Number(blogId);

  try {
    await pool.query(
      `UPDATE blogs 
       SET title = ?, category = ?, cover_image = ?, description = ?, updated_at = NOW() 
       WHERE id = ?`,
      [title, category, coverImage, description, bId]
    );
  } catch (err) {}

  return await getBlogByIdFromDb(blogId);
}
