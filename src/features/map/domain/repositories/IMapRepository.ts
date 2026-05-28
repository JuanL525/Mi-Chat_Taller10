import { ShelterLocation } from '../entities/ShelterLocation';

export interface IMapRepository {
  getShelterLocations(): Promise<ShelterLocation[]>;
  updateShelterLocation(shelterId: string, latitude: number, longitude: number): Promise<void>;
}
