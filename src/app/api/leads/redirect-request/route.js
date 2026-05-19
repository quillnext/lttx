import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const {
            leadId,
            newExpertId,
            newExpertName,
            newExpertEmail,
            questionText,
            userName,
            userEmail
        } = await request.json();

        if (!leadId || !newExpertId || !newExpertEmail) {
            return NextResponse.json(
                { error: "Missing required fields for redirection" },
                { status: 400 }
            );
        }

        const supabase = createSupabaseAdminClient();

        const { data: lead, error: fetchError } = await supabase
            .from("leads")
            .select("form_data, expert_id, expert_name")
            .eq("id", leadId)
            .single();

        if (fetchError || !lead) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        const formData = lead.form_data || {};
        const updatedFormData = {
            ...formData,
            isRedirected: true,
            originalExpertId: lead.expert_id,
            originalExpertName: lead.expert_name,
            reminderCount: 0,
            redirectedAt: new Date().toISOString(),
        };

        // 1. Update Supabase leads
        const { error: updateError } = await supabase
            .from("leads")
            .update({
                expert_id: newExpertId,
                expert_name: newExpertName,
                status: "pending",
                form_data: updatedFormData
            })
            .eq("id", leadId);

        if (updateError) {
            throw updateError;
        }

        const dashboardLink = "https://xmytravel.com/expert-dashboard";

        // 2. Email to NEW Expert
        const expertEmailHtml = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: 'Inter', sans-serif; background: #f3f3f3; padding: 40px 0;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.08);">
          <div style="background: #36013F; padding: 20px; text-align: center;">
             <h2 style="color: #F4D35E; margin: 0;">New Service Request Assigned</h2>
          </div>
          <div style="padding: 32px;">
            <p>Hello <strong>${newExpertName}</strong>,</p>
            <p>A traveler's service request has been redirected to you for your expertise.</p>
            
            <div style="background: #f9f9f9; padding: 16px; border-left: 4px solid #F4D35E; margin: 20px 0;">
               <p style="margin: 0; font-weight: bold;">"${questionText || 'Service Request'}"</p>
               <p style="margin-top: 8px; font-size: 13px; color: #666;">- from ${userName || 'Traveller'}</p>
            </div>

            <p>Please review and provide your answer via the dashboard.</p>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${dashboardLink}" style="background: #36013F; color: white; padding: 12px 24px; border-radius: 30px; text-decoration: none; font-weight: bold;">Reply Now</a>
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
            to: newExpertEmail,
            subject: "New Service Request Assigned to You on XMyTravel",
            html: expertEmailHtml,
        });

        // 3. Email to USER (Notify of redirection)
        if (userEmail) {
            const userEmailHtml = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: 'Inter', sans-serif; background: #f3f3f3; padding: 40px 0;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.08);">
             <div style="padding: 32px;">
              <p>Hello <strong>${userName || 'Traveller'}</strong>,</p>
              <p>We wanted to let you know that we have reassigned your service request to a new expert, <strong>${newExpertName}</strong>, to ensure you get the best possible travel advice.</p>
              
              <p>You will receive a notification as soon as they respond.</p>
              
              <p style="color: #666; font-size: 13px; margin-top: 24px;">Thank you for your patience!</p>
              <p style="color: #36013F; font-weight: bold;">XMyTravel Team</p>
            </div>
          </div>
        </body>
        </html>
      `;

            await sendEmail({
                to: userEmail,
                subject: "Update on your XMyTravel Request",
                html: userEmailHtml,
            });
        }

        return NextResponse.json({ success: true, message: "Request redirected successfully" });
    } catch (error) {
        console.error("Error redirecting request:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
