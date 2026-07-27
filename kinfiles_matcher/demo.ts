import { rank } from "./matcher";
import { questionnaire, sampleProfiles } from "./questionnaire";

const [viewer, ...others] = sampleProfiles;
console.log(`\n=== Matches for ${viewer.id} (spotless, direct, veg-only kitchen) ===\n`);
for (const m of rank(viewer, others, questionnaire, { limit: 10, minScore: 0 })) {
  const gate = m.gatedBy.length ? `  [GATED by ${m.gatedBy.join(",")}]` : "";
  console.log(`${viewer.id} × ${m.candidateId}: ${(m.score*100).toFixed(0)}%  ` +
    `(→${m.aToB.toFixed(2)} / ←${m.bToA.toFixed(2)}, cov ${(m.coverage*100).toFixed(0)}%)${gate}`);
  for (const d of m.breakdown.slice(0,4))
    console.log(`     ${d.label.padEnd(24)} ${d.raw.toFixed(2)}`);
  console.log();
}

// Who got filtered out entirely and why
import { passesFilters } from "./matcher";
console.log("=== Hard-filter results from aarav's view ===");
for (const c of others) {
  const pass = passesFilters(viewer, c, questionnaire);
  console.log(`  ${c.id}: ${pass ? "PASS" : "FILTERED OUT"}`);
}
