import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes each role can access (beyond login)
const ROLE_ALLOWED_PATHS: Record<string, string[]> = {
  owner: [], // owner can access everything — empty means no restriction
  manager: ['/admin', '/admin/orders', '/admin/billing', '/admin/kitchen', '/admin/inventory', '/admin/tables', '/admin/notifications', '/admin/settings', '/admin/dashboard'],
  waiter: ['/admin/billing', '/admin/tables', '/admin/kitchen'],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ---- Chef auth ----
  if (pathname.startsWith('/chef')) {
    if (pathname === '/chef/login') return NextResponse.next();
    const chefAuth = req.cookies.get('chef_auth');
    if (chefAuth?.value === 'authenticated') return NextResponse.next();
    return NextResponse.redirect(new URL('/chef/login', req.url));
  }

  // ---- Admin auth ----
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next();

    const adminAuth = req.cookies.get('admin_auth')?.value as string | undefined;

    // Not logged in → redirect to login
    if (!adminAuth || !['owner', 'manager', 'waiter'].includes(adminAuth)) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    // Owner can access everything
    if (adminAuth === 'owner') return NextResponse.next();

    // Check role-based path access
    const allowedPaths = ROLE_ALLOWED_PATHS[adminAuth] ?? [];
    const isAllowed = allowedPaths.some(
      (allowed) => pathname === allowed || pathname.startsWith(allowed + '/')
    );

    if (!isAllowed) {
      // Redirect to first allowed page
      const firstAllowed = allowedPaths[0] ?? '/admin/login';
      return NextResponse.redirect(new URL(firstAllowed, req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/chef/:path*', '/admin/:path*'],
};
