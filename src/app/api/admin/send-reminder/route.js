import { adminDb } from "@/lib/firebaseAdmin";
import { sendEmail } from "@/lib/email";
import { NextResponse } from "next/server";
import admin from "firebase-admin";

export async function POST(request) {
    try {
        const { questionId, expertEmail, expertName, questionText } = await request.json();

        if (!questionId || !expertEmail) {
            return NextResponse.json(
                { error: "Missing required fields: questionId or expertEmail" },
                { status: 400 }
            );
        }

        // 1. Update Firestore
        const questionRef = adminDb.collection("Questions").doc(questionId);
        await questionRef.update({
            reminderCount: admin.firestore.FieldValue.increment(1),
            lastReminderSentAt: admin.firestore.FieldValue.serverTimestamp(),
        });

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
            <p>Hello <strong>${expertName}</strong>,</p>
            <p>This is a friendly reminder that a traveler is waiting for your expert advice on XMyTravel.</p>
            
            <div style="background: #f9f9f9; padding: 16px; border-left: 4px solid #36013F; margin: 20px 0;">
               <p style="margin: 0; font-style: italic;">"${questionText}"</p>
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
            subject: "Reminder: You have a pending question on XMyTravel",
            html: emailHtml,
        });

        return NextResponse.json({ success: true, message: "Reminder sent successfully" });
    } catch (error) {
        console.error("Error sending reminder:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
