// lib/agents/client.ts
import { BedrockAgentRuntimeClient } from '@aws-sdk/client-bedrock-agent-runtime';

// Validate required environment variables at module load time
const requiredEnvVars = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'];
const missingVars = requiredEnvVars.filter(key => !process.env[key]);

if (missingVars.length > 0) {
  throw new Error(`Missing required AWS environment variables: ${missingVars.join(', ')}`);
}

// Initialize the Bedrock Agent Runtime client
export const bedrockAgentClient = new BedrockAgentRuntimeClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  maxAttempts: 3,
  requestHandler: {
    requestTimeout: 30000,
  },
});