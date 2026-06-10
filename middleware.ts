import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes nécessitant une authentification
const PROTECTED = ['/dashboard', '/chat', '/admin'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get('session')?.value;

  // Si la route est protégée et pas de session → rediriger vers login
  if (PROTECTED.some((p) => pathname.startsWith(p)) && !session) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  // Si déjà connecté et va sur /auth → rediriger vers dashboard
  if (pathname.startsWith('/auth') && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/chat/:path*', '/admin/:path*', '/auth'],
};
