
export const dynamic = "force-dynamic";

import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { notFound } from "next/navigation";
import SearchLayoutSSR from "./SearchLayoutSSR";
import Navbar from "../../components/Navbar";
import Footer from "../../pages/Footer";

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK);
        initializeApp({
            credential: cert(serviceAccount),
        });
    } catch (error) {
        console.error("Firebase Admin Init Error:", error);
    }
}

const db = getFirestore();

export async function generateMetadata({ params }) {
    const { slug } = await params;

    const searchSnapshot = await db
        .collection("RecentSearches")
        .where("slug", "==", slug)
        .limit(1)
        .get();

    if (searchSnapshot.empty) {
        return {
            title: "Expert Travel Tips | Xmytravel",
        };
    }

    const data = searchSnapshot.docs[0].data();
    const queryTitle = data.query.charAt(0).toUpperCase() + data.query.slice(1).toLowerCase();
    const sections = data.sections || {};

    // Build specific description from Strategic Insights if available
    let insightSnippet = "";
    if (sections.weather?.weatherInfo?.season) insightSnippet += `Best time: ${sections.weather.weatherInfo.season}. `;
    if (sections.visa?.visaSnapshot?.title) insightSnippet += `Visa: ${sections.visa.visaSnapshot.title}. `;
    if (sections.budget?.budgetInfo?.dailyEstimate) insightSnippet += `Budget: Around ${sections.budget.budgetInfo.dailyEstimate}. `;

    const baseDescription = `Expert travel insights for ${queryTitle}. ${insightSnippet}`;
    const seoDescription = baseDescription.length > 155 ? baseDescription.substring(0, 155).trim() + "..." : baseDescription;
    const seoTitle = `${queryTitle} Travel Guide | Xmytravel`;

    return {
        title: seoTitle.length > 60 ? seoTitle.substring(0, 57) + "..." : seoTitle,
        description: seoDescription,
        keywords: `${data.query}, travel guide, travel tips, expert travel advice, itinerary`,
        authors: [{ name: "Xmytravel Expert Team" }],
        publisher: "Xmytravel",
        robots: {
            index: data.isIndexed || false,
            follow: data.isIndexed || false,
        },
        alternates: {
            canonical: `https://www.xmytravel.com/answers/${slug}`,
        },
        openGraph: {
            title: queryTitle,
            description: seoDescription,
            url: `https://www.xmytravel.com/answers/${slug}`,
            siteName: "Xmytravel",
            type: "article",
        }
    };
}

import JsonLd from "../../components/JsonLd";

export default async function PublicAnswerPage({ params }) {
    const { slug } = await params;

    const searchSnapshot = await db
        .collection("RecentSearches")
        .where("slug", "==", slug)
        .limit(1)
        .get();

    if (searchSnapshot.empty) {
        notFound();
    }

    // ... (helper code for calculateYears remains same)
    const calculateYears = (experience) => {
        if (!Array.isArray(experience) || experience.length === 0) return 0;
        const today = new Date();
        let earliestStart = new Date();
        let hasValidDate = false;

        experience.forEach((exp) => {
            if (exp.startDate) {
                const startDate = new Date(exp.startDate);
                if (!isNaN(startDate.getTime())) {
                    if (startDate.getTime() < earliestStart.getTime()) {
                        earliestStart = startDate;
                        hasValidDate = true;
                    }
                }
            }
        });

        if (!hasValidDate) return 0;
        const diffTime = Math.abs(today.getTime() - earliestStart.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));
    };

    const data = searchSnapshot.docs[0].data();

    // Fetch full expert details for enriched cards
    const enrichedExperts = await Promise.all((data.experts || []).map(async (expert) => {
        try {
            const profileDoc = await db.collection("Profiles").doc(expert.id).get();
            if (profileDoc.exists) {
                const p = profileDoc.data();
                const years = p.profileType === 'agency'
                    ? (parseInt(p.yearsActive) || 0)
                    : calculateYears(p.experience);

                return {
                    ...expert,
                    username: p.username || expert.username,
                    location: p.location || "Global",
                    expertise: (p.expertise || []).slice(0, 3),
                    tagline: p.tagline || "",
                    yearsOfExperience: years,
                    profileType: p.profileType || 'expert'
                };
            }
        } catch (err) {
            console.error("Error fetching detailed expert data:", err);
        }
        return expert;
    }));

    // Extract Dynamic Points for Strategic Insights without repeating the query
    const sections = data.sections || {};
    let strategicBody = "";
    
    // Indian Insights
    if (sections.indian_perspective?.indianPerspective) {
        const { pros = [], cons = [] } = sections.indian_perspective.indianPerspective;
        if (pros.length) strategicBody += `Indian Traveler Insights: ${pros.join(', ')}. `;
        if (cons.length) strategicBody += `Travel Cautions: ${cons.join(', ')}. `;
    }

    // Visa & Entry
    if (sections.visa?.visaSnapshot) {
        strategicBody += `Visa & Entry: ${sections.visa.visaSnapshot.title || 'Standard Protocols'}. ${sections.visa.visaSnapshot.points?.join(' ') || ''} `;
    }

    // Best Time
    if (sections.weather?.weatherInfo) {
        strategicBody += `Best Time to Visit: ${sections.weather.weatherInfo.season || 'Peak Season'}. Temperature: ${sections.weather.weatherInfo.temperature || ''}. Tips: ${sections.weather.weatherInfo.advice?.join(', ') || ''}. `;
    }

    // Budget
    if (sections.budget?.budgetInfo) {
        strategicBody += `Budgeting: Around ${sections.budget.budgetInfo.dailyEstimate || 'Flexible'}. Tips: ${sections.budget.budgetInfo.tips?.join(', ') || ''}. `;
    }

    // Transport
    if (sections.transport?.transportInfo) {
        strategicBody += `Transport Logistics: ${sections.transport.transportInfo.bestRoute || 'High connectivity'}. Local transit: ${sections.transport.transportInfo.localTravel || ''}. `;
    }

    // Safety
    if (sections.common_problems?.list) {
        const problems = sections.common_problems.list.map(p => p.problem).filter(Boolean);
        if (problems.length) strategicBody += `Safety & Security: ${problems.join('. ')}. `;
    }

    // Generate Structured Data for AEO
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": `${data.query.charAt(0).toUpperCase() + data.query.slice(1)} | Xmytravel Expert Insights`,
        "description": strategicBody.substring(0, 160).trim() + "...",
        "articleBody": strategicBody.trim(),
        "author": {
            "@type": "Organization",
            "name": "Xmytravel Expert Team"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Xmytravel",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.xmytravel.com/logolttx.svg"
            }
        },
        "datePublished": data.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString()
    };

    // Construct Rich FAQ Entities from Strategic Insights
    const faqEntities = [];

    if (sections.visa?.visaSnapshot) {
        faqEntities.push({
            "@type": "Question",
            "name": "Visa & Entry Requirements",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": `${sections.visa.visaSnapshot.title || 'Standard Protocols'}. ${sections.visa.visaSnapshot.points?.[0] || 'Check current travel advisory.'}`
            }
        });
    }

    if (sections.weather?.weatherInfo) {
        faqEntities.push({
            "@type": "Question",
            "name": "Best Time to Visit & Weather",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": `${sections.weather.weatherInfo.season || 'Peak season'} offers ${sections.weather.weatherInfo.temperature || 'optimal'} conditions.`
            }
        });
    }

    if (sections.budget?.budgetInfo) {
        faqEntities.push({
            "@type": "Question",
            "name": "Budget & Daily Expenses",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": `Estimated daily budget: ${sections.budget.budgetInfo.dailyEstimate || 'Flexible'}. ${sections.budget.budgetInfo.tips?.[0] || ''}`
            }
        });
    }

    // Supplement with existing related questions (cleaned of query)
    const related = (sections.related_questions?.relatedQuestions || []).slice(0, 3).map(q => ({
        "@type": "Question",
        "name": q.question,
        "acceptedAnswer": {
            "@type": "Answer",
            "text": q.teaserAnswer || "View expert answer on Xmytravel."
        }
    }));

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [...faqEntities, ...related]
    };

    // Final Fallback
    if (faqSchema.mainEntity.length === 0) {
        faqSchema.mainEntity.push({
            "@type": "Question",
            "name": "Expert Travel Advisory",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": strategicBody || "Consult with a verified travel expert for the most up-to-date information."
            }
        });
    }

    return (
        <div className="bg-white min-h-screen">
            <Navbar />
            <JsonLd schema={articleSchema} />
            <JsonLd schema={faqSchema} />
            <div className="pt-0 pb-0">
                <SearchLayoutSSR
                    query={data.query}
                    experts={enrichedExperts}
                    context={data.context || {}}
                    sections={data.sections || {}}
                />
            </div>
            <Footer />
        </div>
    );
}
