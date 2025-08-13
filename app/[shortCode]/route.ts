import { NextRequest, NextResponse } from 'next/server';
import { urlDatabase } from '@/lib/database';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params;
    const originalUrl = urlDatabase[shortCode];

    if (originalUrl) {
      return NextResponse.redirect(originalUrl, 301);
    } else {
      return NextResponse.redirect(new URL('/', req.url), 301);
    }
  } catch (error) {
    console.error('Redirect error:', error);
    return NextResponse.redirect(new URL('/', req.url), 301);
  }
}