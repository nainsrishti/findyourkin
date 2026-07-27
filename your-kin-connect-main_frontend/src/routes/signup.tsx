import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PhoneShell } from "@/components/phone-shell";
import { ScreenHeader } from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — findyourKin" }] }),
  component: SignupPage,
});

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});
type FormValues = z.infer<typeof schema>;

function SignupPage() {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (v) => {
    const { error } = await supabase.auth.signInWithOtp({
      email: v.email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/otp", search: { email: v.email } });
  });

  return (
    <PhoneShell>
      <ScreenHeader title="Create account" backTo="/" />
      <div className="px-6 pt-6">
        <h2 className="text-2xl font-bold text-foreground">Let's start with your email</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We'll send you a link to verify it's you.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="h-12 rounded-lg"
              {...form.register("email")}
              aria-invalid={!!form.formState.errors.email}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-14 w-full rounded-lg text-base font-semibold"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Sending link…" : "Send verification link"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Have an account?{" "}
          <Link to="/login" className="font-semibold text-primary">
            Log in
          </Link>
        </div>
      </div>
    </PhoneShell>
  );
}
