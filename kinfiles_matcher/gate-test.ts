import { scorePair } from "./matcher";
import { questionnaire } from "./questionnaire";
import type { Profile } from "./matcher";

const base = (id: string, conflict: string): Profile => ({
  id,
  attrs: { city: "gurgaon", gender: "male", gender_pref: ["any"], move_in_day: 20300, traits: [] },
  answers: {
    budget: "12-18k", sleep: "before11", cleanliness: "reasonable", guests: "weekly",
    home_energy: "flexible", wfh: "hybrid", stay: "1to2yr", partner: "occasional",
    conflict, situation: "seeker",
    diet: "veg", kitchen: "okay_nonveg", smoke_tolerance: "ok", smokes_indoor: false,
    pet_tolerance: "ok", has_pets: false, dealbreakers: [],
  },
});

// Identical people EXCEPT conflict style.
const twoDirect      = scorePair(base("a","direct"),      base("b","direct"),      questionnaire);
const directVsInternal = scorePair(base("a","direct"),    base("b","internalize"), questionnaire);
const twoInternalizers = scorePair(base("a","internalize"),base("b","internalize"),questionnaire);

console.log("Two identical profiles, ONLY conflict style differs:\n");
console.log(`  direct  × direct       → ${(twoDirect.score*100).toFixed(0)}%   gated: ${twoDirect.gatedBy.join(",")||"no"}`);
console.log(`  direct  × internalize  → ${(directVsInternal.score*100).toFixed(0)}%   gated: ${directVsInternal.gatedBy.join(",")||"no"}`);
console.log(`  intern. × internalize  → ${(twoInternalizers.score*100).toFixed(0)}%   gated: ${twoInternalizers.gatedBy.join(",")||"no"}  <-- capped despite everything else matching`);
