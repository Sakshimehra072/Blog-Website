const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://blog-website-rccc.vercel.app/api').replace(/\/+$/, '');
const API_SUB_URL = `${BASE_URL}/subscriptions`;

export async function toggleSubscribeApi(authorId, userId) {
  try {
    const res = await fetch(`${API_SUB_URL}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorId, userId })
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function fetchSubscriberCountApi(authorId) {
  try {
    const res = await fetch(`${API_SUB_URL}/author/${authorId}`);
    return await res.json();
  } catch (err) {
    return { success: false, count: 0 };
  }
}
