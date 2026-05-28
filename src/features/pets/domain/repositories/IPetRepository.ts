import { Pet, CreatePetDTO, UpdatePetDTO } from '../entities/Pet';

export interface IPetRepository {
  getPets(): Promise<Pet[]>;
  getPetById(id: string): Promise<Pet>;
  getPetsByShelterId(shelterId: string): Promise<Pet[]>;
  createPet(dto: CreatePetDTO, shelterId: string): Promise<Pet>;
  updatePet(dto: UpdatePetDTO): Promise<Pet>;
  deletePet(id: string): Promise<void>;
}
