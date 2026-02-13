import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Lightweight middleware — only checks JWT token, no Prisma/bcrypt imports
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Auth pages — redirect to dashboard if already logged in
  const authPages = ['/login', '/signup'];
  if (authPages.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protected pages — redirect to login if not authenticated
  const protectedPaths = ['/dashboard', '/interview', '/history', '/profile'];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
