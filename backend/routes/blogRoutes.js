const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  getBlogs, 
  getBlogByIdController, 
  createBlogController, 
  likeBlogController, 
  uploadImageController 
} = require('../controllers/blogController');
const authMiddleware = require('../middleware/authMiddleware');

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'cover-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.get('/', getBlogs);
router.get('/:id', getBlogByIdController);
router.post('/', authMiddleware, createBlogController);
router.post('/:id/like', authMiddleware, likeBlogController);
router.post('/upload', upload.single('coverImage'), uploadImageController);

module.exports = router;
