let cart = [];

// Navegación entre secciones SPA
function navigateTo(targetSectionId) {
  const sections = document.querySelectorAll('.content-section');
  const navLinks = document.querySelectorAll('.nav-link');

  sections.forEach(sec => sec.classList.remove('active'));
  navLinks.forEach(link => link.classList.remove('active'));

  const targetSection = document.getElementById(`section-${targetSectionId}`);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  const activeLink = document.querySelector(`.nav-link[data-section="${targetSectionId}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

// Inicialización de eventos
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-link');
  const featCards = document.querySelectorAll('.feat-card');
  const searchInput = document.getElementById('searchInput');
  const filterCategory = document.getElementById('filterCategory');
  const filterStatus = document.getElementById('filterStatus');

  // Renderizar catálogos iniciales
  renderProducts(PRODUCTS, 'productsGrid');
  renderProducts(PRODUCTS, 'categoryProductsGrid');

  // Clics en la barra de navegación
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-section');
      navigateTo(target);
    });
  });

  // Clics en categorías de Inicio
  featCards.forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.getAttribute('data-cat');
      navigateTo('categorias');
      if (filterCategory) {
        filterCategory.value = cat;
        applyFilters();
      }
    });
  });

  // Botón Explorar
  const btnExplore = document.getElementById('btnExplore');
  if (btnExplore) {
    btnExplore.addEventListener('click', () => navigateTo('productos'));
  }

  // Buscador
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      navigateTo('productos');
      const filtered = PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)
      );
      renderProducts(filtered, 'productsGrid');
    });
  }

  // Filtros
  function applyFilters() {
    const catVal = filterCategory.value;
    const statVal = filterStatus.value;

    const filtered = PRODUCTS.filter(p => {
      const matchCat = (catVal === 'TODAS') || (p.category === catVal);
      const matchStat = (statVal === 'TODOS') || (p.status === statVal);
      return matchCat && matchStat;
    });

    renderProducts(filtered, 'categoryProductsGrid');
  }

  if (filterCategory && filterStatus) {
    filterCategory.addEventListener('change', applyFilters);
    filterStatus.addEventListener('change', applyFilters);
  }

  // Control Drawer Carrito
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartToggleBtn = document.getElementById('cartToggleBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');

  function toggleCart() {
    cartDrawer.classList.toggle('open');
    cartOverlay.classList.toggle('open');
  }

  if (cartToggleBtn) cartToggleBtn.onclick = toggleCart;
  if (closeCartBtn) closeCartBtn.onclick = toggleCart;
  if (cartOverlay) cartOverlay.onclick = toggleCart;

  // Modales
  const productModal = document.getElementById('productModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  if (closeModalBtn) {
    closeModalBtn.onclick = () => productModal.classList.remove('open');
  }

  const checkoutModal = document.getElementById('checkoutModal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');

  if (checkoutBtn) {
    checkoutBtn.onclick = () => {
      if (cart.length === 0) {
        alert('Tu carrito está vacío.');
        return;
      }
      checkoutModal.classList.add('open');
    };
  }

  if (closeCheckoutBtn) {
    closeCheckoutBtn.onclick = () => checkoutModal.classList.remove('open');
  }

  // Enviar pedido a WhatsApp
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.onsubmit = function(e) {
      e.preventDefault();
      sendOrderToWhatsApp();
    };
  }

  // WhatsApp directo en Contacto
  const btnWspDirect = document.getElementById('btnWspDirect');
  if (btnWspDirect) {
    btnWspDirect.onclick = () => window.open('https://wa.me/573145033726', '_blank');
  }
});

// Renderizado de Productos
function renderProducts(items, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding: 2rem;">No hay productos disponibles.</p>';
    return;
  }

  items.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" onclick="openDetailModal(${p.id})">
      <div>
        <span class="badge ${p.status.toLowerCase().replace(' ', '-')}">${p.status}</span>
        <h4 style="margin:0.4rem 0;">${p.name}</h4>
        <p style="font-weight:600; color:var(--accent-gold); margin:0.3rem 0;">$${p.price.toLocaleString('es-CO')} COP</p>
      </div>
      <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
        <button class="btn-primary" style="flex:1; font-size:0.8rem;" onclick="openDetailModal(${p.id})">Ver Detalle</button>
        <button class="btn-buy" style="flex:1; font-size:0.8rem;" onclick="addToCart(${p.id})">Agregar</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function openDetailModal(productId) {
  const p = PRODUCTS.find(prod => prod.id === productId);
  if (!p) return;

  const modalBody = document.getElementById('modalBody');
  const productModal = document.getElementById('productModal');

  modalBody.innerHTML = `
    <img src="${p.image}" alt="${p.name}" style="width:100%; height:200px; object-fit:cover; border-radius:6px; margin-bottom:1rem;">
    <h3>${p.name}</h3>
    <p style="color:var(--accent-gold); font-weight:bold; font-size:1.2rem;">$${p.price.toLocaleString('es-CO')} COP</p>
    <p>${p.description}</p>
    <button class="btn-buy" style="width:100%" onclick="addToCart(${p.id}); document.getElementById('productModal').classList.remove('open');">Agregar al Carrito</button>
  `;
  productModal.classList.add('open');
}

// Lógica de Carrito
function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  updateCartUI();
}

function updateCartUI() {
  const cartItemsContainer = document.getElementById('cartItems');
  const cartCount = document.getElementById('cartCount');
  const cartTotal = document.getElementById('cartTotal');

  cartItemsContainer.innerHTML = '';
  let total = 0;
  let totalCount = 0;

  cart.forEach(item => {
    total += item.price * item.qty;
    totalCount += item.qty;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.image}">
      <div class="cart-item-info">
        <p class="cart-item-title">${item.name}</p>
        <p class="cart-item-price">${item.qty} x $${item.price.toLocaleString('es-CO')}</p>
      </div>
      <button onclick="removeFromCart(${item.id})" style="border:none; background:none; color:red; cursor:pointer;">&times;</button>
    `;
    cartItemsContainer.appendChild(div);
  });

  cartCount.innerText = totalCount;
  cartTotal.innerText = `$${total.toLocaleString('es-CO')} COP`;
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartUI();
}

// Función para enviar la orden por WhatsApp sin emojis (Formato Profesional)
function sendOrderToWhatsApp() {
  const name = document.getElementById('clientName').value.trim();
  const phone = document.getElementById('clientPhone').value.trim();
  const address = document.getElementById('clientAddress').value.trim();
  const paymentMethod = document.getElementById('paymentMethod').value;

  if (!name || !phone || !address || !paymentMethod) {
    alert('Por favor complete todos los campos, incluyendo el método de pago.');
    return;
  }

  // Generación de número de orden y fecha
  const orderId = 'DALA-' + Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });

  let message = `*SOLICITUD DE COMPRA - JOYERIA DALA*\n`;
  message += `----------------------------------------\n\n`;
  message += `*Orden N:* ${orderId}\n`;
  message += `*Fecha:* ${dateStr}\n\n`;

  message += `*DATOS DEL CLIENTE*\n`;
  message += `> *Nombre:* ${name}\n`;
  message += `> *Telefono:* ${phone}\n`;
  message += `> *Direccion:* ${address}\n`;
  message += `> *Metodo de Pago:* ${paymentMethod}\n\n`;

  message += `*RESUMEN DEL PEDIDO*\n`;
  message += `----------------------------------------\n\n`;

  let grandTotal = 0;
  cart.forEach((item, index) => {
    const subtotal = item.price * item.qty;
    grandTotal += subtotal;
    message += `${index + 1}. *${item.name}*\n`;
    message += `   Cant: ${item.qty} | Valor: $${item.price.toLocaleString('es-CO')} COP\n`;
    message += `   Subtotal: $${subtotal.toLocaleString('es-CO')} COP\n\n`;
  });

  message += `----------------------------------------\n`;
  message += `*TOTAL A PAGAR:* $${grandTotal.toLocaleString('es-CO')} COP\n`;
  message += `----------------------------------------\n\n`;
  message += `Quedo atento(a) a las instrucciones para realizar el pago por *${paymentMethod}* y confirmar el envio. ¡Muchas gracias!`;

  const phoneWhatsApp = '573145033726';
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneWhatsApp}?text=${encodedMessage}`;

  window.open(whatsappUrl, '_blank');
  
  const checkoutModal = document.getElementById('checkoutModal');
  if (checkoutModal) {
    checkoutModal.classList.remove('open');
  }
}