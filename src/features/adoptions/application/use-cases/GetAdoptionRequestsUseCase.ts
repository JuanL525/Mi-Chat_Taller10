import { IAdoptionRepository } from '../../domain/repositories/IAdoptionRepository';
import { AdoptionRequest } from '../../domain/entities/AdoptionRequest';
import { User } from '@features/auth/domain/entities/User';

export class GetAdoptionRequestsUseCase {
  constructor(private readonly adoptionRepository: IAdoptionRepository) {}

  async execute(currentUser: User): Promise<AdoptionRequest[]> {
    if (currentUser.role === 'refugio') {
      return this.adoptionRepository.getRequestsByShelter(currentUser.id);
    }
    return this.adoptionRepository.getRequestsByAdopter(currentUser.id);
  }
}
