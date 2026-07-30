import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { PhoneShell } from "@/components/phone-shell";
import { ScreenHeader } from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Camera } from "lucide-react";
import { requireOnboarded } from "@/lib/route-guards";

async function fetchEditableProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const [{ data: profile, error: profileError }, { data: contact }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, age, occupation, bio, photo_url")
      .eq("id", user.id)
      .single(),
    supabase.from("contact_info").select("phone_number").eq("id", user.id).maybeSingle(),
  ]);

  if (profileError) throw profileError;

  return {
    displayName: profile.display_name ?? "",
    age: profile.age ?? undefined,
    occupation: profile.occupation ?? "",
    bio: profile.bio ?? "",
    photoUrl: profile.photo_url ?? "",
    phoneNumber: contact?.phone_number ?? "",
  };
}

const editProfileQuery = queryOptions({ queryKey: ["edit-profile"], queryFn: fetchEditableProfile });

export const Route = createFileRoute("/profile/edit")({
  head: () => ({ meta: [{ title: "Edit profile — findyourKin" }] }),
  beforeLoad: () => requireOnboarded(),
  loader: ({ context }) => context.queryClient.ensureQueryData(editProfileQuery),
  component: EditProfilePage,
});

const schema = z.object({
  displayName: z.string().min(2, "Enter your name"),
  age: z.coerce.number().min(18, "18+").max(80),
  occupation: z.string().min(2, "Tell us what you do"),
  bio: z.string().max(280, "Keep it under 280 characters").optional(),
  phoneNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number")
    .optional()
    .or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

function EditProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const updateOnboarding = useAppStore((s) => s.updateOnboarding);
  const { data: current } = useSuspenseQuery(editProfileQuery);

  const [photoUrl, setPhotoUrl] = useState(current.photoUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: current.displayName,
      age: current.age,
      occupation: current.occupation,
      bio: current.bio,
      phoneNumber: current.phoneNumber,
    } as FormValues,
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
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    setUploading(false);

    if (error) {
      toast.error("Photo upload failed — try again.");
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setPhotoUrl(data.publicUrl);
  };

  const onSubmit = form.handleSubmit(async (v) => {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You need to be logged in.");
      setSaving(false);
      return;
    }

    // Direct, partial updates — only the fields this screen owns. Everything
    // else on the profile row (quiz answers, embedding, importance, city,
    // budget, situation...) is left exactly as it is. Deliberately NOT
    // reusing the onboarding save-profile flow here: that rebuilds the
    // whole row from local device state, which would silently blank out
    // matching data if this is a different device than the one onboarding
    // happened on.
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        display_name: v.displayName,
        age: v.age,
        occupation: v.occupation,
        bio: v.bio || null,
        photo_url: photoUrl || null,
      })
      .eq("id", user.id);

    if (profileError) {
      toast.error("Couldn't save your profile — try again.");
      setSaving(false);
      return;
    }

    if (v.phoneNumber) {
      const { error: contactError } = await supabase
        .from("contact_info")
        .upsert({ id: user.id, phone_number: v.phoneNumber }, { onConflict: "id" });
      if (contactError) {
        toast.error("Profile saved, but your phone number couldn't be updated.");
      }
    }

    // Keep the local store (used elsewhere in the app for instant display)
    // in sync with what we just saved.
    updateOnboarding({
      displayName: v.displayName,
      age: v.age,
      occupation: v.occupation,
      bio: v.bio ?? "",
      photoUrl,
      phoneNumber: v.phoneNumber ?? "",
    });
    queryClient.invalidateQueries({ queryKey: ["edit-profile"] });

    setSaving(false);
    toast.success("Profile updated");
    navigate({ to: "/profile" });
  });

  return (
    <PhoneShell>
      <ScreenHeader title="Edit profile" backTo="/profile" />
      <div className="px-6">
        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="relative flex size-24 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-muted-foreground"
            >
              {photoUrl ? (
                <img src={photoUrl} alt="Your profile" className="size-full object-cover object-top" />
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
        <Button onClick={onSubmit} size="lg" className="h-14 w-full rounded-lg text-base font-semibold" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </PhoneShell>
  );
}
