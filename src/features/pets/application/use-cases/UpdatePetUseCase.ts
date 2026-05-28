import { IPetRepository } from '../../domain/repositories/IPetRepository';
import { Pet, UpdatePetDTO } from '../../domain/entities/Pet';
import { User } from '@features/auth/domain/entities/User';
import { AppError } from '@shared/domain/errors/AppError';

export class UpdatePetUseCase {
  constructor(private readonly petRepository: IPetRepository) {}

  async execute(dto: UpdatePetDTO, currentUser: User): Promise<Pet> {
    if (currentUser.role !== 'refugio') {
      throw new AppError('FORBIDDEN', 'Solo los refugios pueden editar mascotas');
    }
    return this.petRepository.updatePet(dto);
  }
}
