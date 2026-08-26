import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { PhoneShell } from "@/components/phone-shell";
import { ScreenHeader } from "@/components/screen-header";
import { StepProgress } from "@/components/step-progress";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/tag";
import { CITIES, NEIGHBORHOODS_BY_CITY } from "@/lib/ncr-locations";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { ImagePlus, X } from "lucide-react";
import { requireSession } from "@/lib/route-guards";

const MAX_FLAT_PHOTOS = 5;

export const Route = createFileRoute("/onboarding/housing")({
  head: () => ({ meta: [{ title: "Housing — findyourKin" }] }),
  beforeLoad: () => requireSession(),
  component: HousingStep,
});

function HousingStep() {
  const navigate = useNavigate();
  const { onboarding, updateOnboarding } = useAppStore();
  // Set on the very first onboarding screen now — read-only here, just used
  // to decide whether to show the flat-photo uploader below.
  const choice = onboarding.housingChoice;
  const [city, setCity] = useState(onboarding.city);
  const [hoods, setHoods] = useState<string[]>(onboarding.neighborhoods);
  const [budget, setBudget] = useState<[number, number]>(onboarding.budget);
  const [flatPhotos, setFlatPhotos] = useState<string[]>(onboarding.flatPhotos);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const availableHoods = NEIGHBORHOODS_BY_CITY[city] ?? [];

  const pickCity = (c: string) => {
    setCity(c);
    setHoods([]); // neighborhoods are city-specific — clear on city change
  };

  const toggleHood = (h: string) =>
    setHoods((prev) => (prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]));

  const onPickFlatPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const room = MAX_FLAT_PHOTOS - flatPhotos.length;
    if (room <= 0) {
      toast.error(`You can add up to ${MAX_FLAT_PHOTOS} photos.`);
      return;
    }

    setUploading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You need to be logged in to add photos.");
      setUploading(false);
      return;
    }

    const uploaded: string[] = [];
    for (const file of files.slice(0, room)) {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("flat-photos").upload(path, file, { upsert: true });
      if (error) {
        toast.error("A photo failed to upload — try again.");
        continue;
      }
      const { data } = supabase.storage.from("flat-photos").getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }
    setFlatPhotos((prev) => [...prev, ...uploaded]);
    setUploading(false);
  };

  const removeFlatPhoto = (url: string) =>
    setFlatPhotos((prev) => prev.filter((p) => p !== url));

  const next = () => {
    updateOnboarding({ city, neighborhoods: hoods, budget, flatPhotos });
    navigate({ to: "/onboarding/quiz" });
  };

  return (
    <PhoneShell>
      <ScreenHeader title="Step 3 of 6" backTo="/onboarding/profile" />
      <div className="px-6 pb-32">
        <StepProgress step={3} total={6} />
        <h2 className="mt-6 text-2xl font-bold">
          {choice === "have-place" ? "Tell us about your place" : "Where are you looking?"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {choice === "have-place"
            ? "Where it is, and what a flatmate would pay."
            : "Tell us where you'd like to live and your budget."}
        </p>

        {choice === "have-place" && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-foreground">Photos of your place</h3>
            <p className="text-xs text-muted-foreground">
              Add up to {MAX_FLAT_PHOTOS} photos so people know what they're looking at. Shown on your profile.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {flatPhotos.map((url) => (
                <div key={url} className="relative size-20 overflow-hidden rounded-xl border border-border">
                  <img src={url} alt="Your place" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFlatPhoto(url)}
                    aria-label="Remove photo"
                    className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {flatPhotos.length < MAX_FLAT_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={uploading}
                  className="flex size-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-muted-foreground hover:border-primary/40"
                >
                  <ImagePlus className="size-5" />
                  <span className="text-[10px]">{uploading ? "Uploading…" : "Add"}</span>
                </button>
              )}
            </div>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onPickFlatPhotos}
            />
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-foreground">City</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <Tag key={c.value} onClick={() => pickCity(c.value)} selected={city === c.value}>
                {c.label}
              </Tag>
            ))}
          </div>
        </div>

        {availableHoods.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-foreground">Preferred neighborhoods</h3>
            <p className="text-xs text-muted-foreground">Pick as many as you like.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableHoods.map((n) => (
                <Tag key={n.value} onClick={() => toggleHood(n.value)} selected={hoods.includes(n.value)}>
                  {n.label}
                </Tag>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold text-foreground">Monthly budget</h3>
            <p className="text-sm font-medium text-primary">
              ₹{budget[0].toLocaleString()} – ₹{budget[1].toLocaleString()}
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="text-xs text-muted-foreground">
              Min
              <input
                type="number"
                min={5000}
                step={1000}
                value={budget[0]}
                onChange={(e) => setBudget([Number(e.target.value), budget[1]])}
                className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              Max
              <input
                type="number"
                min={budget[0]}
                step={1000}
                value={budget[1]}
                onChange={(e) => setBudget([budget[0], Number(e.target.value)])}
                className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-border bg-surface/95 backdrop-blur px-6 py-4">
        <Button
          onClick={next}
          size="lg"
          className="h-14 w-full rounded-lg text-base font-semibold"
          disabled={!choice || !city}
        >
          Continue
        </Button>
      </div>
    </PhoneShell>
  );
}
