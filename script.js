const scents = [
  "Eucalyptus",
  "Honey",
  "Ginger",
  "Calming Lavender",
  "French Pear",
  "Mixed box"
];

const bundles = [
  { id: "box-6", size: 6, price: 33.60, each: 5.60, image: "images/13-flaxen-wix-box-6.jpg" },
  { id: "box-12", size: 12, price: 62.40, each: 5.20, image: "images/14-flaxen-wix-box-12.jpg" },
  { id: "box-24", size: 24, price: 115.20, each: 4.80, image: "images/15-flaxen-wix-box-24.jpg" },
  { id: "box-48", size: 48, price: 211.20, each: 4.40, image: "images/16-flaxen-wix-box-48.jpg" }
];

const state = {
  cart: []
};

const currency = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD"
});

const bundleGrid = document.getElementById("bundle-grid");
const cartDrawer = document.getElementById("cart-drawer");
const openCartButton = document.getElementById("open-cart");
const closeCartButton = document.getElementById("close-cart");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartShipping = document.getElementById("cart-shipping");
const cartTotal = document.getElementById("cart-total");
const shippingNote = document.getElementById("shipping-note");
const checkoutLink = document.getElementById("checkout-link");

function renderBundles() {
  bundleGrid.innerHTML = "";

  bundles.forEach((bundle) => {
    const article = document.createElement("article");
    article.className = "bundle-card";

    const options = scents.map((scent) => `<option value="${scent}">${scent}</option>`).join("");

    article.innerHTML = `
      <img src="${bundle.image}" alt="Box of ${bundle.size} Flaxen Wix candles">
      <p class="bundle-topline">Box of</p>
      <h3>${bundle.size} candles</h3>
      <div class="bundle-price">
        <strong>${currency.format(bundle.price)}</strong>
        <span>${currency.format(bundle.each)} each</span>
      </div>
      <label>
        Choose scent
        <select aria-label="Choose scent for box of ${bundle.size}" data-scent-select="${bundle.id}">
          ${options}
        </select>
      </label>
      <button class="btn btn-primary" type="button" data-add-bundle="${bundle.id}">Add to cart</button>
    `;

    bundleGrid.appendChild(article);
  });
}

function addToCart(bundleId) {
  const bundle = bundles.find((item) => item.id === bundleId);
  const scentSelect = document.querySelector(`[data-scent-select="${bundleId}"]`);
  const scent = scentSelect ? scentSelect.value : scents[0];

  state.cart.push({
    lineId: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now() + Math.random()),
    ...bundle,
    scent
  });

  renderCart();
  openCart();
}

function removeFromCart(lineId) {
  state.cart = state.cart.filter((item) => item.lineId !== lineId);
  renderCart();
}

function getSubtotal() {
  return state.cart.reduce((sum, item) => sum + item.price, 0);
}

function getShipping(subtotal) {
  if (subtotal === 0) return 0;
  return subtotal >= 150 ? 0 : 12;
}

function renderCart() {
  const subtotal = getSubtotal();
  const shipping = getShipping(subtotal);
  const total = subtotal + shipping;

  cartCount.textContent = state.cart.length;
  cartSubtotal.textContent = currency.format(subtotal);
  cartShipping.textContent = shipping === 0 ? "Free" : currency.format(shipping);
  cartTotal.textContent = currency.format(total);

  if (subtotal === 0) {
    shippingNote.textContent = "Add candles to start an order.";
  } else if (subtotal >= 150) {
    shippingNote.textContent = "Free shipping unlocked. Tiny win. Take it.";
  } else {
    shippingNote.textContent = `${currency.format(150 - subtotal)} away from free shipping.`;
  }

  if (state.cart.length === 0) {
    cartItems.innerHTML = `<p class="cart-empty">Your cart is empty. Tragic, but fixable.</p>`;
    checkoutLink.classList.add("disabled");
    checkoutLink.href = "mailto:hello@philphelan.me";
    return;
  }

  cartItems.innerHTML = state.cart.map((item) => `
    <div class="cart-item">
      <div class="cart-item-top">
        <div>
          <div class="cart-item-title">Box of ${item.size}</div>
          <div class="cart-item-meta">${item.scent} · ${currency.format(item.price)}</div>
        </div>
        <strong>${currency.format(item.price)}</strong>
      </div>
      <button type="button" class="remove-item" data-remove-item="${item.lineId}">Remove</button>
    </div>
  `).join("");

  checkoutLink.classList.remove("disabled");
  checkoutLink.href = buildEmailLink(subtotal, shipping, total);
}

function buildEmailLink(subtotal, shipping, total) {
  const orderLines = state.cart.map((item, index) => {
    return `${index + 1}. Box of ${item.size} - ${item.scent} - ${currency.format(item.price)}`;
  }).join("\n");

  const body = [
    "Hi Flaxen Wix,",
    "",
    "I would like to enquire about this candle order:",
    "",
    orderLines,
    "",
    `Subtotal: ${currency.format(subtotal)}`,
    `Shipping: ${shipping === 0 ? "Free" : currency.format(shipping)}`,
    `Estimated total: ${currency.format(total)}`,
    "",
    "My name:",
    "Phone:",
    "Delivery suburb/postcode:",
    "Notes:"
  ].join("\n");

  const subject = encodeURIComponent("Flaxen Wix order enquiry");
  return `mailto:hello@philphelan.me?subject=${subject}&body=${encodeURIComponent(body)}`;
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

function openImageLightbox(src, altText) {
  const existing = document.querySelector(".image-lightbox");
  if (existing) existing.remove();

  const lightbox = document.createElement("div");
  lightbox.className = "image-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", altText || "Expanded image");

  const stage = document.createElement("div");
  stage.className = "image-lightbox-stage";

  const img = document.createElement("img");
  img.className = "image-lightbox-image";
  img.src = src;
  img.alt = altText || "Expanded image";

  const closeButton = document.createElement("button");
  closeButton.className = "image-lightbox-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close image");
  closeButton.innerHTML = "×";

  const zoomButton = document.createElement("button");
  zoomButton.className = "image-lightbox-zoom";
  zoomButton.type = "button";
  zoomButton.textContent = "Zoom in";

  stage.appendChild(img);
  lightbox.appendChild(stage);
  lightbox.appendChild(closeButton);
  lightbox.appendChild(zoomButton);
  document.body.appendChild(lightbox);

  function closeLightbox() {
    lightbox.remove();
    document.removeEventListener("keydown", handleKeydown);
  }

  function toggleZoom() {
    lightbox.classList.toggle("zoomed");
    zoomButton.textContent = lightbox.classList.contains("zoomed") ? "Fit to screen" : "Zoom in";
    stage.scrollTop = 0;
    stage.scrollLeft = 0;
  }

  function handleKeydown(event) {
    if (event.key === "Escape") closeLightbox();
    if (event.key.toLowerCase() === "z") toggleZoom();
  }

  closeButton.addEventListener("click", closeLightbox);
  zoomButton.addEventListener("click", toggleZoom);
  img.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleZoom();
  });
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox || event.target === stage) closeLightbox();
  });

  document.addEventListener("keydown", handleKeydown);
  closeButton.focus();
}

function prepareZoomableImages() {
  document.querySelectorAll("main img").forEach((img) => {
    img.classList.add("zoomable-image");
    img.setAttribute("tabindex", "0");
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", "Open image larger");
  });
}

function setupImageLightbox() {
  document.addEventListener("click", (event) => {
    const img = event.target.closest("main img");
    if (!img) return;
    openImageLightbox(img.currentSrc || img.src, img.alt);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const img = event.target.closest("main img.zoomable-image");
    if (!img) return;
    event.preventDefault();
    openImageLightbox(img.currentSrc || img.src, img.alt);
  });
}

renderBundles();
prepareZoomableImages();
renderCart();
setupImageLightbox();

bundleGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-bundle]");
  if (!button) return;
  addToCart(button.dataset.addBundle);
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-item]");
  if (!button) return;
  removeFromCart(button.dataset.removeItem);
});

openCartButton.addEventListener("click", openCart);
closeCartButton.addEventListener("click", closeCart);

cartDrawer.addEventListener("click", (event) => {
  if (event.target === cartDrawer) closeCart();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeCart();
});
