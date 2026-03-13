import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import supabase from '@/lib/supabase';
import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

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

export async function GET(request: NextRequest) {
  try {
    const customerId = await getCustomerId();
    if (!customerId) {
      return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });
    }

    // Get certificate
    const { data: cert } = await supabase
      .from('course_certificates')
      .select('*')
      .eq('customer_id', customerId)
      .single();

    if (!cert) {
      return NextResponse.json({ error: 'Ingen kursbevis funnet' }, { status: 404 });
    }

    // Get customer name
    const { data: customer } = await supabase
      .from('customers')
      .select('name')
      .eq('id', customerId)
      .single();

    const name = customer?.name || 'Kursbruker';
    const issuedDate = new Date(cert.issued_at).toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    // Build PDF - A4 Landscape
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const w = pdf.internal.pageSize.getWidth(); // 297mm
    const h = pdf.internal.pageSize.getHeight(); // 210mm

    // Background
    pdf.setFillColor(248, 253, 249);
    pdf.rect(0, 0, w, h, 'F');

    // Border
    pdf.setDrawColor(141, 201, 156);
    pdf.setLineWidth(2);
    pdf.rect(10, 10, w - 20, h - 20);

    // Corner decorations
    const cornerSize = 15;
    const margin = 15;
    pdf.setLineWidth(1);
    pdf.setDrawColor(141, 201, 156);
    // Top-left
    pdf.line(margin, margin, margin + cornerSize, margin);
    pdf.line(margin, margin, margin, margin + cornerSize);
    // Top-right
    pdf.line(w - margin, margin, w - margin - cornerSize, margin);
    pdf.line(w - margin, margin, w - margin, margin + cornerSize);
    // Bottom-left
    pdf.line(margin, h - margin, margin + cornerSize, h - margin);
    pdf.line(margin, h - margin, margin, h - margin - cornerSize);
    // Bottom-right
    pdf.line(w - margin, h - margin, w - margin - cornerSize, h - margin);
    pdf.line(w - margin, h - margin, w - margin, h - margin - cornerSize);

    // Logo
    try {
      const logoPath = path.join(process.cwd(), 'public', 'images', 'kryptohjelpen-logo.png');
      const logoBuffer = fs.readFileSync(logoPath);
      const logoBase64 = logoBuffer.toString('base64');
      const logoDataUrl = `data:image/png;base64,${logoBase64}`;
      pdf.addImage(logoDataUrl, 'PNG', w / 2 - 35, 30, 70, 20);
    } catch (e) {
      // Fallback: text logo
      pdf.setFontSize(18);
      pdf.setTextColor(90, 154, 106);
      pdf.text('KRYPTOHJELPEN', w / 2, 42, { align: 'center' });
    }

    // "KURSBEVIS" header
    pdf.setFontSize(12);
    pdf.setTextColor(90, 154, 106);
    pdf.text('KURSBEVIS', w / 2, 65, { align: 'center' });

    // Decorative line
    pdf.setDrawColor(141, 201, 156);
    pdf.setLineWidth(0.5);
    pdf.line(w / 2 - 40, 70, w / 2 + 40, 70);

    // Name
    pdf.setFontSize(32);
    pdf.setTextColor(30, 30, 30);
    pdf.text(name, w / 2, 90, { align: 'center' });

    // "har fullført"
    pdf.setFontSize(14);
    pdf.setTextColor(100, 100, 100);
    pdf.text('har fullført', w / 2, 102, { align: 'center' });

    // Course name
    pdf.setFontSize(20);
    pdf.setTextColor(90, 154, 106);
    pdf.text('Kryptohjelpens Kryptokurs', w / 2, 118, { align: 'center' });

    // Details
    pdf.setFontSize(11);
    pdf.setTextColor(120, 120, 120);
    pdf.text('6 kapitler fullført med quiz', w / 2, 135, { align: 'center' });

    // Date
    pdf.setFontSize(11);
    pdf.setTextColor(80, 80, 80);
    pdf.text(`Utstedt ${issuedDate}`, w / 2, 148, { align: 'center' });

    // Separator
    pdf.setDrawColor(141, 201, 156);
    pdf.setLineWidth(0.3);
    pdf.line(w / 2 - 50, 158, w / 2 + 50, 158);

    // Certificate ID
    pdf.setFontSize(9);
    pdf.setTextColor(160, 160, 160);
    pdf.text(`Bevis-ID: ${cert.certificate_id}`, w / 2, 168, { align: 'center' });

    // Website
    pdf.setFontSize(9);
    pdf.setTextColor(160, 160, 160);
    pdf.text('kryptohjelpen.no', w / 2, 175, { align: 'center' });

    // Return PDF
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Kursbevis-${cert.certificate_id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Kunne ikke generere PDF' }, { status: 500 });
  }
}
