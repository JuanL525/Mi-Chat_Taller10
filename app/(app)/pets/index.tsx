import React, { useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Image, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { usePets } from '@features/pets/presentation/hooks/usePets';
import { Pet } from '@features/pets/domain/entities/Pet';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LottieAnimation } from '../../../components/animations/LottieAnimation';
const emptyAnimation = require('../../../assets/animations/empty-state.json');

const statusColors: Record<string, string> = {
  available: '#34d399',
  adopted: '#60a5fa',
  pending: '#fbbf24',
};

const statusLabels: Record<string, string> = {
  available: 'Disponible',
  adopted: 'Adoptado',
  pending: 'En proceso',
};

const AuraBackground = () => (
  <View style={StyleSheet.absoluteFillObject}>
    <View style={styles.aura1} />
    <View style={styles.aura2} />
    <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFillObject} />
  </View>
);

export default function PetsListScreen() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const { pets, isLoading, loadPets, deletePet } = usePets();
  const isRefugio = user?.role === 'refugio';

  useEffect(() => { loadPets(); }, [loadPets]);

  const handleDelete = (pet: Pet) => {
    Alert.alert(
      'Eliminar mascota',
      `¿Estás seguro de que deseas eliminar a ${pet.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePet(pet.id);
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  const renderPet = ({ item, index }: { item: Pet; index: number }) => {
    const statusColor = statusColors[item.status] ?? '#94a3b8';
    return (
      <Animated.View entering={FadeInDown.delay(index * 80).duration(500)}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => router.push({ pathname: '/(app)/pets/[petId]', params: { petId: item.id } })}
        >
          {item.photoUrl ? (
            <Image source={{ uri: item.photoUrl }} style={styles.petImage} />
          ) : (
            <View style={[styles.petImage, styles.petImagePlaceholder]}>
              <MaterialCommunityIcons name="paw" size={32} color="#64748b" />
            </View>
          )}
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.petName}>{item.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor + '50' }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>{statusLabels[item.status]}</Text>
              </View>
            </View>
            <Text style={styles.petBreed}>{item.breed} · {item.age} {item.age === 1 ? 'año' : 'años'}</Text>
            <Text style={styles.petDesc} numberOfLines={2}>{item.description}</Text>
            {item.shelterName && (
              <Text style={styles.shelterName}>🏠 {item.shelterName}</Text>
            )}
          </View>
          {isRefugio && item.shelterId === user?.id && (
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => router.push({ pathname: '/(app)/pets/edit/[petId]', params: { petId: item.id } })}
              >
                <MaterialCommunityIcons name="pencil" size={18} color="#60a5fa" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
                <MaterialCommunityIcons name="trash-can-outline" size={18} color="#f87171" />
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <AuraBackground />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mascotas en Adopción</Text>
        {isRefugio && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push('/(app)/pets/create')}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#34d399" />
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(p) => p.id}
          renderItem={renderPet}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={loadPets}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <LottieAnimation source={emptyAnimation} size={150} loop />
              <Text style={styles.emptyText}>No hay mascotas disponibles</Text>
              {isRefugio && (
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => router.push('/(app)/pets/create')}
                >
                  <Text style={styles.emptyBtnText}>Agregar primera mascota</Text>
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
  aura1: { position: 'absolute', top: '-25%', left: '-35%', width: 600, height: 600, borderRadius: 300, backgroundColor: 'rgba(52,211,153,0.15)' },
  aura2: { position: 'absolute', bottom: '5%', right: '-40%', width: 600, height: 600, borderRadius: 300, backgroundColor: 'rgba(79,70,229,0.18)' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16, backgroundColor: 'rgba(30,41,59,0.6)', borderBottomWidth: 1.2, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, color: '#ffffff', fontSize: 18, fontWeight: '700', marginLeft: 8 },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#34d399', justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 40 },
  card: { flexDirection: 'row', backgroundColor: 'rgba(22,32,51,0.9)', borderRadius: 16, marginBottom: 12, overflow: 'hidden', borderWidth: 1.2, borderColor: 'rgba(255,255,255,0.08)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  petImage: { width: 100, height: 100, resizeMode: 'cover' },
  petImagePlaceholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)' },
  cardContent: { flex: 1, padding: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  petName: { color: '#ffffff', fontSize: 16, fontWeight: '700', flex: 1 },
  statusBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, marginLeft: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  petBreed: { color: '#94a3b8', fontSize: 12, marginBottom: 4 },
  petDesc: { color: '#cbd5e1', fontSize: 12, lineHeight: 18 },
  shelterName: { color: '#60a5fa', fontSize: 11, marginTop: 4 },
  cardActions: { justifyContent: 'center', paddingRight: 8, gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 16 },
  emptyText: { color: '#64748b', fontSize: 16, fontWeight: '600' },
  emptyBtn: { backgroundColor: '#34d399', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  emptyBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
});
