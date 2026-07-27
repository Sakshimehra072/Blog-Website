const { pool } = require('../config/database');

// In-Memory Fallback Comment Store (Zero sample comments)
const inMemoryComments = [];

// Helper to structure nested comments tree
function buildCommentTree(commentsList) {
  const map = {};
  const roots = [];

  commentsList.forEach(item => {
    map[item.id] = { ...item, replies: [] };
  });

  commentsList.forEach(item => {
    if (item.parent_id && map[item.parent_id]) {
      map[item.parent_id].replies.push(map[item.id]);
    } else {
      roots.push(map[item.id]);
    }
  });

  return roots;
}

// 1. Fetch comments by Blog ID
async function getCommentsByBlogId(blogId) {
  const bId = Number(blogId);
  try {
    const [rows] = await pool.query(
      `SELECT c.*, u.name as live_author_name, u.avatar_url as live_author_avatar 
       FROM comments c 
       LEFT JOIN users u ON c.user_id = u.id 
       WHERE c.blog_id = ? 
       ORDER BY c.created_at ASC`,
      [bId]
    );

    const formatted = rows.map(c => ({
      id: c.id,
      blog_id: String(c.blog_id),
      user_id: c.user_id,
      author_name: c.live_author_name || c.author_name || 'Anonymous Reader',
      author_avatar: c.live_author_avatar || c.author_avatar || null,
      text: c.text,
      parent_id: c.parent_id,
      created_at: c.created_at
    }));

    return buildCommentTree(formatted);
  } catch (err) {
    // Fallback to in-memory store
    const filtered = inMemoryComments.filter(c => Number(c.blog_id) === bId);
    return buildCommentTree(filtered);
  }
}

// 2. Add Comment or Reply
async function createComment({ blogId, userId = null, authorName = 'Anonymous Reader', authorAvatar = null, text, parentId = null }) {
  const bId = Number(blogId);
  const pId = parentId ? Number(parentId) : null;
  const uId = userId ? Number(userId) : null;

  const newCommentObj = {
    blog_id: String(bId),
    user_id: uId,
    author_name: authorName,
    author_avatar: authorAvatar,
    text,
    parent_id: pId,
    created_at: new Date().toISOString()
  };

  try {
    const [result] = await pool.query(
      `INSERT INTO comments (blog_id, user_id, author_name, author_avatar, text, parent_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [bId, uId, newCommentObj.author_name, newCommentObj.author_avatar, text, pId]
    );

    // Update blog comments count
    await pool.query('UPDATE blogs SET comments_count = comments_count + 1 WHERE id = ?', [bId]);

    newCommentObj.id = result.insertId;
    newCommentObj.replies = [];
    return newCommentObj;
  } catch (err) {
    // Memory fallback creation
    newCommentObj.id = Date.now();
    newCommentObj.replies = [];
    inMemoryComments.push(newCommentObj);
    return newCommentObj;
  }
}

// 3. Edit Comment
async function updateComment(commentId, newText) {
  const cId = Number(commentId);
  try {
    await pool.query('UPDATE comments SET text = ? WHERE id = ?', [newText, cId]);
    return true;
  } catch (err) {
    const item = inMemoryComments.find(c => Number(c.id) === cId);
    if (item) {
      item.text = newText;
      return true;
    }
    return false;
  }
}

// 4. Delete Comment
async function deleteComment(commentId) {
  const cId = Number(commentId);
  try {
    const [rows] = await pool.query('SELECT blog_id FROM comments WHERE id = ?', [cId]);
    if (rows.length > 0) {
      const blogId = rows[0].blog_id;
      await pool.query('DELETE FROM comments WHERE id = ? OR parent_id = ?', [cId, cId]);
      await pool.query('UPDATE blogs SET comments_count = GREATEST(0, comments_count - 1) WHERE id = ?', [blogId]);
    }
    return true;
  } catch (err) {
    const index = inMemoryComments.findIndex(c => Number(c.id) === cId);
    if (index !== -1) {
      inMemoryComments.splice(index, 1);
      return true;
    }
    return false;
  }
}

module.exports = {
  getCommentsByBlogId,
  createComment,
  updateComment,
  deleteComment
};
