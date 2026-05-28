import { IPetRepository } from '../../domain/repositories/IPetRepository';
import { User } from '@features/auth/domain/entities/User';
import { AppError } from '@shared/domain/errors/AppError';

export class DeletePetUseCase {
  constructor(private readonly petRepository: IPetRepository) {}

  async execute(petId: string, currentUser: User): Promise<void> {
    if (currentUser.role !== 'refugio') {
      throw new AppError('FORBIDDEN', 'Solo los refugios pueden eliminar mascotas');
    }
    return this.petRepository.deletePet(petId);
  }
}
