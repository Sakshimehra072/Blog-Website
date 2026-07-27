import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { id } = params;
  const targetId = String(id);

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
