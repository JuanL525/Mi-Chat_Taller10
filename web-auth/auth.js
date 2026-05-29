const SUPABASE_URL = 'https://xjagectkljlgkhxxmjnu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqYWdlY3RrbGpsZ2toeHhtam51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNDczODAsImV4cCI6MjA5MjYyMzM4MH0.7MpHAkjYLQ9LhBN3JGjhEaHjpkzUS9QQLUnp-ulixkQ';

function createSupabaseClient() {
  return supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      flowType: 'implicit',
      detectSessionInUrl: true,
    },
  });
}

function parseAuthParams() {
  const params = new URLSearchParams(window.location.search);
  const hash = Object.fromEntries(new URLSearchParams(window.location.hash.substring(1)));
  return {
    type: params.get('type') || hash.type,
    tokenHash: params.get('token_hash') || hash.token_hash,
    accessToken: hash.access_token,
    refreshToken: hash.refresh_token,
    authCode: params.get('code'),
    errorCode: params.get('error_code') || hash.error_code,
    errorDescription: params.get('error_description') || hash.error_description,
  };
}

function showMessage(text, isError) {
  const el = document.getElementById('message');
  if (!el) return;
  el.textContent = text;
  el.className = 'message ' + (isError ? 'error' : 'success');
  el.style.display = 'block';
}

function showExpiredLinkHelp(context) {
  document.getElementById('subtitle').textContent = 'Enlace inválido o expirado';
  document.getElementById('form-container').innerHTML = `
    <div class="state-icon warn-ring">⏱️</div>
    <p class="hint">
      • Solicita un <strong>nuevo</strong> correo desde la app.<br>
      • Abre solo el correo <strong>más reciente</strong>.<br>
      • Toca el enlace <strong>una sola vez</strong> en Chrome/Safari del celular.<br>
      • Gmail/Outlook a veces abren el enlace en segundo plano y lo invalidan.
    </p>
  `;
  const p = parseAuthParams();
  showMessage(
    decodeURIComponent(p.errorDescription || `El enlace de ${context} ya no es válido. Pide uno nuevo desde la app.`),
    true
  );
}

async function establishSession(sb, forcedType) {
  const p = parseAuthParams();

  if (p.errorCode) {
    return { ok: false, error: p.errorDescription || p.errorCode };
  }

  if (p.authCode) {
    const { error } = await sb.auth.exchangeCodeForSession(p.authCode);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  if (p.tokenHash) {
    const otpType = forcedType || (p.type === 'recovery' ? 'recovery' : 'email');
    const { error } = await sb.auth.verifyOtp({ token_hash: p.tokenHash, type: otpType });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  if (p.accessToken) {
    const { error } = await sb.auth.setSession({
      access_token: p.accessToken,
      refresh_token: p.refreshToken || '',
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  return { ok: false, error: 'No se encontró un token válido en este enlace.' };
}
