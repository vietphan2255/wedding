// Calendar + maps URL helpers shared by the formal invitation card (WeddingInvite)
// and the ceremony timeline (CeremonyTimeline). Pure functions, dependency-free.
//
// The config dates carry an explicit +07:00 offset. Calendar links convert to UTC
// (the ICS and Google Calendar formats both want UTC), while formatVnTime renders
// the Vietnam wall-clock time so it never shifts for visitors in other timezones.

const TZ = 'Asia/Ho_Chi_Minh'

// A Date → UTC basic form "YYYYMMDDTHHMMSSZ" (no separators), as both ICS and the
// Google Calendar TEMPLATE url expect.
function toBasicUtc(d) {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

// Google Maps "search" deep link for an address / place query.
export function mapsSearchUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query,
  )}`
}

// A downloadable ICS data-url for one event (Apple / Outlook / Google compatible).
export function buildIcs({ title, start, end, location, description }) {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Viet Nguyen Wedding//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@viet-nguyen-wedding`,
    `DTSTAMP:${toBasicUtc(new Date())}`,
    `DTSTART:${toBasicUtc(start)}`,
    `DTEND:${toBasicUtc(end)}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n')
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`
}

// A Google Calendar "create event" link with the event prefilled. start/end are Dates.
export function googleCalendarUrl({ title, start, end, location, details }) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || '',
    dates: `${toBasicUtc(start)}/${toBasicUtc(end)}`,
    location: location || '',
    details: details || '',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

// Vietnamese time-of-day word for a 0–23 hour. Tuned so 9:00 → "sáng" and the
// 18:00 banquet → "chiều", matching the labels these used to come from.
function vnPeriod(hour) {
  if (hour < 11) return 'sáng'
  if (hour < 13) return 'trưa'
  if (hour <= 18) return 'chiều'
  return 'tối'
}

// Format an ISO string or Date as the Vietnam wall-clock time, e.g. "9:00 sáng" /
// "6:00 chiều". Returns '' for missing or invalid input.
export function formatVnTime(value) {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: TZ,
  }).formatToParts(d)
  const hour = Number(parts.find((p) => p.type === 'hour').value)
  const minute = parts.find((p) => p.type === 'minute').value
  const h12 = hour % 12 === 0 ? 12 : hour % 12
  return `${h12}:${minute} ${vnPeriod(hour)}`
}
