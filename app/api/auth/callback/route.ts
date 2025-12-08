import { NextRequest, NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';

export async function GET(request: NextRequest) {
  // This route handles the OAuth callback
  // NextAuth will automatically handle the OAuth flow
  // You can add custom logic here if needed
  
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
