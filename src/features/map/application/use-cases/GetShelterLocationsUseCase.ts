import { IMapRepository } from '../../domain/repositories/IMapRepository';
import { ShelterLocation } from '../../domain/entities/ShelterLocation';

export class GetShelterLocationsUseCase {
  constructor(private readonly mapRepository: IMapRepository) {}

  async execute(): Promise<ShelterLocation[]> {
    return this.mapRepository.getShelterLocations();
  }
}
