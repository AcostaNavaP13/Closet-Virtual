/* ============================================
   VIRTUAL CLOSET — Security Module
   Protección contra: XSS, Brute Force,
   Inyección, Rate Limiting, Input Validation
   ============================================ */

window.Security = {

  // ── 1. SANITIZACIÓN XSS ─────────────────────────────
  // Escapa caracteres HTML peligrosos antes de inyectar
  // texto de usuario al DOM. Previene Cross-Site Scripting.
  sanitize(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/`/g, '&#x60;')
      .replace(/=/g, '&#x3D;');
  },

  // Elimina etiquetas HTML de un string (strip tags)
  stripTags(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/<[^>]*>/g, '').trim();
  },

  // ── 2. VALIDACIÓN DE CONTRASEÑAS ────────────────────
  // Mínimo 8 chars, 1 mayúscula, 1 número, 1 especial
  validatePassword(password) {
    const rules = [
      { test: /.{8,}/,           msg: 'Mínimo 8 caracteres',               id: 'rule-len'   },
      { test: /[A-Z]/,           msg: 'Al menos una mayúscula',             id: 'rule-upper' },
      { test: /[0-9]/,           msg: 'Al menos un número',                 id: 'rule-num'   },
      { test: /[^A-Za-z0-9]/,   msg: 'Al menos un carácter especial (!@#)', id: 'rule-spec'  },
    ];
    const results = rules.map(r => ({ ...r, passed: r.test.test(password) }));
    const isValid = results.every(r => r.passed);
    return { isValid, results };
  },

  // Fortaleza visual de la contraseña (0-100)
  passwordStrength(password) {
    const { results } = this.validatePassword(password);
    const passed = results.filter(r => r.passed).length;
    return Math.round((passed / results.length) * 100);
  },

  // ── 3. VALIDACIÓN DE EMAIL ──────────────────────────
  validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase().trim());
  },

  // ── 4. LÍMITES DE LONGITUD (previene ataques payload) ─
  limits: {
    name:     { max: 60,   label: 'Nombre'      },
    email:    { max: 100,  label: 'Email'        },
    password: { max: 128,  label: 'Contraseña'   },
    brand:    { max: 50,   label: 'Marca'        },
    itemName: { max: 80,   label: 'Nombre prenda'},
    color:    { max: 40,   label: 'Color'        },
  },

  validateLength(value, field) {
    const limit = this.limits[field];
    if (!limit) return { ok: true };
    if (value.length > limit.max) {
      return { ok: false, msg: `${limit.label} no puede superar ${limit.max} caracteres` };
    }
    return { ok: true };
  },

  // ── 5. RATE LIMITING (anti brute-force) ─────────────
  // Bloquea el login tras 5 intentos fallidos por 15 minutos
  _attempts: {},

  recordFailedAttempt(key) {
    const now = Date.now();
    if (!this._attempts[key]) this._attempts[key] = [];
    // Limpiar intentos viejos (más de 15 min)
    this._attempts[key] = this._attempts[key].filter(t => now - t < 15 * 60 * 1000);
    this._attempts[key].push(now);
    // Persistir en sessionStorage
    try { sessionStorage.setItem('_sec_attempts_' + key, JSON.stringify(this._attempts[key])); } catch(e) {}
  },

  clearAttempts(key) {
    this._attempts[key] = [];
    try { sessionStorage.removeItem('_sec_attempts_' + key); } catch(e) {}
  },

  isBlocked(key) {
    const now = Date.now();
    let stored = [];
    try { stored = JSON.parse(sessionStorage.getItem('_sec_attempts_' + key) || '[]'); } catch(e) {}
    this._attempts[key] = stored.filter(t => now - t < 15 * 60 * 1000);
    if (this._attempts[key].length >= 5) {
      const oldest = Math.min(...this._attempts[key]);
      const unblockAt = oldest + 15 * 60 * 1000;
      const remaining = Math.ceil((unblockAt - now) / 60000);
      return { blocked: true, remaining };
    }
    return { blocked: false };
  },

  attemptsLeft(key) {
    return Math.max(0, 5 - (this._attempts[key]?.length || 0));
  },

  // ── 6. PROTECCIÓN CSRF ──────────────────────────────
  // Genera token único de sesión para formularios
  generateToken() {
    const arr = new Uint8Array(32);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
  },

  _csrfToken: null,
  getCSRFToken() {
    if (!this._csrfToken) {
      this._csrfToken = sessionStorage.getItem('_csrf') || this.generateToken();
      sessionStorage.setItem('_csrf', this._csrfToken);
    }
    return this._csrfToken;
  },

  // ── 7. DETECCIÓN DE INYECCIÓN SQL / NoSQL ───────────
  // Aunque Firestore no es SQL, previene patrones peligrosos
  containsMalicious(str) {
    const patterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,       // onerror=, onclick=, etc.
      /\$where/i,          // NoSQL injection MongoDB
      /\.\.\//,            // Path traversal
      /eval\s*\(/i,
      /document\s*\./i,
      /window\s*\./i,
      /fetch\s*\(/i,
    ];
    return patterns.some(p => p.test(str));
  },

  // ── 8. VALIDAR CAMPO COMPLETO ───────────────────────
  // Combina: strip tags + sanitize + length + malicious check
  validateField(value, fieldKey) {
    if (typeof value !== 'string') return { ok: false, msg: 'Valor inválido' };
    const clean = this.stripTags(value.trim());
    if (this.containsMalicious(clean)) return { ok: false, msg: '⚠️ Contenido no permitido detectado' };
    const lenCheck = this.validateLength(clean, fieldKey);
    if (!lenCheck.ok) return lenCheck;
    return { ok: true, value: clean };
  },

  // ── 9. UI INDICADOR DE FORTALEZA DE CONTRASEÑA ──────
  renderPasswordStrength(password, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const strength = this.passwordStrength(password);
    const { results } = this.validatePassword(password);

    const colors = { 0:'#EF4444', 25:'#F59E0B', 50:'#F59E0B', 75:'#10B981', 100:'#10B981' };
    const labels = { 0:'Muy débil', 25:'Débil', 50:'Regular', 75:'Fuerte', 100:'Muy fuerte' };
    const nearest = [0,25,50,75,100].reduce((a,b) => Math.abs(b-strength) < Math.abs(a-strength) ? b : a);
    const color = colors[nearest];
    const label = labels[nearest];

    container.innerHTML = `
      <div style="margin-top:var(--space-2)">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:0.7rem;color:var(--color-text-tertiary)">Fortaleza</span>
          <span style="font-size:0.7rem;color:${color};font-weight:600">${label}</span>
        </div>
        <div style="height:4px;background:var(--color-surface-1);border-radius:9999px;overflow:hidden">
          <div style="height:100%;width:${strength}%;background:${color};border-radius:9999px;transition:width 0.3s ease"></div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">
          ${results.map(r => `
            <span style="font-size:0.65rem;padding:2px 6px;border-radius:9999px;background:${r.passed ? '#10B98120' : 'var(--color-surface-1)'};color:${r.passed ? '#10B981' : 'var(--color-text-tertiary)'};border:1px solid ${r.passed ? '#10B98140' : 'transparent'}">
              ${r.passed ? '✓' : '○'} ${r.msg}
            </span>`).join('')}
        </div>
      </div>`;
  },

  // ── 10. PROTECCIÓN CONTRA CLICKJACKING ──────────────
  // Evita que la app sea embebida en iframes de otros dominios
  preventClickjacking() {
    if (window.self !== window.top) {
      document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#fff;background:#0A0A0F"><div style="text-align:center"><h1>⚠️ Acceso No Permitido</h1><p>Esta aplicación no puede ejecutarse dentro de un iframe.</p></div></div>';
      throw new Error('Clickjacking attempt detected');
    }
  },

  // ── 11. LIMPIAR DATOS SENSIBLES AL SALIR ────────────
  cleanupOnLogout() {
    sessionStorage.clear();
    // NO localStorage - Firebase lo usa para persistencia auth
  }
};

// Ejecutar protección anti-clickjacking al cargar
Security.preventClickjacking();
