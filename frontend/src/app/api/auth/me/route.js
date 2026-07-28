import { NextResponse } from 'next/server';
import { findUserByIdInDb } from '../../../../lib/userModel';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    if (authHeader.startsWith('Bearer jwt_')) {
      const parts = authHeader.split('_');
      const userId = parts[1];
      const user = await findUserByIdInDb(userId);
      if (user) {
        return NextResponse.json({
          success: true,
          user
        });
      }
    }

    return NextResponse.json({
      success: false,
      message: 'Not authenticated.'
    }, { status: 401 });
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: err.message || 'Authentication query failed.'
    }, { status: 500 });
  }
}
