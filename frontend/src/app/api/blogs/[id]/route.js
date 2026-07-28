import { NextResponse } from 'next/server';
import { 
  getBlogByIdFromDb, 
  deleteBlogFromDb, 
  updateBlogInDb 
} from '../../../../../../backend/models/blogModel';

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
  const { id } = params;
  try {
    await deleteBlogFromDb(id);
    return NextResponse.json({ success: true, message: 'Article deleted successfully.' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to delete article.' }, { status: 500 });
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
