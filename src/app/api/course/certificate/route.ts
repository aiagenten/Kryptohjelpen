import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import supabase from '@/lib/supabase';
import { randomBytes } from 'crypto';

async function getCustomerId(): Promise<number | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('customer_session');
  if (!sessionCookie) return null;
  try {
    const session = JSON.parse(sessionCookie.value);
    return session.customerId || null;
  } catch {
    return null;
  }
}

// GET - check if user has certificate
export async function GET() {
  try {
    const customerId = await getCustomerId();
    if (!customerId) {
      return NextResponse.json({ certificate: null });
    }

    const { data: cert } = await supabase
      .from('course_certificates')
      .select('*')
      .eq('customer_id', customerId)
      .single();

    if (!cert) {
      return NextResponse.json({ certificate: null });
    }

    // Get customer name
    const { data: customer } = await supabase
      .from('customers')
      .select('name')
      .eq('id', customerId)
      .single();

    return NextResponse.json({
      certificate: {
        ...cert,
        customerName: customer?.name || 'Kursbruker',
      },
    });
  } catch (error) {
    console.error('Certificate GET error:', error);
    return NextResponse.json({ certificate: null });
  }
}

// POST - issue certificate (only if all chapters completed)
export async function POST() {
  try {
    const customerId = await getCustomerId();
    if (!customerId) {
      return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });
    }

    // Check if already has certificate
    const { data: existing } = await supabase
      .from('course_certificates')
      .select('*')
      .eq('customer_id', customerId)
      .single();

    if (existing) {
      const { data: customer } = await supabase
        .from('customers')
        .select('name')
        .eq('id', customerId)
        .single();

      return NextResponse.json({
        certificate: { ...existing, customerName: customer?.name },
      });
    }

    // Verify all chapters completed
    const { data: chapters } = await supabase
      .from('course_chapters')
      .select('id');

    const { data: progress } = await supabase
      .from('course_progress')
      .select('chapter_id')
      .eq('customer_id', customerId);

    const totalChapters = chapters?.length || 0;
    const completedChapters = progress?.length || 0;

    if (completedChapters < totalChapters) {
      return NextResponse.json(
        { error: `Du har fullført ${completedChapters} av ${totalChapters} kapitler` },
        { status: 403 }
      );
    }

    // Generate unique certificate ID
    const certId = `KH-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`;

    const { data: cert, error } = await supabase
      .from('course_certificates')
      .insert({
        customer_id: customerId,
        certificate_id: certId,
      })
      .select()
      .single();

    if (error) {
      console.error('Certificate insert error:', error);
      return NextResponse.json({ error: 'Kunne ikke utstede bevis' }, { status: 500 });
    }

    const { data: customer } = await supabase
      .from('customers')
      .select('name')
      .eq('id', customerId)
      .single();

    return NextResponse.json({
      certificate: { ...cert, customerName: customer?.name },
    });
  } catch (error) {
    console.error('Certificate POST error:', error);
    return NextResponse.json({ error: 'Serverfeil' }, { status: 500 });
  }
}
