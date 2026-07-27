import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Mail } from "lucide-react";
import { PhoneShell } from "@/components/phone-shell";
import { ScreenHeader } from "@/components/screen-header";
import { supabase } from "@/lib/supabase";

const searchSchema = z.object({ email: z.string().optional() });

export const Route = createFileRoute("/otp")({
  head: () => ({ meta: [{ title: "Check your email — findyourKin" }] }),
  validateSearch: searchSchema,
  component: CheckEmailPage,
});

function CheckEmailPage() {
  const { email } = Route.useSearch();
  const [resending, setResending] = useState(false);

  const resend = async () => {
    if (!email) return;
    setResending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setResending(false);
    if (error) toast.error(error.message);
    else toast.success("Link resent");
  };

  return (
    <PhoneShell>
      <ScreenHeader title="Check your email" backTo="/signup" />
      <div className="px-6 pt-6 text-center">
        <div className="mx-auto mt-6 flex size-16 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Mail className="size-7" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-foreground">We sent you a link</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Open the email we sent to{" "}
          <span className="font-medium text-foreground">{email ?? "your inbox"}</span> and tap
          the sign-in link to continue. You can close this tab.
        </p>

        <button
          type="button"
          onClick={resend}
          disabled={resending}
          className="mt-8 block w-full text-center text-sm font-medium text-primary"
        >
          {resending ? "Resending…" : "Didn't get it? Resend link"}
        </button>
      </div>
    </PhoneShell>
  );
}
