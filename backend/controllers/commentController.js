const {
  getCommentsByBlogId,
  createComment,
  updateComment,
  deleteComment
} = require('../models/commentModel');

async function handleGetComments(req, res) {
  try {
    const { blogId } = req.params;
    const comments = await getCommentsByBlogId(blogId);
    res.json({
      success: true,
      blogId,
      comments: comments || []
    });
  } catch (error) {
    console.error('Get Comments Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch comments.' });
  }
}

async function handleAddComment(req, res) {
  try {
    const { blogId, text, parentId, authorName, authorAvatar } = req.body;
    const userId = req.user ? req.user.id : (req.body.userId || 'guest_user');
    const name = req.user ? req.user.username : (authorName || 'Anonymous Reader');

    if (!blogId) {
      return res.status(400).json({ success: false, message: 'Blog ID is required.' });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty.' });
    }

    const newComment = await createComment({
      blogId,
      userId,
      authorName: name,
      authorAvatar,
      text: text.trim(),
      parentId
    });

    res.status(201).json({
      success: true,
      message: parentId ? 'Reply posted successfully!' : 'Comment posted successfully!',
      comment: newComment
    });
  } catch (error) {
    console.error('Add Comment Error:', error);
    res.status(500).json({ success: false, message: 'Failed to post comment.' });
  }
}

async function handleEditComment(req, res) {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Updated comment text cannot be empty.' });
    }

    await updateComment(id, text.trim());
    res.json({
      success: true,
      message: 'Comment updated successfully!',
      commentId: id,
      text: text.trim()
    });
  } catch (error) {
    console.error('Edit Comment Error:', error);
    res.status(500).json({ success: false, message: 'Failed to edit comment.' });
  }
}

async function handleDeleteComment(req, res) {
  try {
    const { id } = req.params;
    await deleteComment(id);
    res.json({
      success: true,
      message: 'Comment deleted successfully!',
      commentId: id
    });
  } catch (error) {
    console.error('Delete Comment Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete comment.' });
  }
}

module.exports = {
  handleGetComments,
  handleAddComment,
  handleEditComment,
  handleDeleteComment
};
