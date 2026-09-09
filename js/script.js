/* ==========================================
   BOOK & PEN STORE - MAIN INTERACTIVE SCRIPT
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- Global State & Storage ---
  let cart = JSON.parse(localStorage.getItem('bookpen_cart')) || [];
  let favorites = JSON.parse(localStorage.getItem('bookpen_favs')) || [];

  // --- Core Elements ---
  const themeToggle = document.getElementById('theme-toggle');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  const cartBtn = document.getElementById('cart-btn');
  const closeCartBtn = document.getElementById('close-cart');
  const cartSidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('overlay');
  const backToTopBtn = document.getElementById('back-to-top');

  // --- Dark/Light Mode ---
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeToggle) themeToggle.classList.replace('fa-moon', 'fa-sun');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      themeToggle.classList.toggle('fa-sun', isDark);
      themeToggle.classList.toggle('fa-moon', !isDark);
    });
  }

  // --- Responsive Menu ---
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      hamburger.classList.toggle('fa-xmark');
    });
  }

  // --- Cart Modal Handling ---
  const toggleCart = () => {
    cartSidebar.classList.toggle('active');
    overlay.classList.toggle('active');
  };

  if (cartBtn) cartBtn.addEventListener('click', toggleCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
  if (overlay) overlay.addEventListener('click', () => {
    cartSidebar.classList.remove('active');
    overlay.classList.remove('active');
  });

  // --- Back to Top ---
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn?.classList.add('active');
    } else {
      backToTopBtn?.classList.remove('active');
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Toast Notifications ---
  window.showToast = function(message, type = 'success') {
    const container = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  }

  // --- Cart Management ---
  window.addToCart = function(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    updateCart();
    showToast(`${product.name} added to cart!`);
  };

  window.updateQty = function(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
      item.qty += change;
      if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
      }
    }
    updateCart();
  };

  function updateCart() {
    localStorage.setItem('bookpen_cart', JSON.stringify(cart));
    const cartCountEl = document.getElementById('cart-count');
    const cartItemsEl = document.getElementById('cart-items');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartTotalEl = document.getElementById('cart-total-price');

    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCountEl) cartCountEl.textContent = totalItems;

    if (cartItemsEl) {
      cartItemsEl.innerHTML = cart.length === 0 
        ? '<p style="text-align:center; padding: 20px;">Your cart is empty</p>'
        : cart.map(item => `
          <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
              <h4>${item.name}</h4>
              <p>$${item.price.toFixed(2)} x ${item.qty}</p>
              <div>
                <button class="qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
                <span>${item.qty}</span>
                <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
              </div>
            </div>
          </div>
        `).join('');
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const delivery = subtotal > 0 ? 3.99 : 0;
    if (cartSubtotalEl) cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (cartTotalEl) cartTotalEl.textContent = `$${(subtotal + delivery).toFixed(2)}`;
  }

  // Prepare the order details before opening the Telegram group.
  function checkoutViaTelegram() {
    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const delivery = subtotal > 0 ? 3.99 : 0;
    const total = subtotal + delivery;
    const orderDetails = cart.map((item, index) => [
      `${index + 1}. ${item.name}`,
      `Quantity: ${item.qty}`,
      `Price: $${item.price.toFixed(2)} each`,
      `Image: ${item.image}`
    ].join('\n')).join('\n\n');
    const message = `New order from Ink & Pages\n\n${orderDetails}\n\nDelivery: $${delivery.toFixed(2)}\nTotal: $${total.toFixed(2)}`;
    const telegramLink = 'https://t.me/+BPMrgdGXKFw1Zjc1';

    navigator.clipboard?.writeText(message).then(() => {
      showToast('Order details copied. Paste them in Telegram.');
    }).catch(() => {
      showToast('Telegram opened. Please copy the order details manually.', 'error');
    });
    window.open(telegramLink, '_blank', 'noopener,noreferrer');
  }

  document.querySelectorAll('.cart-footer .btn, .offcanvas-footer .btn').forEach(button => {
    button.addEventListener('click', checkoutViaTelegram);
  });

  // --- Page Specific Logic ---
  
  // 1. Countdown Timer (Index Page)
  const countdownEl = document.getElementById('countdown');
  if (countdownEl) {
    const targetDate = new Date().getTime() + (7 * 24 * 60 * 60 * 1000);
    setInterval(() => {
      const now = new Date().getTime();
      const diff = targetDate - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      countdownEl.innerHTML = `<span>${days}d</span> : <span>${hours}h</span> : <span>${mins}m</span> : <span>${secs}s</span>`;
    }, 1000);
  }

  // 2. Login Form Validation (Login Page)
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    const togglePass = document.getElementById('toggle-password');
    const passInput = document.getElementById('password');

    togglePass?.addEventListener('click', () => {
      const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passInput.setAttribute('type', type);
      togglePass.classList.toggle('fa-eye');
      togglePass.classList.toggle('fa-eye-slash');
    });

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = passInput.value;

      if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
      }
      showToast('Login successful! Redirecting...');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    });
  }

  // 3. FAQ Accordion & Contact Form (Contact Page)
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    item.querySelector('.faq-question')?.addEventListener('click', () => {
      item.classList.toggle('active');
    });
  });

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Thank you! Message sent successfully.');
      contactForm.reset();
    });
  }

  // Initialize Cart View
  updateCart();
});