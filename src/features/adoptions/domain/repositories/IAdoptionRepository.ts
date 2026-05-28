import { AdoptionRequest, CreateAdoptionRequestDTO, UpdateAdoptionStatusDTO } from '../entities/AdoptionRequest';

export interface IAdoptionRepository {
  createRequest(dto: CreateAdoptionRequestDTO, adopterId: string): Promise<AdoptionRequest>;
  getRequestsByAdopter(adopterId: string): Promise<AdoptionRequest[]>;
  getRequestsByShelter(shelterId: string): Promise<AdoptionRequest[]>;
  updateStatus(dto: UpdateAdoptionStatusDTO): Promise<AdoptionRequest>;
  subscribeToShelterRequests(shelterId: string, callback: (req: AdoptionRequest) => void): () => void;
  subscribeToAdopterRequests(adopterId: string, callback: (req: AdoptionRequest) => void): () => void;
}
