import { IChatRepository } from '../../domain/repositories/IChatRepository';
import { Room, CreateRoomDTO } from '../../domain/entities/Room';
import { User, canCreateRoom } from '@features/auth/domain/entities/User';
import { AppError } from '@shared/domain/errors/AppError';

export class CreateRoomUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  async execute(dto: CreateRoomDTO, currentUser: User): Promise<Room> {
    if (!canCreateRoom(currentUser)) {
      throw new AppError('FORBIDDEN', 'Solo los refugios pueden crear salas de chat');
    }
    if (!dto.name.trim()) {
      throw new AppError('VALIDATION_ERROR', 'El nombre de la sala es obligatorio');
    }
    return this.chatRepository.createRoom(dto);
  }
}