import { NextResponse } from 'next/server';
import slugify from 'slugify';

export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;

  // Dashboard authentication logic
  const isProtected = pathname.startsWith('/dashboard');
  const auth = request.cookies.get('adminAuth')?.value;

  if (isProtected && auth !== 'authenticated') {
    return NextResponse.redirect(new URL('/admin-login', request.url));
  }

  // FAQ URL cleaning logic
  if (pathname.startsWith('/aaq/')) {
    const slug = pathname.replace('/aaq/', '');
    // Check if the slug contains % or is not already clean
    if (slug.includes('%') || /[^a-z0-9-]/.test(decodeURIComponent(slug))) {
      // Convert to hyphenated slug using slugify
      const cleanSlug = slugify(decodeURIComponent(slug), {
        lower: true,
        strict: true, // Remove special characters
        remove: /[*+~.()'"!:@]/g, // Remove additional special characters
        trim: true,
        replacement: '-', // Replace spaces with hyphens
      }).substring(0, 100); // Limit slug length

      // Preserve query parameters if any
      const newUrl = new URL(`/aaq/${cleanSlug}`, request.url);
      searchParams.forEach((value, key) => {
        newUrl.searchParams.set(key, value);
      });

      return NextResponse.redirect(newUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/aaq/:path*'],
};