import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, StatusBar, TextInput, Image,
  ActivityIndicator, RefreshControl, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeIn, SlideInLeft, ZoomIn } from 'react-native-reanimated';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { useAuth } from '@features/auth/presentation/hooks/useAuth';
import { getUserInitials } from '@features/auth/domain/entities/User';
import { usePets } from '@features/pets/presentation/hooks/usePets';
import { Pet, PetStatus } from '@features/pets/domain/entities/Pet';

const AuraBackground = () => (
  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    <View style={styles.aura1} />
    <View style={styles.aura2} />
    <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFillObject} />
  </View>
);

const SIZES: Record<string, string> = { small: 'Pequeño', medium: 'Mediano', large: 'Grande' };
const STATUS_COLOR: Record<PetStatus, string> = {
  available: '#34d399',
  pending: '#fbbf24',
  adopted: '#94a3b8',
};
const STATUS_LABEL: Record<PetStatus, string> = {
  available: 'Disponible',
  pending: 'En proceso',
  adopted: 'Adoptado',
};

const FILTERS: { key: PetStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'available', label: 'Disponibles' },
  { key: 'pending', label: 'En proceso' },
  { key: 'adopted', label: 'Adoptados' },
];

const drawerMenuItems = [
  { icon: 'heart-multiple', label: 'Mis Solicitudes', route: '/(app)/adoptions', color: '#f87171' },
  { icon: 'map-marker-radius', label: 'Refugios Cercanos', route: '/(app)/map', color: '#60a5fa' },
];

function PetCard({ pet, index }: { pet: Pet; index: number }) {
  const router = useRouter();
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(450)} style={styles.cardWrapper}>
      <TouchableOpacity
        style={styles.petCard}
        onPress={() => router.push(`/(app)/pets/${pet.id}` as any)}
        activeOpacity={0.85}
      >
        {/* Photo */}
        <View style={styles.photoContainer}>
          {pet.photoUrl ? (
            <Image source={{ uri: pet.photoUrl }} style={styles.petPhoto} resizeMode="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <MaterialCommunityIcons name="paw" size={36} color="rgba(255,255,255,0.15)" />
            </View>
          )}
          {/* Status badge */}
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[pet.status] + '22', borderColor: STATUS_COLOR[pet.status] + '66' }]}>
            <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[pet.status] }]} />
            <Text style={[styles.statusText, { color: STATUS_COLOR[pet.status] }]}>
              {STATUS_LABEL[pet.status]}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.petInfo}>
          <Text style={styles.petName} numberOfLines={1}>{pet.name}</Text>
          <Text style={styles.petBreed} numberOfLines={1}>{pet.breed}</Text>
          <View style={styles.petMeta}>
            <View style={styles.metaChip}>
              <MaterialCommunityIcons name="calendar-outline" size={11} color="#94a3b8" />
              <Text style={styles.metaText}>{pet.age} año{pet.age !== 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.metaChip}>
              <MaterialCommunityIcons name="resize" size={11} color="#94a3b8" />
              <Text style={styles.metaText}>{SIZES[pet.size]}</Text>
            </View>
          </View>
          {pet.shelterName && (
            <View style={styles.shelterRow}>
              <MaterialCommunityIcons name="home-heart" size={12} color="#60a5fa" />
              <Text style={styles.shelterName} numberOfLines={1}>{pet.shelterName}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function AdoptanteHome() {
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<PetStatus | 'all'>('available');

  const { pets, isLoading: loading, loadPets: refresh } = usePets();

  React.useEffect(() => { refresh(); }, []);

  const filtered = pets.filter((p) => {
    const matchStatus = filter === 'all' || p.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.breed.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <AuraBackground />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.username} 👋</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>🐾 Adoptante</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setMenuOpen(true)} style={styles.menuBtn}>
          <MaterialCommunityIcons name="menu" size={28} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar mascota o raza..."
            placeholderTextColor="#64748b"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow} style={styles.filtersScroll}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pets grid */}
      {loading && pets.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#f87171" />
          <Text style={styles.loadingText}>Buscando mascotas...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="paw-off" size={60} color="rgba(255,255,255,0.08)" />
          <Text style={styles.emptyTitle}>Sin mascotas</Text>
          <Text style={styles.emptySubtitle}>
            {search ? 'Intenta otra búsqueda' : 'Aún no hay mascotas disponibles'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(p) => p.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#f87171" />}
          renderItem={({ item, index }) => <PetCard pet={item} index={index} />}
        />
      )}

      {/* FABs */}
      <Animated.View entering={ZoomIn.delay(600).duration(400)} style={styles.fabMap}>
        <TouchableOpacity onPress={() => router.push('/(app)/map' as any)} style={styles.fabBtn}>
          <MaterialCommunityIcons name="map-marker-radius" size={24} color="#60a5fa" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={ZoomIn.delay(700).duration(400)} style={styles.fabAi}>
        <TouchableOpacity onPress={() => router.push('/(app)/ai-chat' as any)} style={[styles.fabBtn, styles.fabAiBtn]}>
          <MaterialCommunityIcons name="robot" size={24} color="#c084fc" />
        </TouchableOpacity>
      </Animated.View>

      {/* Sidebar Drawer */}
      {menuOpen && (
        <View style={StyleSheet.absoluteFill}>
          <Animated.View entering={FadeIn.duration(250)} style={StyleSheet.absoluteFillObject}>
            <TouchableOpacity style={styles.drawerOverlay} activeOpacity={1} onPress={() => setMenuOpen(false)} />
          </Animated.View>
          <Animated.View entering={SlideInLeft.duration(300)} style={styles.drawerContainer}>
            <View style={styles.drawerHeader}>
              <TouchableOpacity onPress={() => setMenuOpen(false)} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
              <View style={styles.drawerProfile}>
                <View style={styles.drawerAvatar}>
                  <Text style={styles.drawerAvatarText}>{user ? getUserInitials(user) : '?'}</Text>
                </View>
                <Text style={styles.drawerUsername}>{user?.username}</Text>
                <Text style={styles.drawerEmail}>{user?.email}</Text>
                <View style={styles.drawerRoleBadge}>
                  <Text style={styles.drawerRoleText}>🐾 Adoptante</Text>
                </View>
              </View>
            </View>
            <View style={styles.drawerMenu}>
              {drawerMenuItems.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.drawerMenuItem}
                  onPress={() => { setMenuOpen(false); router.push(item.route as any); }}
                >
                  <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
                  <Text style={styles.drawerMenuText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.drawerFooter}>
              <TouchableOpacity style={styles.drawerLogoutBtn} onPress={() => { setMenuOpen(false); logout(); }}>
                <MaterialCommunityIcons name="logout" size={20} color="#f87171" />
                <Text style={styles.drawerLogoutText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  aura1: { position: 'absolute', top: '-25%', left: '-35%', width: 600, height: 600, borderRadius: 300, backgroundColor: 'rgba(79,70,229,0.22)' },
  aura2: { position: 'absolute', bottom: '5%', right: '-40%', width: 650, height: 650, borderRadius: 325, backgroundColor: 'rgba(248,113,113,0.10)' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: 'rgba(30,41,59,0.6)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  greeting: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  roleBadge: { marginTop: 5, backgroundColor: 'rgba(248,113,113,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)' },
  roleText: { color: '#f87171', fontSize: 11, fontWeight: '600' },
  menuBtn: { padding: 6 },

  searchRow: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30,41,59,0.8)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 8 },
  searchInput: { flex: 1, color: '#ffffff', fontSize: 14 },

  filtersScroll: { flexGrow: 0 },
  filtersRow: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 14, flexDirection: 'row', alignItems: 'center' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(30,41,59,0.7)', borderWidth: 1.2, borderColor: 'rgba(255,255,255,0.1)', marginRight: 8 },
  filterChipActive: { backgroundColor: 'rgba(248,113,113,0.2)', borderColor: '#f87171' },
  filterText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#f87171' },

  grid: { padding: 10, paddingBottom: 120 },
  cardWrapper: { flex: 1, padding: 6 },
  petCard: { flex: 1, backgroundColor: 'rgba(15,23,42,0.9)', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },

  photoContainer: { width: '100%', height: 140, position: 'relative' },
  petPhoto: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, backgroundColor: 'rgba(30,41,59,0.8)', justifyContent: 'center', alignItems: 'center' },
  statusBadge: { position: 'absolute', top: 8, right: 8, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 9, fontWeight: '700' },

  petInfo: { padding: 10, gap: 4 },
  petName: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  petBreed: { color: '#94a3b8', fontSize: 12 },
  petMeta: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  metaText: { color: '#94a3b8', fontSize: 10 },
  shelterRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  shelterName: { color: '#60a5fa', fontSize: 11, fontWeight: '500', flex: 1 },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#64748b', fontSize: 14 },
  emptyTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  emptySubtitle: { color: '#64748b', fontSize: 14 },

  fabMap: { position: 'absolute', bottom: 100, left: 20 },
  fabAi: { position: 'absolute', bottom: 28, right: 20 },
  fabBtn: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(15,23,42,0.95)', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(96,165,250,0.4)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
  fabAiBtn: { borderColor: 'rgba(192,132,252,0.4)', width: 60, height: 60, borderRadius: 30 },

  drawerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.6)' },
  drawerContainer: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 280, backgroundColor: 'rgba(15,23,42,0.97)', borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.08)', paddingTop: 50, paddingHorizontal: 20, zIndex: 1000 },
  drawerHeader: { marginBottom: 30 },
  closeBtn: { alignSelf: 'flex-end', padding: 4 },
  drawerProfile: { alignItems: 'center', marginTop: 10 },
  drawerAvatar: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1.5, borderColor: 'rgba(248,113,113,0.3)', backgroundColor: 'rgba(248,113,113,0.15)' },
  drawerAvatarText: { fontSize: 24, fontWeight: '700', color: '#f87171' },
  drawerUsername: { color: '#ffffff', fontSize: 18, fontWeight: '600' },
  drawerEmail: { color: '#94a3b8', fontSize: 13, marginTop: 2, marginBottom: 10 },
  drawerRoleBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1.2, borderColor: 'rgba(248,113,113,0.3)', backgroundColor: 'rgba(248,113,113,0.15)' },
  drawerRoleText: { fontSize: 11, fontWeight: '600', color: '#f87171' },
  drawerMenu: { flex: 1, gap: 8 },
  drawerMenuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  drawerMenuText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  drawerFooter: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingVertical: 20, paddingBottom: 40 },
  drawerLogoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)' },
  drawerLogoutText: { color: '#f87171', fontSize: 15, fontWeight: '600' },
});
