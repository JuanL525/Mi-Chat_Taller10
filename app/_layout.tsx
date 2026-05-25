// app/_layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// 1. Añadimos useRootNavigationState al import
import { SupabaseAuthRepository } from '@features/auth/infrastructure/repositories/SupabaseAuthRepository';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { supabase } from '@shared/infrastructure/supabase/client';
import { Slot, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { getExpoNotifications, registerForNotificationsAsync, sendMessageNotification } from '../src/services/notificationService';

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

  // Suscripción Global en tiempo real para Notificaciones Locales (Supabase Realtime)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('global-chat-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          if (!payload.new || payload.new.user_id === user.id) return;

          // Evitar notificar si el usuario ya está viendo activamente este chat
          const inThisChat = 
            segments[0] === '(app)' && 
            segments[1] === 'chat' && 
            segments[2] === payload.new.room_id;
            
          if (inThisChat) return;

          try {
            // Consultar el perfil del remitente para mostrar su nombre de usuario
            const { data: senderData } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', payload.new.user_id)
              .single();

            const senderName = senderData?.username ?? 'Otro Usuario';
            await sendMessageNotification(senderName, payload.new.room_id, payload.new.content);
          } catch (err) {
            console.warn('Error fetching sender profile for notification:', err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, segments]);

  return (
    <QueryClientProvider client={queryClient}>
      <Slot />
    </QueryClientProvider>
  );
}