// cart.js

// Simulate user authentication state (front-end prototype)
function isUserSignedIn() {
  return localStorage.getItem('signedIn') === 'true';
}

// LocalStorage cart utilities
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

// Add or increment product in cart
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

// Update badge with total item quantity
function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.querySelector('#cart-count-badge');
  if (badge) badge.textContent = count;
}

// Render cart page with all items
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
  if (cartError) cartError.textContent = '';

  loadingState?.classList.remove('hidden');
  emptyState?.classList.add('hidden');
  if (itemsListContainer) itemsListContainer.innerHTML = '';
  if (cartCountEl) cartCountEl.textContent = '0';
  if (cartTotalEl) cartTotalEl.textContent = '$0.00';

  setTimeout(() => {
    loadingState?.classList.add('hidden');

    if (cart.length === 0) {
      emptyState?.classList.remove('hidden');
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    emptyState?.classList.add('hidden');
    if (checkoutBtn) checkoutBtn.disabled = false;

    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach(item => {
      totalItems += item.quantity;
      totalPrice += item.price * item.quantity;

      const itemDiv = document.createElement('div');
      itemDiv.classList.add('cart-item');

      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.name;
      img.classList.add('cart-item-image');

      const detailsDiv = document.createElement('div');
      detailsDiv.classList.add('cart-item-details');

      const nameEl = document.createElement('span');
      nameEl.classList.add('cart-item-name');
      nameEl.textContent = item.name;

      const priceEl = document.createElement('span');
      priceEl.classList.add('cart-item-price');
      priceEl.textContent = `$${item.price.toFixed(2)}`;

      const qtyLabel = document.createElement('label');
      qtyLabel.textContent = 'Qty: ';
      qtyLabel.setAttribute('for', `qty-${item.id}`);

      const qtyInput = document.createElement('input');
      qtyInput.type = 'number';
      qtyInput.min = '1';
      qtyInput.value = item.quantity;
      qtyInput.id = `qty-${item.id}`;
      qtyInput.classList.add('cart-item-qty');
      qtyInput.addEventListener('change', e => {
        const newQty = parseInt(e.target.value, 10);
        if (isNaN(newQty) || newQty < 1) {
          e.target.value = item.quantity;
          return;
        }
        updateCartItemQuantity(item.id, newQty);
        renderCartPage();
      });

      const lineTotalEl = document.createElement('span');
      lineTotalEl.classList.add('cart-item-line-total');
      lineTotalEl.textContent = `Line: $${(item.price * item.quantity).toFixed(2)}`;

      const removeBtn = document.createElement('button');
      removeBtn.classList.add('remove-item-btn');
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => {
        removeCartItem(item.id);
        renderCartPage();
      });

      detailsDiv.append(nameEl, priceEl, qtyLabel, qtyInput, lineTotalEl, removeBtn);
      itemDiv.append(img, detailsDiv);
      itemsListContainer?.appendChild(itemDiv);
    });

    cartCountEl.textContent = totalItems;
    cartTotalEl.textContent = `$${totalPrice.toFixed(2)}`;
  }, 300);
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
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
  updateCartBadge();
}

// Checkout rendering
function renderCheckoutPage() {
  const cart = getCart();
  const main = document.querySelector('main.cart-page');
  if (!main) return;

  main.innerHTML = '';

  const checkoutSection = document.createElement('section');
  checkoutSection.classList.add('checkout-page');

  const heading = document.createElement('h1');
  heading.textContent = 'Checkout';
  heading.style.color = '#fff';
  heading.style.borderBottom = '2px solid var(--accent-green)';
  heading.style.paddingBottom = '10px';

  checkoutSection.appendChild(heading);

  const itemsContainer = document.createElement('div');
  itemsContainer.classList.add('checkout-items');
  checkoutSection.appendChild(itemsContainer);

  let totalPrice = 0;

  cart.forEach(item => {
    const itemRow = document.createElement('div');
    itemRow.classList.add('checkout-item');

    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;
    img.style.width = img.style.height = '100px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '8px';

    const infoDiv = document.createElement('div');
    infoDiv.style.flex = '1';

    const nameEl = document.createElement('div');
    nameEl.textContent = item.name;
    nameEl.style.color = '#fff';

    const qtyEl = document.createElement('div');
    qtyEl.textContent = `Quantity: ${item.quantity}`;
    qtyEl.style.color = '#ccc';

    const priceEl = document.createElement('div');
    priceEl.textContent = `Price: $${item.price.toFixed(2)}`;
    priceEl.style.color = '#ccc';

    const lineEl = document.createElement('div');
    const lineTotal = item.price * item.quantity;
    totalPrice += lineTotal;
    lineEl.textContent = `Line Total: $${lineTotal.toFixed(2)}`;
    lineEl.style.color = '#fff';
    lineEl.style.fontWeight = 'bold';

    infoDiv.append(nameEl, qtyEl, priceEl, lineEl);
    itemRow.append(img, infoDiv);
    itemsContainer.appendChild(itemRow);
  });

  const summaryDiv = document.createElement('div');
  summaryDiv.classList.add('checkout-summary');
  summaryDiv.style.textAlign = 'right';
  summaryDiv.style.marginTop = '30px';

  const totalEl = document.createElement('div');
  totalEl.textContent = `Total Price: $${totalPrice.toFixed(2)}`;
  totalEl.style.color = 'var(--accent-green)';
  totalEl.style.fontSize = '1.3rem';

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Confirm Order';
  confirmBtn.style.backgroundColor = 'var(--accent-green)';
  confirmBtn.style.color = '#000';
  confirmBtn.style.padding = '12px 24px';
  confirmBtn.style.fontWeight = 'bold';
  confirmBtn.style.border = 'none';
  confirmBtn.style.borderRadius = '6px';
  confirmBtn.style.cursor = 'pointer';
  confirmBtn.addEventListener('click', () => {
    localStorage.removeItem('cart');
    updateCartBadge();
    alert('Order confirmed! Thank you for your purchase.');
    // Optional: redirect or clear page
  });

  summaryDiv.append(totalEl, confirmBtn);
  checkoutSection.appendChild(summaryDiv);
  main.appendChild(checkoutSection);
}

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Hide nav links if signed in
  if (isUserSignedIn()) {
    const signInLink = document.getElementById('nav-signin');
    const signUpLink = document.getElementById('nav-signup');
    if (signInLink) signInLink.style.display = 'none';
    if (signUpLink) signUpLink.style.display = 'none';
  }

  // Add-to-cart buttons
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
      const productData = {
        id: button.getAttribute('data-product-id'),
        name: button.getAttribute('data-product-name'),
        price: parseFloat(button.getAttribute('data-product-price')),
        image: button.getAttribute('data-product-image')
      };
      addToCart(productData);
    });
  });

  updateCartBadge();

  // If on cart page, render it
  if (document.querySelector('.cart-page')) {
    renderCartPage();
    const checkoutBtn = document.getElementById('proceed-to-checkout');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (!isUserSignedIn()) {
          window.location.href = 'signup.html';
        } else {
          renderCheckoutPage();
        }
      });
    }
  }

  // "You Might Also Like" recommendations
  const recGrid = document.querySelector('.recommendations-grid');
  if (recGrid) {
    const sampleRecs = [
      { id: 'watch2', name: 'Model Two', price: 249.99, image: 'Time/watch2.jpg' },
      { id: 'watch5', name: 'Model Five', price: 399.99, image: 'Time/watch5.jpg' },
      { id: 'watch8', name: 'Model Eight', price: 549.99, image: 'Time/watch8.jpg' }
    ];
    sampleRecs.forEach(rec => {
      const card = document.createElement('div');
      card.classList.add('rec-card');

      const img = document.createElement('img');
      img.src = rec.image;
      img.alt = rec.name;
      img.classList.add('rec-image');

      const nameEl = document.createElement('span');
      nameEl.classList.add('rec-name');
      nameEl.textContent = rec.name;

      const priceEl = document.createElement('span');
      priceEl.classList.add('rec-price');
      priceEl.textContent = `$${rec.price.toFixed(2)}`;

      const addBtn = document.createElement('button');
      addBtn.classList.add('rec-add-btn');
      addBtn.textContent = 'Add';
      addBtn.addEventListener('click', () => addToCart(rec));

      card.append(img, nameEl, priceEl, addBtn);
      recGrid.appendChild(card);
    });
  }
});
