// Email sending via Resend API

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'Kryptohjelpen <noreply@kryptohjelpen.no>';

interface BookingConfirmationData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  bookingDate: string; // Formatted date string
  bookingTime: string; // Formatted time string
  totalAmount: number;
}

export async function sendBookingConfirmation(data: BookingConfirmationData): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured');
    return { success: false, error: 'Email not configured' };
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Kryptohjelpen</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Teknisk veiledning for krypto & Web3</p>
            </td>
          </tr>
          
          <!-- Success Icon -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: #10b981; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <span style="color: #ffffff; font-size: 40px;">✓</span>
              </div>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <h2 style="margin: 0 0 10px; color: #1f2937; font-size: 24px; font-weight: 700;">Booking bekreftet!</h2>
              <p style="margin: 0; color: #6b7280; font-size: 16px;">Hei ${data.customerName}, din konsultasjon er booket.</p>
            </td>
          </tr>
          
          <!-- Booking Details Box -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-size: 14px;">Ordrenummer</span><br>
                          <span style="color: #1f2937; font-size: 16px; font-weight: 600;">#${data.orderNumber}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 14px;">Dato</span><br>
                          <span style="color: #1f2937; font-size: 16px; font-weight: 600;">${data.bookingDate}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 14px;">Tidspunkt</span><br>
                          <span style="color: #1f2937; font-size: 16px; font-weight: 600;">${data.bookingTime}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 14px;">Betalt</span><br>
                          <span style="color: #1f2937; font-size: 16px; font-weight: 600;">${data.totalAmount} kr</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- What's Next -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h3 style="margin: 0 0 16px; color: #1f2937; font-size: 18px; font-weight: 600;">Hva skjer nå?</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0; color: #4b5563; font-size: 15px;">
                    📅 Du vil motta en kalenderinvitasjon
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #4b5563; font-size: 15px;">
                    💻 Konsultasjonen gjennomføres via videomøte
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #4b5563; font-size: 15px;">
                    📧 Møtelenke sendes før avtalen
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <a href="https://kryptohjelpen.no/min-side" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Se mine bestillinger
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                Spørsmål? Kontakt oss på <a href="mailto:post@kryptohjelpen.no" style="color: #7c3aed; text-decoration: none;">post@kryptohjelpen.no</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2026 Kryptohjelpen.no - Teknisk veiledning, ikke investeringsråd
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: data.customerEmail,
        subject: `Booking bekreftet - ${data.bookingDate} kl ${data.bookingTime}`,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend error:', error);
      return { success: false, error };
    }

    console.log(`✅ Confirmation email sent to ${data.customerEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
