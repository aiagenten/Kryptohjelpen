import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';

interface CartItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  category?: string;
}

interface CartData {
  items: CartItem[];
  total: number;
}

async function getCart(): Promise<CartData> {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get('cart');
  
  if (!cartCookie) {
    return { items: [], total: 0 };
  }

  try {
    const cart = JSON.parse(cartCookie.value) as CartData;
    return cart;
  } catch {
    return { items: [], total: 0 };
  }
}

export async function GET() {
  try {
    const cart = await getCart();
    return NextResponse.json(cart);
  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json({ items: [], total: 0 });
  }
}
