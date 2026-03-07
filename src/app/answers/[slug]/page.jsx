
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
            title: "Traveling Tips - LTTX",
        };
    }

    const data = searchSnapshot.docs[0].data();
    const queryTitle = data.query.charAt(0).toUpperCase() + data.query.slice(1).toLowerCase();

    // SEO Optimization: Keeping title under 60-70 chars and description around 155
    const seoTitle = `${queryTitle} | Expert Travel Guide`;
    const seoDescription = `Get expert travel insights for ${queryTitle}. Includes budget tips, visa info, weather, and expert recommendations for your perfect trip.`;

    // Break query into keywords, filtering out small words
    const queryKeywords = data.query.split(' ').filter(word => word.length > 3).join(', ');

    return {
        title: seoTitle,
        description: seoDescription,
        keywords: `${queryKeywords}, ${data.query},xmytravel, travel guide, travel tips, expert travel advice,itinerary`,
        authors: [{ name: "Xmytravel Expert Team" }],
        publisher: "Xmytravel",
        robots: {
            index: data.isIndexed || false,
            follow: data.isIndexed || false,
        },
        alternates: {
            canonical: `https://xmytravel.com/answers/${slug}`,
        },
        openGraph: {
            title: seoTitle,
            description: seoDescription,
            url: `https://xmytravel.com/answers/${slug}`,
            siteName: "Xmytravel",
            type: "article",
        }
    };
}

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

    // Helper to calculate years of experience
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
                    yearsOfExperience: years
                };
            }
        } catch (err) {
            console.error("Error fetching detailed expert data:", err);
        }
        return expert;
    }));

    return (
        <div className="bg-white min-h-screen">
            <Navbar />
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
