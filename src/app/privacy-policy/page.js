"use client";

import Navbar from "../components/Navbar";
import Footer from "../pages/Footer";

export default function PrivacyPolicyPage() {
  return (
    <>
    <Navbar/>
    <div className=" px-5 lg:px-[10%] py-10 lg:py-10 text-[#36013F] mt-10 lg:mt-[5%]">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 mt-10 md:mt-1">📜 Privacy & Policy</h1>

      {/* Privacy Policy */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">1. Privacy Policy</h2>
        <p className="text-sm mb-2">Effective Date: 10/05/2025</p>
        <p className="mb-2">
          Xmytravel is committed to protecting your privacy. We collect only the information necessary to provide you with expert travel consultations, match you with professionals, and improve our services.
        </p>
        <p className="font-semibold">What We Collect:</p>
        <ul className="list-disc list-inside mb-2">
          <li>Name, email, and profile information</li>
          <li>Query data, consultation history</li>
          <li>Payment and transaction records (processed via secure third-party gateways)</li>
          <li>Optional expert credentials (for verification)</li>
        </ul>
        <p className="font-semibold">How We Use It:</p>
        <ul className="list-disc list-inside mb-2">
          <li>To provide relevant services to travelers and experts</li>
          <li>To verify and onboard experts</li>
          <li>To maintain account security and customer support</li>
          <li>For platform analytics (anonymized)</li>
        </ul>
        <p className="mb-2 font-medium">We do not sell your personal data. Ever.</p>
        <p>For any privacy-related queries, email us at: <a href="mailto:Info@xmytravel.com" className="underline text-blue-700">Info@xmytravel.com</a></p>
      </section>

      {/* Terms of Service */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">2. Terms of Service</h2>
        <p className="mb-2">Welcome to Xmytravel. By signing up or using our services, you agree to the following:</p>
        <p className="font-semibold">For Travelers:</p>
        <ul className="list-disc list-inside mb-2">
          <li>You agree to engage respectfully and professionally with experts.</li>
          <li>You understand that expert advice is based on professional experience, and not guaranteed for legal outcomes (e.g., visa approvals).</li>
          <li>You are responsible for any actions taken after consultation.</li>
        </ul>
        <p className="font-semibold">For Experts:</p>
        <ul className="list-disc list-inside mb-2">
          <li>You confirm the accuracy of your professional experience and credentials.</li>
          <li>You agree to uphold the values of responsibility, integrity, and unbiased consultation.</li>
          <li>You will not upsell products or services outside the platform during consultations.</li>
        </ul>
        <p className="font-semibold">All Users:</p>
        <ul className="list-disc list-inside mb-2">
          <li>Hate speech, scams, or any form of abusive behavior will result in account suspension.</li>
          <li>Xmytravel reserves the right to modify, suspend, or discontinue services as needed.</li>
        </ul>
        <p>Questions? Contact: <a href="mailto:Info@xmytravel.com" className="underline text-blue-700">Info@xmytravel.com</a></p>
      </section>

      {/* Expert Verification Policy */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">3. Expert Verification Policy</h2>
        <p className="mb-2">Xmytravel is an invite-only platform for experts. Each expert undergoes a strict curation process.</p>
        <p className="font-semibold">Criteria:</p>
        <ul className="list-disc list-inside mb-2">
          <li>Minimum 5 years of relevant travel industry experience</li>
          <li>Background in aviation, visa, tourism, hospitality, or related fields</li>
          <li>Submitted resume, LinkedIn profile, or reference checks</li>
        </ul>
        <p className="font-semibold">Rejection/Removal:</p>
        <ul className="list-disc list-inside">
          <li>Xmytravel reserves the right to reject or suspend experts who misrepresent credentials or violate community standards.</li>
        </ul>
      </section>

      {/* Refund Policy */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">4. Refund Policy</h2>
        <p className="font-semibold">Travelers:</p>
        <ul className="list-disc list-inside mb-2">
          <li>If you cancel a consultation 12 hours before the scheduled time, you’ll receive a full refund.</li>
          <li>No refunds for last-minute cancellations or no-shows.</li>
          <li>If an expert fails to join or doesn’t respond, we’ll either reschedule or issue a full refund.</li>
        </ul>
        <p className="font-semibold">Experts:</p>
        <ul className="list-disc list-inside">
          <li>You will not be paid for consultations missed without notice.</li>
          <li>Disputes will be handled by Xmytravel support within 5 business days.</li>
        </ul>
      </section>

      {/* Content & Community Policy */}
      <section >
        <h2 className="text-2xl font-semibold mb-2">5. Content & Community Policy</h2>
        <ul className="list-disc list-inside mb-2">
          <li>Do not post or share misleading, AI-generated, or plagiarized content.</li>
          <li>All advice must be neutral and not influenced by affiliate commissions or promotions.</li>
          <li>Discussions must remain civil, informative, and respectful.</li>
        </ul>
        <p>Violation of these rules may result in a warning, suspension, or permanent removal.</p>
      </section>
    </div>
    <Footer/>
    </>
  );
}
