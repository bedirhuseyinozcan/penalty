import { ICareerStep } from '../models/Player';

const YOUTH_KEYWORDS = [
  'u17',
  'u18',
  'u19',
  'u20',
  'u21',
  'u23',
  ' u1',
  ' u2',
  'youth',
  'academy',
  'altyapı',
  'altyapi',
  ' b',
  ' ii',
  'reserve',
  'jgd',
  'nachwuchs',
  'primavera',
];

export function isYouthClub(clubName: string): boolean {
  const lower = clubName.toLowerCase();
  return YOUTH_KEYWORDS.some((kw) => lower.includes(kw));
}

export function isCurrentClub(clubName: string, currentClubName?: string): boolean {
  if (!currentClubName) return false;
  const l1 = clubName.toLowerCase().trim();
  const l2 = currentClubName.toLowerCase().trim();
  return l1 === l2 || l1.includes(l2) || l2.includes(l1);
}

export function fixAndOrderCareerPath(
  rawPath: ICareerStep[] | undefined,
  currentClubName?: string,
  age: number = 25
): ICareerStep[] {
  if (!rawPath || rawPath.length === 0) {
    const curYear = 2026;
    return [
      {
        clubName: currentClubName || 'Kulüp',
        startYear: curYear - 2,
        apps: 25,
        goals: 3,
      },
    ];
  }
  const validYears = rawPath
    .map((s) => s.startYear)
    .filter((y) => typeof y === 'number' && y > 1980);
  const distinctYears = new Set(validYears);
  const isLegacyKaggleDefault =
    rawPath.length > 1 && distinctYears.size === 1 && distinctYears.has(2020);

  if (validYears.length > 0 && !isLegacyKaggleDefault) {
    const cleaned = rawPath.map((s) => ({ ...s }));
    const last = cleaned[cleaned.length - 1];
    if (last) {
      delete last.endYear;
    }
    return cleaned;
  }

  const uniqueSteps: ICareerStep[] = [];
  const seen = new Set<string>();
  for (const step of rawPath) {
    const key = (step.clubName || '').toLowerCase().trim();
    if (key && !seen.has(key)) {
      seen.add(key);
      uniqueSteps.push({ ...step });
    }
  }

  const youthClubs: ICareerStep[] = [];
  const midClubs: ICareerStep[] = [];
  let currentClubStep: ICareerStep | null = null;

  for (const step of uniqueSteps) {
    if (isCurrentClub(step.clubName, currentClubName)) {
      currentClubStep = step;
    } else if (isYouthClub(step.clubName)) {
      youthClubs.push(step);
    } else {
      midClubs.push(step);
    }
  }

  if (!currentClubStep && currentClubName) {
    currentClubStep = {
      clubName: currentClubName,
      apps: 20,
      goals: 2,
      startYear: 2024,
    };
  }

  const orderedClubs: ICareerStep[] = [...youthClubs, ...midClubs];
  if (currentClubStep) {
    orderedClubs.push(currentClubStep);
  }

  if (orderedClubs.length === 0) {
    return rawPath;
  }

  const safeAge = Math.min(42, Math.max(18, age || 25));
  const currentYear = 2026;
  const careerStartYear = Math.max(2000, currentYear - safeAge + 17);
  const totalClubs = orderedClubs.length;

  if (totalClubs === 1) {
    orderedClubs[0].startYear = Math.max(careerStartYear, currentYear - 2);
    delete orderedClubs[0].endYear;
    return orderedClubs;
  }

  const totalApps = orderedClubs.reduce((sum, c) => sum + Math.max(10, c.apps || 0), 0);
  const totalCareerSpan = Math.max(totalClubs, currentYear - careerStartYear);

  let trackerYear = careerStartYear;

  for (let i = 0; i < totalClubs; i++) {
    const isLast = i === totalClubs - 1;
    const club = orderedClubs[i];

    if (isLast) {
      club.startYear = Math.min(currentYear, Math.max(trackerYear, currentYear - 2));
      delete club.endYear;
    } else {
      const weight = Math.max(10, club.apps || 0) / totalApps;
      const span = Math.max(1, Math.round(weight * (totalCareerSpan - 1)));
      club.startYear = trackerYear;
      const calculatedEnd = Math.min(currentYear - 1, trackerYear + span);
      club.endYear = Math.max(club.startYear + 1, calculatedEnd);
      trackerYear = club.endYear;
    }
  }

  return orderedClubs;
}
