/* ============================================
   VIRTUAL CLOSET — Shared Components
   ============================================ */

const Components = {

  // ── Toast Notification ──
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const icons = { success:'fa-check-circle', error:'fa-exclamation-circle', info:'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; setTimeout(() => toast.remove(), 300); }, 3000);
  },

  // ── Header ──
  renderHeader() {
    const state = Store.getState();
    return `
    <header class="header" id="main-header">
      <div class="header-left">
        <button class="menu-toggle" id="menu-toggle" aria-label="Toggle menu"><i class="fas fa-bars"></i></button>
        <a href="#dashboard" class="header-brand" onclick="Router.navigate('dashboard')">
          <img src="img/logo.png" alt="AC Logo" style="width:32px; height:32px; object-fit:contain;">
          <div class="header-title"><span>Virtual Closet</span></div>
        </a>
      </div>
      <div class="header-center">
        <div class="header-search">
          <i class="fas fa-search header-search-icon"></i>
          <input type="text" class="header-search-input" placeholder="Buscar ropa, outfits, estilos..." id="global-search">
        </div>
      </div>
      <div class="header-right">
        <button class="btn btn-icon btn-ghost" id="btn-theme-toggle" onclick="App.toggleTheme()" aria-label="Cambiar tema" style="color:var(--color-text-secondary)">
          <i class="fas fa-moon" id="theme-icon"></i>
        </button>
        <button class="btn btn-icon btn-ghost" id="btn-lang-toggle" onclick="App.toggleLang()" aria-label="Cambiar idioma" style="color:var(--color-text-secondary); font-weight:bold; font-size:0.8rem">
          EN
        </button>
        <button class="btn btn-icon btn-ghost header-notification" id="btn-notifications" aria-label="Notificaciones">
          <i class="fas fa-bell"></i>
          <div class="header-notification-badge"></div>
        </button>
        <div class="header-user dropdown" id="user-dropdown">
          <div class="avatar" style="background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;font-size:0.9rem;border-color:var(--color-primary);">
            ${state.user ? state.user.name[0] : '✦'}
          </div>
          <span class="header-user-name">${state.user ? state.user.name : 'Usuario'}</span>
          <i class="fas fa-chevron-down" style="font-size:0.6rem;color:var(--color-text-tertiary)"></i>
          <div class="dropdown-menu">
            <div class="dropdown-item" onclick="Router.navigate('profile')"><i class="fas fa-user"></i> Mi Perfil</div>
            <div class="dropdown-item" onclick="Router.navigate('settings')"><i class="fas fa-cog"></i> Ajustes</div>
            <div class="divider" style="margin:var(--space-2) 0"></div>
            <div class="dropdown-item" onclick="App.logout()"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</div>
          </div>
        </div>
      </div>
    </header>`;
  },

  // ── Sidebar ──
  renderSidebar() {
    const page = Store.getState().currentPage;
    const links = [
      { id:'dashboard', icon:'fa-th-large', label:'Dashboard', badge:null },
      { id:'closet', icon:'fa-tshirt', label:'Mi Armario', badge:null },
      { id:'builder', icon:'fa-magic', label:'Outfit Builder', badge:'NEW' },
      { id:'saved', icon:'fa-heart', label:'Guardados', badge:null },
      { id:'upload', icon:'fa-cloud-upload-alt', label:'Subir Ropa', badge:null },
    ];
    const links2 = [
      { id:'profile', icon:'fa-user-circle', label:'Mi Perfil', badge:null },
    ];

    return `
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
    <aside class="sidebar" id="main-sidebar">
      <div class="sidebar-section">
        <div class="sidebar-section-title">Principal</div>
        ${links.map(l => `
          <a class="sidebar-link ${page === l.id ? 'active' : ''}" onclick="Router.navigate('${l.id}')" href="#${l.id}">
            <span class="sidebar-link-icon"><i class="fas ${l.icon}"></i></span>
            <span>${l.label}</span>
            ${l.badge ? `<span class="sidebar-link-badge">${l.badge}</span>` : ''}
          </a>`).join('')}
      </div>
      <div class="sidebar-section">
        <div class="sidebar-section-title">Cuenta</div>
        ${links2.map(l => `
          <a class="sidebar-link ${page === l.id ? 'active' : ''}" onclick="Router.navigate('${l.id}')" href="#${l.id}">
            <span class="sidebar-link-icon"><i class="fas ${l.icon}"></i></span>
            <span>${l.label}</span>
          </a>`).join('')}
      </div>
      <div class="sidebar-footer">
        <div style="padding:var(--space-4);background:var(--gradient-glass);border:1px solid var(--color-border-subtle);border-radius:var(--radius-xl);">
          <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-2)">
            <i class="fas fa-crown" style="color:var(--color-accent-amber)"></i>
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
      { id:'dashboard', icon:'fa-th-large', label:'Inicio' },
      { id:'closet', icon:'fa-tshirt', label:'Armario' },
      { id:'upload', icon:'fa-plus', label:'', isAdd:true },
      { id:'saved', icon:'fa-heart', label:'Guardados' },
      { id:'profile', icon:'fa-user', label:'Perfil' },
    ];
    return `
    <nav class="mobile-nav" id="mobile-nav">
      ${items.map(item => item.isAdd ? `
        <a class="mobile-nav-item" onclick="Router.navigate('upload')" href="#upload">
          <div class="mobile-nav-add"><i class="fas ${item.icon}"></i></div>
        </a>` : `
        <a class="mobile-nav-item ${page === item.id ? 'active' : ''}" onclick="Router.navigate('${item.id}')" href="#${item.id}">
          <i class="fas ${item.icon} mobile-nav-icon"></i>
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
          <i class="fas fa-heart"></i>
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
          <i class="fas ${icon}" style="color:${color}"></i>
        </div>
      </div>
      <span class="stat-label">${label}</span>
    </div>`;
  },
};
