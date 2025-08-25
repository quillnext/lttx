import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;

  // Dashboard authentication logic
  const isProtected = pathname.startsWith('/dashboard');
  const auth = request.cookies.get('adminAuth')?.value;

  if (isProtected && auth !== 'authenticated') {
    return NextResponse.redirect(new URL('/admin-login', request.url));
  }

  // FAQ URL cleaning logic
  if (pathname.startsWith('/faq/')) {
    const slug = pathname.replace('/faq/', '');
    // Check if the slug contains % or is not already clean
    if (slug.includes('%') || /[^a-z0-9-]/.test(decodeURIComponent(slug))) {
      // Convert % encoded or unclean slug to hyphenated form
      const cleanSlug = decodeURIComponent(slug)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters (matches toSlug in page.js)
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .substring(0, 100); // Limit slug length for URL safety

      // Preserve query parameters if any
      const newUrl = new URL(`/faq/${cleanSlug}`, request.url);
      searchParams.forEach((value, key) => {
        newUrl.searchParams.set(key, value);
      });

      return NextResponse.redirect(newUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/faq/:path*'],
};