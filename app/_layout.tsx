// app/_layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// 1. Añadimos useRootNavigationState al import
import { SupabaseAuthRepository } from '@features/auth/infrastructure/repositories/SupabaseAuthRepository';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { supabase } from '@shared/infrastructure/supabase/client';
import { Slot, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { getExpoNotifications, registerForNotificationsAsync } from '../src/services/notificationService';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } }
});
const authRepo = new SupabaseAuthRepository();

export default function RootLayout() {
  const { user, setUser } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    authRepo.getCurrentUser().then(setUser);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          const user = await authRepo.getCurrentUser();
          setUser(user);
        } else {
          setUser(null);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!rootNavigationState?.key) return;
    const inAuth = segments[0] === '(auth)';
    const id = setTimeout(() => {
      if (!user && !inAuth) router.replace('/(auth)/login');
      if (user && inAuth) router.replace('/(app)');
    }, 0);
    return () => clearTimeout(id);
  }, [user, segments, rootNavigationState?.key]);

  const notificationSubRef = useRef<{ remove(): void } | null>(null);

  useEffect(() => {
    registerForNotificationsAsync();
    getExpoNotifications().then((Notifications) => {
      if (!Notifications) return;
      notificationSubRef.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
        if (!rootNavigationState?.key) return;
        const roomId = response.notification.request.content.data?.roomId;
        if (roomId) {
          router.push(`/chat/${roomId}`);
        }
      });
    });
    return () => {
      notificationSubRef.current?.remove();
    };
  }, [rootNavigationState?.key]);

  return (
    <QueryClientProvider client={queryClient}>
      <Slot />
    </QueryClientProvider>
  );
}