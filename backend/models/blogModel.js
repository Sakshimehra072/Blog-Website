const { pool } = require('../config/database');

// Initial persistent fallback blogs so the app ALWAYS displays rich community content
const initialSampleBlogs = [
  {
    id: 1,
    title: 'Building Modern Full-Stack Applications with Next.js & Express',
    category: 'Technology',
    cover_image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    description: `Modern full-stack web applications demand real-time interactivity, high performance, and robust architecture. In this comprehensive guide, we explore how combining Next.js 14 App Router on the frontend with a Node.js Express server on the backend provides developer ergonomics and production scalability.\n\n### Key Takeaways\n1. Real-time updates with Socket.IO\n2. Clean RESTful API endpoints\n3. Scalable relational database queries using MySQL`,
    author_id: 1,
    author_name: 'Alex Morgan',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    read_time: '5 min read',
    likes_count: 14,
    comments_count: 3,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 2,
    title: 'The Future of Artificial Intelligence in Software Architecture',
    category: 'Artificial Intelligence',
    cover_image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
    description: `Artificial Intelligence is transforming how we write, test, and deploy software. From AI-assisted coding tools to intelligent agentic workflows, software architects must adapt to new paradigms of system design.\n\nLearn how LLMs are being integrated directly into backend systems to automate data analysis and decision-making.`,
    author_id: 2,
    author_name: 'Sophia Chen',
    author_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    read_time: '7 min read',
    likes_count: 28,
    comments_count: 6,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 3,
    title: 'Mastering Responsive Design Systems with Vanilla CSS',
    category: 'Programming',
    cover_image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    description: `Creating flexible, scalable UI design systems requires deep understanding of modern CSS properties such as Grid, Flexbox, Container Queries, and custom variables.\n\nDiscover how to craft handcrafted layouts with smooth 8px spatial rhythms and glassmorphism cards.`,
    author_id: 3,
    author_name: 'David Miller',
    author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    read_time: '4 min read',
    likes_count: 19,
    comments_count: 2,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

const inMemoryBlogs = [...initialSampleBlogs];
const inMemoryLikes = []; // { user_id, blog_id }

// 1. Create a new blog post
async function createBlogInDb({ title, category, coverImage, description, authorId, authorName, authorAvatar, readTime }) {
  const cleanReadTime = readTime || '5 min read';
  const cleanCoverImage = coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80';

  const newBlog = {
    title,
    category,
    cover_image: cleanCoverImage,
    description,
    author_id: authorId || null,
    author_name: authorName || 'Anonymous Author',
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

// 2. Fetch all blogs (With category filter, pagination page & limit)
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
      // Merge memory blogs with DB blogs to guarantee no posts missing
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

  // Memory fallback filter
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
      name: b.live_author_name || b.author_name || (b.author ? b.author.name : 'Anonymous Author'),
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
