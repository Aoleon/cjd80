import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

function forwardHeaders(request: NextRequest) {
  const headers = new Headers();

  // Forward all headers except problematic ones
  request.headers.forEach((value, key) => {
    if (!key.startsWith(':') && key !== 'host' && key !== 'connection') {
      headers.set(key, value);
    }
  });

  return headers;
}

async function proxyRequest(
  request: NextRequest,
  method: string
): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname.replace('/api/', '');
  const search = request.nextUrl.search;
  const url = `${BACKEND_URL}/api/${pathname}${search}`;

  try {
    const options: RequestInit = {
      method,
      headers: forwardHeaders(request),
      credentials: 'include', // Important pour sessions OAuth
    };

    // Add body for non-GET requests
    if (method !== 'GET' && method !== 'HEAD') {
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        options.body = JSON.stringify(await request.json());
      } else {
        options.body = await request.text();
      }
    }

    const response = await fetch(url, options);

    // Forward response headers (including set-cookie for sessions)
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Backend unavailable' },
      { status: 503 }
    );
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, 'PUT');
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request, 'PATCH');
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, 'DELETE');
}
