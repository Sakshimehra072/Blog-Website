const API_FAVS_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/favourites` 
  : 'http://localhost:5000/api/favourites';

export async function toggleFavouriteApi(blogId, userId) {
  try {
    const res = await fetch(`${API_FAVS_URL}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blogId, userId })
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function fetchUserFavouritesApi(userId = 'guest_user') {
  try {
    const res = await fetch(`${API_FAVS_URL}/user/${userId}`);
    return await res.json();
  } catch (err) {
    return { success: false, favourites: [] };
  }
}
