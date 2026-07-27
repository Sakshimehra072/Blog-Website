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

// Fetch all blogs from the database API server for all users
export async function fetchBlogsApi(category = null, page = 1, limit = 50) {
  try {
    let url = `${API_BLOGS_URL}?page=${page}&limit=${limit}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    const res = await fetch(url);
    const data = await parseJsonResponse(res);

    if (data && data.success && Array.isArray(data.data)) {
      return {
        success: true,
        data: data.data,
        categoryCounts: data.categoryCounts || null
      };
    }
    if (Array.isArray(data)) {
      return {
        success: true,
        data: data,
        categoryCounts: null
      };
    }
    return { success: false, data: [], categoryCounts: null };
  } catch (err) {
    console.error('Fetch Blogs Error:', err);
    return { success: false, data: [], categoryCounts: null };
  }
}

// Fetch single blog by ID from the database API server
export async function fetchBlogByIdApi(id) {
  try {
    const res = await fetch(`${API_BLOGS_URL}/${id}`);
    const data = await parseJsonResponse(res);
    return data;
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// Publish new blog to the backend API database
export async function createBlogApi(blogData) {
  try {
    const res = await fetch(`${API_BLOGS_URL}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(blogData)
    });
    const data = await parseJsonResponse(res);
    return data;
  } catch (err) {
    console.error('Create Blog Error:', err);
    return { success: false, message: err.message || 'Failed to publish blog.' };
  }
}

// Toggle Like on blog in the backend database
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

// Upload blog cover image
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
