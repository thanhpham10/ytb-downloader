import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createTask } from '@/lib/db';
import { startDownload } from '@/lib/yt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, format } = body;

    if (!url || !format) {
      return NextResponse.json({ error: 'URL and format are required' }, { status: 400 });
    }

    // Basic URL validation
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    const taskId = uuidv4();
    createTask(taskId, url, format);
    
    // Start background download
    startDownload(taskId, url, format);

    return NextResponse.json({ success: true, taskId });
  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
