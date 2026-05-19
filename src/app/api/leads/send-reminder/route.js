import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/email";

export async function POST(request) {
    try {
        const { leadId, expertEmail, expertName, questionText } = await request.json();

        if (!leadId || !expertEmail) {
            return NextResponse.json(
                { error: "Missing required fields: leadId or expertEmail" },
                { status: 400 }
            );
        }

        const supabase = createSupabaseAdminClient();

        // Fetch current lead to get form_data
        const { data: lead, error: fetchError } = await supabase
            .from("leads")
            .select("form_data")
            .eq("id", leadId)
            .single();

        if (fetchError || !lead) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        const formData = lead.form_data || {};
        const currentCount = formData.reminderCount || 0;
        
        const updatedFormData = {
            ...formData,
            reminderCount: currentCount + 1,
            lastReminderSentAt: new Date().toISOString()
        };

        // 1. Update Supabase leads
        const { error: updateError } = await supabase
            .from("leads")
            .update({ form_data: updatedFormData })
            .eq("id", leadId);

        if (updateError) {
            throw updateError;
        }

        // 2. Send Email
        const dashboardLink = "https://xmytravel.com/expert-dashboard";

        const emailHtml = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: 'Inter', sans-serif; background: #f3f3f3; padding: 40px 0;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.08);">
          <div style="background: #F4D35E; padding: 20px; text-align: center;">
             <h2 style="color: #36013F; margin: 0;">Gentle Reminder</h2>
          </div>
          <div style="padding: 32px;">
            <p>Hello <strong>${expertName || "Expert"}</strong>,</p>
            <p>This is a friendly reminder that a traveler is waiting for your expert advice on XMyTravel.</p>
            
            <div style="background: #f9f9f9; padding: 16px; border-left: 4px solid #36013F; margin: 20px 0;">
               <p style="margin: 0; font-style: italic;">"${questionText || "A service request has been assigned to you."}"</p>
            </div>

            <p>Please log in to your dashboard to provide an answer at your earliest convenience.</p>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${dashboardLink}" style="background: #36013F; color: white; padding: 12px 24px; border-radius: 30px; text-decoration: none; font-weight: bold;">Go to Dashboard</a>
            </div>
          </div>
          <div style="background: #f3f3f3; padding: 20px; text-align: center; font-size: 12px; color: #888;">
            &copy; ${new Date().getFullYear()} XMyTravel
          </div>
        </div>
      </body>
      </html>
    `;

        await sendEmail({
            to: expertEmail,
            subject: "Reminder: You have a pending service request on XMyTravel",
            html: emailHtml,
        });

        return NextResponse.json({ success: true, message: "Reminder sent successfully" });
    } catch (error) {
        console.error("Error sending reminder:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
