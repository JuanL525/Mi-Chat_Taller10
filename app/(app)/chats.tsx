import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, StatusBar, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { petRepository, chatRepository } from '../../src/di/container';
import { Pet } from '@features/pets/domain/entities/Pet';

export default function ChatsScreen() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    petRepository
      .getPetsByShelterId(user.id)
      .then((data) => setPets(data.filter((p) => p.roomId !== null)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const openChat = async (pet: Pet) => {
    if (!pet.roomId) return;
    try {
      await chatRepository.joinRoom(pet.roomId);
      router.push(`/(app)/chat/${pet.roomId}` as any);
    } catch {
      // silently ignore join errors (ya es miembro)
      router.push(`/(app)/chat/${pet.roomId}` as any);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <View style={styles.aura} />
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFillObject} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={30} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Chats de Mascotas</Text>
        <View style={{ width: 42 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#34d399" />
          <Text style={styles.loadingText}>Cargando chats...</Text>
        </View>
      ) : pets.length === 0 ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="chat-outline" size={64} color="rgba(255,255,255,0.07)" />
          <Text style={styles.emptyTitle}>Sin chats activos</Text>
          <Text style={styles.emptySubtitle}>
            Los chats aparecen cuando registras mascotas.{'\n'}Los adoptantes podrán escribirte desde el detalle de cada mascota.
          </Text>
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 80).duration(400)}>
              <TouchableOpacity style={styles.chatRow} onPress={() => openChat(item)} activeOpacity={0.8}>
                {/* Photo */}
                <View style={styles.photoBox}>
                  {item.photoUrl ? (
                    <Image source={{ uri: item.photoUrl }} style={styles.photo} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <MaterialCommunityIcons name="paw" size={26} color="#34d399" />
                    </View>
                  )}
                </View>

                {/* Info */}
                <View style={styles.chatInfo}>
                  <Text style={styles.petName}>{item.name}</Text>
                  <Text style={styles.petBreed}>{item.breed}</Text>
                  <View style={styles.roomIdRow}>
                    <MaterialCommunityIcons name="chat-processing-outline" size={12} color="#34d399" />
                    <Text style={styles.roomIdText}>Chat activo</Text>
                  </View>
                </View>

                <MaterialCommunityIcons name="chevron-right" size={24} color="#334155" />
              </TouchableOpacity>
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  aura: { position: 'absolute', top: '-20%', right: '-30%', width: 500, height: 500, borderRadius: 250, backgroundColor: 'rgba(52,211,153,0.12)' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16, backgroundColor: 'rgba(30,41,59,0.6)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#ffffff', fontSize: 18, fontWeight: '700' },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingHorizontal: 32 },
  loadingText: { color: '#64748b', fontSize: 14 },
  emptyTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  emptySubtitle: { color: '#64748b', fontSize: 14, textAlign: 'center', lineHeight: 22 },

  list: { padding: 16, gap: 10 },
  chatRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.9)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', gap: 14 },
  photoBox: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden' },
  photo: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoPlaceholder: { flex: 1, backgroundColor: 'rgba(52,211,153,0.1)', justifyContent: 'center', alignItems: 'center' },
  chatInfo: { flex: 1, gap: 3 },
  petName: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  petBreed: { color: '#94a3b8', fontSize: 13 },
  roomIdRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  roomIdText: { color: '#34d399', fontSize: 11, fontWeight: '600' },
});
