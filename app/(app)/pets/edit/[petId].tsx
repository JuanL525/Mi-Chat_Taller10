import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, Image, ActivityIndicator, StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { usePets } from '@features/pets/presentation/hooks/usePets';
import { petRepository } from '../../../../src/di/container';
import { Pet, PetSize, PetStatus } from '@features/pets/domain/entities/Pet';
import { BlurView } from 'expo-blur';

const SIZES: { value: PetSize; label: string }[] = [
  { value: 'small', label: 'Pequeño' },
  { value: 'medium', label: 'Mediano' },
  { value: 'large', label: 'Grande' },
];
const STATUSES: { value: PetStatus; label: string; color: string }[] = [
  { value: 'available', label: 'Disponible', color: '#34d399' },
  { value: 'pending', label: 'En proceso', color: '#fbbf24' },
  { value: 'adopted', label: 'Adoptado', color: '#60a5fa' },
];

export default function EditPetScreen() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const router = useRouter();
  const { updatePet } = usePets();

  const [pet, setPet] = useState<Pet | null>(null);
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [size, setSize] = useState<PetSize>('medium');
  const [status, setStatus] = useState<PetStatus>('available');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (petId) {
      petRepository.getPetById(petId).then((p) => {
        setPet(p);
        setName(p.name);
        setBreed(p.breed);
        setAge(String(p.age));
        setSize(p.size);
        setStatus(p.status);
        setDescription(p.description);
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [petId]);

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.7, base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoBase64(result.assets[0].base64 ?? null);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !petId) return;
    setSaving(true);
    try {
      await updatePet({
        id: petId,
        name: name.trim(),
        breed: breed.trim(),
        age: parseInt(age) || 0,
        size,
        status,
        description: description.trim(),
        photoUri: photoUri ?? undefined,
        photoBase64: photoBase64 ?? undefined,
      });
      Alert.alert('¡Actualizado!', 'La información de la mascota fue guardada', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color="#34d399" /></View>;

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
        <Text style={styles.headerTitle}>Editar Mascota</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.photoBox} onPress={handlePickPhoto} activeOpacity={0.8}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          ) : pet?.photoUrl ? (
            <Image source={{ uri: pet.photoUrl }} style={styles.photoPreview} />
          ) : (
            <>
              <MaterialCommunityIcons name="camera-plus" size={40} color="#64748b" />
              <Text style={styles.photoHint}>Toca para cambiar foto</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Nombre</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor="#475569" />

        <Text style={styles.label}>Raza</Text>
        <TextInput style={styles.input} value={breed} onChangeText={setBreed} placeholderTextColor="#475569" />

        <Text style={styles.label}>Edad (años)</Text>
        <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" placeholderTextColor="#475569" />

        <Text style={styles.label}>Tamaño</Text>
        <View style={styles.row}>
          {SIZES.map((s) => (
            <TouchableOpacity key={s.value} style={[styles.chip, size === s.value && styles.chipActive]} onPress={() => setSize(s.value)}>
              <Text style={[styles.chipText, size === s.value && styles.chipTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Estado</Text>
        <View style={styles.row}>
          {STATUSES.map((s) => (
            <TouchableOpacity key={s.value} style={[styles.chip, status === s.value && { borderColor: s.color, backgroundColor: s.color + '20' }]} onPress={() => setStatus(s.value)}>
              <Text style={[styles.chipText, status === s.value && { color: s.color }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Descripción</Text>
        <TextInput style={[styles.input, styles.textarea]} value={description} onChangeText={setDescription} multiline numberOfLines={4} placeholderTextColor="#475569" />

        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveBtnText}>Guardar Cambios</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  aura1: { position: 'absolute', top: '-20%', left: '-30%', width: 500, height: 500, borderRadius: 250, backgroundColor: 'rgba(52,211,153,0.18)' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16, backgroundColor: 'rgba(30,41,59,0.6)', borderBottomWidth: 1.2, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, color: '#ffffff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  form: { padding: 20, paddingBottom: 60, gap: 12 },
  photoBox: { height: 160, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 4 },
  photoPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoHint: { color: '#64748b', fontSize: 13, marginTop: 8 },
  label: { color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 4 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1.2, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: '#ffffff', fontSize: 15 },
  textarea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.2, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)' },
  chipActive: { borderColor: '#34d399', backgroundColor: 'rgba(52,211,153,0.15)' },
  chipText: { color: '#64748b', fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#34d399' },
  saveBtn: { backgroundColor: '#34d399', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8, shadowColor: '#34d399', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
