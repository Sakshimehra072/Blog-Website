const { createBlogInDb, getAllBlogsFromDb } = require('../models/blogModel');

async function getBlogs(req, res) {
  try {
    const blogs = await getAllBlogsFromDb();
    res.json({
      success: true,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch blogs.' });
  }
}

async function createBlogController(req, res) {
  try {
    const { title, category, coverImage, description } = req.body;

    // Required Field Validations
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Blog title is required.' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category selection is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Blog description/content is required.' });
    }

    const authorName = req.user ? req.user.username : (req.body.authorName || 'John Smith');
    const authorAvatar = req.user ? req.user.avatar_url : (req.body.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');

    const newBlog = await createBlogInDb({
      title: title.trim(),
      category: category.trim(),
      coverImage: coverImage ? coverImage.trim() : null,
      description: description.trim(),
      author: {
        name: authorName,
        avatar: authorAvatar
      }
    });

    res.status(201).json({
      success: true,
      message: '🎉 Blog published successfully!',
      blog: newBlog
    });
  } catch (error) {
    console.error('Create Blog Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create blog.' });
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
  createBlogController,
  uploadImageController
};
