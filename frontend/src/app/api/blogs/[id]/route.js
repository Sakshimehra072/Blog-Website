import { NextResponse } from 'next/server';

function getBackendUrl(request) {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL.replace(/\/+$/, '');
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '').replace(/\/api$/, '');
  if (request && typeof request.headers?.get === 'function') {
    const host = request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      return `${proto}://${host}`;
    }
  }
  return 'http://localhost:5000';
}

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const backendUrl = getBackendUrl(request);
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
    const backendUrl = getBackendUrl(request);
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

export async function PUT(request, { params }) {
  const { id } = params;
  try {
    const body = await request.json();
    const backendUrl = getBackendUrl(request);
    const res = await fetch(`${backendUrl}/api/blogs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') ? { 'Authorization': request.headers.get('authorization') } : {})
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to update article.' }, { status: 500 });
  }
}
