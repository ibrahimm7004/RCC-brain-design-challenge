// lib/agents/invoke-agent.ts
import { bedrockAgentClient } from './client';
import { 
  InvokeAgentCommand, 
  InvokeAgentCommandInput, 
  InvokeAgentCommandOutput 
} from '@aws-sdk/client-bedrock-agent-runtime';
import { logAgentEvent, logAgentError } from './errors';

// Invoke Bedrock agent and return raw response
export async function invokeOuafAgent(message: string): Promise<InvokeAgentCommandOutput> {
  try {
    const params: InvokeAgentCommandInput = {
      agentId: process.env.BEDROCK_AGENT_ID!,
      agentAliasId: process.env.BEDROCK_AGENT_ALIAS_ID!,
      sessionId: crypto.randomUUID(),
      inputText: message,
    };

    logAgentEvent('agent', 'Invoking Bedrock agent');
    
    const command = new InvokeAgentCommand(params);
    const response = await bedrockAgentClient.send(command);

    logAgentEvent('agent', 'Agent response received');
    return response;
    
  } catch (error) {
    logAgentError('agent', error);
    throw new Error(`Failed to invoke agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}