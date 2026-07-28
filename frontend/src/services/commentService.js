function getCommentBaseUrl() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
    }
    const origin = window.location.origin.replace(/\/+$/, '');
    return `${origin}/api`;
  }
  return (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/+$/, '');
}
const BASE_URL = getCommentBaseUrl().endsWith('/api') ? getCommentBaseUrl() : `${getCommentBaseUrl()}/api`;

const API_COMMENTS_URL = `${BASE_URL}/comments`;

async function parseJsonResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return await res.json();
  }
  return { success: false, message: `Server error (${res.status})` };
}

export async function fetchCommentsApi(blogId) {
  try {
    const res = await fetch(`${API_COMMENTS_URL}/blog/${blogId}`);
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, comments: [] };
  }
}

export async function addCommentApi({ blogId, text, parentId, authorName, authorAvatar }) {
  try {
    const res = await fetch(`${API_COMMENTS_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blogId, text, parentId, authorName, authorAvatar })
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function editCommentApi(id, text) {
  try {
    const res = await fetch(`${API_COMMENTS_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function deleteCommentApi(id) {
  try {
    const res = await fetch(`${API_COMMENTS_URL}/${id}`, {
      method: 'DELETE'
    });
    return await parseJsonResponse(res);
  } catch (err) {
    return { success: false, message: err.message };
  }
}
