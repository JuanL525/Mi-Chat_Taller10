import { useState, useCallback } from 'react';
import { Pet } from '../../domain/entities/Pet';
import {
  getPetsUseCase,
  createPetUseCase,
  updatePetUseCase,
  deletePetUseCase,
} from '../../../../di/container';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { CreatePetDTO, UpdatePetDTO } from '../../domain/entities/Pet';

export function usePets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);

  const loadPets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPetsUseCase.execute();
      setPets(data);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar mascotas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPet = useCallback(async (dto: CreatePetDTO) => {
    if (!user) throw new Error('No autenticado');
    return createPetUseCase.execute(dto, user);
  }, [user]);

  const updatePet = useCallback(async (dto: UpdatePetDTO) => {
    if (!user) throw new Error('No autenticado');
    return updatePetUseCase.execute(dto, user);
  }, [user]);

  const deletePet = useCallback(async (petId: string) => {
    if (!user) throw new Error('No autenticado');
    await deletePetUseCase.execute(petId, user);
    setPets((prev) => prev.filter((p) => p.id !== petId));
  }, [user]);

  return { pets, isLoading, error, loadPets, createPet, updatePet, deletePet };
}
