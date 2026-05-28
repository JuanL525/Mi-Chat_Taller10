# PetAdopt Web Auth

Sitio web auxiliar para confirmación de cuenta y reseteo de contraseña.

## Despliegue en Vercel

1. Instala Vercel CLI: `npm i -g vercel`
2. Desde esta carpeta: `vercel --prod`
3. Copia la URL generada (ej. `https://petadopt-auth.vercel.app`)

## Configurar en Supabase

1. Ve a **Supabase Dashboard → Authentication → URL Configuration**
2. **Site URL**: `https://tu-url.vercel.app`
3. **Redirect URLs**: agrega:
   - `https://tu-url.vercel.app/**`
   - `michatapp://**`

## Variables

Edita `index.html` y reemplaza:
- `REEMPLAZA_CON_TU_SUPABASE_URL` → tu URL de Supabase
- `REEMPLAZA_CON_TU_SUPABASE_ANON_KEY` → tu anon key
