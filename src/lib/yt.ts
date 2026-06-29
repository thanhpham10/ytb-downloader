import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { updateTask, getTask } from './db';

// Ensure downloads directory exists
const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

export function startDownload(taskId: string, url: string, format: 'mp3' | 'mp4') {
  const task = getTask(taskId);
  if (!task) return;

  const outputTemplate = path.join(downloadsDir, `%(title)s.%(ext)s`);
  
  updateTask(taskId, { status: 'downloading' });

  const args = [
    url,
    '--newline', // Force newline output so we can parse progress
    '-o', outputTemplate,
    '--js-runtimes', 'deno', // Tell yt-dlp to use Deno as the JS runtime
    '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ];

  // Handle YouTube cookies to bypass bot detection (429 / Sign in)
  const cookiesB64 = process.env.YOUTUBE_COOKIES_B64;
  const tempCookiesPath = path.join('/tmp', `cookies_${taskId}.txt`);
  
  if (cookiesB64) {
    try {
      const cookiesText = Buffer.from(cookiesB64, 'base64').toString('utf-8');
      fs.writeFileSync(tempCookiesPath, cookiesText);
      args.push('--cookies', tempCookiesPath);
    } catch (err) {
      console.error('Failed to parse YOUTUBE_COOKIES_B64:', err);
    }
  }

  if (format === 'mp3') {
    args.push('-x', '--audio-format', 'mp3');
  } else {
    args.push('-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best');
  }

  // yt-dlp command (assuming it's installed or we use the binary)
  // For production on Render, we should ensure yt-dlp is in PATH
  const ytProcess = spawn('yt-dlp', args);

  ytProcess.stdout.on('data', (data) => {
    const output = data.toString();
    // Parse progress: e.g. "[download]  45.3%"
    const progressMatch = output.match(/\[download\]\s+(\d+\.?\d*)%/);
    if (progressMatch) {
      const percent = parseFloat(progressMatch[1]);
      updateTask(taskId, { progress: percent });
    }
    
    // Attempt to parse filename (useful for final download link)
    const destMatch = output.match(/Destination:\s+(.*)$/);
    if (destMatch) {
      const fullPath = destMatch[1];
      const relativePath = '/downloads/' + path.basename(fullPath);
      updateTask(taskId, { filePath: relativePath });
    }
  });

  ytProcess.stderr.on('data', (data) => {
    console.error(`[yt-dlp error]: ${data}`);
  });

  ytProcess.on('close', (code) => {
    // Clean up temporary cookies file if it exists
    if (fs.existsSync(tempCookiesPath)) {
      try {
        fs.unlinkSync(tempCookiesPath);
      } catch (err) {
        console.error('Failed to delete temp cookies file:', err);
      }
    }

    if (code === 0) {
      updateTask(taskId, { status: 'completed', progress: 100 });
      // Might need to update filePath again if FFmpeg changed extension during muxing
      // Typically yt-dlp prints "[ffmpeg] Destination: ..." at the end
    } else {
      updateTask(taskId, { status: 'failed' });
    }
  });
}
