const API_URL = "/api/orders";
let previousOrderCount = 0;

const alertSound = new Audio(
  "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
);

async function checkOrderorders() {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "x-api-key": "Mzilikazikamashobane@574",
      },
    });
    const orders = await response.json();

    if (orders.length > previousOrderCount && previousOrderCount !== 0) {
      alertSound
        .play()
        .catch(() => console.log("Audio alert waiting for ueser interaction"));
    }

    previousOrderCount = orders.length;
    renderAdminTable(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
}

function renderAdminTable(orders) {
  const tableBody = document.getElementById("adminOrderTable");
  if (!tableBody) return;

  tableBody.innerHTML = "";
  if (orders.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#999;">No orders placed yet.</td></tr>`;
    return;
  }

  orders
    .slice()
    .reverse()
    .forEach((order) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td><strong>${order.orderId || order._id}</strong></td>
    <td>${new Date(order.creativeAt || Date.now()).toLocaleTimeString()}</td>
    <td>${order.items}</td>
    <td>${order.total}</td>
    <td>
      <button onClick ="printStoreReceipt('${order.orderId || order._id}', '${order.items.replace(/'/g, "\\'")}', '${order.total}')">Print</button>
      </td>`;
      tableBody.appendChild(row);
    });
}

window.printStoreReceipt = function (id, items, total) {
  const slipOrderId = document.getElementById("adminSlipId");
  const slipItems = document.getElementById("adminSlipItems");
  const slipTotal = document.getElementById("adminSlipTotal");

  if (slipOrderId) slipOrderId.innerText = id;
  if (slipItems) slipItems.innerText = items;
  if (slipTotal) slipTotal.innerText = total;

  const printModal = document.getElementById("adminPrintModal");
  if (printModal) printModal.classList.remove("hidden");

  window.print();

  if (printModal) printModal.classList.add("hidden");
};

// Sample menu array (replace or match with your menu items)
const menuItems = [
  { id: 1, name: "Gourmet Burger", price: 65.0 },
  { id: 2, name: "Large Slap Chips", price: 35.0 },
  { id: 3, name: "Spicy Chicken Wings", price: 55.0 },
  { id: 4, name: "Cold Soda 500ml", price: 18.0 },
];

let posCart = [];

// Render menu buttons on POS panel
function renderPOSMenu() {
  const container = document.getElementById("posMenuItems");
  if (!container) return;

  container.innerHTML = menuItems
    .map(
      (item) => `
    <button onclick="addToPOSCart('${item.name}', ${item.price})" 
            style="padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
      ${item.name}<br><strong>R${item.price.toFixed(2)}</strong>
    </button>
  `,
    )
    .join("");
}

// Add item to Walk-in Cart
window.addToPOSCart = function (name, price) {
  const existing = posCart.find((i) => i.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    posCart.push({ name, price, qty: 1 });
  }
  updatePOSCartUI();
};

// Update POS Cart Display
function updatePOSCartUI() {
  const list = document.getElementById("posCartList");
  const totalEl = document.getElementById("posTotal");

  if (posCart.length === 0) {
    list.innerHTML = "<li><em>Cart is empty</em></li>";
    totalEl.innerText = "0.00";
    return;
  }

  let total = 0;
  list.innerHTML = posCart
    .map((item) => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;
      return `<li>${item.name} x${item.qty} - R${itemTotal.toFixed(2)}</li>`;
    })
    .join("");

  totalEl.innerText = total.toFixed(2);
}

// Submit Walk-in Order to Database & Print Immediately
window.submitWalkInOrder = async function () {
  if (posCart.length === 0) {
    alert("Please add items to the cart first.");
    return;
  }

  const itemsString = posCart.map((i) => `${i.name} (${i.qty})`).join(", ");
  const totalString = `R ${document.getElementById("posTotal").innerText}`;

  const orderPayload = {
    items: itemsString,
    total: totalString,
    source: "Walk-In Counter",
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });

    const newOrder = await response.json();
    const orderId = newOrder.orderId || newOrder._id || "WALK-IN";

    // Print receipt immediately on counter printer
    printStoreReceipt(orderId, itemsString, totalString);

    // Reset POS Cart & Refresh Table
    posCart = [];
    updatePOSCartUI();
    checkOrderorders();
  } catch (error) {
    console.error("Walk-in order failed:", error);
    alert("Error placing walk-in order.");
  }
};

setInterval(checkOrderorders, 5000);
checkOrderorders();
document.addEventListener("DOMContentLoaded", renderPOSMenu);
