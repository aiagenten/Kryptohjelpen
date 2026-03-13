import { NextResponse } from 'next/server';
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

function drawRoundedRect(pdf: jsPDF, x: number, y: number, w: number, h: number, r: number) {
  pdf.roundedRect(x, y, w, h, r, r, 'S');
}

export async function GET() {
  try {
    const customerId = await getCustomerId();
    if (!customerId) {
      return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });
    }

    const { data: cert } = await supabase
      .from('course_certificates')
      .select('*')
      .eq('customer_id', customerId)
      .single();

    if (!cert) {
      return NextResponse.json({ error: 'Ingen kursbevis funnet' }, { status: 404 });
    }

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

    // A4 Landscape
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const w = pdf.internal.pageSize.getWidth();  // 297
    const h = pdf.internal.pageSize.getHeight(); // 210

    // === BACKGROUND ===
    // White base
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, w, h, 'F');

    // Soft cream fill inside the frame area
    pdf.setFillColor(252, 252, 250);
    pdf.roundedRect(9, 9, w - 18, h - 18, 3, 3, 'F');

    // === BORDERS ===
    // Outer border - thick green
    pdf.setDrawColor(90, 154, 106);
    pdf.setLineWidth(1.5);
    drawRoundedRect(pdf, 8, 8, w - 16, h - 16, 3);

    // Inner border - thin, lighter
    pdf.setDrawColor(141, 201, 156);
    pdf.setLineWidth(0.4);
    drawRoundedRect(pdf, 12, 12, w - 24, h - 24, 2);

    // Decorative double-line inner frame
    pdf.setDrawColor(200, 225, 205);
    pdf.setLineWidth(0.2);
    drawRoundedRect(pdf, 15, 15, w - 30, h - 30, 1.5);

    // === CORNER ORNAMENTS ===
    const co = 20; // corner offset
    const cs = 12; // corner size
    pdf.setDrawColor(90, 154, 106);
    pdf.setLineWidth(0.8);

    // Diamond shapes in corners
    const corners = [
      [co, co],
      [w - co, co],
      [co, h - co],
      [w - co, h - co],
    ];
    corners.forEach(([cx, cy]) => {
      const s = 4;
      pdf.line(cx, cy - s, cx + s, cy);
      pdf.line(cx + s, cy, cx, cy + s);
      pdf.line(cx, cy + s, cx - s, cy);
      pdf.line(cx - s, cy, cx, cy - s);
    });

    // === LOGO ===
    try {
      const logoPath = path.join(process.cwd(), 'public', 'images', 'kryptohjelpen-logo.png');
      const logoBuffer = fs.readFileSync(logoPath);
      const logoBase64 = logoBuffer.toString('base64');
      // Logo is 2839x232 (ratio ~12.2:1) - preserve aspect ratio
      const logoW = 80;
      const logoH = logoW / 12.2; // ~6.5mm
      pdf.addImage(`data:image/png;base64,${logoBase64}`, 'PNG', w / 2 - logoW / 2, 26, logoW, logoH);
    } catch {
      pdf.setFontSize(16);
      pdf.setTextColor(90, 154, 106);
      pdf.text('KRYPTOHJELPEN', w / 2, 34, { align: 'center' });
    }

    // === DECORATIVE DIVIDER ===
    const divY = 42;
    pdf.setDrawColor(141, 201, 156);
    pdf.setLineWidth(0.3);
    pdf.line(w / 2 - 50, divY, w / 2 - 8, divY);
    pdf.line(w / 2 + 8, divY, w / 2 + 50, divY);
    // Small diamond in center
    const dy = divY;
    const ds = 3;
    pdf.setFillColor(90, 154, 106);
    const points = [
      { x: w / 2, y: dy - ds },
      { x: w / 2 + ds, y: dy },
      { x: w / 2, y: dy + ds },
      { x: w / 2 - ds, y: dy },
    ];
    // Draw diamond with lines and fill
    pdf.setDrawColor(90, 154, 106);
    pdf.setLineWidth(0.5);
    pdf.line(points[0].x, points[0].y, points[1].x, points[1].y);
    pdf.line(points[1].x, points[1].y, points[2].x, points[2].y);
    pdf.line(points[2].x, points[2].y, points[3].x, points[3].y);
    pdf.line(points[3].x, points[3].y, points[0].x, points[0].y);

    // === CERTIFICATE TITLE ===
    pdf.setFontSize(13);
    pdf.setTextColor(90, 154, 106);
    pdf.setFont('helvetica', 'normal');
    pdf.text('K U R S B E V I S', w / 2, 55, { align: 'center' });

    // === RECIPIENT NAME ===
    pdf.setFontSize(36);
    pdf.setTextColor(35, 35, 35);
    pdf.setFont('helvetica', 'bold');
    pdf.text(name, w / 2, 80, { align: 'center' });

    // Underline under name
    const nameWidth = pdf.getTextWidth(name);
    pdf.setDrawColor(200, 225, 205);
    pdf.setLineWidth(0.3);
    pdf.line(w / 2 - nameWidth / 2, 83, w / 2 + nameWidth / 2, 83);

    // === DESCRIPTION ===
    pdf.setFontSize(13);
    pdf.setTextColor(120, 120, 120);
    pdf.setFont('helvetica', 'normal');
    pdf.text('har fullført', w / 2, 95, { align: 'center' });

    // === COURSE NAME ===
    pdf.setFontSize(22);
    pdf.setTextColor(90, 154, 106);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Kryptohjelpens Kryptokurs', w / 2, 110, { align: 'center' });

    // === COURSE DETAILS ===
    pdf.setFontSize(10);
    pdf.setTextColor(140, 140, 140);
    pdf.setFont('helvetica', 'normal');
    pdf.text('6 kapitler  ·  30 quiz-spørsmål  ·  100% bestått', w / 2, 124, { align: 'center' });

    // === SEAL / BADGE ===
    // Draw a circular seal
    const sealX = w / 2;
    const sealY = 145;
    const sealR = 12;

    // Outer circle
    pdf.setDrawColor(90, 154, 106);
    pdf.setLineWidth(1);
    pdf.circle(sealX, sealY, sealR, 'S');

    // Inner circle
    pdf.setLineWidth(0.3);
    pdf.circle(sealX, sealY, sealR - 2, 'S');

    // Checkmark in seal
    pdf.setDrawColor(90, 154, 106);
    pdf.setLineWidth(1.5);
    pdf.line(sealX - 4, sealY, sealX - 1, sealY + 3);
    pdf.line(sealX - 1, sealY + 3, sealX + 5, sealY - 4);

    // "VERIFISERT" around seal bottom
    pdf.setFontSize(6);
    pdf.setTextColor(90, 154, 106);
    pdf.text('VERIFISERT', sealX, sealY + sealR + 4, { align: 'center' });

    // === DATE & ID ===
    // Left side: date
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Utstedt: ${issuedDate}`, w / 2 - 50, 180, { align: 'center' });

    // Right side: ID
    pdf.text(`Bevis-ID: ${cert.certificate_id}`, w / 2 + 50, 180, { align: 'center' });

    // Bottom center: website
    pdf.setFontSize(8);
    pdf.setTextColor(160, 160, 160);
    pdf.text('kryptohjelpen.no/kurs', w / 2, 190, { align: 'center' });

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
