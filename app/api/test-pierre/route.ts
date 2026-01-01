import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.NANOBANANA_API_KEY;
    
    console.log('🔑 API Key present:', !!apiKey);
    console.log('🔑 API Key preview:', apiKey?.substring(0, 20) + '...');
    
    const model = 'gemini-2.5-flash-image';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    console.log('📡 Testing URL:', url.replace(apiKey || '', 'KEY_HIDDEN'));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'A beautiful sunset over the ocean'
              }
            ]
          }
        ]
      }),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📡 Response body (first 1000 chars):', responseText.substring(0, 1000));

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText,
      bodyPreview: responseText.substring(0, 500)
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
