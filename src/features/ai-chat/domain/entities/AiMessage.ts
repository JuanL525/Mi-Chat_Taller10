export type AiRole = 'user' | 'model';

export interface AiMessage {
  id: string;
  role: AiRole;
  content: string;
  createdAt: string;
}

export interface SendAiMessageDTO {
  prompt: string;
  history: AiMessage[];
}

export function createAiMessage(role: AiRole, content: string): AiMessage {
  return {
    id: `${Date.now()}-${Math.random()}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}
