import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import WebView from 'react-native-webview';
import * as Location from 'expo-location';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { useShelterMap } from '@features/map/presentation/hooks/useShelterMap';

function buildLeafletHTML(
  userLat: number | null,
  userLng: number | null,
  shelters: { lat: number; lng: number; name: string }[],
  enableTap: boolean,
  selected: { lat: number; lng: number } | null,
): string {
  const shelterMarkers = shelters.map((s) =>
    `L.marker([${s.lat}, ${s.lng}], {icon: shelterIcon})
      .addTo(map)
      .bindPopup('<b>🏠 ${s.name}</b><br>Refugio registrado');`
  ).join('\n');

  const userMarker = userLat != null && userLng != null
    ? `L.marker([${userLat}, ${userLng}], {icon: userIcon}).addTo(map).bindPopup('<b>📍 Tu ubicación</b>');`
    : '';

  const selectedMarker = selected != null
    ? `selectedMarker = L.marker([${selected.lat}, ${selected.lng}], {icon: selectedIcon}).addTo(map).bindPopup('<b>📌 Ubicación elegida</b>');`
    : '';

  const allPoints = [
    ...shelters.map((s) => `[${s.lat}, ${s.lng}]`),
    ...(userLat != null && userLng != null ? [`[${userLat}, ${userLng}]`] : []),
    ...(selected != null ? [`[${selected.lat}, ${selected.lng}]`] : []),
  ];

  const center = userLat != null && userLng != null
    ? `[${userLat}, ${userLng}]`
    : shelters.length > 0 ? `[${shelters[0].lat}, ${shelters[0].lng}]` : '[-0.1807, -78.4678]';

  const fitBounds = allPoints.length > 1
    ? `map.fitBounds([${allPoints.join(',')}], { padding: [50, 50], maxZoom: 15 });`
    : '';

  const tapScript = enableTap
    ? `map.on('click', function(e) {
        if (selectedMarker) { map.removeLayer(selectedMarker); }
        selectedMarker = L.marker([e.latlng.lat, e.latlng.lng], {icon: selectedIcon})
          .addTo(map).bindPopup('<b>📌 Ubicación elegida</b>').openPopup();
        window.ReactNativeWebView.postMessage(JSON.stringify({ lat: e.latlng.lat, lng: e.latlng.lng }));
      });`
    : '';

  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #090d16; }
  #map { width: 100vw; height: 100vh; }
</style>
</head><body>
<div id="map"></div>
<script>
  var selectedMarker = null;
  var map = L.map('map').setView(${center}, 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  var shelterIcon = L.divIcon({
    html: '<div style="background:#34d399;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4)">🏠</div>',
    iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -20], className: ''
  });

  var userIcon = L.divIcon({
    html: '<div style="background:#6366f1;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4)">📍</div>',
    iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -20], className: ''
  });

  var selectedIcon = L.divIcon({
    html: '<div style="background:#fbbf24;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4)">📌</div>',
    iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -20], className: ''
  });

  ${shelterMarkers}
  ${userMarker}
  ${selectedMarker}
  ${fitBounds}
  ${tapScript}
</script>
</body></html>`;
}

export default function MapScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { shelters, isLoading, loadShelters, saveMyLocation } = useShelterMap();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const isRefugio = user?.role === 'refugio';

  useEffect(() => {
    loadShelters();
    requestLocation();
  }, []);

  const requestLocation = async () => {
    setLocationLoading(true);
    try {
      const servicesOn = await Location.hasServicesEnabledAsync();
      if (!servicesOn) {
        console.warn('[Map] Location services disabled');
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('[Map] Location permission denied');
        return;
      }
      // Timeout para evitar que se quede colgado si el GPS no responde
      const pos = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
      ]);
      if (pos) {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } else {
        console.warn('[Map] Location request timed out');
      }
    } catch (e) {
      console.warn('[Map] Location error:', e);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSaveLocation = async () => {
    const loc = selectedLocation ?? userLocation;
    if (!loc) {
      Alert.alert(
        'Elige una ubicación',
        'Toca un punto en el mapa para marcar tu refugio, o usa el botón de GPS para usar tu ubicación actual.'
      );
      return;
    }
    setSaving(true);
    try {
      await saveMyLocation(loc.lat, loc.lng);
      Alert.alert('¡Listo!', 'La ubicación de tu refugio fue guardada. Ahora los adoptantes podrán verla en el mapa.');
      setSelectedLocation(null);
      loadShelters();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const shelterMarkers = shelters.map((s) => ({ lat: s.latitude, lng: s.longitude, name: s.shelterName }));
  const html = buildLeafletHTML(
    userLocation?.lat ?? null,
    userLocation?.lng ?? null,
    shelterMarkers,
    isRefugio,
    selectedLocation,
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header overlay */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refugios Cercanos</Text>
        <TouchableOpacity onPress={requestLocation} style={styles.locateBtn} disabled={locationLoading}>
          {locationLoading
            ? <ActivityIndicator size="small" color="#60a5fa" />
            : <MaterialCommunityIcons name="crosshairs-gps" size={22} color="#60a5fa" />
          }
        </TouchableOpacity>
      </View>

      {/* Map siempre se renderiza; el spinner es solo un overlay */}
      <WebView
        key={html.length + (userLocation ? 'u' : '') + (selectedLocation ? 's' : '') + shelters.length}
        source={{ html }}
        style={styles.map}
        javaScriptEnabled
        originWhitelist={['*']}
        scrollEnabled={false}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (typeof data.lat === 'number' && typeof data.lng === 'number') {
              setSelectedLocation({ lat: data.lat, lng: data.lng });
            }
          } catch {}
        }}
      />

      {isLoading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#34d399" />
          <Text style={styles.loadingText}>Cargando refugios...</Text>
        </View>
      )}

      {/* Hint para el refugio */}
      {isRefugio && (
        <View style={styles.hintBox} pointerEvents="none">
          <MaterialCommunityIcons name="gesture-tap" size={16} color="#fbbf24" />
          <Text style={styles.hintText}>Toca el mapa para marcar tu refugio</Text>
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>🏠</Text>
          <Text style={styles.legendText}>Refugios ({shelters.length})</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>📍</Text>
          <Text style={styles.legendText}>Tú</Text>
        </View>
        {isRefugio && (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveLocation} disabled={saving}>
            {saving
              ? <ActivityIndicator size="small" color="#ffffff" />
              : <>
                  <MaterialCommunityIcons name="map-marker-plus" size={16} color="#ffffff" />
                  <Text style={styles.saveBtnText}>Guardar mi refugio</Text>
                </>
            }
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16, backgroundColor: 'rgba(9,13,22,0.85)', borderBottomWidth: 1.2, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, color: '#ffffff', fontSize: 18, fontWeight: '700', marginLeft: 8 },
  locateBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  map: { flex: 1 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', gap: 16, backgroundColor: 'rgba(9,13,22,0.6)' },
  loadingText: { color: '#94a3b8', fontSize: 15 },
  hintBox: { position: 'absolute', top: 120, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(9,13,22,0.9)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(251,191,36,0.4)' },
  hintText: { color: '#fbbf24', fontSize: 12, fontWeight: '600' },
  legend: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(9,13,22,0.9)', padding: 16, paddingBottom: 30, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendIcon: { fontSize: 18 },
  legendText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#34d399', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginLeft: 'auto', minWidth: 140, justifyContent: 'center' },
  saveBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
});
