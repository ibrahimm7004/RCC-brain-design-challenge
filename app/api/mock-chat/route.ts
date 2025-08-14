// app/api/mock-chat/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const sampleResponse = "This is a mocked response from the local server. It is designed to be long enough to test all the different animation styles without using any live API queries. You can freely test the UI and streaming functionality with this endpoint.";
  const responseChunks = sampleResponse.split(" ");
  
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      // Send the start event
      controller.enqueue(encoder.encode('event: start\ndata: {"type":"start"}\n\n'));

      // Stream the response word by word
      for (const chunk of responseChunks) {
        const chunkData = { type: 'chunk', content: ` ${chunk}` };
        controller.enqueue(encoder.encode(`event: chunk\ndata: ${JSON.stringify(chunkData)}\n\n`));
        // Simulate a natural typing delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 60 + 30));
      }

      // Send the completion event
      controller.enqueue(encoder.encode('event: complete\ndata: {"type":"complete"}\n\n'));
      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}