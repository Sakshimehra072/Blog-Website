# 📝 BlogVerse - Real-Time Full-Stack Blogging Platform

**BlogVerse** is a modern, full-stack, real-time web application built for content creators, writers, and readers. It provides an intuitive platform to publish, discover, edit, and interact with blog posts. Powered by Next.js 14, Express.js, MySQL, and Socket.IO, BlogVerse delivers seamless user authentication, real-time comment streams, image uploads, post bookmarking, author subscriptions, and responsive UI design.

---

## 🌟 Features

- **🔐 Dual Authentication System**
  - Standard JWT (JSON Web Tokens) email/password registration and login with encrypted password hashing (`bcryptjs`).
  - Google OAuth integration for one-click seamless sign-in.
- **✍️ Content Creation & Management**
  - Rich blog creation and editing experience.
  - Image upload capabilities powered by `multer` middleware.
  - Category assignment and tag management.
  - Drafts & Published status workflow.
- **⚡ Real-Time Collaboration & Comments**
  - Real-time comment system powered by **Socket.IO** rooms.
  - Instantly view new comments without refreshing the page.
- **🔍 Content Discovery & Filtering**
  - Instant client and backend keyword search across blog titles and contents.
  - Filter posts by categories (Tech, Lifestyle, Design, Coding, etc.).
- **❤️ Social & Engagement Features**
  - **Favourites / Saved Posts**: Bookmark articles for later reading.
  - **Author Subscriptions**: Subscribe to your favourite content creators.
  - **User Dashboard**: Manage your authored blogs, total post stats, and profile details.
- **🎨 Premium UI/UX**
  - Modern aesthetic built with Tailwind CSS and Lucide React icons.
  - Fully responsive across desktop, tablet, and mobile displays.
  - Progressive Web App support via Web App Manifest.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Library**: [React 18](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Real-Time Client**: [Socket.IO Client](https://socket.io/)
- **Authentication**: [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google)

### Backend
- **Server**: [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/)
- **Database**: [MySQL](https://www.mysql.com/) (using `mysql2/promise`)
- **Real-Time Server**: [Socket.IO](https://socket.io/)
- **Authentication & Security**: `jsonwebtoken`, `bcryptjs`, `cors`
- **File Uploads**: `multer`

---

## 📁 Repository Structure

```
Blog App/
├── backend/                  # Express REST API & Socket.IO Server
│   ├── config/               # Database connection configuration
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # Auth JWT verification, logger, error handlers
│   ├── models/               # MySQL queries (Users, Blogs, Comments, Favourites, Subscriptions)
│   ├── routes/               # API endpoint definitions
│   ├── scripts/              # DB health check and utility scripts
│   ├── uploads/              # Uploaded blog images directory
│   ├── server.js             # Main server entry point
│   ├── .env.example          # Backend environment variables template
│   └── vercel.json           # Vercel backend deployment settings
│
├── frontend/                 # Next.js 14 Web Application
│   ├── public/               # Static assets & web app manifest (manifest.json)
│   │   └── manifest.json     # PWA Manifest metadata
│   ├── src/
│   │   ├── app/              # Next.js App Router pages (Home, Blogs, Write, Profile, etc.)
│   │   │   └── manifest.js   # App Router manifest generator
│   │   ├── components/       # Reusable UI components (Navbar, Footer, BlogCard, Comments)
│   │   └── services/         # API & Auth service helpers
│   ├── .env.example          # Frontend environment variables template
│   └── tailwind.config.js    # Tailwind CSS styling setup
│
├── manifest.json             # Root application web manifest specification
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

Follow these steps to set up and run BlogVerse locally on your machine.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MySQL Database](https://www.mysql.com/) server running locally or hosted on cloud (Aiven, PlanetScale, Railway, etc.)

---

### 1. Database Setup

1. Create a MySQL database named `blogverse_db` (or a name of your choice).
2. Execute the database schema initialization queries (Users, Blogs, Comments, Favourites, Subscriptions tables).
3. Test your database connection using the provided script:
   ```bash
   cd backend
   node scripts/checkDb.js
   ```

---

### 2. Backend Setup

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   NODE_ENV=development

   # MySQL Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=blogverse_db
   DB_PORT=3306

   # JWT Secret
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d

   # Google OAuth Client ID (Optional)
   GOOGLE_CLIENT_ID=your_google_client_id

   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The API server will run at `http://localhost:5000`.

---

### 3. Frontend Setup

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   BACKEND_URL=http://localhost:5000
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Login user & receive JWT | ❌ |
| `POST` | `/api/auth/google` | Google OAuth login | ❌ |
| `GET` | `/api/blogs` | Fetch all published blogs (supports query params) | ❌ |
| `GET` | `/api/blogs/:id` | Fetch single blog details | ❌ |
| `POST` | `/api/blogs` | Create a new blog post (with image upload) | ✅ |
| `PUT` | `/api/blogs/:id` | Update an existing blog | ✅ |
| `DELETE` | `/api/blogs/:id` | Delete a blog post | ✅ |
| `GET` | `/api/comments/:blogId` | Fetch comments for a blog | ❌ |
| `POST` | `/api/comments` | Add a comment to a blog (emits Socket.IO event) | ✅ |
| `POST` | `/api/favourites` | Add blog to user favourites | ✅ |
| `DELETE` | `/api/favourites/:blogId` | Remove blog from user favourites | ✅ |
| `POST` | `/api/subscriptions` | Subscribe/Unsubscribe to an author | ✅ |

---

## 📱 Web App Manifest (`manifest.json`)

BlogVerse includes Web Application Manifest configurations located at:
- `frontend/public/manifest.json`
- `frontend/src/app/manifest.js`

This file provides app metadata (name, icons, colors, display settings) enabling progressive web app capabilities, app shortcuts, and installability on mobile and desktop devices.

---

## 🚀 Deployment

- **Backend**: Can be deployed to Vercel (using `vercel.json` serverless function export) or Render / Railway / AWS.
- **Frontend**: Can be deployed directly to Vercel or Netlify.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
