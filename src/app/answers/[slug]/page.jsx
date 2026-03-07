
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
    const queryTitle = data.query.charAt(0).toUpperCase() + data.query.slice(1);

    return {
        title: `${queryTitle} - Expert Travel Insights | Xmytravel`,
        description: `Detailed travel advice, budget tips, weather info, and expert matches for: ${data.query}. Plan your trip with Xmytravel.`,
        robots: {
            index: data.isIndexed || false,
            follow: data.isIndexed || false,
        },
        alternates: {
            canonical: `https://lttx.in/answers/${slug}`,
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

    const data = searchSnapshot.docs[0].data();

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />
            <div className="pt-24 pb-12">
                <SearchLayoutSSR
                    query={data.query}
                    experts={data.experts || []}
                    context={data.context || {}}
                    sections={data.sections || {}}
                />
            </div>
            <Footer />
        </div>
    );
}
