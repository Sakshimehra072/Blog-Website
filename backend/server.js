const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const requestLogger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/authRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const commentRoutes = require('./routes/commentRoutes');
const favouriteRoutes = require('./routes/favouriteRoutes');
const blogRoutes = require('./routes/blogRoutes');
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Static Uploads Serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', apiRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/favourites', favouriteRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'BlogVerse Backend Server is Running' });
});

// Centralized Error Handling
app.use(errorHandler);

// Start Server & Check DB Connection
app.listen(PORT, async () => {
  console.log(`🚀 BlogVerse Express Server listening on http://localhost:${PORT}`);
  await testConnection();
});
