// src/app/feed.xml/route.js

export const dynamic = "force-dynamic";

import { getFirestore, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { app } from "@/lib/firebase";
import slugify from "slugify";

const db = getFirestore(app);
const baseUrl = "https://www.xmytravel.com";

const toSlug = (text) => {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
    trim: true,
    separator: '-',
  }).substring(0, 100);
};

export async function GET() {
  try {
    const q = query(
      collection(db, "Questions"),
      where("isPublic", "==", true),
      where("status", "==", "answered"),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    
    const querySnapshot = await getDocs(q);
    const questions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const feedItems = questions.map(q => {
      const slug = toSlug(q.question);
      const url = `${baseUrl}/aaq/${slug}`;
      const date = q.createdAt ? new Date(q.createdAt).toUTCString() : new Date().toUTCString();
      
      return `
        <item>
          <title><![CDATA[${q.question}]]></title>
          <link>${url}</link>
          <guid isPermaLink="true">${url}</guid>
          <pubDate>${date}</pubDate>
          <description><![CDATA[${q.reply ? q.reply.substring(0, 300) + '...' : 'Expert travel advice on Xmytravel'}]]></description>
          <author>experts@xmytravel.com (Xmytravel Experts)</author>
        </item>
      `;
    }).join('');

    const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
      <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
        <channel>
          <title>Xmytravel — Already Answered Questions</title>
          <link>${baseUrl}</link>
          <description>The latest expert travel advice and answers from Xmytravel community.</description>
          <language>en-us</language>
          <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
          <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
          ${feedItems}
        </channel>
      </rss>
    `;

    return new Response(rssFeed.trim(), {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    return new Response("Error generating RSS feed.", { status: 500 });
  }
}
