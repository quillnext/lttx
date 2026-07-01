
import { sendEmail } from "@/lib/email";
import { NextResponse } from "next/server";


export async function POST(request) {
    try {
        const {
            questionId,
            isFirebase,
            oldExpertID, // Expecting ID for logging/history if needed, primarily using Firestore doc data though
            newExpertId,
            newExpertName,
            newExpertEmail,
            questionText, // Optional, can fetch if null
            userName,     // Optional, can fetch if null
            userEmail     // Optional, can fetch if null
        } = await request.json();

        if (!questionId || !newExpertId || !newExpertEmail) {
            return NextResponse.json(
                { error: "Missing required fields for redirection" },
                { status: 400 }
            );
        }

        let currentData = {};
        if (isFirebase !== false) {
            const questionRef = adminDb.collection("Questions").doc(questionId);
            const questionDoc = await questionRef.get();

            if (!questionDoc.exists) {
                if (isFirebase === true) {
                    return NextResponse.json({ error: "Question not found in Firestore" }, { status: 404 });
                }
                // Fallback to Supabase check if isFirebase wasn't explicitly false but Firestore document didn't exist
            } else {
                currentData = questionDoc.data();
            }
        }

        // Check if we need to query Supabase (isFirebase is false, or not found in firestore)
        if (!currentData.question) {
            const { createSupabaseAdminClient } = await import("@/lib/supabaseAdmin");
            const supabase = createSupabaseAdminClient();
            const { data, error } = await supabase
                .from("questions")
                .select("*")
                .eq("id", questionId)
                .single();

            if (error || !data) {
                return NextResponse.json({ error: "Question not found" }, { status: 404 });
            }
            currentData = {
                expertId: data.expert_id,
                expertName: data.expert_name,
                question: data.question,
                userName: data.user_name,
                userEmail: data.user_email,
            };
        }

        const finalQuestionText = questionText || currentData.question;
        const finalUserName = userName || currentData.userName;
        const finalUserEmail = userEmail || currentData.userEmail;

        // Update target database
        if (isFirebase !== false && (await adminDb.collection("Questions").doc(questionId).get()).exists) {
            const questionRef = adminDb.collection("Questions").doc(questionId);
            await questionRef.update({
                expertId: newExpertId,
                expertName: newExpertName,
                expertEmail: newExpertEmail,
                isRedirected: true,
                originalExpertId: currentData.expertId || null,
                originalExpertName: currentData.expertName || null,
                reminderCount: 0,
                status: "pending",
                redirectedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        } else {
            const { createSupabaseAdminClient } = await import("@/lib/supabaseAdmin");
            const supabase = createSupabaseAdminClient();
            const { error: updateError } = await supabase
                .from("questions")
                .update({
                    expert_id: newExpertId,
                    expert_name: newExpertName,
                    expert_email: newExpertEmail,
                    is_redirected: true,
                    original_expert_id: currentData.expertId || null,
                    original_expert_name: currentData.expertName || null,
                    status: "pending",
                    redirected_at: new Date().toISOString(),
                })
                .eq("id", questionId);
            if (updateError) throw updateError;
        }

        const dashboardLink = "https://xmytravel.com/expert-dashboard";

        // 2. Email to NEW Expert
        const expertEmailHtml = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: 'Inter', sans-serif; background: #f3f3f3; padding: 40px 0;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.08);">
          <div style="background: #36013F; padding: 20px; text-align: center;">
             <h2 style="color: #F4D35E; margin: 0;">New Question Assigned</h2>
          </div>
          <div style="padding: 32px;">
            <p>Hello <strong>${newExpertName}</strong>,</p>
            <p>A traveler's question has been redirected to you for your expertise.</p>
            
            <div style="background: #f9f9f9; padding: 16px; border-left: 4px solid #F4D35E; margin: 20px 0;">
               <p style="margin: 0; font-weight: bold;">"${finalQuestionText}"</p>
               <p style="margin-top: 8px; font-size: 13px; color: #666;">- from ${finalUserName}</p>
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
            subject: "New Question Assigned to You on XMyTravel",
            html: expertEmailHtml,
        });

        // 3. Email to USER (Notify of redirection)
        if (finalUserEmail) {
            const userEmailHtml = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: 'Inter', sans-serif; background: #f3f3f3; padding: 40px 0;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.08);">
             <div style="padding: 32px;">
              <p>Hello <strong>${finalUserName}</strong>,</p>
              <p>We wanted to let you know that we have reassigned your question to a new expert, <strong>${newExpertName}</strong>, to ensure you get the best possible travel advice.</p>
              
              <p>You will receive a notification as soon as they respond.</p>
              
              <p style="color: #666; font-size: 13px; margin-top: 24px;">Thank you for your patience!</p>
              <p style="color: #36013F; font-weight: bold;">XMyTravel Team</p>
            </div>
          </div>
        </body>
        </html>
      `;

            await sendEmail({
                to: finalUserEmail,
                subject: "Update on your XMyTravel Question",
                html: userEmailHtml,
            });
        }

        return NextResponse.json({ success: true, message: "Question redirected successfully" });
    } catch (error) {
        console.error("Error redirecting question:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
