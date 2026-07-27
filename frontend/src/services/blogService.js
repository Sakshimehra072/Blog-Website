const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'https://blog-website-rccc.vercel.app/api';
const cleanUrl = rawUrl.replace(/^\/+/, '').replace(/\/+$/, '');
const BASE_URL = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;

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

export async function fetchBlogsApi(category = null, page = 1, limit = 20) {
  try {
    let url = `${API_BLOGS_URL}?page=${page}&limit=${limit}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    const res = await fetch(url);
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, data: [] };
  }
}

export async function fetchBlogByIdApi(id) {
  try {
    const res = await fetch(`${API_BLOGS_URL}/${id}`);
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function createBlogApi(blogData) {
  try {
    const res = await fetch(`${API_BLOGS_URL}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(blogData)
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: err.message };
  }
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
