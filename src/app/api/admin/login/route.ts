import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Mangler brukernavn eller passord' }, { status: 400 });
    }

    const stmt = db.prepare('SELECT * FROM admin_users WHERE username = ?');
    const admin = stmt.get(username) as { id: number; username: string; email: string; password_hash: string } | undefined;

    if (!admin) {
      return NextResponse.json({ error: 'Ugyldig brukernavn eller passord' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Ugyldig brukernavn eller passord' }, { status: 401 });
    }

    // Update last login
    db.prepare('UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(admin.id);

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_session', JSON.stringify({ 
      id: admin.id, 
      username: admin.username, 
      email: admin.email 
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return NextResponse.json({
      success: true,
      user: { username: admin.username, email: admin.email }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Innlogging feilet' }, { status: 500 });
  }
}
