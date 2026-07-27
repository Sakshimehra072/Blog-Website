const { pool } = require('../config/database');

// In-Memory Fallback Favourite Store (Zero sample data)
const inMemoryFavourites = [];

async function toggleFavourite({ userId, blogId }) {
  const uId = Number(userId);
  const bId = Number(blogId);

  try {
    const [rows] = await pool.query(
      'SELECT * FROM favourites WHERE user_id = ? AND blog_id = ?',
      [uId, bId]
    );

    if (rows.length > 0) {
      // Remove from favourites
      await pool.query('DELETE FROM favourites WHERE id = ?', [rows[0].id]);
      return { isSaved: false };
    } else {
      // Add to favourites
      await pool.query(
        'INSERT INTO favourites (user_id, blog_id) VALUES (?, ?)',
        [uId, bId]
      );
      return { isSaved: true };
    }
  } catch (err) {
    const index = inMemoryFavourites.findIndex(
      f => Number(f.user_id) === uId && Number(f.blog_id) === bId
    );

    if (index !== -1) {
      inMemoryFavourites.splice(index, 1);
      return { isSaved: false };
    } else {
      inMemoryFavourites.push({
        id: inMemoryFavourites.length + 1,
        user_id: uId,
        blog_id: bId,
        created_at: new Date()
      });
      return { isSaved: true };
    }
  }
}

async function getFavouritesByUserId(userId) {
  const uId = Number(userId);
  try {
    const [rows] = await pool.query(
      `SELECT b.*, u.name as live_author_name, u.avatar_url as live_author_avatar 
       FROM favourites f 
       JOIN blogs b ON f.blog_id = b.id 
       LEFT JOIN users u ON b.author_id = u.id 
       WHERE f.user_id = ? 
       ORDER BY f.created_at DESC`,
      [uId]
    );

    return rows.map(b => ({
      id: b.id,
      title: b.title,
      category: b.category,
      coverImage: b.cover_image,
      description: b.description,
      excerpt: b.description ? (b.description.slice(0, 140) + '...') : '',
      author: {
        id: b.author_id,
        name: b.live_author_name || b.author_name || 'Anonymous Author',
        avatar: b.live_author_avatar || b.author_avatar || null
      },
      readTime: b.read_time || '5 min read',
      likes: b.likes_count || 0,
      comments: b.comments_count || 0,
      createdAt: b.created_at
    }));
  } catch (err) {
    return [];
  }
}

module.exports = {
  toggleFavourite,
  getFavouritesByUserId
};
