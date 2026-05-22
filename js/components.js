/* ============================================
   VIRTUAL CLOSET — Shared Components
   ============================================ */

const Components = {

  // ── Toast Notification ──
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const icons = { success:'check_circle', error:'error', info:'info' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="material-symbols-outlined">${icons[type] || icons.info}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; setTimeout(() => toast.remove(), 300); }, 3000);
  },

  // ── Header ──
  renderHeader() {
    const state = Store.getState();
    return `
    <header class="header" id="main-header">
      <div class="header-left">
        <button class="menu-toggle" id="menu-toggle" aria-label="Toggle menu"><span class="material-symbols-outlined">menu</span></button>
        <a href="#dashboard" class="header-brand" onclick="Router.navigate('dashboard')">
          <img src="img/logo.png" alt="AC Logo" style="width:32px; height:32px; object-fit:contain;">
          <div class="header-title"><span>Virtual Closet</span></div>
        </a>
      </div>
      <div class="header-center">
        <div class="header-search">
          <span class="material-symbols-outlined header-search-icon">search</span>
          <input type="text" class="header-search-input" placeholder="Buscar ropa, outfits, estilos..." id="global-search">
        </div>
      </div>
      <div class="header-right">
        <button class="btn btn-icon btn-ghost" id="btn-theme-toggle" onclick="App.toggleTheme()" aria-label="Cambiar tema" style="color:var(--color-text-secondary)">
          <span class="material-symbols-outlined" id="theme-icon">dark_mode</span>
        </button>
        <button class="btn btn-icon btn-ghost" id="btn-lang-toggle" onclick="App.toggleLang()" aria-label="Cambiar idioma" style="color:var(--color-text-secondary); font-weight:bold; font-size:0.8rem">
          EN
        </button>
        <button class="btn btn-icon btn-ghost header-notification" id="btn-notifications" aria-label="Notificaciones">
          <span class="material-symbols-outlined">notifications</span>
          <div class="header-notification-badge"></div>
        </button>
        <div class="header-user dropdown" id="user-dropdown">
          <div class="avatar" style="background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;font-size:0.9rem;border-color:var(--color-primary);">
            ${state.user ? state.user.name[0] : '✦'}
          </div>
          <span class="header-user-name">${state.user ? (state.user.name.includes('@') ? state.user.name.split('@')[0] : state.user.name) : 'Usuario'}</span>
          <span class="material-symbols-outlined" style="font-size:1.2rem;color:var(--color-text-tertiary)">expand_more</span>
          <div class="dropdown-menu">
            <div class="dropdown-item" onclick="Router.navigate('profile')"><span class="material-symbols-outlined">person</span> Mi Perfil</div>
            <div class="dropdown-item" onclick="Router.navigate('settings')"><span class="material-symbols-outlined">settings</span> Ajustes</div>
            <div class="divider" style="margin:var(--space-2) 0"></div>
            <div class="dropdown-item" onclick="App.logout()"><span class="material-symbols-outlined">logout</span> Cerrar Sesión</div>
          </div>
        </div>
      </div>
    </header>`;
  },

  // ── Sidebar ──
  renderSidebar() {
    const page = Store.getState().currentPage;
    const links = [
      { id:'dashboard', icon:'grid_view', label:'Dashboard', badge:null },
      { id:'closet', icon:'checkroom', label:'Mi Armario', badge:null },
      { id:'builder', icon:'auto_fix_high', label:'Outfit Builder', badge:'NEW' },
      { id:'saved', icon:'favorite', label:'Guardados', badge:null },
      { id:'upload', icon:'cloud_upload', label:'Subir Ropa', badge:null },
    ];
    const links2 = [
      { id:'profile', icon:'account_circle', label:'Mi Perfil', badge:null },
    ];

    return `
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
    <aside class="sidebar" id="main-sidebar">
      <div class="sidebar-section">
        <div class="sidebar-section-title">Principal</div>
        ${links.map(l => `
          <a class="sidebar-link ${page === l.id ? 'active' : ''}" onclick="Router.navigate('${l.id}')" href="#${l.id}">
            <span class="sidebar-link-icon"><span class="material-symbols-outlined" style="font-size:1.2rem">${l.icon}</span></span>
            <span>${l.label}</span>
            ${l.badge ? `<span class="sidebar-link-badge">${l.badge}</span>` : ''}
          </a>`).join('')}
      </div>
      <div class="sidebar-section">
        <div class="sidebar-section-title">Cuenta</div>
        ${links2.map(l => `
          <a class="sidebar-link ${page === l.id ? 'active' : ''}" onclick="Router.navigate('${l.id}')" href="#${l.id}">
            <span class="sidebar-link-icon"><span class="material-symbols-outlined" style="font-size:1.2rem">${l.icon}</span></span>
            <span>${l.label}</span>
          </a>`).join('')}
      </div>
      <div class="sidebar-footer">
        <div style="padding:var(--space-4);background:var(--gradient-glass);border:1px solid var(--color-border-subtle);border-radius:var(--radius-xl);">
          <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-2)">
            <span class="material-symbols-outlined" style="color:var(--color-accent-amber)">workspace_premium</span>
            <span style="font-size:var(--text-sm);font-weight:600">Upgrade Pro</span>
          </div>
          <p style="font-size:var(--text-xs);color:var(--color-text-tertiary);margin-bottom:var(--space-3)">Desbloquea funciones premium y avatares 3D</p>
          <button class="btn btn-primary btn-sm" style="width:100%" onclick="Components.showToast('¡Próximamente!','info')">Ver Planes</button>
        </div>
      </div>
    </aside>`;
  },

  // ── Mobile Bottom Nav ──
  renderMobileNav() {
    const page = Store.getState().currentPage;
    const items = [
      { id:'dashboard', icon:'grid_view', label:'Inicio' },
      { id:'closet', icon:'checkroom', label:'Armario' },
      { id:'upload', icon:'add', label:'', isAdd:true },
      { id:'saved', icon:'favorite', label:'Guardados' },
      { id:'profile', icon:'person', label:'Perfil' },
    ];
    return `
    <nav class="mobile-nav" id="mobile-nav">
      ${items.map(item => item.isAdd ? `
        <a class="mobile-nav-item" onclick="Router.navigate('upload')" href="#upload">
          <div class="mobile-nav-add"><span class="material-symbols-outlined">${item.icon}</span></div>
        </a>` : `
        <a class="mobile-nav-item ${page === item.id ? 'active' : ''}" onclick="Router.navigate('${item.id}')" href="#${item.id}">
          <span class="material-symbols-outlined mobile-nav-icon">${item.icon}</span>
          <span>${item.label}</span>
        </a>`).join('')}
    </nav>`;
  },

  // ── Clothing Card ──
  renderClothingCard(item) {
    return `
    <div class="clothing-card" data-id="${item.id}" onclick="App.viewItem('${item.id}')">
      <div style="width:100%;aspect-ratio:3/4;background:${item.color};display:flex;align-items:center;justify-content:center;font-size:3rem;transition:transform 0.4s var(--ease-out-expo);" class="clothing-card-img">
        ${item.icon}
      </div>
      <div class="clothing-card-actions">
        <button class="btn btn-icon btn-sm" style="background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);border-radius:var(--radius-full);width:32px;height:32px;color:${item.favorite ? 'var(--color-accent-rose)' : 'white'}" onclick="event.stopPropagation();App.toggleFavorite('${item.id}')">
          <span class="material-symbols-outlined" style="font-size:1.2rem">favorite</span>
        </button>
      </div>
      <div class="clothing-card-info">
        <div class="clothing-card-name">${item.name}</div>
        <div class="clothing-card-meta">${item.brand} · ${item.colorName}</div>
      </div>
    </div>`;
  },

  // ── Stat Card ──
  renderStatCard(value, label, icon, color) {
    return `
    <div class="stat-card" style="animation:fadeInUp 0.5s var(--ease-out-expo) both">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span class="stat-value">${value}</span>
        <div style="width:40px;height:40px;border-radius:var(--radius-lg);background:${color}20;display:flex;align-items:center;justify-content:center">
          <span class="material-symbols-outlined" style="color:${color}">${icon}</span>
        </div>
      </div>
      <span class="stat-label">${label}</span>
    </div>`;
  },
};
