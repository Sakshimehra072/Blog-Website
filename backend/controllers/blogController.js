const { 
  createBlogInDb, 
  getBlogsFromDb, 
  getBlogByIdFromDb, 
  toggleLikeBlogInDb,
  getCategoryCountsFromDb
} = require('../models/blogModel');

async function getBlogs(req, res) {
  try {
    const { category, page = 1, limit = 100 } = req.query;
    const blogs = await getBlogsFromDb({ category, page, limit });
    const categoryCounts = await getCategoryCountsFromDb();
    
    res.json({
      success: true,
      data: blogs,
      categoryCounts,
      page: parseInt(page),
      limit: parseInt(limit),
      count: blogs.length
    });
  } catch (error) {
    console.error('Get Blogs Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch blogs.' });
  }
}

async function getBlogByIdController(req, res) {
  try {
    const { id } = req.params;
    const blog = await getBlogByIdFromDb(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }
    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch article.' });
  }
}

async function createBlogController(req, res) {
  try {
    const { title, category, coverImage, description, readTime } = req.body;

    // Field Validations
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Blog title is required.' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category selection is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Blog description/content is required.' });
    }

    const authorId = req.user ? req.user.id : null;
    const authorName = req.user ? (req.user.name || req.user.username) : (req.body.authorName || 'Registered Author');
    const authorAvatar = req.user ? (req.user.avatar_url || req.user.avatar) : req.body.authorAvatar;

    const newBlog = await createBlogInDb({
      title: title.trim(),
      category: category.trim(),
      coverImage: coverImage ? coverImage.trim() : null,
      description: description.trim(),
      readTime,
      authorId,
      authorName,
      authorAvatar
    });

    // Real-Time Socket.IO Event Broadcast
    if (req.io) {
      req.io.emit('blog:published', newBlog);
    }

    res.status(201).json({
      success: true,
      message: '🎉 Article published successfully!',
      blog: newBlog
    });
  } catch (error) {
    console.error('Create Blog Error:', error);
    res.status(500).json({ success: false, message: 'Failed to publish blog.' });
  }
}

async function likeBlogController(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : 1;

    const result = await toggleLikeBlogInDb(userId, id);

    // Real-Time Socket.IO Event Broadcast
    if (req.io) {
      req.io.emit('blog:liked', {
        blogId: Number(id),
        likesCount: result.likesCount,
        liked: result.liked,
        userId
      });
    }

    res.json({
      success: true,
      liked: result.liked,
      likesCount: result.likesCount
    });
  } catch (error) {
    console.error('Like Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update like status.' });
  }
}

async function uploadImageController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const imageUrl = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Cover image uploaded successfully!',
      imageUrl
    });
  } catch (error) {
    console.error('Image Upload Error:', error);
    res.status(500).json({ success: false, message: 'Image upload failed.' });
  }
}

module.exports = {
  getBlogs,
  getBlogByIdController,
  createBlogController,
  likeBlogController,
  uploadImageController
};
