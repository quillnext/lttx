
import { NextResponse } from 'next/server';
import slugify from 'slugify';

export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;

  // Dashboard authentication logic
  const isLegacyDashboard = pathname.startsWith('/dashboard');
  const isAdminPanel = pathname.startsWith('/dashboard');
  const auth = request.cookies.get('adminAuth')?.value;

  // Redirect legacy or new panel if not authenticated via session cookie
  // Note: For Firebase Role Auth, we additionally check inside the layout, 
  // but we keep the cookie check for an initial fast gate.
  if ((isLegacyDashboard || isAdminPanel) && auth !== 'authenticated') {
    return NextResponse.redirect(new URL('/admin-login', request.url));
  }

  // FAQ URL cleaning logic
  if (pathname.startsWith('/aaq/')) {
    const slug = pathname.replace('/aaq/', '');
    if (slug.includes('%') || /[^a-z0-9-]/.test(decodeURIComponent(slug))) {
      const cleanSlug = slugify(decodeURIComponent(slug), {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
        trim: true,
        replacement: '-',
      }).substring(0, 100);

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
