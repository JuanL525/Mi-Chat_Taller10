import { supabase } from '@shared/infrastructure/supabase/client';
import { IAdoptionRepository } from '../../domain/repositories/IAdoptionRepository';
import {
  AdoptionRequest,
  CreateAdoptionRequestDTO,
  UpdateAdoptionStatusDTO,
  createAdoptionFactory,
} from '../../domain/entities/AdoptionRequest';
import { AppError } from '@shared/domain/errors/AppError';

const SELECT_QUERY = `
  *,
  pets(name, photo_url),
  adopter:profiles!adoption_requests_adopter_id_fkey(username),
  shelter:profiles!adoption_requests_shelter_id_fkey(username)
`;

export class SupabaseAdoptionRepository implements IAdoptionRepository {
  async createRequest(dto: CreateAdoptionRequestDTO, adopterId: string): Promise<AdoptionRequest> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .insert({
        pet_id: dto.petId,
        adopter_id: adopterId,
        shelter_id: dto.shelterId,
        message: dto.message ?? null,
        status: 'pending',
      })
      .select(SELECT_QUERY)
      .single();

    if (error) throw new AppError('ADOPTION_CREATE_FAILED', error.message);
    return createAdoptionFactory(data);
  }

  async getRequestsByAdopter(adopterId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select(SELECT_QUERY)
      .eq('adopter_id', adopterId)
      .order('created_at', { ascending: false });

    if (error) throw new AppError('ADOPTION_FETCH_FAILED', error.message);
    return (data ?? []).map(createAdoptionFactory);
  }

  async getRequestsByShelter(shelterId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select(SELECT_QUERY)
      .eq('shelter_id', shelterId)
      .order('created_at', { ascending: false });

    if (error) throw new AppError('ADOPTION_FETCH_FAILED', error.message);
    return (data ?? []).map(createAdoptionFactory);
  }

  async updateStatus(dto: UpdateAdoptionStatusDTO): Promise<AdoptionRequest> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .update({ status: dto.status })
      .eq('id', dto.requestId)
      .select(SELECT_QUERY)
      .single();

    if (error) throw new AppError('ADOPTION_UPDATE_FAILED', error.message);
    return createAdoptionFactory(data);
  }

  subscribeToShelterRequests(shelterId: string, callback: (req: AdoptionRequest) => void): () => void {
    const channel = supabase
      .channel(`adoption-shelter-${shelterId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'adoption_requests', filter: `shelter_id=eq.${shelterId}` },
        async (payload) => {
          const { data } = await supabase
            .from('adoption_requests')
            .select(SELECT_QUERY)
            .eq('id', payload.new.id)
            .single();
          if (data) callback(createAdoptionFactory(data));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }

  subscribeToAdopterRequests(adopterId: string, callback: (req: AdoptionRequest) => void): () => void {
    const channel = supabase
      .channel(`adoption-adopter-${adopterId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'adoption_requests', filter: `adopter_id=eq.${adopterId}` },
        async (payload) => {
          const { data } = await supabase
            .from('adoption_requests')
            .select(SELECT_QUERY)
            .eq('id', payload.new.id)
            .single();
          if (data) callback(createAdoptionFactory(data));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }
}
