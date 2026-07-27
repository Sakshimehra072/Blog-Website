import { NextResponse } from 'next/server';

// Server-side persistent memory store for Next.js Vercel environment (Real User Blogs Only)
if (!globalThis._globalBlogsStore) {
  globalThis._globalBlogsStore = [];
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

    let blogs = [...globalThis._globalBlogsStore];

    // Attempt to fetch from external Express Node.js backend if deployed
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${backendUrl}/api/blogs?${searchParams.toString()}`, {
        signal: controller.signal,
        cache: 'no-store'
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          data.data.forEach(dbBlog => {
            if (!blogs.some(b => String(b.id) === String(dbBlog.id))) {
              blogs.push(dbBlog);
            }
          });
        }
      }
    } catch (err) {}

    // Filter by category if requested
    if (category && category !== 'All') {
      blogs = blogs.filter(b => b.category && b.category.toLowerCase() === category.toLowerCase());
    }

    // Sort descending by date (newest first)
    blogs.sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0));

    // Calculate category counts
    const categoryCounts = { All: globalThis._globalBlogsStore.length };
    globalThis._globalBlogsStore.forEach(b => {
      if (b.category) {
        categoryCounts[b.category] = (categoryCounts[b.category] || 0) + 1;
      }
    });

    return NextResponse.json({
      success: true,
      data: blogs,
      categoryCounts,
      count: blogs.length
    });
  } catch (err) {
    return NextResponse.json({
      success: true,
      data: globalThis._globalBlogsStore || [],
      categoryCounts: { All: (globalThis._globalBlogsStore || []).length }
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, category, coverImage, description, authorName, authorAvatar, readTime } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
    }

    const newBlog = {
      id: Date.now(),
      title: title.trim(),
      category: category ? category.trim() : 'General',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      description: description ? description.trim() : '',
      excerpt: description ? (description.trim().slice(0, 140) + '...') : '',
      author: {
        id: 1,
        name: authorName || 'Registered Author',
        avatar: authorAvatar || null
      },
      readTime: readTime || '5 min read',
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString()
    };

    // Forward to Express Node.js backend if reachable
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${backendUrl}/api/blogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && data.blog) {
          newBlog.id = data.blog.id;
        }
      }
    } catch (err) {}

    // Prepend to global serverless memory store
    if (!globalThis._globalBlogsStore.some(b => String(b.id) === String(newBlog.id))) {
      globalThis._globalBlogsStore.unshift(newBlog);
    }

    return NextResponse.json({
      success: true,
      message: '🎉 Article published successfully!',
      blog: newBlog
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
