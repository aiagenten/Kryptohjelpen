import { google } from 'googleapis';

let calendar: ReturnType<typeof google.calendar> | null = null;

function getCalendarClient() {
  if (calendar) return calendar;

  const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
  if (!credentialsJson) {
    console.warn('GOOGLE_CREDENTIALS_JSON not configured');
    return null;
  }

  try {
    const credentials = JSON.parse(
      Buffer.from(credentialsJson, 'base64').toString('utf-8')
    );

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    calendar = google.calendar({ version: 'v3', auth });
    console.log('✅ Google Calendar client initialized');
    return calendar;
  } catch (err) {
    console.error('❌ Failed to init Google Calendar:', err);
    return null;
  }
}

interface BookingDetails {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  bookingTime: string; // ISO string
  duration?: number; // minutes, default 60
  description?: string;
}

export async function createCalendarEvent(booking: BookingDetails): Promise<{ success: boolean; eventId?: string; eventLink?: string; error?: string }> {
  const cal = getCalendarClient();
  if (!cal) {
    return { success: false, error: 'Google Calendar not configured' };
  }

  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'kryptohjelpen.no@gmail.com';
  const duration = booking.duration || 60;
  
  const startTime = new Date(booking.bookingTime);
  const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

  const event = {
    summary: `Kryptohjelpen Konsultasjon - ${booking.customerName}`,
    description: `Booking fra Kryptohjelpen.no

Kunde: ${booking.customerName}
E-post: ${booking.customerEmail}
Telefon: ${booking.customerPhone || 'Ikke oppgitt'}

${booking.description || ''}

---
Automatisk opprettet etter Vipps-betaling`,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: 'Europe/Oslo',
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: 'Europe/Oslo',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
  };

  try {
    const response = await cal.events.insert({
      calendarId,
      requestBody: event,
      sendUpdates: 'none',
    });

    console.log('✅ Calendar event created:', response.data.htmlLink);
    return {
      success: true,
      eventId: response.data.id || undefined,
      eventLink: response.data.htmlLink || undefined,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Failed to create calendar event:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
