// src/app/robots.txt/route.js

const baseUrl = "https://www.xmytravel.com";

export async function GET() {
  const content = `User-agent: *
Allow: /
Disallow: /admin-login
Disallow: /dashboard/
Disallow: /expert-login
Disallow: /expert-dashboard/

# Enhanced rules for AI Answer Engines
User-agent: GPTBot
Allow: /aaq/
Allow: /answers/
Disallow: /dashboard/

User-agent: PerplexityBot
Allow: /aaq/
Allow: /answers/

User-agent: ClaudeBot
Allow: /aaq/
Allow: /answers/

Sitemap: ${baseUrl}/sitemap.xml
`;

  return new Response(content.trim(), {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
