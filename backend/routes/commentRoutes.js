const express = require('express');
const router = express.Router();
const {
  handleGetComments,
  handleAddComment,
  handleEditComment,
  handleDeleteComment
} = require('../controllers/commentController');

router.get('/blog/:blogId', handleGetComments);
router.post('/', handleAddComment);
router.put('/:id', handleEditComment);
router.delete('/:id', handleDeleteComment);

module.exports = router;
