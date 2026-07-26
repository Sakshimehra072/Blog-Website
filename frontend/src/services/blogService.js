const API_BLOGS_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/blogs` 
  : 'http://localhost:5000/api/blogs';

export async function createBlogApi(blogData) {
  try {
    const res = await fetch(`${API_BLOGS_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blogData)
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function uploadBlogImageApi(file) {
  try {
    const formData = new FormData();
    formData.append('coverImage', file);

    const res = await fetch(`${API_BLOGS_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}
