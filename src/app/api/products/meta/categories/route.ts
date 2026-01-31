import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const categories = db.prepare(`
      SELECT DISTINCT category as slug, category as name
      FROM products
      WHERE category IS NOT NULL AND category != ''
      ORDER BY category
    `).all();

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
