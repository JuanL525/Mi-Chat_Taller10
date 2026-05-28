import { useState, useCallback, useEffect } from 'react';
import { AdoptionRequest, CreateAdoptionRequestDTO } from '../../domain/entities/AdoptionRequest';
import {
  createAdoptionRequestUseCase,
  getAdoptionRequestsUseCase,
  updateAdoptionStatusUseCase,
  adoptionRepository,
} from '../../../../di/container';
import { useAuthStore } from '@features/auth/presentation/store/authStore';

export function useAdoptions() {
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);

  const loadRequests = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdoptionRequestsUseCase.execute(user);
      setRequests(data);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar solicitudes');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createRequest = useCallback(async (dto: CreateAdoptionRequestDTO) => {
    if (!user) throw new Error('No autenticado');
    return createAdoptionRequestUseCase.execute(dto, user);
  }, [user]);

  const approveRequest = useCallback(async (requestId: string) => {
    if (!user) throw new Error('No autenticado');
    const updated = await updateAdoptionStatusUseCase.execute({ requestId, status: 'approved' }, user);
    setRequests((prev) => prev.map((r) => r.id === requestId ? updated : r));
    return updated;
  }, [user]);

  const rejectRequest = useCallback(async (requestId: string) => {
    if (!user) throw new Error('No autenticado');
    const updated = await updateAdoptionStatusUseCase.execute({ requestId, status: 'rejected' }, user);
    setRequests((prev) => prev.map((r) => r.id === requestId ? updated : r));
    return updated;
  }, [user]);

  return { requests, isLoading, error, loadRequests, createRequest, approveRequest, rejectRequest };
}
