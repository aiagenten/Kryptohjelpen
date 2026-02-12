import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import supabase from '@/lib/supabase';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Navn, e-post og melding er påkrevd' }, { status: 400 });
    }

    // Save to database
    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        subject: subject || null,
        message
      })
      .select()
      .single();

    if (error) {
      console.error('Contact form database error:', error);
      return NextResponse.json({ error: 'Kunne ikke sende melding' }, { status: 500 });
    }

    // Send email via Resend if configured
    if (resend) {
      try {
        await resend.emails.send({
          from: 'Kryptohjelpen <noreply@kryptohjelpen.no>',
          to: ['post@kryptohjelpen.no'],
          replyTo: email,
          subject: `[Kontaktskjema] ${subject || 'Ny henvendelse'} fra ${name}`,
          html: `
            <h2>Ny henvendelse fra kontaktskjemaet</h2>
            <p><strong>Fra:</strong> ${name} (${email})</p>
            <p><strong>Emne:</strong> ${subject || 'Ikke angitt'}</p>
            <hr />
            <p><strong>Melding:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
            <hr />
            <p style="color: #666; font-size: 12px;">
              Mottatt: ${new Date().toLocaleString('nb-NO', { timeZone: 'Europe/Oslo' })}<br />
              Du kan svare direkte på denne e-posten for å kontakte avsender.
            </p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Continue anyway - message is saved in database
      }
    } else {
      console.log('Resend not configured - message saved to database only');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Melding sendt',
      id: data.id 
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Kunne ikke sende melding' }, { status: 500 });
  }
}

// Get all messages (for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    
    let query = supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (unreadOnly) {
      query = query.eq('is_read', false);
    }
    
    const { data: messages, error } = await query;

    if (error) {
      console.error('Failed to fetch messages:', error);
      return NextResponse.json({ error: 'Kunne ikke hente meldinger' }, { status: 500 });
    }

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json({ error: 'Kunne ikke hente meldinger' }, { status: 500 });
  }
}
