/**
 * Automation test script for notification flows.
 * This script starts or targets a running local server at http://localhost:3000 and tests:
 *  1. Booking Confirmation Flow
 *  2. Inquiry Submission Flow
 *  3. Expert Response Flow
 */

const BASE_URL = "http://localhost:3000";

const testPayloads = {
  booking: {
    userEmail: "priyanshu.vermaa0@gmail.com", // Send to your own email for testing
    userName: "John Traveler Test",
    userPhone: "919999999999", // Replace with a real phone number for whatsapp testing
    userMessage: "Looking to plan a 5-day adventure trip.",
    expertEmail: "expert@example.com",
    expertName: "Adventure Expert",
    bookingDate: "2026-06-20",
    bookingTime: "11:30 AM",
    referredByAgencyName: "XMyTravel Referral",
    isHandedOver: true,
  },
  question: {
    userEmail: "priyanshu.vermaa0@gmail.com",
    userName: "John Traveler Test",
    expertEmail: "expert@example.com",
    expertName: "Adventure Expert",
    question: "What equipment do I need for trekking in Ladakh in summer?",
    userPhone: "919999999999",
    keywords: ["ladakh", "trekking", "summer"],
    referredByAgencyName: "Ladakh Travels",
    isHandedOver: true,
  },
  reply: {
    userEmail: "priyanshu.vermaa0@gmail.com",
    userPhone: "919999999999",
    userName: "John Traveler Test",
    expertName: "Adventure Expert",
    expertPhoto: "https://www.xmytravel.com/logolttx.svg",
    serviceType: "Adventure Consultation",
    question: "What equipment do I need for trekking in Ladakh in summer?",
    reply: JSON.stringify({
      diagnosis: "Ladakh in summer is warm during the day but cold at night, with steep altitude changes.",
      coreAdvice: "Pack layered clothing (thermal base, fleece mid-layer, windproof outer-shell) and standard trekking boots.",
      risks: [
        "Altitude sickness (AMS) is common if ascending too fast.",
        "UV index is very high; sun protection is mandatory."
      ],
      optionalSections: {
        nextSteps: "1. Spend 48 hours acclimatizing in Leh.\n2. Purchase a high-altitude travel insurance policy."
      },
      nextStepCta: "Review the checklist and finalize your guide booking by tomorrow.",
    }),
  }
};

async function testEndpoint(endpoint, payload) {
  console.log(`\n==========================================`);
  console.log(`Testing: ${endpoint}`);
  console.log(`Payload:`, JSON.stringify(payload, null, 2));
  console.log(`==========================================`);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    console.log(`Response Status: ${res.status} ${res.statusText}`);
    console.log(`Response Body:`, JSON.stringify(data, null, 2));

    if (res.ok && (data.success || data.userEmailSent || data.whatsappSent)) {
      console.log(`✅ Success for ${endpoint}`);
      return true;
    } else {
      console.log(`❌ Failed for ${endpoint}`);
      return false;
    }
  } catch (error) {
    console.error(`💥 Request Error for ${endpoint}:`, error.message);
    return false;
  }
}

async function runTests() {
  console.log("Starting notification system automation tests...");
  console.log("Checking if local dev server is running at", BASE_URL);

  try {
    const check = await fetch(BASE_URL).catch(() => null);
    if (!check) {
      console.error("\n❌ Error: The local Next.js server is not running!");
      console.error("Please run the local server first with: npm run dev");
      process.exit(1);
    }
    console.log("✅ Local server detected. Proceeding to tests...\n");

    const bookingSuccess = await testEndpoint("/api/send-booking-emails", testPayloads.booking);
    const questionSuccess = await testEndpoint("/api/send-question-emails", testPayloads.question);
    const replySuccess = await testEndpoint("/api/send-expert-reply-email", testPayloads.reply);

    console.log(`\n================ Summary ================`);
    console.log(`Booking Confirmation: ${bookingSuccess ? "PASS ✅" : "FAIL ❌"}`);
    console.log(`Inquiry Submission:   ${questionSuccess ? "PASS ✅" : "FAIL ❌"}`);
    console.log(`Expert Reply Send:    ${replySuccess ? "PASS ✅" : "FAIL ❌"}`);
    console.log(`==========================================`);

  } catch (err) {
    console.error("General test script failure:", err.message);
  }
}

runTests();
