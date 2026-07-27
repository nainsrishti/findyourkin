/**
 * supabase/functions/send-sms-hook/index.ts
 *
 * Supabase's "Send SMS Hook" — replaces Supabase's built-in SMS sender.
 * Supabase generates the OTP itself and calls this endpoint with
 * { user: { phone, ... }, sms: { otp } }. We just have to deliver that
 * OTP to the phone via MSG91's Flow (template) API and return 200.
 *
 * Deploy:  supabase functions deploy send-sms-hook --no-verify-jwt
 *          (must be --no-verify-jwt: this is called by Supabase Auth
 *          itself, before any user has a JWT — request authenticity is
 *          instead verified via the Standard Webhooks signature below)
 *
 * Secrets (supabase secrets set ...):
 *   MSG91_AUTHKEY          — MSG91 dashboard → API → Configure
 *   MSG91_TEMPLATE_ID      — the DLT-approved OTP template's ID
 *   SEND_SMS_HOOK_SECRET   — shown when you enable this hook in
 *                            Supabase Dashboard → Authentication → Hooks
 *                            (looks like "v1,whsec_...")
 *
 * Also requires: Authentication → Providers → Phone enabled, and this
 * function wired up as the "Send SMS hook" in Authentication → Hooks.
 */

import { Webhook } from "npm:standardwebhooks@1.0.0";

const MSG91_AUTHKEY = Deno.env.get("MSG91_AUTHKEY")!;
const MSG91_TEMPLATE_ID = Deno.env.get("MSG91_TEMPLATE_ID")!;
const HOOK_SECRET = Deno.env.get("SEND_SMS_HOOK_SECRET")!;

interface SendSmsPayload {
  user: { phone: string };
  sms: { otp: string };
}

Deno.serve(async (req) => {
  const body = await req.text();

  // Verify this request genuinely came from Supabase Auth, not a random caller.
  const wh = new Webhook(HOOK_SECRET);
  let event: SendSmsPayload;
  try {
    event = wh.verify(body, Object.fromEntries(req.headers)) as SendSmsPayload;
  } catch {
    return new Response(JSON.stringify({ error: "invalid webhook signature" }), {
      status: 401,
    });
  }

  const mobile = event.user.phone.replace(/^\+/, ""); // MSG91 wants no leading "+"
  const otp = event.sms.otp;

  const res = await fetch("https://control.msg91.com/api/v5/flow/", {
    method: "POST",
    headers: {
      authkey: MSG91_AUTHKEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      template_id: MSG91_TEMPLATE_ID,
      recipients: [{ mobiles: mobile, OTP: otp }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return new Response(JSON.stringify({ error: `MSG91 send failed: ${detail}` }), {
      status: 500,
    });
  }

  // Empty 200 = success, per Supabase's Send SMS Hook contract.
  return new Response(JSON.stringify({}), { status: 200 });
});
