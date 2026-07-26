const { pool } = require('../config/database');

// In-Memory Fallback Blog Store
const inMemoryBlogs = [
  {
    id: 1,
    title: "Building High-Performance Full Stack Web Apps in 2026",
    category: "Technology",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    description: "Explore the modern architecture patterns, optimization techniques, and responsive design systems that power lightning-fast web applications.",
    author: {
      name: "Sarah Jenkins",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
    },
    likes: 142,
    comments: 28,
    created_at: new Date().toISOString()
  }
];

async function createBlogInDb({ title, category, coverImage, description, author }) {
  const newBlog = {
    id: inMemoryBlogs.length + 1,
    title,
    category,
    coverImage: coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80',
    description,
    author: author || {
      name: 'John Smith',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    likes: 0,
    comments: 0,
    created_at: new Date().toISOString()
  };

  try {
    const [result] = await pool.query(
      `INSERT INTO blogs (title, category, cover_image, description, author_name, author_avatar)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, category, newBlog.coverImage, description, newBlog.author.name, newBlog.author.avatar]
    );
    newBlog.id = result.insertId;
  } catch (err) {
    // Fallback to in-memory store
    inMemoryBlogs.unshift(newBlog);
  }

  return newBlog;
}

async function getAllBlogsFromDb() {
  try {
    const [rows] = await pool.query('SELECT * FROM blogs ORDER BY created_at DESC');
    if (rows.length > 0) return rows;
  } catch (err) {
    // Fallback
  }
  return inMemoryBlogs;
}

module.exports = {
  createBlogInDb,
  getAllBlogsFromDb
};
