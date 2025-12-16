import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // This route handles the OAuth callback
  // NextAuth will automatically handle the OAuth flow via the [...nextauth] route
  // You can add custom logic here if needed
  
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
