// === Authentication ===
function isUserSignedIn() {
  return localStorage.getItem('signedIn') === 'true';
}

// === LocalStorage Cart Utilities ===
function getCart() {
  const cartJSON = localStorage.getItem('cart');
  return cartJSON ? JSON.parse(cartJSON) : [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function findCartItem(cart, productId) {
  return cart.find(item => item.id === productId);
}

function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.querySelector('#cart-count-badge');
  if (badge) badge.textContent = count;
}

function addToCart(productData) {
  const cart = getCart();
  const existing = findCartItem(cart, productData.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...productData, quantity: 1 });
  }

  saveCart(cart);
  updateCartBadge();
}

function updateCartItemQuantity(productId, newQuantity) {
  const cart = getCart();
  const item = findCartItem(cart, productId);
  if (item) {
    item.quantity = newQuantity;
    saveCart(cart);
    updateCartBadge();
  }
}

function removeCartItem(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
  updateCartBadge();
}

// === Cart Page Rendering ===
function renderCartPage() {
  const cart = getCart();
  const cartContainer = document.getElementById('cart-container');
  if (!cartContainer) return;

  const loadingState = cartContainer.querySelector('.loading-state');
  const emptyState = cartContainer.querySelector('.empty-cart');
  const itemsListContainer = document.getElementById('cart-items');
  const cartError = document.getElementById('cart-error');
  const cartCountEl = document.getElementById('cart-count');
  const cartTotalEl = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('proceed-to-checkout');

  cartError?.classList.add('hidden');
  cartError.textContent = '';
  loadingState?.classList.remove('hidden');
  emptyState?.classList.add('hidden');
  itemsListContainer.innerHTML = '';
  cartCountEl.textContent = '0';
  cartTotalEl.textContent = '$0.00';

  setTimeout(() => {
    loadingState.classList.add('hidden');

    if (cart.length === 0) {
      emptyState.classList.remove('hidden');
      checkoutBtn.disabled = true;
      return;
    }

    checkoutBtn.disabled = false;

    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach(item => {
      totalItems += item.quantity;
      totalPrice += item.price * item.quantity;

      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';

      itemDiv.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-image" />
        <div class="cart-item-details">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">$${item.price.toFixed(2)}</span>
          <label for="qty-${item.id}">Qty:</label>
          <input type="number" id="qty-${item.id}" class="cart-item-qty" value="${item.quantity}" min="1" />
          <span class="cart-item-line-total">Line: $${(item.price * item.quantity).toFixed(2)}</span>
          <button class="remove-item-btn">Remove</button>
        </div>`;

      itemDiv.querySelector('.remove-item-btn').addEventListener('click', () => {
        removeCartItem(item.id);
        renderCartPage();
      });

      itemDiv.querySelector('.cart-item-qty').addEventListener('change', (e) => {
        const newQty = parseInt(e.target.value, 10);
        if (isNaN(newQty) || newQty < 1) {
          e.target.value = item.quantity;
          return;
        }
        updateCartItemQuantity(item.id, newQty);
        renderCartPage();
      });

      itemsListContainer.appendChild(itemDiv);
    });

    cartCountEl.textContent = totalItems;
    cartTotalEl.textContent = `$${totalPrice.toFixed(2)}`;
  }, 300);
}

// === Checkout Page Rendering ===
function renderCheckoutPage() {
  const cart = getCart();
  const main = document.querySelector('main.cart-page');
  if (!main) return;

  main.innerHTML = '';

  const checkoutSection = document.createElement('section');
  checkoutSection.className = 'checkout-page';
  checkoutSection.innerHTML = `<h1 style="color: #fff; border-bottom: 2px solid var(--accent-green); padding-bottom: 10px;">Checkout</h1>`;

  const itemsContainer = document.createElement('div');
  itemsContainer.className = 'checkout-items';

  let totalPrice = 0;

  cart.forEach(item => {
    totalPrice += item.price * item.quantity;

    const row = document.createElement('div');
    row.className = 'checkout-item';
    row.innerHTML = `
      <img src="${item.image}" alt="${item.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
      <div style="flex: 1;">
        <div style="color: #fff;">${item.name}</div>
        <div style="color: #ccc;">Quantity: ${item.quantity}</div>
        <div style="color: #ccc;">Price: $${item.price.toFixed(2)}</div>
        <div style="color: #fff; font-weight: bold;">Line Total: $${(item.price * item.quantity).toFixed(2)}</div>
      </div>`;
    itemsContainer.appendChild(row);
  });

  const summaryDiv = document.createElement('div');
  summaryDiv.className = 'checkout-summary';
  summaryDiv.style.textAlign = 'right';
  summaryDiv.style.marginTop = '30px';
  summaryDiv.innerHTML = `
    <div style="color: var(--accent-green); font-size: 1.3rem;">Total Price: $${totalPrice.toFixed(2)}</div>
    <button id="confirm-order-btn" style="background-color: var(--accent-green); color: #000; padding: 12px 24px; font-weight: bold; border: none; border-radius: 6px; cursor: pointer;">Confirm Order</button>`;

  checkoutSection.append(itemsContainer, summaryDiv);
  main.appendChild(checkoutSection);

  document.getElementById('confirm-order-btn').addEventListener('click', () => renderPaymentForm(main));
}

// === Payment Form Rendering & Validation ===
function renderPaymentForm(main) {
  main.innerHTML = `
    <section class="payment-form">
      <h2 style="color: #fff; border-bottom: 2px solid var(--accent-green); padding-bottom: 10px;">Enter Payment Details</h2>
      <form id="payment-form" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem;">
        <input type="text" placeholder="Cardholder Name" required style="padding: 0.75rem;" />
        <input type="text" placeholder="Card Number" maxlength="19" required style="padding: 0.75rem;" />
        <input type="text" placeholder="MM/YY" maxlength="5" required style="padding: 0.75rem;" />
        <input type="text" placeholder="CVC" maxlength="4" required style="padding: 0.75rem;" />
        <button type="submit" style="background-color: var(--accent-green); color: #000; padding: 12px 24px; font-weight: bold; border: none; border-radius: 6px; cursor: pointer;">Submit Payment</button>
      </form>
    </section>`;

  const form = document.getElementById('payment-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const [nameInput, cardInput, expInput, cvcInput] = form.querySelectorAll('input');
    const name = nameInput.value.trim();
    const card = cardInput.value.replace(/\s+/g, '');
    const exp = expInput.value.trim();
    const cvc = cvcInput.value.trim();

    const errors = [];

    if (!/^[A-Za-z\s]{2,}$/.test(name)) errors.push('Enter a valid cardholder name.');
    if (!/^\d{16}$/.test(card)) errors.push('Enter a valid 16-digit card number.');
    if (!/^\d{2}\/\d{2}$/.test(exp)) {
      errors.push('Enter expiry date in MM/YY format.');
    } else {
      const [month, year] = exp.split('/').map(Number);
      const expDate = new Date(`20${year}`, month);
      if (month < 1 || month > 12 || expDate < new Date()) {
        errors.push('Card expiry date is invalid or expired.');
      }
    }
    if (!/^\d{3,4}$/.test(cvc)) errors.push('Enter a valid 3 or 4 digit CVC.');

    if (errors.length > 0) {
      alert('Payment Error:\n' + errors.join('\n'));
      return;
    }

    localStorage.removeItem('cart');
    updateCartBadge();

    main.innerHTML = `
      <div style="text-align: center; color: #03ff1c;">
        <h2>✅ Payment Successful!</h2>
        <p style="color: #ccc;">Thank you for your purchase.</p>
        <div class="loading-spinner" style="margin: 2rem auto; border: 6px solid #f3f3f3; border-top: 6px solid #03ff1c; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
        <p style="color: #bbb;">Redirecting to cart...</p>
      </div>`;

    const style = document.createElement('style');
    style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
    document.head.appendChild(style);

    setTimeout(() => window.location.href = 'cart.html', 3000);
  });
}

// === DOM Initialization ===
document.addEventListener('DOMContentLoaded', () => {
  if (isUserSignedIn()) {
    document.getElementById('nav-signin')?.style.setProperty('display', 'none');
    document.getElementById('nav-signup')?.style.setProperty('display', 'none');
  }

  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
      addToCart({
        id: button.getAttribute('data-product-id'),
        name: button.getAttribute('data-product-name'),
        price: parseFloat(button.getAttribute('data-product-price')),
        image: button.getAttribute('data-product-image')
      });
    });
  });

  updateCartBadge();

  if (document.querySelector('.cart-page')) {
    renderCartPage();
    document.getElementById('proceed-to-checkout')?.addEventListener('click', () => {
      isUserSignedIn() ? renderCheckoutPage() : window.location.href = 'signup.html';
    });
  }

  const recGrid = document.querySelector('.recommendations-grid');
  if (recGrid) {
    const sampleRecs = [
      { id: 'watch2', name: 'Model Two', price: 2495.99, image: 'Time/OIP (1).jpeg' },
      { id: 'watch5', name: 'Model Five', price: 3995.99, image: 'Time/OIP.jpeg' },
      { id: 'watch8', name: 'Model Eight', price: 5495.99, image: 'Time/close-up-wristwatch-black-background_1048944-26930960.jpg' }
    ];

    sampleRecs.forEach(rec => {
      const card = document.createElement('div');
      card.className = 'rec-card';
      card.innerHTML = `
        <img src="${rec.image}" alt="${rec.name}" class="rec-image" />
        <span class="rec-name">${rec.name}</span>
        <span class="rec-price">$${rec.price.toFixed(2)}</span>
        <button class="rec-add-btn">Add</button>`;
      card.querySelector('.rec-add-btn').addEventListener('click', () => addToCart(rec));
      recGrid.appendChild(card);
    });
  }
});
