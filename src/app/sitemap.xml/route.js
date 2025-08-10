// src/app/sitemap.xml/route.js

import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";

const db = getFirestore(app);
const baseUrl = "https://www.xmytravel.com";

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
     
    ].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: route === "/" ? 1.0 : 0.8,
    }));

    // 2. Get Dynamic Expert Profile Routes
    const profilesSnapshot = await getDocs(collection(db, "Profiles"));
    const expertRoutes = profilesSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        if (!data.username) return null; // Skip profiles without a username

        const lastModified =
          data.approvalTimestamp || data.timestamp?.toDate() || new Date();

        return {
          url: `${baseUrl}/experts/${data.username}`,
          lastModified: new Date(lastModified).toISOString(),
          changeFrequency: "weekly",
          priority: 0.9,
        };
      })
      .filter(Boolean); // Remove null entries

    const allRoutes = [...staticRoutes, ...expertRoutes];
    const sitemap = generateSiteMap(allRoutes);

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
