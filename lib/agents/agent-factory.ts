// lib/agents/agent-factory.ts
import { invokeOuafAgent } from './invoke-agent';
import { streamAgentResponse } from './stream-utils';
import { InvokeAgentCommandOutput } from '@aws-sdk/client-bedrock-agent-runtime';

// TypeScript overloads for proper return type inference
export async function agentFactory(message: string, stream: true): Promise<AsyncGenerator<string>>;
export async function agentFactory(message: string, stream: false): Promise<string>;
export async function agentFactory(message: string, stream?: boolean): Promise<string>;

// Main entry point - handles both streaming and block responses
export async function agentFactory(
  message: string,
  stream = false
): Promise<string | AsyncGenerator<string>> {
  
  if (stream) {
    const rawResponse = await invokeOuafAgent(message);
    return streamAgentResponse(rawResponse);
  }

  try {
    const rawResponse: InvokeAgentCommandOutput = await invokeOuafAgent(message);
    return await extractTextFromResponse(rawResponse);
  } catch (error) {
    // Handle parsing errors gracefully
    if (error instanceof Error && error.message.includes('parse the model response')) {
      return 'I encountered an issue processing the response. The agent may need configuration updates.';
    }
    throw error;
  }
}

// Extract text from completion stream for block responses
async function extractTextFromResponse(response: InvokeAgentCommandOutput): Promise<string> {
  try {
    if (response.completion) {
      let fullText = '';
      const decoder = new TextDecoder();
      
      for await (const chunk of response.completion) {
        if (chunk.chunk?.bytes) {
          const chunkText = decoder.decode(chunk.chunk.bytes);
          fullText += chunkText;
        }
      }
      
      return fullText.trim() || 'No response content received from agent';
    }

    return 'No completion stream received from agent';
  } catch (error) {
    // Handle parsing errors
    if (error instanceof Error && error.message.includes('parse the model response')) {
      return 'The agent response could not be parsed. Please check your agent configuration.';
    }
    return `Error processing response: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}