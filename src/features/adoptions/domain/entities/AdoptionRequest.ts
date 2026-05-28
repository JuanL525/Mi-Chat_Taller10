export type AdoptionStatus = 'pending' | 'approved' | 'rejected';

export interface AdoptionRequest {
  id: string;
  petId: string;
  petName?: string;
  petPhotoUrl?: string | null;
  adopterId: string;
  adopterName?: string;
  shelterId: string;
  shelterName?: string;
  status: AdoptionStatus;
  message?: string;
  createdAt: string;
}

export interface CreateAdoptionRequestDTO {
  petId: string;
  shelterId: string;
  message?: string;
}

export interface UpdateAdoptionStatusDTO {
  requestId: string;
  status: 'approved' | 'rejected';
}

export function createAdoptionFactory(raw: any): AdoptionRequest {
  return {
    id: raw.id,
    petId: raw.pet_id,
    petName: raw.pets?.name ?? undefined,
    petPhotoUrl: raw.pets?.photo_url ?? null,
    adopterId: raw.adopter_id,
    adopterName: raw.adopter?.username ?? undefined,
    shelterId: raw.shelter_id,
    shelterName: raw.shelter?.username ?? undefined,
    status: raw.status ?? 'pending',
    message: raw.message ?? undefined,
    createdAt: raw.created_at,
  };
}
