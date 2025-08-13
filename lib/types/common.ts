// lib/types/common.ts

// Chat API request payload
export interface ChatRequest {
  message: string;
  stream?: boolean;
}

// Chat API response format
export interface ChatResponse {
  success: boolean;
  data?: string;
  error?: string;
  timestamp?: string;
}

// Server-Sent Event chunk format for streaming
export interface StreamChunk {
  type: 'start' | 'chunk' | 'complete' | 'error';
  content?: string;
  error?: string;
  timestamp?: string;
}