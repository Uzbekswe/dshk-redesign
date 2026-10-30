import demo from "../data/demo.json";
import registryData from "../data/registry.json";

export const constructionObjects = demo.construction;
export const illegalObjects = registryData;
export const stats = demo.stats;
export const examples = demo.examples;
export const regionStats = demo.regionStats;
export const illegalRegionStats = demo.illegalRegionStats;

const constructionById = new Map(constructionObjects.map((item) => [String(item.id), item]));
const illegalById = new Map(illegalObjects.map((item) => [String(item.id), item]));

const constructionHaystack = new Map();
const illegalHaystack = new Map();

const clean = (value) =>
  String(value ?? "")
    .toLocaleLowerCase("uz-UZ")
    .replace(/[’‘ʻʼ`´]/g, "'")
    .replace(/[«»“”"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const digitsOnly = (value) => String(value ?? "").replace(/\D/g, "");

const constructionText = (item) =>
  clean(
    [
      item.name,
      item.shortName,
      item.address,
      item.district,
      item.region,
      item.organization,
      item.sphere,
      item.type,
      item.reestr
    ].join(" ")
  );

const illegalText = (item) =>
  clean(
    [
      item.address,
      item.district,
      item.region,
      item.purpose,
      item.type,
      item.decision,
      item.protocol,
      item.id,
      item.danId
    ].join(" ")
  );

function getConstructionHaystack(item) {
  if (!constructionHaystack.has(item.id)) {
    constructionHaystack.set(item.id, constructionText(item));
  }
  return constructionHaystack.get(item.id);
}

function getIllegalHaystack(item) {
  if (!illegalHaystack.has(item.id)) {
    illegalHaystack.set(item.id, illegalText(item));
  }
  return illegalHaystack.get(item.id);
}

export function getConstruction(id) {
  return constructionById.get(String(id)) || null;
}

export function getIllegal(id) {
  return illegalById.get(String(id)) || null;
}

export function getObject(kind, id) {
  return kind === "illegal" ? getIllegal(id) : getConstruction(id);
}

export function exactMatch(raw) {
  const q = clean(raw);
  if (!q) return null;
  const digits = digitsOnly(q);

  const construction = constructionObjects.find((item) => {
    if (clean(item.reestr) === q) return true;
    if (item.cadastral && clean(item.cadastral) === q) return true;
    if (item.cadastral && digits.length >= 6 && digitsOnly(item.cadastral) === digits) return true;
    return false;
  });
  if (construction) return { kind: "construction", id: construction.id };

  if (digits.length >= 3) {
    const illegal = illegalObjects.find(
      (item) => String(item.id) === digits || String(item.danId) === digits
    );
    if (illegal) return { kind: "illegal", id: illegal.id };
  }

  return null;
}

function tokenScore(haystack, tokens) {
  let score = 0;
  for (const token of tokens) {
    const index = haystack.indexOf(token);
    if (index === -1) return -1;
    if (index === 0) score += 8;
    else if (haystack[index - 1] === " ") score += 5;
    else score += 2;
  }
  return score;
}

function searchNumber(raw) {
  const q = clean(raw);
  const digits = digitsOnly(q);
  if (!q) return { construction: [], illegal: [] };
  const constructions = [];
  const illegals = [];

  for (const item of constructionObjects) {
    let score = -1;
    if (clean(item.reestr) === q) score = 100;
    else if (digits.length >= 3 && clean(item.reestr).includes(digits)) score = 60;
    if (item.cadastral) {
      if (clean(item.cadastral) === q) score = Math.max(score, 110);
      else if (digits.length >= 3 && digitsOnly(item.cadastral).includes(digits)) {
        score = Math.max(score, 55);
      }
    }
    if (score >= 0) constructions.push({ item, score });
  }

  for (const item of illegalObjects) {
    let score = -1;
    if (digits.length >= 2 && String(item.id) === digits) score = 100;
    else if (digits.length >= 3 && String(item.danId) === digits) score = 95;
    else if (digits.length >= 3 && String(item.id).startsWith(digits)) score = 50;
    else if (q.length >= 4 && clean(item.decision).includes(q)) score = 40;
    else if (q.length >= 4 && clean(item.protocol).includes(q)) score = 40;
    if (score >= 0) illegals.push({ item, score });
  }

  constructions.sort((a, b) => b.score - a.score);
  illegals.sort((a, b) => b.score - a.score);

  return {
    construction: constructions.slice(0, 30).map((entry) => entry.item),
    illegal: illegals.slice(0, 40).map((entry) => entry.item)
  };
}

function searchText(raw, kind) {
  const q = clean(raw);
  const tokens = q.split(" ").filter((token) => token.length >= 2);
  if (!tokens.length) return { construction: [], illegal: [] };
  const constructions = [];
  const illegals = [];

  for (const item of constructionObjects) {
    const score = tokenScore(getConstructionHaystack(item), tokens);
    if (score >= 0) {
      const boost = kind === "name" && clean(item.name).includes(q) ? 20 : 0;
      constructions.push({ item, score: score + boost });
    }
  }

  for (const item of illegalObjects) {
    const score = tokenScore(getIllegalHaystack(item), tokens);
    if (score >= 0) {
      const boost = kind === "address" && clean(item.address).includes(q) ? 20 : 0;
      illegals.push({ item, score: score + boost });
    }
  }

  constructions.sort((a, b) => b.score - a.score);
  illegals.sort((a, b) => b.score - a.score);

  return {
    construction: constructions.slice(0, 30).map((entry) => entry.item),
    illegal: illegals.slice(0, 40).map((entry) => entry.item)
  };
}

export function searchAll(raw, kind = "number") {
  const value = String(raw ?? "").trim();
  if (!value) {
    return { construction: [], illegal: [], total: 0 };
  }

  const result =
    kind === "number"
      ? searchNumber(value)
      : searchText(value, kind);

  return {
    ...result,
    total: result.construction.length + result.illegal.length
  };
}

export function relaxedSearch(raw) {
  const text = searchText(raw, "address");
  const names = searchText(raw, "name");
  const construction = [...text.construction];
  const illegal = [...text.illegal];

  for (const item of names.construction) {
    if (!construction.some((entry) => entry.id === item.id)) construction.push(item);
  }
  for (const item of names.illegal) {
    if (!illegal.some((entry) => entry.id === item.id)) illegal.push(item);
  }

  return {
    construction: construction.slice(0, 30),
    illegal: illegal.slice(0, 40),
    total: construction.length + illegal.length
  };
}

export function allIllegalTypes() {
  return [...new Set(illegalObjects.map((item) => item.type).filter(Boolean))].sort();
}

export function allIllegalDistricts(region) {
  return [
    ...new Set(
      illegalObjects
        .filter((item) => !region || item.region === region)
        .map((item) => item.district)
        .filter(Boolean)
    )
  ].sort();
}

export const regions = [
  "Toshkent shahar",
  "Toshkent viloyati",
  "Andijon viloyati",
  "Buxoro viloyati",
  "Farg'ona viloyati",
  "Jizzax viloyati",
  "Namangan viloyati",
  "Navoiy viloyati",
  "Qashqadaryo viloyati",
  "Qoraqalpog'iston Respublikasi",
  "Samarqand viloyati",
  "Sirdaryo viloyati",
  "Surxondaryo viloyati",
  "Xorazm viloyati"
];
