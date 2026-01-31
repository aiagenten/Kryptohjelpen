import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');

  if (adminSession) {
    try {
      const user = JSON.parse(adminSession.value);
      return NextResponse.json({ authenticated: true, user });
    } catch {
      return NextResponse.json({ authenticated: false });
    }
  }

  return NextResponse.json({ authenticated: false });
}
