// Delhi NCR cities + neighborhoods — matches the backend matcher's city
// enum ('gurgaon' | 'delhi' | 'noida' | 'other') and locality vocabulary
// (see kinfiles_matcher/questionnaire.ts). Slug values here are what get
// stored; labels are what the UI shows.

export const CITIES = [
  { value: "gurgaon", label: "Gurgaon" },
  { value: "delhi", label: "Delhi" },
  { value: "noida", label: "Noida" },
  { value: "other", label: "Other NCR" },
] as const;

export const NEIGHBORHOODS_BY_CITY: Record<string, { value: string; label: string }[]> = {
  gurgaon: [
    { value: "dlf-phase-1", label: "DLF Phase 1" },
    { value: "dlf-phase-3", label: "DLF Phase 3" },
    { value: "sushant-lok", label: "Sushant Lok" },
    { value: "golf-course-road", label: "Golf Course Road" },
    { value: "sector-29", label: "Sector 29" },
  ],
  delhi: [
    { value: "hauz-khas", label: "Hauz Khas" },
    { value: "saket", label: "Saket" },
    { value: "vasant-kunj", label: "Vasant Kunj" },
    { value: "dwarka", label: "Dwarka" },
    { value: "rohini", label: "Rohini" },
  ],
  noida: [
    { value: "sector-18", label: "Sector 18" },
    { value: "sector-62", label: "Sector 62" },
    { value: "sector-137", label: "Sector 137" },
    { value: "indirapuram", label: "Indirapuram" },
    { value: "greater-noida-west", label: "Greater Noida West" },
  ],
  other: [],
};
