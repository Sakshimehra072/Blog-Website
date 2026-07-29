import { getApiBaseUrl } from '../utils/apiUrl';

const LOCAL_HOST_API = 'http://localhost:5000/api';
const HOSTED_VERCEL_API = 'https://blog-website-liard-alpha.vercel.app/api';

const PRIMARY_API_URL = getApiBaseUrl();

function getFallbackApiUrl() {
  return PRIMARY_API_URL.includes('localhost') ? HOSTED_VERCEL_API : LOCAL_HOST_API;
}

function getTryEndpoints() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return ['/api', LOCAL_HOST_API];
    }
    return ['/api', PRIMARY_API_URL];
  }
  return ['/api', PRIMARY_API_URL];
}

const LOCAL_STORAGE_KEY = 'blogverse_user_blogs';

function getLocalStorageBlogs() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalStorageBlog(blog) {
  if (typeof window === 'undefined' || !blog) return null;
  try {
    const current = getLocalStorageBlogs();
    const cleanId = blog.id || Date.now();
    const normalized = {
      id: cleanId,
      title: blog.title || 'Untitled',
      category: blog.category || 'Technology',
      coverImage: blog.cover_image || blog.coverImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      description: blog.description || blog.excerpt || '',
      excerpt: blog.excerpt || (blog.description ? (blog.description.slice(0, 140) + '...') : ''),
      author: {
        id: blog.author?.id || blog.author_id || null,
        name: blog.author?.name || blog.author_name || blog.authorName || 'Registered Author',
        avatar: blog.author?.avatar || blog.author_avatar || blog.authorAvatar || null
      },
      readTime: blog.read_time || blog.readTime || '5 min read',
      likes: typeof blog.likes === 'number' ? blog.likes : (blog.likes_count || 0),
      comments: typeof blog.comments === 'number' ? blog.comments : (blog.comments_count || 0),
      createdAt: blog.created_at || blog.createdAt || new Date().toISOString()
    };

    const existsIndex = current.findIndex(b => String(b.id) === String(normalized.id));
    if (existsIndex !== -1) {
      current[existsIndex] = normalized;
    } else {
      current.unshift(normalized);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
    return normalized;
  } catch (e) {
    console.error('Error saving local blog fallback:', e);
    return null;
  }
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

// Fetch all blogs with dual-endpoint fallback (localhost & Vercel) + local storage merging
export async function fetchBlogsApi(category = null, page = 1, limit = 100) {
  let serverBlogs = [];
  let categoryCounts = null;
  let serverResponded = false;

  const tryEndpoints = getTryEndpoints();

  for (const baseUrl of tryEndpoints) {
    try {
      let url = `${baseUrl}/blogs?page=${page}&limit=${limit}`;
      if (category && category !== 'All') {
        url += `&category=${encodeURIComponent(category)}`;
      }
      const res = await fetch(url, { cache: 'no-store' });
      const data = await parseJsonResponse(res);

      if (data && data.success) {
        const rawBlogs = data.blogs || data.data;
        if (Array.isArray(rawBlogs)) {
          serverBlogs = rawBlogs;
          categoryCounts = data.categoryCounts || null;
          serverResponded = true;
          break;
        }
      } else if (Array.isArray(data)) {
        serverBlogs = data;
        serverResponded = true;
        break;
      }
    } catch (err) { }
  }

  // Use server blogs when server responds; only fallback to localStorage if server is offline/unreachable
  let combined = [...serverBlogs];
  if (!serverResponded) {
    const localBlogs = getLocalStorageBlogs();
    const blogsMap = new Map();

    serverBlogs.forEach(b => blogsMap.set(String(b.id), b));
    localBlogs.forEach(b => {
      if (!blogsMap.has(String(b.id))) {
        blogsMap.set(String(b.id), b);
      }
    });

    combined = Array.from(blogsMap.values());
  }

  // Category filtering on client if category parameter specified
  if (category && category.trim() && category !== 'All') {
    combined = combined.filter(b => b.category && b.category.toLowerCase() === category.trim().toLowerCase());
  }

  // Sort latest first
  combined.sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0));

  // Compute fallback category counts if server didn't return them
  if (!categoryCounts) {
    categoryCounts = { All: combined.length };
    combined.forEach(b => {
      if (b.category) {
        categoryCounts[b.category] = (categoryCounts[b.category] || 0) + 1;
      }
    });
  }

  return {
    success: true,
    blogs: combined,
    data: combined,
    totalBlogs: combined.length,
    categoryCounts
  };
}

// Fetch single blog by ID with fail-safe fallback lookup
export async function fetchBlogByIdApi(id) {
  const tryEndpoints = getTryEndpoints();

  for (const baseUrl of tryEndpoints) {
    try {
      const res = await fetch(`${baseUrl}/blogs/${id}`);
      const data = await parseJsonResponse(res);
      if (data && data.success && data.blog) {
        return data;
      }
    } catch (err) { }
  }

  // Check local storage fallback
  const localBlogs = getLocalStorageBlogs();
  const localMatch = localBlogs.find(b => String(b.id) === String(id));
  if (localMatch) {
    return { success: true, blog: localMatch };
  }

  // Fail-safe lookup from all merged blogs
  try {
    const allRes = await fetchBlogsApi(null, 1, 100);
    if (allRes && allRes.success && Array.isArray(allRes.data)) {
      const match = allRes.data.find(b => String(b.id) === String(id));
      if (match) {
        return { success: true, blog: match };
      }
    }
  } catch (err) { }

  return { success: false, message: 'Article not found.' };
}

// Publish new blog to the backend API database
export async function createBlogApi(blogData) {
  let createdBlog = null;
  let serverMessage = '';
  const tryEndpoints = getTryEndpoints();

  for (const baseUrl of tryEndpoints) {
    try {
      const res = await fetch(`${baseUrl}/blogs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(blogData)
      });
      const data = await parseJsonResponse(res);
      if (data && (data.success || data.blog)) {
        createdBlog = data.blog || data.data;
        serverMessage = data.message || '🎉 Article published successfully!';
        break;
      } else if (data && data.message) {
        serverMessage = data.message;
      }
    } catch (err) {
      console.error('API createBlogApi error:', err);
    }
  }

  if (createdBlog) {
    saveLocalStorageBlog(createdBlog);
    return {
      success: true,
      message: serverMessage || '🎉 Article published successfully!',
      blog: createdBlog
    };
  }

  return {
    success: false,
    message: serverMessage || 'Failed to save blog to database. Please check your connection and try again.'
  };
}

// Toggle Like on blog in the backend database
export async function likeBlogApi(id) {
  const tryEndpoints = [PRIMARY_API_URL, getFallbackApiUrl(), '/api'];
  for (const baseUrl of tryEndpoints) {
    try {
      const res = await fetch(`${baseUrl}/blogs/${id}/like`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await parseJsonResponse(res);
      if (data && data.success) return data;
    } catch (err) { }
  }
  return { success: false, message: 'Failed to update like status.' };
}

// Upload blog cover image
export async function uploadBlogImageApi(file) {
  const tryEndpoints = [PRIMARY_API_URL, getFallbackApiUrl(), '/api'];
  const formData = new FormData();
  formData.append('coverImage', file);

  const token = typeof window !== 'undefined' ? localStorage.getItem('blogverse_token') : null;
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  for (const baseUrl of tryEndpoints) {
    try {
      const res = await fetch(`${baseUrl}/blogs/upload`, {
        method: 'POST',
        headers,
        body: formData
      });
      const data = await parseJsonResponse(res);
      if (data && data.success) return data;
    } catch (err) { }
  }
  return { success: false, message: 'Image upload failed.' };
}

function removeLocalStorageBlog(blogId) {
  if (typeof window === 'undefined' || !blogId) return;
  try {
    const current = getLocalStorageBlogs();
    const filtered = current.filter(b => String(b.id) !== String(blogId));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Error removing local blog fallback:', e);
  }
}

// Delete blog by ID
export async function deleteBlogApi(id) {
  const tryEndpoints = getTryEndpoints();
  let lastError = null;
  let success = false;
  let message = '';
  let affectedRows = 0;

  for (const baseUrl of tryEndpoints) {
    try {
      const res = await fetch(`${baseUrl}/blogs/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        cache: 'no-store'
      });
      const data = await parseJsonResponse(res);

      if (res.ok && data && data.success && data.affectedRows > 0) {
        removeLocalStorageBlog(id);
        success = true;
        message = data.message || 'Article deleted successfully.';
        affectedRows = data.affectedRows;
        break;
      }
      if (data && data.message) lastError = data.message;
    } catch (err) {
      lastError = err.message;
    }
  }

  if (success) {
    removeLocalStorageBlog(id);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:blog_deleted', { detail: { blogId: id } }));
    }
    return { success: true, message: message || 'Article deleted successfully.', affectedRows };
  }

  return {
    success: false,
    message: lastError || 'Failed to delete article from database. No rows affected.',
    affectedRows: 0
  };
}

// Update existing blog post by ID
export async function updateBlogApi(id, blogData) {
  const tryEndpoints = getTryEndpoints();
  for (const baseUrl of tryEndpoints) {
    try {
      const res = await fetch(`${baseUrl}/blogs/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(blogData)
      });
      const data = await parseJsonResponse(res);
      if (data && (data.success || data.blog)) {
        if (data.blog) saveLocalStorageBlog(data.blog);
        return data;
      }
    } catch (err) { }
  }

  // Local storage fallback
  const localUpdated = saveLocalStorageBlog({ id, ...blogData });
  return { success: true, message: 'Article updated successfully!', blog: localUpdated };
}

