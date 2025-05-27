// ---------------------------
// User Management
// ---------------------------
let currentUser = null;

function showSignup() {
  window.location.href = 'signup.html';
}

function skipSignup() {
  localStorage.setItem('guest', 'true');
  const modal = document.getElementById('entryModal');
  if (modal) modal.style.display = 'none';
}

function checkAuth() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (user) {
    currentUser = user;
    return true;
  }
  return false;
}

// ---------------------------
// Cart Management
// ---------------------------
let cart = JSON.parse(localStorage.getItem('mothameCart')) || [];

// Save cart to localStorage and update count display
function saveCart() {
  localStorage.setItem('mothameCart', JSON.stringify(cart));
  updateCartCount();
}

// Update cart count badge
function updateCartCount() {
  const countElem = document.getElementById('cart-count');
  if (!countElem) return;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  countElem.textContent = totalItems;
}

// Add product to cart, increment if exists
function addToCart(product) {
  const existingIndex = cart.findIndex(item => item.id === product.id);
  if (existingIndex !== -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  alert(`Added ${product.name} to cart!`);
}

// ---------------------------
// Initialization & Event Binding
// ---------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Initial cart count update
  updateCartCount();

  // Navigation toggle handlers
  const toggle = document.querySelector('.menu-toggle');
  const header = document.querySelector('header');
  const navMenu = document.querySelector('.nav-menu');

  if (toggle && header) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle.classList.toggle('open');
      header.classList.toggle('nav-open');
    });

    // Clicking outside nav closes menu
    document.addEventListener('click', (e) => {
      if (header.classList.contains('nav-open') && !header.contains(e.target)) {
        toggle.classList.remove('open');
        header.classList.remove('nav-open');
      }
    });
  }

  if (navMenu) {
    // Prevent clicks inside nav-menu from closing it
    navMenu.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Cart rendering and management
  const cartContainer = document.getElementById('cart-container');
  if (!cartContainer) return;

  const emptyCart = cartContainer.querySelector('.empty-cart');
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');

  function updateCartStorage() {
    localStorage.setItem('mothameCart', JSON.stringify(cart));
  }

  function renderCart() {
    // Clear old cart items and clear cart button
    cartContainer.querySelectorAll('.cart-item, .clear-cart-btn').forEach(el => el.remove());

    if (cart.length === 0) {
      if (emptyCart) emptyCart.style.display = 'block';
      if (cartCount) cartCount.textContent = '0';
      if (cartTotal) cartTotal.textContent = '$0.00';
      return;
    }

    if (emptyCart) emptyCart.style.display = 'none';

    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach(item => {
      totalItems += item.quantity;
      totalPrice += item.quantity * item.price;

      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <div class="item-details">
          <img src="${item.image}" alt="${item.name}" class="item-thumb"/>
          <div class="item-info">
            <h3>${item.name}</h3>
            <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
            <div class="qty-controls">
              <button class="qty-btn minus" data-id="${item.id}">−</button>
              <span class="qty">${item.quantity}</span>
              <button class="qty-btn plus" data-id="${item.id}">+</button>
            </div>
            <button class="remove-btn" data-id="${item.id}">Remove</button>
          </div>
        </div>
      `;
      cartContainer.appendChild(itemEl);
    });

    // Clear Cart button
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear Cart';
    clearBtn.className = 'clear-cart-btn';
    cartContainer.appendChild(clearBtn);

    if (cartCount) cartCount.textContent = totalItems;
    if (cartTotal) cartTotal.textContent = `$${totalPrice.toFixed(2)}`;
  }

  // Cart interaction handlers
  cartContainer.addEventListener('click', (e) => {
    const target = e.target;
    const id = target.dataset.id;

    if (target.classList.contains('remove-btn')) {
      cart = cart.filter(item => item.id !== id);
      updateCartStorage();
      renderCart();
    }

    if (target.classList.contains('qty-btn')) {
      const item = cart.find(i => i.id === id);
      if (item) {
        if (target.classList.contains('plus')) {
          item.quantity++;
        } else if (target.classList.contains('minus') && item.quantity > 1) {
          item.quantity--;
        }
        updateCartStorage();
        renderCart();
      }
    }

    if (target.classList.contains('clear-cart-btn')) {
      cart = [];
      updateCartStorage();
      renderCart();
    }
  });

  renderCart();
});
