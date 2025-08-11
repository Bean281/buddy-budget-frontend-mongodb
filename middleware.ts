import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard-overview',
  '/dashboard',
  '/profile',
  '/settings',
  '/transactions',
  '/categories',
  '/bills',
  '/savings-goals',
  '/statistics',
  '/planning',
];

// Define public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the auth token from cookies (more reliable for SSR)
  const token = request.cookies.get('auth_token')?.value;
  
  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the current path is public auth route
  const isPublicAuthRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Handle root path redirection
  if (pathname === '/') {
    if (token) {
      // Authenticated user: redirect to dashboard-overview
      return NextResponse.redirect(new URL('/dashboard-overview', request.url));
    } else {
      // Unauthenticated user: redirect to login (user starts with login page)
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // If user is not authenticated and trying to access protected route
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    // Store the intended destination to redirect after login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (token && isPublicAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard-overview', request.url));
  }
  
  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}; 