import React, { useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { useAdoptions } from '@features/adoptions/presentation/hooks/useAdoptions';
import { AdoptionRequest } from '@features/adoptions/domain/entities/AdoptionRequest';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';

const statusColors: Record<string, string> = { pending: '#fbbf24', approved: '#34d399', rejected: '#f87171' };
const statusLabels: Record<string, string> = { pending: 'Pendiente', approved: 'Aprobada', rejected: 'Rechazada' };
const statusIcons: Record<string, string> = { pending: 'clock-outline', approved: 'check-circle-outline', rejected: 'close-circle-outline' };

export default function AdoptionsScreen() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const { requests, isLoading, loadRequests } = useAdoptions();
  const isRefugio = user?.role === 'refugio';

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const renderRequest = ({ item, index }: { item: AdoptionRequest; index: number }) => {
    const color = statusColors[item.status] ?? '#94a3b8';
    const label = statusLabels[item.status] ?? item.status;
    const icon = statusIcons[item.status] ?? 'help-circle-outline';

    return (
      <Animated.View entering={FadeInDown.delay(index * 80).duration(500)}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => router.push({ pathname: '/(app)/adoptions/[requestId]', params: { requestId: item.id } })}
        >
          {item.petPhotoUrl ? (
            <Image source={{ uri: item.petPhotoUrl }} style={styles.petThumb} />
          ) : (
            <View style={[styles.petThumb, styles.petThumbPlaceholder]}>
              <MaterialCommunityIcons name="paw" size={24} color="#64748b" />
            </View>
          )}
          <View style={styles.cardContent}>
            <Text style={styles.petName}>{item.petName ?? 'Mascota'}</Text>
            <Text style={styles.userName}>
              {isRefugio ? `Solicitante: ${item.adopterName ?? 'Usuario'}` : `Refugio: ${item.shelterName ?? 'Refugio'}`}
            </Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
          </View>
          <View style={styles.statusContainer}>
            <MaterialCommunityIcons name={icon as any} size={20} color={color} />
            <Text style={[styles.statusText, { color }]}>{label}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#475569" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={StyleSheet.absoluteFillObject}>
        <View style={styles.aura1} />
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFillObject} />
      </View>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isRefugio ? 'Solicitudes Recibidas' : 'Mis Solicitudes'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#fbbf24" />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(r) => r.id}
          renderItem={renderRequest}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={loadRequests}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="clipboard-list-outline" size={64} color="#334155" />
              <Text style={styles.emptyText}>
                {isRefugio ? 'No has recibido solicitudes aún' : 'No tienes solicitudes aún'}
              </Text>
              {!isRefugio && (
                <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(app)/pets' as any)}>
                  <Text style={styles.emptyBtnText}>Ver mascotas disponibles</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  aura1: { position: 'absolute', top: '-20%', right: '-30%', width: 500, height: 500, borderRadius: 250, backgroundColor: 'rgba(251,191,36,0.12)' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16, backgroundColor: 'rgba(30,41,59,0.6)', borderBottomWidth: 1.2, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, color: '#ffffff', fontSize: 18, fontWeight: '700', textAlign: 'center', marginLeft: 8 },
  list: { padding: 16, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(22,32,51,0.9)', borderRadius: 16, marginBottom: 12, padding: 12, borderWidth: 1.2, borderColor: 'rgba(255,255,255,0.08)', gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  petThumb: { width: 60, height: 60, borderRadius: 12, resizeMode: 'cover' },
  petThumbPlaceholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)' },
  cardContent: { flex: 1 },
  petName: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  userName: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  date: { color: '#475569', fontSize: 11, marginTop: 2 },
  statusContainer: { alignItems: 'center', gap: 2 },
  statusText: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 16 },
  emptyText: { color: '#64748b', fontSize: 15, fontWeight: '600', textAlign: 'center' },
  emptyBtn: { backgroundColor: '#fbbf24', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  emptyBtnText: { color: '#0f172a', fontWeight: '700', fontSize: 14 },
});
