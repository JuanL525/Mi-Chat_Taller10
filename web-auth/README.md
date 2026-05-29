# PetAdopt Web Auth

Sitio web auxiliar para confirmación de cuenta y reseteo de contraseña.

## Despliegue en Vercel

1. Instala Vercel CLI: `npm i -g vercel`
2. Desde esta carpeta: `vercel --prod`
3. Copia la URL generada (ej. `https://petadopt-auth.vercel.app`)

## Por qué fallaba con `token=pkce_...`

Si el enlace del correo contiene `token=pkce_...`, el reset fue pedido con **PKCE** (flujo de la app móvil).
Ese token solo funciona con el `code_verifier` guardado en el celular — **no en el navegador**.

La app usa `supabaseEmailAuth` (flujo **implicit**) para `resetPasswordForEmail` y `signUp`,
así el enlace del correo funciona al abrirlo en Vercel.

Tras actualizar la app, pide un **correo nuevo** — los viejos con `pkce_` seguirán fallando.

## Configurar en Supabase

1. Ve a **Supabase Dashboard → Authentication → URL Configuration**
2. **Site URL**: `https://tu-url.vercel.app`
3. **Redirect URLs** — agrega **todas** estas líneas:
   - `https://tu-url.vercel.app`
   - `https://tu-url.vercel.app/**`
   - `https://tu-url.vercel.app/reset-password`
   - `https://tu-url.vercel.app/reset-password/**`
   - `https://tu-url.vercel.app/confirm-email`
   - `https://tu-url.vercel.app/confirm-email/**`
   - `michatapp://**`
4. **Authentication → Email Templates → Reset Password** — el enlace debe usar `{{ .ConfirmationURL }}`
5. (Opcional) **Authentication → Providers → Email** — sube "Mailer OTP Expiration" a `86400` (24 h) para pruebas

## Plantilla del correo (PASO CRÍTICO)

**No uses `{{ .ConfirmationURL }}`.** Ese enlace pasa por `supabase.co/auth/v1/verify` y Gmail/Outlook
lo abren en segundo plano al recibir el correo → `otp_expired` antes de que tú hagas clic.

Usa enlace **directo a Vercel** con `token_hash`:

1. Supabase → **Authentication → Email Templates → Reset Password**
2. Reemplaza el cuerpo con `web-auth/email-templates/reset-password.html`
3. El enlace debe ser: `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery`
4. **Save**
5. Pide un correo **nuevo** desde la app

Al copiar el enlace del correo nuevo debe verse así (sin `supabase.co`):

```
https://petadopt-am.vercel.app/reset-password?token_hash=XXXX&type=recovery
```

## Variables

Edita `index.html` y reemplaza:
- `REEMPLAZA_CON_TU_SUPABASE_URL` → tu URL de Supabase
- `REEMPLAZA_CON_TU_SUPABASE_ANON_KEY` → tu anon key
