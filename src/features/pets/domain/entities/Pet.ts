export type PetStatus = 'available' | 'adopted' | 'pending';
export type PetSize = 'small' | 'medium' | 'large';

export interface Pet {
  id: string;
  shelterId: string;
  shelterName?: string;
  name: string;
  breed: string;
  age: number;
  size: PetSize;
  description: string;
  photoUrl: string | null;
  status: PetStatus;
  roomId: string | null;
  createdAt: string;
}

export interface CreatePetDTO {
  name: string;
  breed: string;
  age: number;
  size: PetSize;
  description: string;
  photoUri?: string;
  photoBase64?: string;
}

export interface UpdatePetDTO {
  id: string;
  name?: string;
  breed?: string;
  age?: number;
  size?: PetSize;
  description?: string;
  status?: PetStatus;
  photoUri?: string;
  photoBase64?: string;
}

export function createPetFactory(raw: any): Pet {
  return {
    id: raw.id,
    shelterId: raw.shelter_id,
    shelterName: raw.profiles?.username ?? undefined,
    name: raw.name,
    breed: raw.breed,
    age: raw.age,
    size: raw.size ?? 'medium',
    description: raw.description ?? '',
    photoUrl: raw.photo_url ?? null,
    status: raw.status ?? 'available',
    roomId: raw.room_id ?? null,
    createdAt: raw.created_at,
  };
}
