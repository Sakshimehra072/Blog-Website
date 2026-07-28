import { NextResponse } from 'next/server';
import { createUserInDb, findUserByEmailInDb } from '../../../../lib/userModel';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Name, email, and password are required.'
      }, { status: 400 });
    }

    const existingUser = await findUserByEmailInDb(email);
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'An account with this email already exists.'
      }, { status: 400 });
    }

    const user = await createUserInDb({ name, email, password });
    const token = `jwt_${user.id}_${Date.now()}`;

    return NextResponse.json({
      success: true,
      message: '🎉 Account created successfully!',
      token,
      user
    }, { status: 201 });
  } catch (err) {
    console.error('API POST /api/auth/register error:', err);
    return NextResponse.json({
      success: false,
      message: err.message || 'Failed to create user account in database.'
    }, { status: 500 });
  }
}
