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

// Locality is a free-form preference set on the backend (see the "locality"
// question in questionnaire.ts — deliberately left out of `vocab`, scored
// as a stage-2 set-overlap comparator, not a fixed enum). So this list is
// purely a frontend content choice: add as many real neighborhoods per
// city as helps people find themselves — no schema or matcher changes
// needed to expand it.
export const NEIGHBORHOODS_BY_CITY: Record<string, { value: string; label: string }[]> = {
  gurgaon: [
    { value: "dlf-phase-1", label: "DLF Phase 1" },
    { value: "dlf-phase-2", label: "DLF Phase 2" },
    { value: "dlf-phase-3", label: "DLF Phase 3" },
    { value: "dlf-phase-4", label: "DLF Phase 4" },
    { value: "dlf-phase-5", label: "DLF Phase 5" },
    { value: "sushant-lok", label: "Sushant Lok" },
    { value: "golf-course-road", label: "Golf Course Road" },
    { value: "golf-course-ext-road", label: "Golf Course Extension Road" },
    { value: "sector-14", label: "Sector 14" },
    { value: "sector-15", label: "Sector 15" },
    { value: "sector-22", label: "Sector 22" },
    { value: "sector-29", label: "Sector 29" },
    { value: "sector-43", label: "Sector 43" },
    { value: "sector-56", label: "Sector 56" },
    { value: "sector-57", label: "Sector 57" },
    { value: "sector-65", label: "Sector 65" },
    { value: "south-city-1", label: "South City 1" },
    { value: "south-city-2", label: "South City 2" },
    { value: "palam-vihar", label: "Palam Vihar" },
    { value: "sohna-road", label: "Sohna Road" },
    { value: "mg-road", label: "MG Road" },
    { value: "cyber-city", label: "Cyber City" },
    { value: "nirvana-country", label: "Nirvana Country" },
  ],
  delhi: [
    { value: "hauz-khas", label: "Hauz Khas" },
    { value: "saket", label: "Saket" },
    { value: "vasant-kunj", label: "Vasant Kunj" },
    { value: "vasant-vihar", label: "Vasant Vihar" },
    { value: "dwarka", label: "Dwarka" },
    { value: "rohini", label: "Rohini" },
    { value: "lajpat-nagar", label: "Lajpat Nagar" },
    { value: "greater-kailash", label: "Greater Kailash" },
    { value: "defence-colony", label: "Defence Colony" },
    { value: "south-extension", label: "South Extension" },
    { value: "green-park", label: "Green Park" },
    { value: "munirka", label: "Munirka" },
    { value: "malviya-nagar", label: "Malviya Nagar" },
    { value: "chattarpur", label: "Chattarpur" },
    { value: "mahipalpur", label: "Mahipalpur" },
    { value: "karol-bagh", label: "Karol Bagh" },
    { value: "rajouri-garden", label: "Rajouri Garden" },
    { value: "janakpuri", label: "Janakpuri" },
    { value: "pitampura", label: "Pitampura" },
    { value: "preet-vihar", label: "Preet Vihar" },
    { value: "mayur-vihar", label: "Mayur Vihar" },
    { value: "laxmi-nagar", label: "Laxmi Nagar" },
    { value: "sarita-vihar", label: "Sarita Vihar" },
  ],
  noida: [
    { value: "sector-15", label: "Sector 15" },
    { value: "sector-18", label: "Sector 18" },
    { value: "sector-37", label: "Sector 37" },
    { value: "sector-50", label: "Sector 50" },
    { value: "sector-51", label: "Sector 51" },
    { value: "sector-61", label: "Sector 61" },
    { value: "sector-62", label: "Sector 62" },
    { value: "sector-63", label: "Sector 63" },
    { value: "sector-76", label: "Sector 76" },
    { value: "sector-78", label: "Sector 78" },
    { value: "sector-93", label: "Sector 93" },
    { value: "sector-128", label: "Sector 128" },
    { value: "sector-137", label: "Sector 137" },
    { value: "sector-150", label: "Sector 150" },
    { value: "indirapuram", label: "Indirapuram" },
    { value: "vaishali", label: "Vaishali" },
    { value: "vasundhara", label: "Vasundhara" },
    { value: "greater-noida-west", label: "Greater Noida West" },
  ],
  other: [
    { value: "faridabad", label: "Faridabad" },
    { value: "ghaziabad", label: "Ghaziabad" },
    { value: "manesar", label: "Manesar" },
    { value: "sohna", label: "Sohna" },
  ],
};
