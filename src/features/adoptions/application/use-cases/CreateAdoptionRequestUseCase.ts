import { IAdoptionRepository } from '../../domain/repositories/IAdoptionRepository';
import { AdoptionRequest, CreateAdoptionRequestDTO } from '../../domain/entities/AdoptionRequest';
import { User } from '@features/auth/domain/entities/User';
import { AppError } from '@shared/domain/errors/AppError';

export class CreateAdoptionRequestUseCase {
  constructor(private readonly adoptionRepository: IAdoptionRepository) {}

  async execute(dto: CreateAdoptionRequestDTO, currentUser: User): Promise<AdoptionRequest> {
    if (currentUser.role !== 'adoptante') {
      throw new AppError('FORBIDDEN', 'Solo los adoptantes pueden crear solicitudes');
    }
    if (!dto.petId) {
      throw new AppError('VALIDATION_ERROR', 'La mascota es obligatoria');
    }
    return this.adoptionRepository.createRequest(dto, currentUser.id);
  }
}
