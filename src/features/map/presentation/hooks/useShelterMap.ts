import { useState, useCallback } from 'react';
import { ShelterLocation } from '../../domain/entities/ShelterLocation';
import { getShelterLocationsUseCase, mapRepository } from '../../../../di/container';
import { useAuthStore } from '@features/auth/presentation/store/authStore';

export function useShelterMap() {
  const [shelters, setShelters] = useState<ShelterLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);

  const loadShelters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getShelterLocationsUseCase.execute();
      setShelters(data);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar refugios');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveMyLocation = useCallback(async (latitude: number, longitude: number) => {
    if (!user || user.role !== 'refugio') return;
    await mapRepository.updateShelterLocation(user.id, latitude, longitude);
  }, [user]);

  return { shelters, isLoading, error, loadShelters, saveMyLocation };
}
