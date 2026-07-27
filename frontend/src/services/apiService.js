const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://blog-website-rccc.vercel.app/api').replace(/\/+$/, '');

export async function fetchBlogs() {
  try {
    const res = await fetch(`${API_BASE_URL}/blogs`);
    if (!res.ok) throw new Error('Failed to fetch blogs');
    return await res.json();
  } catch (error) {
    console.warn('Backend API offline or unreachable:', error.message);
    return null;
  }
}

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    return await res.json();
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}
