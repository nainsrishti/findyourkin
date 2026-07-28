import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { PhoneShell } from "@/components/phone-shell";
import { ScreenHeader } from "@/components/screen-header";
import { StepProgress } from "@/components/step-progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Camera } from "lucide-react";

export const Route = createFileRoute("/onboarding/profile")({
  head: () => ({ meta: [{ title: "About you — findyourKin" }] }),
  component: OnboardingProfile,
});

const schema = z.object({
  displayName: z.string().min(2, "Enter your name"),
  age: z.coerce.number().min(18, "18+").max(80),
  gender: z.string().min(1, "Select one"),
  occupation: z.string().min(2, "Tell us what you do"),
  bio: z.string().max(280, "Keep it under 280 characters").optional(),
  phoneNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number")
    .optional()
    .or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

function OnboardingProfile() {
  const navigate = useNavigate();
  const { onboarding, updateOnboarding } = useAppStore();
  const [photoUrl, setPhotoUrl] = useState(onboarding.photoUrl);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: onboarding.displayName,
      age: onboarding.age ?? undefined,
      gender: onboarding.gender,
      occupation: onboarding.occupation,
      bio: onboarding.bio,
      phoneNumber: onboarding.phoneNumber,
    } as FormValues,
  });

  const onSubmit = form.handleSubmit((v) => {
    updateOnboarding({ ...v, photoUrl });
    navigate({ to: "/onboarding/housing" });
  });

  const onPickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You need to be logged in to add a photo.");
      setUploading(false);
      return;
    }

    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, {
      upsert: true,
    });
    setUploading(false);

    if (error) {
      toast.error("Photo upload failed — try again.");
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setPhotoUrl(data.publicUrl);
  };

  const genders = ["Woman", "Man", "Non-binary", "Prefer not to say"];

  return (
    <PhoneShell>
      <ScreenHeader title="Step 2 of 6" backTo="/onboarding/situation" />
      <div className="px-6">
        <StepProgress step={2} total={6} />
        <h2 className="mt-6 text-2xl font-bold">A little about you</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We use this to personalize your matches. You can change it later.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="relative flex size-24 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-muted-foreground"
            >
              {photoUrl ? (
                <img src={photoUrl} alt="Your profile" className="size-full object-cover" />
              ) : (
                <Camera className="size-6" />
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-white">
                  Uploading…
                </div>
              )}
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickPhoto}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Preferred name</Label>
            <Input id="name" className="h-12 rounded-lg" placeholder="Aisha" {...form.register("displayName")} />
            {form.formState.errors.displayName && (
              <p className="text-xs text-destructive">{form.formState.errors.displayName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" className="h-12 rounded-lg" placeholder="24" {...form.register("age")} />
              {form.formState.errors.age && (
                <p className="text-xs text-destructive">{form.formState.errors.age.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input id="occupation" className="h-12 rounded-lg" placeholder="Designer" {...form.register("occupation")} />
              {form.formState.errors.occupation && (
                <p className="text-xs text-destructive">{form.formState.errors.occupation.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Gender</Label>
            <div className="flex flex-wrap gap-2">
              {genders.map((g) => {
                const active = form.watch("gender") === g;
                return (
                  <button
                    type="button"
                    key={g}
                    onClick={() => form.setValue("gender", g, { shouldValidate: true })}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
            {form.formState.errors.gender && (
              <p className="text-xs text-destructive">{form.formState.errors.gender.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">A few words about you</Label>
            <Textarea
              id="bio"
              rows={3}
              className="rounded-lg"
              placeholder="Quiet mornings, tidy kitchens, and a lot of chai."
              {...form.register("bio")}
            />
            {form.formState.errors.bio && (
              <p className="text-xs text-destructive">{form.formState.errors.bio.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Mobile number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              inputMode="numeric"
              className="h-12 rounded-lg"
              placeholder="98765 43210"
              {...form.register("phoneNumber")}
            />
            <p className="text-xs text-muted-foreground">
              Private — only the findyourKin team can see this, to reach out if needed. Never shown to other members.
            </p>
            {form.formState.errors.phoneNumber && (
              <p className="text-xs text-destructive">{form.formState.errors.phoneNumber.message}</p>
            )}
          </div>
        </form>
      </div>

      <div className="sticky bottom-0 mt-8 border-t border-border bg-surface/95 backdrop-blur px-6 py-4">
        <Button onClick={onSubmit} size="lg" className="h-14 w-full rounded-lg text-base font-semibold">
          Continue
        </Button>
      </div>
    </PhoneShell>
  );
}
