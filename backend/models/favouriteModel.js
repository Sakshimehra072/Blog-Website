const { pool } = require('../config/database');

// In-Memory Fallback Favourite Store
const inMemoryFavourites = []; // { id, user_id, blog_id, created_at }

// Sample list of available blogs for fallback reference
const SAMPLE_BLOGS = [
  {
    id: 1,
    title: "Building High-Performance Full Stack Web Apps in 2026",
    excerpt: "Explore modern architecture patterns, optimization techniques, and responsive design systems.",
    category: "Technology",
    author: {
      name: "Sarah Jenkins",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
    },
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    likes: 142,
    comments: 28
  },
  {
    id: 2,
    title: "The Next Era of Artificial Intelligence: Agentic Systems",
    excerpt: "How autonomous agent workflows are reinventing software engineering and human-computer interfaces.",
    category: "Artificial Intelligence",
    author: {
      name: "Marcus Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    likes: 215,
    comments: 42
  }
];

async function toggleFavourite({ userId = 'guest_user', blogId }) {
  const bId = Number(blogId);
  try {
    const [rows] = await pool.query(
      'SELECT * FROM favourites WHERE user_id = ? AND blog_id = ?',
      [userId, bId]
    );

    if (rows.length > 0) {
      // Remove from favourites
      await pool.query('DELETE FROM favourites WHERE id = ?', [rows[0].id]);
      return { isSaved: false };
    } else {
      // Add to favourites
      await pool.query(
        'INSERT INTO favourites (user_id, blog_id) VALUES (?, ?)',
        [userId, bId]
      );
      return { isSaved: true };
    }
  } catch (err) {
    // Fallback memory toggle
    const index = inMemoryFavourites.findIndex(
      f => f.user_id === userId && Number(f.blog_id) === bId
    );

    if (index !== -1) {
      inMemoryFavourites.splice(index, 1);
      return { isSaved: false };
    } else {
      inMemoryFavourites.push({
        id: inMemoryFavourites.length + 1,
        user_id: userId,
        blog_id: bId,
        created_at: new Date()
      });
      return { isSaved: true };
    }
  }
}

async function getFavouritesByUserId(userId = 'guest_user') {
  try {
    const [rows] = await pool.query(
      'SELECT blog_id FROM favourites WHERE user_id = ?',
      [userId]
    );
    const blogIds = rows.map(r => r.blog_id);
    return SAMPLE_BLOGS.filter(b => blogIds.includes(b.id));
  } catch (err) {
    const userFavs = inMemoryFavourites.filter(f => f.user_id === userId);
    const favIds = userFavs.map(f => Number(f.blog_id));
    
    if (favIds.length === 0) {
      // Return initial demo saved blog if memory empty for testing UI
      return [SAMPLE_BLOGS[0]];
    }

    return SAMPLE_BLOGS.filter(b => favIds.includes(b.id));
  }
}

module.exports = {
  toggleFavourite,
  getFavouritesByUserId
};
