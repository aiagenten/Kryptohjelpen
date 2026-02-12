import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

// Vipps API helper to get access token
async function getVippsAccessToken(): Promise<string> {
  const response = await fetch('https://api.vipps.no/accesstoken/get', {
    method: 'POST',
    headers: {
      'client_id': process.env.VIPPS_CLIENT_ID!,
      'client_secret': process.env.VIPPS_CLIENT_SECRET!,
      'Ocp-Apim-Subscription-Key': process.env.VIPPS_SUBSCRIPTION_KEY!,
      'Merchant-Serial-Number': process.env.VIPPS_MERCHANT_SERIAL_NUMBER!,
    },
  });
  const data = await response.json();
  return data.access_token;
}

// Get payment details including user info from Vipps
async function getVippsPaymentDetails(reference: string, accessToken: string) {
  const response = await fetch(
    `https://api.vipps.no/epayment/v1/payments/${reference}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Ocp-Apim-Subscription-Key': process.env.VIPPS_SUBSCRIPTION_KEY!,
        'Merchant-Serial-Number': process.env.VIPPS_MERCHANT_SERIAL_NUMBER!,
      },
    }
  );
  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Vipps callback received:', JSON.stringify(body, null, 2));

    // Handle ePayment webhook format
    const reference = body.reference || body.orderId;
    const pspReference = body.pspReference;
    
    if (!reference) {
      console.error('No reference in callback');
      return NextResponse.json({ error: 'Invalid callback data' }, { status: 400 });
    }

    // Get access token and fetch full payment details
    let customerName = 'Vipps-kunde';
    let customerEmail = '';
    let customerPhone = '';
    let vippsUserInfo = null;

    try {
      const accessToken = await getVippsAccessToken();
      const paymentDetails = await getVippsPaymentDetails(reference, accessToken);
      console.log('Vipps payment details:', JSON.stringify(paymentDetails, null, 2));

      // Extract user info if available
      if (paymentDetails.profile) {
        const profile = paymentDetails.profile;
        customerName = profile.name || profile.givenName + ' ' + profile.familyName || 'Vipps-kunde';
        customerEmail = profile.email || '';
        customerPhone = profile.phoneNumber || '';
        vippsUserInfo = profile;
      }

      // Check payment state
      const state = paymentDetails.state;
      
      if (state === 'AUTHORIZED' || state === 'CHARGED') {
        // Payment successful
        const { error } = await supabase
          .from('orders')
          .update({
            order_status: 'paid',
            payment_status: 'completed',
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            vipps_user_info: vippsUserInfo,
            updated_at: new Date().toISOString()
          })
          .eq('order_number', reference);

        if (error) {
          console.error('Error updating order:', error);
        } else {
          console.log(`Order ${reference} marked as paid. Customer: ${customerName}`);
          
          // TODO: Send notification to admin
          // TODO: Create calendar event if booking_time exists
        }

      } else if (state === 'ABORTED' || state === 'EXPIRED' || state === 'TERMINATED') {
        // Payment failed/cancelled
        const { error } = await supabase
          .from('orders')
          .update({
            order_status: 'cancelled',
            payment_status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('order_number', reference);

        if (error) {
          console.error('Error updating order:', error);
        } else {
          console.log(`Order ${reference} marked as cancelled`);
        }
      }

    } catch (vippsError) {
      console.error('Error fetching Vipps details:', vippsError);
      // Still try to update with basic info from callback
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Vipps callback error:', error);
    return NextResponse.json(
      { error: 'Callback processing failed' },
      { status: 500 }
    );
  }
}

// Vipps sends GET requests to verify callback URL
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
