import { NextResponse } from 'next/server';
import { getAllTasks } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendData = () => {
        const tasks = getAllTasks();
        const data = `data: ${JSON.stringify(tasks)}\n\n`;
        try {
          controller.enqueue(encoder.encode(data));
        } catch (e) {
          // Client disconnected
        }
      };

      // Send initial data
      sendData();

      // Poll every 1 second
      const intervalId = setInterval(sendData, 1000);

      // Cleanup when stream closes
      // The readable stream cancel method will handle cleanup if we pass the intervalId via a shared state
      // but standard ReadableStream cancel in Next.js SSE might need connection abort handling.
      request.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
      });
    },
    cancel() {
      // Stream cancelled by client
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
