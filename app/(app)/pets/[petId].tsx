import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Alert, StatusBar, TextInput, Modal
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { petRepository, chatRepository } from '../../../src/di/container';
import { Pet } from '@features/pets/domain/entities/Pet';
import { useAdoptions } from '@features/adoptions/presentation/hooks/useAdoptions';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';

const statusColors: Record<string, string> = { available: '#34d399', adopted: '#60a5fa', pending: '#fbbf24' };
const statusLabels: Record<string, string> = { available: 'Disponible', adopted: 'Adoptado', pending: 'En proceso' };

export default function PetDetailScreen() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const { createRequest } = useAdoptions();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [adoptMessage, setAdoptMessage] = useState('');
  const [adopting, setAdopting] = useState(false);

  const isAdoptante = user?.role === 'adoptante';

  useEffect(() => {
    if (petId) {
      petRepository.getPetById(petId).then(setPet).catch(console.error).finally(() => setLoading(false));
    }
  }, [petId]);

  const handleAdopt = async () => {
    if (!pet) return;
    setAdopting(true);
    try {
      await createRequest({
        petId: pet.id,
        shelterId: pet.shelterId,
        message: adoptMessage.trim() || undefined,
      });
      setShowAdoptModal(false);
      Alert.alert('¡Solicitud enviada!', `Tu solicitud para adoptar a ${pet.name} fue enviada al refugio. Recibirás una notificación cuando sea revisada.`);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setAdopting(false);
    }
  };

  const handleChat = async () => {
    if (!pet?.roomId) {
      Alert.alert('Chat no disponible', 'El refugio aún no ha habilitado el chat para esta mascota.');
      return;
    }
    try {
      await chatRepository.joinRoom(pet.roomId);
      router.push(`/(app)/chat/${pet.roomId}` as any);
    } catch (e: any) {
      Alert.alert('Error', 'No se pudo abrir el chat. Intenta de nuevo.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#34d399" />
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#ffffff' }}>Mascota no encontrada</Text>
      </View>
    );
  }

  const statusColor = statusColors[pet.status] ?? '#94a3b8';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={StyleSheet.absoluteFillObject}>
        <View style={styles.aura1} />
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFillObject} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        {pet.photoUrl ? (
          <Image source={{ uri: pet.photoUrl }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.heroPlaceholder]}>
            <MaterialCommunityIcons name="paw" size={80} color="#334155" />
          </View>
        )}

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(100)} style={styles.titleRow}>
            <Text style={styles.petName}>{pet.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor + '50' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabels[pet.status]}</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150)} style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="dog" size={18} color="#94a3b8" />
              <Text style={styles.metaText}>{pet.breed}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="calendar-outline" size={18} color="#94a3b8" />
              <Text style={styles.metaText}>{pet.age} {pet.age === 1 ? 'año' : 'años'}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="resize" size={18} color="#94a3b8" />
              <Text style={styles.metaText}>{pet.size === 'small' ? 'Pequeño' : pet.size === 'medium' ? 'Mediano' : 'Grande'}</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)}>
            <Text style={styles.sectionTitle}>Sobre {pet.name}</Text>
            <Text style={styles.description}>{pet.description || 'Sin descripción disponible.'}</Text>
          </Animated.View>

          {pet.shelterName && (
            <Animated.View entering={FadeInDown.delay(250)} style={styles.shelterBox}>
              <MaterialCommunityIcons name="home-heart" size={20} color="#60a5fa" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.shelterLabel}>Refugio a cargo</Text>
                <Text style={styles.shelterName}>{pet.shelterName}</Text>
              </View>
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons for adoptante */}
      {isAdoptante && (
        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.chatBtn} onPress={handleChat} activeOpacity={0.8}>
            <MaterialCommunityIcons name="chat" size={20} color="#ffffff" />
            <Text style={styles.chatBtnText}>Chat con Refugio</Text>
          </TouchableOpacity>
          {pet.status === 'available' && (
            <TouchableOpacity style={styles.adoptBtn} onPress={() => setShowAdoptModal(true)} activeOpacity={0.8}>
              <MaterialCommunityIcons name="heart" size={20} color="#ffffff" />
              <Text style={styles.adoptBtnText}>Solicitar Adopción</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Adopt Modal */}
      <Modal visible={showAdoptModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Solicitar adopción de {pet.name}</Text>
            <Text style={styles.modalSubtitle}>Escribe un mensaje al refugio (opcional)</Text>
            <TextInput
              style={styles.modalInput}
              value={adoptMessage}
              onChangeText={setAdoptMessage}
              placeholder="Cuéntanos por qué quieres adoptar a esta mascota..."
              placeholderTextColor="#475569"
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdoptModal(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleAdopt} disabled={adopting}>
                {adopting ? <ActivityIndicator color="#ffffff" size="small" /> : <Text style={styles.confirmBtnText}>Enviar Solicitud</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  aura1: { position: 'absolute', top: '30%', left: '-30%', width: 500, height: 500, borderRadius: 250, backgroundColor: 'rgba(52,211,153,0.12)' },
  heroImage: { width: '100%', height: 280, resizeMode: 'cover' },
  heroPlaceholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.6)' },
  backBtn: { position: 'absolute', top: 60, left: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(15,23,42,0.8)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  content: { padding: 20, gap: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  petName: { color: '#ffffff', fontSize: 28, fontWeight: '800', flex: 1 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  statusText: { fontSize: 12, fontWeight: '700' },
  metaRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#94a3b8', fontSize: 14 },
  sectionTitle: { color: '#64748b', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  description: { color: '#cbd5e1', fontSize: 15, lineHeight: 24 },
  shelterBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(96,165,250,0.08)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(96,165,250,0.2)' },
  shelterLabel: { color: '#64748b', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  shelterName: { color: '#60a5fa', fontSize: 15, fontWeight: '600', marginTop: 2 },
  fabContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, gap: 10 },
  chatBtn: { backgroundColor: '#2563eb', borderRadius: 16, paddingVertical: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 },
  chatBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  adoptBtn: { backgroundColor: '#f87171', borderRadius: 16, paddingVertical: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, shadowColor: '#f87171', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 },
  adoptBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#0f172a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  modalSubtitle: { color: '#94a3b8', fontSize: 14, marginBottom: 16 },
  modalInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1.2, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, color: '#ffffff', fontSize: 15, height: 100, textAlignVertical: 'top', marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center' },
  cancelBtnText: { color: '#94a3b8', fontWeight: '600' },
  confirmBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: '#f87171', alignItems: 'center', justifyContent: 'center' },
  confirmBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
});
