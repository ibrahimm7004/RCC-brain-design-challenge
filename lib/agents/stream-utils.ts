// lib/agents/stream-utils.ts
import { InvokeAgentCommandOutput } from '@aws-sdk/client-bedrock-agent-runtime';

// Process completion stream and yield chunks for real-time streaming
export async function* streamAgentResponse(response: InvokeAgentCommandOutput): AsyncGenerator<string> {
  try {
    const { completion } = response;

    if (!completion) {
      yield 'No response from agent.';
      return;
    }

    const decoder = new TextDecoder();

    try {
      for await (const chunk of completion) {
        if (chunk.chunk?.bytes) {
          const decodedText = decoder.decode(chunk.chunk.bytes);
          yield decodedText;
        }
      }
    } catch (parseError) {
      // Handle parsing errors in stream
      if (parseError instanceof Error && parseError.message.includes('parse the model response')) {
        yield 'The agent response could not be parsed. Please check your agent configuration.';
      } else {
        yield `Stream error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`;
      }
    }
    
  } catch (error) {
    yield `Stream Error: ${error instanceof Error ? error.message : 'Unknown streaming error'}`;
  }
}