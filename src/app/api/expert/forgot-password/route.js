import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/email";

const passwordResetEmailHtml = ({ fullName, resetLink }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:32px 12px;background:#f7f4f8;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0"
          style="max-width:520px;background:#ffffff;border:1px solid #ece3ee;border-radius:24px;overflow:hidden;">
          <tr>
            <td height="4" style="height:4px;background:#36013F;border-right:160px solid #F4D35E;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <div style="text-align:center;margin-bottom:28px;">
                <div style="display:inline-block;width:48px;height:48px;border-radius:14px;background:#36013F;color:#F4D35E;text-align:center;line-height:48px;font-size:20px;font-weight:800;">XM</div>
                <div style="font-size:22px;font-weight:800;color:#36013F;margin-top:12px;">XMyTravel</div>
              </div>
              <h1 style="font-size:24px;font-weight:800;color:#36013F;margin:0 0 8px;">Reset Your Password</h1>
              <p style="font-size:14px;line-height:24px;color:#65566a;margin:0 0 28px;">
                Hi ${fullName || "Expert"},<br /><br />
                We received a request to reset the password for your XMyTravel expert account.
                Click the button below to set a new password.
              </p>
              <div style="text-align:center;margin-bottom:28px;">
                <a href="${resetLink}"
                  style="display:inline-block;background:#36013F;color:#ffffff;text-decoration:none;padding:15px 36px;border-radius:12px;font-size:15px;font-weight:800;">
                  Reset Password
                </a>
              </div>
              <p style="font-size:13px;line-height:22px;color:#9a8ea0;margin:0;">
                This link expires in 1 hour. If you didn't request this, you can safely ignore this email.<br /><br />
                Having trouble with the button?<br />
                <a href="${resetLink}" style="color:#36013F;word-break:break-all;">${resetLink}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#1f0123;padding:22px 32px;text-align:center;">
              <div style="font-size:13px;color:#cdbed1;">&copy; ${new Date().getFullYear()} XMyTravel &bull; xmytravel.com</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    let fullName = "";

    // 1. Look up the expert's profile in Supabase by email
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .ilike("email", email.trim())
      .maybeSingle();

    fullName = profile?.full_name || "";

    // 2. Generate Supabase Auth password reset link
    const redirectUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://xmytravel.com'}/expert-reset-password`;
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: email.trim().toLowerCase(),
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (linkErr) {
      console.error("Supabase generateLink error:", linkErr);
      return NextResponse.json({ error: "Account not found or password reset not supported for this email." }, { status: 400 });
    }

    const resetLink = linkData.properties.action_link;

    // 3. Send branded password reset email
    await sendEmail({
      to: email,
      subject: "Reset your XMyTravel expert password",
      html: passwordResetEmailHtml({ fullName, resetLink }),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Expert forgot-password error:", error.message);
    return NextResponse.json(
      { error: "Failed to send password reset email. Please try again." },
      { status: 500 }
    );
  }
}
