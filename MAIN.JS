/* ------------------ Mobile Menu ------------------ */
const navToggle = document.getElementById('nav-toggle');
const navList = document.querySelector('nav ul');
if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    navList.classList.toggle('show');
    document.getElementById('nav').classList.toggle('open');
  });
}

/* ------------------ Back to Top ------------------ */
const backToTop = document.getElementById('back-to-top');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.style.display = window.scrollY > 200 ? 'block' : 'none';
  });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ------------------ Language Switcher ------------------ */
const langButtons = {
  en: document.getElementById('lang-en'),
  ro: document.getElementById('lang-ro'),
  es: document.getElementById('lang-es')
};
function setLanguage(lang) {
  document.body.className = lang;
  localStorage.setItem('language', lang);
}
Object.entries(langButtons).forEach(([lang, btn]) => {
  if (btn) btn.addEventListener('click', () => setLanguage(lang));
});
setLanguage(localStorage.getItem('language') || 'en');

/* ------------------ i18n strings (UI text in JS) ------------------ */
const I18N = {
  en: {
    added: 'added to cart!',
    empty: 'Your cart is empty.',
    total: 'Total',
    price: 'Price',
    qty: 'Qty'
  },
  ro: {
    added: 'a fost adăugat în coș!',
    empty: 'Coșul tău este gol.',
    total: 'Total',
    price: 'Preț',
    qty: 'Cant.'
  },
  es: {
    added: 'añadido al carrito!',
    empty: 'Tu carrito está vacío.',
    total: 'Total',
    price: 'Precio',
    qty: 'Cant.'
  }
};
function currentLang() {
  const cls = document.body.className;
  return ['en','ro','es'].includes(cls) ? cls : 'en';
}

/* ------------------ Persistent Cart (localStorage) ------------------ */
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const countEls = document.querySelectorAll('.header-icons .count');
  const totalItems = cart.reduce((s, it) => s + it.quantity, 0);
  countEls.forEach(el => el.textContent = totalItems);
}
updateCartCount();

/* Add item to cart */
function addToCart(name, price, quantity = 1) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ name, price, quantity });
  }
  saveCart();
  alert(`${name} ${I18N[currentLang()].added}`);
}

/* Remove item */
function removeFromCart(name) {
  cart = cart.filter(i => i.name !== name);
  saveCart();
}

/* Update item quantity */
function setQty(name, qty) {
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.quantity = Math.max(1, parseInt(qty) || 1);
  saveCart();
}

/* ------------------ Product Page Buttons ------------------ */
document.querySelectorAll('.qty-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.parentElement.querySelector('.qty-input');
    let n = parseInt(input.value) || 1;
    if (btn.textContent.trim() === '+') n++;
    if (btn.textContent.trim() === '–' || btn.textContent.trim() === '-') n = Math.max(1, n - 1);
    input.value = n;
  });
});

document.querySelectorAll('.add-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);
    const input = btn.parentElement.querySelector('.qty-input');
    const qty = input ? parseInt(input.value) || 1 : 1;
    addToCart(name, price, qty);
  });
});

/* ------------------ Cart Page Rendering ------------------ */
function renderCart() {
  const container = document.getElementById('cart-container');
  if (!container) return;

  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = `<p>${I18N[currentLang()].empty}</p>`;
    return;
  }

  let total = 0;

  // Header row
  const header = document.createElement('div');
  header.className = 'cart-row';
  header.style.fontWeight = 'bold';
  header.innerHTML = `
    <span>Item</span>
    <span>${I18N[currentLang()].price}</span>
    <span>${I18N[currentLang()].qty}</span>
    <span>Subtotal</span>
    <span></span>
  `;
  container.appendChild(header);

  // Items
  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-row';
    const subtotal = item.price * item.quantity;
    total += subtotal;
    row.innerHTML = `
      <span>${item.name}</span>
      <span>€${item.price.toFixed(2)}</span>
      <input type="number" min="1" value="${item.quantity}" class="cart-qty-input"/>
      <span>€${subtotal.toFixed(2)}</span>
      <button class="remove-btn">✕</button>
    `;
    container.appendChild(row);

    const qtyInput = row.querySelector('.cart-qty-input');
    qtyInput.addEventListener('change', () => {
      setQty(item.name, qtyInput.value);
      renderCart();
    });

    row.querySelector('.remove-btn').addEventListener('click', () => {
      removeFromCart(item.name);
      renderCart();
    });
  });

  // Total
  const totalRow = document.createElement('div');
  totalRow.className = 'cart-total';
  totalRow.innerHTML = `<strong>${I18N[currentLang()].total}: €${total.toFixed(2)}</strong>`;
  container.appendChild(totalRow);
}
renderCart();
