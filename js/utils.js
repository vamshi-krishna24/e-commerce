/**
 * utils.js — Shared utility helpers
 */

const Utils = {
  /** Format number as USD string */
  formatPrice(n) {
    return '$' + Number(n).toFixed(2);
  },

  /** Generate a star rating HTML string (colored spans) */
  stars(rating) {
    let s = '';
    for (let i = 1; i <= 5; i++) {
      s += '<span style="color:' + (i <= Math.round(rating) ? '#f59e0b' : '#ddd') + '">&#9733;</span>';
    }
    return s;
  },

  /** Compute discount percentage */
  discount(price, original) {
    if (!original || original <= price) return null;
    return Math.round(((original - price) / original) * 100);
  },

  /** Format ISO date string */
  formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return iso;
    }
  },

  /** Escape HTML to prevent XSS */
  esc(str) {
    if (str == null) return '';
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  },

  /** Show a toast notification */
  toast(message, type = 'default') {
    let el = document.getElementById('mc-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'mc-toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.className = 'toast ' + type;
    void el.offsetWidth; // force reflow for re-animation
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 3000);
  },

  /** Render product card HTML */
  productCardHTML(product) {
    const disc = this.discount(product.price, product.originalPrice);
    return [
      '<a href="product.html?id=' + this.esc(product.id) + '" class="product-card">',
        '<div class="card-image-wrap">',
          '<img src="' + this.esc(product.image) + '" alt="' + this.esc(product.name) + '" class="card-image" loading="lazy">',
          '<div class="card-badges">',
            (product.isNew ? '<span class="badge-new">New</span>' : ''),
            (disc ? '<span class="badge-sale">-' + disc + '%</span>' : ''),
          '</div>',
          '<button class="card-add-btn" data-product-id="' + this.esc(product.id) + '">',
            '&#128722; Add to Cart',
          '</button>',
        '</div>',
        '<div class="card-info">',
          '<p class="card-category">' + this.esc(product.category) + '</p>',
          '<h3 class="card-name">' + this.esc(product.name) + '</h3>',
          '<div class="card-meta">',
            '<div class="card-rating">',
              '&#9733; <span>' + product.rating + '</span>',
              '<span class="card-reviews">(' + Number(product.reviewCount).toLocaleString() + ')</span>',
            '</div>',
            '<div class="card-price">',
              '<span class="price-current">' + this.formatPrice(product.price) + '</span>',
              (product.originalPrice ? '<span class="price-original">' + this.formatPrice(product.originalPrice) + '</span>' : ''),
            '</div>',
          '</div>',
        '</div>',
      '</a>',
    ].join('');
  },

  /** Bind add-to-cart buttons inside a container */
  bindAddToCart(container) {
    container.querySelectorAll('.card-add-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const product = DB.getProductById(btn.dataset.productId);
        if (!product) { Utils.toast('Product not found', 'error'); return; }
        if (product.stock === 0) { Utils.toast('Out of stock', 'error'); return; }
        Store.addToCart(product, 1);
        Utils.toast('Added to cart!', 'success');
        btn.textContent = '✓ Added!';
        setTimeout(() => { btn.innerHTML = '&#128722; Add to Cart'; }, 1500);
      });
    });
  },

  /** Render status badge HTML */
  statusBadge(status) {
    const cls = {
      Pending:    'status-pending',
      Processing: 'status-processing',
      Shipped:    'status-shipped',
      Delivered:  'status-delivered',
      Cancelled:  'status-cancelled',
    }[status] || '';
    return '<span class="status-badge ' + cls + '">' + this.esc(status) + '</span>';
  },

  /** Inject navbar */
  renderNavbar() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    nav.innerHTML = [
      '<header class="navbar">',
        '<div class="container navbar-inner">',
          '<a href="index.html" class="navbar-logo">Market<span>Core</span></a>',
          '<nav class="navbar-nav" id="nav-links">',
            '<a href="index.html">Home</a>',
            '<a href="gallery.html">Shop</a>',
            '<a href="orders.html" id="nav-orders" style="display:none">My Orders</a>',
            '<a href="admin.html" id="nav-admin" style="display:none">Admin</a>',
          '</nav>',
          '<div class="navbar-actions">',
            '<a href="gallery.html" class="icon-btn" aria-label="Search" title="Search">',
              '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
            '</a>',
            '<a href="cart.html" class="cart-btn" aria-label="Cart" title="Cart">',
              '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>',
              '<span class="cart-badge hidden" id="cart-count">0</span>',
            '</a>',
            '<div id="navbar-user"></div>',
          '</div>',
          '<button class="menu-toggle" id="menu-toggle" aria-label="Toggle menu">',
            '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
          '</button>',
        '</div>',
      '</header>',
    ].join('');

    document.getElementById('menu-toggle')?.addEventListener('click', () => {
      document.getElementById('nav-links')?.classList.toggle('open');
    });

    Store.subscribe(state => Utils._updateNavbar(state));
    Utils._updateNavbar(Store.state);
  },

  _updateNavbar(state) {
    const count = Store.cartCount;
    const badge = document.getElementById('cart-count');
    if (badge) { badge.textContent = count; badge.classList.toggle('hidden', count === 0); }

    const userDiv = document.getElementById('navbar-user');
    if (!userDiv) return;

    if (state.user) {
      const firstName = Utils.esc((state.user.name || '').split(' ')[0] || 'User');
      userDiv.innerHTML = [
        '<div class="user-menu">',
          '<span class="user-name">' + firstName + '</span>',
          '<button class="logout-btn" id="logout-btn">Logout</button>',
        '</div>',
      ].join('');
      document.getElementById('logout-btn')?.addEventListener('click', () => {
        Store.logout();
        window.location.href = 'login.html';
      });
    } else {
      userDiv.innerHTML = '<a href="login.html" class="login-btn">&#128100; Login</a>';
    }

    const navAdmin  = document.getElementById('nav-admin');
    const navOrders = document.getElementById('nav-orders');
    if (navAdmin)  navAdmin.style.display  = (state.user && state.user.role === 'admin') ? '' : 'none';
    if (navOrders) navOrders.style.display = state.user ? '' : 'none';

    // Highlight active link — works even when served from subdirectory
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const href = window.location.href;
    document.querySelectorAll('.navbar-nav a').forEach(a => {
      const aPage = (a.getAttribute('href') || '').split('/').pop();
      const isHome = (aPage === 'index.html') && (page === '' || page === 'index.html');
      a.classList.toggle('active', aPage === page || isHome);
    });
  },

  /** Inject footer */
  renderFooter() {
    const el = document.getElementById('footer');
    if (!el) return;
    el.innerHTML = [
      '<footer class="footer">',
        '<div class="container footer-inner">',
          '<div class="footer-brand">',
            '<span class="footer-logo">Market<span>Core</span></span>',
            '<p>Your trusted destination for quality products at great prices.</p>',
          '</div>',
          '<div class="footer-links">',
            '<div class="footer-col">',
              '<h4>Shop</h4>',
              '<a href="gallery.html">All Products</a>',
              '<a href="gallery.html?category=Electronics">Electronics</a>',
              '<a href="gallery.html?category=Clothing">Clothing</a>',
              '<a href="gallery.html?category=Sports">Sports</a>',
            '</div>',
            '<div class="footer-col">',
              '<h4>Account</h4>',
              '<a href="login.html">Login</a>',
              '<a href="register.html">Register</a>',
              '<a href="orders.html">My Orders</a>',
            '</div>',
          '</div>',
        '</div>',
        '<div class="footer-bottom">',
          '<p>&copy; ' + new Date().getFullYear() + ' MarketCore. All rights reserved.</p>',
        '</div>',
      '</footer>',
    ].join('');
  },

  /** Run on every page — loads DB, inits store, renders chrome */
  async initPage() {
    await DB.load();
    Store.init();
    Utils.renderNavbar();
    Utils.renderFooter();
  },
};

window.Utils = Utils;
