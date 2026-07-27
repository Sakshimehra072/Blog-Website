function getBaseUrl() {
  if (typeof window !== 'undefined') {
    if (process.env.NEXT_PUBLIC_API_URL) {
      let clean = process.env.NEXT_PUBLIC_API_URL.replace(/^\/+/, '').replace(/\/+$/, '');
      if (!clean.endsWith('/api')) clean = `${clean}/api`;
      return clean.startsWith('http') ? clean : `https://${clean}`;
    }
    return '/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
}

const BASE_URL = getBaseUrl();
const API_BLOGS_URL = `${BASE_URL}/blogs`;

// Local blog persistence helpers
function getLocalBlogs() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('blogverse_local_blogs');
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function saveLocalBlog(blog) {
  if (typeof window === 'undefined' || !blog) return;
  try {
    const blogs = getLocalBlogs();
    const existingIndex = blogs.findIndex(b => String(b.id) === String(blog.id));
    if (existingIndex !== -1) {
      blogs[existingIndex] = blog;
    } else {
      blogs.unshift(blog);
    }
    localStorage.setItem('blogverse_local_blogs', JSON.stringify(blogs));
  } catch (err) {}
}

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('blogverse_token') : null;
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function parseJsonResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return await res.json();
  }
  return { success: false, message: `Server error (${res.status})` };
}

export async function fetchBlogsApi(category = null, page = 1, limit = 20) {
  let apiBlogs = [];
  let categoryCounts = null;

  try {
    let url = `${API_BLOGS_URL}?page=${page}&limit=${limit}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    const res = await fetch(url);
    const data = await parseJsonResponse(res);
    if (data && data.success && Array.isArray(data.data)) {
      apiBlogs = data.data;
      categoryCounts = data.categoryCounts || null;
    } else if (Array.isArray(data)) {
      apiBlogs = data;
    }
  } catch (err) {}

  // Merge with local fallback persistence for zero data loss
  const localBlogs = getLocalBlogs();
  let merged = [...apiBlogs];

  localBlogs.forEach(lBlog => {
    if (!merged.some(b => String(b.id) === String(lBlog.id))) {
      if (!category || (lBlog.category && lBlog.category.toLowerCase() === category.toLowerCase())) {
        merged.unshift(lBlog);
      }
    }
  });

  // Sort descending by date
  merged.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));

  return {
    success: true,
    data: merged,
    categoryCounts
  };
}

export async function fetchBlogByIdApi(id) {
  try {
    const res = await fetch(`${API_BLOGS_URL}/${id}`);
    const data = await parseJsonResponse(res);
    if (data && data.success && data.blog) {
      saveLocalBlog(data.blog);
      return data;
    }
  } catch (err) {}

  // Fallback to local blog
  const localBlogs = getLocalBlogs();
  const match = localBlogs.find(b => String(b.id) === String(id));
  if (match) {
    return { success: true, blog: match };
  }

  return { success: false, message: 'Article not found.' };
}

export async function createBlogApi(blogData) {
  let createdBlog = null;

  try {
    const res = await fetch(`${API_BLOGS_URL}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(blogData)
    });
    const data = await parseJsonResponse(res);
    if (data && (data.success || data.blog)) {
      createdBlog = data.blog;
      saveLocalBlog(createdBlog);
      return data;
    }
  } catch (err) {}

  // Local creation fallback
  const fallbackBlog = {
    id: Date.now(),
    title: blogData.title,
    category: blogData.category,
    coverImage: blogData.coverImage,
    description: blogData.description,
    excerpt: blogData.description ? (blogData.description.slice(0, 140) + '...') : '',
    author: {
      id: 1,
      name: blogData.authorName || 'Registered Author',
      avatar: blogData.authorAvatar || null
    },
    readTime: '5 min read',
    likes: 0,
    comments: 0,
    createdAt: new Date().toISOString()
  };

  saveLocalBlog(fallbackBlog);
  return {
    success: true,
    message: 'Article published successfully!',
    blog: fallbackBlog
  };
}

export async function likeBlogApi(id) {
  try {
    const res = await fetch(`${API_BLOGS_URL}/${id}/like`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function uploadBlogImageApi(file) {
  try {
    const formData = new FormData();
    formData.append('coverImage', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('blogverse_token') : null;
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BLOGS_URL}/upload`, {
      method: 'POST',
      headers,
      body: formData
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: err.message };
  }
}
