const API_COMMENTS_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/comments` 
  : 'http://localhost:5000/api/comments';

export async function fetchCommentsApi(blogId) {
  try {
    const res = await fetch(`${API_COMMENTS_URL}/blog/${blogId}`);
    return await res.json();
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
    return await res.json();
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
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function deleteCommentApi(id) {
  try {
    const res = await fetch(`${API_COMMENTS_URL}/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}
