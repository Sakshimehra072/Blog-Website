-- ==============================================================================
-- BlogVerse Production-Ready MySQL Database Schema
-- Database: blogverse_db
-- Engine: InnoDB
-- Charset: utf8mb4 / utf8mb4_unicode_ci
-- ==============================================================================

-- 1. Create Database
CREATE DATABASE IF NOT EXISTS blogverse_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE blogverse_db;

-- Disable Foreign Key checks for clean table initialization
SET FOREIGN_KEY_CHECKS = 0;

-- Optional: Drop tables for fresh schema setup
-- DROP TABLE IF EXISTS subscribers;
-- DROP TABLE IF EXISTS favourites;
-- DROP TABLE IF EXISTS likes;
-- DROP TABLE IF EXISTS comments;
-- DROP TABLE IF EXISTS blogs;
-- DROP TABLE IF EXISTS categories;
-- DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- 1. Users Table
-- Supports traditional registration & Google OAuth login
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone_number VARCHAR(20) UNIQUE DEFAULT NULL,
  password VARCHAR(255) DEFAULT NULL,
  google_id VARCHAR(100) DEFAULT NULL,
  profile_image VARCHAR(500) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_email (email),
  INDEX idx_user_google_id (google_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 2. Categories Table
-- Stores blog categories with unique constraint
-- ==============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category_name (category_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Default Blog Categories
INSERT INTO categories (category_name) VALUES 
  ('Technology'),
  ('Programming'),
  ('Artificial Intelligence'),
  ('Business'),
  ('Finance'),
  ('Education'),
  ('Health'),
  ('Travel'),
  ('Food'),
  ('Sports'),
  ('Lifestyle')
ON DUPLICATE KEY UPDATE category_name = VALUES(category_name);

-- ==============================================================================
-- 3. Blogs Table
-- Core blog post storage with category & user relationships
-- ==============================================================================
CREATE TABLE IF NOT EXISTS blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  category_id INT DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description LONGTEXT NOT NULL,
  cover_image LONGTEXT DEFAULT NULL,
  status ENUM('published', 'draft') DEFAULT 'published',
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  read_time VARCHAR(20) DEFAULT '5 min read',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_blog_user (user_id),
  INDEX idx_blog_category (category_id),
  INDEX idx_blog_status (status),
  INDEX idx_blog_created_at (created_at DESC),
  FULLTEXT INDEX idx_blog_search (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 4. Comments Table
-- Nested/threaded comments using parent_comment_id
-- ==============================================================================
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  blog_id INT NOT NULL,
  user_id INT DEFAULT NULL,
  parent_comment_id INT DEFAULT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  INDEX idx_comment_blog (blog_id),
  INDEX idx_comment_user (user_id),
  INDEX idx_comment_parent (parent_comment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 5. Likes Table
-- Stores blog likes (Prevents duplicate likes per user per blog)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  blog_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_blog_like (user_id, blog_id),
  FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_like_blog (blog_id),
  INDEX idx_like_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 6. Favourites / Bookmarks Table
-- Stores user's saved/favourite blogs (Prevents duplicate bookmarks)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS favourites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  blog_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_blog_fav (user_id, blog_id),
  FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_fav_blog (blog_id),
  INDEX idx_fav_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 7. Subscribers Table
-- Stores author-subscriber relationships (Prevents duplicate subscriptions)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  author_id INT NOT NULL,
  subscriber_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_author_subscriber (author_id, subscriber_id),
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscriber_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sub_author (author_id),
  INDEX idx_sub_subscriber (subscriber_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
