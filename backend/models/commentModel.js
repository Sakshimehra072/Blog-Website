const { pool } = require('../config/database');

// In-Memory Fallback Comment Store
let inMemoryComments = [
  {
    id: 1,
    blog_id: '1',
    user_id: 'user_1',
    author_name: 'Elena Rostova',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    text: 'Outstanding article! The breakdown of Next.js with Express and MySQL performance is super helpful.',
    parent_id: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    replies: [
      {
        id: 2,
        blog_id: '1',
        user_id: 'user_2',
        author_name: 'Marcus Chen',
        author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        text: 'Agreed! The connection pool settings really make a difference.',
        parent_id: 1,
        created_at: new Date(Date.now() - 1800000).toISOString()
      }
    ]
  }
];

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
  try {
    const [rows] = await pool.query(
      'SELECT * FROM comments WHERE blog_id = ? ORDER BY created_at ASC',
      [blogId]
    );
    if (rows.length > 0) {
      return buildCommentTree(rows);
    }
  } catch (err) {
    // Fallback to in-memory store
  }

  const filtered = inMemoryComments.filter(c => String(c.blog_id) === String(blogId));
  return filtered;
}

// 2. Add Comment or Reply
async function createComment({ blogId, userId = 'guest_user', authorName = 'Anonymous Reader', authorAvatar = null, text, parentId = null }) {
  const newCommentObj = {
    blog_id: String(blogId),
    user_id: userId,
    author_name: authorName,
    author_avatar: authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    text,
    parent_id: parentId ? Number(parentId) : null,
    created_at: new Date().toISOString()
  };

  try {
    const [result] = await pool.query(
      `INSERT INTO comments (blog_id, user_id, author_name, author_avatar, text, parent_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [newCommentObj.blog_id, newCommentObj.user_id, newCommentObj.author_name, newCommentObj.author_avatar, newCommentObj.text, newCommentObj.parent_id]
    );
    newCommentObj.id = result.insertId;
    newCommentObj.replies = [];
    return newCommentObj;
  } catch (err) {
    // Fallback memory creation
    newCommentObj.id = Date.now();
    newCommentObj.replies = [];

    if (parentId) {
      const findAndAddReply = (list) => {
        for (let item of list) {
          if (Number(item.id) === Number(parentId)) {
            if (!item.replies) item.replies = [];
            item.replies.push(newCommentObj);
            return true;
          }
          if (item.replies && item.replies.length > 0) {
            if (findAndAddReply(item.replies)) return true;
          }
        }
        return false;
      };
      findAndAddReply(inMemoryComments);
    } else {
      inMemoryComments.push(newCommentObj);
    }
    return newCommentObj;
  }
}

// 3. Edit Comment
async function updateComment(commentId, newText) {
  try {
    await pool.query('UPDATE comments SET text = ? WHERE id = ?', [newText, commentId]);
    return true;
  } catch (err) {
    // Fallback memory update
    const updateInTree = (list) => {
      for (let item of list) {
        if (Number(item.id) === Number(commentId)) {
          item.text = newText;
          return true;
        }
        if (item.replies && item.replies.length > 0) {
          if (updateInTree(item.replies)) return true;
        }
      }
      return false;
    };
    return updateInTree(inMemoryComments);
  }
}

// 4. Delete Comment
async function deleteComment(commentId) {
  try {
    await pool.query('DELETE FROM comments WHERE id = ? OR parent_id = ?', [commentId, commentId]);
    return true;
  } catch (err) {
    // Fallback memory delete
    const deleteFromTree = (list) => {
      for (let i = 0; i < list.length; i++) {
        if (Number(list[i].id) === Number(commentId)) {
          list.splice(i, 1);
          return true;
        }
        if (list[i].replies && list[i].replies.length > 0) {
          if (deleteFromTree(list[i].replies)) return true;
        }
      }
      return false;
    };
    return deleteFromTree(inMemoryComments);
  }
}

module.exports = {
  getCommentsByBlogId,
  createComment,
  updateComment,
  deleteComment
};
