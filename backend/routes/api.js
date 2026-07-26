const express = require('express');
const router = express.Router();
const { checkHealth } = require('../controllers/healthController');
const { getBlogs } = require('../controllers/blogController');

// System Health Endpoint
router.get('/health', checkHealth);

// Sample Blog Endpoint
router.get('/blogs', getBlogs);

module.exports = router;
