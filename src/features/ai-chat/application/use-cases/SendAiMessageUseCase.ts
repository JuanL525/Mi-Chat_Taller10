import { IAiChatRepository } from '../../domain/repositories/IAiChatRepository';
import { AiMessage, SendAiMessageDTO } from '../../domain/entities/AiMessage';
import { AppError } from '@shared/domain/errors/AppError';

export class SendAiMessageUseCase {
  constructor(private readonly aiChatRepository: IAiChatRepository) {}

  async execute(dto: SendAiMessageDTO): Promise<AiMessage> {
    if (!dto.prompt.trim()) {
      throw new AppError('VALIDATION_ERROR', 'El mensaje no puede estar vacío');
    }
    return this.aiChatRepository.sendMessage(dto);
  }
}
