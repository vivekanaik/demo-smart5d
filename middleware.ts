import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const authCookie = req.cookies.get('chef_auth');

  if (req.nextUrl.pathname === '/chef/login') {
    return NextResponse.next();
  }

  if (authCookie?.value === 'authenticated') {
    return NextResponse.next();
  }

  const loginUrl = new URL('/chef/login', req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/chef/:path*'],
};
