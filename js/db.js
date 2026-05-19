/**
 * db.js — JSON-file-based in-memory database
 * Loads seed data from JSON files on first run, then uses localStorage for persistence.
 */

const DB = {
  products: [],
  categories: [],
  orders: [],
  users: [],
  _loaded: false,

  async load() {
    if (this._loaded) return;
    try {
      const [products, categories, orders, users] = await Promise.all([
        fetch('./data/products.json').then(r => { if (!r.ok) throw new Error('products'); return r.json(); }),
        fetch('./data/categories.json').then(r => { if (!r.ok) throw new Error('categories'); return r.json(); }),
        fetch('./data/orders.json').then(r => { if (!r.ok) throw new Error('orders'); return r.json(); }),
        fetch('./data/users.json').then(r => { if (!r.ok) throw new Error('users'); return r.json(); }),
      ]);
      // localStorage overrides JSON seed data after first write
      this.products   = JSON.parse(localStorage.getItem('mc_products')  || 'null') || products;
      this.categories = categories; // categories are read-only
      this.orders     = JSON.parse(localStorage.getItem('mc_orders')    || 'null') || orders;
      this.users      = JSON.parse(localStorage.getItem('mc_users')     || 'null') || users;
    } catch (err) {
      console.error('[DB] Failed to load seed data:', err);
      // Fallback to whatever is in localStorage
      this.products   = JSON.parse(localStorage.getItem('mc_products')  || '[]');
      this.categories = JSON.parse(localStorage.getItem('mc_categories') || '[]');
      this.orders     = JSON.parse(localStorage.getItem('mc_orders')    || '[]');
      this.users      = JSON.parse(localStorage.getItem('mc_users')     || '[]');
    }
    this._loaded = true;
  },

  saveProducts()   { localStorage.setItem('mc_products',   JSON.stringify(this.products));   },
  saveOrders()     { localStorage.setItem('mc_orders',     JSON.stringify(this.orders));     },
  saveUsers()      { localStorage.setItem('mc_users',      JSON.stringify(this.users));      },

  // ---- Products ----
  getAllProducts()    { return this.products; },
  getFeatured()      { return this.products.filter(p => p.featured); },
  getProductById(id) { return this.products.find(p => String(p.id) === String(id)) || null; },
  createProduct(p)   { this.products.push(p); this.saveProducts(); },
  updateProduct(p)   {
    const i = this.products.findIndex(x => String(x.id) === String(p.id));
    if (i >= 0) { this.products[i] = p; this.saveProducts(); }
  },
  deleteProduct(id)  { this.products = this.products.filter(p => String(p.id) !== String(id)); this.saveProducts(); },

  // ---- Orders ----
  getAllOrders()            { return this.orders; },
  getOrdersByUser(userId)  { return this.orders.filter(o => o.customerId === userId); },
  createOrder(o)           { this.orders.unshift(o); this.saveOrders(); },
  updateOrderStatus(id, s) {
    const o = this.orders.find(x => x.id === id);
    if (o) { o.status = s; this.saveOrders(); }
  },

  // ---- Auth ----
  findUser(email, password) {
    const e = (email || '').trim().toLowerCase();
    return this.users.find(u => u.email.toLowerCase() === e && u.password === password) || null;
  },
  createUser(u)     { this.users.push(u); this.saveUsers(); },
  userExists(email) {
    const e = (email || '').trim().toLowerCase();
    return this.users.some(u => u.email.toLowerCase() === e);
  },

  /** Reset all localStorage back to JSON seed data */
  async resetToDefaults() {
    this._loaded = false;
    localStorage.removeItem('mc_products');
    localStorage.removeItem('mc_orders');
    localStorage.removeItem('mc_users');
    await this.load();
  },
};

window.DB = DB;
