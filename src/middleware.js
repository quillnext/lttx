
import { NextResponse } from 'next/server';
import slugify from 'slugify';

export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;

  // Dashboard authentication logic
  const isAdminDashboard = pathname.startsWith('/dashboard');
  const isExpertDashboard = pathname.startsWith('/expert-dashboard');
  const isAgencyDashboard = pathname.startsWith('/agency-dashboard');
  const isUserDashboard = pathname.startsWith('/user-dashboard');
  
  const auth = request.cookies.get('adminAuth')?.value;

  if (isAdminDashboard && auth !== 'authenticated') {
    return NextResponse.redirect(new URL('/admin-login', request.url));
  }

  // We can let the layout files do specific role checks, but if session cookie isn't set, we redirect to login
  if ((isExpertDashboard || isAgencyDashboard || isUserDashboard) && auth !== 'authenticated') {
    const role = isExpertDashboard ? 'expert' : isAgencyDashboard ? 'agency' : 'user';
    return NextResponse.redirect(new URL(`/login?role=${role}`, request.url));
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
  matcher: ['/dashboard/:path*', '/expert-dashboard/:path*', '/agency-dashboard/:path*', '/user-dashboard/:path*', '/aaq/:path*'],
};
