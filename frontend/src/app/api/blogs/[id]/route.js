import { NextResponse } from 'next/server';

const KV_ENDPOINT = 'https://kvdb.io/BlogVerseAppDB2026/published_blogs';

export async function GET(request, { params }) {
  const { id } = params;
  const targetId = String(id);

  try {
    const res = await fetch(KV_ENDPOINT, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const match = data.find(b => String(b.id) === targetId);
        if (match) {
          return NextResponse.json({
            success: true,
            blog: match
          });
        }
      }
    }
  } catch (err) {}

  const store = globalThis._globalBlogsStore || [];
  const match = store.find(b => String(b.id) === targetId);

  if (match) {
    return NextResponse.json({
      success: true,
      blog: match
    });
  }

  // Fallback forward to Express Node.js backend
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  try {
    const res = await fetch(`${backendUrl}/api/blogs/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {}

  return NextResponse.json({
    success: false,
    message: 'Article not found.'
  }, { status: 404 });
}
