import { AiMessage, SendAiMessageDTO } from '../entities/AiMessage';

export interface IAiChatRepository {
  sendMessage(dto: SendAiMessageDTO): Promise<AiMessage>;
}
