import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import supabase from '@/lib/supabase';

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
    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Get product from database
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get current cart
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

    // Check if product already in cart
    const existingIndex = cart.items.findIndex(item => item.product_id === productId);

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({
        product_id: product.id,
        name: product.name,
        price: product.price_nok,
        quantity,
        image_url: product.image_url,
        category: product.category
      });
    }

    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Save cart to cookie
    const response = NextResponse.json(cart);
    response.cookies.set('cart', JSON.stringify(cart), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Cart add error:', error);
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}
