import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OnboardingState {
  displayName: string;
  age: number | null;
  gender: string;
  occupation: string;
  bio: string;
  photoUrl: string;
  phoneNumber: string;
  city: string;
  housingChoice: string;
  flatPhotos: string[];
  neighborhoods: string[];
  budget: [number, number];
  moveIn: string;
  quiz: Record<string, string>;
  preferences: {
    smoker: boolean;
    pets: boolean;
    vegetarian: boolean;
    guests: string;
  };
  verifiedId: boolean;
}

export interface DiscoverFilters {
  /** "any" | "host" | "seeker" | "cohunt" */
  situation: string;
  /** "any" | "18-24" | "25-30" | "31plus" */
  ageRange: string;
}

export const DEFAULT_FILTERS: DiscoverFilters = { situation: "any", ageRange: "any" };

interface AppState {
  isAuthed: boolean;
  user: { id: string; email: string; name: string } | null;
  onboarding: OnboardingState;
  likedIds: string[];
  passedIds: string[];
  discoverFilters: DiscoverFilters;
  setAuthed: (u: AppState["user"]) => void;
  logout: () => void;
  updateOnboarding: (patch: Partial<OnboardingState>) => void;
  like: (id: string) => void;
  unlike: (id: string) => void;
  pass: (id: string) => void;
  setDiscoverFilters: (f: DiscoverFilters) => void;
  reset: () => void;
}

const initialOnboarding: OnboardingState = {
  displayName: "",
  age: null,
  gender: "",
  occupation: "",
  bio: "",
  photoUrl: "",
  phoneNumber: "",
  city: "",
  housingChoice: "",
  flatPhotos: [],
  neighborhoods: [],
  budget: [15000, 30000],
  moveIn: "Flexible",
  quiz: {},
  preferences: { smoker: false, pets: true, vegetarian: false, guests: "some" },
  verifiedId: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthed: false,
      user: null,
      onboarding: initialOnboarding,
      likedIds: [],
      passedIds: [],
      discoverFilters: DEFAULT_FILTERS,
      setAuthed: (u) => set({ isAuthed: !!u, user: u }),
      logout: () => set({ isAuthed: false, user: null }),
      updateOnboarding: (patch) =>
        set((s) => ({ onboarding: { ...s.onboarding, ...patch } })),
      like: (id) =>
        set((s) => ({ likedIds: Array.from(new Set([...s.likedIds, id])) })),
      unlike: (id) =>
        set((s) => ({ likedIds: s.likedIds.filter((x) => x !== id) })),
      pass: (id) =>
        set((s) => ({ passedIds: Array.from(new Set([...s.passedIds, id])) })),
      setDiscoverFilters: (f) => set({ discoverFilters: f }),
      reset: () =>
        set({
          onboarding: initialOnboarding,
          likedIds: [],
          passedIds: [],
          discoverFilters: DEFAULT_FILTERS,
        }),
    }),
    { name: "findyourkin-store" },
  ),
);

// SSR-safe selector that only reads store after hydration
export function useHydrated() {
  if (typeof window === "undefined") return false;
  return true;
}
