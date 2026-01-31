import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const cartCookie = cookieStore.get('cart');
    let cart: CartData = { items: [], total: 0 };

    if (cartCookie) {
      try {
        cart = JSON.parse(cartCookie.value);
      } catch {
        cart = { items: [], total: 0 };
      }
    }

    cart.items = cart.items.filter(item => item.product_id !== productId);
    cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const response = NextResponse.json(cart);
    response.cookies.set('cart', JSON.stringify(cart), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    console.error('Cart remove error:', error);
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 });
  }
}
