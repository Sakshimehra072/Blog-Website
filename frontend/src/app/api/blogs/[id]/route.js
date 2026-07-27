import { NextResponse } from 'next/server';

function getBackendUrl() {
  const envUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  let clean = envUrl.replace(/\/+$/, '');
  if (clean.endsWith('/api')) {
    clean = clean.replace(/\/api$/, '');
  }
  return clean;
}

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/blogs/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({ success: false, message: 'Article not found.' }, { status: res.status });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to fetch article from database.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/blogs/${id}`, {
      method: 'DELETE',
      headers: {
        ...(request.headers.get('authorization') ? { 'Authorization': request.headers.get('authorization') } : {})
      }
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to delete article.' }, { status: 500 });
  }
}
