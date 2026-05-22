/* ============================================
   VIRTUAL CLOSET AI — Global State Store
   Simple reactive state management
   ============================================ */

const Store = {
  _state: {
    user: null,
    isAuthenticated: false,
    currentPage: 'login',
    sidebarOpen: false,
    clothingItems: [],
    outfits: [],
    collections: [],
    aiMessages: [],
    uploadQueue: [],
    filters: { category: 'all', season: 'all', color: 'all' },
    theme: 'dark',
  },
  _listeners: [],

  getState() { return { ...this._state }; },

  setState(partial) {
    this._state = { ...this._state, ...partial };
    this._listeners.forEach(fn => fn(this._state));
  },

  subscribe(fn) {
    this._listeners.push(fn);
    return () => { this._listeners = this._listeners.filter(l => l !== fn); };
  },

  // ── Database Initialization ──
  loadDemoData() {
    // Hemos eliminado la data de prueba (blusa de seda, crop, etc.)
    // La aplicación ahora inicia completamente limpia.
    this.setState({ clothingItems: [], outfits: [], collections: [] });
  }
};
