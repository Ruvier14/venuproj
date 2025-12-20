import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { width: string; height: string } }) {
  const width = parseInt(params.width, 10) || 400;
  const height = parseInt(params.height, 10) || 300;

  // Generate a simple SVG placeholder
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#e6e6e6"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#888" font-size="24">${width}x${height}</text>
</svg>`;

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
