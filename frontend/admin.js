const API_URL = "/api/orders";
let previousOrderCount = 0;

const alertSound = new Audio(
  "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
);

async function checkOrderorders() {
  try {
    const response = await fetch(API_URL);
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

setInterval(checkOrderorders, 5000);
checkOrderorders();
