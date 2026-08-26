// Central mock data + service abstraction for findyourKin.
// Replace these functions with real API clients later; the shape stays.

import { NEIGHBORHOODS_BY_CITY } from "./ncr-locations";

export type VerificationBadge = "id" | "employment" | "social" | "background";

export interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  neighborhood: string;
  photo: string;
  gallery: string[];
  bio: string;
  occupation: string;
  tags: string[];
  compatibilityScore: number; // 0-100
  verified: VerificationBadge[];
  // Pinned so this profile always shows on /matches regardless of the
  // current user's like history — see matches.tsx.
  founder?: boolean;
  traits: {
    cleanliness: number;
    social: number;
    workHours: number;
    sleepSchedule: number;
    budget: number;
  };
  insight: { title: string; body: string };
  budgetRange: [number, number];
  moveIn: string;
  housingType: "Studio" | "1BHK" | "2BHK" | "3BHK";
  prompts: { q: string; a: string }[];
}

const PHOTOS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=70",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&q=70",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=70",
  "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800&auto=format&fit=crop&q=70",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=70",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=70",
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=800&auto=format&fit=crop&q=70",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=70",
];

const ROOM = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=70",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=70",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop&q=70",
];

// Delhi NCR neighborhoods, matching kinfiles's real vocabulary in
// ncr-locations.ts (kept as plain strings here since this mock list predates
// the real city/locality slugs and is display-only).
const NAMES: Array<{
  name: string; age: number; occ: string; hood: string; city: string;
  photo?: string; bio?: string; founder?: boolean;
}> = [
  // Srishti's own profile — shown to everyone as the featured/example
  // match. No stock photo here on purpose; swap in her real photo URL once
  // it's uploaded (falls back to an initials avatar until then). Her own
  // dedicated bio, kept out of the shared BIOS pool below so it can never
  // get reassigned to someone else by the modulo cycling.
  {
    name: "Srishti", age: 23, occ: "Founder, findyourKin", hood: "DLF Phase 1", city: "Gurgaon",
    photo: "/founder.jpg",
    bio: "Hey! I'm the founder of findyourKin, building this because I know how hard it is to find a flatmate you actually vibe with in Gurgaon. Say hi if you're in NCR — always happy to chat about the app or just be your flatmate.",
    founder: true,
  },
  { name: "Aisha", age: 24, occ: "UI Designer", hood: "Sushant Lok", city: "Gurgaon" },
  { name: "Priya", age: 26, occ: "Product Manager", hood: "Hauz Khas", city: "Delhi" },
  { name: "Meera", age: 23, occ: "Frontend Engineer", hood: "Sector 62", city: "Noida" },
  { name: "Rhea", age: 27, occ: "Content Strategist", hood: "Saket", city: "Delhi" },
  { name: "Ananya", age: 25, occ: "Data Analyst", hood: "Golf Course Road", city: "Gurgaon" },
  { name: "Sana", age: 24, occ: "Illustrator", hood: "Indirapuram", city: "Noida" },
  { name: "Tara", age: 28, occ: "Startup Founder", hood: "Vasant Kunj", city: "Delhi" },
  { name: "Ishita", age: 22, occ: "Journalist", hood: "Sector 137", city: "Noida" },
];

const TAGS_POOL = [
  "Early bird", "Night owl", "Neat freak", "Plant parent", "Cat person", "Dog person",
  "WFH", "Hybrid", "Yoga", "Runner", "Foodie", "Vegetarian", "Non-smoker",
  "Meditator", "Reader", "Gamer", "Musician", "Cyclist",
];

const BIOS = [
  "Hey! I'm a UI designer working mostly from the office. I love keeping my space organized and calm. On weekends you'll find me at Cyber Hub or trying a new coffee shop. Looking for a flatmate who respects privacy but is down for occasional movie nights.",
  "PM by day, potter by night. I keep common spaces spotless and cook most evenings. Looking for someone chill, communicative and mildly obsessed with plants.",
  "Engineer, runner, weekend baker. I value quiet mornings and a tidy kitchen. Would love to share space with someone who respects boundaries and enjoys the occasional dinner in.",
  "Words person. Love long walks, longer books, and lots of chai. Looking for a flatmate who's kind, low-drama, and okay with a very fluffy cat.",
  "Data by day, DJ some nights. Clean and considerate — I promise the music stays at reasonable volume after 10pm.",
  "Illustrator, introvert, obsessed with good lighting. Looking for a calm home base with someone who does their dishes without being reminded.",
];

const INSIGHTS: Array<Profile["insight"]> = [
  { title: "High Lifestyle Overlap", body: "You both prefer quiet Sundays and keeping common areas strictly clean." },
  { title: "Similar Sleep Schedule", body: "Both of you are up by 7 and lights out by 11 — mornings will feel calm." },
  { title: "Matched Work Rhythm", body: "You'll rarely overlap in the day — perfect for anyone who WFH deeply-focused." },
  { title: "Aligned Budgets", body: "Rent expectations line up within ₹2k, so splitting bills will be simple." },
];

const PROMPTS = [
  { q: "A perfect Sunday looks like", a: "Slow coffee, a long walk, and reading in the afternoon." },
  { q: "My flatmate red flag is", a: "Leaving dishes in the sink 'for later'." },
  { q: "Non-negotiable in a home", a: "Natural light and a place for my plants." },
  { q: "Guest policy", a: "Advance heads-up, no surprise sleepovers." },
];

function seeded(i: number, max: number) {
  return Math.abs(Math.sin(i * 9.13)) * max;
}

export const profiles: Profile[] = NAMES.map((n, i) => {
  const tagCount = 3 + Math.floor(seeded(i, 3));
  const tags = Array.from({ length: tagCount }, (_, k) => TAGS_POOL[(i * 3 + k) % TAGS_POOL.length]);
  return {
    id: `p_${i + 1}`,
    name: n.name,
    age: n.age,
    location: n.city,
    neighborhood: n.hood,
    photo: n.photo ?? PHOTOS[i % PHOTOS.length],
    gallery: [PHOTOS[i % PHOTOS.length], ROOM[i % ROOM.length], PHOTOS[(i + 3) % PHOTOS.length]],
    bio: n.bio ?? BIOS[i % BIOS.length],
    occupation: n.occ,
    tags,
    compatibilityScore: 96 - i * 4,
    verified: (["id", "employment", "social", "background"] as VerificationBadge[]).slice(0, 2 + (i % 3)),
    traits: {
      cleanliness: 95 - i * 3,
      social: 60 + ((i * 7) % 35),
      workHours: 55 + ((i * 11) % 40),
      sleepSchedule: 70 + ((i * 5) % 25),
      budget: 80 - (i % 5) * 6,
    },
    insight: INSIGHTS[i % INSIGHTS.length],
    budgetRange: [18000 + i * 1000, 26000 + i * 1500],
    moveIn: ["Immediately", "In 2 weeks", "Next month", "Flexible"][i % 4],
    housingType: (["Studio", "1BHK", "2BHK", "3BHK"] as const)[i % 4],
    prompts: [PROMPTS[i % 4], PROMPTS[(i + 1) % 4]],
    founder: n.founder,
  };
});

export function getProfile(id: string) {
  return profiles.find((p) => p.id === id);
}

// ---- Chat ----

export interface Message {
  id: string;
  chatId: string;
  from: "me" | "them";
  text: string;
  ts: number;
}

export interface ChatThread {
  id: string;
  profileId: string;
  lastMessage: string;
  unread: number;
  updatedAt: number;
}

export const chats: ChatThread[] = profiles.slice(0, 5).map((p, i) => ({
  id: `c_${p.id}`,
  profileId: p.id,
  lastMessage: [
    "Hey! Loved your prompt about Sundays 😊",
    "Sounds good — want to schedule a call?",
    "Yes! I visit that cafe every weekend too.",
    "I'm free tomorrow evening if you want to chat.",
    "Same — plant parent solidarity 🌱",
  ][i],
  unread: i === 0 ? 2 : i === 2 ? 1 : 0,
  updatedAt: Date.now() - i * 3600_000,
}));

const seedMsgs: Record<string, Message[]> = {};
chats.forEach((c, i) => {
  seedMsgs[c.id] = [
    { id: `${c.id}_1`, chatId: c.id, from: "them", text: "Hey! Saw we matched — your bio made me laugh.", ts: Date.now() - 3600_000 * 5 },
    { id: `${c.id}_2`, chatId: c.id, from: "me", text: "Haha thanks! Loved yours too. When are you looking to move?", ts: Date.now() - 3600_000 * 4 },
    { id: `${c.id}_3`, chatId: c.id, from: "them", text: c.lastMessage, ts: Date.now() - i * 3600_000 },
  ];
});

export const messages = seedMsgs;

// ---- Quiz ----

export interface QuizQuestion {
  id: string;
  question: string;
  options: { value: string; label: string; emoji: string }[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: "overlap",
    question: "How much space will you actually share with your flatmate?",
    options: [
      { value: "solo", label: "Own room, we'll rarely cross paths", emoji: "🚪" },
      { value: "shared_common", label: "Own room, sharing kitchen/living room", emoji: "🛋️" },
      { value: "shared_room", label: "Sharing a bedroom", emoji: "🛏️" },
    ],
  },
  {
    id: "wake",
    question: "When do you usually wake up?",
    options: [
      { value: "early", label: "Before 7am — I'm an early bird", emoji: "🌅" },
      { value: "mid", label: "Between 7 and 9", emoji: "☕" },
      { value: "late", label: "After 9 — mornings are hard", emoji: "🌙" },
    ],
  },
  {
    id: "clean",
    question: "How clean do you keep common spaces?",
    options: [
      { value: "spotless", label: "Spotless — always", emoji: "✨" },
      { value: "tidy", label: "Generally tidy", emoji: "🧺" },
      { value: "chill", label: "Lived-in is fine", emoji: "🛋️" },
    ],
  },
  {
    id: "guests",
    question: "How often do you have guests over?",
    options: [
      { value: "rare", label: "Rarely — I like quiet", emoji: "🤫" },
      { value: "some", label: "Occasionally, always a heads-up", emoji: "👋" },
      { value: "often", label: "Often — I love hosting", emoji: "🎉" },
    ],
  },
  {
    id: "social",
    question: "Ideal flatmate energy?",
    options: [
      { value: "friends", label: "Close friends — dinners together", emoji: "🍽️" },
      { value: "friendly", label: "Friendly but independent", emoji: "🙂" },
      { value: "hi-bye", label: "Hi-and-bye is perfect", emoji: "🚪" },
    ],
  },
  {
    id: "chores",
    question: "How should chores work?",
    options: [
      { value: "rota", label: "Clear rota, split evenly", emoji: "📋" },
      { value: "flex", label: "Whoever notices, handles it", emoji: "🤝" },
      { value: "hired", label: "Get house help", emoji: "🧹" },
    ],
  },
  {
    id: "conflict",
    question: "When something's bugging you about a flatmate, what do you do?",
    options: [
      { value: "direct", label: "Bring it up directly, right away", emoji: "🗣️" },
      { value: "hints", label: "Drop hints and hope they notice", emoji: "🙃" },
      { value: "wait", label: "Wait for the right moment", emoji: "⏳" },
      { value: "internalize", label: "Usually just let it go", emoji: "🫥" },
    ],
  },
  {
    id: "wfh",
    question: "How often do you work from home?",
    options: [
      { value: "never", label: "Rarely — I'm out most days", emoji: "🚪" },
      { value: "hybrid", label: "A couple days a week", emoji: "🔀" },
      { value: "mostly", label: "Most days", emoji: "🏠" },
      { value: "always", label: "Always — fully remote", emoji: "💻" },
    ],
  },
  {
    id: "stay",
    question: "How long are you looking to stay?",
    options: [
      { value: "short", label: "Under 6 months", emoji: "🎒" },
      { value: "6to12", label: "6–12 months", emoji: "📆" },
      { value: "1to2yr", label: "1–2 years", emoji: "🗓️" },
      { value: "longterm", label: "2+ years, ideally", emoji: "🏡" },
    ],
  },
  {
    id: "partner",
    question: "How often might a partner stay over?",
    options: [
      { value: "never", label: "Never / not applicable", emoji: "🚫" },
      { value: "occasional", label: "Occasionally", emoji: "💜" },
      { value: "frequent", label: "Fairly often", emoji: "🔁" },
      { value: "livein", label: "Practically living there", emoji: "🏠" },
    ],
  },
];

// ---- Notifications ----

export interface AppNotification {
  id: string;
  type: "match" | "message" | "verification" | "system";
  title: string;
  body: string;
  ts: number;
  read: boolean;
}

export const notifications: AppNotification[] = [
  { id: "n1", type: "match", title: "New high match!", body: "Aisha, 24 — 96% compatible", ts: Date.now() - 1200_000, read: false },
  { id: "n2", type: "message", title: "Priya sent you a message", body: "Sounds good — want to schedule a call?", ts: Date.now() - 3600_000, read: false },
  { id: "n3", type: "verification", title: "You're verified ✓", body: "Your ID has been confirmed. Nice.", ts: Date.now() - 86400_000, read: true },
];

// ---- Housing options (onboarding) ----

export const HOUSING_TYPES = [
  { value: "have-place", label: "I have a place", body: "Looking for a flatmate to join me." },
  { value: "need-place", label: "I need a place", body: "Looking for both a flatmate and a home." },
  { value: "together", label: "Let's find a place together", body: "Search and split a new place with someone." },
] as const;

// Flattened across all NCR cities — kept in sync with the (much longer)
// onboarding list in ncr-locations.ts instead of maintaining a second copy.
export const NEIGHBORHOODS = Object.values(NEIGHBORHOODS_BY_CITY)
  .flat()
  .map((n) => n.label);

// ---- Mock async service ----

export async function fetchProfiles(): Promise<Profile[]> {
  await new Promise((r) => setTimeout(r, 300));
  return profiles;
}
export async function fetchProfile(id: string): Promise<Profile | undefined> {
  await new Promise((r) => setTimeout(r, 200));
  return getProfile(id);
}
export async function fetchChats(): Promise<ChatThread[]> {
  await new Promise((r) => setTimeout(r, 250));
  return chats;
}
export async function fetchMessages(chatId: string): Promise<Message[]> {
  await new Promise((r) => setTimeout(r, 200));
  return messages[chatId] ?? [];
}
