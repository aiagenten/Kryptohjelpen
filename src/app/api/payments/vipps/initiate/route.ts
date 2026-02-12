import { NextRequest, NextResponse } from 'next/server';

const VIPPS_CONFIG = {
  clientId: process.env.VIPPS_CLIENT_ID!,
  clientSecret: process.env.VIPPS_CLIENT_SECRET!,
  subscriptionKey: process.env.VIPPS_SUBSCRIPTION_KEY!,
  merchantSerialNumber: process.env.VIPPS_MERCHANT_SERIAL_NUMBER!,
  mode: process.env.VIPPS_MODE || 'test',
};

const BASE_URL = VIPPS_CONFIG.mode === 'production'
  ? 'https://api.vipps.no'
  : 'https://apitest.vipps.no';

async function getAccessToken(): Promise<string> {
  const response = await fetch(`${BASE_URL}/accesstoken/get`, {
    method: 'POST',
    headers: {
      'client_id': VIPPS_CONFIG.clientId,
      'client_secret': VIPPS_CONFIG.clientSecret,
      'Ocp-Apim-Subscription-Key': VIPPS_CONFIG.subscriptionKey,
      'Merchant-Serial-Number': VIPPS_CONFIG.merchantSerialNumber,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Vipps token error:', error);
    throw new Error('Failed to get Vipps access token');
  }

  const data = await response.json();
  return data.access_token;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, orderId, description, phoneNumber } = body;

    if (!amount || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, orderId' },
        { status: 400 }
      );
    }

    const accessToken = await getAccessToken();
    
    // Use request origin for dynamic URL (works with tunnels)
    const origin = request.headers.get('origin') || request.headers.get('referer')?.replace(/\/$/, '').split('/').slice(0, 3).join('/') || process.env.SITE_URL || 'http://localhost:3000';
    const returnUrl = `${origin}/order-confirmation?orderId=${orderId}`;

    // ePayment v1 API request with profile scope for user info
    const paymentRequest = {
      amount: {
        currency: 'NOK',
        value: Math.round(amount * 100), // Vipps uses øre (cents)
      },
      paymentMethod: {
        type: 'WALLET',
      },
      reference: orderId,
      userFlow: 'WEB_REDIRECT',
      returnUrl,
      paymentDescription: description || `Ordre - Kryptohjelpen.no`,
      profile: {
        scope: 'name phoneNumber email', // Request user info
      },
      ...(phoneNumber && {
        customer: {
          phoneNumber: phoneNumber.replace(/\s/g, ''),
        },
      }),
    };

    console.log('Initiating ePayment v1:', JSON.stringify(paymentRequest, null, 2));

    const response = await fetch(
      `${BASE_URL}/epayment/v1/payments`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Ocp-Apim-Subscription-Key': VIPPS_CONFIG.subscriptionKey,
          'Merchant-Serial-Number': VIPPS_CONFIG.merchantSerialNumber,
          'Content-Type': 'application/json',
          'Vipps-System-Name': 'Kryptohjelpen',
          'Vipps-System-Version': '2.0.0',
          'Idempotency-Key': orderId,
        },
        body: JSON.stringify(paymentRequest),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Vipps ePayment error:', error);
      return NextResponse.json(
        { error: 'Failed to initiate Vipps payment', details: error },
        { status: 500 }
      );
    }

    const paymentResponse = await response.json();
    console.log('ePayment response:', JSON.stringify(paymentResponse, null, 2));
    
    return NextResponse.json({
      success: true,
      orderId,
      vippsUrl: paymentResponse.redirectUrl,
    });

  } catch (error) {
    console.error('Vipps initiate error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
