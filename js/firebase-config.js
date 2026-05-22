/* ============================================
   VIRTUAL CLOSET — Firebase Config & DB
   Proyecto: Closetaca (Google Firebase)
   ============================================ */

const firebaseConfig = {
  apiKey: "AIzaSyA1TtuakyTYFDOZex59nRjuYPFO7DnLAws",
  authDomain: "closetaca.firebaseapp.com",
  projectId: "closetaca",
  storageBucket: "closetaca.firebasestorage.app",
  messagingSenderId: "923384697534",
  appId: "1:923384697534:web:7cbd737f9e4bab465a04ef",
  measurementId: "G-4TJEKJCMDN"
};

// Inicializar Firebase (SDK v8 via CDN)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const fbAuth = firebase.auth();

console.log("🔥 Firebase Closetaca conectado correctamente");

/* ============================================
   FIRESTORE DB — Funciones CRUD completas
   ============================================ */
window.DB = {

  // ── USUARIO ──────────────────────────────────
  async loginEmail(email, password) {
    return fbAuth.signInWithEmailAndPassword(email, password);
  },

  async registerEmail(name, email, password, gender, faceUrl) {
    const cred = await fbAuth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: name });
    // Crear documento del usuario en Firestore
    await db.collection('usuarios').doc(cred.user.uid).set({
      name, email, uid: cred.user.uid,
      gender: gender || 'Mujer',
      faceUrl: faceUrl || null,
      createdAt: new Date().toISOString()
    });
    return cred;
  },

  async sendPasswordReset(email) {
    return fbAuth.sendPasswordResetEmail(email);
  },

  async logout() {
    return fbAuth.signOut();
  },

  async getUserProfile() {
    const user = fbAuth.currentUser;
    if (!user) return null;
    try {
      const doc = await db.collection('usuarios').doc(user.uid).get();
      return doc.exists ? doc.data() : null;
    } catch (e) {
      console.error("Error fetching user profile", e);
      return null;
    }
  },

  onAuthStateChanged(callback) {
    return fbAuth.onAuthStateChanged(callback);
  },

  getCurrentUser() {
    return fbAuth.currentUser;
  },

  // ── PRENDAS ──────────────────────────────────
  async savePrenda(item) {
    const user = fbAuth.currentUser;
    if (!user) return console.warn("No hay usuario autenticado");
    await db.collection('usuarios').doc(user.uid)
            .collection('prendas').doc(item.id).set(item);
  },

  async updatePrenda(id, data) {
    const user = fbAuth.currentUser;
    if (!user) return;
    await db.collection('usuarios').doc(user.uid)
            .collection('prendas').doc(id).update(data);
  },

  async deletePrenda(id) {
    const user = fbAuth.currentUser;
    if (!user) return;
    await db.collection('usuarios').doc(user.uid)
            .collection('prendas').doc(id).delete();
  },

  async getPrendas() {
    const user = fbAuth.currentUser;
    if (!user) return [];
    const snap = await db.collection('usuarios').doc(user.uid)
                         .collection('prendas').orderBy('dateAdded', 'desc').get();
    return snap.docs.map(d => d.data());
  },

  // ── OUTFITS ──────────────────────────────────
  async saveOutfit(outfit) {
    const user = fbAuth.currentUser;
    if (!user) return;
    await db.collection('usuarios').doc(user.uid)
            .collection('outfits').doc(outfit.id).set(outfit);
  },

  async deleteOutfit(id) {
    const user = fbAuth.currentUser;
    if (!user) return;
    await db.collection('usuarios').doc(user.uid)
            .collection('outfits').doc(id).delete();
  },

  async getOutfits() {
    const user = fbAuth.currentUser;
    if (!user) return [];
    const snap = await db.collection('usuarios').doc(user.uid)
                         .collection('outfits').get();
    return snap.docs.map(d => d.data());
  },

  // ── COLECCIONES ──────────────────────────────
  async saveColeccion(col) {
    const user = fbAuth.currentUser;
    if (!user) return;
    await db.collection('usuarios').doc(user.uid)
            .collection('colecciones').doc(col.id).set(col);
  },

  async deleteColeccion(id) {
    const user = fbAuth.currentUser;
    if (!user) return;
    await db.collection('usuarios').doc(user.uid)
            .collection('colecciones').doc(id).delete();
  },

  async getColecciones() {
    const user = fbAuth.currentUser;
    if (!user) return [];
    const snap = await db.collection('usuarios').doc(user.uid)
                         .collection('colecciones').get();
    return snap.docs.map(d => d.data());
  }
};
