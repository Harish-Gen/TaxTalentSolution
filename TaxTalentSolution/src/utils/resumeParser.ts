// =====================================================
// LinkedIn PDF Resume Parser
// Parses text extracted from LinkedIn PDF exports
// =====================================================

export interface ParsedExperience {
  company: string;
  position: string;
  startDate: string; // ISO "YYYY-MM-DD" or raw string
  endDate: string;
  isCurrent: boolean;
  location?: string;
  description?: string;
}

export interface ParsedEducation {
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
}

export interface ParsedCandidate {
  name: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  locationCity: string;
  locationState: string;
  locationCountry: string;
  headline: string;
  summary: string;
  skills: string[];
  certifications: string[];
  experience: ParsedExperience[];
  education: ParsedEducation[];
  experienceYears: number;
  rawText: string;
}

// ---- Helpers ----

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_PATTERN = MONTHS.join('|');
const DATE_RANGE_RE = new RegExp(
  `^(${MONTH_PATTERN})\\s+\\d{4}\\s*[-–]\\s*(?:${MONTH_PATTERN}\\s+\\d{4}|Present)`,
  'i'
);
const DURATION_RE = /^\d+\s+years?(?:\s+\d+\s+months?)?$|^\d+\s+months?$/i;

function isDateRange(line: string): boolean {
  return DATE_RANGE_RE.test(line.replace(/\(.*?\)/g, '').trim());
}

function isDuration(line: string): boolean {
  return DURATION_RE.test(line.trim());
}

function parseMonthYear(str: string): string {
  const parts = str.trim().split(/\s+/);
  if (parts.length >= 2) {
    const idx = MONTHS.findIndex(m => m.toLowerCase() === parts[0].toLowerCase());
    if (idx >= 0) return `${parts[1]}-${String(idx + 1).padStart(2, '0')}-01`;
  }
  return str;
}

function parseDateRange(line: string): { start: string; end: string; isCurrent: boolean } {
  const clean = line.replace(/\(.*?\)/g, '').trim();
  const [startPart = '', endPart = ''] = clean.split(/\s*[-–]\s*/);
  const isCurrent = /present/i.test(endPart);
  return {
    start: parseMonthYear(startPart.trim()),
    end: isCurrent ? '' : parseMonthYear(endPart.trim()),
    isCurrent,
  };
}

// ---- Main parser ----

export function parseLinkedInPDF(rawText: string): ParsedCandidate {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Section indices (LinkedIn PDF always uses these exact headings)
  const topSkillsIdx = lines.indexOf('Top Skills');
  const certificationsIdx = lines.indexOf('Certifications');
  const summaryIdx = lines.indexOf('Summary');
  const experienceIdx = lines.indexOf('Experience');
  const educationIdx = lines.indexOf('Education');

  // ---- Email ----
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  // ---- LinkedIn URL ----
  let linkedinUrl = '';
  const liLineIdx = lines.findIndex(l => l.includes('linkedin.com/in/'));
  if (liLineIdx >= 0) {
    let urlStr = lines[liLineIdx];
    // LinkedIn PDFs sometimes break the URL across a line
    for (let i = liLineIdx + 1; i < Math.min(liLineIdx + 4, lines.length); i++) {
      if (lines[i].includes('(LinkedIn)') || lines[i].includes('@') || lines[i].startsWith('(')) break;
      if (lines[i].length < 80) urlStr += lines[i];
    }
    urlStr = urlStr.replace(/\s+/g, '').split('(LinkedIn)')[0];
    if (!urlStr.startsWith('http')) urlStr = 'https://' + urlStr;
    linkedinUrl = urlStr;
  }

  // ---- Name ----
  let name = '';
  const contactLineIdx = lines.findIndex(l => l.startsWith('Contact '));
  if (contactLineIdx >= 0) {
    const afterContact = lines[contactLineIdx].replace(/^Contact\s+/, '');
    // Strip post-name credentials: "Sarita Rochwani, PCC-ICF," → "Sarita Rochwani"
    const commaIdx = afterContact.indexOf(',');
    name = (commaIdx >= 0 ? afterContact.slice(0, commaIdx) : afterContact).trim();
  }

  // ---- Location ----
  let locationCity = '', locationState = '', locationCountry = '';
  const locSearchEnd = topSkillsIdx > 0 ? topSkillsIdx : (summaryIdx > 0 ? summaryIdx : Math.min(25, lines.length));
  for (let i = 0; i < locSearchEnd; i++) {
    const l = lines[i];
    if (l.includes('@') || l.includes('linkedin') || l.startsWith('Contact') || l.includes('|')) continue;
    const m = l.match(/^([^,|]+),\s+([^,|]+),\s+([^,|]+)$/);
    if (m) {
      locationCity = m[1].trim();
      locationState = m[2].trim();
      locationCountry = m[3].trim();
      break;
    }
  }

  // ---- Headline (line with pipe separator, not linkedin URL) ----
  let headline = '';
  for (let i = 0; i < Math.min(30, lines.length); i++) {
    if (lines[i].includes('|') && !lines[i].includes('linkedin.com') && !lines[i].includes('@')) {
      headline = lines[i];
      break;
    }
  }

  // ---- Skills ----
  const skills: string[] = [];
  if (topSkillsIdx >= 0) {
    const end = [certificationsIdx, summaryIdx, experienceIdx].find(i => i > topSkillsIdx) ?? topSkillsIdx + 12;
    for (let i = topSkillsIdx + 1; i < end; i++) skills.push(lines[i]);
  }

  // ---- Certifications ----
  const certifications: string[] = [];
  if (certificationsIdx >= 0) {
    const end = [summaryIdx, experienceIdx, educationIdx].find(i => i > certificationsIdx) ?? certificationsIdx + 15;
    for (let i = certificationsIdx + 1; i < end; i++) certifications.push(lines[i]);
  }

  // ---- Summary ----
  let summary = '';
  if (summaryIdx >= 0) {
    const end = [experienceIdx, educationIdx].find(i => i > summaryIdx) ?? summaryIdx + 30;
    summary = lines.slice(summaryIdx + 1, end).join(' ');
  }

  // ---- Experience ----
  const experience: ParsedExperience[] = [];
  if (experienceIdx >= 0) {
    const end = educationIdx > experienceIdx ? educationIdx : lines.length;
    const expLines = lines.slice(experienceIdx + 1, end);
    const usedAsCompany = new Set<number>();
    let lastCompany = '';

    for (let i = 0; i < expLines.length; i++) {
      if (!isDateRange(expLines[i])) continue;

      const { start, end: endDate, isCurrent } = parseDateRange(expLines[i]);

      // Role: first non-empty, non-date, non-duration line before the date line
      let roleIdx = i - 1;
      while (roleIdx >= 0 && (isDuration(expLines[roleIdx]) || isDateRange(expLines[roleIdx]) || !expLines[roleIdx])) {
        roleIdx--;
      }
      const position = roleIdx >= 0 ? expLines[roleIdx] : '';

      // Company: line before role (skip durations)
      let companyIdx = roleIdx - 1;
      while (companyIdx >= 0 && (isDuration(expLines[companyIdx]) || isDateRange(expLines[companyIdx]) || !expLines[companyIdx])) {
        companyIdx--;
      }
      let company = '';
      if (companyIdx >= 0 && !usedAsCompany.has(companyIdx) && companyIdx !== roleIdx) {
        company = expLines[companyIdx];
        usedAsCompany.add(companyIdx);
        lastCompany = company;
      } else {
        company = lastCompany; // Multiple roles at same company
      }

      // Location: line after date if it looks like "City, State"
      let loc = '';
      const nextLine = expLines[i + 1] || '';
      if (nextLine && /^[A-Za-z\s]+,\s+[A-Za-z\s]+/.test(nextLine) && !isDateRange(nextLine)) {
        loc = nextLine;
      }

      // Description: lines after date (and optional location line), up to 5 lines
      let descStart = loc ? i + 2 : i + 1;
      const descLines: string[] = [];
      for (let j = descStart; j < expLines.length && descLines.length < 5; j++) {
        if (isDateRange(expLines[j])) break;
        // Stop if the next line is a date (new entry boundary)
        if (j + 1 < expLines.length && isDateRange(expLines[j + 1])) break;
        if (!isDuration(expLines[j])) descLines.push(expLines[j]);
      }

      experience.push({
        company,
        position,
        startDate: start,
        endDate: endDate,
        isCurrent,
        location: loc || undefined,
        description: descLines.join(' ').trim() || undefined,
      });
    }
  }

  // ---- Education ----
  const education: ParsedEducation[] = [];
  if (educationIdx >= 0) {
    const eduLines = lines.slice(educationIdx + 1);
    for (let i = 0; i < eduLines.length; i++) {
      const l = eduLines[i];
      // Pattern: "Degree, Field · (YYYY - YYYY)"
      if (l.includes('·') || (l.includes('(') && /\d{4}/.test(l) && l.includes(','))) {
        const institution = i > 0 ? eduLines[i - 1] : '';
        const dotIdx = l.indexOf('·');
        const degreePart = (dotIdx >= 0 ? l.slice(0, dotIdx) : l).trim();
        const yearMatch = l.match(/\((\d{4})\s*[-–]\s*(\d{4})\)/);
        const commaIdx = degreePart.indexOf(',');
        education.push({
          institution,
          degree: (commaIdx >= 0 ? degreePart.slice(0, commaIdx) : degreePart).trim(),
          field: (commaIdx >= 0 ? degreePart.slice(commaIdx + 1) : '').trim(),
          startYear: yearMatch?.[1] || '',
          endYear: yearMatch?.[2] || '',
        });
        i++; // Skip the degree line on next iteration since we already used it
      }
    }
  }

  // ---- Experience years calculation ----
  let expYears = 0;
  if (experience.length > 0) {
    const now = new Date();
    let totalMs = 0;
    for (const e of experience) {
      try {
        const s = new Date(e.startDate);
        const en = e.isCurrent ? now : new Date(e.endDate);
        if (!isNaN(s.getTime()) && !isNaN(en.getTime())) {
          totalMs += Math.max(0, en.getTime() - s.getTime());
        }
      } catch {
        // Skip unparseable dates
      }
    }
    expYears = Math.round(totalMs / (365.25 * 24 * 3600 * 1000));
  }

  return {
    name,
    email,
    phone: '',
    linkedinUrl,
    locationCity,
    locationState,
    locationCountry,
    headline,
    summary,
    skills: [...new Set(skills)],
    certifications: [...new Set(certifications)],
    experience,
    education,
    experienceYears: Math.max(expYears, 0),
    rawText,
  };
}
