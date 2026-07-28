import { NextResponse } from 'next/server';
import { findUserByEmailInDb } from '../../../../lib/userModel';

export async function POST(request) {
  try {
    const body = await request.json();
    const identifier = body.identifier || body.email || body.name;
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email/Name and password are required.'
      }, { status: 400 });
    }

    const user = await findUserByEmailInDb(identifier);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials. User account not found.'
      }, { status: 401 });
    }

    if (user.password && user.password !== password) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email/username or password.'
      }, { status: 401 });
    }

    const token = `jwt_${user.id}_${Date.now()}`;

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        avatar: user.avatar_url
      }
    });
  } catch (err) {
    console.error('API POST /api/auth/login error:', err);
    return NextResponse.json({
      success: false,
      message: err.message || 'Login request failed.'
    }, { status: 500 });
  }
}
