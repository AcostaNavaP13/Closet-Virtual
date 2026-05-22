/* ============================================
   VIRTUAL CLOSET AI — Simple SPA Router
   ============================================ */

const Router = {
  routes: {},
  currentRoute: null,

  register(path, handler) {
    this.routes[path] = handler;
  },

  navigate(path) {
    if (this.currentRoute === path) return;
    this.currentRoute = path;
    Store.setState({ currentPage: path });
    window.history.pushState({}, '', `#${path}`);
    this.render();
  },

  render() {
    const handler = this.routes[this.currentRoute];
    if (handler) handler();
  },

  init() {
    window.addEventListener('popstate', () => {
      const path = window.location.hash.slice(1) || 'login';
      this.currentRoute = path;
      Store.setState({ currentPage: path });
      this.render();
    });

    const initial = window.location.hash.slice(1) || 'login';
    this.navigate(initial);
  }
};
