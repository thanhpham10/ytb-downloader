import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAllTasks } from '@/lib/db';

const openai = new OpenAI({
  apiKey: "csk-kw5yn3d6hy3cxpyjkvtyy4c8mt4jjth4cheyvx8nrwcx84r9", // User provided key
  baseURL: "https://api.cerebras.ai/v1", // Cerebras endpoint
});

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    // Get database context
    const tasks = getAllTasks();
    const dbContext = `
      Current database state (download history):
      ${JSON.stringify(tasks, null, 2)}
    `;

    const systemPrompt = `You are an AI assistant for a YouTube downloader application.
Your name is AI Assistant. You help users manage their downloads and answer questions about the data.
Here is the current state of the database:
${dbContext}
Answer the user's questions based on this data.`;

    const response = await openai.chat.completions.create({
      model: "gpt-oss-120b",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
    });

    return NextResponse.json({ reply: response.choices[0].message.content });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: error.message || 'Error processing AI request' }, { status: 500 });
  }
}
