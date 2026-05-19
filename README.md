# MarketCore - HTML/CSS/JS Version

A fully self-contained e-commerce application built with plain HTML, CSS, and JavaScript.
Uses JSON files as the database (with localStorage for persistence).

## How to Run

Because the app fetches JSON files with `fetch()`, you need to serve it from a local web server (not just open `index.html` directly in a browser due to CORS restrictions on `file://` URLs).

### Option 1 - Python (built-in)
```bash
cd html-version
python3 -m http.server 3000
# Open http://localhost:3000
```

### Option 2 - Node.js (npx)
```bash
cd html-version
npx serve .
# Open the URL shown in terminal
```

### Option 3 - VS Code Live Server
Install the "Live Server" extension, right-click `index.html` and choose "Open with Live Server".

## Project Structure

```
html-version/
  data/             # JSON database files
    products.json   # Product catalog
    categories.json # Product categories
    orders.json     # Initial orders data
    users.json      # User accounts
  css/
    theme.css       # CSS variables & design tokens
    reset.css       # CSS reset
    components.css  # Shared components (navbar, footer, cards, etc.)
    pages/          # Page-specific styles
  js/
    db.js           # JSON-based data layer (loads from JSON, persists to localStorage)
    store.js        # App state (cart, user session)
    utils.js        # Helpers, navbar/footer rendering, toast notifications
  index.html        # Home page
  gallery.html      # Shop / product listing
  product.html      # Product detail (uses ?id= URL param)
  cart.html         # Cart & checkout
  orders.html       # My orders
  login.html        # Login
  register.html     # Register
  admin.html        # Admin dashboard
```

## Demo Accounts

| Role     | Email                    | Password  |
|----------|--------------------------|-----------|
| Customer | alice@example.com        | password  |
| Admin    | admin@marketcore.com     | admin123  |

## Features

- Product browsing, search, filtering, and sorting
- Product detail pages
- Shopping cart with quantity controls
- Full checkout flow with order confirmation
- User login / registration
- Order history
- Admin dashboard: manage products (add/edit/delete), update order statuses
- Cart and orders persisted to localStorage
- Responsive design (mobile, tablet, desktop)
