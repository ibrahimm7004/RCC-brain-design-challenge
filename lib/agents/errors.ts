// lib/agents/errors.ts
export const agentErrors = {
  general: 'Something went wrong. Please try again.',
  invalidAgent: 'Unknown agent type.',
  bedrockFailure: 'Failed to invoke OUAF Agent. Please check AWS settings.',
  emptyResponse: 'The agent did not return any response.',
};

export function formatAgentError(error: unknown): string {
  if (error instanceof Error) {
    return `[AgentError] ${error.message}`;
  }
  return '[AgentError] Unknown error occurred.';
}

export function logAgentEvent(agentType: string, message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${agentType.toUpperCase()}]`;
  
  if (data) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }
}

export function logAgentError(agentType: string, error: unknown) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${agentType.toUpperCase()} ERROR]`;
  console.error(prefix, error instanceof Error ? error.stack : error);
}