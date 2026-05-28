import { useAuth } from "@features/auth/presentation/hooks/useAuth";
import { Link } from "expo-router";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { font } from "../theme";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";

const stars = [
  { id: 1, top: '5%', left: '18%', size: 2 },
  { id: 2, top: '25%', left: '80%', size: 3 },
  { id: 3, top: '42%', left: '10%', size: 2 },
  { id: 4, top: '65%', left: '88%', size: 3 },
  { id: 5, top: '88%', left: '12%', size: 2 },
  { id: 6, top: '12%', left: '70%', size: 2 },
  { id: 7, top: '38%', left: '30%', size: 3 },
  { id: 8, top: '52%', left: '95%', size: 2 },
  { id: 9, top: '72%', left: '40%', size: 2 },
  { id: 10, top: '95%', left: '72%', size: 3 },
  { id: 11, top: '8%', left: '32%', size: 3 },
  { id: 12, top: '58%', left: '6%', size: 2 },
  { id: 13, top: '20%', left: '48%', size: 2 },
  { id: 14, top: '80%', left: '52%', size: 3 },
  { id: 15, top: '45%', left: '78%', size: 2 },
];

const TwinklingStar = ({ star }: { star: typeof stars[0] }) => {
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 + Math.random() * 1500 }),
        withTiming(0.2, { duration: 1500 + Math.random() * 1500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: star.top as any,
          left: star.left as any,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          backgroundColor: '#00f0ff',
        },
        animatedStyle,
      ]}
    />
  );
};

const GridLines = () => (
  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    <View style={styles.gridOuterBorder} />
    <View style={[styles.gridLine, { top: '30%', left: 0, right: 0, height: 0.5 }]} />
    <View style={[styles.gridLine, { top: '70%', left: 0, right: 0, height: 0.5 }]} />
    <View style={[styles.gridLine, { left: '25%', top: 0, bottom: 0, width: 0.5 }]} />
    <View style={[styles.gridLine, { left: '75%', top: 0, bottom: 0, width: 0.5 }]} />
  </View>
);

const AnimatedAuraBackground = () => {
  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const tx1 = useSharedValue(0);
  const ty1 = useSharedValue(0);
  const tx2 = useSharedValue(0);
  const ty2 = useSharedValue(0);

  useEffect(() => {
    scale1.value = withRepeat(
      withTiming(1.15, { duration: 12000 }),
      -1,
      true
    );
    scale2.value = withRepeat(
      withTiming(1.2, { duration: 15000 }),
      -1,
      true
    );
    
    tx1.value = withRepeat(withTiming(30, { duration: 18000 }), -1, true);
    ty1.value = withRepeat(withTiming(-20, { duration: 14000 }), -1, true);
    
    tx2.value = withRepeat(withTiming(-30, { duration: 20000 }), -1, true);
    ty2.value = withRepeat(withTiming(20, { duration: 16000 }), -1, true);
  }, []);

  const aura1Style = useAnimatedStyle(() => ({
    transform: [
      { scale: scale1.value },
      { translateX: tx1.value },
      { translateY: ty1.value }
    ],
  }));

  const aura2Style = useAnimatedStyle(() => ({
    transform: [
      { scale: scale2.value },
      { translateX: tx2.value },
      { translateY: ty2.value }
    ],
  }));

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Animated.View style={[styles.aura1, aura1Style]} />
      <Animated.View style={[styles.aura2, aura2Style]} />
      {stars.map(star => (
        <TwinklingStar key={star.id} star={star} />
      ))}
      <GridLines />
      <BlurView 
        intensity={85} 
        tint="dark" 
        style={StyleSheet.absoluteFillObject} 
      />
    </View>
  );
};

const TopHUDBar = () => (
  <View style={styles.topHudContainer} pointerEvents="none">
    <View style={styles.hudLine} />
    <View style={styles.hudRow}>
      <Text style={styles.hudText}>[ SYS.ON ]</Text>
      <View style={styles.hudSpacer} />
      <Text style={styles.hudText}>[ SECURE.LINK ]</Text>
    </View>
  </View>
);

const BottomHUDBar = () => (
  <View style={styles.bottomHudContainer} pointerEvents="none">
    <View style={styles.hudRow}>
      <Text style={styles.hudText}>[ AES-256 ]</Text>
      <View style={styles.hudSpacer} />
      <Text style={styles.hudText}>[ NOMINAL ]</Text>
    </View>
    <View style={styles.hudLine} />
  </View>
);

const RotatingRing = ({ size, duration, direction = 1, color = 'rgba(0, 240, 255, 0.2)' }: any) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360 * direction, { duration, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1,
          borderColor: color,
          borderStyle: 'dashed',
        },
        animatedStyle,
      ]}
    />
  );
};

const BlinkingCursor = () => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 400 }),
        withTiming(1, { duration: 400 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.terminalCursor, animatedStyle]}>
      _
    </Animated.Text>
  );
};

const TerminalLogger = () => {
  const messages = [
    "REGISTRO: OK",
    "ROL: VALIDO",
    "ENLACE: ACTIVO",
    "ESTADO: NOMINAL",
    "SISTEMA: OK",
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleText, setVisibleText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    let timer: any;
    const fullText = messages[currentIndex];
    
    if (isDeleting) {
      timer = setTimeout(() => {
        setVisibleText(prev => prev.slice(0, -1));
      }, 20);
    } else {
      timer = setTimeout(() => {
        setVisibleText(fullText.slice(0, visibleText.length + 1));
      }, 40);
    }
    
    if (!isDeleting && visibleText === fullText) {
      timer = setTimeout(() => setIsDeleting(true), 2500);
    } else if (isDeleting && visibleText === "") {
      setIsDeleting(false);
      setCurrentIndex(prev => (prev + 1) % messages.length);
    }
    
    return () => clearTimeout(timer);
  }, [visibleText, isDeleting, currentIndex]);
  
  return (
    <View style={styles.terminalContainer}>
      <MaterialCommunityIcons name="console-line" size={12} color="#00f0ff" style={{ marginRight: 6 }} />
      <Text style={styles.terminalText}>
        {`SYS.LOG // ${visibleText}`}
      </Text>
      <BlinkingCursor />
    </View>
  );
};

const CornerBrackets = () => (
  <>
    <View style={[styles.corner, styles.topLeft]} />
    <View style={[styles.corner, styles.topRight]} />
    <View style={[styles.corner, styles.bottomLeft]} />
    <View style={[styles.corner, styles.bottomRight]} />
  </>
);

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<'adoptante' | 'refugio'>('adoptante');
  const [focus, setFocus] = useState<"user" | "email" | "password" | null>(null);
  const { register, isLoading, error } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <AnimatedAuraBackground />
      <TopHUDBar />
      <BottomHUDBar />

      <View style={styles.card}>
        <CornerBrackets />

        {/* Animated Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.logoContainer}>
          <View style={styles.logoRingContainer}>
            <RotatingRing size={105} duration={15000} direction={1} color="rgba(99, 102, 241, 0.25)" />
            <RotatingRing size={85} duration={9000} direction={-1} color="rgba(0, 240, 255, 0.35)" />
            <BlurView intensity={25} tint="light" style={styles.logoIconWrapper}>
              <MaterialCommunityIcons name="star-four-points" size={32} color="#00f0ff" />
            </BlurView>
          </View>
          <Text style={styles.logoText}>AETHERA</Text>
          <Text style={styles.title}>Crear cuenta 🚀</Text>
        </Animated.View>
        
        {/* Live Terminal HUD Check */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <TerminalLogger />
        </Animated.View>

        {error && (
          <Animated.View entering={FadeInDown.delay(250).duration(600)}>
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-decagram-outline" size={16} color="#ff003c" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </Animated.View>
        )}

        {/* Input Usuario */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <Text style={styles.inputHeaderLabel}>[ REGISTRO // USUARIO ]</Text>
          <View style={[
            styles.inputContainer,
            focus === "user" && styles.inputFocused
          ]}>
            <MaterialCommunityIcons 
              name="account-outline" 
              size={18} 
              color={focus === "user" ? "#00f0ff" : "#94a3b8"} 
            />
            <TextInput
              style={styles.textInput}
              placeholder="Usuario (sin espacios)"
              value={username}
              onChangeText={setUsername}
              onFocus={() => setFocus("user")}
              onBlur={() => setFocus(null)}
              autoCapitalize="none"
              placeholderTextColor="#475569"
            />
            {focus === "user" && <CornerBrackets />}
            {focus === "user" && <View style={styles.activeIndicatorDot} />}
          </View>
        </Animated.View>

        {/* Input Correo */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <Text style={styles.inputHeaderLabel}>[ ENLACE // CORREO ]</Text>
          <View style={[
            styles.inputContainer,
            focus === "email" && styles.inputFocused
          ]}>
            <MaterialCommunityIcons 
              name="email-outline" 
              size={18} 
              color={focus === "email" ? "#00f0ff" : "#94a3b8"} 
            />
            <TextInput
              style={styles.textInput}
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocus("email")}
              onBlur={() => setFocus(null)}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#475569"
            />
            {focus === "email" && <CornerBrackets />}
            {focus === "email" && <View style={styles.activeIndicatorDot} />}
          </View>
        </Animated.View>

        {/* Input Contraseña */}
        <Animated.View entering={FadeInDown.delay(500).duration(600)}>
          <Text style={styles.inputHeaderLabel}>[ LLAVE // CONTRASEÑA ]</Text>
          <View style={[
            styles.inputContainer,
            focus === "password" && styles.inputFocused
          ]}>
            <MaterialCommunityIcons 
              name="lock-outline" 
              size={18} 
              color={focus === "password" ? "#00f0ff" : "#94a3b8"} 
            />
            <TextInput
              style={styles.textInput}
              placeholder="Contraseña (mín. 6 caracteres)"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocus("password")}
              onBlur={() => setFocus(null)}
              secureTextEntry
              placeholderTextColor="#475569"
            />
            {focus === "password" && <CornerBrackets />}
            {focus === "password" && <View style={styles.activeIndicatorDot} />}
          </View>
        </Animated.View>

        {/* Role Selector */}
        <Animated.View entering={FadeInDown.delay(600).duration(600)}>
          <Text style={styles.sectionLabel}>[ SELECCIÓN // ROL ]</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                role === 'adoptante' && styles.roleOptionActiveClient
              ]}
              onPress={() => setRole('adoptante')}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.roleOptionText,
                role === 'adoptante' && styles.roleOptionTextActiveClient
              ]}>
                🐾 Adoptante
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleOption,
                role === 'refugio' && styles.roleOptionActiveSeller
              ]}
              onPress={() => setRole('refugio')}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.roleOptionText,
                role === 'refugio' && styles.roleOptionTextActiveSeller
              ]}>
                🏠 Refugio
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Botón Registrarse */}
        <Animated.View entering={FadeInDown.delay(700).duration(600)}>
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={() => register({ email, password, username, role })}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#00f0ff', '#4f46e5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.buttonGradient, isLoading && styles.buttonDisabled]}
            >
              {isLoading ? (
                <Text style={styles.buttonText}>CREANDO PERFIL...</Text>
              ) : (
                <Text style={styles.buttonText}>REGISTRARSE EN LA RED ▶</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Login Link */}
        <Animated.View entering={FadeInDown.delay(800).duration(600)}>
          <Link href="/(auth)/login" style={styles.link}>
            ¿Ya tienes cuenta? <Text style={styles.linkAccent}>INICIA SESIÓN</Text>
          </Link>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: '#0B0F19', // Deep Midnight Slate background
  },
  aura1: {
    position: 'absolute',
    top: '-20%',
    left: '-30%',
    width: 550,
    height: 550,
    borderRadius: 275,
    backgroundColor: 'rgba(79, 70, 229, 0.22)', // soft out-of-focus indigo glow
  },
  aura2: {
    position: 'absolute',
    bottom: '-15%',
    right: '-35%',
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(192, 38, 211, 0.14)', // soft fuchsia glow
  },
  gridOuterBorder: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    bottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.04)',
    borderRadius: 12,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 240, 255, 0.02)',
  },
  topHudContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
  },
  bottomHudContainer: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
  },
  hudLine: {
    height: 0.8,
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    marginVertical: 4,
  },
  hudRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  hudText: {
    fontSize: 9,
    letterSpacing: 1.2,
    color: 'rgba(0, 240, 255, 0.45)',
    fontWeight: '400',
  },
  hudSpacer: {
    flex: 1,
  },
  logoRingContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  logoIconWrapper: {
    width: 66,
    height: 66,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(0, 240, 255, 0.25)',
    backgroundColor: 'rgba(11, 15, 25, 0.6)',
  },
  logoText: {
    fontSize: 34,
    fontWeight: "900",
    color: '#ffffff',
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: 8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: "center",
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  terminalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.03)',
    borderColor: 'rgba(0, 240, 255, 0.15)',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 14,
    justifyContent: 'center',
    height: 38, // Fixed height to prevent layout shifts!
  },
  terminalText: {
    color: '#00f0ff',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  terminalCursor: {
    color: '#00f0ff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  card: {
    backgroundColor: 'rgba(11, 15, 25, 0.45)', // very subtle dark glass
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1.2,
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 4,
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderColor: 'rgba(0, 240, 255, 0.45)',
  },
  topLeft: {
    top: -2,
    left: -2,
    borderLeftWidth: 2,
    borderTopWidth: 2,
  },
  topRight: {
    top: -2,
    right: -2,
    borderRightWidth: 2,
    borderTopWidth: 2,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  inputHeaderLabel: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 4,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.2,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 8,
    gap: 12,
    position: 'relative',
  },
  inputFocused: {
    borderColor: 'rgba(0, 240, 255, 0.45)', // SpaceX cyan focus
    backgroundColor: 'rgba(0, 240, 255, 0.02)',
  },
  activeIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00f0ff',
    position: 'absolute',
    right: 16,
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    height: '100%',
  },
  sectionLabel: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 6,
    marginTop: 8,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  roleOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.2,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    position: 'relative',
  },
  roleOptionActiveClient: {
    borderColor: '#34d399', // Emerald active client border
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
  },
  roleOptionActiveSeller: {
    borderColor: '#00f0ff', // Cyan active seller border
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
  },
  roleOptionText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  roleOptionTextActiveClient: {
    color: '#34d399',
  },
  roleOptionTextActiveSeller: {
    color: '#00f0ff',
  },
  buttonWrapper: {
    marginTop: 14,
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  buttonGradient: {
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 1.5,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 60, 0.08)',
    borderColor: 'rgba(255, 0, 60, 0.25)',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 14,
    justifyContent: 'center',
  },
  errorText: {
    color: '#ff003c',
    fontSize: 13,
    fontWeight: '600',
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    color: '#94a3b8',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  linkAccent: {
    color: '#00f0ff',
    fontWeight: '700',
  },
});
