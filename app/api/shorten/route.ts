import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { urlDatabase } from '@/lib/database';

const generateShortCode = (length = 6): string => {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required.' }, { status: 400 });
    }

    // Generate a unique short code
    let shortCode = generateShortCode();
    while (urlDatabase[shortCode]) {
      shortCode = generateShortCode();
    }

    const domain = req.headers.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const shortUrl = `${protocol}://${domain}/${shortCode}`;

    urlDatabase[shortCode] = url;

    const qrUrl = await QRCode.toDataURL(shortUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 1,
    });

    return NextResponse.json({ shortUrl, qrUrl }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
