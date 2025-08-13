// app/api/chat/route.ts
import { agentFactory } from '@/lib/agents/agent-factory';
import { formatAgentError, agentErrors, logAgentEvent, logAgentError } from '@/lib/agents/errors';

interface ChatRequest {
  message: string;
  stream?: boolean; // true for streaming, false for block response
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, stream = false } = body as ChatRequest;

    // Validate message
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Message is required and must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    logAgentEvent('chat', 'Incoming message', { message, stream });

    if (!stream) {
      // Block mode: return complete response
      const response = await agentFactory(message, false);
      
      logAgentEvent('chat', 'Block response ready');

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: response,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Stream mode: return Server-Sent Events
    logAgentEvent('chat', 'Starting stream response');
    
    const streamGenerator = await agentFactory(message, true);

    const streamResponse = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          // Send start event
          controller.enqueue(encoder.encode(`event: start\ndata: {"type":"start"}\n\n`));
          
          // Send chunks
          for await (const chunk of streamGenerator) {
            if (chunk) {
              const data = JSON.stringify({
                type: 'chunk',
                content: chunk,
                timestamp: new Date().toISOString()
              });
              controller.enqueue(encoder.encode(`event: chunk\ndata: ${data}\n\n`));
            }
          }
          
          // Send completion
          controller.enqueue(encoder.encode(`event: complete\ndata: {"type":"complete"}\n\n`));
          
        } catch (error) {
          logAgentError('chat', error);
          
          const errorData = JSON.stringify({
            type: 'error',
            error: formatAgentError(error)
          });
          controller.enqueue(encoder.encode(`event: error\ndata: ${errorData}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(streamResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (err) {
    logAgentError('chat', err);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: formatAgentError(err) || agentErrors.general,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}