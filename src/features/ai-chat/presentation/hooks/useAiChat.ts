import { useState, useCallback } from 'react';
import { AiMessage, createAiMessage } from '../../domain/entities/AiMessage';
import { sendAiMessageUseCase } from '../../../../di/container';

export function useAiChat() {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;

    const userMsg = createAiMessage('user', prompt);
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendAiMessageUseCase.execute({
        prompt,
        history: messages,
      });
      setMessages((prev) => [...prev, response]);
    } catch (e: any) {
      setError(e.message ?? 'Error al enviar mensaje');
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearChat };
}
