interface CalendarEvent {
  calendar: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
}

const CALENDARS = {
  'AI Agenten': process.env.CALENDAR_AIAGENTEN!,
  'Kryptohjelpen': process.env.CALENDAR_KRYPTOHJELPEN!,
  'Family': process.env.CALENDAR_FAMILY!,
};

// Simple iCal parser
function parseIcal(icalData: string, calendarName: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const eventBlocks = icalData.split('BEGIN:VEVENT');

  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i].split('END:VEVENT')[0];
    
    const getField = (name: string): string | null => {
      const regex = new RegExp(`^${name}[;:](.*)$`, 'im');
      const match = block.match(regex);
      if (match) {
        // Handle line continuations
        let value = match[1];
        // Remove TZID parameter if present
        if (value.includes(':')) {
          value = value.split(':').pop() || value;
        }
        return value.trim();
      }
      return null;
    };

    const parseDate = (dateStr: string | null): Date | null => {
      if (!dateStr) return null;
      // Handle format: 20260131T100000Z or 20260131T100000
      const cleaned = dateStr.replace(/[^0-9TZ]/g, '');
      if (cleaned.length >= 8) {
        const year = parseInt(cleaned.substring(0, 4));
        const month = parseInt(cleaned.substring(4, 6)) - 1;
        const day = parseInt(cleaned.substring(6, 8));
        let hour = 0, min = 0, sec = 0;
        
        if (cleaned.includes('T') && cleaned.length >= 15) {
          const timeStart = cleaned.indexOf('T') + 1;
          hour = parseInt(cleaned.substring(timeStart, timeStart + 2));
          min = parseInt(cleaned.substring(timeStart + 2, timeStart + 4));
          sec = parseInt(cleaned.substring(timeStart + 4, timeStart + 6)) || 0;
        }

        if (cleaned.endsWith('Z')) {
          return new Date(Date.UTC(year, month, day, hour, min, sec));
        }
        return new Date(year, month, day, hour, min, sec);
      }
      return null;
    };

    const summary = getField('SUMMARY');
    const dtstart = getField('DTSTART');
    const dtend = getField('DTEND');
    const location = getField('LOCATION');

    const start = parseDate(dtstart);
    const end = parseDate(dtend);

    if (summary && start) {
      events.push({
        calendar: calendarName,
        title: summary,
        start,
        end: end || new Date(start.getTime() + 60 * 60 * 1000), // Default 1 hour
        location: location || undefined,
      });
    }
  }

  return events;
}

export async function getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
  const allEvents: CalendarEvent[] = [];

  for (const [name, url] of Object.entries(CALENDARS)) {
    if (!url) continue;

    try {
      const response = await fetch(url, { next: { revalidate: 300 } }); // Cache 5 min
      if (!response.ok) continue;
      
      const icalData = await response.text();
      const events = parseIcal(icalData, name);

      // Filter events within date range
      for (const event of events) {
        if (event.start < endDate && event.end > startDate) {
          allEvents.push(event);
        }
      }
    } catch (err) {
      console.error(`Error fetching calendar ${name}:`, err);
    }
  }

  return allEvents.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export async function checkAvailability(start: Date, end: Date): Promise<{ available: boolean; conflicts: CalendarEvent[] }> {
  const events = await getEvents(start, end);
  return {
    available: events.length === 0,
    conflicts: events,
  };
}

export async function findAvailableSlots(durationMinutes: number = 60, count: number = 3, offset: number = 0): Promise<{ start: Date; end: Date }[]> {
  const allSlots = await findNextAvailableSlots(durationMinutes, count + offset);
  return allSlots.slice(offset, offset + count);
}

export async function findNextAvailableSlots(durationMinutes: number = 60, count: number = 3): Promise<{ start: Date; end: Date }[]> {
  const slots: { start: Date; end: Date }[] = [];
  const now = new Date();
  const slotsPerDay = new Map<string, number>(); // Track slots per day

  // Minimum 1 day buffer - no same-day bookings
  // Start from tomorrow at 11:00
  const checkTime = new Date(now);
  checkTime.setDate(checkTime.getDate() + 1); // Always start from tomorrow
  checkTime.setHours(11, 0, 0, 0); // First slot at 11:00

  // Get events for next 14 days
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 14);
  const events = await getEvents(now, endDate);

  // Find 3 available slots over 2-3 days (max 2 per day)
  let attempts = 0;
  while (slots.length < count && attempts < 50) {
    attempts++;

    // Skip weekends
    if (checkTime.getDay() === 0 || checkTime.getDay() === 6) {
      checkTime.setDate(checkTime.getDate() + 1);
      checkTime.setHours(10, 0, 0, 0);
      continue;
    }

    // Only check business hours (11-16)
    if (checkTime.getHours() < 11) {
      checkTime.setHours(11, 0, 0, 0);
      continue;
    }
    if (checkTime.getHours() >= 16) {
      checkTime.setDate(checkTime.getDate() + 1);
      checkTime.setHours(11, 0, 0, 0);
      continue;
    }

    const dateKey = checkTime.toDateString();
    const daySlots = slotsPerDay.get(dateKey) || 0;
    
    // Max 2 slots per day
    if (daySlots >= 2) {
      checkTime.setDate(checkTime.getDate() + 1);
      checkTime.setHours(11, 0, 0, 0);
      continue;
    }

    const slotEnd = new Date(checkTime.getTime() + durationMinutes * 60 * 1000);

    // Check if this slot conflicts with any event
    const hasConflict = events.some(event =>
      checkTime < event.end && slotEnd > event.start
    );

    if (!hasConflict) {
      slots.push({ start: new Date(checkTime), end: slotEnd });
      slotsPerDay.set(dateKey, daySlots + 1);
      // Skip 2 hours to spread out suggestions
      checkTime.setHours(checkTime.getHours() + 3);
    } else {
      checkTime.setHours(checkTime.getHours() + 1);
    }
  }

  return slots;
}

export function formatSlots(slots: { start: Date; end: Date }[]): string {
  return slots
    .map((slot, i) => {
      const dateOpts: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      };
      const timeOpts: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
      };
      const date = slot.start.toLocaleDateString('nb-NO', dateOpts);
      const startTime = slot.start.toLocaleTimeString('nb-NO', timeOpts);
      const endTime = slot.end.toLocaleTimeString('nb-NO', timeOpts);
      return `${i + 1}. ${date} kl. ${startTime} - ${endTime}`;
    })
    .join('\n');
}
