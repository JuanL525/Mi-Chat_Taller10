import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, Image, ActivityIndicator, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { usePets } from '@features/pets/presentation/hooks/usePets';
import { PetSize } from '@features/pets/domain/entities/Pet';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';

const SIZES: { value: PetSize; label: string }[] = [
  { value: 'small', label: 'Pequeño' },
  { value: 'medium', label: 'Mediano' },
  { value: 'large', label: 'Grande' },
];

export default function CreatePetScreen() {
  const router = useRouter();
  const { createPet } = usePets();

  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [size, setSize] = useState<PetSize>('medium');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoBase64(result.assets[0].base64 ?? null);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !breed.trim()) {
      Alert.alert('Campos requeridos', 'Nombre y raza son obligatorios');
      return;
    }
    setSaving(true);
    try {
      await createPet({
        name: name.trim(),
        breed: breed.trim(),
        age: parseInt(age) || 0,
        size,
        description: description.trim(),
        photoUri: photoUri ?? undefined,
        photoBase64: photoBase64 ?? undefined,
      });
      Alert.alert('¡Éxito!', `${name} fue registrada exitosamente`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
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
        <Text style={styles.headerTitle}>Nueva Mascota</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100)}>
          <TouchableOpacity style={styles.photoBox} onPress={handlePickPhoto} activeOpacity={0.8}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            ) : (
              <>
                <MaterialCommunityIcons name="camera-plus" size={40} color="#64748b" />
                <Text style={styles.photoHint}>Toca para agregar foto</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={styles.label}>Nombre *</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ej: Luna" placeholderTextColor="#475569" />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250)}>
          <Text style={styles.label}>Raza *</Text>
          <TextInput style={styles.input} value={breed} onChangeText={setBreed} placeholder="Ej: Labrador" placeholderTextColor="#475569" />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={styles.label}>Edad (años)</Text>
          <TextInput style={styles.input} value={age} onChangeText={setAge} placeholder="0" placeholderTextColor="#475569" keyboardType="numeric" />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350)}>
          <Text style={styles.label}>Tamaño</Text>
          <View style={styles.sizeRow}>
            {SIZES.map((s) => (
              <TouchableOpacity
                key={s.value}
                style={[styles.sizeBtn, size === s.value && styles.sizeBtnActive]}
                onPress={() => setSize(s.value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.sizeBtnText, size === s.value && styles.sizeBtnTextActive]}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Cuéntanos sobre la personalidad y necesidades de la mascota..."
            placeholderTextColor="#475569"
            multiline
            numberOfLines={4}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500)}>
          <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <MaterialCommunityIcons name="content-save" size={20} color="#ffffff" />
                <Text style={styles.saveBtnText}>Guardar Mascota</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
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
  form: { padding: 20, paddingBottom: 60, gap: 16 },
  photoBox: { height: 180, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 4 },
  photoPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoHint: { color: '#64748b', fontSize: 13, marginTop: 8 },
  label: { color: '#94a3b8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1.2, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: '#ffffff', fontSize: 15 },
  textarea: { height: 100, textAlignVertical: 'top' },
  sizeRow: { flexDirection: 'row', gap: 10 },
  sizeBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.2, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)' },
  sizeBtnActive: { borderColor: '#34d399', backgroundColor: 'rgba(52,211,153,0.15)' },
  sizeBtnText: { color: '#64748b', fontWeight: '600' },
  sizeBtnTextActive: { color: '#34d399' },
  saveBtn: { flexDirection: 'row', backgroundColor: '#34d399', borderRadius: 14, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', gap: 8, shadowColor: '#34d399', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
