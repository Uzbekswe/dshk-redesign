const regionKeys = {
  "Toshkent shahar": "region.tashkentCity",
  "Toshkent viloyati": "region.tashkentRegion",
  "Andijon viloyati": "region.andijan",
  "Buxoro viloyati": "region.bukhara",
  "Farg'ona viloyati": "region.fergana",
  "Farg‘ona viloyati": "region.fergana",
  "Jizzax viloyati": "region.jizzakh",
  "Namangan viloyati": "region.namangan",
  "Navoiy viloyati": "region.navoi",
  "Qashqadaryo viloyati": "region.kashkadarya",
  "Qoraqalpog'iston Respublikasi": "region.karakalpakstan",
  "Qoraqalpog‘iston Respublikasi": "region.karakalpakstan",
  "Samarqand viloyati": "region.samarkand",
  "Sirdaryo viloyati": "region.syrdarya",
  "Surxondaryo viloyati": "region.surxandarya",
  "Xorazm viloyati": "region.khorezm",
  "Boshqa hududlar": "region.other"
};

const typeKeys = {
  "Turar-joy majmuasi": "type.residentialComplex",
  "Turar-joy": "type.residential",
  "Noturar-joy": "type.nonResidential",
  Bino: "type.building",
  "Umumta’lim maktabi": "type.school",
  "Umumta'lim maktabi": "type.school",
  "Maktabgacha ta’lim": "type.preschool",
  "Sport inshooti": "type.sport",
  "Suv ta’minoti": "type.water",
  "Yo‘l infratuzilmasi": "type.road",
  "Tibbiyot muassasasi": "type.medical",
  "Madaniyat obyekti": "type.culture",
  "Jamoat binosi": "type.public",
  "Issiqlik ta’minoti": "type.heating",
  "Elektr tarmog‘i": "type.electric",
  "Gaz tarmog‘i": "type.gas",
  "Ta’lim muassasasi": "type.education",
  "Boshqa obyekt": "type.other"
};

const statusKeys = {
  progress: "status.progress",
  frozen: "status.frozen",
  stopped: "status.stopped",
  completed: "status.completed",
  unknown: "status.unknown"
};

export function regionName(t, name) {
  const key = regionKeys[name];
  return key ? t(key) : name || t("common.na");
}

export function objectType(t, type) {
  const key = typeKeys[type];
  return key ? t(key) : type || t("type.other");
}

export function statusKey(object) {
  if (object?.statusKey) return object.statusKey;
  const status = object?.status || "";
  if (status === "Jarayonda") return "progress";
  if (status === "Muzlatilgan") return "frozen";
  if (status === "To‘xtatilgan" || status === "To'xtatilgan") return "stopped";
  if (status === "Topshirilgan") return "completed";
  return "unknown";
}

export function statusLabel(t, object) {
  return t(statusKeys[statusKey(object)] || statusKeys.unknown);
}

const localeMap = { uz: "uz-UZ", ru: "ru-RU", en: "en-GB" };

export function fmtInt(value, lang = "uz") {
  if (value === null || value === undefined || value === "") return "—";
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  return new Intl.NumberFormat(localeMap[lang] || localeMap.uz, {
    maximumFractionDigits: 0
  }).format(number);
}

export function fmtArea(value, lang = "uz") {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return null;
  const digits = number < 100 ? 1 : 0;
  return new Intl.NumberFormat(localeMap[lang] || localeMap.uz, {
    maximumFractionDigits: digits
  }).format(number);
}

function dateParts(value) {
  if (!value) return null;
  const match = String(value)
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!match) return null;
  return {
    year: match[1],
    month: match[2],
    day: match[3],
    hour: match[4],
    minute: match[5]
  };
}

export function fmtDate(value) {
  const parts = dateParts(value);
  if (!parts) return value ? String(value) : null;
  return `${parts.day}.${parts.month}.${parts.year}`;
}

export function fmtDateTime(value) {
  const parts = dateParts(value);
  if (!parts) return value ? String(value) : null;
  const date = `${parts.day}.${parts.month}.${parts.year}`;
  return parts.hour ? `${date}, ${parts.hour}:${parts.minute}` : date;
}

export function pluralUnit(t, count, key) {
  return `${fmtInt(count)} ${t(key)}`;
}

export function shortText(value, max = 90) {
  if (!value) return "";
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

export function googleMapsUrl(lat, lon) {
  if (!lat || !lon) return null;
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
}
