import React, { useRef, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAiChat } from '@features/ai-chat/presentation/hooks/useAiChat';
import { AiMessage } from '@features/ai-chat/domain/entities/AiMessage';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';

const SUGGESTIONS = [
  '¿Qué debo darle de comer a un cachorro?',
  '¿Con qué frecuencia debo llevar mi gato al veterinario?',
  '¿Cómo entreno a un perro adulto adoptado?',
  '¿Cuántas vacunas necesita un perro nuevo?',
];

export default function AiChatScreen() {
  const router = useRouter();
  const { messages, isLoading, error, sendMessage, clearChat } = useAiChat();
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if (!text.trim() || isLoading) return;
    const msg = text.trim();
    setText('');
    await sendMessage(msg);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = ({ item, index }: { item: AiMessage; index: number }) => {
    const isUser = item.role === 'user';
    return (
      <Animated.View entering={FadeInDown.delay(50).duration(300)} style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <MaterialCommunityIcons name="robot" size={18} color="#c084fc" />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{item.content}</Text>
          <Text style={[styles.timeText, isUser && styles.timeTextUser]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={StyleSheet.absoluteFillObject}>
        <View style={styles.aura1} />
        <View style={styles.aura2} />
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFillObject} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons name="robot" size={20} color="#c084fc" />
          </View>
          <View>
            <Text style={styles.headerTitle}>PetAdopt AI</Text>
            <Text style={styles.headerSubtitle}>Asistente de salud y cuidados</Text>
          </View>
        </View>
        {messages.length > 0 && (
          <TouchableOpacity onPress={clearChat} style={styles.clearBtn}>
            <MaterialCommunityIcons name="delete-outline" size={22} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {messages.length === 0 ? (
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeIcon}>
              <MaterialCommunityIcons name="robot-excited" size={60} color="#c084fc" />
            </View>
            <Text style={styles.welcomeTitle}>¡Hola! Soy PetAdopt AI</Text>
            <Text style={styles.welcomeText}>Puedo ayudarte con preguntas sobre salud, alimentación y cuidados de tu mascota.</Text>
            <Text style={styles.suggestionsTitle}>Preguntas sugeridas:</Text>
            {SUGGESTIONS.map((s, i) => (
              <TouchableOpacity key={i} style={styles.suggestion} onPress={() => sendMessage(s)}>
                <MaterialCommunityIcons name="lightbulb-outline" size={16} color="#c084fc" />
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {error && (
          <View style={styles.errorBanner}>
            <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#f87171" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {isLoading && (
          <View style={styles.typingIndicator}>
            <View style={styles.aiAvatar}>
              <MaterialCommunityIcons name="robot" size={16} color="#c084fc" />
            </View>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color="#c084fc" />
              <Text style={styles.typingText}>Pensando...</Text>
            </View>
          </View>
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Pregunta sobre salud, cuidados..."
            placeholderTextColor="#64748b"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || isLoading) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || isLoading}
          >
            <MaterialCommunityIcons name="send" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  aura1: { position: 'absolute', top: '-20%', left: '-30%', width: 500, height: 500, borderRadius: 250, backgroundColor: 'rgba(192,132,252,0.15)' },
  aura2: { position: 'absolute', bottom: '10%', right: '-30%', width: 400, height: 400, borderRadius: 200, backgroundColor: 'rgba(79,70,229,0.15)' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16, backgroundColor: 'rgba(30,41,59,0.6)', borderBottomWidth: 1.2, borderBottomColor: 'rgba(255,255,255,0.08)', gap: 12 },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(192,132,252,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(192,132,252,0.3)' },
  headerTitle: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  headerSubtitle: { color: '#94a3b8', fontSize: 12 },
  clearBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  welcomeContainer: { flex: 1, padding: 24, alignItems: 'center' },
  welcomeIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(192,132,252,0.12)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1.5, borderColor: 'rgba(192,132,252,0.3)' },
  welcomeTitle: { color: '#ffffff', fontSize: 22, fontWeight: '700', marginBottom: 10 },
  welcomeText: { color: '#94a3b8', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  suggestionsTitle: { color: '#64748b', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, alignSelf: 'flex-start', marginBottom: 12 },
  suggestion: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(192,132,252,0.08)', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(192,132,252,0.2)', width: '100%' },
  suggestionText: { color: '#cbd5e1', fontSize: 13, flex: 1 },
  messageList: { padding: 16, paddingBottom: 8, flexGrow: 1 },
  messageRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end', gap: 8 },
  messageRowUser: { flexDirection: 'row-reverse' },
  aiAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(192,132,252,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(192,132,252,0.3)' },
  bubble: { maxWidth: '78%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleUser: { backgroundColor: '#6366f1', borderBottomRightRadius: 4 },
  bubbleAI: { backgroundColor: 'rgba(22,32,51,0.9)', borderBottomLeftRadius: 4, borderWidth: 1.2, borderColor: 'rgba(255,255,255,0.09)' },
  bubbleText: { color: '#cbd5e1', fontSize: 15, lineHeight: 21 },
  bubbleTextUser: { color: '#ffffff' },
  timeText: { color: '#64748b', fontSize: 10, marginTop: 4 },
  timeTextUser: { textAlign: 'right', color: 'rgba(255,255,255,0.6)' },
  typingIndicator: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(22,32,51,0.9)', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1.2, borderColor: 'rgba(255,255,255,0.09)' },
  typingText: { color: '#94a3b8', fontSize: 13 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', borderWidth: 1, borderRadius: 10, padding: 12, marginHorizontal: 16, marginBottom: 8 },
  errorText: { color: '#f87171', fontSize: 13, flex: 1 },
  inputBar: { flexDirection: 'row', padding: 12, paddingBottom: 30, backgroundColor: 'rgba(30,41,59,0.65)', borderTopWidth: 1.2, borderTopColor: 'rgba(255,255,255,0.08)', gap: 10, alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#ffffff', fontSize: 15, maxHeight: 120, borderWidth: 1.2, borderColor: 'rgba(255,255,255,0.08)' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#c084fc', justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: 'rgba(192,132,252,0.3)', opacity: 0.5 },
});
