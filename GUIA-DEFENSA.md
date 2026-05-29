# Guía de estudio — PetAdopt (defensa oral)

Documento de repaso para la defensa del proyecto. Cubre arquitectura, carpetas clave, configuración y flujos importantes.

---

## Índice

1. [Carpeta `features` (énfasis)](#1-carpeta-features)
2. [Carpeta `di`](#2-carpeta-di)
3. [Carpeta `services`](#3-carpeta-services)
4. [Carpeta `shared`](#4-carpeta-shared)
5. [Carpeta `supabase`](#5-carpeta-supabase)
6. [Cómo se relacionan todas](#6-cómo-se-relacionan)
7. [TanStack React Query](#7-tanstack-react-query)
8. [Diseño y estilos](#8-diseño-y-estilos)
9. [Archivos de configuración](#9-archivos-de-configuración)
10. [Flujo completo: crear mascota](#10-flujo-completo-crear-mascota)
11. [Frases rápidas para el profe](#11-frases-rápidas)
12. [Tablas BD importantes](#12-tablas-bd-importantes)

---

## 1. Carpeta `features`

### Qué es

Es el **núcleo de Clean Architecture**. Cada subcarpeta es un **módulo funcional** independiente con la misma estructura interna.

### Features del proyecto

| Feature | Responsabilidad |
|---------|-----------------|
| `auth` | Login, registro, Google OAuth, logout, reset password |
| `pets` | CRUD mascotas, fotos, sala de chat por mascota |
| `adoptions` | Solicitudes de adopción (crear, listar, aprobar/rechazar) |
| `chat` | Mensajes en tiempo real, salas, miembros |
| `ai-chat` | Chat con Gemini (IA veterinaria) |
| `map` | Ubicación de refugios en el mapa |

### Estructura interna (siempre igual)

```
features/<nombre>/
├── domain/              ← Reglas puras, SIN Supabase ni React
│   ├── entities/        → Pet.ts, User.ts, Message.ts...
│   └── repositories/    → IPetRepository.ts (contrato/interfaz)
│
├── application/         ← Casos de uso (lógica de negocio)
│   └── use-cases/       → CreatePetUseCase.ts, GetPetsUseCase.ts...
│
├── infrastructure/      ← Implementación real (Supabase, Gemini...)
│   └── repositories/    → SupabasePetRepository.ts
│
└── presentation/        ← Capa React
    ├── hooks/           → usePets.ts, useAuth.ts...
    └── store/           → authStore.ts (Zustand, solo en auth)
```

### Qué hace cada capa

#### `domain/entities`

- Define **qué es** un objeto en la app.
- Ejemplos: `Pet`, `User`, `Message`, `AdoptionRequest`.
- También define **DTOs** (datos de entrada): `CreatePetDTO`, `LoginDTO`.
- **`createPetFactory()`**: convierte fila de Supabase (`snake_case`) → objeto `Pet` (`camelCase`).

#### `domain/repositories`

- Define **qué operaciones existen**, sin decir cómo se implementan.
- Son **interfaces** (`IPetRepository`, `IAuthRepository`).
- Ejemplo: `createPet(dto, shelterId): Promise<Pet>` — no dice si es Supabase o Appwrite.

#### `application/use-cases`

- Contiene la **lógica de negocio**.
- Valida reglas antes de tocar la BD.
- Ejemplo `CreatePetUseCase`: solo un **refugio** puede crear mascotas; foto obligatoria; raza sin números.
- Llama al repositorio: `this.petRepository.createPet(dto, currentUser.id)`.

#### `infrastructure/repositories`

- **Implementación concreta** de las interfaces.
- Habla con servicios externos: Supabase, Gemini, Storage.
- Ejemplo: `SupabasePetRepository` hace `insert` en `rooms`, `pets`, sube foto a bucket `pet-photos`.

#### `presentation/hooks`

- Puente entre **React** y los **use cases**.
- Manejan `useState`, loading, errores.
- Ejemplo: `usePets()` expone `createPet()`, `loadPets()` a las pantallas.
- Importan use cases desde `src/di/container.ts`.

### Regla de oro

> **La pantalla (`app/`) nunca llama a Supabase directamente.**  
> Siempre: Pantalla → Hook → Use Case → Repositorio (interfaz) → Implementación Supabase.

### Por qué features y no un `src/` plano

- **Separación por dominio**: auth no se mezcla con pets.
- **Testeable**: puedes mockear `IPetRepository` sin Supabase.
- **Escalable**: nuevo módulo = nueva carpeta en `features/`.
- **Inversión de dependencias**: use cases dependen de interfaces, no de Supabase.

### Frase para el profe

> "Cada feature es un módulo vertical con Clean Architecture: domain define contratos y entidades, application tiene los casos de uso, infrastructure habla con Supabase o Gemini, y presentation expone hooks a la UI."

---

## 2. Carpeta `di`

**DI = Dependency Injection (Inyección de Dependencias)**

Solo contiene `container.ts`.

### Qué hace

Instancia **una sola vez** todos los repositorios y use cases, y los conecta:

```typescript
// Repositorios concretos
export const petRepository = new SupabasePetRepository();

// Use cases reciben el repositorio por constructor
export const createPetUseCase = new CreatePetUseCase(petRepository);
```

Es el **"tablero eléctrico"** de la app: aquí decides qué implementación usa cada use case.

### Ventaja

Si mañana cambias Supabase por otro backend, cambias **una línea** en `container.ts` (Appwrite ya está comentado como ejemplo).

### Frase para el profe

> "`di` no tiene lógica de negocio. Solo ensambla repositorios y use cases. Es el punto único de composición de dependencias."

---

## 3. Carpeta `services`

Código **transversal**: no pertenece a un solo feature pero la app lo usa en varios sitios.

| Archivo | Qué hace |
|---------|----------|
| `notificationService.ts` | Permisos, canal Android, notificaciones locales (`sendMessageNotification`, `sendAdoptionNotification`) |
| `activeChatRoom.ts` | Guarda en memoria en qué sala de chat estás (`getActiveRoomId`) para no notificar si ya la estás viendo |

### Diferencia con features

| Feature | Service |
|---------|---------|
| Dominio de negocio (mascotas, chat) | Utilidad técnica compartida |
| Tiene domain/application/infrastructure | Funciones/helpers globales |
| Ej: `pets`, `auth` | Ej: notificaciones |

### Frase para el profe

> "`services` son helpers globales que cruzan varios features. Las notificaciones las usan chat, adopciones y el layout raíz, por eso no van dentro de un solo feature."

---

## 4. Carpeta `shared`

Código **reutilizable entre features**, sin ser un módulo de negocio.

```
shared/
├── design/                    → Design system
│   ├── tokens.ts              → Colores, espaciado, tipografía
│   ├── useColors.ts           → Colores según tema claro/oscuro
│   ├── themeStore.ts          → Zustand para tema
│   └── components/            → PetButton, PetInput, PetCard...
│
├── domain/errors/
│   └── AppError.ts            → Errores tipados (AUTH_LOGIN_FAILED, etc.)
│
└── infrastructure/supabase/
    └── client.ts              → Cliente Supabase (PKCE, HybridStorage)
```

| Parte | Rol |
|-------|-----|
| `shared/design` | UI consistente en toda la app |
| `shared/domain/errors` | Errores con código, usados en todos los repositorios |
| `shared/infrastructure/supabase` | Cliente Supabase usado por todos los `Supabase*Repository` |

### Frase para el profe

> "`shared` es código común: design system, errores globales y cliente Supabase. No representa un caso de uso de negocio."

---

## 5. Carpeta `supabase`

**No es código de la app móvil.** Es el **backend en la nube**.

```
supabase/
└── functions/
    └── push-notify/
        └── index.ts    → Edge Function (push en background, opcional)

Raíz del repo:
├── supabase-migration.sql         → Tablas, RLS, roles
└── supabase-push-notifications.sql → Config push (opcional)
```

| Qué | Dónde |
|-----|-------|
| App móvil se conecta | `shared/infrastructure/supabase/client.ts` |
| Backend serverless | `supabase/functions/` |
| Esquema BD | `supabase-migration.sql` |

### Frase para el profe

> "La carpeta `supabase/` del repo es backend serverless: Edge Functions y SQL. La app usa el cliente en `shared/infrastructure/supabase/client.ts`."

---

## 6. Cómo se relacionan

```
app/(app)/pets/create.tsx     ← Pantalla (Expo Router)
        ↓
usePets()                     ← features/pets/presentation
        ↓
createPetUseCase              ← features/pets/application  ←── di/container.ts
        ↓
SupabasePetRepository         ← features/pets/infrastructure
        ↓
supabase client               ← shared/infrastructure/supabase
        ↓
PostgreSQL en Supabase        ← supabase-migration.sql
```

Paralelo:

- `app/_layout.tsx` → `notificationService` (`services/`)
- Pantallas → `useColors()`, `PetButton` (`shared/design/`)

---

## 7. TanStack React Query

### ¿Está instalado?

**Sí**, en `package.json`: `@tanstack/react-query`.

### ¿Se usa?

**Casi no.** Solo está configurado en `app/_layout.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

<QueryClientProvider client={queryClient}>
  <Slot />
</QueryClientProvider>
```

**No hay** `useQuery`, `useMutation` ni `useInfiniteQuery` en el proyecto.

### ¿Qué usa entonces para datos?

| Herramienta | Dónde | Para qué |
|-------------|-------|----------|
| Hooks propios + `useState` | `usePets`, `useChat`, `useAuth`, `useAdoptions` | Cargar datos vía use cases |
| **Zustand** | `authStore`, `themeStore` | Usuario logueado, tema |
| **Supabase Realtime** | repositorios + `_layout.tsx` | Chat y notificaciones en vivo |

### Frase honesta para el profe

> "TanStack está instalado y el provider envuelve la app, pero el fetching lo hacemos con hooks personalizados que llaman a use cases. TanStack quedó preparado por si en el futuro queremos cachear peticiones, pero hoy el estado lo manejan useState + Zustand."

---

## 8. Diseño y estilos

### ¿Qué librería de UI usa?

**Ninguna completa** (no NativeBase, no React Native Paper).

Usa un **design system propio** en `src/shared/design/`.

### Componentes propios

- `PetButton`, `PetInput`, `PetCard`, `PetScreen`, `PetText`, `PetBadge`, `PetDivider`, `PetDrawer`
- `tokens.ts` — paleta coral `#FF5533`, teal, espaciado, sombras
- `useColors()` — colores reactivos según tema claro/oscuro

### ¿StyleSheet?

**Casi no.** Predomina **estilos inline** como objetos JavaScript:

```typescript
<View style={{ flex: 1, backgroundColor: c.bgPage, padding: space[4] }}>
```

`tokens.ts` indica: *"Zero StyleSheet — plain objects consumed by Moti / inline styles."*

`StyleSheet.create` solo aparece en archivos del template inicial (`collapsible.tsx`, `LottieAnimation`, pantallas legacy).

### Otras librerías visuales

| Librería | Uso |
|----------|-----|
| **Moti** | Animaciones (`MotiView`, `AnimatePresence`) |
| **Lottie** | Loading, empty state, success |
| **@expo/vector-icons** | Iconos (`MaterialCommunityIcons`) |
| **expo-linear-gradient** | Gradientes |
| **react-native-reanimated** | Motor de animaciones (Moti lo usa) |

### Frase para el profe

> "Design system propio con tokens y componentes Pet*. Estilos inline, no StyleSheet global. Animaciones con Moti y Lottie."

---

## 9. Archivos de configuración

### `tsconfig.json` — TypeScript

| Opción | Qué hace |
|--------|----------|
| `extends: expo/tsconfig.base` | Hereda config base de Expo |
| `strict: true` | TypeScript estricto |
| `paths: @features/*, @shared/*` | Alias de imports |
| `include` | Qué archivos compila |

**Frase:** "Define cómo TypeScript compila: modo estricto y alias `@features`, `@shared`."

---

### `app.json` — Manifiesto Expo

| Campo | Qué define |
|-------|------------|
| `name: "PetAdopt"` | Nombre visible |
| `scheme: "michatapp"` | Deep links para OAuth Google |
| `android.package: "com.petadopt.app"` | ID del APK/AAB |
| `plugins` | expo-router, splash, secure-store, image-picker, location, notifications |
| `experiments.typedRoutes` | Rutas tipadas en Expo Router |
| `extra.eas.projectId` | ID para EAS Build |

**Frase:** "Configuración central de Expo: permisos, plugins nativos, deep links y EAS."

---

### `metro.config.js` — Bundler

Metro empaqueta el JavaScript para React Native.

Fix para Moti:

```javascript
config.resolver.unstable_enablePackageExports = false;
```

Moti fallaba al resolver submódulos internos; esto lo corrige.

**Frase:** "Configura Metro. Desactivamos package exports para que Moti compile correctamente."

---

### `.env` (local, gitignored)

Variables sensibles para desarrollo local:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_GEMINI_API_KEY`
- `EXPO_PUBLIC_WEB_AUTH_URL`

Para **EAS Build** se configuran con `eas env:create` (no van en el repo).

---

## 10. Flujo completo: crear mascota

Flujo detallado de punta a punta cuando un **refugio** registra una mascota nueva.

### Diagrama

```
app/(app)/pets/create.tsx
        ↓  createPet(dto)
usePets.ts
        ↓  createPetUseCase.execute(dto, user)
src/di/container.ts  →  CreatePetUseCase(petRepository)
        ↓
CreatePetUseCase.ts  (validaciones de negocio)
        ↓  petRepository.createPet(dto, shelterId)
SupabasePetRepository.ts
        ↓
Supabase: rooms → room_members → pets → storage (foto)
        ↓
createPetFactory(data) → Pet
        ↓
Respuesta sube hasta la pantalla → Alert + router.back()
```

---

### Paso 1 — Pantalla: `app/(app)/pets/create.tsx`

El refugio llena el formulario (nombre, raza, edad, tamaño, descripción, foto).

Al pulsar **Guardar**, `handleSave`:

1. Valida en la UI (foto, nombre, raza sin números, edad).
2. Arma un **`CreatePetDTO`** (objeto plano con los datos del formulario).
3. Codifica la edad con `encodePetAge()` (meses 1–12, años como 101–120).
4. Llama al hook:

```typescript
await createPet({
  name: name.trim(),
  breed: breed.trim(),
  age: encodePetAge(ageNum, ageUnit),
  size,
  description: description.trim(),
  photoUri,
  photoBase64,
});
```

La pantalla **no conoce Supabase**. Solo conoce `usePets()` y tipos de `Pet.ts`.

---

### Paso 2 — Hook: `usePets.ts` (presentation)

```typescript
const createPet = useCallback(async (dto: CreatePetDTO) => {
  if (!user) throw new Error('No autenticado');
  return createPetUseCase.execute(dto, user);
}, [user]);
```

1. Toma el usuario logueado de **`useAuthStore`** (Zustand).
2. Llama a **`createPetUseCase`**, importado desde `container.ts`.

---

### Paso 3 — Contenedor DI: `src/di/container.ts`

```typescript
export const petRepository    = new SupabasePetRepository();
export const createPetUseCase = new CreatePetUseCase(petRepository);
```

`CreatePetUseCase` recibe `SupabasePetRepository`, pero el use case solo ve la interfaz `IPetRepository`.

---

### Paso 4 — Caso de uso: `CreatePetUseCase.ts` (application)

Reglas de negocio (no van en la pantalla ni en Supabase):

```typescript
async execute(dto: CreatePetDTO, currentUser: User): Promise<Pet> {
  if (currentUser.role !== 'refugio') {
    throw new AppError('FORBIDDEN', 'Solo los refugios pueden registrar mascotas');
  }
  if (!dto.name.trim()) { /* ... */ }
  if (!dto.breed.trim()) { /* ... */ }
  if (/\d/.test(dto.breed)) { /* raza sin números */ }
  if (!dto.photoUri && !dto.photoBase64) { /* foto obligatoria */ }
  if (dto.age < 0) { /* ... */ }
  return this.petRepository.createPet(dto, currentUser.id);
}
```

Si todo pasa, delega con `currentUser.id` como `shelter_id` en la BD.

---

### Paso 5 — Repositorio: `SupabasePetRepository.createPet()` (infrastructure)

#### 5a. Crear sala de chat para la mascota

```typescript
const { data: roomData } = await supabase
  .from('rooms')
  .insert({ name: `Chat · ${dto.name}`, created_by: shelterId })
  .select()
  .single();
```

#### 5b. Unir al refugio a esa sala

```typescript
await supabase.from('room_members').upsert(
  { room_id: roomData.id, user_id: shelterId },
  { onConflict: 'room_id,user_id', ignoreDuplicates: true },
);
```

Cuando un adoptante chatee sobre esa mascota, la sala ya existe.

#### 5c. Insertar la mascota en `pets`

```typescript
const { data } = await supabase.from('pets').insert({
  shelter_id: shelterId,
  name: dto.name,
  breed: dto.breed,
  age: dto.age,
  size: dto.size,
  description: dto.description,
  status: 'available',
  room_id: roomData?.id ?? null,
}).select('*, profiles(username)').single();
```

#### 5d. Convertir fila BD → objeto `Pet`

```typescript
const pet = createPetFactory(data);
```

Supabase devuelve `shelter_id`, `photo_url`, `room_id` (snake_case).  
`createPetFactory` los mapea a `shelterId`, `photoUrl`, `roomId` (camelCase).

#### 5e. Subir foto a Storage (si hay)

```typescript
if (dto.photoBase64 || dto.photoUri) {
  const photoUrl = await this.uploadPhoto(pet.id, dto.photoBase64, dto.photoUri);
  if (photoUrl) {
    await supabase.from('pets').update({ photo_url: photoUrl }).eq('id', pet.id);
    pet.photoUrl = photoUrl;
  }
}
```

Bucket: `pet-photos`. Ruta: `{petId}/photo.jpg`.

#### 5f. Devolver `Pet`

El objeto sube: Repository → UseCase → Hook → Pantalla → Alert de éxito → `router.back()`.

---

### Por qué `Pet.ts` se importa en varios archivos

| Archivo | Importa de `Pet.ts` | Por qué |
|---------|---------------------|---------|
| `IPetRepository.ts` | `Pet`, `CreatePetDTO` | Define el contrato |
| `SupabasePetRepository.ts` | `Pet`, `CreatePetDTO`, `createPetFactory` | Implementa + mapea BD |
| `usePets.ts` | `Pet`, `CreatePetDTO` | Tipos en el hook |
| `create.tsx` | `PetSize`, `encodePetAge` | UI del formulario |

No es redundancia: cada capa usa la parte de `Pet.ts` que necesita.

---

### Validación duplicada (UI + use case)

| Capa | Qué valida |
|------|------------|
| `create.tsx` | UX rápida: campos vacíos, edad, foto |
| `CreatePetUseCase` | Seguridad real: rol refugio, reglas de negocio |

Aunque alguien salte la UI, el use case bloquea si no es refugio.

---

### Resumen por capa (crear mascota)

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| UI | `create.tsx` | Formulario, validación visual, llamar `createPet()` |
| Presentation | `usePets.ts` | Pasar usuario + DTO al use case |
| DI | `container.ts` | Conectar `CreatePetUseCase` ↔ `SupabasePetRepository` |
| Application | `CreatePetUseCase.ts` | Solo refugio, validar reglas |
| Domain | `IPetRepository` + `Pet.ts` | Contrato y tipos |
| Infrastructure | `SupabasePetRepository.ts` | Room + pet + foto en Supabase |
| Externo | Supabase | Tablas `rooms`, `room_members`, `pets` + bucket `pet-photos` |

---

## 11. Frases rápidas

| Pregunta | Respuesta en una línea |
|----------|------------------------|
| ¿Qué es `features`? | Módulos de negocio con Clean Architecture (domain → application → infrastructure → presentation) |
| ¿Qué es `di`? | Ensambla repositorios y use cases en `container.ts` |
| ¿Qué es `services`? | Utilidades globales (notificaciones, sala activa) |
| ¿Qué es `shared`? | Design system, errores y cliente Supabase compartidos |
| ¿Qué es `supabase/`? | Edge Functions y SQL del backend en la nube |
| ¿TanStack? | Instalado en `_layout`, pero no se usa; datos con hooks + Zustand |
| ¿Diseño? | Design system propio, estilos inline, Moti + Lottie |
| ¿StyleSheet? | Casi no; predomina inline + tokens |
| ¿`tsconfig.json`? | TypeScript estricto + alias `@features` / `@shared` |
| ¿`app.json`? | Manifiesto Expo (app, permisos, plugins, EAS) |
| ¿`metro.config.js`? | Bundler Metro; fix para Moti |
| ¿Cómo se crea una mascota? | Pantalla → usePets → CreatePetUseCase → SupabasePetRepository → BD + Storage |

---

## 12. Tablas BD importantes

| Tabla | Para qué |
|-------|----------|
| `profiles` | Usuario, rol (`refugio` / `adoptante`), ubicación |
| `pets` | Mascotas, `room_id`, `shelter_id`, `photo_url`, `status` |
| `adoption_requests` | Solicitudes `pending` / `approved` / `rejected` |
| `rooms` + `room_members` | Salas de chat y membresía |
| `messages` | Mensajes en tiempo real |

**RLS:** cada tabla tiene políticas para que un usuario solo lea/escriba lo permitido por su rol.

---

*PetAdopt — Expo SDK 54 + Clean Architecture + Supabase + Gemini + OpenStreetMap*
