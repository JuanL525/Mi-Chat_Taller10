import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { useAuth } from '@features/auth/presentation/hooks/useAuth';
import { getUserInitials } from '@features/auth/domain/entities/User';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeIn, SlideInLeft } from 'react-native-reanimated';

const AuraBackground = () => (
  <View style={StyleSheet.absoluteFillObject}>
    <View style={styles.aura1} />
    <View style={styles.aura2} />
    <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFillObject} />
  </View>
);

const menuItems = [
  { icon: 'paw', label: 'Mis Mascotas', route: '/(app)/pets', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  { icon: 'chat-processing', label: 'Mis Chats', route: '/(app)/chats', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
  { icon: 'clipboard-list', label: 'Solicitudes', route: '/(app)/adoptions', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  { icon: 'map-marker-radius', label: 'Mapa', route: '/(app)/map', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  { icon: 'robot', label: 'Asistente IA', route: '/(app)/ai-chat', color: '#c084fc', bg: 'rgba(192,132,252,0.12)' },
];

export default function RefugioDashboard() {
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <AuraBackground />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.username}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>🏠 Refugio</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setMenuOpen(true)} style={styles.menuBtn}>
          <MaterialCommunityIcons name="menu" size={28} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Panel de Gestión del Refugio</Text>

      <FlatList
        data={menuItems}
        keyExtractor={(i) => i.label}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 100).duration(500)} style={styles.cardWrapper}>
            <TouchableOpacity
              style={[styles.card, { borderColor: item.color + '40' }]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
                <MaterialCommunityIcons name={item.icon as any} size={32} color={item.color} />
              </View>
              <Text style={[styles.cardLabel, { color: item.color }]}>{item.label}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      />

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
                  <Text style={styles.drawerRoleText}>🏠 Refugio</Text>
                </View>
              </View>
            </View>
            <View style={styles.drawerMenu}>
              {menuItems.map((item) => (
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
  aura2: { position: 'absolute', bottom: '5%', right: '-40%', width: 650, height: 650, borderRadius: 325, backgroundColor: 'rgba(52,211,153,0.12)' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 24, backgroundColor: 'rgba(30,41,59,0.6)', borderBottomWidth: 1.2, borderBottomColor: 'rgba(255,255,255,0.08)' },
  greeting: { color: '#ffffff', fontSize: 20, fontWeight: '700' },
  roleBadge: { marginTop: 6, backgroundColor: 'rgba(52,211,153,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2.5, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)' },
  roleText: { color: '#34d399', fontSize: 12, fontWeight: '600' },
  menuBtn: { padding: 6 },
  subtitle: { color: '#94a3b8', fontSize: 15, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8, fontWeight: '600' },
  grid: { padding: 16 },
  cardWrapper: { flex: 1, padding: 6 },
  card: { flex: 1, backgroundColor: 'rgba(22,32,51,0.85)', borderRadius: 18, padding: 20, alignItems: 'center', borderWidth: 1.2, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 },
  iconBox: { width: 60, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  cardLabel: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  drawerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.6)' },
  drawerContainer: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 280, backgroundColor: 'rgba(15,23,42,0.95)', borderRightWidth: 1.2, borderRightColor: 'rgba(255,255,255,0.08)', paddingTop: 50, paddingHorizontal: 20, zIndex: 1000 },
  drawerHeader: { marginBottom: 30 },
  closeBtn: { alignSelf: 'flex-end', padding: 4 },
  drawerProfile: { alignItems: 'center', marginTop: 10 },
  drawerAvatar: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1.5, borderColor: 'rgba(52,211,153,0.3)', backgroundColor: 'rgba(52,211,153,0.15)' },
  drawerAvatarText: { fontSize: 24, fontWeight: '700', color: '#34d399' },
  drawerUsername: { color: '#ffffff', fontSize: 18, fontWeight: '600' },
  drawerEmail: { color: '#94a3b8', fontSize: 13, marginTop: 2, marginBottom: 10 },
  drawerRoleBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1.2, borderColor: 'rgba(52,211,153,0.3)', backgroundColor: 'rgba(52,211,153,0.15)' },
  drawerRoleText: { fontSize: 11, fontWeight: '600', color: '#34d399' },
  drawerMenu: { flex: 1, gap: 8 },
  drawerMenuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1.2, borderColor: 'rgba(255,255,255,0.06)' },
  drawerMenuText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  drawerFooter: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingVertical: 20, paddingBottom: 40 },
  drawerLogoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1.2, borderColor: 'rgba(239,68,68,0.25)' },
  drawerLogoutText: { color: '#f87171', fontSize: 15, fontWeight: '600' },
});
