// Expanded Mock Data with Image URLs and ZAR Pricing
const menuItems = [
  {
    id: 1,
    name: "Original Cheese & Bacon Burger",
    price: 89.9,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    name: "Spicy Jalapeño Chicken Burger",
    price: 79.9,
    image:
      "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    name: "Double Stack BBQ Beef Burger",
    price: 114.9,
    image:
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    name: "Large Slap Chips (French Fries)",
    price: 34.9,
    image:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 5,
    name: "Cheesy Loaded Fries",
    price: 49.9,
    image:
      "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 6,
    name: "Sticky BBQ Chicken Wings (6pc)",
    price: 65.0,
    image:
      "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 7,
    name: "Gourmet Chocolate Milkshake",
    price: 39.9,
    image:
      "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 8,
    name: "Ice Cold Coca-Cola Buddy",
    price: 18.5,
    image:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80",
  },
];

let cart = [];
let currentView = "customer";

document.addEventListener("DOMContentLoaded", () => {
  renderMenu();
  renderCart();
  renderAdminOrders();

  document
    .getElementById("viewToggleBtn")
    .addEventListener("click", toggleView);
  document.getElementById("checkoutBtn").addEventListener("click", placeOrder);
  document
    .getElementById("clearOrdersBtn")
    .addEventListener("click", clearAllOrders);
});

// Render Food Menu with Images
function renderMenu() {
  const container = document.getElementById("menuContainer");
  container.innerHTML = menuItems
    .map(
      (item) => `
        <div class="menu-card">
            <img class="menu-img" src="${item.image}" alt="${item.name}">
            <div class="menu-info">
                <div class="menu-title">${item.name}</div>
                <div class="menu-price">R ${item.price.toFixed(2)}</div>
                <button class="add-btn" data-id="${item.id}">Add to Cart</button>
            </div>
        </div>
    `,
    )
    .join("");

  const addButtons = container.querySelectorAll(".add-btn");
  addButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const itemId = parseInt(e.target.getAttribute("data-id"));
      addToCart(itemId);
    });
  });
}

// View Switching Logic
function toggleView() {
  const customerSection = document.getElementById("customerView");
  const adminSection = document.getElementById("adminView");
  const toggleBtn = document.getElementById("viewToggleBtn");

  if (currentView === "customer") {
    customerSection.classList.remove("active");
    adminSection.classList.add("active");
    toggleBtn.innerText = "Switch to Customer View";
    currentView = "admin";
    renderAdminOrders();
  } else {
    adminSection.classList.remove("active");
    customerSection.classList.add("active");
    toggleBtn.innerText = "Switch to Admin View";
    currentView = "customer";
  }
}

// Cart Management
function addToCart(itemId) {
  const item = menuItems.find((i) => i.id === itemId);
  const existingItem = cart.find((i) => i.id === itemId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  renderCart();
}

function renderCart() {
  const cartItemsContainer = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");

  if (cart.length === 0) {
    cartItemsContainer.innerHTML =
      '<p class="empty-cart-text">Your cart is empty.</p>';
    cartTotal.innerText = "R 0.00";
    return;
  }

  let total = 0;
  cartItemsContainer.innerHTML = cart
    .map((item) => {
      total += item.price * item.quantity;
      return `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong><br>
                    <small class="cart-item-details">R ${item.price.toFixed(2)} x ${item.quantity}</small>
                </div>
                <span>R ${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `;
    })
    .join("");

  cartTotal.innerText = `R ${total.toFixed(2)}`;
}

// Checkout / Place Order Process
function placeOrder() {
  if (cart.length === 0) {
    alert("Your cart is empty! Add some delicious food first.");
    return;
  }

  let orders = JSON.parse(localStorage.getItem("orders")) || [];

  const newOrder = {
    id: "#" + Math.floor(1000 + Math.random() * 9000),
    items: cart.map((i) => `${i.name} (${i.quantity})`).join(", "),
    total: document.getElementById("cartTotal").innerText,
    status: "Pending",
  };

  orders.push(newOrder);
  localStorage.setItem("orders", JSON.stringify(orders));

  cart = [];
  renderCart();
  alert(`Order Placed! ID: ${newOrder.id}. Check the Admin View to see it!`);
}

// Admin Dashboard Rendering
function renderAdminOrders() {
  const tableBody = document.getElementById("adminOrderTable");
  let orders = JSON.parse(localStorage.getItem("orders")) || [];

  if (orders.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#999;">No orders placed yet.</td></tr>`;
    return;
  }

  tableBody.innerHTML = orders
    .map(
      (order, index) => `
        <tr>
            <td><strong>${order.id}</strong></td>
            <td>${order.items}</td>
            <td style="font-weight:bold; color:var(--primary);">${order.total}</td>
            <td>
                <span class="status-badge ${order.status === "Pending" ? "status-pending" : "status-completed"}">
                    ${order.status}
                </span>
            </td>
            <td>
                ${
                  order.status === "Pending"
                    ? `<button class="action-btn complete mark-ready-btn" data-index="${index}">Mark Ready</button>`
                    : `<span style="color:#2ed573; font-weight:bold;">✓ Done</span>`
                }
            </td>
        </tr>
    `,
    )
    .join("");

  const readyButtons = tableBody.querySelectorAll(".mark-ready-btn");
  readyButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.target.getAttribute("data-index"));
      completeOrder(idx);
    });
  });
}

function completeOrder(index) {
  let orders = JSON.parse(localStorage.getItem("orders")) || [];
  orders[index].status = "Completed";
  localStorage.setItem("orders", JSON.stringify(orders));
  renderAdminOrders();
}

function clearAllOrders() {
  if (confirm("Are you sure you want to clear all order history?")) {
    localStorage.removeItem("orders");
    renderAdminOrders();
  }
}
