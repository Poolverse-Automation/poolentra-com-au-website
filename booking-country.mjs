import { countryTimeZones } from './country-timezone-data.mjs';

const canonical = (zone) => {
  try {
    return new Intl.DateTimeFormat('en', { timeZone: zone }).resolvedOptions().timeZone;
  } catch {
    return null;
  }
};
let names;
try {
  names = new Intl.DisplayNames(['en'], { type: 'region' });
} catch {
  /* Use IANA names. */
}
export const countries = countryTimeZones
  .map((country) => ({
    ...country,
    label: names?.of(country.code) ?? country.name,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const normalize = (value) =>
  value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
export function findCountry(value) {
  const query = normalize(value);
  const aliases = { uk: 'GB', usa: 'US', 'united states of america': 'US', 'viet nam': 'VN' };
  return (
    countries.find(
      (country) =>
        country.code === aliases[query] ||
        [country.code, country.label, country.name].some((name) => normalize(name) === query),
    ) ?? null
  );
}

export function countryForZone(zone) {
  if (!zone) return null;
  const exact = countries.filter((country) => country.zones.includes(zone));
  if (exact.length === 1) return exact[0];
  const normalized = canonical(zone);
  if (!normalized) return null;
  const matches = countries.filter((country) =>
    country.zones.some((value) => canonical(value) === normalized),
  );
  // Shared aliases must not guess the visitor's country.
  return matches.length === 1 ? matches[0] : null;
}

export function zoneForCountry(country, deviceZone) {
  if (!country) return '';
  if (country.zones.length === 1) return canonical(country.zones[0]) ? country.zones[0] : '';
  if (deviceZone && canonical(deviceZone)) {
    return country.zones.find((zone) => canonical(zone) === canonical(deviceZone)) ?? '';
  }
  return '';
}

export function zoneLabel(zone) {
  return `${zone.split('/').slice(1).join(' / ').replaceAll('_', ' ')} (${zone.replaceAll('_', ' ')})`;
}
