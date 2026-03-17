import { createClient } from "../../../../supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";
  const businessId = searchParams.get("business_id");

  const supabase = await createClient();

  // Handle invite token — Supabase invite emails use token_hash + type=invite
  if (token_hash && type === "invite") {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: "invite",
    });

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && businessId) {
        // Activate the pending membership created during invite
        await supabase
          .from("business_members")
          .update({
            is_active: true,
            accepted_at: new Date().toISOString(),
          })
          .eq("business_id", businessId)
          .eq("user_id", user.id);

        // Mark invitation as accepted
        await supabase
          .from("business_invitations")
          .update({ accepted_at: new Date().toISOString() })
          .eq("business_id", businessId)
          .eq("invited_email", user.email?.toLowerCase());
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }

    return NextResponse.redirect(`${origin}/sign-in?error=invalid_invite`);
  }

  // Handle other OTP types (e.g. email confirmation, magic link)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      // token_hash is only issued for email-based OTP types
      type: type as "email" | "recovery" | "email_change" | "signup",
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Handle OAuth / PKCE code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (businessId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          await supabase
            .from("business_members")
            .update({
              is_active: true,
              accepted_at: new Date().toISOString(),
            })
            .eq("business_id", businessId)
            .eq("user_id", user.id);

          await supabase
            .from("business_invitations")
            .update({ accepted_at: new Date().toISOString() })
            .eq("business_id", businessId)
            .eq("invited_email", user.email?.toLowerCase());
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth`);
}
