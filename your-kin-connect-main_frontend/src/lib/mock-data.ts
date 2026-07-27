// Central mock data + service abstraction for findyourKin.
// Replace these functions with real API clients later; the shape stays.

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

const NAMES: Array<{ name: string; age: number; occ: string; hood: string }> = [
  { name: "Aisha", age: 24, occ: "UI Designer", hood: "Indiranagar" },
  { name: "Priya", age: 26, occ: "Product Manager", hood: "Koramangala" },
  { name: "Meera", age: 23, occ: "Frontend Engineer", hood: "HSR Layout" },
  { name: "Rhea", age: 27, occ: "Content Strategist", hood: "Jayanagar" },
  { name: "Ananya", age: 25, occ: "Data Analyst", hood: "Whitefield" },
  { name: "Sana", age: 24, occ: "Illustrator", hood: "Domlur" },
  { name: "Tara", age: 28, occ: "Startup Founder", hood: "MG Road" },
  { name: "Ishita", age: 22, occ: "Journalist", hood: "Malleshwaram" },
];

const TAGS_POOL = [
  "Early bird", "Night owl", "Neat freak", "Plant parent", "Cat person", "Dog person",
  "WFH", "Hybrid", "Yoga", "Runner", "Foodie", "Vegetarian", "Non-smoker",
  "Meditator", "Reader", "Gamer", "Musician", "Cyclist",
];

const BIOS = [
  "Hey! I'm a UI designer working mostly from the office. I love keeping my space organized and calm. On weekends you'll find me at Cubbon Park or trying a new coffee shop. Looking for a flatmate who respects privacy but is down for occasional movie nights.",
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
    location: "Bangalore",
    neighborhood: n.hood,
    photo: PHOTOS[i % PHOTOS.length],
    gallery: [PHOTOS[i % PHOTOS.length], ROOM[i % ROOM.length], PHOTOS[(i + 3) % PHOTOS.length]],
    bio: BIOS[i % BIOS.length],
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
      { value: "hired", label: "Get a house help", emoji: "🧹" },
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

export const NEIGHBORHOODS = [
  "Indiranagar", "Koramangala", "HSR Layout", "Jayanagar",
  "Whitefield", "Domlur", "MG Road", "Malleshwaram", "Bellandur",
];

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
