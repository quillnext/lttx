export const dynamic = "force-dynamic";

import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { app } from "@/lib/firebase";
import slugify from "slugify";

const db = getFirestore(app);
const baseUrl = "https://www.xmytravel.com";

// Helper function keys for slug generation (ensure consistency with AAQ page)
const toSlug = (text) => {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
    trim: true,
    replacement: '-',
  }).substring(0, 100);
};

function generateSiteMap(allRoutes) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${allRoutes
      .map(({ url, lastModified, changeFrequency, priority }) => {
        return `
       <url>
           <loc>${url}</loc>
           <lastmod>${lastModified}</lastmod>
           <changefreq>${changeFrequency}</changefreq>
           <priority>${priority}</priority>
       </url>
     `;
      })
      .join("")}
   </urlset>
 `;
}

export async function GET() {
  try {
    // 1. Get Static Routes
    const staticRoutes = [
      "/",
      "/about",
      "/privacy-policy",
      "/expert-login",
      "/expert-forgot-password",
      "/aaq",
      "/news-and-media",
      "/ask-an-expert",
      "/join-us",
    ].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: route === "/" ? 1.0 : 0.8,
    }));

    // 2. Get Dynamic Expert Profile Routes
    const profilesSnapshot = await getDocs(collection(db, "Profiles"));
    const expertRoutes = [];
    const agencyRoutes = [];

    profilesSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (!data.username) return;

      const lastModified = data.approvalTimestamp || data.timestamp?.toDate() || new Date();
      const route = {
        lastModified: new Date(lastModified).toISOString(),
        changeFrequency: "weekly",
        priority: 0.9,
      };

      if (data.profileType === 'agency') {
        agencyRoutes.push({ ...route, url: `${baseUrl}/agency/${data.username}` });
      } else {
        expertRoutes.push({ ...route, url: `${baseUrl}/experts/${data.username}` });
      }
    });

    // 3. Get Dynamic Question Routes (AAQ)
    // ... (logic remains same for questionRoutes and answerRoutes)
    const q = query(
      collection(db, "Questions"),
      where("isPublic", "==", true),
      where("status", "==", "answered")
    );
    const questionsSnapshot = await getDocs(q);
    const questionRoutes = questionsSnapshot.docs.map((doc) => {
      const data = doc.data();
      if (!data.question) return null;

      const slug = toSlug(data.question);
      const lastModified = data.updatedAt ? new Date(data.updatedAt) : (data.createdAt ? new Date(data.createdAt) : new Date());

      return {
        url: `${baseUrl}/aaq/${slug}`,
        lastModified: lastModified.toISOString(),
        changeFrequency: "weekly",
        priority: 0.8,
      };
    }).filter(Boolean);

    // 4. Get Dynamic AI Answer Routes (RecentSearches)
    const recentSearchesQuery = query(
      collection(db, "RecentSearches"),
      where("isIndexed", "==", true)
    );
    const recentSearchesSnapshot = await getDocs(recentSearchesQuery);
    const answerRoutes = recentSearchesSnapshot.docs.map((doc) => {
      const data = doc.data();
      if (!data.slug) return null;

      const lastModified = data.timestamp ? new Date(data.timestamp) : new Date();

      return {
        url: `${baseUrl}/answers/${data.slug}`,
        lastModified: lastModified.toISOString(),
        changeFrequency: "weekly",
        priority: 0.7,
      };
    }).filter(Boolean);

    const allRoutes = [...staticRoutes, ...expertRoutes, ...agencyRoutes, ...questionRoutes, ...answerRoutes];
    const sitemap = generateSiteMap(allRoutes).trim();

    return new Response(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response("Error generating sitemap.", { status: 500 });
  }
}
