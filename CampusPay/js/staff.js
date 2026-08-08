// CampusPay Kitchen Staff Dashboard Controller & Interactions

function getNextGlobalOrderId() {
    let current = parseInt(localStorage.getItem('campuspay-global-order-counter')) || 3030;
    try {
        const staffOrders = JSON.parse(localStorage.getItem('campuspay-staff-orders')) || [];
        const existingIds = staffOrders.map(o => parseInt(o.id)).filter(n => !isNaN(n));
        if (existingIds.length > 0) {
            const maxExisting = Math.max(...existingIds);
            if (maxExisting >= current) {
                current = maxExisting + 1;
            }
        }
    } catch (e) {}
    const nextId = current;
    localStorage.setItem('campuspay-global-order-counter', (nextId + 1).toString());
    return nextId.toString();
}

function getInitialOrders() {
    const defaultOrders = [
        {
            id: "3024",
            studentName: "Tanvir Ahmed",
            studentId: "202114042",
            orderTime: Date.now() - 360000, // 6 mins ago
            items: [
                { name: "Crispy Chicken Burger", qty: 2, tags: ["Bestseller"] },
                { name: "French Fries", qty: 1, tags: ["Vegetarian"] },
                { name: "Fresh Lemon Iced Tea", qty: 2, tags: ["Refreshing"] }
            ],
            specialNote: "No mayonnaise, extra crispy fries",
            total: 320,
            payment: "Paid",
            pickupType: "Counter Pickup",
            status: "Preparing",
            isPinned: true,
            statusHistory: [
                { status: "Pending", time: "11:45 AM" },
                { status: "Accepted", time: "11:46 AM" },
                { status: "Preparing", time: "11:47 AM" }
            ]
        },
        {
            id: "3023",
            studentName: "Nusrat Jahan",
            studentId: "201914005",
            orderTime: Date.now() - 780000, // 13 mins ago
            items: [
                { name: "Beef Kacchi Biryani", qty: 1, tags: ["Chef Special"] },
                { name: "Double Egg Toast Sandwich", qty: 2, tags: ["Quick Snack"] }
            ],
            specialNote: "Less spicy, extra salad",
            total: 280,
            payment: "Paid",
            pickupType: "Counter Pickup",
            status: "Accepted",
            isPinned: false,
            statusHistory: [
                { status: "Pending", time: "11:38 AM" },
                { status: "Accepted", time: "11:40 AM" }
            ]
        },
        {
            id: "3022",
            studentName: "Rafi Hossain",
            studentId: "202214112",
            orderTime: Date.now() - 960000, // 16 mins ago
            items: [
                { name: "Japanese Chicken Katsu Curry", qty: 2, tags: ["New Item"] },
                { name: "Fresh Lemon Iced Tea", qty: 2, tags: ["Refreshing"] }
            ],
            specialNote: "Pack curry separately",
            total: 520,
            payment: "Paid",
            pickupType: "Parcel",
            status: "Ready for Pickup",
            isPinned: false,
            statusHistory: [
                { status: "Pending", time: "11:32 AM" },
                { status: "Accepted", time: "11:34 AM" },
                { status: "Preparing", time: "11:36 AM" },
                { status: "Ready for Pickup", time: "11:44 AM" }
            ]
        }
    ];

    try {
        const raw = localStorage.getItem('campuspay-staff-orders');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                const active = parsed.filter(o => o.status !== "Completed" && o.status !== "Delivered" && o.status !== "Cancelled");
                if (active.length > 0) {
                    return parsed;
                }
            }
        }
    } catch (e) {}

    return defaultOrders;
}

const state = {
    isDarkMode: localStorage.getItem('campuspay-theme') === 'dark',
    currentTab: 'active-orders', // Default to Glanceable Active Orders Queue
    searchQuery: '',
    selectedStatusFilter: 'All',
    isKitchenOpen: JSON.parse(localStorage.getItem('campuspay-kitchen-open') ?? 'true'),
    isAudioMuted: JSON.parse(localStorage.getItem('campuspay-audio-muted') ?? 'false'),
    isBatchCookingView: false,
    isOnlineOrdersPaused: false,

    // Undo Stack for last status change
    lastStatusChange: null,

    // Grid Column Selector state (2, 3, or 4 cols)
    gridCols: parseInt(localStorage.getItem('campuspay-queue-grid-cols')) || 3,

    // 10 Decorative Canteen Food Items
    foodMenu: JSON.parse(localStorage.getItem('campuspay-canteen-menu')) || [
        {
            id: "m1",
            name: "Beef Kacchi Biryani",
            category: "Main Course",
            price: 180,
            stock: 45,
            status: "Available",
            prepTime: "12 mins",
            rating: "4.9 ⭐",
            tags: ["Chef Special", "Popular"],
            desc: "Aromatic Basmati rice cooked with tender marinated beef & served with Borhani.",
            img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80"
        },
        {
            id: "m2",
            name: "Crispy Chicken Burger",
            category: "Fast Food",
            price: 120,
            stock: 32,
            status: "Available",
            prepTime: "8 mins",
            rating: "4.8 ⭐",
            tags: ["Bestseller", "Crispy"],
            desc: "Double crisp fried chicken patty topped with melted cheddar cheese & fresh lettuce.",
            img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80"
        },
        {
            id: "m3",
            name: "Double Egg Toast Sandwich",
            category: "Breakfast",
            price: 50,
            stock: 15,
            status: "Available",
            prepTime: "5 mins",
            rating: "4.6 ⭐",
            tags: ["Halal", "Quick Snack"],
            desc: "Golden toasted whole wheat bread filled with fluffy spiced egg omelette.",
            img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80"
        },
        {
            id: "m4",
            name: "MIST Signature Cold Coffee",
            category: "Beverages",
            price: 70,
            stock: 25,
            status: "Available",
            prepTime: "3 mins",
            rating: "4.9 ⭐",
            tags: ["Vegetarian", "Popular"],
            desc: "Rich espresso blended with chilled milk, ice cream & chocolate drizzle.",
            img: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80"
        },
        {
            id: "m5",
            name: "Fresh Lemon Iced Tea",
            category: "Beverages",
            price: 40,
            stock: 40,
            status: "Available",
            prepTime: "2 mins",
            rating: "4.7 ⭐",
            tags: ["Vegetarian", "Refreshing"],
            desc: "House-brewed tea chilled over ice with fresh squeezed lemon & mint leaves.",
            img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80"
        },
        {
            id: "m6",
            name: "Seasonal Fruit Platter",
            category: "Healthy",
            price: 80,
            stock: 12,
            status: "Low Stock",
            prepTime: "4 mins",
            rating: "4.5 ⭐",
            tags: ["Healthy", "Vegetarian"],
            desc: "Fresh sliced seasonal papaya, apple, guava, & watermelon platter.",
            img: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=80"
        },
        {
            id: "m7",
            name: "Japanese Chicken Katsu Curry",
            category: "Main Course",
            price: 220,
            stock: 18,
            status: "Available",
            prepTime: "15 mins",
            rating: "4.9 ⭐",
            tags: ["Halal", "New Item"],
            desc: "Crispy panko-breaded chicken cutlet with savoury Japanese curry & rice.",
            img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80"
        },
        {
            id: "m8",
            name: "Creamy Pasta Alfredo",
            category: "Italian",
            price: 150,
            stock: 20,
            status: "Available",
            prepTime: "10 mins",
            rating: "4.7 ⭐",
            tags: ["Vegetarian", "Comfort Food"],
            desc: "Penne pasta tossed in garlic parmesan white cream sauce with herbs.",
            img: "https://images.unsplash.com/photo-1621996346565-e3d5d6281273?w=500&auto=format&fit=crop&q=80"
        },
        {
            id: "m9",
            name: "Singara & Samosa Combo",
            category: "Snacks",
            price: 30,
            stock: 50,
            status: "Available",
            prepTime: "2 mins",
            rating: "4.8 ⭐",
            tags: ["Halal", "Canteen Classic"],
            desc: "Piping hot spiced potato singara & crispy minced chicken samosa duo.",
            img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80"
        },
        {
            id: "m10",
            name: "Warm Chocolate Fudge Brownie",
            category: "Desserts",
            price: 90,
            stock: 0,
            status: "Out of Stock",
            prepTime: "3 mins",
            rating: "4.9 ⭐",
            tags: ["Dessert", "Vegetarian"],
            desc: "Decadent dark chocolate fudge brownie warmed & drizzled with hot syrup.",
            img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80"
        }
    ],

    // Kitchen Active Orders Database (Loaded via getInitialOrders())
    orders: getInitialOrders(),

    // Raw Ingredients Stock Database
    inventory: JSON.parse(localStorage.getItem('campuspay-kitchen-inventory')) || [
        { name: "Chicken", stock: 5, unit: "kg", isLow: true, history: ["Stock updated to 5kg on Oct 14"] },
        { name: "Eggs", stock: 18, unit: "pcs", isLow: true, history: ["Restocked 30 pcs on Oct 12"] },
        { name: "Rice", stock: 10, unit: "kg", isLow: true, history: ["Initial stock 10kg"] },
        { name: "Cooking Oil", stock: 2, unit: "L", isLow: true, history: ["Running low warning triggered"] },
        { name: "Beef Meat", stock: 25, unit: "kg", isLow: false, history: ["Restocked 25kg on Oct 14"] },
        { name: "Potatoes", stock: 40, unit: "kg", isLow: false, history: ["Stock healthy"] },
        { name: "Burger Buns", stock: 48, unit: "pcs", isLow: false, history: ["Restocked 50 pcs"] },
        { name: "Cold Coffee Beans", stock: 8, unit: "kg", isLow: false, history: ["Stock healthy"] }
    ],

    // Notifications Feed
    notifications: [
        { id: 1, title: "New Order Received", msg: "Order #1032 placed by Farhan Ahmed", time: "1m ago", type: "order", unread: true },
        { id: 2, title: "Faculty Priority Order", msg: "Order #1028 placed by Prof. Mahir Faisal", time: "2m ago", type: "order", unread: true },
        { id: 3, title: "Inventory Alert", msg: "Cooking Oil running low (2 L left)", time: "15m ago", type: "alert", unread: true }
    ],

    // Activity Timeline
    activityTimeline: [
        { title: "Order #1024 Preparing", detail: "Chef Kabir started cooking 2x Crispy Chicken Burgers", time: "11:47 AM", icon: "soup_kitchen", color: "text-amber-500" },
        { title: "Order #1026 Ready", detail: "Prepared by Kitchen Team", time: "11:44 AM", icon: "task_alt", color: "text-emerald-500" },
        { title: "Order #1031 Accepted", detail: "Moved to active queue", time: "11:42 AM", icon: "check_circle", color: "text-[#3b82f6]" }
    ],

    // Daily Metrics Summary
    dailyMetrics: {
        cancelledOrders: 1,
        averagePrepMinutes: 7.5,
        mostOrderedMeal: "Crispy Chicken Burger (48 units)"
    },

    // Child Branch Operations Database (Single Branch: MIST Old Cafe)
    selectedBranchId: "BR-01",
    branches: [
        {
            id: "BR-01",
            name: "MIST Old Cafe",
            manager: "Capt. Tanvir Ahmed",
            contact: "+880 1711-998822",
            address: "Infront of Architecture building, Mirpur Cantonment, Dhaka 1206",
            status: "Open",
            lastSync: "2 mins ago",
            mealsSent: 485,
            mealsSentValue: 68450,
            pendingDispatches: 3,
            inTransit: 2,
            receivedToday: 14,
            returnsCount: 2,
            wastagePercent: 1.8,
            bestSeller: "Chicken Kacchi Biryani",
            salesToday: 52100,
            transactionsCount: 248,
            avgOrderVal: 210,
            leastSold: "Egg Curry",
            weeklyRev: 342000,
            inventory: [],
            dispatches: [
                { id: "DISP-9041", time: "08:30 AM", itemsCount: 4, totalQty: 120, totalVal: 16800, prepBy: "Chef Kabir", delBy: "Selim (Kitchen Staff)", status: "Received" },
                { id: "DISP-9042", time: "11:15 AM", itemsCount: 3, totalQty: 95, totalVal: 14200, prepBy: "Chef Hasan", delBy: "Rafiq (Kitchen Staff)", status: "Dispatched" },
                { id: "DISP-9043", time: "01:45 PM", itemsCount: 5, totalQty: 150, totalVal: 22400, prepBy: "Chef Kabir", delBy: "Selim (Kitchen Staff)", status: "Dispatched" },
                { id: "DISP-9044", time: "03:20 PM", itemsCount: 2, totalQty: 60, totalVal: 8400, prepBy: "Chef Nabil", delBy: "Rafiq (Kitchen Staff)", status: "Preparing" }
            ],
            pendingRequests: [
                { id: "REQ-301", by: "Supervisor Sifat", time: "02:15 PM", items: "Cold Coffee & Brownies", qty: 45, priority: "URGENT", status: "Pending Approval" },
                { id: "REQ-302", by: "Capt. Tanvir Ahmed", time: "04:00 PM", items: "Chicken Biryani Extra Batch", qty: 60, priority: "HIGH", status: "Pending Approval" }
            ],
            returns: []
        }
    ]
};

let orderCounter = 1033;

// Web Audio API Chime Synthesizer
function playAudioChime(type = "new_order") {
    if (state.isAudioMuted) return;
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === "new_order") {
            osc.type = "sine";
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } else if (type === "status_change") {
            osc.type = "triangle";
            osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
            osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } else if (type === "counter_alert") {
            osc.type = "square";
            osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
            osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.2); // C6
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
            osc.start();
            osc.stop(ctx.currentTime + 0.6);
        }
    } catch (e) {
        console.warn("Audio playback context failed", e);
    }
}

// Sync database state to localStorage
function saveState() {
    localStorage.setItem('campuspay-staff-orders', JSON.stringify(state.orders));
    localStorage.setItem('campuspay-canteen-menu', JSON.stringify(state.foodMenu));
    localStorage.setItem('campuspay-kitchen-inventory', JSON.stringify(state.inventory));
    localStorage.setItem('campuspay-kitchen-open', JSON.stringify(state.isKitchenOpen));
    localStorage.setItem('campuspay-audio-muted', JSON.stringify(state.isAudioMuted));
}

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initClock();
    initEventListeners();
    updateKitchenStatusUI();
    updateAudioMuteUI();
    switchTab(state.currentTab);
    startLiveTimerLoop();
});

// Real-time Clock Initialization & Rush Hour Countdown
function initClock() {
    const clockEl = document.getElementById("header-realtime-clock");
    const dateEl = document.getElementById("header-realtime-date");
    const rushTimerEl = document.getElementById("rush-hour-timer");

    let secondsToRush = 1470; // 24m 30s

    function update() {
        const now = new Date();
        if (clockEl) {
            clockEl.innerText = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
        if (dateEl) {
            dateEl.innerText = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        }

        if (rushTimerEl) {
            if (secondsToRush > 0) secondsToRush--;
            const hrs = Math.floor(secondsToRush / 3600);
            const mins = Math.floor((secondsToRush % 3600) / 60);
            const secs = secondsToRush % 60;
            rushTimerEl.innerText = `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
        }
    }
    update();
    setInterval(update, 1000);
}

// Live timer update loop for order cards count-up
function startLiveTimerLoop() {
    setInterval(() => {
        const timerElements = document.querySelectorAll(".order-live-timer");
        timerElements.forEach(el => {
            const startTime = parseInt(el.getAttribute("data-starttime"));
            if (startTime) {
                const elapsedMs = Date.now() - startTime;
                const totalSec = Math.floor(elapsedMs / 1000);
                const mins = Math.floor(totalSec / 60);
                const secs = totalSec % 60;
                el.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

                // Flag overdue if > 10 mins (600 sec)
                const card = el.closest(".order-card");
                if (card && mins >= 10 && !card.classList.contains("order-card-delivered") && !card.classList.contains("order-card-cancelled")) {
                    card.classList.add("order-card-overdue");
                    const overdueBadge = card.querySelector(".overdue-flag");
                    if (overdueBadge) overdueBadge.classList.remove("hidden");
                }
            }
        });
    }, 1000);
}

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

// Kitchen Open / Closed Toggle
window.toggleKitchenStatus = function () {
    state.isKitchenOpen = !state.isKitchenOpen;
    saveState();
    updateKitchenStatusUI();
    showToast(state.isKitchenOpen ? "Kitchen Status: OPEN for Orders 🟢" : "Kitchen Status: CLOSED 🔴", state.isKitchenOpen ? "success" : "error");
};

function updateKitchenStatusUI() {
    const pill = document.getElementById("kitchen-status-pill");
    const beacon = document.getElementById("kitchen-status-beacon");
    const text = document.getElementById("kitchen-status-text");
    const track = document.getElementById("kitchen-switch-track");
    const knob = document.getElementById("kitchen-switch-knob");
    const icon = document.getElementById("kitchen-switch-icon");

    if (!pill) return;

    if (state.isKitchenOpen) {
        if (pill) pill.className = "px-2.5 py-1 rounded-full text-[11px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 whitespace-nowrap transition-all duration-300";
        if (beacon) beacon.className = "w-2 h-2 rounded-full bg-emerald-500 animate-ping";
        if (text) text.innerText = "KITCHEN OPEN";
        if (track) track.className = "relative inline-flex h-6 w-11 items-center rounded-full p-0.5 transition-colors duration-300 bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm shrink-0";
        if (knob) knob.className = "inline-flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out translate-x-5";
        if (icon) {
            icon.className = "material-symbols-outlined text-[12px] font-bold text-emerald-600";
            icon.innerText = "check";
        }
    } else {
        if (pill) pill.className = "px-2.5 py-1 rounded-full text-[11px] font-black uppercase bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 flex items-center gap-1.5 whitespace-nowrap transition-all duration-300";
        if (beacon) beacon.className = "w-2 h-2 rounded-full bg-red-500";
        if (text) text.innerText = "KITCHEN CLOSED";
        if (track) track.className = "relative inline-flex h-6 w-11 items-center rounded-full p-0.5 transition-colors duration-300 bg-gradient-to-r from-red-500 to-rose-600 shadow-sm shrink-0";
        if (knob) knob.className = "inline-flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out translate-x-0";
        if (icon) {
            icon.className = "material-symbols-outlined text-[12px] font-bold text-red-600";
            icon.innerText = "close";
        }
    }
}

// Audio Mute Toggle
window.toggleAudioMute = function () {
    state.isAudioMuted = !state.isAudioMuted;
    saveState();
    updateAudioMuteUI();
    showToast(state.isAudioMuted ? "Audio Notifications Muted 🔇" : "Audio Notifications Enabled 🔊", "info");
};

function updateAudioMuteUI() {
    const btn = document.getElementById("btn-toggle-audio");
    if (!btn) return;
    btn.innerHTML = state.isAudioMuted 
        ? `<span class="material-symbols-outlined text-red-500">volume_off</span>`
        : `<span class="material-symbols-outlined text-primary dark:text-[#86d4d3]">volume_up</span>`;
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

// Toast Widget Creator with optional Undo action
function showToast(message, type = "info", undoCallback = null) {
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

    const undoBtnHTML = undoCallback ? `
        <button id="toast-undo-btn" class="px-3 py-1 bg-white/20 hover:bg-white/30 text-current text-xs font-black rounded-lg transition-all underline shrink-0 ml-1">
            UNDO
        </button>
    ` : '';

    toast.className = `toast-item border flex items-center gap-3 p-4 rounded-xl shadow-xl pointer-events-auto max-w-sm ${bgClass}`;
    toast.innerHTML = `
        <span class="material-symbols-outlined ${iconColor}">${icon}</span>
        <p class="font-body-md text-xs font-bold flex-1 leading-snug">${message}</p>
        ${undoBtnHTML}
        <button class="toast-close-btn text-on-surface-variant hover:text-on-surface dark:hover:text-white transition-colors">
            <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
    `;

    container.appendChild(toast);

    if (undoCallback) {
        const undoBtn = toast.querySelector("#toast-undo-btn");
        undoBtn?.addEventListener("click", () => {
            undoCallback();
            removeToast();
        });
    }

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
    setTimeout(removeToast, undoCallback ? 7000 : 4000);
}

// Tab controller router
function switchTab(tabId) {
    state.currentTab = tabId;

    // Clear styles from all sidebar tab buttons
    const tabButtons = document.querySelectorAll(".sidebar-tab-btn");
    tabButtons.forEach(btn => {
        btn.classList.remove("font-extrabold", "font-bold", "text-primary", "dark:text-[#86d4d3]", "bg-secondary-container/40", "dark:bg-[#004f4f]/30", "bg-primary/10", "border-r-4", "border-primary", "dark:border-[#86d4d3]", "shadow-sm");
        btn.classList.add("text-on-surface-variant", "dark:text-secondary-fixed-dim", "hover:bg-gray-100", "dark:hover:bg-[#202225]");
    });

    // Style active button
    const activeBtn = document.querySelector(`.sidebar-tab-btn[data-tab="${tabId}"]`);
    if (activeBtn) {
        activeBtn.classList.remove("text-on-surface-variant", "dark:text-secondary-fixed-dim", "hover:bg-gray-100", "dark:hover:bg-[#202225]");
        activeBtn.classList.add("font-extrabold", "text-primary", "dark:text-[#86d4d3]", "bg-primary/10", "dark:bg-[#004f4f]/30");
    }

    // Toggle Tab content blocks
    const contentPanes = document.querySelectorAll(".tab-content-pane");
    contentPanes.forEach(pane => pane.classList.add("hidden"));

    const activePane = document.getElementById(`tab-content-${tabId}`);
    if (activePane) activePane.classList.remove("hidden");

    // Update Header Title
    const titleEl = document.getElementById("view-header-title");
    if (titleEl) {
        const titleMap = {
            dashboard: "Kitchen Operations Dashboard",
            'active-orders': "Active Kitchen Orders Queue",
            menu: "Canteen Decorative Food Menu Catalog",
            'ready-pickup': "Ready for Pickup Panel",
            'delivered-orders': "Delivered Orders Log",
            inventory: "Inventory & Raw Stock Management",
            notifications: "Kitchen Alerts & Notifications",
            reports: "Kitchen Performance & Daily Summary",
            'branch-management': "Child Branch & Food Transfer Operations Hub",
            profile: "Kitchen Staff Profile"
        };
        titleEl.innerText = titleMap[tabId] || "Kitchen Staff Portal";
    }

    renderActiveTab();
    closeMobileNav();
}

// Render logic switcher
function renderActiveTab() {
    saveState();
    updateDashboardMeters();

    if (state.currentTab === "dashboard") {
        renderDashboardTab();
    } else if (state.currentTab === "active-orders") {
        renderActiveOrdersTab();
    } else if (state.currentTab === "menu") {
        renderFoodMenuTab();
    } else if (state.currentTab === "ready-pickup") {
        renderReadyPickupTab();
    } else if (state.currentTab === "delivered-orders") {
        renderDeliveredTab();
    } else if (state.currentTab === "inventory") {
        renderInventoryTab();
    } else if (state.currentTab === "notifications") {
        renderNotificationsTab();
    } else if (state.currentTab === "reports") {
        renderReportsTab();
    } else if (state.currentTab === "branch-management") {
        renderBranchManagementTab();
    }
}

// ----------------------------------------------------
// STATS METERS UPDATE (DYNAMIC RE-CALCULATION)
// ----------------------------------------------------
function updateDashboardMeters() {
    try {
        const storedOrders = localStorage.getItem('campuspay-staff-orders');
        if (storedOrders) state.orders = JSON.parse(storedOrders);
        const storedMenu = localStorage.getItem('campuspay-canteen-menu');
        if (storedMenu) state.foodMenu = JSON.parse(storedMenu);
    } catch (e) {}

    const activeCount = state.orders.filter(o => o.status !== "Completed" && o.status !== "Delivered" && o.status !== "Cancelled").length;
    const preparingCount = state.orders.filter(o => o.status === "Preparing").length;
    const readyCount = state.orders.filter(o => o.status === "Ready for Pickup").length;
    const deliveredCount = state.orders.filter(o => o.status === "Delivered" || o.status === "Completed").length;
    const cancelledCount = state.orders.filter(o => o.status === "Cancelled").length;
    const lowStockCount = state.foodMenu.filter(i => (typeof i.stock === 'number' && i.stock <= 5) || i.status === "Low Stock" || i.status === "Out of Stock").length;

    // Update Stat Cards numbers
    const elActive = document.getElementById("stat-active-orders");
    const elPreparing = document.getElementById("stat-preparing");
    const elReady = document.getElementById("stat-ready");
    const elDelivered = document.getElementById("stat-delivered");
    const elCancelled = document.getElementById("stat-cancelled");
    const elLowStock = document.getElementById("stat-low-stock");

    if (elActive) elActive.innerText = activeCount.toString().padStart(2, '0');
    if (elPreparing) elPreparing.innerText = preparingCount.toString().padStart(2, '0');
    if (elReady) elReady.innerText = readyCount.toString().padStart(2, '0');
    if (elDelivered) elDelivered.innerText = deliveredCount.toString().padStart(2, '0');
    if (elCancelled) elCancelled.innerText = cancelledCount.toString().padStart(2, '0');
    if (elLowStock) elLowStock.innerText = lowStockCount.toString().padStart(2, '0');

    // Sidebar badges
    const badgeActive = document.getElementById("badge-active-orders-count");
    if (badgeActive) {
        if (activeCount > 0) {
            badgeActive.innerText = activeCount.toString();
            badgeActive.classList.remove("hidden");
        } else {
            badgeActive.classList.add("hidden");
        }
    }

    const badgeReady = document.getElementById("badge-ready-count");
    if (badgeReady) {
        if (readyCount > 0) {
            badgeReady.innerText = readyCount.toString();
            badgeReady.classList.remove("hidden");
        } else {
            badgeReady.classList.add("hidden");
        }
    }

    updateGridColsUI();
}

window.setQueueGridCols = function (cols) {
    state.gridCols = cols;
    localStorage.setItem('campuspay-queue-grid-cols', cols.toString());
    updateGridColsUI();
    renderActiveTab();
};

function updateGridColsUI() {
    const btn2 = document.getElementById("btn-grid-2");
    const btn3 = document.getElementById("btn-grid-3");
    const btn4 = document.getElementById("btn-grid-4");
    if (!btn2 || !btn3 || !btn4) return;

    const inactiveClass = "px-2.5 py-1 text-xs font-bold rounded-lg transition-all text-gray-500 hover:text-on-surface";
    const activeClass = "px-2.5 py-1 text-xs font-bold rounded-lg transition-all bg-white dark:bg-[#151617] text-primary dark:text-[#86d4d3] shadow-sm";

    btn2.className = (state.gridCols === 2) ? activeClass : inactiveClass;
    btn3.className = (state.gridCols === 3) ? activeClass : inactiveClass;
    btn4.className = (state.gridCols === 4) ? activeClass : inactiveClass;
}

// Kitchen Control Action Triggers
window.triggerCounterStaffChime = function () {
    playAudioChime("counter_alert");
    showToast("🔔 Counter staff alerted via chime signal!", "success");
};

window.toggleOnlineOrderIntake = function () {
    state.isOnlineOrdersPaused = !state.isOnlineOrdersPaused;
    const pill = document.getElementById("online-orders-status-pill");
    const btn = document.getElementById("btn-pause-online-orders");

    if (pill && btn) {
        if (state.isOnlineOrdersPaused) {
            pill.className = "px-2 py-0.5 bg-red-500/20 text-red-700 dark:text-red-300 text-[9px] font-black rounded uppercase";
            pill.innerText = "Orders Paused";
            btn.innerHTML = `<span class="material-symbols-outlined text-xl">play_circle</span><span>Resume Online Orders</span>`;
            showToast("Online student orders intake PAUSED 🔴", "error");
        } else {
            pill.className = "px-2 py-0.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[9px] font-black rounded uppercase";
            pill.innerText = "Orders Active";
            btn.innerHTML = `<span class="material-symbols-outlined text-xl">pause_circle</span><span>Pause Online Orders</span>`;
            showToast("Online student orders intake RESUMED 🟢", "success");
        }
    }
};

// SIMULATE LIVE INCOMING STUDENT ORDER
window.simulateIncomingOrder = function () {
    const studentNames = ["Anik Chowdhury", "Mehedi Hasan", "Taskin Rahman", "Zarin Subah", "Kazi Nabil"];
    const idRolls = ["202314088", "202114015", "202214077", "202014044", "202314102"];
    const foodItemsPool = [
        { name: "Crispy Chicken Burger", qty: 2, tags: ["Bestseller"] },
        { name: "Beef Kacchi Biryani", qty: 1, tags: ["Chef Special"] },
        { name: "MIST Signature Cold Coffee", qty: 2, tags: ["Vegetarian"] },
        { name: "Warm Chocolate Fudge Brownie", qty: 1, tags: ["Dessert"] },
        { name: "Singara & Samosa Combo", qty: 2, tags: ["Snacks"] }
    ];

    const randomName = studentNames[Math.floor(Math.random() * studentNames.length)];
    const randomId = idRolls[Math.floor(Math.random() * idRolls.length)];
    const randomItem = foodItemsPool[Math.floor(Math.random() * foodItemsPool.length)];

    const newId = getNextGlobalOrderId();
    const newOrder = {
        id: newId,
        studentName: randomName,
        studentId: randomId,
        orderTime: Date.now(),
        items: [randomItem],
        specialNote: "Live student online order",
        total: 190,
        payment: "Paid",
        pickupType: "Counter Pickup",
        status: "Pending",
        isPinned: false,
        statusHistory: [{ status: "Pending", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
    };

    state.orders.unshift(newOrder);
    saveState();
    playAudioChime("new_order");
    renderActiveTab();
    showToast(`🔔 New Order #${newOrder.id} received from ${randomName}!`, "success");
};

// ----------------------------------------------------
// TAB: FOOD MENU (10+ DECORATIVE BOXES)
// ----------------------------------------------------
function renderFoodMenuTab() {
    const container = document.getElementById("food-menu-cards-grid");
    if (!container) return;

    let itemsList = [...state.foodMenu];

    if (state.searchQuery.trim() !== "") {
        const q = state.searchQuery.trim().toLowerCase();
        itemsList = itemsList.filter(item => 
            item.name.toLowerCase().includes(q) || 
            item.category.toLowerCase().includes(q) ||
            item.tags.some(t => t.toLowerCase().includes(q))
        );
    }

    if (itemsList.length === 0) {
        container.innerHTML = `
            <div class="col-span-full p-12 text-center text-gray-500 font-bold bg-white dark:bg-[#1e2022] rounded-2xl border border-outline-variant">
                No matching menu items found.
            </div>
        `;
        return;
    }

    container.innerHTML = itemsList.map((item, idx) => {
        let statusBadge = `<span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">Available</span>`;
        if (item.status === "Low Stock") {
            statusBadge = `<span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-700 dark:text-amber-300">Low Stock (${item.stock})</span>`;
        } else if (item.status === "Out of Stock" || item.stock === 0) {
            statusBadge = `<span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-500/20 text-red-700 dark:text-red-300">Out of Stock</span>`;
        }

        const tagsHTML = item.tags.map(t => `<span class="px-2 py-0.5 bg-primary/10 text-primary dark:text-[#86d4d3] text-[9px] font-black uppercase rounded">${t}</span>`).join(' ');

        return `
            <div class="decorative-food-card flex flex-col justify-between">
                
                <!-- Image Header with Badges -->
                <div class="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-[#121314]">
                    <img src="${item.img}" alt="${item.name}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                    
                    <div class="absolute top-3 left-3 flex gap-1.5 flex-wrap z-20">
                        <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase text-white decorative-card-badge shadow">${item.category}</span>
                    </div>

                    <div class="absolute top-3 right-3 z-20">
                        ${statusBadge}
                    </div>

                    <div class="absolute bottom-3 left-3 z-20">
                        <span class="px-2 py-1 bg-black/60 backdrop-blur-md text-amber-300 text-[10px] font-black rounded-lg flex items-center gap-1 shadow">
                            ${item.rating}
                        </span>
                    </div>

                    <div class="absolute bottom-3 right-3 z-20">
                        <span class="px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-lg flex items-center gap-1">
                            <span class="material-symbols-outlined text-xs">schedule</span> ${item.prepTime}
                        </span>
                    </div>
                </div>

                <!-- Body Details -->
                <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                        <div class="flex justify-between items-start mb-1">
                            <h4 class="font-extrabold text-base text-on-surface dark:text-white leading-tight">${item.name}</h4>
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400 font-medium line-clamp-2">${item.desc}</p>
                    </div>

                    <div class="flex items-center gap-1.5 flex-wrap">
                        ${tagsHTML}
                    </div>

                    <!-- Price & Full Edit Control Bar -->
                    <div class="pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                        <div>
                            <span class="text-[9px] font-black text-gray-400 uppercase block">Price</span>
                            <span class="text-xl font-black text-primary dark:text-[#86d4d3]">৳ ${item.price}</span>
                        </div>

                        <div class="flex items-center gap-1.5">
                            <button onclick="openEditFoodModal(${idx})" class="px-3 py-1.5 bg-primary/10 text-primary dark:text-[#86d4d3] hover:bg-primary hover:text-on-primary rounded-xl text-xs font-bold transition-all flex items-center gap-1" title="Edit Item Details (Name, Price, Pic, Prep Time, Description, Tags)">
                                <span class="material-symbols-outlined text-sm">edit</span>
                                <span>Edit</span>
                            </button>
                            <button onclick="toggleMenuAvailability(${idx})" class="p-1.5 ${item.status === 'Out of Stock' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-red-500/20 text-red-600'} rounded-xl text-xs font-bold transition-all" title="Toggle Availability">
                                <span class="material-symbols-outlined text-base">${item.status === 'Out of Stock' ? 'visibility' : 'visibility_off'}</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        `;
    }).join("");
}

window.quickEditMenuPrice = function (idx) {
    const item = state.foodMenu[idx];
    if (!item) return;

    const newPrice = prompt(`Update selling price for ${item.name} (৳):`, item.price);
    if (newPrice !== null) {
        const val = parseFloat(newPrice);
        if (!isNaN(val) && val > 0) {
            item.price = val;
            renderActiveTab();
            showToast(`Price updated for ${item.name} to ৳ ${val}`, "success");
        }
    }
};

window.toggleMenuAvailability = function (idx) {
    const item = state.foodMenu[idx];
    if (!item) return;

    if (item.status === "Out of Stock" || item.stock === 0) {
        item.status = "Available";
        item.stock = 25;
    } else {
        item.status = "Out of Stock";
        item.stock = 0;
    }
    renderActiveTab();
    showToast(`Status toggled for ${item.name}`, "info");
};

// ----------------------------------------------------
// TAB: DASHBOARD OVERVIEW (17 LIVE WIDGETS RENDERER)
// ----------------------------------------------------
function renderDashboardTab() {
    try {
        const storedOrders = localStorage.getItem('campuspay-staff-orders');
        if (storedOrders) state.orders = JSON.parse(storedOrders);
    } catch (e) {}

    // 1 & 12: Sales Snapshot Calculations
    const totalDelivered = state.orders.filter(o => o.status === "Delivered" || o.status === "Completed");
    const totalRevenue = totalDelivered.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0) + 31450;
    const totalOrdersCount = state.orders.length + 176;
    const totalMealsCount = state.orders.reduce((sum, o) => sum + (o.items ? o.items.reduce((s, i) => s + (i.qty || 1), 0) : 1), 0) + 301;

    const salesRevEl = document.getElementById("dash-sales-revenue");
    if (salesRevEl) salesRevEl.innerText = `৳ ${totalRevenue.toLocaleString()}`;
    const salesOrdersEl = document.getElementById("dash-sales-orders");
    if (salesOrdersEl) salesOrdersEl.innerText = totalOrdersCount.toString();
    const salesMealsEl = document.getElementById("dash-sales-meals");
    if (salesMealsEl) salesMealsEl.innerText = totalMealsCount.toString();

    // 2 & 14: Live Kitchen Workload & Prep Progress
    const activeOrders = state.orders.filter(o => o.status !== "Delivered" && o.status !== "Completed" && o.status !== "Cancelled");
    const preparingOrders = state.orders.filter(o => o.status === "Preparing");
    const acceptedOrders = state.orders.filter(o => o.status === "Accepted" || o.status === "Preparing");

    const capacityRatio = `${activeOrders.length} / 40 orders`;
    const loadPercent = Math.min(100, Math.round((activeOrders.length / 40) * 100)) || 42;

    const workloadBadge = document.getElementById("dash-workload-badge");
    if (workloadBadge) {
        if (loadPercent > 85) {
            workloadBadge.className = "px-2 py-0.5 bg-red-500/20 text-red-700 dark:text-red-300 text-[10px] font-black rounded-full uppercase shrink-0 whitespace-nowrap";
            workloadBadge.innerText = "🔥 High Peak";
        } else if (loadPercent > 60) {
            workloadBadge.className = "px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-black rounded-full uppercase shrink-0 whitespace-nowrap";
            workloadBadge.innerText = "⚡ Moderate";
        } else {
            workloadBadge.className = "px-2 py-0.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-black rounded-full uppercase shrink-0 whitespace-nowrap";
            workloadBadge.innerText = "🟢 Normal";
        }
    }
    const workloadPercent = document.getElementById("dash-workload-percent");
    if (workloadPercent) workloadPercent.innerText = `${loadPercent}%`;
    const workloadBar = document.getElementById("dash-workload-bar");
    if (workloadBar) workloadBar.style.width = `${loadPercent}%`;
    const workloadCap = document.getElementById("dash-workload-capacity");
    if (workloadCap) workloadCap.innerText = capacityRatio;

    // 9. Peak Hour Indicator (Dynamic Red Blip during Rush Hour)
    const peakCard = document.getElementById("dash-peakhour-card");
    const peakBadge = document.getElementById("dash-peakhour-badge");
    const peakTitle = document.getElementById("dash-peakhour-header-title");
    const peakIcon = document.getElementById("dash-peakhour-icon");
    const peakStatusText = document.getElementById("dash-peakhour-status-text");

    const isRushHour = activeOrders.length >= 3 || state.isBusyMode || loadPercent >= 40;

    if (isRushHour) {
        if (peakCard) {
            peakCard.className = "glass-card bg-red-500/10 dark:bg-red-950/30 p-5 rounded-2xl border-2 border-red-500/80 shadow-lg shadow-red-500/20 flex flex-col justify-between space-y-3 transition-all duration-500 animate-pulse";
        }
        if (peakTitle) {
            peakTitle.className = "font-black text-xs text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5 min-w-0 truncate";
        }
        if (peakIcon) {
            peakIcon.className = "material-symbols-outlined text-red-600 dark:text-red-400 shrink-0 text-base animate-bounce";
            peakIcon.innerText = "local_fire_department";
        }
        if (peakBadge) {
            peakBadge.className = "px-2.5 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase shrink-0 whitespace-nowrap shadow-md flex items-center gap-1.5";
            peakBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-white animate-ping"></span> <span>🔥 RUSH HOUR</span>`;
        }
        if (peakStatusText) {
            peakStatusText.className = "text-xl font-black text-red-600 dark:text-red-400 drop-shadow";
            peakStatusText.innerText = "Lunch Peak Rush (Active)";
        }
    } else {
        if (peakCard) {
            peakCard.className = "glass-card bg-white dark:bg-[#1e2022] p-5 rounded-2xl border border-outline-variant dark:border-[#2d3135] shadow-md flex flex-col justify-between space-y-3 transition-all duration-500";
        }
        if (peakTitle) {
            peakTitle.className = "font-black text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5 min-w-0 truncate";
        }
        if (peakIcon) {
            peakIcon.className = "material-symbols-outlined text-blue-500 shrink-0 text-base";
            peakIcon.innerText = "schedule";
        }
        if (peakBadge) {
            peakBadge.className = "px-2 py-0.5 bg-blue-500/20 text-blue-700 dark:text-blue-300 text-[10px] font-black rounded-full uppercase shrink-0 whitespace-nowrap";
            peakBadge.innerText = "Moderate";
        }
        if (peakStatusText) {
            peakStatusText.className = "text-xl font-black text-blue-600 dark:text-blue-400";
            peakStatusText.innerText = "Normal Intake Pace";
        }
    }

    // 5. Batch Preparation Suggestions ⭐
    const itemTotals = {};
    activeOrders.forEach(ord => {
        (ord.items || []).forEach(i => {
            itemTotals[i.name] = (itemTotals[i.name] || 0) + (i.qty || 1);
        });
    });

    const batchContainer = document.getElementById("dash-batch-suggestions-list");
    if (batchContainer) {
        const sortedItems = Object.entries(itemTotals).sort((a, b) => b[1] - a[1]);
        if (sortedItems.length === 0) {
            batchContainer.innerHTML = `
                <div class="p-3 bg-white/80 dark:bg-[#151617]/80 rounded-xl border border-amber-500/20 flex justify-between items-center">
                    <span class="font-extrabold text-xs text-on-surface dark:text-white">Crispy Chicken Burger</span>
                    <span class="px-2.5 py-1 bg-amber-500 text-neutral-900 font-black text-xs rounded-lg shadow">×18</span>
                </div>
                <div class="p-3 bg-white/80 dark:bg-[#151617]/80 rounded-xl border border-amber-500/20 flex justify-between items-center">
                    <span class="font-extrabold text-xs text-on-surface dark:text-white">French Fries</span>
                    <span class="px-2.5 py-1 bg-amber-500 text-neutral-900 font-black text-xs rounded-lg shadow">×31</span>
                </div>
                <div class="p-3 bg-white/80 dark:bg-[#151617]/80 rounded-xl border border-amber-500/20 flex justify-between items-center">
                    <span class="font-extrabold text-xs text-on-surface dark:text-white">Chicken Wings</span>
                    <span class="px-2.5 py-1 bg-amber-500 text-neutral-900 font-black text-xs rounded-lg shadow">×14</span>
                </div>
                <div class="p-3 bg-white/80 dark:bg-[#151617]/80 rounded-xl border border-amber-500/20 flex justify-between items-center">
                    <span class="font-extrabold text-xs text-on-surface dark:text-white">Cold Coffee</span>
                    <span class="px-2.5 py-1 bg-amber-500 text-neutral-900 font-black text-xs rounded-lg shadow">×10</span>
                </div>
            `;
        } else {
            batchContainer.innerHTML = sortedItems.slice(0, 4).map(([name, qty]) => `
                <div class="p-3 bg-white/80 dark:bg-[#151617]/80 rounded-xl border border-amber-500/20 flex justify-between items-center">
                    <span class="font-extrabold text-xs text-on-surface dark:text-white">${name}</span>
                    <span class="px-2.5 py-1 bg-amber-500 text-neutral-900 font-black text-xs rounded-lg shadow">×${qty}</span>
                </div>
            `).join('');
        }
    }

    // 4. Orders by Category Breakdown
    const catBreakdown = { Burger: 12, Pizza: 7, Rice: 18, Drinks: 15 };
    activeOrders.forEach(ord => {
        (ord.items || []).forEach(i => {
            const nameLower = i.name.toLowerCase();
            if (nameLower.includes("burger")) catBreakdown["Burger"] += i.qty;
            else if (nameLower.includes("biryani") || nameLower.includes("rice")) catBreakdown["Rice"] += i.qty;
            else if (nameLower.includes("tea") || nameLower.includes("coffee")) catBreakdown["Drinks"] += i.qty;
            else catBreakdown["Snacks"] = (catBreakdown["Snacks"] || 5) + i.qty;
        });
    });
    const catContainer = document.getElementById("dash-category-breakdown-list");
    if (catContainer) {
        catContainer.innerHTML = Object.entries(catBreakdown).map(([cat, count]) => `
            <div class="space-y-1">
                <div class="flex justify-between items-center text-xs font-extrabold">
                    <span class="text-on-surface dark:text-gray-200">${cat}</span>
                    <span class="text-primary dark:text-[#86d4d3]">${count}</span>
                </div>
                <div class="w-full bg-gray-100 dark:bg-[#151617] h-2 rounded-full overflow-hidden">
                    <div class="h-full bg-primary rounded-full" style="width: ${Math.min(100, count * 5)}%;"></div>
                </div>
            </div>
        `).join('');
    }

    // 3. Recent Orders Feed
    const feedContainer = document.getElementById("dash-recent-orders-feed");
    if (feedContainer) {
        const feedOrders = state.orders.slice(0, 5);
        feedContainer.innerHTML = feedOrders.map(ord => {
            const badgeClass = ord.status === "Preparing" ? "bg-amber-500/20 text-amber-600" :
                               ord.status === "Ready for Pickup" ? "bg-emerald-500/20 text-emerald-600" :
                               ord.status === "Delivered" ? "bg-slate-500/20 text-slate-400" : "bg-blue-500/20 text-blue-600";
            return `
                <div class="flex items-center justify-between p-2.5 bg-surface-container-low dark:bg-[#151617] rounded-xl text-xs font-bold border border-outline-variant/20">
                    <span class="font-black text-on-surface dark:text-white">#${ord.id} ${ord.status.toLowerCase()}</span>
                    <span class="px-2 py-0.5 rounded text-[9px] uppercase font-black ${badgeClass}">${ord.status}</span>
                </div>
            `;
        }).join('');
    }

    // 16. Alerts Panel
    const alertsContainer = document.getElementById("dash-alerts-panel-list");
    if (alertsContainer) {
        alertsContainer.innerHTML = `
            <div class="p-2.5 bg-red-500/10 border-l-4 border-red-500 rounded-r-xl text-xs font-bold text-red-700 dark:text-red-300">
                ⚠ Rice below minimum
            </div>
            <div class="p-2.5 bg-amber-500/10 border-l-4 border-amber-500 rounded-r-xl text-xs font-bold text-amber-700 dark:text-amber-300">
                ⚠ Coke out of stock
            </div>
            <div class="p-2.5 bg-blue-500/10 border-l-4 border-blue-500 rounded-r-xl text-xs font-bold text-blue-700 dark:text-blue-300">
                ⚠ Order #3023 delayed
            </div>
        `;
    }

    // 7. Low Inventory Preview
    const lowInvContainer = document.getElementById("dash-low-inventory-preview-list");
    if (lowInvContainer) {
        lowInvContainer.innerHTML = `
            <div class="flex justify-between items-center p-2.5 bg-surface-container-low dark:bg-[#151617] rounded-xl border border-red-500/30">
                <span class="font-extrabold text-on-surface dark:text-white">Chicken</span>
                <span class="font-black text-red-600 dark:text-red-400">12%</span>
            </div>
            <div class="flex justify-between items-center p-2.5 bg-surface-container-low dark:bg-[#151617] rounded-xl border border-amber-500/30">
                <span class="font-extrabold text-on-surface dark:text-white">Eggs</span>
                <span class="font-black text-amber-600 dark:text-amber-400">18%</span>
            </div>
            <div class="flex justify-between items-center p-2.5 bg-surface-container-low dark:bg-[#151617] rounded-xl border border-red-500/30">
                <span class="font-extrabold text-on-surface dark:text-white">Cooking Oil</span>
                <span class="font-black text-red-600 dark:text-red-400">9%</span>
            </div>
        `;
    }

    // 17. Delivery Counter
    const delToday = document.getElementById("dash-delivered-today-count");
    if (delToday) delToday.innerText = (totalDelivered.length + 145).toString();
}

window.toggleKitchenBusyMode = function () {
    state.isBusyMode = !state.isBusyMode;
    const btn = document.getElementById("btn-quick-busy-mode");
    if (state.isBusyMode) {
        if (btn) btn.className = "p-3.5 bg-red-600 text-white rounded-2xl transition-all flex flex-col items-center justify-center gap-1.5 text-center shadow-lg active:scale-95";
        showToast("🔥 Kitchen marked as HIGH BUSY MODE! Prep times extended.", "error");
    } else {
        if (btn) btn.className = "p-3.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-700 dark:text-red-300 rounded-2xl transition-all flex flex-col items-center justify-center gap-1.5 text-center active:scale-95";
        showToast("🟢 Kitchen returned to normal operating load.", "success");
    }
};

window.triggerEmergencyAnnouncement = function () {
    const msg = prompt("Enter Emergency Kitchen Broadcast Announcement:", "Kitchen experiencing high load. Expected delay +5 mins.");
    if (msg) {
        showToast(`📢 EMERGENCY ANNOUNCEMENT: "${msg}"`, "error");
        playAudioChime("counter_alert");
    }
};

// ----------------------------------------------------
// TAB: MAIN ACTIVE ORDERS QUEUE (Glanceable Kitchen Display)
// ----------------------------------------------------
function renderActiveOrdersTab() {
    if (state.isBatchCookingView) {
        renderBatchCookingView();
        return;
    }

    const container = document.getElementById("active-orders-queue-container");
    if (!container) return;

    try {
        const storedOrders = localStorage.getItem('campuspay-staff-orders');
        if (storedOrders) state.orders = JSON.parse(storedOrders);
    } catch (e) {}

    let activeList = state.orders.filter(o => o.status !== "Delivered" && o.status !== "Completed" && o.status !== "Cancelled");

    if (state.selectedStatusFilter && state.selectedStatusFilter !== "All") {
        activeList = activeList.filter(o => o.status === state.selectedStatusFilter);
    }

    if (state.searchQuery.trim() !== "") {
        const q = state.searchQuery.trim().toLowerCase();
        activeList = activeList.filter(o => 
            o.id.toString().includes(q) || 
            o.studentName.toLowerCase().includes(q) || 
            o.studentId.toLowerCase().includes(q) ||
            o.items.some(i => i.name.toLowerCase().includes(q))
        );
    }

    // Apply selected Grid Column Layout (2, 3, or 4 cols)
    let gridClass = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
    if (state.gridCols === 2) {
        gridClass = "grid grid-cols-1 md:grid-cols-2 gap-6";
    } else if (state.gridCols === 4) {
        gridClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";
    }
    container.className = gridClass;

    // Sort: Pinned orders first, then oldest orders first
    activeList.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return a.orderTime - b.orderTime;
    });

    if (activeList.length === 0) {
        container.innerHTML = `
            <div class="col-span-full bg-white dark:bg-[#1e2022] border border-outline-variant dark:border-[#2d3135] p-12 rounded-2xl text-center space-y-3 shadow-sm select-none">
                <span class="material-symbols-outlined text-5xl text-amber-500 mx-auto block">soup_kitchen</span>
                <h4 class="font-title-lg text-lg font-black text-on-surface dark:text-white">No Orders in Kitchen Queue</h4>
                <div class="flex items-center justify-center gap-3 mt-3 flex-wrap">
                    <button onclick="openCreateOrderModal()" class="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary font-black text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-1.5 active:scale-95">
                        <span class="material-symbols-outlined text-sm font-black">add_circle</span> + Create Manual Order
                    </button>
                    <button onclick="simulateIncomingOrder()" class="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-extrabold text-xs rounded-xl transition-all border border-amber-500/30 inline-flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">add_alert</span> Simulate Test Order
                    </button>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = activeList.map(ord => {
        const isOverdue = (Date.now() - ord.orderTime) > 600000 && ord.status !== "Delivered" && ord.status !== "Completed" && ord.status !== "Cancelled";
        const overdueClass = isOverdue ? "order-card-overdue" : "";
        const statusThemeClass = getStatusThemeClass(ord.status);

        const dietaryBadges = ord.items.flatMap(i => i.tags || []).filter((v, i, a) => a.indexOf(v) === i);
        const dietaryHTML = dietaryBadges.map(tag => {
            let color = "bg-green-500/20 text-green-700 dark:text-green-300";
            if (tag === "Contains Nuts") color = "bg-red-500/20 text-red-700 dark:text-red-300";
            return `<span class="px-2 py-0.5 rounded text-[10px] font-black uppercase ${color}">${tag}</span>`;
        }).join(" ");

        return `
            <div class="order-card glass-card ${statusThemeClass} ${overdueClass} rounded-2xl p-4 sm:p-5 shadow-md flex flex-col justify-between transition-all duration-300 relative border border-outline-variant/30 min-w-0 overflow-hidden w-full">
                
                <!-- Card Header -->
                <div class="border-b border-outline-variant/30 pb-3 mb-3 min-w-0 space-y-1">
                    <!-- Row 1: Order ID Badge + Pin & Timer -->
                    <div class="flex items-center justify-between gap-2 min-w-0">
                        <div class="flex items-center gap-1.5 min-w-0">
                            <span class="text-xl sm:text-2xl font-black text-primary dark:text-[#86d4d3] tracking-tight cursor-pointer hover:underline shrink-0" onclick="openOrderDetailsModal('${ord.id}')">#${ord.id}</span>
                            <button onclick="togglePinOrder('${ord.id}')" title="Pin Urgent Order" class="p-1 hover:bg-surface-container-high rounded-full transition-colors shrink-0 ${ord.isPinned ? 'text-amber-500' : 'text-gray-400'}">
                                <span class="material-symbols-outlined text-lg">${ord.isPinned ? 'push_pin' : 'push_pin'}</span>
                            </button>
                        </div>

                        <div class="flex items-center gap-1 bg-black/10 dark:bg-white/10 px-2.5 py-0.5 rounded-full font-mono font-black text-xs text-on-surface dark:text-white shrink-0 whitespace-nowrap">
                            <span class="material-symbols-outlined text-xs animate-spin shrink-0">timer</span>
                            <span class="order-live-timer" data-starttime="${ord.orderTime}">00:00</span>
                        </div>
                    </div>

                    <!-- Row 2: Student Name, ID & Pickup Type -->
                    <div class="flex items-center justify-between gap-2 min-w-0 pt-0.5">
                        <p class="font-extrabold text-xs sm:text-sm text-on-surface dark:text-white truncate min-w-0 flex-1">${ord.studentName} <span class="text-[10px] font-medium text-gray-400">(${ord.studentId})</span></p>
                        <span class="px-2 py-0.5 bg-purple-500/20 text-purple-700 dark:text-purple-300 font-extrabold text-[10px] rounded uppercase shrink-0 whitespace-nowrap">${ord.pickupType}</span>
                    </div>
                </div>

                <!-- Items List -->
                <div class="space-y-2 mb-3 flex-1 min-w-0">
                    <span class="text-[10px] font-black uppercase text-on-surface-variant dark:text-gray-400 tracking-wider block">Items to Cook</span>
                    <ul class="space-y-1.5 text-xs sm:text-sm font-bold text-on-surface dark:text-gray-100 min-w-0">
                        ${ord.items.map(i => `
                            <li class="flex justify-between items-center bg-white/70 dark:bg-[#151617]/70 p-2 rounded-xl border border-outline-variant/20 min-w-0 gap-1.5">
                                <div class="flex items-center gap-1.5 min-w-0 flex-1">
                                    <span class="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                                    <span class="truncate min-w-0 text-xs font-bold">${i.name}</span>
                                </div>
                                <span class="text-xs font-black px-2 py-0.5 bg-primary/10 text-primary dark:text-[#86d4d3] rounded-lg shrink-0 whitespace-nowrap">×${i.qty}</span>
                            </li>
                        `).join('')}
                    </ul>

                    ${ord.specialNote ? `
                        <div class="p-2.5 bg-red-500/10 border-l-4 border-red-500 rounded-r-xl mt-2 min-w-0 break-words">
                            <span class="text-[9px] font-black uppercase text-red-600 dark:text-red-400 block">Special Instructions</span>
                            <p class="text-xs font-bold text-red-700 dark:text-red-300 italic line-clamp-2">"${ord.specialNote}"</p>
                        </div>
                    ` : ''}

                    ${dietaryHTML ? `<div class="flex gap-1 flex-wrap pt-1.5 min-w-0">${dietaryHTML}</div>` : ''}
                </div>

                <!-- Payment & Card Status Bar -->
                <div class="flex justify-between items-center border-t border-outline-variant/30 pt-2.5 mb-3 min-w-0 gap-1">
                    <span class="px-2 py-0.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-black text-[11px] sm:text-xs rounded-full flex items-center gap-1 shrink-0 whitespace-nowrap">
                        <span class="material-symbols-outlined text-xs">verified</span> ${ord.payment}
                    </span>
                    <span class="font-extrabold text-[10px] sm:text-xs uppercase px-2.5 py-0.5 rounded-full truncate min-w-0 ${getStatusBadgeClass(ord.status)}">${ord.status}</span>
                </div>

                <!-- ONE-CLICK ACTION BUTTONS (2 ROWS, OVERFLOW-PROOF) -->
                <div class="grid grid-cols-2 gap-1.5 pt-2.5 border-t border-outline-variant/30 min-w-0">
                    <!-- Row 1: Accept & Preparing -->
                    <button onclick="changeOrderStatus('${ord.id}', 'Accepted')" class="py-2 px-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] sm:text-xs rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1 min-w-0 truncate" title="Accept Order">
                        <span class="material-symbols-outlined text-xs shrink-0">thumb_up</span>
                        <span class="truncate">Accept</span>
                    </button>
                    <button onclick="changeOrderStatus('${ord.id}', 'Preparing')" class="py-2 px-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-900 font-black text-[11px] sm:text-xs rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1 min-w-0 truncate" title="Preparing Order">
                        <span class="material-symbols-outlined text-xs shrink-0">skillet</span>
                        <span class="truncate">Preparing</span>
                    </button>
                    
                    <!-- Row 2: Ready & Delivered -->
                    <button onclick="changeOrderStatus('${ord.id}', 'Ready for Pickup')" class="py-2 px-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] sm:text-xs rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1 min-w-0 truncate" title="Mark Ready for Pickup">
                        <span class="material-symbols-outlined text-xs shrink-0">verified</span>
                        <span class="truncate">Ready</span>
                    </button>
                    <button onclick="changeOrderStatus('${ord.id}', 'Delivered')" class="py-2 px-1.5 bg-slate-700 hover:bg-slate-800 text-white font-bold text-[11px] sm:text-xs rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1 min-w-0 truncate" title="Mark Delivered">
                        <span class="material-symbols-outlined text-xs shrink-0">task_alt</span>
                        <span class="truncate">Delivered</span>
                    </button>
                </div>
                
                <div class="flex justify-between items-center mt-2.5 pt-2 border-t border-outline-variant/20 min-w-0 gap-1">
                    <button onclick="openAndPrintOrderReceipt('${ord.id}')" class="text-[11px] sm:text-xs font-bold text-primary dark:text-[#86d4d3] hover:bg-primary/10 px-2 py-1 rounded-lg transition-all flex items-center gap-1 min-w-0 truncate" title="Directly generate receipt PDF / Print ticket">
                        <span class="material-symbols-outlined text-xs shrink-0">print</span>
                        <span class="truncate">Print Receipt</span>
                    </button>
                    <button onclick="changeOrderStatus('${ord.id}', 'Cancelled')" class="text-[11px] sm:text-xs font-bold text-red-500 hover:underline shrink-0 whitespace-nowrap">
                        Cancel
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// BATCH COOKING VIEW (Groups identical food items across all active/preparing orders)
function renderBatchCookingView() {
    const container = document.getElementById("active-orders-queue-container");
    if (!container) return;

    const activeOrders = state.orders.filter(o => o.status === "Pending" || o.status === "Accepted" || o.status === "Preparing");

    if (activeOrders.length === 0) {
        container.innerHTML = `
            <div class="col-span-full bg-white dark:bg-[#1e2022] border border-outline-variant p-10 rounded-2xl text-center space-y-3">
                <p class="text-sm font-bold text-gray-500">No items currently active to batch cook!</p>
                <button onclick="simulateIncomingOrder()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm">add_alert</span> ➕ Simulate Incoming Order
                </button>
            </div>
        `;
        return;
    }

    const itemTotals = {};
    activeOrders.forEach(ord => {
        ord.items.forEach(item => {
            if (!itemTotals[item.name]) {
                itemTotals[item.name] = { qty: 0, ordersCount: 0, orderIds: [] };
            }
            itemTotals[item.name].qty += item.qty;
            itemTotals[item.name].ordersCount += 1;
            itemTotals[item.name].orderIds.push(`#${ord.id}`);
        });
    });

    container.innerHTML = `
        <div class="col-span-full space-y-4">
            <div class="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex justify-between items-center">
                <div>
                    <h4 class="font-extrabold text-base text-amber-700 dark:text-amber-300">🍽️ Batch Cooking Mode Active</h4>
                    <p class="text-xs font-medium text-amber-800 dark:text-amber-400">Aggregated food item quantities across ${activeOrders.length} active kitchen orders.</p>
                </div>
                <button onclick="toggleBatchCookingView()" class="px-4 py-2 bg-amber-500 text-neutral-900 font-extrabold text-xs rounded-xl shadow hover:bg-amber-600 transition-all">
                    Switch to Card View
                </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                ${Object.keys(itemTotals).map(itemName => `
                    <div class="bg-white dark:bg-[#1e2022] border-2 border-primary/30 rounded-2xl p-6 shadow-md flex justify-between items-center">
                        <div>
                            <span class="text-[10px] font-black uppercase text-on-surface-variant dark:text-gray-400 block mb-1">Total Quantity Needed</span>
                            <h3 class="text-2xl font-black text-on-surface dark:text-white mb-2">${itemName}</h3>
                            <p class="text-xs font-semibold text-primary dark:text-[#86d4d3]">For Orders: ${itemTotals[itemName].orderIds.join(', ')}</p>
                        </div>
                        <div class="w-16 h-16 rounded-2xl bg-primary text-on-primary font-black text-2xl flex items-center justify-center shadow-lg">
                            ×${itemTotals[itemName].qty}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

window.toggleBatchCookingView = function () {
    state.isBatchCookingView = !state.isBatchCookingView;
    const btn = document.getElementById("btn-toggle-batch-view");
    if (btn) {
        btn.innerText = state.isBatchCookingView ? "📋 Card View" : "🍽️ Batch Cooking View";
    }
    renderActiveTab();
};

function getStatusThemeClass(status) {
    switch (status) {
        case "Pending": return "order-card-pending";
        case "Accepted": return "order-card-accepted";
        case "Preparing": return "order-card-preparing";
        case "Ready for Pickup": return "order-card-ready";
        case "Delivered": return "order-card-delivered";
        case "Completed": return "order-card-delivered";
        case "Cancelled": return "order-card-cancelled";
        default: return "";
    }
}

function getStatusBadgeClass(status) {
    switch (status) {
        case "Pending": return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
        case "Accepted": return "bg-blue-200 text-blue-900 dark:bg-blue-800/40 dark:text-blue-200";
        case "Preparing": return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
        case "Ready for Pickup": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
        case "Delivered": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
        case "Cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
        default: return "bg-gray-100 text-gray-800";
    }
}

// Order Status Transitions with Undo Capability
window.changeOrderStatus = function (orderId, newStatus) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    const previousStatus = order.status;
    order.status = newStatus;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    order.statusHistory.push({ status: newStatus, time: timeStr });

    // Store state for UNDO action
    state.lastStatusChange = { orderId, previousStatus };

    // Play chime sound
    playAudioChime("status_change");

    // Push into timeline
    state.activityTimeline.unshift({
        title: `Order #${orderId} -> ${newStatus}`,
        detail: `Updated by Kitchen Staff (${order.studentName})`,
        time: timeStr,
        icon: newStatus === "Ready for Pickup" ? "soup_kitchen" : (newStatus === "Delivered" ? "task_alt" : "sync"),
        color: newStatus === "Ready for Pickup" ? "text-amber-500" : (newStatus === "Delivered" ? "text-emerald-500" : "text-blue-500")
    });

    // Sync student active order to local storage if matching
    try {
        const activeStudentOrder = JSON.parse(localStorage.getItem('campuspay-active-order'));
        if (activeStudentOrder && activeStudentOrder.orderId.toString() === orderId) {
            activeStudentOrder.status = newStatus;
            localStorage.setItem('campuspay-active-order', JSON.stringify(activeStudentOrder));
        }
    } catch (e) {}

    renderActiveTab();
    showToast(`Order #${orderId} moved to "${newStatus}"`, "success", () => undoLastStatusChange());
};

function undoLastStatusChange() {
    if (!state.lastStatusChange) return;
    const { orderId, previousStatus } = state.lastStatusChange;
    const order = state.orders.find(o => o.id === orderId);
    if (order) {
        order.status = previousStatus;
        state.lastStatusChange = null;
        renderActiveTab();
        showToast(`Undid status change. Order #${orderId} restored to "${previousStatus}".`, "info");
    }
}

window.togglePinOrder = function (orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (order) {
        order.isPinned = !order.isPinned;
        renderActiveTab();
        showToast(order.isPinned ? `Order #${orderId} Pinned to Top 📌` : `Order #${orderId} Unpinned`, "info");
    }
};

// ----------------------------------------------------
// TAB: READY FOR PICKUP PANEL
// ----------------------------------------------------
function renderReadyPickupTab() {
    const container = document.getElementById("ready-pickup-list-container");
    if (!container) return;

    const readyList = state.orders.filter(o => o.status === "Ready for Pickup");

    if (readyList.length === 0) {
        container.innerHTML = `
            <div class="col-span-full bg-white dark:bg-[#1e2022] border border-outline-variant dark:border-[#2d3135] p-12 rounded-2xl text-center space-y-3 shadow-sm select-none">
                <span class="material-symbols-outlined text-5xl text-emerald-500 mx-auto block">verified</span>
                <h4 class="font-title-lg text-lg font-black text-on-surface dark:text-white">No Orders Ready for Pickup</h4>
                <p class="text-xs text-on-surface-variant dark:text-gray-400 font-semibold max-w-md mx-auto">When food preparation finishes, move orders here so counter staff can dispense them immediately.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = readyList.map(ord => {
        return `
            <div class="glass-card order-card-ready border-2 border-emerald-500 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
                <div>
                    <span class="px-3 py-1 bg-emerald-500 text-white font-black text-[10px] uppercase rounded-full tracking-wider animate-pulse inline-block mb-2">READY FOR PICKUP</span>
                    <h2 class="text-4xl font-black text-on-surface dark:text-white tracking-tight mb-1">ORDER #${ord.id}</h2>
                    <p class="font-extrabold text-sm text-primary dark:text-[#86d4d3]">${ord.studentName} (${ord.studentId})</p>
                </div>

                <div class="bg-white/80 dark:bg-[#151617]/80 p-3 rounded-xl border border-outline-variant/30 space-y-1">
                    <span class="text-[10px] font-black uppercase text-gray-500 block">Food Items</span>
                    <p class="text-xs font-bold text-on-surface dark:text-gray-200">${ord.items.map(i => `${i.name} ×${i.qty}`).join(', ')}</p>
                </div>

                <div class="flex justify-between items-center text-xs font-bold text-gray-500">
                    <span>Pickup Type: <strong class="text-on-surface dark:text-white">${ord.pickupType}</strong></span>
                    <span class="font-mono text-emerald-600 dark:text-emerald-400">Ready</span>
                </div>

                <button onclick="changeOrderStatus('${ord.id}', 'Delivered')" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-lg">done_all</span> Mark as Delivered
                </button>
            </div>
        `;
    }).join('');
}

// ----------------------------------------------------
// TAB: DELIVERED ORDERS LOG
// ----------------------------------------------------
function renderDeliveredTab() {
    const listBody = document.getElementById("table-body-delivered");
    if (!listBody) return;

    const deliveredList = state.orders.filter(o => o.status === "Delivered" || o.status === "Completed");

    if (deliveredList.length === 0) {
        listBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-400 font-semibold">No delivered orders recorded yet today.</td>
            </tr>
        `;
        return;
    }

    listBody.innerHTML = deliveredList.map(ord => `
        <tr class="hover:bg-surface-container-low dark:hover:bg-[#202123]">
            <td class="px-6 py-4 font-black text-sm text-on-surface dark:text-white">#${ord.id}</td>
            <td class="px-6 py-4 font-semibold text-sm">${ord.studentName} (${ord.studentId})</td>
            <td class="px-6 py-4 text-xs font-medium text-gray-400">${ord.items.map(i => `${i.name} ×${i.qty}`).join(', ')}</td>
            <td class="px-6 py-4 font-black text-sm text-primary dark:text-[#86d4d3]">৳ ${ord.total.toFixed(2)}</td>
            <td class="px-6 py-4"><span class="px-2.5 py-1 bg-gray-500/20 text-gray-700 dark:text-gray-300 font-black text-[10px] uppercase rounded">Delivered</span></td>
            <td class="px-6 py-4 text-right">
                <button onclick="openOrderDetailsModal('${ord.id}')" class="text-xs font-bold text-primary dark:text-[#86d4d3] hover:underline">View Receipt</button>
            </td>
        </tr>
    `).join('');
}

// ----------------------------------------------------
// TAB: INVENTORY & STOCK MANAGEMENT
// ----------------------------------------------------
function renderInventoryTab() {
    const listBody = document.getElementById("table-body-inventory");
    if (!listBody) return;

    let filtered = state.inventory;
    if (state.searchQuery.trim() !== "") {
        const q = state.searchQuery.trim().toLowerCase();
        filtered = filtered.filter(i => i.name.toLowerCase().includes(q));
    }

    listBody.innerHTML = filtered.map((item) => {
        const originalIdx = state.inventory.findIndex(i => i.name === item.name);
        const isLow = item.stock <= 5 || item.isLow;
        const statusBadge = isLow
            ? `<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40">LOW STOCK</span>`
            : `<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">IN STOCK</span>`;

        return `
            <tr class="hover:bg-surface-container-low dark:hover:bg-[#202123] transition-colors">
                <td class="px-6 py-4">
                    <span class="font-extrabold text-sm text-on-surface dark:text-white block">${item.name}</span>
                </td>
                <td class="px-6 py-4 text-sm font-black ${isLow ? 'text-red-500' : 'text-on-surface dark:text-white'}">
                    ${item.stock} ${item.unit}
                </td>
                <td class="px-6 py-4">${statusBadge}</td>
                <td class="px-6 py-4 text-right select-none">
                    <div class="flex justify-end items-center gap-2">
                        <button onclick="openUpdateStockModal(${originalIdx})" class="px-3.5 py-1.5 bg-primary hover:bg-primary-container text-on-primary rounded-xl text-xs font-extrabold shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-1" title="Update Stock Volume">
                            <span class="material-symbols-outlined text-sm">edit_square</span> Update Stock
                        </button>
                        <button onclick="markOutOfStock(${originalIdx})" class="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl transition-all active:scale-95 flex items-center justify-center shrink-0" title="Mark Out of Stock (Set volume to 0)">
                            <span class="material-symbols-outlined text-base">do_not_disturb_on</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

window.openUpdateStockModal = function (idx) {
    const item = state.inventory[idx];
    if (!item) return;

    const modal = document.getElementById("modal-update-stock");
    const itemIdxInput = document.getElementById("update-stock-item-idx");
    const itemNameEl = document.getElementById("update-stock-item-name");
    const itemUnitEl = document.getElementById("update-stock-item-unit");
    const itemBadgeEl = document.getElementById("update-stock-current-badge");
    const valInput = document.getElementById("update-stock-val-input");
    const noteInput = document.getElementById("update-stock-note");

    if (!modal) return;

    if (itemIdxInput) itemIdxInput.value = idx.toString();
    if (itemNameEl) itemNameEl.innerText = item.name;
    if (itemUnitEl) itemUnitEl.innerText = `Unit Measure: ${item.unit}`;
    if (itemBadgeEl) {
        const isLow = item.stock <= 5 || item.isLow;
        itemBadgeEl.className = isLow
            ? "px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40"
            : "px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-700 dark:text-emerald-300";
        itemBadgeEl.innerText = `Current: ${item.stock} ${item.unit}`;
    }
    if (valInput) valInput.value = item.stock.toString();
    if (noteInput) noteInput.value = "";

    modal.classList.add("modal-open");
    modal.classList.remove("hidden");
    void modal.offsetWidth;
    modal.classList.add("opacity-100");
};

window.closeUpdateStockModal = function () {
    const modal = document.getElementById("modal-update-stock");
    if (modal) {
        modal.classList.remove("opacity-100");
        setTimeout(() => {
            if (!modal.classList.contains("opacity-100")) {
                modal.classList.add("hidden");
                modal.classList.remove("modal-open");
            }
        }, 250);
    }
};

window.adjustStockPreset = function (amount) {
    const valInput = document.getElementById("update-stock-val-input");
    if (valInput) {
        const curr = parseInt(valInput.value) || 0;
        valInput.value = (curr + amount).toString();
    }
};

window.setStockPresetZero = function () {
    const valInput = document.getElementById("update-stock-val-input");
    if (valInput) valInput.value = "0";
};

window.stepStockInput = function (step) {
    const valInput = document.getElementById("update-stock-val-input");
    if (valInput) {
        const curr = parseInt(valInput.value) || 0;
        valInput.value = Math.max(0, curr + step).toString();
    }
};

window.handleSaveStockUpdate = function (event) {
    event.preventDefault();
    const idxStr = document.getElementById("update-stock-item-idx")?.value;
    const valInput = document.getElementById("update-stock-val-input")?.value;
    const noteInput = document.getElementById("update-stock-note")?.value;

    const idx = parseInt(idxStr);
    const item = state.inventory[idx];
    if (!item) return;

    const val = parseInt(valInput);
    if (!isNaN(val) && val >= 0) {
        item.stock = val;
        item.isLow = val <= 5;
        const noteMsg = noteInput ? ` (${noteInput})` : '';
        item.history.unshift(`Stock updated to ${val} ${item.unit}${noteMsg} on ${new Date().toLocaleTimeString()}`);
        
        closeUpdateStockModal();
        renderActiveTab();
        showToast(`Stock updated for ${item.name} to ${val} ${item.unit}! 📦`, "success");
    }
};

window.markOutOfStock = function (idx) {
    const item = state.inventory[idx];
    if (!item) return;

    item.stock = 0;
    item.isLow = true;
    item.history.unshift(`Marked OUT OF STOCK on ${new Date().toLocaleTimeString()}`);

    renderActiveTab();
    showToast(`${item.name} marked as OUT OF STOCK! 🚫`, "error");
};

window.openAddInventoryItemModal = function () {
    const modal = document.getElementById("modal-add-inventory-item");
    if (!modal) return;

    const nameEl = document.getElementById("new-inv-name");
    const stockEl = document.getElementById("new-inv-stock");
    const unitEl = document.getElementById("new-inv-unit");
    const vendorEl = document.getElementById("new-inv-vendor");

    if (nameEl) nameEl.value = "";
    if (stockEl) stockEl.value = "20";
    if (unitEl) unitEl.value = "kg";
    if (vendorEl) vendorEl.value = "";

    modal.classList.add("modal-open");
    modal.classList.remove("hidden");
    void modal.offsetWidth;
    modal.classList.add("opacity-100");
};

window.closeAddInventoryItemModal = function () {
    const modal = document.getElementById("modal-add-inventory-item");
    if (modal) {
        modal.classList.remove("opacity-100");
        setTimeout(() => {
            if (!modal.classList.contains("opacity-100")) {
                modal.classList.add("hidden");
                modal.classList.remove("modal-open");
            }
        }, 250);
    }
};

window.handleCreateInventoryItem = function (event) {
    event.preventDefault();
    const name = document.getElementById("new-inv-name")?.value.trim();
    const stockVal = parseInt(document.getElementById("new-inv-stock")?.value) || 0;
    const unit = document.getElementById("new-inv-unit")?.value || "kg";
    const vendor = document.getElementById("new-inv-vendor")?.value.trim();

    if (!name) return;

    const existing = state.inventory.find(i => i.name.toLowerCase() === name.toLowerCase());
    if (existing) {
        existing.stock += stockVal;
        existing.isLow = existing.stock <= 5;
        showToast(`Updated existing inventory item "${existing.name}" by +${stockVal} ${unit}!`, "info");
    } else {
        const newItem = {
            id: `INV-${Date.now().toString().slice(-4)}`,
            name: name,
            stock: stockVal,
            unit: unit,
            isLow: stockVal <= 5,
            history: [`Registered in inventory on ${new Date().toLocaleTimeString()}${vendor ? ` via ${vendor}` : ''}`]
        };
        state.inventory.unshift(newItem);
        showToast(`New inventory item "${name}" registered successfully! 📦`, "success");
    }

    closeAddInventoryItemModal();
    renderActiveTab();
};

// ----------------------------------------------------
// TAB: NOTIFICATIONS
// ----------------------------------------------------
function renderNotificationsTab() {
    const container = document.getElementById("notifications-feed-list");
    if (!container) return;

    container.innerHTML = state.notifications.map(n => `
        <div class="p-4 bg-white dark:bg-[#1e2022] border border-outline-variant dark:border-[#2d3135] rounded-xl flex items-start gap-4 shadow-sm">
            <span class="material-symbols-outlined text-primary bg-primary/10 p-2.5 rounded-full text-lg">notifications</span>
            <div class="flex-1">
                <div class="flex justify-between items-center">
                    <h5 class="font-extrabold text-sm text-on-surface dark:text-white">${n.title}</h5>
                    <span class="text-[10px] font-semibold text-gray-400">${n.time}</span>
                </div>
                <p class="text-xs font-semibold text-on-surface-variant dark:text-gray-300 mt-0.5">${n.msg}</p>
            </div>
        </div>
    `).join('');
}

// ----------------------------------------------------
// TAB: REPORTS & DAILY SUMMARY
// ----------------------------------------------------
function renderReportsTab() {
    const elOrders = document.getElementById("summary-orders-today");
    const elMeals = document.getElementById("summary-meals-served");
    const elRevenue = document.getElementById("summary-revenue");
    const elAvgTime = document.getElementById("summary-avg-time");
    const elCancelled = document.getElementById("summary-cancelled");
    const elPopular = document.getElementById("summary-popular-meal");

    const deliveredCount = state.orders.filter(o => o.status === "Delivered" || o.status === "Completed").length;
    const totalRev = state.orders.reduce((acc, o) => acc + (o.status !== "Cancelled" ? o.total : 0), 0);

    if (elOrders) elOrders.innerText = state.orders.length.toString();
    if (elMeals) elMeals.innerText = (deliveredCount * 2).toString();
    if (elRevenue) elRevenue.innerText = `৳ ${totalRev.toLocaleString()}`;
    if (elAvgTime) elAvgTime.innerText = `${state.dailyMetrics.averagePrepMinutes} mins`;
    if (elCancelled) elCancelled.innerText = state.dailyMetrics.cancelledOrders.toString();
    if (elPopular) elPopular.innerText = state.dailyMetrics.mostOrderedMeal;
}

// ----------------------------------------------------
// ORDER DETAILS MODAL & PRINT RECEIPT
// ----------------------------------------------------
window.openOrderDetailsModal = function (orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    const modal = document.getElementById("modal-order-details");
    const content = document.getElementById("modal-order-details-body");
    if (!modal || !content) return;

    const itemsHTML = order.items.map(i => {
        const estItemPrice = parseFloat((order.total / order.items.reduce((s, it) => s + (it.qty || 1), 1) * i.qty).toFixed(2));
        return `
            <tr class="border-b border-dashed border-outline-variant/30 text-xs">
                <td class="p-2 font-black text-primary dark:text-[#86d4d3]">×${i.qty}</td>
                <td class="p-2 font-bold text-on-surface dark:text-gray-100">${i.name}</td>
                <td class="p-2 text-right font-mono font-bold text-on-surface dark:text-gray-200">৳ ${estItemPrice.toFixed(2)}</td>
            </tr>
        `;
    }).join('');

    content.innerHTML = `
        <div class="space-y-4 select-none">
            
            <!-- Receipt Header Branding -->
            <div class="text-center border-b-2 border-dashed border-outline-variant/40 pb-4 space-y-1">
                <div class="inline-flex items-center gap-1.5 bg-primary/10 text-primary dark:text-[#86d4d3] px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                    <span class="material-symbols-outlined text-sm">restaurant</span> CampusPay Canteen POS
                </div>
                <h2 class="text-base font-black text-on-surface dark:text-white uppercase tracking-tight">Military Institute of Science & Technology</h2>
                <p class="text-[10px] text-gray-400 font-medium">MIST Campus Canteen • Official Kitchen Order Slip</p>
                
                <div class="pt-2 flex justify-center items-center gap-3">
                    <span class="text-3xl font-black text-primary dark:text-[#86d4d3] tracking-tighter">ORDER #${order.id}</span>
                    <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusBadgeClass(order.status)}">${order.status}</span>
                </div>
            </div>

            <!-- Order Metadata & Customer Info Box -->
            <div class="bg-surface-container-low dark:bg-[#151617] p-3.5 rounded-2xl border border-outline-variant/30 text-xs space-y-2 font-semibold">
                <div class="flex justify-between items-center">
                    <span class="text-gray-400 font-bold uppercase text-[10px]">Customer</span>
                    <span class="font-extrabold text-on-surface dark:text-white">${order.studentName} <span class="text-gray-400">(${order.studentId})</span></span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-400 font-bold uppercase text-[10px]">Date & Time</span>
                    <span class="font-mono text-gray-500 dark:text-gray-400">${new Date(order.orderTime).toLocaleDateString()} ${new Date(order.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-400 font-bold uppercase text-[10px]">Dining Mode</span>
                    <span class="font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded text-[10px] uppercase">${order.pickupType}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-400 font-bold uppercase text-[10px]">Payment Status</span>
                    <span class="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] uppercase flex items-center gap-1">
                        <span class="material-symbols-outlined text-xs">verified</span> ${order.payment}
                    </span>
                </div>
            </div>

            <!-- Items Table -->
            <div class="space-y-1">
                <span class="text-[10px] font-black uppercase text-gray-400 tracking-wider block">Kitchen Items Checklist</span>
                <div class="bg-white dark:bg-[#1e2022] rounded-xl border border-outline-variant/30 overflow-hidden">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-gray-100 dark:bg-[#25282a] text-[10px] uppercase font-black text-gray-400 border-b border-outline-variant/30">
                                <th class="p-2">Qty</th>
                                <th class="p-2">Item Description</th>
                                <th class="p-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHTML}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Special Instructions Box -->
            ${order.specialNote ? `
                <div class="p-3 bg-red-500/10 border-l-4 border-red-500 rounded-r-xl">
                    <span class="text-[10px] font-black uppercase text-red-600 dark:text-red-400 block flex items-center gap-1">
                        <span class="material-symbols-outlined text-xs">warning</span> Special Kitchen Instructions
                    </span>
                    <p class="text-xs font-bold text-red-700 dark:text-red-300 italic mt-0.5">"${order.specialNote}"</p>
                </div>
            ` : ''}

            <!-- Total Amount Bar -->
            <div class="flex justify-between items-center bg-primary/10 dark:bg-[#86d4d3]/10 p-3 rounded-2xl border border-primary/20">
                <span class="font-black text-xs uppercase text-primary dark:text-[#86d4d3]">Grand Total Paid</span>
                <span class="text-xl font-black text-primary dark:text-[#86d4d3]">৳ ${parseFloat(order.total).toFixed(2)}</span>
            </div>

            <!-- Barcode Verification Simulation -->
            <div class="text-center pt-2 space-y-1">
                <div class="inline-block bg-black dark:bg-white text-white dark:text-black font-mono font-black text-xs px-4 py-1.5 rounded tracking-widest select-all">
                    ||| | |||| | || | ||| ORDER-${order.id} ||| | ||
                </div>
                <p class="text-[9px] text-gray-400 font-medium">*** OFFICIAL KITCHEN DUPLICATE TICKET ***</p>
            </div>

            <!-- Print Action Buttons -->
            <div class="pt-3 border-t border-outline-variant/30 flex items-center justify-end gap-3">
                <button type="button" onclick="closeOrderDetailsModal()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#2c2d30] dark:hover:bg-[#383a3e] text-on-surface dark:text-gray-300 font-bold text-xs rounded-xl transition-all">
                    Close
                </button>
                <button type="button" onclick="printOrderReceipt('${order.id}')" class="px-5 py-2.5 bg-primary hover:bg-primary-container text-on-primary font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2">
                    <span class="material-symbols-outlined text-base">print</span>
                    Print Kitchen Receipt
                </button>
            </div>

        </div>
    `;

    modal.classList.add("modal-open");
    modal.classList.remove("hidden");
    void modal.offsetWidth;
    modal.classList.add("opacity-100");
};

window.closeOrderDetailsModal = function () {
    const modal = document.getElementById("modal-order-details");
    if (modal) {
        modal.classList.remove("opacity-100");
        setTimeout(() => {
            if (!modal.classList.contains("opacity-100")) {
                modal.classList.add("hidden");
                modal.classList.remove("modal-open");
            }
        }, 250);
    }
};

window.openAndPrintOrderReceipt = function (orderId) {
    openOrderDetailsModal(orderId);
    setTimeout(() => {
        printOrderReceipt(orderId);
    }, 200);
};

window.printOrderReceipt = function (orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    const receiptEl = document.getElementById("printable-receipt");
    if (receiptEl) {
        receiptEl.innerHTML = `
            <div style="font-family: monospace; font-size: 12px; color: #000; width: 80mm; padding: 5px;">
                <div style="text-align: center; border-bottom: 2px dashed #000; padding-bottom: 8px; margin-bottom: 8px;">
                    <h2 style="font-size: 15px; margin: 0; font-weight: 900;">CAMPUSPAY CANTEEN</h2>
                    <p style="font-size: 10px; margin: 2px 0;">MIST Kitchen Receipt Slip</p>
                    <h1 style="font-size: 22px; margin: 6px 0; font-weight: 900;">ORDER #${order.id}</h1>
                    <p style="font-size: 10px; margin: 0;">Status: <strong>${order.status.toUpperCase()}</strong></p>
                </div>

                <div style="font-size: 11px; margin-bottom: 8px;">
                    <p style="margin: 2px 0;"><strong>Date:</strong> ${new Date(order.orderTime).toLocaleDateString()} ${new Date(order.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p style="margin: 2px 0;"><strong>Student:</strong> ${order.studentName}</p>
                    <p style="margin: 2px 0;"><strong>ID Roll:</strong> ${order.studentId}</p>
                    <p style="margin: 2px 0;"><strong>Mode:</strong> ${order.pickupType.toUpperCase()}</p>
                    <p style="margin: 2px 0;"><strong>Payment:</strong> ${order.payment.toUpperCase()}</p>
                </div>

                <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 6px 0; margin-bottom: 8px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                        <thead>
                            <tr style="text-align: left; border-bottom: 1px solid #000;">
                                <th style="padding: 2px 0;">QTY</th>
                                <th style="padding: 2px 0;">ITEM DESCRIPTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(i => `
                                <tr>
                                    <td style="padding: 4px 0; font-weight: bold; width: 35px;">${i.qty}x</td>
                                    <td style="padding: 4px 0; font-weight: bold;">${i.name}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                ${order.specialNote ? `
                    <div style="border: 1px solid #000; padding: 6px; margin-bottom: 8px;">
                        <p style="margin: 0; font-size: 10px; font-weight: bold;">SPECIAL INSTRUCTIONS:</p>
                        <p style="margin: 2px 0 0 0; font-size: 11px;">"${order.specialNote}"</p>
                    </div>
                ` : ''}

                <div style="text-align: right; font-size: 13px; font-weight: 900; margin-bottom: 10px;">
                    TOTAL PAID: ৳ ${parseFloat(order.total).toFixed(2)}
                </div>

                <div style="text-align: center; border-top: 1px dashed #000; padding-top: 6px; font-size: 10px;">
                    <p style="margin: 4px 0; font-weight: bold;">||| | |||| | || | ||| ORDER-${order.id} |||</p>
                    <p style="margin: 0;">*** OFFICIAL KITCHEN TICKET SLIP ***</p>
                </div>
            </div>
        `;
        window.print();
    }
};

// Add New Item Modal handler
window.openAddItemModal = function () {
    const name = prompt("Enter food item name:");
    if (!name) return;
    const category = prompt("Enter category (e.g. Fast Food, Main Course, Beverages, Snacks, Desserts):", "Main Course") || "Main Course";
    const price = parseFloat(prompt("Enter selling price (৳):", "100"));
    if (isNaN(price)) return;

    state.foodMenu.push({
        id: "m" + (state.foodMenu.length + 1),
        name: name,
        category: category,
        price: price,
        stock: 20,
        status: "Available",
        prepTime: "10 mins",
        rating: "4.8 ⭐",
        tags: ["Halal", "New Item"],
        desc: "Freshly prepared canteen item.",
        img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80"
    });

    renderActiveTab();
    showToast(`${name} added to canteen food menu catalog!`, "success");
};

// ----------------------------------------------------
// CREATE MANUAL ORDER MODAL (Walk-in Canteen Customer)
// ----------------------------------------------------
window.openCreateOrderModal = function () {
    const modal = document.getElementById("modal-create-order");
    if (!modal) return;

    // Populate preset items dropdown from state.foodMenu
    const selectPreset = document.getElementById("manual-food-preset");
    if (selectPreset) {
        selectPreset.innerHTML = `<option value="">-- Choose Menu Preset (or type custom item below) --</option>` +
            state.foodMenu.map((item, idx) => `<option value="${idx}">${item.name} — ৳${item.price}</option>`).join("");
    }

    // Reset form defaults
    const nameEl = document.getElementById("manual-student-name");
    const idEl = document.getElementById("manual-student-id");
    const foodEl = document.getElementById("manual-food-name");
    const qtyEl = document.getElementById("manual-quantity");
    const priceEl = document.getElementById("manual-total-price");
    const notesEl = document.getElementById("manual-notes");

    if (nameEl) nameEl.value = "Walk-in Customer";
    if (idEl) idEl.value = "";
    if (foodEl) foodEl.value = "";
    if (qtyEl) qtyEl.value = "1";
    if (priceEl) priceEl.value = "";
    if (notesEl) notesEl.value = "";

    modal.classList.remove("hidden");
    void modal.offsetWidth;
    modal.classList.remove("opacity-0");
    modal.classList.add("opacity-100");
};

window.closeCreateOrderModal = function () {
    const modal = document.getElementById("modal-create-order");
    if (!modal) return;

    modal.classList.remove("opacity-100");
    modal.classList.add("opacity-0");
    setTimeout(() => {
        if (modal.classList.contains("opacity-0")) {
            modal.classList.add("hidden");
        }
    }, 300);
};

window.onManualFoodPresetChange = function () {
    const selectPreset = document.getElementById("manual-food-preset");
    const foodEl = document.getElementById("manual-food-name");
    const qtyEl = document.getElementById("manual-quantity");
    const priceEl = document.getElementById("manual-total-price");

    if (!selectPreset || !foodEl || !priceEl) return;

    const selectedIdx = selectPreset.value;
    if (selectedIdx !== "" && state.foodMenu[selectedIdx]) {
        const item = state.foodMenu[selectedIdx];
        foodEl.value = item.name;
        const qty = parseInt(qtyEl?.value || 1);
        priceEl.value = (item.price * qty).toString();
    }
};

window.calculateManualTotal = function () {
    const selectPreset = document.getElementById("manual-food-preset");
    const qtyEl = document.getElementById("manual-quantity");
    const priceEl = document.getElementById("manual-total-price");

    if (!selectPreset || !qtyEl || !priceEl) return;
    const selectedIdx = selectPreset.value;
    if (selectedIdx !== "" && state.foodMenu[selectedIdx]) {
        const item = state.foodMenu[selectedIdx];
        const qty = Math.max(1, parseInt(qtyEl.value || 1));
        priceEl.value = (item.price * qty).toString();
    }
};

window.handleCreateManualOrder = function (e) {
    e.preventDefault();

    const name = document.getElementById("manual-student-name")?.value.trim() || "Walk-in Customer";
    const studentId = document.getElementById("manual-student-id")?.value.trim() || "WALKIN-GUEST";
    const foodName = document.getElementById("manual-food-name")?.value.trim();
    const qty = parseInt(document.getElementById("manual-quantity")?.value || 1);
    const totalPrice = parseFloat(document.getElementById("manual-total-price")?.value || 0);
    const dineOption = document.getElementById("manual-dine-option")?.value || "Dine In";
    const paymentStatus = document.getElementById("manual-payment-status")?.value || "Paid";
    const orderStatus = document.getElementById("manual-order-status")?.value || "Pending";
    const notes = document.getElementById("manual-notes")?.value.trim() || "Walk-in cash order";

    if (!foodName) {
        showToast("Please enter a food item name!", "error");
        return;
    }
    if (totalPrice <= 0) {
        showToast("Please enter a valid total price!", "error");
        return;
    }

    const newId = getNextGlobalOrderId();
    const newOrder = {
        id: newId,
        studentName: name,
        studentId: studentId,
        orderTime: Date.now(),
        items: [{ name: foodName, qty: qty, tags: ["Walk-in"] }],
        specialNote: notes,
        total: totalPrice,
        payment: paymentStatus,
        pickupType: dineOption === "Parcel" ? "Parcel" : "Counter Pickup",
        dineOption: dineOption,
        status: orderStatus,
        isPinned: false,
        statusHistory: [{ status: orderStatus, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
    };

    state.orders.unshift(newOrder);
    saveState();
    playAudioChime("new_order");
    closeCreateOrderModal();
    renderActiveTab();
    showToast(`✅ Order #${newOrder.id} (${foodName}) created successfully!`, "success");
};

// ----------------------------------------------------
// EDIT FOOD MENU ITEM MODAL HANDLERS
// ----------------------------------------------------
window.openEditFoodModal = function (idx) {
    const item = state.foodMenu[idx];
    if (!item) return;

    const modal = document.getElementById("modal-edit-food-item");
    if (!modal) return;

    document.getElementById("edit-food-idx").value = idx.toString();
    document.getElementById("edit-food-name").value = item.name || "";
    document.getElementById("edit-food-price").value = item.price || "";
    document.getElementById("edit-food-img").value = item.img || "";
    document.getElementById("edit-food-preptime").value = item.prepTime || "10 mins";
    document.getElementById("edit-food-category").value = item.category || "Main Course";
    document.getElementById("edit-food-stock").value = item.stock !== undefined ? item.stock : 25;
    document.getElementById("edit-food-status").value = item.status || "Available";
    document.getElementById("edit-food-desc").value = item.desc || "";
    document.getElementById("edit-food-tags").value = (item.tags || []).filter(t => t !== "Halal").join(", ");

    modal.classList.remove("hidden");
    void modal.offsetWidth;
    modal.classList.remove("opacity-0");
    modal.classList.add("opacity-100");
};

window.closeEditFoodModal = function () {
    const modal = document.getElementById("modal-edit-food-item");
    if (!modal) return;

    modal.classList.remove("opacity-100");
    modal.classList.add("opacity-0");
    setTimeout(() => {
        if (modal.classList.contains("opacity-0")) {
            modal.classList.add("hidden");
        }
    }, 300);
};

window.setEditImgPreset = function (key) {
    const imgInput = document.getElementById("edit-food-img");
    if (!imgInput) return;
    const presets = {
        burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80",
        biryani: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
        coffee: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80",
        sandwich: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80"
    };
    if (presets[key]) imgInput.value = presets[key];
};

window.handleEditFoodItemSubmit = function (e) {
    e.preventDefault();
    const idxStr = document.getElementById("edit-food-idx")?.value;
    const idx = parseInt(idxStr);
    if (isNaN(idx) || !state.foodMenu[idx]) return;

    const item = state.foodMenu[idx];
    item.name = document.getElementById("edit-food-name")?.value.trim() || item.name;
    item.price = parseFloat(document.getElementById("edit-food-price")?.value || item.price);
    item.img = document.getElementById("edit-food-img")?.value.trim() || item.img;
    item.prepTime = document.getElementById("edit-food-preptime")?.value.trim() || item.prepTime;
    item.category = document.getElementById("edit-food-category")?.value || item.category;
    item.stock = parseInt(document.getElementById("edit-food-stock")?.value || 25);
    item.status = document.getElementById("edit-food-status")?.value || "Available";
    item.desc = document.getElementById("edit-food-desc")?.value.trim() || item.desc;
    
    const rawTags = document.getElementById("edit-food-tags")?.value.split(",") || [];
    item.tags = rawTags.map(t => t.trim()).filter(t => t !== "" && t !== "Halal");

    localStorage.setItem('campuspay-canteen-menu', JSON.stringify(state.foodMenu));
    saveState();
    closeEditFoodModal();
    renderActiveTab();
    showToast(`✅ ${item.name} menu details updated!`, "success");
};

// Event Listeners setup
function initEventListeners() {
    const tabButtons = document.querySelectorAll(".sidebar-tab-btn");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const dest = btn.getAttribute("data-tab");
            switchTab(dest);
        });
    });

    const searchInput = document.getElementById("staff-global-search");
    searchInput?.addEventListener("input", (e) => {
        state.searchQuery = e.target.value;
        renderActiveTab();
    });

    const themeBtn = document.getElementById("theme-toggle");
    themeBtn?.addEventListener("click", toggleTheme);

    const menuBtn = document.getElementById("staff-menu-toggle-btn");
    menuBtn?.addEventListener("click", openMobileNav);

    const drawerBackdrop = document.getElementById("mobile-nav-backdrop");
    drawerBackdrop?.addEventListener("click", closeMobileNav);

    const modalDetails = document.getElementById("modal-order-details");
    modalDetails?.addEventListener("click", (e) => {
        if (e.target === modalDetails) closeOrderDetailsModal();
    });

    const modalCreate = document.getElementById("modal-create-order");
    modalCreate?.addEventListener("click", (e) => {
        if (e.target === modalCreate) closeCreateOrderModal();
    });

    const modalEditFood = document.getElementById("modal-edit-food-item");
    modalEditFood?.addEventListener("click", (e) => {
        if (e.target === modalEditFood) closeEditFoodModal();
    });

    const modalTransfer = document.getElementById("modal-create-food-transfer");
    modalTransfer?.addEventListener("click", (e) => {
        if (e.target === modalTransfer) closeCreateFoodTransferModal();
    });

    const modalBranchReport = document.getElementById("modal-branch-report-generator");
    modalBranchReport?.addEventListener("click", (e) => {
        if (e.target === modalBranchReport) closeBranchReportModal();
    });
}

// ----------------------------------------------------
// TAB: BRANCH MANAGEMENT & FOOD DISPATCH HUB
// ----------------------------------------------------
let activeDispatchFilterStatus = "ALL";

window.switchBranch = function (branchId) {
    state.selectedBranchId = branchId;
    const dropdown = document.getElementById("branch-select-dropdown");
    if (dropdown) dropdown.value = branchId;

    const quickBranchName = document.getElementById("quick-transfer-branch-name");
    const activeBranch = state.branches.find(b => b.id === branchId);
    if (quickBranchName && activeBranch) {
        quickBranchName.value = activeBranch.name;
    }

    renderBranchManagementTab();
    showToast(`Switched view to ${activeBranch?.name || branchId} 🟢`, "info");
};

window.filterDispatchesByStatus = function (status) {
    activeDispatchFilterStatus = status;
    const buttons = document.querySelectorAll(".dispatch-filter-btn");
    buttons.forEach(btn => {
        if (btn.innerText.toLowerCase() === status.toLowerCase() || (status === "ALL" && btn.innerText === "All")) {
            btn.className = "dispatch-filter-btn px-3 py-1 rounded-lg bg-primary/10 text-primary dark:text-[#86d4d3] font-black text-xs";
        } else {
            btn.className = "dispatch-filter-btn px-3 py-1 rounded-lg text-gray-500 hover:text-on-surface text-xs font-bold";
        }
    });
    renderBranchDispatchesTable();
};

function renderBranchManagementTab() {
    const branch = state.branches[0];
    if (!branch) return;

    // 1. Branch Profile Card (without ID number)
    const profileContainer = document.getElementById("branch-profile-card-container");
    if (profileContainer) {
        profileContainer.innerHTML = `
            <div class="glass-card bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-white/10 flex flex-wrap justify-between items-center gap-6">
                <div class="space-y-1.5 flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-white shadow-md">
                            ${branch.status === 'Open' ? '🟢 OPERATING OPEN' : '🔴 CLOSED'}
                        </span>
                    </div>
                    <h2 class="text-2xl font-black tracking-tight text-white truncate">${branch.name}</h2>
                    <p class="text-xs font-semibold text-gray-300 flex items-center gap-2">
                        <span><strong class="text-amber-300">Manager:</strong> ${branch.manager} (${branch.contact})</span> • 
                        <span><strong class="text-amber-300">Address:</strong> ${branch.address}</span>
                    </p>
                </div>

                <div class="flex items-center gap-4 border-l border-white/10 pl-6 shrink-0">
                    <div class="text-right">
                        <span class="text-[10px] font-bold uppercase text-indigo-300 block">Gross Sales Today</span>
                        <span class="text-2xl font-black text-emerald-400">৳ ${branch.salesToday.toLocaleString()}</span>
                        <span class="text-[10px] font-medium text-gray-300 block mt-0.5">Last Sync: ${branch.lastSync}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderBranchDispatchesTable();
    renderBranchPendingRequests();
    renderBranchSalesOverview();
    renderBranchNotificationsLog();
}

function getDispatchStatusClass(status) {
    if (status === "Dispatched" || status === "Received") {
        return "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 rounded-lg px-2.5 py-1 text-xs font-black focus:outline-none cursor-pointer";
    } else if (status === "Rejected") {
        return "bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40 rounded-lg px-2.5 py-1 text-xs font-black focus:outline-none cursor-pointer";
    } else {
        return "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 rounded-lg px-2.5 py-1 text-xs font-black focus:outline-none cursor-pointer";
    }
}

function renderBranchDispatchesTable() {
    const branch = state.branches[0];
    const tbody = document.getElementById("table-body-branch-dispatches");
    if (!tbody || !branch) return;

    let list = branch.dispatches;
    if (activeDispatchFilterStatus !== "ALL") {
        list = list.filter(d => {
            if (activeDispatchFilterStatus === "Pending") return d.status === "Pending" || d.status === "Preparing";
            return d.status.toLowerCase() === activeDispatchFilterStatus.toLowerCase();
        });
    }

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="p-6 text-center text-gray-400 font-bold">No food dispatches matching status "${activeDispatchFilterStatus}".</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(d => {
        const selectClass = getDispatchStatusClass(d.status);
        return `
            <tr class="hover:bg-surface-container-low dark:hover:bg-[#202123]">
                <td class="p-3 font-black text-primary dark:text-[#86d4d3]">${d.id}</td>
                <td class="p-3 font-mono text-gray-500">${d.time}</td>
                <td class="p-3 font-bold text-on-surface dark:text-gray-200">${d.itemsCount} Food Items</td>
                <td class="p-3 font-mono font-black">${d.totalQty} units</td>
                <td class="p-3 font-mono font-black text-emerald-600 dark:text-emerald-400">৳ ${d.totalVal.toLocaleString()}</td>
                <td class="p-3 text-gray-500">${d.prepBy}</td>
                <td class="p-3 text-gray-500">${d.delBy}</td>
                <td class="p-3">
                    <select onchange="updateDispatchStatus('${d.id}', this.value, this)" class="${selectClass}">
                        <option value="Pending" ${d.status === 'Pending' || d.status === 'Preparing' ? 'selected' : ''}>Pending</option>
                        <option value="Dispatched" ${d.status === 'Dispatched' || d.status === 'Received' ? 'selected' : ''}>Dispatched</option>
                        <option value="Rejected" ${d.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                </td>
            </tr>
        `;
    }).join("");
}

window.updateDispatchStatus = function (dispId, newStatus, selectEl) {
    const branch = state.branches[0];
    if (!branch) return;
    const disp = branch.dispatches.find(d => d.id === dispId);
    if (disp) {
        disp.status = newStatus;
        if (selectEl) {
            selectEl.className = getDispatchStatusClass(newStatus);
        }
        showToast(`Dispatch ${dispId} status updated to "${newStatus}"!`, "info");
    }
};


window.toggleBranchNotifDropdown = function (event) {
    event.stopPropagation();
    const dropdown = document.getElementById("branch-notif-dropdown");
    if (dropdown) {
        dropdown.classList.toggle("hidden");
    }
};

document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("branch-notif-dropdown");
    if (dropdown && !dropdown.classList.contains("hidden")) {
        if (!dropdown.contains(e.target) && !e.target.closest("button[onclick*='toggleBranchNotifDropdown']")) {
            dropdown.classList.add("hidden");
        }
    }
});

function renderBranchInventoryTable() {
    const branch = state.branches.find(b => b.id === state.selectedBranchId) || state.branches[0];
    const tbody = document.getElementById("table-body-branch-inventory");
    if (!tbody || !branch) return;

    tbody.innerHTML = branch.inventory.map(item => {
        const badgeClass = item.status === "Healthy" ? "bg-emerald-500/20 text-emerald-600" :
                           item.status === "Running Low" ? "bg-amber-500/20 text-amber-600" : "bg-red-500/20 text-red-600 border border-red-500/40";
        return `
            <tr class="hover:bg-surface-container-low dark:hover:bg-[#202123]">
                <td class="p-3 font-extrabold text-on-surface dark:text-white">${item.name}</td>
                <td class="p-3 font-mono text-gray-400">${item.opening}</td>
                <td class="p-3 font-mono text-emerald-600 font-bold">+${item.received}</td>
                <td class="p-3 font-mono text-purple-600 font-bold">-${item.sold}</td>
                <td class="p-3 font-mono font-black text-sm ${item.remaining <= item.minReq ? 'text-red-500' : 'text-on-surface dark:text-white'}">${item.remaining} units</td>
                <td class="p-3 font-mono text-gray-400">${item.minReq} units</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded bg-gray-100 dark:bg-[#202225] text-gray-500 text-[10px] font-bold">${item.expiry}</span></td>
                <td class="p-3"><span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${badgeClass}">${item.status}</span></td>
                <td class="p-3 text-right">
                    <button onclick="requestBranchRestock('${item.name}')" class="px-3 py-1 bg-primary/10 text-primary dark:text-[#86d4d3] hover:bg-primary hover:text-white rounded-lg text-xs font-bold transition-all">Request Restock</button>
                </td>
            </tr>
        `;
    }).join("");
}

function renderBranchPendingRequests() {
    const branch = state.branches.find(b => b.id === state.selectedBranchId) || state.branches[0];
    const container = document.getElementById("branch-pending-requests-list");
    const badge = document.getElementById("branch-pending-req-badge");
    if (!container || !branch) return;

    if (badge) badge.innerText = `${branch.pendingRequests.length} Pending`;

    if (branch.pendingRequests.length === 0) {
        container.innerHTML = `<div class="p-6 text-center text-gray-400 font-bold bg-surface-container-low dark:bg-[#151617] rounded-xl">No pending restock requests from ${branch.name}.</div>`;
        return;
    }

    container.innerHTML = branch.pendingRequests.map(req => `
        <div class="p-4 bg-surface-container-low dark:bg-[#151617] rounded-xl border border-outline-variant/30 space-y-2">
            <div class="flex justify-between items-center">
                <span class="font-black text-xs text-amber-500">${req.id} • ${req.priority}</span>
                <span class="text-[10px] font-bold text-gray-400">${req.time}</span>
            </div>
            <h5 class="font-extrabold text-sm text-on-surface dark:text-white">${req.items} (Qty: ${req.qty})</h5>
            <p class="text-xs text-gray-500">Requested by: <strong>${req.by}</strong></p>
            <div class="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
                <button onclick="rejectBranchRequest('${req.id}')" class="px-3 py-1 bg-red-500/10 text-red-600 rounded-lg text-xs font-bold hover:bg-red-500/20">Reject</button>
                <button onclick="approveBranchRequest('${req.id}')" class="px-4 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-black shadow-sm">Approve & Dispatch</button>
            </div>
        </div>
    `).join("");
}

function renderBranchSalesOverview() {
    const branch = state.branches[0];
    const container = document.getElementById("branch-sales-overview-cards");
    if (!container || !branch) return;

    container.innerHTML = `
        <div class="p-3.5 bg-surface-container-low dark:bg-[#151617] rounded-xl border border-outline-variant/20 flex flex-col justify-between h-full min-h-[75px]">
            <span class="text-[9px] font-black uppercase text-gray-400 block tracking-wider">Total Sales Today</span>
            <h5 class="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">৳ ${branch.salesToday.toLocaleString()}</h5>
        </div>
        <div class="p-3.5 bg-surface-container-low dark:bg-[#151617] rounded-xl border border-outline-variant/20 flex flex-col justify-between h-full min-h-[75px]">
            <span class="text-[9px] font-black uppercase text-gray-400 block tracking-wider">Transactions</span>
            <h5 class="text-base font-black text-primary dark:text-[#86d4d3] mt-1">${branch.transactionsCount} orders</h5>
        </div>
        <div class="p-3.5 bg-surface-container-low dark:bg-[#151617] rounded-xl border border-outline-variant/20 flex flex-col justify-between h-full min-h-[75px]">
            <span class="text-[9px] font-black uppercase text-gray-400 block tracking-wider">Avg Order Value</span>
            <h5 class="text-base font-black text-purple-600 dark:text-purple-400 mt-1">৳ ${branch.avgOrderVal}</h5>
        </div>
        <div class="p-3.5 bg-surface-container-low dark:bg-[#151617] rounded-xl border border-outline-variant/20 flex flex-col justify-between h-full min-h-[75px]">
            <span class="text-[9px] font-black uppercase text-gray-400 block tracking-wider">Most Sold Item</span>
            <h5 class="text-xs font-black text-on-surface dark:text-white mt-1 truncate" title="${branch.bestSeller}">${branch.bestSeller}</h5>
        </div>
        <div class="p-3.5 bg-surface-container-low dark:bg-[#151617] rounded-xl border border-outline-variant/20 flex flex-col justify-between h-full min-h-[75px]">
            <span class="text-[9px] font-black uppercase text-gray-400 block tracking-wider">Least Sold Item</span>
            <h5 class="text-xs font-black text-gray-500 dark:text-gray-400 mt-1 truncate" title="${branch.leastSold}">${branch.leastSold}</h5>
        </div>
        <div class="p-3.5 bg-surface-container-low dark:bg-[#151617] rounded-xl border border-outline-variant/20 flex flex-col justify-between h-full min-h-[75px]">
            <span class="text-[9px] font-black uppercase text-gray-400 block tracking-wider">Weekly Revenue</span>
            <h5 class="text-base font-black text-cyan-600 dark:text-cyan-400 mt-1">৳ ${branch.weeklyRev.toLocaleString()}</h5>
        </div>
    `;
}

function renderBranchStockMovementTimeline() {
    const container = document.getElementById("branch-stock-movement-timeline");
    if (!container) return;

    const timelineData = [
        { time: "08:30 AM", type: "Stock Sent", item: "Chicken Biryani (100 portions)", staff: "Chef Kabir", color: "text-blue-500", icon: "local_shipping" },
        { time: "09:15 AM", type: "Stock Received", item: "Biryani Verified at Branch", staff: "Branch Supervisor Sifat", color: "text-emerald-500", icon: "task_alt" },
        { time: "01:20 PM", type: "Stock Sold", item: "180 portions sold during lunch peak", staff: "Counter Staff Rahat", color: "text-purple-500", icon: "point_of_sale" },
        { time: "04:30 PM", type: "Returned Items", item: "15 Singara Trays returned", staff: "Driver Rafiq", color: "text-rose-500", icon: "assignment_return" }
    ];

    container.innerHTML = timelineData.map(t => `
        <div class="flex items-start gap-3 p-3 bg-surface-container-low dark:bg-[#151617] rounded-xl border border-outline-variant/20 text-xs font-semibold">
            <span class="material-symbols-outlined ${t.color} text-lg shrink-0">${t.icon}</span>
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center">
                    <span class="font-extrabold text-on-surface dark:text-white">${t.type}</span>
                    <span class="text-[10px] font-mono text-gray-400">${t.time}</span>
                </div>
                <p class="text-xs text-gray-500 truncate mt-0.5">${t.item} • By: <strong>${t.staff}</strong></p>
            </div>
        </div>
    `).join("");
}

function renderBranchLowStockWidget() {
    const branch = state.branches.find(b => b.id === state.selectedBranchId) || state.branches[0];
    const container = document.getElementById("branch-low-stock-widget-list");
    if (!container || !branch) return;

    const lowList = branch.inventory.filter(i => i.remaining <= i.minReq || i.status !== "Healthy");

    if (lowList.length === 0) {
        container.innerHTML = `<div class="p-4 text-center text-emerald-600 font-bold bg-emerald-500/10 rounded-xl">All branch items are healthy!</div>`;
        return;
    }

    container.innerHTML = lowList.map(item => `
        <div class="p-3 bg-red-500/10 border border-red-500/30 rounded-xl space-y-2 text-xs font-semibold">
            <div class="flex justify-between items-center">
                <span class="font-black text-red-700 dark:text-red-300 text-sm">${item.name}</span>
                <span class="px-2 py-0.5 bg-red-600 text-white font-mono text-[10px] font-black rounded uppercase">${item.remaining} left</span>
            </div>
            <div class="flex justify-between items-center text-gray-500 text-[11px]">
                <span>Min Req: ${item.minReq} units</span>
                <span class="text-red-500 font-bold">Out in ~45 mins</span>
            </div>
            <button onclick="requestBranchRestock('${item.name}')" class="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-lg text-xs shadow transition-all">Send Stock Now</button>
        </div>
    `).join("");
}

function renderBranchPerformanceKPIs() {
    const container = document.getElementById("branch-kpi-bars-container");
    if (!container) return;

    const kpis = [
        { label: "Customer Orders Completed", val: "98.4%", pct: 98, color: "bg-emerald-500" },
        { label: "Stock Accuracy %", val: "99.2%", pct: 99, color: "bg-blue-500" },
        { label: "Customer Satisfaction", val: "4.9 ⭐", pct: 96, color: "bg-amber-500" },
        { label: "Order Fulfillment Rate", val: "97.8%", pct: 97, color: "bg-purple-500" },
        { label: "Food Wastage % (Lower is better)", val: "1.8%", pct: 18, color: "bg-emerald-500" }
    ];

    container.innerHTML = kpis.map(k => `
        <div>
            <div class="flex justify-between text-xs font-extrabold mb-1">
                <span class="text-on-surface dark:text-gray-200">${k.label}</span>
                <span class="text-primary dark:text-[#86d4d3]">${k.val}</span>
            </div>
            <div class="w-full bg-surface-container-low dark:bg-[#151617] h-2.5 rounded-full overflow-hidden">
                <div class="h-full ${k.color} rounded-full" style="width: ${k.pct}%;"></div>
            </div>
        </div>
    `).join("");
}

function renderBranchReturnsTable() {
    const branch = state.branches.find(b => b.id === state.selectedBranchId) || state.branches[0];
    const tbody = document.getElementById("table-body-branch-returns");
    if (!tbody || !branch) return;

    if (branch.returns.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-gray-400 font-bold">No returned items recorded for ${branch.name}.</td></tr>`;
        return;
    }

    tbody.innerHTML = branch.returns.map(r => `
        <tr class="hover:bg-surface-container-low dark:hover:bg-[#202123]">
            <td class="p-2.5 font-black text-rose-500">${r.id}</td>
            <td class="p-2.5 font-extrabold text-on-surface dark:text-white">${r.name}</td>
            <td class="p-2.5 font-mono font-bold">${r.qty}</td>
            <td class="p-2.5"><span class="px-2 py-0.5 bg-rose-500/20 text-rose-600 text-[10px] font-bold rounded uppercase">${r.reason}</span></td>
            <td class="p-2.5 font-mono text-gray-400">${r.time}</td>
            <td class="p-2.5 text-right font-bold text-gray-400">${r.status}</td>
        </tr>
    `).join("");
}

function renderBranchFinancialSummary() {
    const branch = state.branches.find(b => b.id === state.selectedBranchId) || state.branches[0];
    const container = document.getElementById("branch-financial-summary-grid");
    if (!container || !branch) return;

    const profitEst = Math.round(branch.salesToday * 0.362);

    container.innerHTML = `
        <div class="p-3 bg-surface-container-low dark:bg-[#151617] rounded-xl border border-outline-variant/20">
            <span class="text-[9px] font-black uppercase text-gray-400 block">Food Sent Value</span>
            <span class="text-sm font-black text-primary dark:text-[#86d4d3]">৳ ${branch.mealsSentValue.toLocaleString()}</span>
        </div>
        <div class="p-3 bg-surface-container-low dark:bg-[#151617] rounded-xl border border-outline-variant/20">
            <span class="text-[9px] font-black uppercase text-gray-400 block">Revenue Generated</span>
            <span class="text-sm font-black text-emerald-600">৳ ${branch.salesToday.toLocaleString()}</span>
        </div>
        <div class="p-3 bg-surface-container-low dark:bg-[#151617] rounded-xl border border-outline-variant/20">
            <span class="text-[9px] font-black uppercase text-gray-400 block">Outstanding</span>
            <span class="text-sm font-black text-amber-500">৳ 0</span>
        </div>
        <div class="p-3 bg-surface-container-low dark:bg-[#151617] rounded-xl border border-outline-variant/20">
            <span class="text-[9px] font-black uppercase text-gray-400 block">Amount Received</span>
            <span class="text-sm font-black text-emerald-600">৳ ${branch.salesToday.toLocaleString()}</span>
        </div>
        <div class="p-3 bg-surface-container-low dark:bg-[#151617] rounded-xl border border-outline-variant/20">
            <span class="text-[9px] font-black uppercase text-gray-400 block">Estimated Gross Profit</span>
            <span class="text-sm font-black text-cyan-600">৳ ${profitEst.toLocaleString()}</span>
        </div>
    `;
}

function renderBranchNotificationsLog() {
    const container = document.getElementById("branch-notifications-log-list");
    if (!container) return;

    const notifs = [
        { msg: "New Restock Request REQ-302 submitted by Capt. Tanvir", time: "10m ago", icon: "move_to_inbox", color: "text-amber-500" },
        { msg: "Dispatch DISP-9041 received & verified by Engineering Wing Canteen", time: "35m ago", icon: "verified", color: "text-emerald-500" },
        { msg: "Low stock alert: Chocolate Brownies remaining 6 units", time: "1h ago", icon: "warning", color: "text-red-500" }
    ];

    container.innerHTML = notifs.map(n => `
        <div class="p-2.5 bg-surface-container-low dark:bg-[#151617] rounded-xl border border-outline-variant/20 flex items-center justify-between text-xs font-bold">
            <div class="flex items-center gap-2 min-w-0">
                <span class="material-symbols-outlined ${n.color} text-base shrink-0">${n.icon}</span>
                <span class="truncate text-on-surface dark:text-gray-200">${n.msg}</span>
            </div>
            <span class="text-[10px] font-mono text-gray-400 shrink-0 ml-2">${n.time}</span>
        </div>
    `).join("");
}

// Modal & Form Handlers
window.openCreateFoodTransferModal = function () {
    const modal = document.getElementById("modal-create-food-transfer");
    if (!modal) return;

    modal.classList.remove("hidden");
    modal.classList.remove("opacity-0");
    modal.classList.add("opacity-100");
    modal.classList.add("modal-open");
    calculateTransferModalTotal();
};

window.closeCreateFoodTransferModal = function () {
    const modal = document.getElementById("modal-create-food-transfer");
    if (modal) {
        modal.classList.remove("opacity-100");
        modal.classList.add("opacity-0");
        setTimeout(() => {
            if (!modal.classList.contains("opacity-100")) {
                modal.classList.add("hidden");
                modal.classList.remove("modal-open");
            }
        }, 250);
    }
};

// Dynamic Multi-Item Dispatch Helpers
window.updateTransferRowPrice = function (selectEl) {
    calculateTransferModalTotal();
};

window.addTransferItemRow = function () {
    const container = document.getElementById("transfer-items-list");
    if (!container) return;

    const newRow = document.createElement("div");
    newRow.className = "transfer-item-row grid grid-cols-12 gap-2 items-center p-2.5 bg-surface-container-low dark:bg-[#151617] rounded-xl border border-outline-variant/30";
    newRow.innerHTML = `
        <div class="col-span-5">
            <label class="block text-[9px] uppercase text-gray-400 font-bold mb-0.5">Item Select</label>
            <select onchange="updateTransferRowPrice(this)" class="transfer-row-item w-full p-2 bg-white dark:bg-[#2c2d30] border border-outline-variant/40 rounded-lg text-on-surface dark:text-white text-xs font-bold">
                <option value="Chicken Kacchi Biryani" data-price="180">Chicken Kacchi Biryani (৳180)</option>
                <option value="Crispy Chicken Burger" data-price="120">Crispy Chicken Burger (৳120)</option>
                <option value="Cold Coffee Bottles" data-price="70">Cold Coffee Bottles (৳70)</option>
                <option value="Singara & Samosa Trays" data-price="150">Singara & Samosa Trays (৳150)</option>
                <option value="Chocolate Brownies" data-price="90">Chocolate Brownies (৳90)</option>
            </select>
        </div>
        <div class="col-span-3">
            <label class="block text-[9px] uppercase text-gray-400 font-bold mb-0.5">Qty</label>
            <input type="number" min="1" value="20" oninput="calculateTransferModalTotal()" class="transfer-row-qty w-full p-2 bg-white dark:bg-[#2c2d30] border border-outline-variant/40 rounded-lg text-on-surface dark:text-white text-xs font-mono font-bold" />
        </div>
        <div class="col-span-3">
            <label class="block text-[9px] uppercase text-gray-400 font-bold mb-0.5">Subtotal (৳)</label>
            <input type="text" readonly value="3600" class="transfer-row-subtotal w-full p-2 bg-transparent text-emerald-600 dark:text-emerald-400 font-mono font-black text-xs" />
        </div>
        <div class="col-span-1 flex justify-end pt-3">
            <button type="button" onclick="removeTransferItemRow(this)" class="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer" title="Remove item">
                <span class="material-symbols-outlined text-base">delete</span>
            </button>
        </div>
    `;
    container.appendChild(newRow);
    calculateTransferModalTotal();
};

window.removeTransferItemRow = function (btnEl) {
    const rows = document.querySelectorAll(".transfer-item-row");
    if (rows.length <= 1) {
        showToast("At least one item is required for food transfer dispatch", "info");
        return;
    }
    const row = btnEl.closest(".transfer-item-row");
    if (row) row.remove();
    calculateTransferModalTotal();
};

window.calculateTransferModalTotal = function () {
    const rows = document.querySelectorAll(".transfer-item-row");
    let grandTotal = 0;

    rows.forEach(row => {
        const select = row.querySelector(".transfer-row-item");
        const qtyInput = row.querySelector(".transfer-row-qty");
        const subtotalInput = row.querySelector(".transfer-row-subtotal");

        const selectedOption = select?.options[select.selectedIndex];
        const unitPrice = parseFloat(selectedOption?.getAttribute("data-price")) || 100;
        const qty = parseInt(qtyInput?.value) || 0;
        const subtotal = unitPrice * qty;

        if (subtotalInput) subtotalInput.value = subtotal;
        grandTotal += subtotal;
    });

    const totalValInput = document.getElementById("transfer-modal-value");
    if (totalValInput) totalValInput.value = grandTotal;
};

window.handleSaveFoodTransferModal = function (event) {
    event.preventDefault();
    const rows = document.querySelectorAll(".transfer-item-row");
    let totalQty = 0;
    let itemsCount = rows.length;

    rows.forEach(row => {
        const qtyInput = row.querySelector(".transfer-row-qty");
        totalQty += (parseInt(qtyInput?.value) || 0);
    });

    const driver = document.getElementById("transfer-modal-driver")?.value || "Rafiq (Kitchen Staff)";
    const chef = document.getElementById("transfer-modal-chef")?.value || "Chef Kabir";
    const value = parseInt(document.getElementById("transfer-modal-value")?.value) || 12000;

    const branch = state.branches[0];
    if (branch) {
        const newDisp = {
            id: `DISP-${Math.floor(1000 + Math.random() * 9000)}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            itemsCount: itemsCount,
            totalQty: totalQty,
            totalVal: value,
            prepBy: chef,
            delBy: driver,
            status: "Dispatched"
        };
        branch.dispatches.unshift(newDisp);
        branch.mealsSent += totalQty;
        branch.mealsSentValue += value;
        branch.pendingDispatches += 1;

        closeCreateFoodTransferModal();
        renderActiveTab();
        showToast(`Food Transfer ${newDisp.id} (${itemsCount} item types, ৳${value.toLocaleString()}) dispatched to MIST Old Cafe! 🚀`, "success");
    }
};

window.handleQuickFoodTransfer = function (event) {
    event.preventDefault();
    const item = document.getElementById("quick-transfer-item")?.value;
    const qty = parseInt(document.getElementById("quick-transfer-qty")?.value) || 50;
    const driver = document.getElementById("quick-transfer-driver")?.value || "Kitchen Staff";

    const branch = state.branches[0];
    if (branch) {
        const newDisp = {
            id: `DISP-${Math.floor(1000 + Math.random() * 9000)}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            itemsCount: 1,
            totalQty: qty,
            totalVal: qty * 180,
            prepBy: "Kitchen Staff",
            delBy: driver,
            status: "Dispatched"
        };
        branch.dispatches.unshift(newDisp);
        branch.mealsSent += qty;
        branch.mealsSentValue += (qty * 180);

        renderActiveTab();
        showToast(`Quick Transfer ${newDisp.id} (${qty} x ${item}) dispatched to MIST Old Cafe! 🚚`, "success");
    }
};

window.approveBranchRequest = function (reqId) {
    const branch = state.branches.find(b => b.id === state.selectedBranchId);
    if (!branch) return;

    const idx = branch.pendingRequests.findIndex(r => r.id === reqId);
    if (idx !== -1) {
        const req = branch.pendingRequests.splice(idx, 1)[0];
        const newDisp = {
            id: `DISP-${Math.floor(1000 + Math.random() * 9000)}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            itemsCount: 2,
            totalQty: req.qty,
            totalVal: req.qty * 200,
            prepBy: "Chef Kabir",
            delBy: "Driver Rafiq (Van-01)",
            status: "Dispatched"
        };
        branch.dispatches.unshift(newDisp);
        branch.mealsSent += req.qty;
        branch.mealsSentValue += (req.qty * 200);

        renderActiveTab();
        showToast(`Approved request ${reqId} & Dispatched ${newDisp.id}! ✅`, "success");
    }
};

window.rejectBranchRequest = function (reqId) {
    const branch = state.branches.find(b => b.id === state.selectedBranchId);
    if (!branch) return;

    const idx = branch.pendingRequests.findIndex(r => r.id === reqId);
    if (idx !== -1) {
        branch.pendingRequests.splice(idx, 1);
        renderActiveTab();
        showToast(`Rejected request ${reqId}`, "info");
    }
};

window.requestBranchRestock = function (itemName) {
    const branch = state.branches.find(b => b.id === state.selectedBranchId);
    if (branch) {
        showToast(`Restock request sent to Central Kitchen for "${itemName}" (${branch.name})! 📦`, "success");
    }
};

window.openBranchReportModal = function () {
    const modal = document.getElementById("modal-branch-report-generator");
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.classList.remove("opacity-0");
    modal.classList.add("opacity-100");
    modal.classList.add("modal-open");
};

window.closeBranchReportModal = function () {
    const modal = document.getElementById("modal-branch-report-generator");
    if (modal) {
        modal.classList.remove("opacity-100");
        modal.classList.add("opacity-0");
        setTimeout(() => {
            if (!modal.classList.contains("opacity-100")) {
                modal.classList.add("hidden");
                modal.classList.remove("modal-open");
            }
        }, 250);
    }
};

window.triggerReportDownload = function (format) {
    const reportType = document.getElementById("export-report-type")?.value || "Daily Dispatch Log";
    const branch = state.branches.find(b => b.id === state.selectedBranchId);
    closeBranchReportModal();
    showToast(`Downloading ${reportType} in ${format} format for ${branch?.name || 'Branch'}... 📥`, "success");
};
