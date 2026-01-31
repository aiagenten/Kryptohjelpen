import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Navn, e-post og melding er påkrevd' }, { status: 400 });
    }

    // In production, you would send an email here using nodemailer
    // For now, we just log and return success
    console.log('Contact form submission:', { name, email, subject, message });

    return NextResponse.json({ success: true, message: 'Melding sendt' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ success: true, message: 'Melding mottatt' });
  }
}
