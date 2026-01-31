/**
 * Apple Calendar Integration via AppleScript
 * Manages booking availability and event creation
 */
const { execSync } = require('child_process');

class CalendarService {
  constructor(options = {}) {
    // Calendars to check for conflicts
    this.calendars = options.calendars || ['Hjem', 'Arbeid', 'Family'];
    
    // Business hours (Norwegian time)
    this.businessHours = options.businessHours || {
      start: 9,  // 09:00
      end: 17    // 17:00
    };
    
    // Slot duration in minutes
    this.slotDuration = options.slotDuration || 60;
    
    // Buffer between appointments (minutes)
    this.buffer = options.buffer || 15;
    
    // Days to look ahead
    this.lookAheadDays = options.lookAheadDays || 14;
    
    // Calendar to create events in
    this.bookingCalendar = options.bookingCalendar || 'Arbeid';
  }

  /**
   * Execute AppleScript and return result
   */
  runAppleScript(script) {
    try {
      const result = execSync(`osascript -e '${script.replace(/'/g, "'\\''")}'`, {
        encoding: 'utf8',
        timeout: 30000
      });
      return result.trim();
    } catch (error) {
      console.error('AppleScript error:', error.message);
      throw new Error('Calendar access failed');
    }
  }

  /**
   * Get all events from specified calendars within a date range
   */
  getEventsInRange(startDate, endDate) {
    const calendarList = this.calendars.map(c => `"${c}"`).join(', ');
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Use programmatic date construction to avoid locale issues
    const script = `
set startDate to current date
set day of startDate to ${start.getDate()}
set month of startDate to ${start.getMonth() + 1}
set year of startDate to ${start.getFullYear()}
set hours of startDate to ${start.getHours()}
set minutes of startDate to ${start.getMinutes()}
set seconds of startDate to 0

set endDate to current date
set day of endDate to ${end.getDate()}
set month of endDate to ${end.getMonth() + 1}
set year of endDate to ${end.getFullYear()}
set hours of endDate to ${end.getHours()}
set minutes of endDate to ${end.getMinutes()}
set seconds of endDate to 0

set eventList to ""
set calNames to {${calendarList}}

tell application "Calendar"
    repeat with calName in calNames
        try
            set theCal to calendar calName
            set theEvents to (every event of theCal whose start date ≥ startDate and start date ≤ endDate)
            repeat with evt in theEvents
                set evtStart to start date of evt
                set evtEnd to end date of evt
                set evtSummary to summary of evt
                set eventList to eventList & (year of evtStart as string) & "-" & my pad(month of evtStart as integer) & "-" & my pad(day of evtStart) & "T" & my pad(hours of evtStart) & ":" & my pad(minutes of evtStart) & "|"
                set eventList to eventList & (year of evtEnd as string) & "-" & my pad(month of evtEnd as integer) & "-" & my pad(day of evtEnd) & "T" & my pad(hours of evtEnd) & ":" & my pad(minutes of evtEnd) & "|"
                set eventList to eventList & evtSummary & "\\n"
            end repeat
        end try
    end repeat
end tell

on pad(n)
    if n < 10 then
        return "0" & (n as string)
    else
        return n as string
    end if
end pad

return eventList
    `;

    const result = this.runAppleScript(script);
    return this.parseEventList(result);
  }

  /**
   * Parse event list from AppleScript output
   */
  parseEventList(output) {
    if (!output || output.trim() === '') return [];
    
    const events = [];
    const lines = output.split('\\n').filter(l => l.trim());
    
    for (const line of lines) {
      const parts = line.split('|');
      if (parts.length >= 2) {
        events.push({
          start: new Date(parts[0]),
          end: new Date(parts[1]),
          summary: parts[2] || 'Busy'
        });
      }
    }
    
    return events;
  }

  /**
   * Format date for AppleScript (Norwegian locale compatible)
   * Uses numeric format that works across locales
   */
  formatDateForAppleScript(date) {
    const d = new Date(date);
    // Format: "31/01/2026 09:00:00" - works with Norwegian locale
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${day}.${month}.${year} kl. ${hours}:${minutes}:00`;
  }

  /**
   * Check if a specific time slot is available
   */
  isSlotAvailable(slotStart, slotEnd, events) {
    for (const event of events) {
      // Check for overlap
      if (slotStart < event.end && slotEnd > event.start) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if date is a weekday
   */
  isWeekday(date) {
    const day = date.getDay();
    return day !== 0 && day !== 6; // Not Sunday (0) or Saturday (6)
  }

  /**
   * Get available time slots for the next N days
   */
  async getAvailableSlots(options = {}) {
    const daysAhead = options.days || this.lookAheadDays;
    const slotsPerDay = options.slotsPerDay || 10;
    
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + daysAhead);
    
    // Get all existing events
    let events = [];
    try {
      events = this.getEventsInRange(startDate, endDate);
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      // Continue with empty events list (show all slots as available)
    }
    
    const availableSlots = [];
    
    // Iterate through each day
    for (let day = 0; day < daysAhead; day++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(currentDay.getDate() + day);
      
      // Skip weekends
      if (!this.isWeekday(currentDay)) continue;
      
      // Skip today if it's past business hours
      if (day === 0 && now.getHours() >= this.businessHours.end - 1) continue;
      
      const daySlots = [];
      
      // Generate time slots for this day
      for (let hour = this.businessHours.start; hour < this.businessHours.end; hour++) {
        // Skip if this is today and the hour has passed
        if (day === 0 && hour <= now.getHours()) continue;
        
        const slotStart = new Date(currentDay);
        slotStart.setHours(hour, 0, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + this.slotDuration);
        
        // Check if slot is available
        if (this.isSlotAvailable(slotStart, slotEnd, events)) {
          daySlots.push({
            date: currentDay.toISOString().split('T')[0],
            time: `${String(hour).padStart(2, '0')}:00`,
            datetime: slotStart.toISOString(),
            displayDate: this.formatDisplayDate(currentDay),
            displayTime: `${String(hour).padStart(2, '0')}:00 - ${String(hour + 1).padStart(2, '0')}:00`
          });
        }
      }
      
      if (daySlots.length > 0) {
        availableSlots.push({
          date: currentDay.toISOString().split('T')[0],
          displayDate: this.formatDisplayDate(currentDay),
          dayName: this.getDayName(currentDay),
          slots: daySlots
        });
      }
    }
    
    return availableSlots;
  }

  /**
   * Get primary slot + 2 alternatives
   */
  async getRecommendedSlots() {
    const allSlots = await this.getAvailableSlots({ days: 14 });
    const recommended = [];
    
    // Flatten all slots
    const flatSlots = [];
    for (const day of allSlots) {
      for (const slot of day.slots) {
        flatSlots.push({
          ...slot,
          dayName: day.dayName
        });
      }
    }
    
    // Get primary (first available) and 2 alternatives
    if (flatSlots.length >= 1) {
      recommended.push({ ...flatSlots[0], type: 'primary' });
    }
    if (flatSlots.length >= 2) {
      recommended.push({ ...flatSlots[1], type: 'alternative' });
    }
    if (flatSlots.length >= 3) {
      // Pick a slot from a different day if possible
      const differentDay = flatSlots.find(s => s.date !== flatSlots[0].date && s.date !== flatSlots[1].date);
      recommended.push({ ...(differentDay || flatSlots[2]), type: 'alternative' });
    }
    
    return recommended;
  }

  /**
   * Format date for display (Norwegian)
   */
  formatDisplayDate(date) {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('nb-NO', options);
  }

  /**
   * Get day name in Norwegian
   */
  getDayName(date) {
    const days = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
    return days[date.getDay()];
  }

  /**
   * Create calendar event for confirmed booking
   */
  createBookingEvent(booking) {
    const { customer_name, customer_email, customer_phone, booking_date, booking_time } = booking;
    
    const startDateTime = new Date(`${booking_date}T${booking_time}:00`);
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + this.slotDuration);
    
    const summary = `Konsultasjon: ${customer_name}`;
    const notes = `Kunde: ${customer_name}\\nE-post: ${customer_email}\\nTelefon: ${customer_phone}\\n\\nBetalt via Kryptohjelpen.no\\nPris: 1490 NOK`;

    const script = `
set startDate to current date
set day of startDate to ${startDateTime.getDate()}
set month of startDate to ${startDateTime.getMonth() + 1}
set year of startDate to ${startDateTime.getFullYear()}
set hours of startDate to ${startDateTime.getHours()}
set minutes of startDate to ${startDateTime.getMinutes()}
set seconds of startDate to 0

set endDate to current date
set day of endDate to ${endDateTime.getDate()}
set month of endDate to ${endDateTime.getMonth() + 1}
set year of endDate to ${endDateTime.getFullYear()}
set hours of endDate to ${endDateTime.getHours()}
set minutes of endDate to ${endDateTime.getMinutes()}
set seconds of endDate to 0

tell application "Calendar"
    tell calendar "${this.bookingCalendar}"
        set newEvent to make new event with properties {summary:"${summary.replace(/"/g, '\\"')}", start date:startDate, end date:endDate, description:"${notes.replace(/"/g, '\\"')}"}
        return uid of newEvent
    end tell
end tell
    `;

    try {
      const eventId = this.runAppleScript(script);
      return { success: true, eventId };
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete calendar event (for cancelled bookings)
   */
  deleteBookingEvent(eventId) {
    if (!eventId) return { success: false, error: 'No event ID' };

    const script = `
tell application "Calendar"
    tell calendar "${this.bookingCalendar}"
        try
            delete (first event whose uid is "${eventId}")
            return "deleted"
        on error
            return "not found"
        end try
    end tell
end tell
    `;

    try {
      const result = this.runAppleScript(script);
      return { success: result === 'deleted' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = CalendarService;
