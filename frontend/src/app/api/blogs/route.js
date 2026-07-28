import { NextResponse } from 'next/server';
import { 
  createBlogInDb, 
  getBlogsFromDb, 
  getCategoryCountsFromDb 
} from '../../../lib/blogModel';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = searchParams.get('page') || 1;
    const limit = searchParams.get('limit') || 100;

    const blogs = await getBlogsFromDb({ category, page, limit });
    const categoryCounts = await getCategoryCountsFromDb();

    return NextResponse.json({
      success: true,
      data: blogs,
      categoryCounts,
      page: parseInt(page),
      limit: parseInt(limit),
      count: blogs.length
    });
  } catch (err) {
    console.error('API GET /api/blogs error:', err);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch blogs.',
      data: []
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const newBlog = await createBlogInDb({
      title: body.title,
      category: body.category,
      coverImage: body.coverImage || body.cover_image,
      description: body.description || body.content,
      authorId: body.authorId || body.author_id,
      authorName: body.authorName || body.author_name || 'Registered Author',
      authorAvatar: body.authorAvatar || body.author_avatar,
      readTime: body.readTime || body.read_time
    });

    return NextResponse.json({
      success: true,
      message: '🎉 Article published successfully!',
      blog: newBlog
    }, { status: 201 });
  } catch (err) {
    console.error('API POST /api/blogs error:', err);
    return NextResponse.json({
      success: false,
      message: err.message || 'Failed to publish blog.'
    }, { status: 500 });
  }
}
