import { IPetRepository } from '../../domain/repositories/IPetRepository';
import { Pet } from '../../domain/entities/Pet';

export class GetPetsUseCase {
  constructor(private readonly petRepository: IPetRepository) {}

  async execute(): Promise<Pet[]> {
    return this.petRepository.getPets();
  }
}
