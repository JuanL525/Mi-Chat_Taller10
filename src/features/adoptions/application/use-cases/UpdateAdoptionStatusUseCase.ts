import { IAdoptionRepository } from '../../domain/repositories/IAdoptionRepository';
import { AdoptionRequest, UpdateAdoptionStatusDTO } from '../../domain/entities/AdoptionRequest';
import { User } from '@features/auth/domain/entities/User';
import { AppError } from '@shared/domain/errors/AppError';

export class UpdateAdoptionStatusUseCase {
  constructor(private readonly adoptionRepository: IAdoptionRepository) {}

  async execute(dto: UpdateAdoptionStatusDTO, currentUser: User): Promise<AdoptionRequest> {
    if (currentUser.role !== 'refugio') {
      throw new AppError('FORBIDDEN', 'Solo los refugios pueden aprobar o rechazar solicitudes');
    }
    return this.adoptionRepository.updateStatus(dto);
  }
}
