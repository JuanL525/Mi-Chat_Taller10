import { supabase } from '@shared/infrastructure/supabase/client';
import { IMapRepository } from '../../domain/repositories/IMapRepository';
import { ShelterLocation } from '../../domain/entities/ShelterLocation';
import { AppError } from '@shared/domain/errors/AppError';

export class SupabaseMapRepository implements IMapRepository {
  async getShelterLocations(): Promise<ShelterLocation[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, latitude, longitude')
      .eq('role', 'refugio')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (error) {
      console.warn('[SupabaseMapRepository] getShelterLocations error:', error);
      throw new AppError('MAP_FETCH_FAILED', error.message);
    }

    console.log('[SupabaseMapRepository] Refugios encontrados:', data?.length ?? 0, data);

    return (data ?? []).map((row) => ({
      shelterId: row.id,
      shelterName: row.username,
      latitude: row.latitude,
      longitude: row.longitude,
    }));
  }

  async updateShelterLocation(shelterId: string, latitude: number, longitude: number): Promise<void> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ latitude, longitude })
      .eq('id', shelterId)
      .select('id, latitude, longitude');

    if (error) {
      console.warn('[SupabaseMapRepository] updateShelterLocation error:', error);
      throw new AppError('MAP_UPDATE_FAILED', error.message);
    }

    console.log('[SupabaseMapRepository] Ubicación guardada:', data);

    if (!data || data.length === 0) {
      throw new AppError(
        'MAP_UPDATE_NO_ROW',
        'No se pudo guardar la ubicación. Revisa los permisos de la tabla profiles.'
      );
    }
  }
}
