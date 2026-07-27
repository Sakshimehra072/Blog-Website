import { NextResponse } from 'next/server';

function getBackendUrl() {
  const envUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://blog-website-rccc.vercel.app';
  let clean = envUrl.replace(/\/+$/, '');
  if (clean.endsWith('/api')) {
    clean = clean.replace(/\/api$/, '');
  }
  return clean;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const backendUrl = getBackendUrl();

    // Fetch directly from your Express Node.js & MySQL backend
    const res = await fetch(`${backendUrl}/api/blogs?${searchParams.toString()}`, {
      cache: 'no-store'
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({
      success: false,
      message: `Backend API server returned status ${res.status}`,
      data: []
    }, { status: res.status });
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to backend database API server.',
      data: []
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const backendUrl = getBackendUrl();

    // Forward publish request directly to your Express Node.js & MySQL backend
    const res = await fetch(`${backendUrl}/api/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') ? { 'Authorization': request.headers.get('authorization') } : {})
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: err.message || 'Failed to connect to backend database API server.'
    }, { status: 500 });
  }
}
