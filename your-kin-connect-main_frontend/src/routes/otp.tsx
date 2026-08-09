import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PhoneShell } from "@/components/phone-shell";
import { ScreenHeader } from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { supabase } from "@/lib/supabase";

const searchSchema = z.object({ email: z.string().optional() });

export const Route = createFileRoute("/otp")({
  head: () => ({ meta: [{ title: "Verify code — findyourKin" }] }),
  validateSearch: searchSchema,
  component: OtpPage,
});

function OtpPage() {
  const navigate = useNavigate();
  const { email } = Route.useSearch();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    if (value.length !== 6 || !email) return;
    setLoading(true);

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: value,
      type: "email",
    });

    if (error || !data.user) {
      toast.error(error?.message ?? "Invalid or expired code — try again.");
      setLoading(false);
      return;
    }

    // Returning users (who already finished onboarding) skip straight to
    // discover; brand-new users go through the onboarding flow.
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();

    setLoading(false);
    toast.success("Verified!");
    navigate({ to: profile ? "/discover" : "/onboarding/situation" });
  };

  const resend = async () => {
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) toast.error(error.message);
    else toast("Code resent");
  };

  return (
    <PhoneShell>
      {/* No fixed backTo — you can arrive here from /login or /signup, so
          go back to whichever screen actually sent you. */}
      <ScreenHeader title="Verify your email" />
      <div className="px-6 pt-6">
        <h2 className="text-2xl font-bold text-foreground">Enter the 6-digit code</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sent to <span className="font-medium text-foreground">{email ?? "your email"}</span>
        </p>

        <div className="mt-10 flex justify-center">
          <InputOTP maxLength={6} value={value} onChange={setValue}>
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="size-10 text-lg rounded-lg border-input"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          onClick={verify}
          size="lg"
          className="mt-10 h-14 w-full rounded-lg text-base font-semibold"
          disabled={value.length !== 6 || loading}
        >
          {loading ? "Verifying…" : "Verify & continue"}
        </Button>

        <button
          type="button"
          onClick={resend}
          className="mt-4 block w-full text-center text-sm font-medium text-primary"
        >
          Resend code
        </button>
      </div>
    </PhoneShell>
  );
}
