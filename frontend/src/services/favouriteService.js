const API_FAVS_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/favourites`
  : 'https://blog-website-rccc.vercel.app//api/favourites';

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('blogverse_token') : null;
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// LocalStorage helpers for instant client persistence
export function getLocalSavedBlogIds() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('blogverse_saved_blogs');
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function setLocalSavedBlogIds(ids) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('blogverse_saved_blogs', JSON.stringify(ids));
  } catch (err) { }
}

export function isBlogSavedLocally(blogId) {
  const ids = getLocalSavedBlogIds();
  return ids.includes(Number(blogId)) || ids.includes(String(blogId));
}

export function toggleLocalSavedBlog(blogId) {
  const ids = getLocalSavedBlogIds();
  const numericId = Number(blogId);
  const exists = ids.includes(numericId) || ids.includes(String(blogId));

  let updated;
  if (exists) {
    updated = ids.filter(id => Number(id) !== numericId);
  } else {
    updated = [...ids, numericId];
  }

  setLocalSavedBlogIds(updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('saved_blogs_updated', { detail: { blogId, isSaved: !exists } }));
  }
  return !exists;
}

export async function toggleFavouriteApi(blogId) {
  // Always update local storage for instant persistence
  const isSavedLocally = toggleLocalSavedBlog(blogId);

  try {
    const res = await fetch(`${API_FAVS_URL}/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ blogId })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return { success: true, isSaved: isSavedLocally };
  }
}

export async function fetchUserFavouritesApi(userId = 'guest_user') {
  try {
    const res = await fetch(`${API_FAVS_URL}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (data && data.success && Array.isArray(data.favourites) && data.favourites.length > 0) {
      return data;
    }
  } catch (err) { }

  // Fallback to local saved IDs if backend returns empty or guest mode
  return { success: true, favourites: [] };
}
