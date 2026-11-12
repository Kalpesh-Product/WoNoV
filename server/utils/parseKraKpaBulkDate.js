const MONTHS = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

const parseKraKpaBulkDate = (value) => {
  if (typeof value !== "string") return null;
  const text = value.trim();
  let year;
  let month;
  let day;

  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    year = Number(iso[1]);
    month = Number(iso[2]);
    day = Number(iso[3]);
  } else {
    const match = text.match(/^(\d{2})-(\d{2}|[A-Za-z]+)-(\d{2}|\d{4})$/);
    if (!match) return null;
    day = Number(match[1]);
    month = /^\d{2}$/.test(match[2]) ? Number(match[2]) : MONTHS[match[2].toLowerCase()];
    year = Number(match[3]) + (match[3].length === 2 ? 2000 : 0);
  }

  if (!Number.isInteger(month) || month < 1 || month > 12 || year < 1 || year > 9999) return null;
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day ? date : null;
};

module.exports = parseKraKpaBulkDate;
