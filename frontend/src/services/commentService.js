const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'https://blog-website-rccc.vercel.app/api';
let cleanUrl = rawUrl.replace(/^\/+/, '').replace(/\/+$/, '');
if (!cleanUrl.endsWith('/api')) {
  cleanUrl = `${cleanUrl}/api`;
}
const BASE_URL = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;

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
