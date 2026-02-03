import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

const VIPPS_CONFIG = {
  clientId: process.env.VIPPS_LOGIN_CLIENT_ID!,
  clientSecret: process.env.VIPPS_LOGIN_CLIENT_SECRET!,
  subscriptionKey: process.env.VIPPS_LOGIN_SUBSCRIPTION_KEY!,
  redirectUri: process.env.VIPPS_LOGIN_REDIRECT_URI!,
  mode: process.env.VIPPS_MODE || 'production',
};

const BASE_URL = VIPPS_CONFIG.mode === 'production'
  ? 'https://api.vipps.no'
  : 'https://apitest.vipps.no';

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');
    const error = request.nextUrl.searchParams.get('error');

    if (error) {
      console.error('Vipps login error:', error);
      return NextResponse.redirect(new URL('/logg-inn?error=vipps_cancelled', request.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/logg-inn?error=missing_params', request.url));
    }

    // Verify state
    const stateCookie = request.cookies.get('vipps_auth_state')?.value;
    if (!stateCookie) {
      return NextResponse.redirect(new URL('/logg-inn?error=invalid_state', request.url));
    }

    const { state: savedState, returnUrl } = JSON.parse(stateCookie);
    if (state !== savedState) {
      return NextResponse.redirect(new URL('/logg-inn?error=state_mismatch', request.url));
    }

    // Exchange code for tokens
    const credentials = Buffer.from(`${VIPPS_CONFIG.clientId}:${VIPPS_CONFIG.clientSecret}`).toString('base64');
    
    const tokenResponse = await fetch(`${BASE_URL}/access-management-1.0/access/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: VIPPS_CONFIG.redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Vipps token error:', errorText);
      return NextResponse.redirect(new URL('/logg-inn?error=token_failed', request.url));
    }

    const tokens = await tokenResponse.json();

    // Get user info
    const userInfoResponse = await fetch(`${BASE_URL}/vipps-userinfo-api/userinfo`, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      console.error('Vipps userinfo error:', await userInfoResponse.text());
      return NextResponse.redirect(new URL('/logg-inn?error=userinfo_failed', request.url));
    }

    const userInfo = await userInfoResponse.json();
    console.log('Vipps user info:', userInfo);

    // Check if customer exists
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', userInfo.phone_number)
      .single();

    let customer;

    if (existingCustomer) {
      // Update existing customer
      const { data, error: updateError } = await supabase
        .from('customers')
        .update({
          name: userInfo.name || existingCustomer.name,
          email: userInfo.email || existingCustomer.email,
          vipps_sub: userInfo.sub,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingCustomer.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating customer:', updateError);
      }
      customer = data || existingCustomer;
    } else {
      // Create new customer
      const { data, error: insertError } = await supabase
        .from('customers')
        .insert({
          name: userInfo.name || 'Vipps-bruker',
          email: userInfo.email || null,
          phone: userInfo.phone_number,
          vipps_sub: userInfo.sub,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating customer:', insertError);
        return NextResponse.redirect(new URL('/logg-inn?error=create_failed', request.url));
      }
      customer = data;
    }

    // Create session token
    const sessionToken = Buffer.from(JSON.stringify({
      customerId: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    })).toString('base64');

    const response = NextResponse.redirect(new URL(returnUrl || '/', request.url));

    // Set auth cookie
    response.cookies.set('kh_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Clear state cookie
    response.cookies.delete('vipps_auth_state');

    return response;
  } catch (error) {
    console.error('Vipps callback error:', error);
    return NextResponse.redirect(new URL('/logg-inn?error=callback_failed', request.url));
  }
}
