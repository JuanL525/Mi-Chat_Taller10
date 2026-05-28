import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="refugio" />
      <Stack.Screen name="adoptante" />
      <Stack.Screen name="pets" />
      <Stack.Screen name="pets/create" />
      <Stack.Screen name="pets/[petId]" />
      <Stack.Screen name="pets/edit/[petId]" />
      <Stack.Screen name="adoptions" />
      <Stack.Screen name="adoptions/[requestId]" />
      <Stack.Screen name="ai-chat" />
      <Stack.Screen name="map" />
      <Stack.Screen name="chats" />
      <Stack.Screen name="product/[roomId]" />
      <Stack.Screen name="chat/[roomId]" />
    </Stack>
  );
}
