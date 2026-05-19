/**
 * store.js — Application state (cart, session)
 * Cart persisted to localStorage. User session persisted to sessionStorage.
 */

const Store = {
  state: {
    user: null,
    cart: [],
  },

  _listeners: [],

  init() {
    try {
      const savedUser = sessionStorage.getItem('mc_user');
      const savedCart = localStorage.getItem('mc_cart');
      if (savedUser) this.state.user = JSON.parse(savedUser);
      if (savedCart) this.state.cart = JSON.parse(savedCart);
    } catch (e) {
      console.warn('[Store] Failed to restore state:', e);
      this.state.user = null;
      this.state.cart = [];
    }
    this._notify();
  },

  subscribe(fn) {
    this._listeners.push(fn);
    return () => { this._listeners = this._listeners.filter(l => l !== fn); }; // returns unsubscribe
  },

  _notify() { this._listeners.forEach(fn => fn(this.state)); },

  _saveCart() {
    try { localStorage.setItem('mc_cart', JSON.stringify(this.state.cart)); }
    catch (e) { console.warn('[Store] Cart save failed:', e); }
  },

  login(user) {
    this.state.user = user;
    try { sessionStorage.setItem('mc_user', JSON.stringify(user)); } catch (e) {}
    this._notify();
  },

  logout() {
    this.state.user = null;
    sessionStorage.removeItem('mc_user');
    this._notify();
  },

  addToCart(product, quantity = 1) {
    const existing = this.state.cart.find(i => String(i.product.id) === String(product.id));
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.state.cart.push({ product, quantity });
    }
    this._saveCart();
    this._notify();
  },

  updateCartQty(productId, qty) {
    if (qty <= 0) { this.removeFromCart(productId); return; }
    const item = this.state.cart.find(i => String(i.product.id) === String(productId));
    if (item) { item.quantity = qty; this._saveCart(); this._notify(); }
  },

  removeFromCart(productId) {
    this.state.cart = this.state.cart.filter(i => String(i.product.id) !== String(productId));
    this._saveCart();
    this._notify();
  },

  clearCart() {
    this.state.cart = [];
    this._saveCart();
    this._notify();
  },

  get cartCount() { return this.state.cart.reduce((s, i) => s + i.quantity, 0); },
  get cartTotal() { return this.state.cart.reduce((s, i) => s + i.product.price * i.quantity, 0); },
};

window.Store = Store;
