"use strict";

const CART_KEY = "outlaw-racing-cart";

const money = value =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP"
  }).format(value);

const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || "[]");

const saveCart = cart => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
};

function updateCartCount() {
  const count = getCart().reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll("[data-cart-count]").forEach(el => {
    el.textContent = count;
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function addToCart(id, size) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;

  if (!size) {
    showToast("Please select a size");
    return;
  }

  const cart = getCart();

  const item = cart.find(
    x => x.id === id && x.size === size
  );

  if (item) {
    item.quantity += 1;
  } else {
    cart.push({
      id,
      size,
      quantity: 1
    });
  }

  saveCart(cart);
  showToast(`${product.name} - Size ${size} added to cart`);
  renderCart();
}

function productCard(p) {
  const sizeOptions = p.sizes
    .map(size => `<option value="${size}">${size}</option>`)
    .join("");

  return `
    <article class="product-card" data-category="${p.category}">
      <button
        class="product-image-button"
        type="button"
        data-details="${p.id}"
        aria-label="View details for ${p.name}"
      >
        <img src="${p.image}" alt="${p.name}" loading="lazy">
      </button>

      <div class="product-card-body">
        <div class="product-meta">
          <span>${p.category}</span>
          <span>${p.brand}</span>
        </div>

        <h3>${p.name}</h3>
        <p>${p.description}</p>

        <div class="stock-line">
          <span class="stock-dot"></span>${p.stock}
        </div>

        <div class="size-selector">
          <label for="size-${p.id}">Select size</label>
          <select
            id="size-${p.id}"
            data-size-select="${p.id}"
            aria-label="Select size for ${p.name}"
          >
            <option value="">Choose size</option>
            ${sizeOptions}
          </select>
        </div>

        <div class="product-card-footer">
          <strong>${money(p.price)}</strong>

          <div class="product-actions">
            <button
              class="button button-secondary"
              type="button"
              data-details="${p.id}"
            >
              Details
            </button>

            <button
              class="button button-primary"
              type="button"
              data-add="${p.id}"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function bindProductButtons(scope = document) {
  scope.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.add);

      const container =
        btn.closest(".product-card") ||
        btn.closest(".dialog-copy") ||
        scope;

      const sizeSelect = container.querySelector(
        `[data-size-select="${id}"]`
      );

      const size = sizeSelect ? sizeSelect.value : "";

      addToCart(id, size);
    });
  });

  scope.querySelectorAll("[data-details]").forEach(btn => {
    btn.addEventListener("click", () => {
      openDetails(Number(btn.dataset.details));
    });
  });
}

function renderFeatured() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;

  grid.innerHTML = PRODUCTS
    .filter(p => p.featured)
    .slice(0, 6)
    .map(productCard)
    .join("");

  bindProductButtons(grid);
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const search = (
    document.getElementById("searchInput")?.value || ""
  ).trim().toLowerCase();

  const active =
    document.querySelector(".filter-button.active")?.dataset.category || "All";

  const sort =
    document.getElementById("sortSelect")?.value || "featured";

  let items = PRODUCTS.filter(p => {
    const categoryMatches =
      active === "All" || p.category === active;

    const searchMatches =
      `${p.name} ${p.brand} ${p.description}`
        .toLowerCase()
        .includes(search);

    return categoryMatches && searchMatches;
  });

  if (sort === "price-low") {
    items.sort((a, b) => a.price - b.price);
  }

  if (sort === "price-high") {
    items.sort((a, b) => b.price - a.price);
  }

  if (sort === "name") {
    items.sort((a, b) => a.name.localeCompare(b.name));
  }

  grid.innerHTML = items.map(productCard).join("");

  const count = document.getElementById("resultsCount");
  if (count) {
    count.textContent =
      `${items.length} item${items.length === 1 ? "" : "s"}`;
  }

  document
    .getElementById("emptyState")
    ?.classList.toggle("hidden", items.length > 0);

  bindProductButtons(grid);
}

function openDetails(id) {
  const p = PRODUCTS.find(x => x.id === id);
  const dialog = document.getElementById("productDialog");
  const content = document.getElementById("dialogContent");

  if (!p || !dialog || !content) return;

  const sizeOptions = p.sizes
    .map(size => `<option value="${size}">${size}</option>`)
    .join("");

  content.innerHTML = `
    <div class="dialog-grid">
      <img src="${p.image}" alt="${p.name}">

      <div class="dialog-copy">
        <span class="eyebrow">${p.category} · ${p.brand}</span>
        <h2 id="dialogTitle">${p.name}</h2>

        <p>${p.description}</p>

        <div class="detail-list">
          <span><b>Availability:</b> ${p.stock}</span>
          <span><b>Available sizes:</b> ${p.sizes.join(", ")}</span>
        </div>

        <div class="size-selector">
          <label for="dialog-size-${p.id}">Select size</label>
          <select
            id="dialog-size-${p.id}"
            data-size-select="${p.id}"
            aria-label="Select size for ${p.name}"
          >
            <option value="">Choose size</option>
            ${sizeOptions}
          </select>
        </div>

        <p class="dialog-price">${money(p.price)}</p>

        <button
          class="button button-primary"
          type="button"
          data-add="${p.id}"
        >
          Add to cart
        </button>
      </div>
    </div>
  `;

  bindProductButtons(content);
  dialog.showModal();
}

function renderCart() {
  const box = document.getElementById("cartItems");
  if (!box) return;

  const cart = getCart();
  const empty = document.getElementById("cartEmpty");

  if (!cart.length) {
    box.innerHTML = "";
    empty?.classList.remove("hidden");
    updateTotals(0);
    return;
  }

  empty?.classList.add("hidden");

  box.innerHTML = cart.map((item, index) => {
    const p = PRODUCTS.find(x => x.id === item.id);
    if (!p) return "";

    return `
      <article class="cart-item">
        <img src="${p.image}" alt="${p.name}">

        <div class="cart-info">
          <span>${p.category}</span>
          <h2>${p.name}</h2>
          <p class="cart-size"><strong>Size:</strong> ${item.size || "Not selected"}</p>
          <strong>${money(p.price)}</strong>
        </div>

        <div class="cart-controls">
          <div class="quantity-control">
            <button
              type="button"
              data-change="-1"
              data-index="${index}"
              aria-label="Decrease ${p.name} quantity"
            >
              −
            </button>

            <span>${item.quantity}</span>

            <button
              type="button"
              data-change="1"
              data-index="${index}"
              aria-label="Increase ${p.name} quantity"
            >
              +
            </button>
          </div>

          <strong>${money(p.price * item.quantity)}</strong>

          <button
            class="remove-button"
            type="button"
            data-remove-index="${index}"
          >
            Remove
          </button>
        </div>
      </article>
    `;
  }).join("");

  box.querySelectorAll("[data-change]").forEach(btn => {
    btn.addEventListener("click", () => {
      changeQuantity(
        Number(btn.dataset.index),
        Number(btn.dataset.change)
      );
    });
  });

  box.querySelectorAll("[data-remove-index]").forEach(btn => {
    btn.addEventListener("click", () => {
      removeFromCart(Number(btn.dataset.removeIndex));
    });
  });

  const subtotal = cart.reduce((sum, item) => {
    const p = PRODUCTS.find(x => x.id === item.id);
    return sum + (p ? p.price * item.quantity : 0);
  }, 0);

  updateTotals(subtotal);
}

function changeQuantity(index, change) {
  const cart = getCart();
  const item = cart[index];

  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart.splice(index, 1);
  }

  saveCart(cart);
  renderCart();
}

function removeFromCart(index) {
  const cart = getCart();

  if (!cart[index]) return;

  cart.splice(index, 1);

  saveCart(cart);
  renderCart();
  showToast("Removed from cart");
}

function updateTotals(subtotal) {
  const delivery =
    subtotal === 0 || subtotal >= 100 ? 0 : 6.99;

  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  set("cartSubtotal", money(subtotal));
  set("deliveryCost", delivery ? money(delivery) : "Free");
  set("cartTotal", money(subtotal + delivery));

  set(
    "deliveryMessage",
    subtotal > 0 && subtotal < 100
      ? `${money(100 - subtotal)} more for free delivery`
      : subtotal >= 100
        ? "Free delivery applied"
        : ""
  );
}

function setupFilters() {
  const filters = document.getElementById("categoryFilters");
  if (!filters) return;

  filters.addEventListener("click", e => {
    const btn = e.target.closest(".filter-button");
    if (!btn) return;

    filters.querySelectorAll(".filter-button").forEach(x => {
      x.classList.remove("active");
    });

    btn.classList.add("active");
    renderProducts();
  });

  document
    .getElementById("searchInput")
    ?.addEventListener("input", renderProducts);

  document
    .getElementById("sortSelect")
    ?.addEventListener("change", renderProducts);

  const requested = new URLSearchParams(location.search).get("category");

  if (requested) {
    const btn = [...filters.querySelectorAll(".filter-button")]
      .find(x => x.dataset.category === requested);

    if (btn) {
      filters.querySelectorAll(".filter-button").forEach(x => {
        x.classList.remove("active");
      });

      btn.classList.add("active");
    }
  }

  renderProducts();
}

function setupContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    let valid = true;

    const checks = [
      [
        "contactName",
        value => value.trim().length >= 2,
        "Enter your name."
      ],
      [
        "contactEmail",
        value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        "Enter a valid email address."
      ],
      [
        "contactMessage",
        value => value.trim().length >= 10,
        "Enter at least 10 characters."
      ]
    ];

    checks.forEach(([id, test, message]) => {
      const input = document.getElementById(id);
      const error = document.getElementById(`${id}Error`);
      const ok = test(input.value);

      input.setAttribute("aria-invalid", String(!ok));
      input.classList.toggle("input-error", !ok);

      if (error) {
        error.textContent = ok ? "" : message;
      }

      if (!ok) {
        valid = false;
      }
    });

    if (valid) {
      const success = document.getElementById("formSuccess");

      if (success) {
        success.textContent =
          "Thank you. Your message has been received.";
      }

      form.reset();
    }
  });
}

function setupGallery() {
  document.querySelectorAll("[data-gallery]").forEach(img => {
    img.addEventListener("click", () => {
      const dialog = document.getElementById("galleryDialog");
      const full = document.getElementById("galleryImage");

      if (dialog && full) {
        full.src = img.src;
        full.alt = img.alt;
        dialog.showModal();
      }
    });
  });
}

function setupMenu() {
  const button = document.getElementById("menuButton");
  const nav = document.getElementById("mainNav");

  button?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");

    button.setAttribute(
      "aria-expanded",
      String(open)
    );
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-year]").forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  updateCartCount();
  setupMenu();
  renderFeatured();
  setupFilters();
  renderCart();
  setupContactForm();
  setupGallery();

  document
    .getElementById("closeDialog")
    ?.addEventListener("click", () => {
      document.getElementById("productDialog").close();
    });

  document
    .getElementById("closeGallery")
    ?.addEventListener("click", () => {
      document.getElementById("galleryDialog").close();
    });

  document
    .getElementById("checkoutButton")
    ?.addEventListener("click", () => {
      showToast(
        getCart().length
          ? "Checkout is ready for demonstration"
          : "Your cart is empty"
      );
    });
});
