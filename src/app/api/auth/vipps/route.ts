import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const VIPPS_CONFIG = {
  clientId: process.env.VIPPS_CLIENT_ID!,  // Use same as payment (MSN 823497)
  redirectUri: process.env.VIPPS_LOGIN_REDIRECT_URI!,
  mode: process.env.VIPPS_MODE || 'production',
};

const BASE_URL = VIPPS_CONFIG.mode === 'production'
  ? 'https://api.vipps.no'
  : 'https://apitest.vipps.no';

// Initiate Vipps Login - redirect user to Vipps
export async function GET(request: NextRequest) {
  try {
    const state = uuidv4();
    const returnUrl = request.nextUrl.searchParams.get('returnUrl') || '/';
    
    // Store state in cookie for verification
    const stateData = JSON.stringify({ state, returnUrl });
    
    const authUrl = new URL(`${BASE_URL}/access-management-1.0/access/oauth2/auth`);
    authUrl.searchParams.set('client_id', VIPPS_CONFIG.clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid name email phoneNumber');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('redirect_uri', VIPPS_CONFIG.redirectUri);

    const response = NextResponse.redirect(authUrl.toString());
    
    // Set state cookie (expires in 10 minutes)
    response.cookies.set('vipps_auth_state', stateData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Vipps login initiate error:', error);
    return NextResponse.redirect(new URL('/logg-inn?error=vipps_failed', request.url));
  }
}
