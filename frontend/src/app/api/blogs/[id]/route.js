export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { 
  getBlogByIdFromDb, 
  deleteBlogFromDb, 
  updateBlogInDb 
} from '../../../../lib/blogModel';

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const blog = await getBlogByIdFromDb(id);
    if (blog) {
      return NextResponse.json({ success: true, blog });
    }
    return NextResponse.json({ success: false, message: 'Article not found.' }, { status: 404 });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to fetch article from database.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing article ID parameter.', affectedRows: 0 }, { status: 400 });
    }

    const result = await deleteBlogFromDb(id);

    if (result && result.success && result.affectedRows > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Article deleted successfully from database.',
        affectedRows: result.affectedRows 
      }, { status: 200 });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: (result && result.message) || 'Article not found in database.',
        affectedRows: 0 
      }, { status: 404 });
    }
  } catch (err) {
    console.error('API DELETE /api/blogs/[id] error:', err);
    return NextResponse.json({ 
      success: false, 
      message: err.message || 'Failed to delete article from database.',
      affectedRows: 0 
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { id } = params;
  try {
    const body = await request.json();
    const updatedBlog = await updateBlogInDb(id, body);
    return NextResponse.json({ success: true, message: 'Article updated successfully!', blog: updatedBlog });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to update article.' }, { status: 500 });
  }
}
