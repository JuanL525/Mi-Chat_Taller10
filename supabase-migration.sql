-- =============================================================================
-- PetAdopt – Migración de Base de Datos
-- Ejecutar en Supabase SQL Editor
-- =============================================================================

-- 1. Actualizar columna role en profiles (seller->refugio, client->adoptante)
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('refugio', 'adoptante'));

-- Migrar valores existentes
UPDATE profiles SET role = 'refugio' WHERE role = 'seller';
UPDATE profiles SET role = 'adoptante' WHERE role = 'client';

-- 2. Agregar coordenadas al perfil del refugio
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS latitude  FLOAT8,
  ADD COLUMN IF NOT EXISTS longitude FLOAT8;

-- 3. Tabla de mascotas
CREATE TABLE IF NOT EXISTS pets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shelter_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  breed       TEXT NOT NULL DEFAULT '',
  age         INTEGER NOT NULL DEFAULT 0,
  size        TEXT NOT NULL DEFAULT 'medium' CHECK (size IN ('small', 'medium', 'large')),
  description TEXT NOT NULL DEFAULT '',
  photo_url   TEXT,
  status      TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'pending', 'adopted')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS en pets
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pets
CREATE POLICY "Todos pueden ver mascotas"
  ON pets FOR SELECT USING (true);

CREATE POLICY "Solo el refugio dueño puede insertar"
  ON pets FOR INSERT
  WITH CHECK (shelter_id = auth.uid());

CREATE POLICY "Solo el refugio dueño puede actualizar"
  ON pets FOR UPDATE
  USING (shelter_id = auth.uid());

CREATE POLICY "Solo el refugio dueño puede eliminar"
  ON pets FOR DELETE
  USING (shelter_id = auth.uid());

-- 4. Tabla de solicitudes de adopción
CREATE TABLE IF NOT EXISTS adoption_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id      UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  adopter_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shelter_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  message     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(pet_id, adopter_id)
);

-- Habilitar RLS en adoption_requests
ALTER TABLE adoption_requests ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para adoption_requests
CREATE POLICY "Adoptante puede ver sus propias solicitudes"
  ON adoption_requests FOR SELECT
  USING (adopter_id = auth.uid() OR shelter_id = auth.uid());

CREATE POLICY "Adoptante puede crear solicitudes"
  ON adoption_requests FOR INSERT
  WITH CHECK (adopter_id = auth.uid());

CREATE POLICY "Refugio puede actualizar estado"
  ON adoption_requests FOR UPDATE
  USING (shelter_id = auth.uid());

-- 5. Habilitar Realtime para adoption_requests
ALTER TABLE adoption_requests REPLICA IDENTITY FULL;
-- (Activar en Supabase Dashboard > Database > Replication > adoption_requests)

-- 6. Bucket de Storage para fotos de mascotas
-- Crear manualmente en Supabase Dashboard > Storage > New Bucket:
-- Nombre: pet-photos
-- Público: true
-- Política INSERT: solo usuarios autenticados con role = 'refugio'

-- =============================================================================
-- INSTRUCCIONES ADICIONALES
-- =============================================================================
-- a) En Supabase Dashboard > Authentication > URL Configuration:
--    - Site URL: https://tu-url.vercel.app
--    - Redirect URLs: michatapp://**
--
-- b) Crear bucket 'pet-photos' en Storage con acceso público
--
-- c) Agregar EXPO_PUBLIC_GEMINI_API_KEY en archivo .env
-- =============================================================================
