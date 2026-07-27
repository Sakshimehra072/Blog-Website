const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const requestLogger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const commentRoutes = require('./routes/commentRoutes');
const favouriteRoutes = require('./routes/favouriteRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const { testConnection } = require('./config/database');

const app = express();
const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Socket connection logger & rooms
io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  socket.on('join_blog', (blogId) => {
    socket.join(`blog_${blogId}`);
  });

  socket.on('leave_blog', (blogId) => {
    socket.leave(`blog_${blogId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// Attach socket io instance to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

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
  res.json({ message: 'BlogVerse Real-Time Backend API Server is Running' });
});

// Centralized Error Handling
app.use(errorHandler);

// Start HTTP & Socket.IO Server
server.listen(PORT, async () => {
  console.log(`🚀 BlogVerse Real-Time Express Server listening on http://localhost:${PORT}`);
  await testConnection();
});
