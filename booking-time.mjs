// Slot identity is always an absolute instant. Timezone changes affect display only.
export function validTimeZone(value) {
  if (typeof value !== 'string' || value.length > 100) return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone: value }).format(0);
    return true;
  } catch {
    return false;
  }
}

export function detectTimeZone(intl = Intl) {
  try {
    const zone = intl.DateTimeFormat().resolvedOptions().timeZone;
    return validTimeZone(zone) ? (zone === 'Asia/Saigon' ? 'Asia/Ho_Chi_Minh' : zone) : null;
  } catch {
    return null;
  }
}

export function localDateKey(instant, timeZone) {
  if (!validTimeZone(timeZone)) throw new Error('Choose a valid time zone.');
  const parts = new Intl.DateTimeFormat('en', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(instant));
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function displaySlot(slot, timeZone, locale = 'en') {
  if (!validTimeZone(timeZone)) throw new Error('Choose a valid time zone.');
  const start = new Date(slot.start);
  const end = new Date(slot.end);
  if (!Number.isFinite(+start) || !Number.isFinite(+end) || end <= start)
    throw new Error('Invalid appointment time.');
  const date = new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(start);
  const time = new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'shortOffset',
  });
  const endDate =
    localDateKey(start, timeZone) === localDateKey(end, timeZone)
      ? ''
      : new Intl.DateTimeFormat(locale, {
          timeZone,
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(end) + ', ';
  return {
    dateKey: localDateKey(start, timeZone),
    date,
    time: time.format(start),
    timeRange: `${time.format(start)} – ${endDate}${time.format(end)}`,
    summary: `${date}, ${time.format(start)} – ${endDate}${time.format(end)} (${timeZone.replaceAll('_', ' ')})`,
  };
}

export function groupSlots(slots, timeZone, now = Date.now()) {
  const groups = new Map();
  for (const slot of [...slots].sort((a, b) => Date.parse(a.start) - Date.parse(b.start))) {
    if (Date.parse(slot.start) <= now) continue;
    const label = displaySlot(slot, timeZone);
    const group = groups.get(label.dateKey) ?? { date: label.date, slots: [] };
    group.slots.push({ ...slot, label });
    groups.set(label.dateKey, group);
  }
  return [...groups.entries()].map(([dateKey, group]) => ({ dateKey, ...group }));
}
