import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Alert, StatusBar, Modal
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { adoptionRepository } from '../../../src/di/container';
import { AdoptionRequest } from '@features/adoptions/domain/entities/AdoptionRequest';
import { useAdoptions } from '@features/adoptions/presentation/hooks/useAdoptions';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LottieAnimation } from '../../../components/animations/LottieAnimation';
const successAnimation = require('../../../assets/animations/success-check.json');

const statusColors: Record<string, string> = { pending: '#fbbf24', approved: '#34d399', rejected: '#f87171' };
const statusLabels: Record<string, string> = { pending: '⏳ Pendiente', approved: '✅ Aprobada', rejected: '❌ Rechazada' };

export default function AdoptionDetailScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const { approveRequest, rejectRequest } = useAdoptions();

  const [request, setRequest] = useState<AdoptionRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isRefugio = user?.role === 'refugio';

  useEffect(() => {
    if (!requestId) return;
    const fetchRequest = async () => {
      try {
        const SELECT_QUERY = `*, pets(name, photo_url), adopter:profiles!adoption_requests_adopter_id_fkey(username), shelter:profiles!adoption_requests_shelter_id_fkey(username)`;
        const { supabase } = await import('@shared/infrastructure/supabase/client');
        const { data } = await supabase.from('adoption_requests').select(SELECT_QUERY).eq('id', requestId).single();
        if (data) {
          const { createAdoptionFactory } = await import('@features/adoptions/domain/entities/AdoptionRequest');
          setRequest(createAdoptionFactory(data));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [requestId]);

  const handleApprove = () => {
    if (!requestId) return;
    Alert.alert('Aprobar solicitud', '¿Confirmas que deseas aprobar esta solicitud de adopción?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aprobar',
        onPress: async () => {
          setProcessing(true);
          try {
            const updated = await approveRequest(requestId);
            setRequest(updated);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
          } catch (e: any) {
            Alert.alert('Error', e.message);
          } finally {
            setProcessing(false);
          }
        },
      },
    ]);
  };

  const handleReject = () => {
    if (!requestId) return;
    Alert.alert('Rechazar solicitud', '¿Estás seguro de que deseas rechazar esta solicitud?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Rechazar',
        style: 'destructive',
        onPress: async () => {
          setProcessing(true);
          try {
            const updated = await rejectRequest(requestId);
            setRequest(updated);
          } catch (e: any) {
            Alert.alert('Error', e.message);
          } finally {
            setProcessing(false);
          }
        },
      },
    ]);
  };

  if (loading) return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color="#fbbf24" /></View>;

  if (!request) return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: '#fff' }}>Solicitud no encontrada</Text></View>;

  const statusColor = statusColors[request.status] ?? '#94a3b8';

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
        <Text style={styles.headerTitle}>Solicitud de Adopción</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Pet Info */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.petCard}>
          {request.petPhotoUrl ? (
            <Image source={{ uri: request.petPhotoUrl }} style={styles.petImage} />
          ) : (
            <View style={[styles.petImage, styles.petPlaceholder]}>
              <MaterialCommunityIcons name="paw" size={40} color="#334155" />
            </View>
          )}
          <View style={{ flex: 1, padding: 16 }}>
            <Text style={styles.petName}>{request.petName ?? 'Mascota'}</Text>
            <Text style={styles.shelterName}>🏠 {request.shelterName ?? 'Refugio'}</Text>
          </View>
        </Animated.View>

        {/* Status */}
        <Animated.View entering={FadeInDown.delay(150)} style={[styles.statusCard, { borderColor: statusColor + '40' }]}>
          <Text style={styles.sectionLabel}>Estado de la solicitud</Text>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabels[request.status]}</Text>
        </Animated.View>

        {/* Adoptante */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.infoCard}>
          <Text style={styles.sectionLabel}>Información del adoptante</Text>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account-circle-outline" size={18} color="#94a3b8" />
            <Text style={styles.infoText}>{request.adopterName ?? 'Usuario'}</Text>
          </View>
        </Animated.View>

        {/* Message */}
        {request.message && (
          <Animated.View entering={FadeInDown.delay(250)} style={styles.infoCard}>
            <Text style={styles.sectionLabel}>Mensaje del adoptante</Text>
            <Text style={styles.messageText}>{request.message}</Text>
          </Animated.View>
        )}

        {/* Date */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={styles.dateText}>
            Enviada el {new Date(request.createdAt).toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Success animation modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <LottieAnimation source={successAnimation} size={160} loop={false} autoPlay />
          <Text style={styles.successText}>¡Solicitud Aprobada! 🎉</Text>
          <Text style={styles.successSubtext}>El adoptante recibirá una notificación.</Text>
        </View>
      </Modal>

      {/* Actions (only for refugio, only if pending) */}
      {isRefugio && request.status === 'pending' && (
        <View style={styles.actionsBar}>
          <TouchableOpacity style={styles.rejectBtn} onPress={handleReject} disabled={processing}>
            {processing ? <ActivityIndicator color="#f87171" size="small" /> : (
              <>
                <MaterialCommunityIcons name="close" size={20} color="#f87171" />
                <Text style={styles.rejectBtnText}>Rechazar</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.approveBtn} onPress={handleApprove} disabled={processing}>
            {processing ? <ActivityIndicator color="#ffffff" size="small" /> : (
              <>
                <MaterialCommunityIcons name="check" size={20} color="#ffffff" />
                <Text style={styles.approveBtnText}>Aprobar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  aura1: { position: 'absolute', top: '-20%', right: '-30%', width: 500, height: 500, borderRadius: 250, backgroundColor: 'rgba(251,191,36,0.10)' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16, backgroundColor: 'rgba(30,41,59,0.6)', borderBottomWidth: 1.2, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, color: '#ffffff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  petCard: { flexDirection: 'row', backgroundColor: 'rgba(22,32,51,0.9)', borderRadius: 16, overflow: 'hidden', borderWidth: 1.2, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 16 },
  petImage: { width: 100, height: 100, resizeMode: 'cover' },
  petPlaceholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)' },
  petName: { color: '#ffffff', fontSize: 20, fontWeight: '700' },
  shelterName: { color: '#60a5fa', fontSize: 13, marginTop: 4 },
  statusCard: { backgroundColor: 'rgba(22,32,51,0.9)', borderRadius: 14, padding: 16, borderWidth: 1.2, marginBottom: 14 },
  sectionLabel: { color: '#64748b', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  statusText: { fontSize: 18, fontWeight: '700' },
  infoCard: { backgroundColor: 'rgba(22,32,51,0.9)', borderRadius: 14, padding: 16, borderWidth: 1.2, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 14, gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { color: '#cbd5e1', fontSize: 15 },
  messageText: { color: '#cbd5e1', fontSize: 14, lineHeight: 22 },
  dateText: { color: '#475569', fontSize: 12, textAlign: 'center', marginTop: 8 },
  successOverlay: { flex: 1, backgroundColor: 'rgba(9,13,22,0.95)', justifyContent: 'center', alignItems: 'center', gap: 16 },
  successText: { color: '#ffffff', fontSize: 22, fontWeight: '700' },
  successSubtext: { color: '#94a3b8', fontSize: 14 },
  actionsBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 16, paddingBottom: 36, gap: 12, backgroundColor: 'rgba(9,13,22,0.95)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#f87171' },
  rejectBtnText: { color: '#f87171', fontWeight: '700', fontSize: 15 },
  approveBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: '#34d399' },
  approveBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
});
