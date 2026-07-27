const express = require('express');
const router = express.Router();
const multer = require('multer');

const { 
  getBlogs, 
  getBlogByIdController, 
  createBlogController, 
  likeBlogController, 
  uploadImageController 
} = require('../controllers/blogController');
const authMiddleware = require('../middleware/authMiddleware');

// Memory Storage for Vercel Serverless Function Compatibility
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.get('/', getBlogs);
router.get('/:id', getBlogByIdController);
router.post('/', authMiddleware, createBlogController);
router.post('/:id/like', authMiddleware, likeBlogController);
router.post('/upload', upload.single('coverImage'), uploadImageController);

module.exports = router;
