const { pool } = require('../config/database');

// In-Memory Fallback Subscription Store
const inMemorySubscriptions = []; // { id, user_id, author_id, created_at }

async function toggleSubscription({ userId = 'guest_user', authorId }) {
  try {
    // Check if already subscribed
    const [rows] = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = ? AND author_id = ?',
      [userId, authorId]
    );

    if (rows.length > 0) {
      // Unsubscribe
      await pool.query('DELETE FROM subscriptions WHERE id = ?', [rows[0].id]);
      const count = await getSubscriberCount(authorId);
      return { isSubscribed: false, count };
    } else {
      // Subscribe
      await pool.query(
        'INSERT INTO subscriptions (user_id, author_id) VALUES (?, ?)',
        [userId, authorId]
      );
      const count = await getSubscriberCount(authorId);
      return { isSubscribed: true, count };
    }
  } catch (err) {
    // Fallback memory operation
    const index = inMemorySubscriptions.findIndex(
      s => s.user_id === userId && s.author_id === authorId
    );

    if (index !== -1) {
      inMemorySubscriptions.splice(index, 1);
      const count = inMemorySubscriptions.filter(s => s.author_id === authorId).length;
      return { isSubscribed: false, count };
    } else {
      inMemorySubscriptions.push({
        id: inMemorySubscriptions.length + 1,
        user_id: userId,
        author_id: authorId,
        created_at: new Date()
      });
      const count = inMemorySubscriptions.filter(s => s.author_id === authorId).length;
      return { isSubscribed: true, count };
    }
  }
}

async function getSubscriberCount(authorId) {
  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM subscriptions WHERE author_id = ?',
      [authorId]
    );
    return rows[0].count;
  } catch (err) {
    return inMemorySubscriptions.filter(s => s.author_id === authorId).length;
  }
}

module.exports = {
  toggleSubscription,
  getSubscriberCount
};
