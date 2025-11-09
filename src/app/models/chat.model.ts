export interface ChatMessage {
  id?: string;
  message: string;
  isBot: boolean;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  id: string;
  message: string;
  timestamp: string;
}
