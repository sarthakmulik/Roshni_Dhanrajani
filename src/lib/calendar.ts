/**
 * Utility to generate calendar invites and redirect links for Google and Apple/Outlook calendars.
 */

// Helper to format Date to Google calendar format (YYYYMMDDTHHmmssZ)
const formatGoogleDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Helper to format Date to ICS format (YYYYMMDDTHHmmssZ)
const formatIcsDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generates a Google Calendar redirection link.
 */
export const getGoogleCalendarUrl = (
  title: string,
  description: string,
  dateStr: string,
  location: string,
  durationMinutes = 60
): string => {
  try {
    const start = new Date(dateStr);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    const dates = `${formatGoogleDate(start)}/${formatGoogleDate(end)}`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
  } catch (err) {
    console.error('Error generating Google Calendar URL:', err);
    return '#';
  }
}

/**
 * Generates and triggers download of an .ics file (Apple, Outlook, etc.).
 */
export const downloadIcsFile = (
  title: string,
  description: string,
  dateStr: string,
  location: string,
  durationMinutes = 60
): void => {
  try {
    const start = new Date(dateStr);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    const stamp = formatIcsDate(new Date());

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Pulse It Out//Booking Confirmation//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${start.getTime()}@pulseitout.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${formatIcsDate(start)}`,
      `DTEND:${formatIcsDate(end)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
      `LOCATION:${location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_session.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error downloading ICS file:', err);
  }
}
