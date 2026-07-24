// CampusPay Staff Panel Controller & Interactions

const state = {
    isDarkMode: localStorage.getItem('campuspay-theme') === 'dark',
    currentTab: 'inventory',
    searchQuery: '',

    // Inventory Database
    inventory: JSON.parse(localStorage.getItem('campuspay-staff-inventory')) || [
        { name: "Beef Biryani", price: 120, stock: 45, status: "Available", imgKey: "beef" },
        { name: "Egg Sandwich", price: 45, stock: 4, status: "Low Stock", imgKey: "sandwich" },
        { name: "Lemon Iced Tea", price: 30, stock: 0, status: "Out of Stock", imgKey: "tea" },
        { name: "Fruit Platter", price: 60, stock: 12, status: "Available", imgKey: "fruit" }
    ],

    // Client tickets list
    orders: JSON.parse(localStorage.getItem('campuspay-staff-orders')) || [
        { id: "3024", studentId: "202114042", items: "Beef Biryani (1), Lemon Iced Tea (1)", total: 150, status: "Pending" },
        { id: "3023", studentId: "201914005", items: "Egg Sandwich (2)", total: 90, status: "Preparing" },
        { id: "3022", studentId: "202214112", items: "Fruit Platter (1)", total: 60, status: "Completed" }
    ],

    // Financial meters
    salesToday: parseFloat(localStorage.getItem('campuspay-staff-sales')) || 42850,
    itemsSoldToday: parseInt(localStorage.getItem('campuspay-staff-items-sold')) || 312
};

const imgPresets = {
    beef: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-QkqINRMSXiahFBH0DSMOrQZtz-39BLXcnhnHz_AUwL7dsyzJpgjWB_tSJ-0PckLA1HYCPyKPzHquVYCxGvmHmCT5hynCLiPwvM-G68-h097g3jsD8_dk2Uog89ngLc6xqa8fdx4afaMA4aMRp9N5OJo2mOSBw6qxnsener0BXnKTrmbElZk2Vru7pWAAU10U5gLbLgKDlhHhez5jIqk0nH6NLq9vuHog3lNrYg879-vUMGerre-PTZjdLzSzccQ6VAqUNhHPO5ah",
    sandwich: "https://lh3.googleusercontent.com/aida-public/AB6AXu2bMI-uy_O8zlZ2ji6TpCCJDE-Gu8hVTuwyNJ1phE7hchD-Yg09Vi1sszCPK05M1coqYgAELQFBqWCzxYDxPp9T9hRRq5r66NDvgHj7aV8d1bRyQ5ydD3UM1_10MpTta7VoPOAkSi6wJ8-9pO1EQIEwInjTz6di18sps6Pj7KrWYQP3Hd6j_xwUp7kU8FKhcpz_ac47NKt0Qh2FF7T7pTYVJeJeBoGA_Fvp0sNmTdES47HvKC8JQpo1IdNg2vW437b18SwaGkqlyMI",
    tea: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQzNlEzCOaJUub2pCNN5aCAQLGmVJ-xEPOIVohyGJnaITxgWUJFe8H2CNJuBrzsTz_mgMSdYXr0LGSzQ3d9hR1aQ0flPBi2LKWhmAlGTSOWoAP-6kZEYnEleo4CcLGrh_jJxpmKx6R9HMM_UoFYOBMcjtsF1vZtgc6ii0eEUYiZMJxQl28LLwj71s4FiNV3RXUINucrtGe9WMdZ_avWyS3WPD7-UgXDmy5dBc5aPe7byZQYs-vHFTgftcbT-abJo8a5xVPWgGUsk3H",
    fruit: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYs_D6OesKqUptG_XwL2JJJg2pSkrDwE0uDakSi7kZdSx3bbyy4EC5PHh5WqWWPJL-ENuYdx5XdTKx63D820jRxUiDrMvIzRRPUoaRhxApsvqimQ3kK_8Od0QaPaQGxYuy5GzwuEenIJIXTioakJYnYFlCc7vYm-lY_V6k-8j5bhW2TimSjsx1f4xddSXo4L7q9yPFmsTAnVLbTBI3_Gv49VylbPPGEVf2obo1_Y6abo-A2hNCv1J0KcBAlmDbZTsmRxUqq-RRPQEa"
};

// Sync database state to localStorage
function saveState() {
    localStorage.setItem('campuspay-staff-inventory', JSON.stringify(state.inventory));
    localStorage.setItem('campuspay-staff-orders', JSON.stringify(state.orders));
    localStorage.setItem('campuspay-staff-sales', state.salesToday.toString());
    localStorage.setItem('campuspay-staff-items-sold', state.itemsSoldToday.toString());
}

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initEventListeners();
    updateDashboardMeters();
    renderActiveTab();
    startLiveFeedSimulation();
});

// Theme Management
function initTheme() {
    const htmlEl = document.documentElement;
    if (state.isDarkMode) {
        htmlEl.classList.remove('light');
        htmlEl.classList.add('dark');
    } else {
        htmlEl.classList.remove('dark');
        htmlEl.classList.add('light');
    }
}

function toggleTheme() {
    state.isDarkMode = !state.isDarkMode;
    localStorage.setItem('campuspay-theme', state.isDarkMode ? 'dark' : 'light');
    initTheme();
    showToast(state.isDarkMode ? "Dark Theme Enabled 🌙" : "Light Theme Enabled ☀️", "info");
}

// SideNav Controls (Mobile Drawer navigation)
function openMobileNav() {
    const nav = document.getElementById("staff-sidebar");
    const backdrop = document.getElementById("mobile-nav-backdrop");
    if (!nav || !backdrop) return;

    backdrop.classList.remove("hidden");
    void backdrop.offsetWidth;
    backdrop.classList.remove("opacity-0");
    backdrop.classList.add("opacity-100");

    nav.classList.add("drawer-open");
}
function closeMobileNav() {
    const nav = document.getElementById("staff-sidebar");
    const backdrop = document.getElementById("mobile-nav-backdrop");
    if (!nav || !backdrop) return;

    nav.classList.remove("drawer-open");

    backdrop.classList.remove("opacity-100");
    backdrop.classList.add("opacity-0");
    setTimeout(() => {
        if (backdrop.classList.contains("opacity-0")) {
            backdrop.classList.add("hidden");
        }
    }, 300);
}

// Toast Widget Creator
function showToast(message, type = "info") {
    const container = document.getElementById("toast-wrapper");
    if (!container) return;

    const toast = document.createElement("div");
    let bgClass = "bg-white dark:bg-[#1a1c1e] text-on-surface dark:text-white border-outline-variant dark:border-[#2d3135]";
    let icon = "info";
    let iconColor = "text-primary dark:text-[#86d4d3]";

    if (type === "success") {
        bgClass = "bg-[#d1fae5] dark:bg-[#064e3b] text-[#065f46] dark:text-[#a7f3d0] border-[#a7f3d0]/30";
        icon = "check_circle";
        iconColor = "text-[#059669] dark:text-[#34d399]";
    } else if (type === "error") {
        bgClass = "bg-[#fee2e2] dark:bg-[#7f1d1d] text-[#991b1b] dark:text-[#fca5a5] border-[#fca5a5]/30";
        icon = "error";
        iconColor = "text-[#dc2626] dark:text-[#f87171]";
    }

    toast.className = `toast-item border flex items-center gap-3 p-4 rounded-xl shadow-lg pointer-events-auto max-w-sm ${bgClass}`;
    toast.innerHTML = `
        <span class="material-symbols-outlined ${iconColor}">${icon}</span>
        <p class="font-body-md text-body-md font-medium flex-1">${message}</p>
        <button class="toast-close-btn text-on-surface-variant hover:text-on-surface dark:hover:text-white transition-colors">
            <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector(".toast-close-btn");
    const removeToast = () => {
        if (toast.parentNode) {
            toast.classList.add("removing");
            toast.addEventListener("animationend", () => {
                toast.remove();
            });
        }
    };

    closeBtn?.addEventListener("click", removeToast);
    setTimeout(removeToast, 4000);
}

// Tab controller router
function switchTab(tabId) {
    state.currentTab = tabId;

    // Clear styles from all tabs buttons
    const tabButtons = document.querySelectorAll(".sidebar-tab-btn");
    tabButtons.forEach(btn => {
        btn.className = "sidebar-tab-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant dark:text-secondary-fixed-dim hover:bg-surface-container dark:hover:bg-[#202225] transition-all duration-200";
    });

    // Style active button
    const activeBtn = document.querySelector(`.sidebar-tab-btn[data-tab="${tabId}"]`);
    if (activeBtn) {
        activeBtn.className = "sidebar-tab-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all duration-200 text-primary dark:text-[#86d4d3] border-r-4 border-primary dark:border-[#86d4d3] bg-secondary-container/30 dark:bg-[#004f4f]/20";
    }

    // Toggle Tab content blocks
    const contentPanes = document.querySelectorAll(".tab-content-pane");
    contentPanes.forEach(pane => pane.classList.add("hidden"));

    const activePane = document.getElementById(`tab-content-${tabId}`);
    if (activePane) activePane.classList.remove("hidden");

    // Update Header Text Title
    const titleEl = document.getElementById("view-header-title");
    if (titleEl) {
        const titleMap = {
            dashboard: "Dashboard Summary",
            menu: "Canteen Food Menu",
            orders: "Pending Orders Ticket Queue",
            recharge: "Cash recharge Counter Desk",
            inventory: "Inventory Overview"
        };
        titleEl.innerText = titleMap[tabId] || "Canteen Portal";
    }

    renderActiveTab();
    closeMobileNav();
}

// Statistics Meters updater
function updateDashboardMeters() {
    const salesEl = document.getElementById("stat-sales");
    const unitsEl = document.getElementById("stat-items-sold");
    const stockEl = document.getElementById("stat-low-stock");
    const ordersEl = document.getElementById("stat-orders");

    if (salesEl) salesEl.innerText = `৳ ${state.salesToday.toLocaleString()}`;
    if (unitsEl) unitsEl.innerText = state.itemsSoldToday.toString();

    // Determine low stock count (inventory count with stock < 5)
    const lowStockCount = state.inventory.filter(i => i.stock < 5).length;
    if (stockEl) {
        stockEl.innerText = lowStockCount.toString().padStart(2, '0');
        // Visually flag if count > 0
        const parentCard = stockEl.closest(".glass-card");
        if (parentCard) {
            if (lowStockCount > 0) {
                parentCard.className = "glass-card p-stack-lg rounded-xl border-2 border-error-container bg-error-container/10 flex items-center gap-stack-lg shadow-sm";
            } else {
                parentCard.className = "glass-card bg-white dark:bg-[#1e2022] p-stack-lg rounded-xl flex items-center gap-stack-lg border border-outline-variant dark:border-[#2d3135] shadow-sm";
            }
        }
    }

    // Determine active orders count (status != completed)
    const pendingOrdersCount = state.orders.filter(o => o.status !== "Completed").length;
    if (ordersEl) ordersEl.innerText = pendingOrdersCount.toString().padStart(2, '0');
}

// Central dynamic renderer
function renderActiveTab() {
    // Save to localStorage whenever rendering is called (captures mutations)
    saveState();
    updateDashboardMeters();

    if (state.currentTab === "inventory") {
        renderInventoryTab();
    } else if (state.currentTab === "dashboard") {
        renderDashboardTab();
    } else if (state.currentTab === "menu") {
        renderMenuTab();
    } else if (state.currentTab === "orders") {
        renderOrdersTab();
    }
}

// ----------------------------------------------------
// TAB: INVENTORY
// ----------------------------------------------------
function renderInventoryTab() {
    const listBody = document.getElementById("table-body-inventory");
    if (!listBody) return;

    let filtered = state.inventory;
    if (state.searchQuery.trim() !== "") {
        const query = state.searchQuery.trim().toLowerCase();
        filtered = filtered.filter(i => i.name.toLowerCase().includes(query));
    }

    if (filtered.length === 0) {
        listBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-12 text-center text-on-surface-variant font-medium dark:text-gray-400">
                    No matching inventory items found.
                </td>
            </tr>
        `;
        return;
    }

    listBody.innerHTML = filtered.map((item, idx) => {
        let statusClass = "bg-green-150 text-green-800 dark:bg-green-900/35 dark:text-green-300";
        if (item.status === "Low Stock") {
            statusClass = "bg-amber-100 text-amber-800 dark:bg-amber-900/35 dark:text-amber-300";
        } else if (item.status === "Out of Stock") {
            statusClass = "bg-red-100 text-red-800 dark:bg-red-900/35 dark:text-red-300";
        }

        const imgUrl = imgPresets[item.imgKey] || imgPresets.beef;

        return `
            <tr class="hover:bg-surface-container-low dark:hover:bg-[#202123] transition-colors">
                <td class="px-container-margin py-4">
                    <div class="flex items-center gap-stack-md">
                        <div class="w-10 h-10 rounded-lg bg-cover bg-center shrink-0" style="background-image: url('${imgUrl}')"></div>
                        <span class="font-body-md text-sm font-semibold text-on-surface dark:text-white">${item.name}</span>
                    </div>
                </td>
                <td class="px-container-margin py-4 font-semibold text-sm">৳ ${item.price}</td>
                <td class="px-container-margin py-4 text-sm font-medium ${item.stock < 5 ? 'text-error font-extrabold' : ''}">${item.stock} units</td>
                <td class="px-container-margin py-4 select-none">
                    <span class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${statusClass}">${item.status}</span>
                </td>
                <td class="px-container-margin py-4 text-right select-none">
                    <div class="flex justify-end gap-2">
                        <button onclick="openEditItemModal(${idx})" class="p-1.5 hover:bg-primary-container/20 dark:hover:bg-[#004f4f]/30 rounded-md text-primary dark:text-[#86d4d3] transition-colors" title="Edit Parameters">
                            <span class="material-symbols-outlined text-[20px]">edit_note</span>
                        </button>
                        <button onclick="deleteInventoryItem(${idx})" class="p-1.5 hover:bg-error-container/20 rounded-md text-error transition-colors" title="Remove Item">
                            <span class="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                        <button onclick="toggleVisibilityItem(${idx})" class="p-1.5 hover:bg-secondary-container dark:hover:bg-[#2d3135] rounded-md text-on-surface-variant transition-colors" title="Toggle Visibility">
                            <span class="material-symbols-outlined text-[20px]">${item.status === 'Out of Stock' ? 'visibility_off' : 'visibility'}</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// ----------------------------------------------------
// TAB: DASHBOARD
// ----------------------------------------------------
const liveActivity = [
    "Student 202114042 purchased 1x Fresh Sandwich",
    "Credit sync Counter #1 complete.",
    "Database backup executed successfully.",
    "Student 202214112 paid ৳ 60 for Fruit Platter",
    "Restocked Beef Biryani +20 units."
];

function renderDashboardTab() {
    renderLiveFeed();
}

function renderLiveFeed() {
    const feed = document.getElementById("live-feed-container");
    if (!feed) return;

    if (feed.children.length === 0) {
        // Pre-populate mock feed logs
        feed.innerHTML = liveActivity.map((act, idx) => {
            const timeDiff = idx * 3 + 2;
            return `
                <div class="flex gap-stack-md items-start p-3 bg-surface-container-low dark:bg-[#202123] rounded-lg transition-colors hover:bg-surface-container dark:hover:bg-[#2d3135]">
                    <span class="material-symbols-outlined text-primary bg-primary-fixed-dim/35 p-2 rounded-full text-[18px]">nfc</span>
                    <div class="flex-1">
                        <p class="font-body-md text-xs font-semibold text-on-surface dark:text-gray-300">${act}</p>
                        <span class="text-[9px] text-on-surface-variant dark:text-gray-500">${timeDiff}m ago</span>
                    </div>
                </div>
            `;
        }).join("");
    }
}

window.refreshLiveFeed = function () {
    const feed = document.getElementById("live-feed-container");
    if (feed) {
        feed.innerHTML = "";
        renderLiveFeed();
        showToast("Live Activity feed refreshed.", "info");
    }
};

// ----------------------------------------------------
// TAB: FOOD MENU
// ----------------------------------------------------
function renderMenuTab() {
    const cardsGrid = document.getElementById("food-cards-grid");
    if (!cardsGrid) return;

    let filtered = state.inventory;
    if (state.searchQuery.trim() !== "") {
        const query = state.searchQuery.trim().toLowerCase();
        filtered = filtered.filter(i => i.name.toLowerCase().includes(query));
    }

    if (filtered.length === 0) {
        cardsGrid.innerHTML = `
            <div class="col-span-full py-12 text-center text-on-surface-variant dark:text-gray-400">
                No menu items matches the query.
            </div>
        `;
        return;
    }

    cardsGrid.innerHTML = filtered.map((item, idx) => {
        const imgUrl = imgPresets[item.imgKey] || imgPresets.beef;
        const availableClass = item.status === "Out of Stock" ? "brightness-50 opacity-60" : "";
        const badgeColor = item.status === "Available" ? "bg-emerald-150 text-emerald-800"
            : (item.status === "Low Stock" ? "bg-amber-100 text-amber-800" : "bg-gray-200 text-gray-700");

        return `
            <div class="bg-white dark:bg-[#1e2022] border border-outline-variant dark:border-[#2d3135] rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-primary transition-all">
                <div class="w-full h-44 bg-cover bg-center shrink-0 ${availableClass}" style="background-image: url('${imgUrl}')"></div>
                <div class="p-4 flex-1 flex flex-col justify-between gap-4">
                    <div>
                        <div class="flex justify-between items-start mb-1">
                            <h4 class="font-title-lg text-sm font-bold text-on-surface dark:text-white leading-snug">${item.name}</h4>
                            <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${badgeColor} select-none">${item.status}</span>
                        </div>
                        <p class="font-extrabold text-sm text-[16px] text-primary dark:text-[#86d4d3]">৳ ${item.price.toFixed(2)}</p>
                    </div>
                    <div class="flex items-center gap-2 select-none">
                        <input type="number" onchange="quickUpdatePrice(${idx}, this.value)" min="5" max="2000" class="w-20 h-9 bg-surface-container-low dark:bg-[#2c2d30] border border-outline-variant dark:border-[#3a3d40] rounded text-xs px-2 text-center text-on-surface dark:text-white" value="${item.price}" />
                        <span class="text-[10px] text-on-surface-variant dark:text-gray-400">Price Adjust</span>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

window.quickUpdatePrice = function (index, value) {
    const val = parseFloat(value);
    if (isNaN(val) || val <= 0) return;

    state.inventory[index].price = val;
    renderActiveTab();
    showToast(`Price updated for ${state.inventory[index].name}.`, "success");
};

// ----------------------------------------------------
// TAB: ORDERS
// ----------------------------------------------------
function renderOrdersTab() {
    const listBody = document.getElementById("table-body-orders");
    const countEl = document.getElementById("orders-badge-count");
    if (!listBody) return;

    let filtered = state.orders;
    if (state.searchQuery.trim() !== "") {
        const query = state.searchQuery.trim().toLowerCase();
        filtered = filtered.filter(o => o.studentId.includes(query) || o.id.includes(query));
    }

    const pendingOrdersCount = state.orders.filter(o => o.status !== "Completed").length;
    if (countEl) countEl.innerText = `${pendingOrdersCount} Active`;

    if (filtered.length === 0) {
        listBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-on-surface-variant dark:text-gray-400">
                    No student orders logged.
                </td>
            </tr>
        `;
        return;
    }

    listBody.innerHTML = filtered.map(ord => {
        let statusBadge = "";
        let actions = "";

        if (ord.status === "Pending") {
            statusBadge = `<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-900/35 dark:text-amber-300">Pending</span>`;
            actions = `<button onclick="advanceOrderStatus('${ord.id}', 'Preparing')" class="px-3 py-1.5 bg-primary dark:bg-primary-container text-on-primary dark:text-[#86d4d3] rounded-lg text-xs font-bold hover:brightness-105 active:scale-95 transition-all">Prepare</button>`;
        } else if (ord.status === "Preparing") {
            statusBadge = `<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 dark:bg-blue-900/35 dark:text-blue-300">Preparing</span>`;
            actions = `<button onclick="advanceOrderStatus('${ord.id}', 'Completed')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold hover:brightness-105 active:scale-95 transition-all">Serve</button>`;
        } else {
            statusBadge = `<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-[#1a4a2a] dark:text-[#81c784]">Completed</span>`;
            actions = `<span class="text-xs text-on-surface-variant dark:text-gray-500 font-semibold select-none">Dispensed</span>`;
        }

        return `
            <tr class="hover:bg-surface-container-low dark:hover:bg-[#202123] transition-colors">
                <td class="px-6 py-4 font-bold text-sm">#ORD-${ord.id}</td>
                <td class="px-6 py-4 text-sm font-semibold">${ord.studentId}</td>
                <td class="px-6 py-4 text-xs font-medium text-on-surface-variant dark:text-[#bec8c8]">${ord.items}</td>
                <td class="px-6 py-4 font-extrabold text-sm text-primary dark:text-[#86d4d3]">৳ ${ord.total.toFixed(2)}</td>
                <td class="px-6 py-4 select-none">${statusBadge}</td>
                <td class="px-6 py-4 text-right">${actions}</td>
            </tr>
        `;
    }).join("");
}

window.advanceOrderStatus = function (id, nextStatus) {
    const ticket = state.orders.find(o => o.id === id);
    if (!ticket) return;

    ticket.status = nextStatus;

    if (nextStatus === "Completed") {
        state.salesToday += parseFloat(ticket.total);
        state.itemsSoldToday += 1;
        showToast(`Order #${ticket.id} served successfully! Ticket closed.`, "success");
    } else {
        showToast(`Order #${ticket.id} is now preparing.`, "info");
    }

    renderActiveTab();
};

// ----------------------------------------------------
// INVENTORY MUTATORS ACTIONS
// ----------------------------------------------------

window.deleteInventoryItem = function (index) {
    const item = state.inventory[index];
    if (confirm(`Are you sure you want to remove ${item.name} from the database?`)) {
        state.inventory.splice(index, 1);
        renderActiveTab();
        showToast(`${item.name} deleted successfully from canteen roster.`, "success");
    }
};

window.toggleVisibilityItem = function (index) {
    const item = state.inventory[index];
    if (item.status === "Out of Stock") {
        item.status = item.stock > 0 ? "Available" : "Low Stock";
        if (item.stock === 0) item.stock = 10; // Auto replenishment
    } else {
        item.status = "Out of Stock";
        item.stock = 0;
    }
    renderActiveTab();
    showToast(`Visibility scope toggled for ${item.name}.`, "info");
};

// Modals management
window.openEditItemModal = function (index) {
    const item = state.inventory[index];
    if (!item) return;

    const modal = document.getElementById("modal-edit-item");
    const indexInput = document.getElementById("edit-item-index");
    const nameEl = document.getElementById("edit-item-title-name");
    const priceInput = document.getElementById("edit-item-price");
    const stockInput = document.getElementById("edit-item-stock");

    if (!modal || !indexInput || !nameEl || !priceInput || !stockInput) return;

    indexInput.value = index;
    nameEl.innerText = item.name;
    priceInput.value = item.price;
    stockInput.value = item.stock;

    modal.classList.add("modal-open");
    modal.classList.remove("hidden");
    void modal.offsetWidth;
    modal.classList.add("opacity-100");
    priceInput.focus();
};

function closeEditItemModal() {
    const modal = document.getElementById("modal-edit-item");
    if (modal) {
        modal.classList.remove("opacity-100");
        setTimeout(() => {
            if (!modal.classList.contains("opacity-100")) {
                modal.classList.add("hidden");
                modal.classList.remove("modal-open");
            }
        }, 250);
    }
}

function openAddItemModal() {
    const modal = document.getElementById("modal-add-item");
    if (!modal) return;

    // Reset inputs
    document.getElementById("form-add-item").reset();

    modal.classList.add("modal-open");
    modal.classList.remove("hidden");
    void modal.offsetWidth;
    modal.classList.add("opacity-100");
    document.getElementById("add-item-name").focus();
}

function closeAddItemModal() {
    const modal = document.getElementById("modal-add-item");
    if (modal) {
        modal.classList.remove("opacity-100");
        setTimeout(() => {
            if (!modal.classList.contains("opacity-100")) {
                modal.classList.add("hidden");
                modal.classList.remove("modal-open");
            }
        }, 250);
    }
}

// ----------------------------------------------------
// BIND GLOBAL EVENT LISTENERS
// ----------------------------------------------------
function initEventListeners() {
    // 1. Sidebar tab selection
    const tabButtons = document.querySelectorAll(".sidebar-tab-btn");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const dest = btn.getAttribute("data-tab");
            switchTab(dest);
        });
    });

    // 2. Global search engine query
    const searchInput = document.getElementById("staff-global-search");
    searchInput?.addEventListener("input", (e) => {
        state.searchQuery = e.target.value;
        renderActiveTab();
    });

    // 3. Modals Submit rules
    const formAdd = document.getElementById("form-add-item");
    formAdd?.addEventListener("submit", (e) => {
        e.preventDefault();
        const nameVal = document.getElementById("add-item-name").value.trim();
        const priceVal = parseFloat(document.getElementById("add-item-price").value);
        const stockVal = parseInt(document.getElementById("add-item-stock").value);
        const imgVal = document.getElementById("add-item-img").value;

        if (state.inventory.some(i => i.name.toLowerCase() === nameVal.toLowerCase())) {
            showToast("Item already exists in roster database!", "error");
            return;
        }

        const nextStatus = stockVal === 0 ? "Out of Stock" : (stockVal < 5 ? "Low Stock" : "Available");

        state.inventory.push({
            name: nameVal,
            price: priceVal,
            stock: stockVal,
            status: nextStatus,
            imgKey: imgVal
        });

        closeAddItemModal();
        renderActiveTab();
        showToast(`${nameVal} successfully added to database.`, "success");
    });

    const formEdit = document.getElementById("form-edit-item");
    formEdit?.addEventListener("submit", (e) => {
        e.preventDefault();
        const index = parseInt(document.getElementById("edit-item-index").value);
        const priceVal = parseFloat(document.getElementById("edit-item-price").value);
        const stockVal = parseInt(document.getElementById("edit-item-stock").value);

        if (isNaN(index) || !state.inventory[index]) return;

        const item = state.inventory[index];
        item.price = priceVal;
        item.stock = stockVal;
        item.status = stockVal === 0 ? "Out of Stock" : (stockVal < 5 ? "Low Stock" : "Available");

        closeEditItemModal();
        renderActiveTab();
        showToast(`Stock levels successfully adjusted for ${item.name}.`, "success");
    });

    // Submitting Counter direct staff recharge
    const formRecharge = document.getElementById("form-counter-recharge");
    formRecharge?.addEventListener("submit", (e) => {
        e.preventDefault();
        const studentIdVal = document.getElementById("recharge-student-id").value.trim();
        const cashAmt = parseFloat(document.getElementById("recharge-cash-val").value);

        if (studentIdVal === "" || isNaN(cashAmt) || cashAmt <= 0) return;

        // If target ID matches student user, recharge their localStorage campuspay-balance directly!
        if (studentIdVal === "202114042") {
            const curBal = parseFloat(localStorage.getItem('campuspay-balance')) || 500.00;
            const nextBal = curBal + cashAmt;
            localStorage.setItem('campuspay-balance', nextBal.toFixed(2));

            // Add a pending recharge verification log history so they see it
            const reqs = JSON.parse(localStorage.getItem('campuspay-recharge-requests')) || [];
            reqs.push({
                id: Date.now().toString(),
                method: "Cash Desk",
                amount: cashAmt,
                txid: `CASH-${Date.now().toString().slice(-6)}`,
                date: "Oct 14, 2026",
                status: "Approved"
            });
            localStorage.setItem('campuspay-recharge-requests', JSON.stringify(reqs));
        }

        formRecharge.reset();
        showToast(`Dispensed cash recharge to Roll ID ${studentIdVal} for ৳ ${cashAmt.toFixed(2)}.`, "success");
    });

    // 4. Modal buttons click overlays
    const openAddBtn = document.getElementById("btn-add-item-modal");
    openAddBtn?.addEventListener("click", openAddItemModal);

    const fabAdd = document.getElementById("fab-add-item");
    fabAdd?.addEventListener("click", openAddItemModal);

    const addCloseBtn = document.getElementById("modal-add-close");
    addCloseBtn?.addEventListener("click", closeAddItemModal);

    const editCloseBtn = document.getElementById("modal-edit-close");
    editCloseBtn?.addEventListener("click", closeEditItemModal);

    const modalAdd = document.getElementById("modal-add-item");
    modalAdd?.addEventListener("click", (e) => {
        if (e.target === modalAdd) closeAddItemModal();
    });

    const modalEdit = document.getElementById("modal-edit-item");
    modalEdit?.addEventListener("click", (e) => {
        if (e.target === modalEdit) closeEditItemModal();
    });

    // 5. Theme triggers
    const themeBtn = document.getElementById("theme-toggle");
    themeBtn?.addEventListener("click", toggleTheme);

    // 6. Mobile SideNav responsive drawer toggle
    const menuBtn = document.getElementById("staff-menu-toggle-btn");
    menuBtn?.addEventListener("click", openMobileNav);

    const drawerBackdrop = document.getElementById("mobile-nav-backdrop");
    drawerBackdrop?.addEventListener("click", closeMobileNav);
}

// ----------------------------------------------------
// SIMULATE DYNAMIC ACTIVITIES FEED
// ----------------------------------------------------
function startLiveFeedSimulation() {
    const feed = document.getElementById("live-feed-container");
    if (!feed) return;

    const mockPurchases = [
        "Student 202314055 paid ৳ 45 for Egg Sandwich",
        "Student 202014022 paid ৳ 120 for Beef Biryani",
        "Student 202114001 paid ৳ 30 for Lemon Iced Tea",
        "Cashier counter cash sync dispatched to admin."
    ];

    let pIdx = 0;
    setInterval(() => {
        if (state.currentTab === "dashboard") {
            const feedEl = document.getElementById("live-feed-container");
            if (!feedEl) return;

            const div = document.createElement("div");
            div.className = "flex gap-stack-md items-start p-3 bg-primary-container/10 dark:bg-[#004f4f]/10 rounded-lg animate-pulse";
            div.innerHTML = `
                <span class="material-symbols-outlined text-primary bg-primary-fixed-dim/35 p-2 rounded-full text-[18px]">nfc</span>
                <div class="flex-1">
                    <p class="font-body-md text-xs font-bold text-primary dark:text-[#86d4d3]">${mockPurchases[pIdx % mockPurchases.length]}</p>
                    <span class="text-[9px] text-on-surface-variant dark:text-gray-500">Just now</span>
                </div>
            `;
            feedEl.prepend(div);

            setTimeout(() => {
                div.classList.remove("animate-pulse");
            }, 2000);

            // Limit logs displayed in list to 10
            if (feedEl.children.length > 10) {
                feedEl.lastElementChild.remove();
            }

            pIdx++;
        }
    }, 9000);
}
