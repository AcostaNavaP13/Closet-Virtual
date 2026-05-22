const App = {
  APP_VERSION: '1.2.0', // Cambia este valor al subir una nueva actualización a GitHub

  init() {
    this.checkVersion();
    this.checkCookies();
    
    Store.loadDemoData();

    // Registrar rutas
    Router.register('login',    () => this.render(Pages.loginPage()));
    Router.register('register', () => this.render(Pages.registerPage()));
    Router.register('dashboard',() => this.render(Pages.dashboardPage()));
    Router.register('closet',   () => this.render(Pages.closetPage()));
    Router.register('builder',  () => this.render(Pages.builderPage()));
    Router.register('saved',    () => this.render(Pages.savedPage()));
    Router.register('upload',   () => this.render(Pages.uploadPage()));
    Router.register('profile',  () => this.render(Pages.profilePage()));

    // Escuchar cambio de sesión en Firebase Auth
    DB.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await DB.getUserProfile();
        Store.setState({
          user: { 
            name: firebaseUser.displayName || firebaseUser.email, 
            email: firebaseUser.email, 
            uid: firebaseUser.uid,
            gender: profile ? profile.gender : 'Mujer',
            faceUrl: profile ? profile.faceUrl : null
          },
          isAuthenticated: true
        });
        await this._loadUserData();
        if (Store.getState().currentPage === 'login' || Store.getState().currentPage === 'register') {
          Router.navigate('dashboard');
        } else {
          Router.render();
        }
      } else {
        Store.setState({ user: null, isAuthenticated: false, clothingItems: [], outfits: [], collections: [] });
        Router.navigate('login');
      }
    });

    // Restaurar tema y lenguaje
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    
    // Inyectar el script de Google Translate para el cambio de idioma automático
    this._injectTranslateWidget();

    Router.init();
    this.setupGlobalListeners();
  },

  checkVersion() {
    const savedVersion = localStorage.getItem('appVersion');
    if (savedVersion && savedVersion !== this.APP_VERSION) {
      localStorage.setItem('appVersion', this.APP_VERSION);
      alert('¡Nueva versión disponible! La página se recargará para aplicar los últimos cambios.');
      window.location.reload(true);
    } else {
      localStorage.setItem('appVersion', this.APP_VERSION);
    }
  },

  checkCookies() {
    if (!localStorage.getItem('cookiesAccepted')) {
      const banner = document.createElement('div');
      banner.id = 'cookie-banner';
      banner.style.cssText = 'position:fixed;bottom:20px;left:20px;right:20px;background:var(--color-surface-2);padding:15px;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.2);z-index:9999;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:15px;border:1px solid var(--color-border-subtle);';
      banner.innerHTML = `
        <div style="flex:1;min-width:250px;font-size:0.9rem;color:var(--color-text-secondary);">
          🍪 Utilizamos cookies (LocalStorage) para guardar tus preferencias de sesión y mejorar tu experiencia. No compartimos tus datos con terceros.
        </div>
        <button class="btn btn-primary btn-sm" onclick="App.acceptCookies()">Aceptar</button>
      `;
      document.body.appendChild(banner);
    }
  },

  acceptCookies() {
    localStorage.setItem('cookiesAccepted', 'true');
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.remove();
  },

  // ── THEME & LANG TOGGLE ──
  toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      document.getElementById('theme-icon').innerText = 'dark_mode';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      document.getElementById('theme-icon').innerText = 'light_mode';
    }
  },

  toggleLang() {
    // Busca el combo oculto de Google Translate y simula el cambio
    const combo = document.querySelector('.goog-te-combo');
    const btn = document.getElementById('btn-lang-toggle');
    if (!combo) return Components.showToast('El traductor aún está cargando...', 'info');

    if (btn.innerText.trim() === 'EN') {
      combo.value = 'en';
      combo.dispatchEvent(new Event('change'));
      btn.innerText = 'ES';
    } else {
      combo.value = 'es';
      combo.dispatchEvent(new Event('change'));
      btn.innerText = 'EN';
    }
  },

  _injectTranslateWidget() {
    const script = document.createElement('script');
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(script);

    window.googleTranslateElementInit = function() {
      new google.translate.TranslateElement({
        pageLanguage: 'es',
        includedLanguages: 'en,es',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
      }, 'google_translate_element');
    };

    // Ocultar el widget de google (lo controlamos con nuestro propio botón)
    const style = document.createElement('style');
    style.innerHTML = `
      .goog-te-banner-frame, #google_translate_element { display: none !important; }
      body { top: 0 !important; }
    `;
    document.head.appendChild(style);
  },

  render(html) {
    document.getElementById('app').innerHTML = html;
    this.bindEvents();
  },

  // ── Cargar todos los datos del usuario desde Firestore ──
  async _loadUserData() {
    this._showLoading(true);
    try {
      const [prendas, outfits, colecciones] = await Promise.all([
        DB.getPrendas(),
        DB.getOutfits(),
        DB.getColecciones()
      ]);
      Store.setState({ clothingItems: prendas, outfits, collections: colecciones });
    } catch (e) {
      Components.showToast('Error cargando datos: ' + e.message, 'error');
    }
    this._showLoading(false);
  },

  _showLoading(show) {
    let overlay = document.getElementById('loading-overlay');
    if (show && !overlay) {
      overlay = document.createElement('div');
      overlay.id = 'loading-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(10,10,15,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1rem';
      overlay.innerHTML = '<div style="width:48px;height:48px;border:3px solid var(--color-primary);border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite"></div><p style="color:var(--color-text-secondary);font-size:0.875rem">Cargando tu armario...</p>';
      document.body.appendChild(overlay);
    } else if (!show && overlay) {
      overlay.remove();
    }
  },

  // ── AUTH ──────────────────────────────────────────────
  async login() {
    const email = document.getElementById('login-email')?.value?.trim();
    const pass  = document.getElementById('login-pass')?.value;
    if (!email || !pass) return Components.showToast('Ingresa email y contraseña', 'error');

    // Rate limiting — bloquea tras 5 intentos fallidos
    const blockKey = 'login_' + email;
    const block = Security.isBlocked(blockKey);
    if (block.blocked) {
      return Components.showToast(`🔒 Cuenta bloqueada temporalmente. Intenta en ${block.remaining} min.`, 'error');
    }

    // Validar formato email
    if (!Security.validateEmail(email)) return Components.showToast('⚠️ Formato de email inválido', 'error');

    const btn = document.querySelector('#login-form button[type="submit"]');
    if (btn) { btn.innerHTML = '<span class="material-symbols-outlined" style="animation: spin 1s linear infinite; vertical-align:middle; margin-right:8px;">sync</span> Entrando...'; btn.disabled = true; }

    try {
      await DB.loginEmail(email, pass);
      Security.clearAttempts(blockKey);
      Components.showToast('¡Bienvenida de vuelta! ✨', 'success');
    } catch (e) {
      Security.recordFailedAttempt(blockKey);
      const left = Security.attemptsLeft(blockKey);
      const msg  = this._authError(e.code);
      Components.showToast(`Error: ${msg}${left > 0 ? ` (${left} intentos restantes)` : ' — cuenta bloqueada 15 min'}`, 'error');
      if (btn) { btn.innerHTML = '<span class="material-symbols-outlined" style="vertical-align:middle; margin-right:8px;">login</span> Iniciar Sesión'; btn.disabled = false; }
    }
  },

  async register() {
    const nameRaw  = document.getElementById('reg-name')?.value;
    const emailRaw = document.getElementById('reg-email')?.value;
    const pass     = document.getElementById('reg-pass')?.value;

    // Sanitizar y validar nombre
    const nameCheck = Security.validateField(nameRaw, 'name');
    if (!nameCheck.ok) return Components.showToast(nameCheck.msg, 'error');
    const name = nameCheck.value;
    if (!name) return Components.showToast('Ingresa tu nombre', 'error');

    // Validar email
    const email = (emailRaw || '').trim();
    if (!Security.validateEmail(email)) return Components.showToast('⚠️ Formato de email inválido', 'error');
    const emailCheck = Security.validateLength(email, 'email');
    if (!emailCheck.ok) return Components.showToast(emailCheck.msg, 'error');

    // Validar contraseña fuerte
    const { isValid, results } = Security.validatePassword(pass || '');
    if (!isValid) {
      const failed = results.filter(r => !r.passed).map(r => r.msg).join(', ');
      return Components.showToast(`Contraseña débil: ${failed}`, 'error');
    }

    const genderEl = document.getElementById('reg-gender');
    const faceEl = document.getElementById('reg-face');
    const gender = genderEl ? genderEl.value : 'Mujer';
    let faceDataUrl = null;

    if (faceEl && faceEl.files && faceEl.files[0]) {
      try {
        faceDataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const MAX_SIZE = 200;
              let width = img.width;
              let height = img.height;
              if (width > height) {
                if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
              } else {
                if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
              }
              canvas.width = width; canvas.height = height;
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = reject;
            img.src = e.target.result;
          };
          reader.onerror = reject;
          reader.readAsDataURL(faceEl.files[0]);
        });
      } catch (err) {
        return Components.showToast('Error procesando la foto del rostro', 'error');
      }
    }

    const btn = document.querySelector('#register-form button[type="submit"]');
    if (btn) { btn.innerHTML = '<span class="material-symbols-outlined" style="animation: spin 1s linear infinite; vertical-align:middle; margin-right:8px;">sync</span> Creando cuenta...'; btn.disabled = true; }

    try {
      await DB.registerEmail(name, email, pass, gender, faceDataUrl);
      Components.showToast('¡Cuenta creada exitosamente! 🎉', 'success');
    } catch (e) {
      Components.showToast('Error: ' + this._authError(e.code), 'error');
      if (btn) { btn.innerHTML = '<span class="material-symbols-outlined" style="vertical-align:middle; margin-right:8px;">person_add</span> Crear Cuenta'; btn.disabled = false; }
    }
  },

  async socialLogin(provider) {
    const btn = document.getElementById('btn-' + provider.toLowerCase());
    if (btn) {
      btn.innerHTML = `<span class="material-symbols-outlined" style="animation: spin 1s linear infinite; vertical-align:middle; margin-right:8px;">sync</span> Conectando con ${provider}...`;
      btn.style.pointerEvents = 'none';
    }
    try {
      const prov = provider === 'Google'
        ? new firebase.auth.GoogleAuthProvider()
        : new firebase.auth.OAuthProvider('apple.com');
      await fbAuth.signInWithPopup(prov);
      Components.showToast(`✅ Conectado con ${provider}`, 'success');
    } catch (e) {
      Components.showToast('Error: ' + this._authError(e.code), 'error');
      if (btn) { btn.innerHTML = `<span class="material-symbols-outlined" style="vertical-align:middle; margin-right:8px;">login</span> ${provider}`; btn.style.pointerEvents = ''; }
    }
  },

  async forgotPassword() {
    const emailInput = document.getElementById('login-email');
    const email = prompt('Por favor, ingresa tu correo electrónico para restablecer tu contraseña:', emailInput ? emailInput.value : '');
    
    if (!email || !email.trim()) return;
    
    if (!Security.validateEmail(email)) {
      return Components.showToast('⚠️ Formato de email inválido', 'error');
    }

    try {
      await DB.sendPasswordReset(email.trim());
      Components.showToast('📧 Te hemos enviado un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada o spam.', 'success');
    } catch (e) {
      Components.showToast('Error: ' + this._authError(e.code), 'error');
    }
  },

  async logout() {
    await DB.logout();
    Components.showToast('Sesión cerrada', 'info');
  },

  _authError(code) {
    const msgs = {
      'auth/user-not-found':      'Usuario no encontrado',
      'auth/wrong-password':      'Contraseña incorrecta',
      'auth/email-already-in-use':'El email ya está registrado',
      'auth/weak-password':       'Contraseña muy débil (mínimo 6 caracteres)',
      'auth/invalid-email':       'Email inválido',
      'auth/too-many-requests':   'Demasiados intentos, espera unos minutos',
      'auth/popup-closed-by-user':'Ventana cerrada antes de completar',
    };
    return msgs[code] || code;
  },

  // ── PRENDAS ──────────────────────────────────────────
  async toggleFavorite(id) {
    const items = Store.getState().clothingItems.map(i => i.id === id ? { ...i, favorite: !i.favorite } : i);
    Store.setState({ clothingItems: items });
    const item = items.find(i => i.id === id);
    Components.showToast(item.favorite ? '❤️ Añadido a favoritos' : 'Eliminado de favoritos', item.favorite ? 'success' : 'info');
    await DB.updatePrenda(id, { favorite: item.favorite });
    Router.render();
  },

  async deleteItem(id) {
    const items = Store.getState().clothingItems.filter(i => i.id !== id);
    Store.setState({ clothingItems: items });
    Components.showToast('🗑️ Prenda eliminada', 'info');
    this.closeModal();
    Router.render();
    await DB.deletePrenda(id);
  },

  async deleteAllItems() {
    if (!confirm('¿Seguro que quieres vaciar todo tu armario?')) return;
    const items = Store.getState().clothingItems;
    Store.setState({ clothingItems: [] });
    Components.showToast('🗑️ Armario vaciado', 'info');
    Router.render();
    await Promise.all(items.map(i => DB.deletePrenda(i.id)));
  },

  viewItem(id) {
    const item = Store.getState().clothingItems.find(i => i.id === id);
    if (!item) return;
    const backdrop = document.getElementById('modal-backdrop');
    const modal    = document.getElementById('modal-content');
    modal.innerHTML = `
      <div style="text-align:center">
        <div style="width:100%;aspect-ratio:3/4;background:${item.color};border-radius:var(--radius-xl);display:flex;align-items:center;justify-content:center;font-size:5rem;margin-bottom:var(--space-5)">
          ${item.imageUrl ? `<img src="${item.imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-xl)">` : item.icon}
        </div>
        <h2 style="font-size:var(--text-2xl);font-weight:700">${item.name}</h2>
        <p style="color:var(--color-text-secondary);margin-top:var(--space-1)">${item.brand || 'Sin marca'} · ${item.colorName || ''}</p>
        <div style="display:flex;gap:var(--space-2);justify-content:center;margin-top:var(--space-4);flex-wrap:wrap">
          <span class="tag">${item.season}</span><span class="tag">${item.occasion}</span><span class="tag">${item.category}</span>
        </div>
        <div style="display:flex;gap:var(--space-2);margin-top:var(--space-6)">
          <button class="btn btn-primary" style="flex:1" onclick="Router.navigate('builder');App.closeModal()"><span class="material-symbols-outlined" style="margin-right:6px;vertical-align:middle;">auto_fix_high</span> Usar en Outfit</button>
          <button class="btn btn-secondary" onclick="App.editItem('${item.id}')" title="Editar"><span class="material-symbols-outlined">edit</span></button>
          <button class="btn btn-danger" onclick="App.deleteItem('${item.id}')" title="Eliminar"><span class="material-symbols-outlined">delete</span></button>
        </div>
      </div>`;
    backdrop.classList.add('active');
    modal.classList.add('active');
    backdrop.onclick = () => this.closeModal();
  },

  editItem(id) {
    const item = Store.getState().clothingItems.find(i => i.id === id);
    if (!item) return;
    const modal = document.getElementById('modal-content');
    modal.innerHTML = `
      <div>
        <h2 style="font-size:var(--text-xl);font-weight:700;margin-bottom:var(--space-4)">✏️ Editar Prenda</h2>
        <div class="form-group" style="margin-bottom:var(--space-3)"><label class="form-label">Nombre</label><input class="form-input" id="edit-name" value="${item.name}"></div>
        <div class="form-group" style="margin-bottom:var(--space-3)"><label class="form-label">Marca</label><input class="form-input" id="edit-brand" value="${item.brand || ''}"></div>
        <div class="form-group" style="margin-bottom:var(--space-3)"><label class="form-label">Temporada</label>
          <select class="form-input" id="edit-season">
            ${['Todas','Primavera','Verano','Otoño','Invierno'].map(s=>`<option ${item.season===s?'selected':''}>${s}</option>`).join('')}
          </select></div>
        <div class="form-group" style="margin-bottom:var(--space-3)"><label class="form-label">Ocasión</label>
          <select class="form-input" id="edit-occasion">
            ${['Casual','Formal','Trabajo','Fiesta','Deporte'].map(o=>`<option ${item.occasion===o?'selected':''}>${o}</option>`).join('')}
          </select></div>
        <div style="display:flex;gap:var(--space-2);margin-top:var(--space-5)">
          <button class="btn btn-primary" style="flex:1" onclick="App.saveEdit('${item.id}')"><span class="material-symbols-outlined" style="margin-right:6px;vertical-align:middle;">save</span> Guardar</button>
          <button class="btn btn-secondary" onclick="App.viewItem('${item.id}')">Cancelar</button>
        </div>
      </div>`;
  },

  async saveEdit(id) {
    const name    = document.getElementById('edit-name')?.value?.trim();
    const brand   = document.getElementById('edit-brand')?.value?.trim();
    const season  = document.getElementById('edit-season')?.value;
    const occasion= document.getElementById('edit-occasion')?.value;
    if (!name) return Components.showToast('El nombre no puede estar vacío', 'error');

    const updates = { name, brand, season, occasion };
    const items = Store.getState().clothingItems.map(i => i.id === id ? { ...i, ...updates } : i);
    Store.setState({ clothingItems: items });
    Components.showToast('✏️ Prenda actualizada', 'success');
    this.viewItem(id);
    Router.render();
    await DB.updatePrenda(id, updates);
  },

  closeModal() {
    document.getElementById('modal-backdrop').classList.remove('active');
    document.getElementById('modal-content').classList.remove('active');
  },

  // ── UPLOAD ────────────────────────────────────────────
  _uploadedDataUrl: null,

  handleUpload(input) {
    const files = input.files;
    if (!files.length) return;
    const grid = document.getElementById('upload-previews');
    grid.innerHTML = '';
    Array.from(files).forEach((f, idx) => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const MAX_SIZE = 600;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
          } else {
            if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
          }
          canvas.width = width; 
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Guardar como WebP para preservar transparencia y comprimir tamaño (< 1MB)
          this._uploadedDataUrl = canvas.toDataURL('image/webp', 0.8);
          
          grid.innerHTML = `<div class="upload-preview-item" id="preview-${idx}">
            <img src="${this._uploadedDataUrl}" alt="${f.name}">
            <div class="upload-preview-remove" onclick="document.getElementById('preview-${idx}').remove();App._uploadedDataUrl=null">✕</div>
          </div>`;
          Components.showToast(`Foto procesada correctamente`, 'success');
        };
        img.onerror = () => Components.showToast('Error leyendo la imagen', 'error');
        img.src = e.target.result;
      };
      reader.readAsDataURL(f);
    });
    document.querySelectorAll('.upload-step')[0]?.classList.add('completed');
    document.querySelectorAll('.upload-step')[1]?.classList.add('active');
  },

  async saveUploadedItem() {
    const nameRaw  = document.getElementById('upload-name')?.value;
    const category = document.getElementById('upload-category')?.value;
    const brandRaw = document.getElementById('upload-brand')?.value;
    const colorRaw = document.getElementById('upload-color')?.value;

    // Sanitizar campos
    const nameCheck  = Security.validateField(nameRaw,  'itemName');
    const brandCheck = Security.validateField(brandRaw || '', 'brand');
    const colorCheck = Security.validateField(colorRaw || '', 'color');

    if (!nameCheck.ok)  return Components.showToast(nameCheck.msg,  'error');
    if (!brandCheck.ok) return Components.showToast(brandCheck.msg, 'error');
    if (!colorCheck.ok) return Components.showToast(colorCheck.msg, 'error');

    const name  = nameCheck.value;
    if (!name)     return Components.showToast('⚠️ Ingresa un nombre', 'error');
    if (!category) return Components.showToast('⚠️ Selecciona una categoría', 'error');

    const btn = document.querySelector('.upload-save-btn');
    if (btn) { btn.innerHTML = '<span class="material-symbols-outlined" style="animation: spin 1s linear infinite; vertical-align:middle; margin-right:8px;">sync</span> Guardando...'; btn.disabled = true; }

    const catIcons = { Tops:'👕', Bottoms:'👖', Dresses:'👗', Outerwear:'🧥', Shoes:'👟', Accessories:'💍' };
    const colors   = ['#E8D5D0','#2C3E50','#F5E6CC','#8B4513','#1A1A2E','#D4A574','#4A6741','#C0392B','#ECF0F1','#9B59B6'];

    const newItem = {
      id:        'item-' + Date.now(),
      name,
      category,
      icon:      catIcons[category] || '👕',
      color:     colors[Math.floor(Math.random() * colors.length)],
      colorName: document.getElementById('upload-color')?.value?.trim() || 'Varios',
      season:    document.getElementById('upload-season')?.value   || 'Todas',
      occasion:  document.getElementById('upload-occasion')?.value || 'Casual',
      brand:     document.getElementById('upload-brand')?.value?.trim() || '',
      imageUrl:  this._uploadedDataUrl || null,
      favorite:  false,
      dateAdded: new Date().toISOString(),
      timesWorn: 0
    };

    // Guardar en estado local primero (UI rápida)
    Store.setState({ clothingItems: [newItem, ...Store.getState().clothingItems] });

    try {
      await DB.savePrenda(newItem);
      Components.showToast('✅ ¡Prenda guardada en la nube!', 'success');
      document.querySelectorAll('.upload-step').forEach(s => s.classList.add('completed'));
      this._uploadedDataUrl = null;
      setTimeout(() => Router.navigate('closet'), 1000);
    } catch (e) {
      Components.showToast('Error guardando: ' + e.message, 'error');
      if (btn) { btn.innerHTML = '<span class="material-symbols-outlined" style="vertical-align:middle; margin-right:8px;">check</span> Guardar Prenda'; btn.disabled = false; }
    }
  },

  // ── OUTFITS ───────────────────────────────────────────
  _selectedBuildItem: null,
  _builderSlots: { top: null, bottom: null, shoes: null, acc: null },

  selectBuilderItem(id) {
    this._selectedBuildItem = id;
    document.querySelectorAll('.builder-item').forEach(el => el.classList.toggle('selected', el.dataset.id === id));
    
    // Auto-assign to correct physical slot on mannequin based on category
    const item = Store.getState().clothingItems.find(i => i.id === id);
    if (item) {
      const searchStr = ((item.category || '') + ' ' + (item.name || '')).toLowerCase();
      let targetSlot = null;
      
      const isTop = ['camisas', 'blusa', 'camisetas', 'playera', 'sudadera', 'vestido', 'enterizo', 'dress', 'abrigo', 'chaqueta', 'chamarra', 'top', 'outerwear'].some(v => searchStr.includes(v));
      const isBottom = ['pantalon', 'pantalón', 'pantalones', 'falda', 'short', 'jeans', 'bottoms'].some(v => searchStr.includes(v));
      const isShoes = ['zapatos', 'zapato', 'tenis', 'sneakers', 'shoes'].some(v => searchStr.includes(v));
      const isAcc = ['accesorio', 'reloj', 'lentes', 'accessories', 'sombrero', 'gorra', 'gorro'].some(v => searchStr.includes(v));

      // Map to the 4 physical zones (top, bottom, shoes, acc)
      if (isTop) targetSlot = 'top';
      else if (isBottom) targetSlot = 'bottom';
      else if (isShoes) targetSlot = 'shoes';
      else if (isAcc) targetSlot = 'acc';
      // Fallbacks just in case
      else if (searchStr === '') targetSlot = 'top';

      if (targetSlot) {
        this.assignToSlot(targetSlot);
      }
    }
  },

  assignToSlot(slotId) {
    if (!this._selectedBuildItem) return Components.showToast('Selecciona una prenda primero', 'info');
    const item = Store.getState().clothingItems.find(i => i.id === this._selectedBuildItem);
    if (!item) return;
    this._builderSlots[slotId] = item;
    const slot = document.getElementById('slot-' + slotId);
    if (slot) {
      slot.innerHTML = item.imageUrl
        ? `<img src="${item.imageUrl}" style="width:100%;height:100%;object-fit:contain;pointer-events:none;filter:drop-shadow(0 15px 25px rgba(0,0,0,0.4));">`
        : `<div style="font-size:4rem;text-shadow:0 15px 25px rgba(0,0,0,0.4)">${item.icon}</div>`;
      slot.style.borderColor = 'transparent';
      slot.style.background  = 'transparent';
    }
    this.updateBuilderSummary();
    Components.showToast(`${item.name} añadido`, 'success');
  },

  updateBuilderSummary() {
    const summary  = document.getElementById('builder-summary');
    const assigned = Object.entries(this._builderSlots).filter(([k, v]) => v);
    if (!assigned.length) {
      summary.innerHTML = '<div class="empty-state" style="padding:var(--space-8)"><div class="empty-state-icon">👆</div><p class="empty-state-text">Selecciona prendas para armar tu outfit</p></div>';
      return;
    }
    summary.innerHTML = assigned.map(([slot, item]) => `
      <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);background:var(--color-bg-glass);border-radius:var(--radius-lg);border:1px solid var(--color-border-subtle)">
        <div style="width:40px;height:40px;background:${item.color};border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;overflow:hidden">
          ${item.imageUrl ? `<img src="${item.imageUrl}" style="width:100%;height:100%;object-fit:cover">` : item.icon}
        </div>
        <div style="flex:1;min-width:0"><div style="font-size:var(--text-sm);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.name}</div></div>
        <button class="btn btn-icon btn-ghost btn-sm" onclick="App.removeFromSlot('${slot}')"><span class="material-symbols-outlined" style="font-size:1rem">close</span></button>
      </div>`).join('');
  },

  filterBuilder(group, btn) {
    const s = Store.getState();
    document.querySelectorAll('.builder-sidebar .category-pill').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    
    let validCats = [];
    if (group === 'Tops') validCats = ['camisas', 'blusa', 'camisetas', 'playera', 'sudadera', 'top'];
    else if (group === 'Pantalones') validCats = ['pantalones', 'shorts/faldas', 'bottoms', 'pantalon', 'pantalón', 'falda', 'short', 'jeans'];
    else if (group === 'Vestidos') validCats = ['vestidos', 'enterizos', 'vestido', 'enterizo', 'dress'];
    else if (group === 'Abrigos') validCats = ['chaquetas', 'abrigos', 'chaqueta', 'abrigo', 'chamarra'];
    else if (group === 'Zapatos') validCats = ['zapatos', 'shoes', 'zapato', 'tenis', 'sneakers'];
    else if (group === 'Accesorios') validCats = ['accesorios', 'accessories', 'accesorio', 'reloj', 'lentes', 'gorra', 'sombrero'];

    const filtered = s.clothingItems.filter(i => {
      const searchStr = ((i.category || '') + ' ' + (i.name || '')).toLowerCase();
      return validCats.some(v => searchStr.includes(v)) || validCats.includes(searchStr);
    });
    const container = document.getElementById('builder-items');
    if (!container) return;
    container.innerHTML = filtered.map(i => `<div class="builder-item" draggable="true" data-id="${i.id}" onclick="App.selectBuilderItem('${i.id}')"><div style="width:100%;height:100%;background:${i.color};display:flex;align-items:center;justify-content:center;font-size:2rem;overflow:hidden;border-radius:12px;">${i.imageUrl ? `<img src="${i.imageUrl}" style="width:100%;height:100%;object-fit:cover;">` : i.icon}</div></div>`).join('');
  },

  removeFromSlot(slotId) {
    this._builderSlots[slotId] = null;
    const slot   = document.getElementById('slot-' + slotId);
    const labels = { top: 'Top', bottom: 'Pantalón', shoes: 'Zapatos', acc: 'Accesorios' };
    const icons  = { top: '👕', bottom: '👖', shoes: '👟', acc: '💍' };
    if (slot) {
      slot.innerHTML = `<div style="font-size:1.5rem;margin-bottom:var(--space-1);text-shadow:0 2px 4px rgba(0,0,0,0.5)">${icons[slotId]}</div>
      ${slotId !== 'acc' ? `<div style="font-size:var(--text-xs);color:white;text-shadow:0 1px 2px rgba(0,0,0,0.8)">${labels[slotId]}</div>` : ''}`;
      slot.style.borderColor = 'rgba(124,58,237,0.5)';
      slot.style.background  = 'rgba(0,0,0,0.1)';
    }
    this.updateBuilderSummary();
  },

  clearBuilder() {
    ['top', 'bottom', 'shoes', 'acc'].forEach(s => this.removeFromSlot(s));
    this._selectedBuildItem = null;
    document.querySelectorAll('.builder-item').forEach(el => el.classList.remove('selected'));
    Components.showToast('Builder limpiado', 'info');
  },

  async saveCurrentOutfit() {
    const assigned = Object.values(this._builderSlots).filter(Boolean);
    if (assigned.length < 2) return Components.showToast('⚠️ Agrega al menos 2 prendas', 'error');
    const outfitName = prompt('Nombre del outfit:', 'Mi Outfit');
    if (!outfitName) return;

    Components.showToast('📸 Capturando outfit...', 'info');
    
    // Capture the builder-canvas
    const canvasEl = document.querySelector('.builder-canvas > div');
    let snapshotUrl = '';
    if (canvasEl && window.html2canvas) {
      try {
        const canvas = await html2canvas(canvasEl, { useCORS: true, backgroundColor: null, scale: 2 });
        snapshotUrl = canvas.toDataURL('image/jpeg', 0.8);
      } catch (e) {
        console.error('Error taking snapshot', e);
      }
    }

    const newOutfit = {
      id:       'outfit-' + Date.now(),
      name:     outfitName,
      items:    assigned.map(i => i.id),
      snapshotUrl: snapshotUrl, // New field for the image
      occasion: 'Casual',
      season:   'Todas',
      favorite: false
    };
    Store.setState({ outfits: [...Store.getState().outfits, newOutfit] });
    this.clearBuilder();
    Components.showToast('✅ ¡Outfit guardado!', 'success');
    await DB.saveOutfit(newOutfit);
  },

  // ── COLECCIONES ───────────────────────────────────────
  async deleteOutfit(id) {
    if (!confirm('¿Eliminar este outfit?')) return;
    const outfits     = Store.getState().outfits.filter(o => o.id !== id);
    const collections = Store.getState().collections.map(c => ({ ...c, outfitIds: c.outfitIds.filter(oid => oid !== id) }));
    Store.setState({ outfits, collections });
    Components.showToast('🗑️ Outfit eliminado', 'info');
    Router.render();
    await DB.deleteOutfit(id);
  },

  editOutfit(id) {
    const outfit = Store.getState().outfits.find(o => o.id === id);
    if (!outfit) return;
    
    // Clear current slots
    ['top', 'bottom', 'shoes', 'acc'].forEach(s => {
      this._builderSlots[s] = null;
      const slot = document.getElementById('slot-' + s);
      if(slot) {
        slot.innerHTML = `<div style="font-size:1.5rem;margin-bottom:var(--space-1);text-shadow:0 2px 4px rgba(0,0,0,0.5)">...</div>`;
        slot.style.borderColor = 'rgba(124,58,237,0.5)';
        slot.style.background  = 'rgba(0,0,0,0.1)';
      }
    });

    Router.navigate('builder');

    // Simulate auto-assign for each item
    setTimeout(() => {
      outfit.items.forEach(itemId => {
        this.selectBuilderItem(itemId);
      });
      Components.showToast('✏️ Outfit cargado para editar', 'info');
    }, 500);
  },

  async deleteCollection(id) {
    if (!confirm('¿Eliminar esta colección?')) return;
    const collections = Store.getState().collections.filter(c => c.id !== id);
    Store.setState({ collections });
    Components.showToast('🗑️ Colección eliminada', 'info');
    Router.render();
    await DB.deleteColeccion(id);
  },

  async createCollection() {
    const name = prompt('Nombre de la colección:');
    if (!name) return;
    const icons  = ['📁','⭐','🔥','💎','🌈','🎯','💼','🏖️'];
    const colores = ['#F43F5E','#0EA5E9','#F59E0B','#D946EF','#10B981','#7C3AED'];
    const newCol = {
      id:        'col-' + Date.now(),
      name,
      icon:      icons[Math.floor(Math.random() * icons.length)],
      outfitIds: [],
      color:     colores[Math.floor(Math.random() * colores.length)]
    };
    Store.setState({ collections: [...Store.getState().collections, newCol] });
    Components.showToast('✅ Colección creada', 'success');
    Router.render();
    await DB.saveColeccion(newCol);
  },

  // ── BUILDER FILTER ────────────────────────────────────
  filterBuilder(cat, btn) {
    const items = Store.getState().clothingItems.filter(i => i.category === cat);
    const list  = document.getElementById('builder-items');
    if (list) list.innerHTML = items.map(i => `
      <div class="builder-item" data-id="${i.id}" onclick="App.selectBuilderItem('${i.id}')">
        ${i.imageUrl
          ? `<img src="${i.imageUrl}" style="width:100%;height:100%;object-fit:cover">`
          : `<div style="width:100%;height:100%;background:${i.color};display:flex;align-items:center;justify-content:center;font-size:2rem">${i.icon}</div>`}
      </div>`).join('');
    document.querySelectorAll('.builder-sidebar .category-pill').forEach(p => p.classList.remove('active'));
    if (btn) btn.classList.add('active');
  },

  // ── EVENTOS ───────────────────────────────────────────
  bindEvents() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar    = document.getElementById('main-sidebar');
    const overlay    = document.getElementById('sidebar-overlay');
    if (menuToggle && sidebar) {
      menuToggle.onclick = () => { sidebar.classList.toggle('open'); overlay?.classList.toggle('active'); };
      if (overlay) overlay.onclick = () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); };
    }
    const userDropdown = document.getElementById('user-dropdown');
    if (userDropdown) userDropdown.onclick = e => { e.stopPropagation(); userDropdown.classList.toggle('active'); };
    document.addEventListener('click', () => document.querySelectorAll('.dropdown.active').forEach(d => d.classList.remove('active')));

    const zone = document.getElementById('upload-zone');
    if (zone) {
      ['dragenter', 'dragover'].forEach(e => zone.addEventListener(e, ev => { ev.preventDefault(); zone.classList.add('dragging'); }));
      ['dragleave', 'drop'].forEach(e => zone.addEventListener(e, ev => { ev.preventDefault(); zone.classList.remove('dragging'); }));
      zone.addEventListener('drop', ev => {
        const dt = ev.dataTransfer;
        if (dt.files.length) { const input = document.getElementById('file-input'); input.files = dt.files; App.handleUpload(input); }
      });
    }
  },

  setupGlobalListeners() {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const header = document.getElementById('main-header');
          if (header) header.classList.toggle('scrolled', window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    });
  },

  async submitFeedback(form) {
    const btn = form.querySelector('button[type="submit"]');
    btn.innerHTML = '<span class="material-symbols-outlined" style="animation:spin 1s linear infinite;margin-right:8px;vertical-align:middle;">sync</span> Enviando...';
    btn.disabled = true;
    const formData = new FormData(form);
    try {
      await fetch('https://formsubmit.co/ajax/acostanavap13@gmail.com', {
        method: 'POST',
        body: formData
      });
      document.getElementById('feedback-modal').classList.remove('active');
      Components.showToast('✅ ¡Feedback enviado! Gracias por ayudarnos.', 'success');
      form.reset();
    } catch(e) {
      Components.showToast('❌ Error al enviar el feedback', 'error');
    } finally {
      btn.innerHTML = '<span class="material-symbols-outlined" style="margin-right:8px;vertical-align:middle;">send</span> Enviar';
      btn.disabled = false;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
