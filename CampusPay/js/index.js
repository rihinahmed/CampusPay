// CampusPay Interactive Logic & State Management

// Core State
const state = {
    balance: parseFloat(localStorage.getItem('campuspay-balance')) || 500.00,
    cart: [],
    meals: [
        {
            id: 1,
            name: "Fried Rice",
            tagline: "Classic MIST special fried rice recipe",
            category: "Rice",
            price: 110.00,
            rating: 4.6,
            stock: 15,
            image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=60",
            stockText: "15 left in stock"
        },
        {
            id: 2,
            name: "Crispy Chicken",
            tagline: "2 pieces with wedges",
            category: "Fast Food",
            price: 85.00,
            rating: 4.5,
            stock: 3,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYhUYGc-5AGKrfCMEfCjAdDR2VDHlRjjWx4k_klpron7qC55aEedNmxCoX_fu8abr62ZSIIV0quJMDug4hxeyIepogdxMR8ghp2UL4bk8ODXbvwIdWL0wpbm9pgNp-vtZvqcUgU9B-iwbCDoebUVqIutQptfhaid0POtuPZQYGDAOrE1dTvvo5PSolN9I6DG0XBhTjBHxOA1zCe6Z9BVT1nsPpqS6jh7RcXrZlkxaETmpioFckLjVhuxOTP2M0Rt5I145FFANQq2Vk",
            stockText: "Only 3 left!"
        },
        {
            id: 3,
            name: "Fresh Greek Salad",
            tagline: "Organic veggies & feta",
            category: "Fast Food",
            price: 60.00,
            rating: 4.9,
            stock: 25,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCgH8X7c2xI7ALrTbwE9Sv-b79dBZF_kQOYRpyMiG4o6ohkAZ7z2hk44dUCTyfj0wPgeP_STTh0my0KanBK-XzgyFXFEsvxyetPcS4mZVIpIiYg1D58Ov8FnOkLHd6IAA9aZnVT8-r1uKFEkLBOGpMHyagYbIJ2fLXlpp2U1mDv1Z14uKq7OvQ7NFfoij7mrNWteEtE3fnhRBfrEq69auT6QPbWgGbeJcj7dKMrFRqLhX7F1fRRWaJLdnVj8rypXIXTzcyF9SARqMU",
            stockText: "25+ available"
        },
        {
            id: 4,
            name: "Paratha & Bhaji",
            tagline: "Daily morning combo",
            category: "Traditional",
            price: 35.00,
            rating: 4.3,
            stock: 0,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoM9q0ytEusBF3cjxmPl0xKxF_H-B7gXj1oO3aM79ixmWU1qj26lUtwcIXHcW9abF2-Y0FsmBMh9K7mK52Q7WDsinwTLcx1U4zADA0H-ohK34S0ul0muqpHHKHLhnRsVSLJ0W60r6747ICiRoz4WGpv2t3UoTtNP-in0bJUmtKp3wwdFnYVciTY2Eii3NOL_9C5VyqKEaQjfv-Qht7W2gQBqD7druurgCZ9VQTUqZxuLk5LpbkNFkO5kKdEZGjhb77Wn9mBUarepKr",
            stockText: "Restocking at 8:00 AM"
        },
        {
            id: 5,
            name: "MIST Cold Coffee",
            tagline: "Creamy iced blend with chocolate drizzle",
            category: "Drinks",
            price: 50.00,
            rating: 4.7,
            stock: 15,
            image: "./cold_coffee.png",
            stockText: "15 available"
        },
        {
            id: 7,
            name: "Chicken Khichuri",
            tagline: "Steaming hot chicken khichuri",
            category: "Rice",
            price: 70.00,
            rating: 4.7,
            stock: 18,
            image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60",
            stockText: "18 left in stock"
        },
        {
            id: 8,
            name: "Dim Khichuri",
            tagline: "Khichuri served with boiled egg",
            category: "Rice",
            price: 40.00,
            rating: 4.4,
            stock: 20,
            image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&auto=format&fit=crop&q=60",
            stockText: "20 left in stock"
        }
    ],
    selectedCategory: "All Items",
    searchQuery: "",
    selectedServiceType: "Dine In",
    isDarkMode: localStorage.getItem('campuspay-theme') === 'dark',
    orderHistory: (() => {
        const saved = JSON.parse(localStorage.getItem('campuspay-orders') || 'null');
        if (Array.isArray(saved) && saved.length > 0) return saved;
        const defaults = [
            {
                orderId: 10254,
                timestamp: 'Aug 5, 2026, 02:10 PM',
                items: [{ mealId: 1, quantity: 1 }, { mealId: 4, quantity: 2 }],
                amount: 250.00,
                dineOption: 'Dine In'
            },
            {
                orderId: 10253,
                timestamp: 'Aug 4, 2026, 01:15 PM',
                items: [{ mealId: 2, quantity: 2 }],
                amount: 320.00,
                dineOption: 'Parcel'
            },
            {
                orderId: 10252,
                timestamp: 'Aug 3, 2026, 12:45 PM',
                items: [{ mealId: 3, quantity: 1 }, { mealId: 5, quantity: 1 }],
                amount: 210.00,
                dineOption: 'Dine In'
            },
            {
                orderId: 10251,
                timestamp: 'Aug 1, 2026, 08:30 AM',
                items: [{ mealId: 6, quantity: 2 }],
                amount: 180.00,
                dineOption: 'Parcel'
            },
            {
                orderId: 10250,
                timestamp: 'Jul 28, 2026, 07:45 PM',
                items: [{ mealId: 1, quantity: 2 }],
                amount: 360.00,
                dineOption: 'Dine In'
            }
        ];
        localStorage.setItem('campuspay-orders', JSON.stringify(defaults));
        return defaults;
    })(),
    activeOrder: JSON.parse(localStorage.getItem('campuspay-active-order')) || null,

    // NEW state items
    favorites: JSON.parse(localStorage.getItem('campuspay-favorites')) || [1, 5],
    notifications: JSON.parse(localStorage.getItem('campuspay-notifications')) || [
        { title: "Welcome to CampusPay", message: "Enjoy digital cashless dining experience inside MIST Counter Cafeteria.", date: "Today, 10:00 AM" }
    ],
    profile: JSON.parse(localStorage.getItem('campuspay-profile')) || {
        name: "Ajmain",
        id: "202114042",
        department: "CSE Department",
        phone: "01700000000",
        password: "••••••••"
    },
    transactions: JSON.parse(localStorage.getItem('campuspay-transactions')) || [
        { date: "25/07/2026 10:00 AM", type: "Recharge", desc: "Initial Card Balance Set", amount: 500.00, postBalance: 500.00 }
    ],
    activePanel: localStorage.getItem('campuspay-active-panel') || 'menu',
    txFilter: 'All',
    feedbackStars: 5
};

// DOM Content Loaded Initializer
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initEventListeners();
    renderFoodGrid();
    updateBalanceDOM();
    updateCartDOM();
    initHeaderClock();

    // Render new dashboard widgets
    renderDashboardGreeting();
    renderActiveOrderStatus();
    renderRecentOrders();
    renderAnnouncements();
    initQuickOrderCombo();
    updateWelcomeStatsDOM();

    // Route to current active view panel
    showPanel(state.activePanel);

    // Start active order simulation if there is a running order
    if (state.activeOrder && state.activeOrder.status === "Preparing") {
        startActiveOrderSimulation();
    }
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

// Balance Refresh
function updateBalanceDOM() {
    const balanceText = `${state.balance.toFixed(2)} ৳`;
    const balanceBadges = document.querySelectorAll(".balance-badge");
    balanceBadges.forEach(badge => {
        badge.innerText = balanceText;
    });
}

// Render Meals
function renderFoodGrid() {
    const gridContainer = document.getElementById("food-grid");
    if (!gridContainer) return;

    // Filter by Category
    let filtered = state.meals;
    if (state.selectedCategory !== "All Items") {
        filtered = filtered.filter(m => m.category.toLowerCase() === state.selectedCategory.toLowerCase());
    }

    // Filter by Search Query
    if (state.searchQuery.trim() !== "") {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(m =>
            m.name.toLowerCase().includes(query) ||
            m.tagline.toLowerCase().includes(query) ||
            m.category.toLowerCase().includes(query)
        );
    }

    // Handle Empty State
    if (filtered.length === 0) {
        gridContainer.innerHTML = `
            <div class="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-outline-variant p-8">
                <span class="material-symbols-outlined text-6xl text-outline mb-4">search_off</span>
                <h3 class="font-title-lg text-title-lg text-on-surface font-bold mb-2">No meals match your search</h3>
                <p class="text-on-surface-variant max-w-sm mb-6">Try searching for another food item or browse other categories.</p>
                <button id="clear-search-btn" class="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-label-md text-label-md hover:bg-primary-container transition-colors">
                    Reset Search & Filters
                </button>
            </div>
        `;
        document.getElementById("clear-search-btn")?.addEventListener("click", () => {
            state.searchQuery = "";
            state.selectedCategory = "All Items";

            // Core DOM input reset
            const searchInput = document.getElementById("search-input");
            if (searchInput) searchInput.value = "";

            // Hide suggestions
            document.getElementById("search-suggestions-dropdown")?.classList.add("hidden");

            // Highlight Category tabs
            updateCategoryTabsDOM();
            renderFoodGrid();
        });
        return;
    }

    // Render Cards
    gridContainer.innerHTML = filtered.map(meal => {
        const isOutOfStock = meal.stock <= 0;
        const cardOpacityClass = isOutOfStock ? "opacity-60 grayscale-[0.5]" : "";
        const stockIconColor = isOutOfStock ? "bg-outline" : (meal.stock <= 3 ? "bg-[#ef4444]" : "bg-[#22c55e]");
        const stockTextColor = isOutOfStock ? "text-on-surface-variant" : (meal.stock <= 3 ? "text-[#b91c1c]" : "text-[#15803d]");
        const stockLabel = isOutOfStock ? "Out of Stock" : (meal.stock <= 3 ? `Only ${meal.stock} left!` : `${meal.stock} left in stock`);
        const isFav = state.favorites.includes(meal.id);

        return `
            <div class="group bg-white rounded-2xl border border-outline-variant overflow-hidden hover:shadow-lg hover-glow transition-all duration-300 ${cardOpacityClass}" data-meal-id="${meal.id}">
                <div class="h-48 relative overflow-hidden">
                    <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${meal.image}" alt="${meal.name}"/>
                    
                    <!-- Floating heart favorite buttons directly in catalog cards -->
                    <button onclick="event.stopPropagation(); window.toggleFavorite(${meal.id});" class="absolute top-3 left-3 bg-white/90 dark:bg-[#1a1c1e]/90 backdrop-blur-md p-1.5 rounded-full flex items-center justify-center shadow-sm transition-transform active:scale-95 z-10">
                        <span class="material-symbols-outlined text-[18px] ${isFav ? 'text-rose-500 fill-rose-500' : 'text-on-surface-variant'}">favorite</span>
                    </button>

                    <div class="absolute top-3 right-3 bg-white/90 dark:bg-[#1a1c1e]/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                        <span class="material-symbols-outlined text-primary text-[14px]" style="font-variation-settings: 'FILL' 1;">star</span>
                        <span class="font-label-md text-label-md text-on-surface">${meal.rating}</span>
                    </div>
                    ${isOutOfStock ? `
                        <div class="absolute inset-0 bg-on-surface/40 flex items-center justify-center">
                            <span class="bg-white text-on-surface px-4 py-2 rounded-full font-bold text-label-md shadow-lg">OUT OF STOCK</span>
                        </div>
                    ` : ""}
                </div>
                <div class="p-5 flex flex-col gap-3">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-title-lg text-title-lg text-on-surface font-bold">${meal.name}</h3>
                            <p class="text-on-surface-variant font-body-md text-body-md">${meal.tagline}</p>
                        </div>
                        <span class="bg-secondary-container text-on-secondary-container px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">${meal.category}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full ${stockIconColor}"></span>
                        <span class="font-label-md text-label-md ${stockTextColor}">${stockLabel}</span>
                    </div>
                    <div class="flex flex-col gap-2 mt-2">
                        <div class="flex items-center justify-between">
                            <span class="font-headline-md text-headline-md text-primary font-bold">${meal.price.toFixed(2)} ৳</span>
                        </div>
                        ${isOutOfStock ? `
                            <button class="w-full bg-outline text-on-surface py-2 rounded-xl font-label-md text-label-md cursor-not-allowed opacity-50 flex items-center justify-center gap-2" disabled>
                                <span class="material-symbols-outlined text-[18px]">block</span>
                                Unavailable
                            </button>
                        ` : `
                            <div class="flex gap-2 w-full">
                                <button onclick="window.addToCart(${meal.id})" class="flex-1 bg-surface-container-high dark:bg-[#202225] hover:bg-surface-container-highest text-on-surface py-2 rounded-xl font-label-md text-[10px] sm:text-[11px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1 shadow-sm">
                                    <span class="material-symbols-outlined text-[14px]">add_shopping_cart</span>
                                    Add to Tray
                                </button>
                                <button onclick="window.orderNow(${meal.id})" class="flex-1 bg-primary text-on-primary py-2 rounded-xl font-label-md text-[10px] sm:text-[11px] font-bold hover:brightness-105 transition-all active:scale-95 flex items-center justify-center gap-1 shadow-sm">
                                    <span class="material-symbols-outlined text-[14px]">shopping_cart_checkout</span>
                                    Order Now
                                </button>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

// Order Now quick check helper
window.orderNow = function(mealId) {
    addToCart(mealId);
    openCartDrawer();
};

// Category selection updater
function updateCategoryTabsDOM() {
    const tabsList = document.querySelectorAll("#category-tabs button");
    tabsList.forEach(tab => {
        const text = tab.innerText.trim();
        if (text === state.selectedCategory) {
            tab.className = "whitespace-nowrap px-6 py-2 bg-primary text-on-primary rounded-full font-label-md text-label-md shadow-md";
        } else {
            tab.className = "whitespace-nowrap px-6 py-2 bg-white text-on-surface-variant border border-outline-variant rounded-full font-label-md text-label-md hover:bg-surface-container-low transition-colors";
        }
    });
}

// Cart Mechanics
function addToCart(mealId) {
    const meal = state.meals.find(m => m.id === mealId);
    if (!meal || meal.stock <= 0) return;

    const cartItem = state.cart.find(item => item.mealId === mealId);
    if (cartItem) {
        if (cartItem.quantity >= meal.stock) {
            showToast(`Cannot add more. Hard limit is current stock quantity of ${meal.stock} items.`, "warning");
            return;
        }
        cartItem.quantity++;
    } else {
        state.cart.push({ mealId: mealId, quantity: 1 });
    }

    showToast(`${meal.name} added to Tray!`, "success");
    updateCartDOM();
}

function updateCartQuantity(mealId, change) {
    const index = state.cart.findIndex(item => item.mealId === mealId);
    if (index === -1) return;

    const item = state.cart[index];
    const meal = state.meals.find(m => m.id === mealId);
    if (!meal) return;

    const newQty = item.quantity + change;
    if (newQty <= 0) {
        state.cart.splice(index, 1);
        showToast(`${meal.name} removed from tray`, "info");
    } else if (newQty > meal.stock) {
        showToast(`Only ${meal.stock} portion(s) available in stock.`, "warning");
    } else {
        item.quantity = newQty;
    }
    updateCartDOM();
}

window.removeFromCart = function(mealId) {
    state.cart = state.cart.filter(item => item.mealId !== mealId);
    showToast("Item removed from tray", "info");
    updateCartDOM();
};

function updateCartDOM() {
    const drawerList = document.getElementById("cart-drawer-list");
    const drawerEmptyBadge = document.getElementById("cart-drawer-empty");
    const drawerSummaryPanel = document.getElementById("cart-drawer-summary");
    const cartCountBadges = document.querySelectorAll("#cart-badge-count");
    const checkoutBtn = document.getElementById("checkout-btn");

    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = state.cart.reduce((sum, item) => {
        const meal = state.meals.find(m => m.id === item.mealId);
        return sum + (meal ? meal.price * item.quantity : 0);
    }, 0);

    // Update BADGE outputs
    cartCountBadges.forEach(badge => {
        badge.innerText = totalItems;
        if (totalItems > 0) {
            badge.classList.remove("hidden");
        } else {
            badge.classList.add("hidden");
        }
    });

    if (totalItems === 0) {
        if (drawerList) drawerList.innerHTML = "";
        drawerEmptyBadge?.classList.remove("hidden");
        drawerSummaryPanel?.classList.add("hidden");
        if (checkoutBtn) checkoutBtn.disabled = true;
    } else {
        drawerEmptyBadge?.classList.add("hidden");
        drawerSummaryPanel?.classList.remove("hidden");
        if (checkoutBtn) checkoutBtn.disabled = false;

        if (drawerList) {
            drawerList.innerHTML = state.cart.map(item => {
                const meal = state.meals.find(m => m.id === item.mealId);
                if (!meal) return "";
                const aggregate = meal.price * item.quantity;
                return `
                    <div class="flex items-center gap-3.5 p-3.5 bg-gradient-to-r from-teal-500/5 to-cyan-500/5 dark:from-[#2c2d30]/20 dark:to-[#1e2022]/10 rounded-2xl border border-teal-500/10 hover:border-teal-500/30 transition-all shadow-sm relative group">
                        <div class="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-white/10 shadow-sm">
                            <img src="${meal.image}" alt="${meal.name}" class="w-full h-full object-cover" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-start gap-1">
                                <h4 class="font-title-lg text-title-lg text-slate-800 dark:text-slate-100 font-bold leading-tight line-clamp-1">${meal.name}</h4>
                                <button onclick="window.removeFromCart(${meal.id})" class="p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all shrink-0 ml-1">
                                    <span class="material-symbols-outlined text-[14px]">close</span>
                                </button>
                            </div>
                            <p class="text-teal-600 dark:text-[#86d4d3] font-black text-[11px] font-mono mt-1">${meal.price.toFixed(2)} ৳</p>
                        </div>
                        <div class="flex flex-col items-end gap-2 shrink-0">
                            <!-- Qty controller -->
                            <div class="flex items-center gap-1 bg-teal-500/10 dark:bg-[#2c2d30] px-2 py-0.5 rounded-lg border border-teal-500/20 dark:border-white/10 select-none">
                                <button onclick="window.updateCartQuantity(${meal.id}, -1)" class="w-5 h-5 flex items-center justify-center text-teal-700 dark:text-teal-400 hover:scale-110 transition-all">
                                    <span class="material-symbols-outlined text-[12px] font-bold">remove</span>
                                </button>
                                <span class="font-mono text-xs font-black px-1 text-teal-800 dark:text-teal-300 min-w-[14px] text-center">${item.quantity}</span>
                                <button onclick="window.updateCartQuantity(${meal.id}, 1)" class="w-5 h-5 flex items-center justify-center text-teal-700 dark:text-teal-400 hover:scale-110 transition-all">
                                    <span class="material-symbols-outlined text-[12px] font-bold">add</span>
                                </button>
                            </div>
                            <span class="font-mono text-xs text-slate-800 dark:text-slate-200 font-black">${aggregate.toFixed(2)} ৳</span>
                        </div>
                    </div>
                `;
            }).join("");
        }

        const subtotalEl = document.getElementById("cart-subtotal");
        const checkoutTotalEl = document.getElementById("checkout-total-value");
        if (subtotalEl) subtotalEl.innerText = `${totalPrice.toFixed(2)} ৳`;
        if (checkoutTotalEl) checkoutTotalEl.innerText = `${totalPrice.toFixed(2)} ৳`;
    }
}

// Cart Drawer open/close controls
function openCartDrawer() {
    const drawer = document.getElementById("cart-drawer");
    if (!drawer) return;
    drawer.classList.remove("hidden");
    void drawer.offsetWidth;
    drawer.classList.add("drawer-open");
}
function closeCartDrawer() {
    const drawer = document.getElementById("cart-drawer");
    if (!drawer) return;
    drawer.classList.remove("drawer-open");
    setTimeout(() => {
        if (!drawer.classList.contains("drawer-open")) {
            drawer.classList.add("hidden");
        }
    }, 300);
}

// SideNav Controls (Mobile Drawer navigation)
function openMobileNav() {
    const nav = document.getElementById("mobile-nav");
    if (!nav) return;
    nav.classList.remove("hidden");
    void nav.offsetWidth;
    nav.classList.add("drawer-open");
}
function closeMobileNav() {
    const nav = document.getElementById("mobile-nav");
    if (!nav) return;
    nav.classList.remove("drawer-open");
    setTimeout(() => {
        if (!nav.classList.contains("drawer-open")) {
            nav.classList.add("hidden");
        }
    }, 300);
}

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

// Perform simulated checkout flow
function processCheckout() {
    const totalPrice = state.cart.reduce((sum, item) => {
        const meal = state.meals.find(m => m.id === item.mealId);
        return sum + (meal ? meal.price * item.quantity : 0);
    }, 0);

    if (totalPrice <= 0) return;

    if (state.balance < totalPrice) {
        showToast("Insufficient Balance! Please recharge your account.", "error");
        setTimeout(() => {
            showPanel('wallet');
        }, 1200);
        return;
    }

    const checkoutBtn = document.getElementById("checkout-btn");
    const checkoutSpinner = document.getElementById("checkout-spinner");
    const checkoutBtnText = document.getElementById("checkout-btn-text");

    if (checkoutBtn && checkoutSpinner && checkoutBtnText) {
        checkoutBtn.disabled = true;
        checkoutSpinner.classList.remove("hidden");
        checkoutBtnText.innerText = "Processing...";
    }

    // Simulate Server Order validation and processing
    setTimeout(() => {
        // Validate stock once again
        let stockAvailable = true;
        for (const item of state.cart) {
            const meal = state.meals.find(m => m.id === item.mealId);
            if (!meal || meal.stock < item.quantity) {
                stockAvailable = false;
                showToast(`Sorry! Extra portions of ${meal ? meal.name : 'item'} sold out while checking.`, "error");
                break;
            }
        }

        if (stockAvailable) {
            // Success order path
            state.balance -= totalPrice;
            state.cart.forEach(item => {
                const meal = state.meals.find(m => m.id === item.mealId);
                if (meal) meal.stock -= item.quantity;
            });

            // Create active order state with synchronized global order ID
            const orderId = getNextGlobalOrderId();
            state.activeOrder = {
                orderId: orderId,
                items: [...state.cart],
                amount: totalPrice,
                status: "Preparing",
                timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                pin: `MIST-${Math.floor(1000 + Math.random() * 9000)}`,
                dineOption: state.selectedServiceType
            };
            localStorage.setItem('campuspay-active-order', JSON.stringify(state.activeOrder));

            // Store order copy
            state.orderHistory.push({
                orderId: orderId,
                timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                items: [...state.cart],
                amount: totalPrice,
                dineOption: state.selectedServiceType
            });
            localStorage.setItem('campuspay-orders', JSON.stringify(state.orderHistory));

            // Record transaction audit log
            const itemsSummaryStr = state.cart.map(item => {
                const meal = state.meals.find(m => m.id === item.mealId);
                return `${meal ? meal.name : 'Item'} (${item.quantity})`;
            }).join(', ');

            const newTx = {
                date: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
                type: "Checkout",
                desc: `Purchase: ${itemsSummaryStr}`,
                amount: totalPrice,
                postBalance: state.balance
            };
            state.transactions.push(newTx);
            localStorage.setItem('campuspay-transactions', JSON.stringify(state.transactions));

            // Sync with kitchen staff dashboard orders queue
            const staffOrders = JSON.parse(localStorage.getItem('campuspay-staff-orders')) || [
                { id: "3024", studentId: "202114042", items: "Beef Biryani (1), MIST Cold Coffee (1)", total: 170, status: "Pending", dineOption: "Dine In" },
                { id: "3023", studentId: "201914005", items: "Egg Sandwich (2)", total: 90, status: "Preparing", dineOption: "Parcel" },
                { id: "3022", studentId: "202214112", items: "Fruit Platter (1)", total: 60, status: "Completed", dineOption: "Dine In" }
            ];
            staffOrders.push({
                id: orderId.toString(),
                studentId: "202114042",
                items: itemsSummaryStr,
                total: totalPrice,
                status: "Pending",
                dineOption: state.selectedServiceType
            });
            localStorage.setItem('campuspay-staff-orders', JSON.stringify(staffOrders));

            state.cart = []; // Reset Cart

            updateBalanceDOM();
            localStorage.setItem('campuspay-balance', state.balance.toFixed(2));
            updateCartDOM();
            renderFoodGrid();
            closeCartDrawer();

            // Refresh new widgets
            renderActiveOrderStatus();
            renderRecentOrders();
            updateWelcomeStatsDOM();

            pushNotification("Order Placed", `Order #${orderId} was successfully placed for ${totalPrice.toFixed(2)} ৳ (${state.selectedServiceType}).`);
            showToast("Order placed successfully! 🍕", "success");
            startActiveOrderSimulation();
        }

        // Restore Checkout Button states
        if (checkoutBtn && checkoutSpinner && checkoutBtnText) {
            checkoutBtn.disabled = false;
            checkoutSpinner.classList.add("hidden");
            checkoutBtnText.innerText = "Confirm Tray Order";
        }
    }, 1500);
}

// Quick Reorder logic (Replaces current cart with elements of the last order)
function triggerQuickReorder() {
    if (state.orderHistory.length === 0) {
        showToast("No order history found for quick reorder yet!", "info");
        return;
    }

    const lastOrder = state.orderHistory[state.orderHistory.length - 1];

    // Check if stock is available for all elements
    let allAvailable = true;
    for (const item of lastOrder.items) {
        const meal = state.meals.find(m => m.id === item.mealId);
        if (!meal || meal.stock < item.quantity) {
            allAvailable = false;
            showToast(`${meal ? meal.name : 'An element'} has insufficient stock to copy complete order.`, "error");
            break;
        }
    }

    if (allAvailable) {
        state.cart = lastOrder.items.map(item => ({ ...item }));
        updateCartDOM();
        openCartDrawer();
        showToast("Restored your previous tray items!", "success");
    }
}

// HTML Toast message custom widget builder
function showToast(message, type = "info") {
    // Create toast container dynamically if missing
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");

    // Setup color variants
    let bgClass = "bg-white dark:bg-[#1a1c1e] text-on-surface border-outline-variant";
    let icon = "info";
    let iconColor = "text-primary";

    if (type === "success") {
        bgClass = "bg-[#d1fae5] dark:bg-[#064e3b] text-[#065f46] dark:text-[#a7f3d0] border-[#a7f3d0]/30";
        icon = "check_circle";
        iconColor = "text-[#059669] dark:text-[#34d399]";
    } else if (type === "error") {
        bgClass = "bg-[#fee2e2] dark:bg-[#7f1d1d] text-[#991b1b] dark:text-[#fca5a5] border-[#fca5a5]/30";
        icon = "error";
        iconColor = "text-[#dc2626] dark:text-[#f87171]";
    } else if (type === "warning") {
        bgClass = "bg-[#fef3c7] dark:bg-[#78350f] text-[#92400e] dark:text-[#fde68a] border-[#fde68a]/30";
        icon = "warning";
        iconColor = "text-[#d97706] dark:text-[#fbbf24]";
    }

    toast.className = `toast-animate-in border flex items-center gap-3 p-4 rounded-xl shadow-lg pointer-events-auto max-w-sm ${bgClass}`;
    toast.innerHTML = `
        <span class="material-symbols-outlined ${iconColor}">${icon}</span>
        <p class="font-body-md text-body-md font-medium flex-1">${message}</p>
        <button class="toast-close-btn text-on-surface-variant hover:text-on-surface transition-colors">
            <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector(".toast-close-btn");
    const removeToast = () => {
        toast.classList.remove("toast-animate-in");
        toast.classList.add("toast-animate-out");
        toast.addEventListener("animationend", () => {
            toast.remove();
        });
    };

    closeBtn?.addEventListener("click", removeToast);

    // Auto remove toast
    setTimeout(removeToast, 4000);
}

// Bind key updater functions to window context for inline event handlers
window.updateCartQuantity = updateCartQuantity;
window.addToCart = addToCart;

// Dashboard Enhancements & Simulation Logic
function renderDashboardGreeting() {
    const greetingEl = document.getElementById("welcome-greeting");
    if (!greetingEl) return;
    const hour = new Date().getHours();
    let greet = "Good Afternoon";
    if (hour >= 5 && hour < 12) {
        greet = "Good Morning";
    } else if (hour >= 17 || hour < 5) {
        greet = "Good Evening";
    }
    greetingEl.innerText = `${greet}, ${state.profile.name} 👋`;
}

function renderActiveOrderStatus() {
    // Sync header bell dot badge
    const bellBadge = document.getElementById("active-order-bell-badge");
    if (state.activeOrder) {
        bellBadge?.classList.remove("hidden");
    } else {
        bellBadge?.classList.add("hidden");
    }

    // Live sync active order drawer content
    updateActiveOrderDrawerDOM();

    const activeSection = document.getElementById("active-order-section");
    if (!activeSection) return;

    if (!state.activeOrder) {
        activeSection.classList.add("hidden");
        return;
    }

    activeSection.classList.remove("hidden");

    const titleEl = document.getElementById("active-order-title");
    const badgeEl = document.getElementById("active-order-badge");
    const pinEl = document.getElementById("active-order-pin");
    const summaryEl = document.getElementById("active-order-summary");

    if (titleEl) titleEl.innerText = `Order #${state.activeOrder.orderId} (${state.activeOrder.dineOption || 'Dine In'})`;
    if (badgeEl) {
        badgeEl.innerText = state.activeOrder.status;
        if (state.activeOrder.status === "Preparing") {
            badgeEl.className = "bg-primary/10 text-primary dark:text-[#86d4d3] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider";
        } else {
            badgeEl.className = "bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse";
        }
    }
    if (pinEl) pinEl.innerText = state.activeOrder.pin;

    const itemsSummary = state.activeOrder.items.map(item => {
        const meal = state.meals.find(m => m.id === item.mealId);
        return `${item.quantity}x ${meal ? meal.name : 'Item'}`;
    }).join(', ');
    if (summaryEl) summaryEl.innerText = itemsSummary;

    // Render Dynamic QR code or placeholder
    const largeQrContainer = document.getElementById("large-qr-code-container");
    const largeQrCode = document.getElementById("large-qr-code");
    const readyQrLabel = document.getElementById("ready-qr-label");

    if (largeQrCode) {
        if (state.activeOrder.status === "Ready for Pickup") {
            largeQrCode.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ORDER_${state.activeOrder.orderId}" alt="Collection QR Code" class="w-24 h-24 object-contain" style="image-rendering: pixelated;" />`;
            if (largeQrContainer) {
                largeQrContainer.className = "relative p-2 bg-white rounded-xl shadow-lg border-4 border-emerald-500/40 flex items-center justify-center w-28 h-28 mx-auto transition-all duration-300 animate-pulse";
            }
            if (readyQrLabel) {
                readyQrLabel.innerText = "Ready to Scan";
                readyQrLabel.className = "text-[9px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400";
            }
        } else {
            largeQrCode.innerHTML = `<span class="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500 animate-pulse">qr_code_2</span>`;
            if (largeQrContainer) {
                largeQrContainer.className = "relative p-2 bg-white dark:bg-[#1a1c1e] rounded-xl shadow-md border-2 border-slate-200 dark:border-white/10 flex items-center justify-center w-28 h-28 mx-auto transition-all duration-300";
            }
            if (readyQrLabel) {
                readyQrLabel.innerText = "Awaiting Prep";
                readyQrLabel.className = "text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400";
            }
        }
    }

    const stepPlacedCircle = document.getElementById("step-placed-circle");
    const stepPreparingCircle = document.getElementById("step-preparing-circle");
    const stepPreparingText = document.getElementById("step-preparing-text");
    const stepReadyCircle = document.getElementById("step-ready-circle");
    const stepReadyText = document.getElementById("step-ready-text");
    const progressLine = document.getElementById("active-progress-line");

    if (stepPlacedCircle) {
        stepPlacedCircle.className = "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono shadow step-circle-completed";
    }

    if (state.activeOrder.status === "Preparing") {
        if (stepPreparingCircle) stepPreparingCircle.className = "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono shadow step-circle-active";
        if (stepPreparingText) stepPreparingText.className = "text-[9px] md:text-[10px] font-bold mt-1.5 text-emerald-600 dark:text-emerald-400";
        
        if (stepReadyCircle) stepReadyCircle.className = "w-6 h-6 rounded-full bg-surface-container-high dark:bg-[#2c2d30] text-on-surface-variant flex items-center justify-center text-[10px] font-bold font-mono shadow";
        if (stepReadyText) stepReadyText.className = "text-[9px] md:text-[10px] font-bold mt-1.5 text-on-surface-variant";
        if (progressLine) progressLine.style.width = "50%";
    } else if (state.activeOrder.status === "Ready for Pickup") {
        if (stepPreparingCircle) stepPreparingCircle.className = "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono shadow step-circle-completed";
        if (stepPreparingText) stepPreparingText.className = "text-[9px] md:text-[10px] font-bold mt-1.5 text-on-surface";

        if (stepReadyCircle) stepReadyCircle.className = "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono shadow step-circle-active animate-bounce";
        if (stepReadyText) stepReadyText.className = "text-[9px] md:text-[10px] font-bold mt-1.5 text-emerald-600 dark:text-emerald-400";
        if (progressLine) progressLine.style.width = "100%";
    }
}

function startActiveOrderSimulation() {
    if (!state.activeOrder || state.activeOrder.status !== "Preparing") return;
    // Simulate pipeline update after 12 seconds
    setTimeout(() => {
        if (state.activeOrder && state.activeOrder.status === "Preparing") {
            state.activeOrder.status = "Ready for Pickup";
            localStorage.setItem('campuspay-active-order', JSON.stringify(state.activeOrder));
            renderActiveOrderStatus();
            pushNotification("Order Ready for Pickup", `Your Order #${state.activeOrder.orderId} is Ready for Pickup! Collect it at Counter.`);
            showToast(`Your Order #${state.activeOrder.orderId} is Ready for Pickup! 🍽️`, "success");
        }
    }, 12000);
}

function markActiveOrderCollected() {
    if (!state.activeOrder) return;
    showToast(`Order #${state.activeOrder.orderId} collected successfully! Enjoy your meal! 🍽️`, "success");
    state.activeOrder = null;
    localStorage.removeItem('campuspay-active-order');
    renderActiveOrderStatus();
    renderRecentOrders();
    updateWelcomeStatsDOM();
}

function openActiveOrderDrawer() {
    const drawer = document.getElementById("orders-drawer");
    if (!drawer) return;
    updateActiveOrderDrawerDOM();
    drawer.classList.remove("hidden");
    void drawer.offsetWidth;
    drawer.classList.add("drawer-open");
}

function closeActiveOrderDrawer() {
    const drawer = document.getElementById("orders-drawer");
    if (!drawer) return;
    drawer.classList.remove("drawer-open");
    setTimeout(() => {
        if (!drawer.classList.contains("drawer-open")) {
            drawer.classList.add("hidden");
        }
    }, 300);
}

function updateActiveOrderDrawerDOM() {
    const listEl = document.getElementById("orders-drawer-list");
    const emptyEl = document.getElementById("orders-drawer-empty");
    const bellBadge = document.getElementById("active-order-bell-badge");

    if (!listEl || !emptyEl) return;

    if (!state.activeOrder) {
        listEl.classList.add("hidden");
        emptyEl.classList.remove("hidden");
        bellBadge?.classList.add("hidden");
        return;
    }

    listEl.classList.remove("hidden");
    emptyEl.classList.add("hidden");
    bellBadge?.classList.remove("hidden");

    // Stepper details based on status
    const isPreparing = state.activeOrder.status === "Preparing";
    const statusText = state.activeOrder.status;
    const progressWidth = isPreparing ? "50%" : "100%";
    const statusBadgeClass = isPreparing 
        ? "bg-primary/10 text-primary dark:text-[#86d4d3]"
        : "bg-green-500/10 text-green-600 dark:text-green-400 animate-pulse";

    const itemsHTML = state.activeOrder.items.map(item => {
        const meal = state.meals.find(m => m.id === item.mealId);
        const name = meal ? meal.name : "Item";
        const price = meal ? meal.price : 0;
        const total = price * item.quantity;
        return `
            <div class="flex justify-between items-center text-xs border-b border-outline-variant/30 py-2 font-sans">
                <div>
                    <span class="font-bold text-on-surface dark:text-white">${name}</span>
                    <span class="text-on-surface-variant dark:text-[#bec9c8] ml-1">x${item.quantity}</span>
                </div>
                <span class="font-mono text-on-surface-variant dark:text-[#bec9c8]">${total.toFixed(2)} ৳</span>
            </div>
        `;
    }).join('');

    const qrHTML = state.activeOrder.status === "Ready for Pickup"
        ? `<div class="relative p-2 bg-white rounded-xl shadow-lg border-4 border-emerald-500/40 flex items-center justify-center w-28 h-28 mx-auto transition-all duration-300 animate-pulse">
             <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ORDER_${state.activeOrder.orderId}" alt="Collection QR Code" class="w-full h-full object-contain" style="image-rendering: pixelated;" />
           </div>
           <span class="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400 mt-2 block text-center font-sans">Ready to Scan</span>`
        : `<div class="relative p-2 bg-white dark:bg-[#1a1c1e] rounded-xl shadow-md border-2 border-slate-200 dark:border-white/10 flex items-center justify-center w-28 h-28 mx-auto transition-all duration-300">
             <span class="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500 animate-pulse">qr_code_2</span>
           </div>
           <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mt-2 block text-center font-sans">Awaiting Prep</span>`;

    listEl.innerHTML = `
        <!-- Top Summary -->
        <div class="bg-surface-container-low dark:bg-[#2c2d30]/20 p-4 rounded-2xl border border-outline-variant/40 space-y-3 font-sans">
            <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Order #${state.activeOrder.orderId}</span>
                <span class="${statusBadgeClass} text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">${statusText}</span>
            </div>
            
            <div class="flex items-center justify-between pt-2 border-t border-outline-variant/30">
                <div class="text-left">
                    <span class="text-[10px] text-on-surface-variant block uppercase tracking-wider">OTP PIN</span>
                    <span class="font-mono font-black text-primary dark:text-[#86d4d3] text-sm">${state.activeOrder.pin}</span>
                </div>
                <div class="text-right">
                    <span class="text-[10px] text-on-surface-variant block uppercase tracking-wider">Dining Option</span>
                    <span class="text-xs font-bold text-on-surface">${state.activeOrder.dineOption || 'Dine In'}</span>
                </div>
            </div>
        </div>

        <!-- Stepper -->
        <div class="bg-surface-container-low dark:bg-[#2c2d30]/20 p-4 rounded-2xl border border-outline-variant/40 relative font-sans">
            <h4 class="text-xs font-bold text-on-surface mb-4">Preparation Timeline</h4>
            <div class="relative py-4 select-none">
                <!-- Timeline track -->
                <div class="absolute top-[26px] left-[12px] right-[12px] h-2 gray-dotted-track z-0">
                    <div class="flowing-dotted-line h-full transition-all duration-500 relative" style="width: ${progressWidth}">
                        <!-- Flowing Bead Indicator -->
                        <div class="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-emerald-400 dark:bg-emerald-300 shadow-[0_0_8px_#10b981] flex items-center justify-center z-20">
                            <div class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></div>
                        </div>
                    </div>
                </div>
                <!-- Timeline stages -->
                <div class="relative flex justify-between items-center z-10">
                    <div class="flex flex-col items-center">
                        <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono shadow step-circle-completed">1</div>
                        <span class="text-[9px] font-bold mt-1.5 text-on-surface">Placed</span>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="${isPreparing ? 'step-circle-active animate-pulse' : 'step-circle-completed'} w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono shadow">2</div>
                        <span class="${isPreparing ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-on-surface'} text-[9px] mt-1.5">Prep</span>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="${isPreparing ? 'bg-surface-container-high dark:bg-[#2c2d30] text-on-surface-variant' : 'step-circle-active animate-bounce'} w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono shadow">3</div>
                        <span class="${isPreparing ? 'text-on-surface-variant' : 'text-emerald-600 dark:text-emerald-400 font-bold'} text-[9px] mt-1.5">Ready</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Items Ordered -->
        <div class="bg-surface-container-low dark:bg-[#2c2d30]/20 p-4 rounded-2xl border border-outline-variant/40 font-sans">
            <h4 class="text-xs font-bold text-on-surface mb-2">Items Selected</h4>
            <div class="divide-y divide-outline-variant/20">
                ${itemsHTML}
            </div>
        </div>

        <!-- Collection QR -->
        <div class="bg-surface-container-low dark:bg-[#2c2d30]/20 p-4 rounded-2xl border border-outline-variant/40 flex flex-col items-center justify-center font-sans">
            ${qrHTML}
        </div>

        <!-- Action Button -->
        <button onclick="window.markActiveOrderCollectedFromDrawer()" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1 font-sans">
            <span class="material-symbols-outlined text-sm">verified</span>
            Collected & Enjoyed Meal
        </button>
    `;
}

window.markActiveOrderCollectedFromDrawer = function() {
    markActiveOrderCollected();
    closeActiveOrderDrawer();
};

function renderRecentOrders() {
    const listEl = document.getElementById("recent-orders-dashboard-list");
    if (!listEl) return;

    if (state.orderHistory.length === 0) {
        listEl.innerHTML = `<p class="text-xs text-on-surface-variant dark:text-[#bec9c8] py-8 text-center select-none">No recent orders yet today.</p>`;
        return;
    }

    const recent = state.orderHistory.slice(-3).reverse();
    listEl.innerHTML = recent.map(order => {
        const itemsHtml = order.items.map(item => {
            const meal = state.meals.find(m => m.id === item.mealId);
            return `<span class="text-xs text-on-surface font-medium block">${meal ? meal.name : 'Meal'} x ${item.quantity}</span>`;
        }).join('');

        const orderIdStr = `Order #${order.orderId}`;
        const orderIdx = state.orderHistory.indexOf(order);

        return `
            <div class="p-3 bg-surface-container-low dark:bg-[#1a1c1e] rounded-xl border border-outline-variant hover:border-primary/20 transition-all flex justify-between items-center gap-3">
                <div class="flex-1 select-none">
                    <div class="flex items-center gap-2 mb-1.5">
                        <span class="text-[9px] font-bold text-on-surface-variant dark:text-secondary-fixed-dim uppercase tracking-wider">${orderIdStr}</span>
                        <span class="text-[9px] bg-green-500/10 text-green-600 dark:text-green-400 font-bold px-1.5 py-0.5 rounded">Collected</span>
                    </div>
                    <div class="space-y-0.5">
                        ${itemsHtml}
                    </div>
                    <span class="text-[9px] text-on-surface-variant dark:text-secondary-fixed-dim block mt-1">${order.timestamp} • ${order.amount.toFixed(2)} ৳</span>
                </div>
                <button onclick="window.reorderRecent(${orderIdx})" class="bg-primary/10 text-primary dark:text-[#86d4d3] hover:bg-primary hover:text-on-primary px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap">
                    <span class="material-symbols-outlined text-[14px]">refresh</span>
                    Reorder
                </button>
            </div>
        `;
    }).join('');
}

window.reorderRecent = function(idx) {
    const order = state.orderHistory[idx];
    if (!order) return;
    let stockAvailable = true;
    for (const item of order.items) {
        const meal = state.meals.find(m => m.id === item.mealId);
        if (!meal || meal.stock < item.quantity) {
            stockAvailable = false;
            showToast(`${meal ? meal.name : 'An item'} does not have enough stock to reorder.`, "error");
            break;
        }
    }
    if (stockAvailable) {
        state.cart = order.items.map(item => ({ ...item }));
        updateCartDOM();
        openCartDrawer();
        showToast("Copied recent order items to tray!", "success");
    }
};

const announcements = [
    {
        icon: "local_fire_department",
        title: "🔥 Friday Special Kacchi",
        desc: "Chef-special mutton biryani available this Friday starting 12:30 PM."
    },
    {
        icon: "schedule",
        title: "🕒 Extended Exam Hours",
        desc: "MIST canteen will remain open until 8:30 PM during finals week."
    },
    {
        icon: "celebration",
        title: "💳 Canteen Cashback",
        desc: "Get 10% cashback when recharging your wallet via bKash today!"
    }
];

function renderAnnouncements() {
    const container = document.getElementById("announcements-list");
    if (!container) return;

    container.innerHTML = announcements.map(item => {
        return `
            <div class="flex items-start gap-3 p-2 bg-surface-container-low dark:bg-[#1a1c1e] rounded-xl border border-outline-variant/30 hover:border-primary/20 transition-all select-none">
                <div class="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-[#86d4d3] flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-[18px]">${item.icon}</span>
                </div>
                <div class="flex-1">
                    <p class="text-xs font-bold text-on-surface leading-snug">${item.title}</p>
                    <p class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim mt-0.5">${item.desc}</p>
                </div>
            </div>
        `;
    }).join('');
}

function initQuickOrderCombo() {
    const quickOrderBtn = document.getElementById("quick-order-combo-btn");
    quickOrderBtn?.addEventListener("click", () => {
        const comboMeals = [
            { mealId: 1, quantity: 1 }, // Beef Biryani
            { mealId: 5, quantity: 1 }  // MIST Cold Coffee
        ];
        
        // Verify stock of both first
        let stockAvailable = true;
        for (const item of comboMeals) {
            const meal = state.meals.find(m => m.id === item.mealId);
            if (!meal || meal.stock < item.quantity) {
                stockAvailable = false;
                showToast(`Sorry, ${meal ? meal.name : 'Combo item'} is out of stock today!`, "error");
                break;
            }
        }
        
        if (stockAvailable) {
            state.cart = comboMeals.map(item => ({ ...item }));
            updateCartDOM();
            openCartDrawer();
            showToast("Special combo added to tray! 🍕", "success");
        }
    });
}

function updateWelcomeStatsDOM() {
    const spentEl = document.getElementById("banner-stat-spent");
    const countEl = document.getElementById("banner-stat-count");
    if (!spentEl || !countEl) return;

    const totalSpent = state.orderHistory.reduce((sum, order) => sum + order.amount, 0);
    spentEl.innerText = `${totalSpent.toFixed(2)} ৳`;
    countEl.innerText = state.orderHistory.length.toString();
}

window.setServiceType = function(type) {
    state.selectedServiceType = type;
    const dineBtn = document.getElementById("dine-in-btn");
    const parcelBtn = document.getElementById("parcel-btn");
    if (!dineBtn || !parcelBtn) return;

    if (type === "Dine In") {
        dineBtn.className = "cursor-pointer p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-500 text-teal-800 dark:text-teal-300 shadow-sm relative";
        dineBtn.innerHTML = `
            <span class="material-symbols-outlined text-lg">restaurant</span>
            <span class="text-[10px] font-black uppercase tracking-wider">Dine In</span>
            <div class="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold">✓</div>
        `;
        
        parcelBtn.className = "cursor-pointer p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all bg-surface-container-high dark:bg-[#2c2d30] border-outline-variant/30 text-slate-500 dark:text-[#bec9c8] hover:text-slate-800 dark:hover:text-white";
        parcelBtn.innerHTML = `
            <span class="material-symbols-outlined text-lg">takeout_dining</span>
            <span class="text-[10px] font-black uppercase tracking-wider">Parcel</span>
        `;
    } else {
        dineBtn.className = "cursor-pointer p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all bg-surface-container-high dark:bg-[#2c2d30] border-outline-variant/30 text-slate-500 dark:text-[#bec9c8] hover:text-slate-800 dark:hover:text-white";
        dineBtn.innerHTML = `
            <span class="material-symbols-outlined text-lg">restaurant</span>
            <span class="text-[10px] font-black uppercase tracking-wider">Dine In</span>
        `;
        
        parcelBtn.className = "cursor-pointer p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-500 text-teal-800 dark:text-teal-300 shadow-sm relative";
        parcelBtn.innerHTML = `
            <span class="material-symbols-outlined text-lg">takeout_dining</span>
            <span class="text-[10px] font-black uppercase tracking-wider">Parcel</span>
            <div class="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold">✓</div>
        `;
    }
};

window.updateWelcomeStatsDOM = updateWelcomeStatsDOM;

window.addEventListener('storage', (e) => {
    if (e.key === 'campuspay-active-order') {
        state.activeOrder = e.newValue ? JSON.parse(e.newValue) : null;
        renderActiveOrderStatus();
    }
});

// Bind top-level controls
function initEventListeners() {
    // Theme Toggle
    const themeBtn = document.getElementById("theme-toggle");
    themeBtn?.addEventListener("click", toggleTheme);

    const themeBtnMobile = document.getElementById("theme-toggle-mobile");
    themeBtnMobile?.addEventListener("click", toggleTheme);

    // Search Engine
    const searchInput = document.getElementById("search-input");
    searchInput?.addEventListener("input", (e) => {
        state.searchQuery = e.target.value;
        renderFoodGrid();
        showSearchSuggestions(e.target.value);
    });

    searchInput?.addEventListener("focus", (e) => {
        showSearchSuggestions(e.target.value);
    });

    searchInput?.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            document.getElementById("search-suggestions-dropdown")?.classList.add("hidden");
        }
    });

    // Hide dropdown when clicking outside
    document.addEventListener("click", (e) => {
        const dropdown = document.getElementById("search-suggestions-dropdown");
        const input = document.getElementById("search-input");
        if (dropdown && !dropdown.contains(e.target) && e.target !== input) {
            dropdown.classList.add("hidden");
        }
    });

    // Category Tabs click navigation
    const categoryTabs = document.querySelectorAll("#category-tabs button");
    categoryTabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            state.selectedCategory = e.target.innerText.trim();
            updateCategoryTabsDOM();
            renderFoodGrid();
        });
    });

    // Cart Panel Toggles
    const cartOpenBtns = document.querySelectorAll(".cart-open-btn");
    cartOpenBtns.forEach(btn => {
        btn.addEventListener("click", openCartDrawer);
    });

    const cartCloseBtn = document.getElementById("cart-close-btn");
    cartCloseBtn?.addEventListener("click", closeCartDrawer);

    const cartOverlay = document.getElementById("cart-overlay");
    cartOverlay?.addEventListener("click", closeCartDrawer);

    // Active Order Drawer Toggles
    const activeOrderBtn = document.getElementById("active-order-bell-btn");
    activeOrderBtn?.addEventListener("click", openActiveOrderDrawer);

    const activeOrderCloseBtn = document.getElementById("orders-close-btn");
    activeOrderCloseBtn?.addEventListener("click", closeActiveOrderDrawer);

    const activeOrderOverlay = document.getElementById("orders-overlay");
    activeOrderOverlay?.addEventListener("click", closeActiveOrderDrawer);

    // Mobile Navigation burger triggers
    const menuOpenBtn = document.getElementById("mobile-menu-btn");
    menuOpenBtn?.addEventListener("click", openMobileNav);

    const menuCloseBtn = document.getElementById("mobile-menu-close-btn");
    menuCloseBtn?.addEventListener("click", closeMobileNav);

    const mobileNavOverlay = document.getElementById("mobile-nav-overlay");
    mobileNavOverlay?.addEventListener("click", closeMobileNav);

    // Recharge dialog toggle modal close triggers
    const rechargeCloseBtn = document.getElementById("recharge-close-btn");
    rechargeCloseBtn?.addEventListener("click", closeRechargeModal);

    const rechargeOverlay = document.getElementById("recharge-overlay");
    rechargeOverlay?.addEventListener("click", closeRechargeModal);

    const rechargeCancelBtn = document.getElementById("recharge-cancel-btn");
    rechargeCancelBtn?.addEventListener("click", closeRechargeModal);

    // Checkout Confirmation
    const checkoutConfirmBtn = document.getElementById("checkout-btn");
    checkoutConfirmBtn?.addEventListener("click", processCheckout);

    // Active order collection click
    document.getElementById("collect-active-order-btn")?.addEventListener("click", markActiveOrderCollected);
}

// Search Suggestions Dropdown Logic (Amazon Style)
function showSearchSuggestions(query) {
    const dropdown = document.getElementById("search-suggestions-dropdown");
    if (!dropdown) return;

    const trimmedQuery = query.trim().toLowerCase();
    if (trimmedQuery === "") {
        dropdown.innerHTML = "";
        dropdown.classList.add("hidden");
        return;
    }

    // Filter meals matching the query in name, tagline, or category
    const matches = state.meals.filter(meal =>
        meal.name.toLowerCase().includes(trimmedQuery) ||
        meal.tagline.toLowerCase().includes(trimmedQuery) ||
        meal.category.toLowerCase().includes(trimmedQuery)
    );

    if (matches.length === 0) {
        dropdown.innerHTML = `
            <div class="p-4 text-center text-xs text-on-surface-variant dark:text-[#bec9c8]">
                No suggestions found
            </div>
        `;
        dropdown.classList.remove("hidden");
        return;
    }

    // Render Amazon style list items
    dropdown.innerHTML = matches.map(meal => {
        const isOutOfStock = meal.stock <= 0;
        const highlightedName = highlightMatch(meal.name, query);
        const actionButtonHTML = isOutOfStock
            ? `<span class="text-[10px] font-bold text-[#b91c1c] dark:text-[#f87171] bg-red-100 dark:bg-red-950/40 px-2 py-1 rounded-lg shrink-0 select-none">Out of Stock</span>`
            : `<button onclick="event.stopPropagation(); window.addToCart(${meal.id});" class="bg-primary hover:bg-primary-container text-on-primary dark:bg-primary-container dark:text-on-primary-container px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1 shrink-0">
                <span class="material-symbols-outlined text-[14px]">add_shopping_cart</span>Add
               </button>`;

        return `
            <div onclick="window.selectSearchSuggestion('${meal.name.replace(/'/g, "\\'")}')" class="flex items-center justify-between p-3 border-b border-outline-variant/30 hover:bg-surface-container-low dark:hover:bg-[#202225] transition-colors cursor-pointer select-none">
                <div class="flex items-center min-w-0 mr-3">
                    <img src="${meal.image}" alt="${meal.name}" class="w-12 h-12 object-cover rounded-lg border border-outline-variant/50 mr-3 shadow-sm shrink-0" />
                    <div class="min-w-0">
                        <span class="font-bold text-sm text-on-surface dark:text-white block truncate leading-snug">${highlightedName}</span>
                        <span class="text-[11px] text-on-surface-variant dark:text-secondary-fixed-dim block truncate max-w-[200px] sm:max-w-xs md:max-w-md mt-0.5">${meal.tagline}</span>
                        <div class="flex items-center gap-2 mt-1.5">
                            <span class="bg-primary/10 text-primary dark:bg-primary-container/30 dark:text-[#86d4d3] px-1.5 py-0.5 rounded text-[10px] font-bold">${meal.category}</span>
                            <span class="text-xs font-black text-primary dark:text-[#86d4d3]">${meal.price.toFixed(2)} ৳</span>
                        </div>
                    </div>
                </div>
                ${actionButtonHTML}
            </div>
        `;
    }).join('');

    dropdown.classList.remove("hidden");
}

function highlightMatch(text, query) {
    if (!query) return text;
    const cleanQuery = query.trim();
    if (!cleanQuery) return text;
    const regex = new RegExp(`(${escapeRegExp(cleanQuery)})`, "gi");
    return text.replace(regex, "<mark class='bg-amber-100 text-neutral-900 rounded px-0.5 dark:bg-amber-500/30 dark:text-white font-black'>$1</mark>");
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

window.selectSearchSuggestion = function(mealName) {
    state.searchQuery = mealName;
    
    const searchInput = document.getElementById("search-input");
    if (searchInput) searchInput.value = mealName;
    
    // Hide dropdown
    const dropdown = document.getElementById("search-suggestions-dropdown");
    if (dropdown) dropdown.classList.add("hidden");
    
    renderFoodGrid();
};


// ==========================================
// NEW ROUTED TABS CONTROLLER & VIEWS ENGINE
// ==========================================

function showPanel(panelId) {
    state.activePanel = panelId;
    localStorage.setItem('campuspay-active-panel', panelId);

    // Hide all panels, show selected one
    const panels = document.querySelectorAll('.tab-panel');
    panels.forEach(p => p.classList.add('hidden'));

    const targetPanel = document.getElementById(`panel-${panelId}`);
    if (targetPanel) {
        targetPanel.classList.remove('hidden');
        targetPanel.classList.add('animate-fade-in');
    }

    // Set Header Title text dynamically
    const headerTitle = document.getElementById('page-header-title');
    if (headerTitle) {
        const titles = {
            menu: "Food Menu",
            favorites: "Favorites",
            history: "Order History",
            notifications: "Notifications & Alerts",
            profile: "Profile Settings",
            feedback: "Feedback & Ratings",
            wallet: "Wallet & Recharge",
            transactions: "Transactions",
            support: "Help & Support",
            settings: "System Settings"
        };
        headerTitle.innerText = titles[panelId] || "Dashboard";
    }

    // Update Tab links styling dynamically
    const navIds = ['menu', 'favorites', 'history', 'notifications', 'profile', 'feedback', 'wallet', 'transactions', 'support', 'settings'];
    navIds.forEach(id => {
        // Desktop Tab Styles
        const navBtn = document.getElementById(`nav-${id}`);
        if (navBtn) {
            if (id === panelId) {
                navBtn.classList.remove("text-on-surface-variant", "dark:text-secondary-fixed-dim", "hover:bg-surface-container-high", "dark:hover:bg-[#202225]");
                navBtn.classList.add("bg-secondary-container", "dark:bg-[#004f4f]/30", "text-on-secondary-container", "dark:text-[#86d4d3]", "font-bold");
            } else {
                navBtn.classList.remove("bg-secondary-container", "dark:bg-[#004f4f]/30", "text-on-secondary-container", "dark:text-[#86d4d3]", "font-bold");
                navBtn.classList.add("text-on-surface-variant", "dark:text-secondary-fixed-dim", "hover:bg-surface-container-high", "dark:hover:bg-[#202225]");
            }
        }
        // Mobile Drawer Tab Styles
        const mobBtn = document.getElementById(`mob-nav-${id}`);
        if (mobBtn) {
            if (id === panelId) {
                mobBtn.classList.remove("text-on-surface-variant", "dark:text-secondary-fixed-dim", "hover:bg-surface-container-high", "dark:hover:bg-[#202225]");
                mobBtn.classList.add("bg-secondary-container", "dark:bg-[#004f4f]/30", "text-on-secondary-container", "dark:text-[#86d4d3]", "font-bold");
            } else {
                mobBtn.classList.remove("bg-secondary-container", "dark:bg-[#004f4f]/30", "text-on-secondary-container", "dark:text-[#86d4d3]", "font-bold");
                mobBtn.classList.add("text-on-surface-variant", "dark:text-secondary-fixed-dim", "hover:bg-surface-container-high", "dark:hover:bg-[#202225]");
            }
        }
    });

    // Fire panel hydration functions
    if (panelId === 'menu') {
        renderFoodGrid();
        renderActiveOrderStatus();
        renderRecentOrders();
        updateWelcomeStatsDOM();
    }
    if (panelId === 'favorites') renderFavoritesPanel();
    if (panelId === 'history') renderHistoryPanel();
    if (panelId === 'notifications') renderNotificationsPanel();
    if (panelId === 'profile') loadProfileData();
    if (panelId === 'wallet') renderWalletPanel();
    if (panelId === 'transactions') renderTransactionsPanel();
}
window.showPanel = showPanel;
window.closeMobileNav = closeMobileNav;

// Tab 2: Favorites Panel renderer
function renderFavoritesPanel() {
    const grid = document.getElementById('favorites-grid');
    if (!grid) return;

    if (state.favorites.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-[#1e2022] rounded-2xl border border-outline-variant p-8 select-none">
                <span class="material-symbols-outlined text-6xl text-rose-500/30 mb-4">favorite_border</span>
                <h3 class="font-title-lg text-title-lg text-on-surface font-bold mb-2">No favorites saved yet</h3>
                <p class="text-on-surface-variant max-w-xs mb-4">Save your favorite dishes from the Food Menu tab to order with a single click.</p>
                <button onclick="window.showPanel('menu')" class="bg-primary text-on-primary px-6 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow">Browse Food Menu</button>
            </div>
        `;
        return;
    }

    const favoriteMeals = state.meals.filter(m => state.favorites.includes(m.id));
    grid.innerHTML = favoriteMeals.map(meal => {
        const isOutOfStock = meal.stock <= 0;
        return `
            <div class="bg-white dark:bg-[#1e2022] rounded-2xl border border-outline-variant p-4 flex flex-col justify-between shadow-sm relative hover:shadow-md transition-all">
                <button onclick="window.toggleFavorite(${meal.id})" class="absolute top-3 right-3 bg-white/90 dark:bg-[#1e2022]/90 p-1.5 rounded-full shadow-sm text-rose-500 transition-transform active:scale-95 z-10">
                    <span class="material-symbols-outlined text-[18px] fill-rose-500">favorite</span>
                </button>
                <img src="${meal.image}" class="w-full h-32 object-cover rounded-xl mb-3" />
                <div class="flex-1 mb-3">
                    <h4 class="font-bold text-sm text-on-surface line-clamp-1">${meal.name}</h4>
                    <span class="text-[10px] text-primary dark:text-[#86d4d3] font-bold block mt-1">${meal.price.toFixed(2)} ৳</span>
                </div>
                <button onclick="window.addToCart(${meal.id})" ${isOutOfStock ? 'disabled' : ''} class="w-full bg-primary text-on-primary py-2 rounded-xl text-xs font-bold hover:brightness-110 disabled:bg-outline/50 disabled:cursor-not-allowed transition-all active:scale-95">
                    ${isOutOfStock ? 'Sold Out' : 'Quick Order'}
                </button>
            </div>
        `;
    }).join('');
}

window.toggleFavorite = function(mealId) {
    if (state.favorites.includes(mealId)) {
        state.favorites = state.favorites.filter(id => id !== mealId);
        showToast("Removed from favorites", "info");
    } else {
        state.favorites.push(mealId);
        showToast("Added to favorites ❤️", "success");
    }
    localStorage.setItem('campuspay-favorites', JSON.stringify(state.favorites));
    renderFoodGrid();
    if (state.activePanel === 'favorites') {
        renderFavoritesPanel();
    }
}

// Tab 3: Order History Panel renderer
// --- History Filter & Accordion State & Helpers ---
state.historySearchQuery = "";
state.historyDateFilter = "all";
state.historyCategoryFilter = "all";
state.historyTypeFilter = "all";
state.historySortBy = "newest";
state.expandedHistoryOrders = state.expandedHistoryOrders || [];
state.favoriteOrders = JSON.parse(localStorage.getItem('campuspay-favorite-orders') || '[]');

function getRelativeTime(timestampStr) {
    if (!timestampStr) return "Recently";
    const dateObj = new Date(timestampStr);
    if (isNaN(dateObj.getTime())) return "Recently";
    const diffMs = new Date() - dateObj;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Ordered today";
    if (diffDays === 1) return "Ordered yesterday";
    return `Ordered ${diffDays} days ago`;
}

window.handleHistorySearch = function(val) {
    state.historySearchQuery = val;
    renderHistoryPanel();
};

window.handleHistorySort = function(val) {
    state.historySortBy = val;
    renderHistoryPanel();
};

window.handleHistoryDateFilter = function(val) {
    state.historyDateFilter = val;
    renderHistoryPanel();
};

window.handleHistoryCategoryFilter = function(val) {
    state.historyCategoryFilter = val;
    renderHistoryPanel();
};

window.handleHistoryTypeFilter = function(val) {
    state.historyTypeFilter = val;
    renderHistoryPanel();
};

window.resetHistoryFilters = function() {
    state.historySearchQuery = "";
    state.historyDateFilter = "all";
    state.historyCategoryFilter = "all";
    state.historyTypeFilter = "all";
    state.historySortBy = "newest";

    const searchInput = document.getElementById("history-search-input");
    const sortSelect = document.getElementById("history-filter-sort");
    const dateSelect = document.getElementById("history-filter-date");
    const catSelect = document.getElementById("history-filter-category");
    const typeSelect = document.getElementById("history-filter-type");

    if (searchInput) searchInput.value = "";
    if (sortSelect) sortSelect.value = "newest";
    if (dateSelect) dateSelect.value = "all";
    if (catSelect) catSelect.value = "all";
    if (typeSelect) typeSelect.value = "all";

    renderHistoryPanel();
};

window.toggleExpandOrder = function(orderId) {
    if (state.expandedHistoryOrders.includes(orderId)) {
        state.expandedHistoryOrders = state.expandedHistoryOrders.filter(id => id !== orderId);
    } else {
        state.expandedHistoryOrders.push(orderId);
    }
    renderHistoryPanel();
};

window.toggleFavoriteOrder = function(orderId) {
    if (state.favoriteOrders.includes(orderId)) {
        state.favoriteOrders = state.favoriteOrders.filter(id => id !== orderId);
        showToast(`Removed Order #${orderId} from favorite orders`, "info");
    } else {
        state.favoriteOrders.push(orderId);
        showToast(`Saved Order #${orderId} to favorite orders ❤️`, "success");
    }
    localStorage.setItem('campuspay-favorite-orders', JSON.stringify(state.favoriteOrders));
    renderHistoryPanel();
};

window.reorderOrderById = function(orderId) {
    const order = state.orderHistory.find(o => o.orderId === orderId);
    if (!order) return;
    
    let stockAvailable = true;
    for (const item of order.items) {
        const meal = state.meals.find(m => m.id === item.mealId);
        if (!meal || meal.stock < item.quantity) {
            stockAvailable = false;
            showToast(`${meal ? meal.name : 'Item'} is out of stock!`, "error");
            break;
        }
    }
    
    if (stockAvailable) {
        state.cart = order.items.map(item => ({ ...item }));
        updateCartDOM();
        showToast(`Copied ${order.items.length} items from Order #${orderId} back to your tray! 🛒`, "success");
    }
};

window.downloadReceipt = function(orderId) {
    window.printReceipt(orderId);
};

// Tab 3: Order History Panel renderer
function renderHistoryPanel() {
    const list = document.getElementById('history-panel-list');
    if (!list) return;

    // 1. Calculate & Render Summary Statistics Cards
    const totalOrders = state.orderHistory.length;
    const totalSpent = state.orderHistory.reduce((sum, o) => sum + o.amount, 0);
    
    // Find favorite meal across all orders
    const mealCountMap = {};
    state.orderHistory.forEach(order => {
        order.items.forEach(item => {
            mealCountMap[item.mealId] = (mealCountMap[item.mealId] || 0) + item.quantity;
        });
    });
    
    let favoriteMealId = null;
    let maxCount = 0;
    for (const [mealId, count] of Object.entries(mealCountMap)) {
        if (count > maxCount) {
            maxCount = count;
            favoriteMealId = parseInt(mealId);
        }
    }
    
    const favMealObj = state.meals.find(m => m.id === favoriteMealId);
    const favoriteMealName = favMealObj ? favMealObj.name : (totalOrders > 0 ? "Crispy Chicken" : "None yet");
    const lastOrderDate = totalOrders > 0 ? (state.orderHistory[state.orderHistory.length - 1].timestamp || "Recently") : "N/A";

    const statOrdersEl = document.getElementById("history-stat-total-orders");
    const statSpentEl = document.getElementById("history-stat-total-spent");
    const statFavEl = document.getElementById("history-stat-favorite-meal");
    const statLastEl = document.getElementById("history-stat-last-order");

    if (statOrdersEl) statOrdersEl.innerText = totalOrders.toString();
    if (statSpentEl) statSpentEl.innerText = `${totalSpent.toFixed(2)} ৳`;
    if (statFavEl) statFavEl.innerText = favoriteMealName;
    if (statLastEl) statLastEl.innerText = lastOrderDate;

    // 2. Filter & Sort Orders
    let filtered = [...state.orderHistory];

    // Search Query Filter
    if (state.historySearchQuery.trim() !== "") {
        const q = state.historySearchQuery.toLowerCase();
        filtered = filtered.filter(order => {
            const matchesId = order.orderId.toString().includes(q) || `#${order.orderId}`.toLowerCase().includes(q);
            const matchesTime = order.timestamp && order.timestamp.toLowerCase().includes(q);
            const matchesType = order.dineOption && order.dineOption.toLowerCase().includes(q);
            const matchesItem = order.items.some(item => {
                const meal = state.meals.find(m => m.id === item.mealId);
                return meal && meal.name.toLowerCase().includes(q);
            });
            return matchesId || matchesTime || matchesType || matchesItem;
        });
    }

    // Date Range Filter
    if (state.historyDateFilter !== "all") {
        const now = new Date();
        filtered = filtered.filter(order => {
            if (!order.timestamp) return true;
            const orderDate = new Date(order.timestamp);
            if (isNaN(orderDate.getTime())) return true;

            const diffDays = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
            if (state.historyDateFilter === "today") return diffDays <= 1;
            if (state.historyDateFilter === "week") return diffDays <= 7;
            if (state.historyDateFilter === "month") return diffDays <= 30;
            return true;
        });
    }

    // Category Filter
    if (state.historyCategoryFilter !== "all") {
        filtered = filtered.filter(order => {
            return order.items.some(item => {
                const meal = state.meals.find(m => m.id === item.mealId);
                return meal && meal.category.toLowerCase() === state.historyCategoryFilter.toLowerCase();
            });
        });
    }

    // Type Filter
    if (state.historyTypeFilter !== "all") {
        filtered = filtered.filter(order => {
            return order.dineOption === state.historyTypeFilter;
        });
    }

    // Sort Filter
    if (state.historySortBy === "newest") {
        filtered.reverse();
    } else if (state.historySortBy === "oldest") {
        // keep chronological order
    } else if (state.historySortBy === "highest") {
        filtered.sort((a, b) => b.amount - a.amount);
    } else if (state.historySortBy === "lowest") {
        filtered.sort((a, b) => a.amount - b.amount);
    }

    // 3. Render Empty State if 0 matching orders
    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-[#1e2022] rounded-[22px] border border-outline-variant p-8 select-none shadow-sm">
                <div class="w-20 h-20 rounded-full bg-slate-100 dark:bg-[#2c2d30] flex items-center justify-center mb-4 text-slate-400 dark:text-gray-500">
                    <span class="material-symbols-outlined text-5xl">history_toggle_off</span>
                </div>
                <h3 class="font-title-lg text-title-lg text-slate-800 dark:text-white font-bold mb-2">No previous orders found</h3>
                <p class="text-slate-500 dark:text-gray-400 max-w-sm text-xs mb-6">No order logs match your search filter or date criteria.</p>
                <div class="flex gap-3">
                    <button onclick="window.resetHistoryFilters()" class="bg-slate-100 hover:bg-slate-200 dark:bg-[#2c2d30] dark:hover:bg-[#3d4043] text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl text-xs font-bold transition-all">Reset Filters</button>
                    <button onclick="window.showPanel('menu')" class="bg-primary text-on-primary px-6 py-2.5 rounded-xl text-xs font-bold hover:brightness-110 transition-all active:scale-95 shadow-md">Browse Menu</button>
                </div>
            </div>
        `;
        return;
    }

    const latestOrderId = state.orderHistory.length > 0 ? state.orderHistory[state.orderHistory.length - 1].orderId : null;

    // 4. Render Premium Order Cards
    list.innerHTML = filtered.map((order) => {
        const isLatest = order.orderId === latestOrderId;
        const isFavOrder = state.favoriteOrders.includes(order.orderId);
        const isExpanded = state.expandedHistoryOrders.includes(order.orderId);
        const relativeTimeStr = getRelativeTime(order.timestamp);
        const isParcel = order.dineOption === 'Parcel';
        const cardBgGradient = isParcel 
            ? "bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-pink-500/10 dark:from-[#25152d] dark:to-[#1e2022] border-2 border-purple-500/30"
            : "bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-cyan-500/10 dark:from-[#132826] dark:to-[#1e2022] border-2 border-teal-500/30";
        
        const headerBgGradient = isParcel
            ? "bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-pink-500/15 border border-purple-500/20"
            : "bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-teal-500/15 border border-teal-500/20";

        const itemsHtml = order.items.map(item => {
            const meal = state.meals.find(m => m.id === item.mealId);
            const imageSrc = meal ? meal.image : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&q=80';
            const price = meal ? meal.price : 0;
            const subtotal = price * item.quantity;

            return `
                <div class="flex items-center justify-between p-3 bg-white/80 dark:bg-[#202225]/80 rounded-xl border border-teal-500/15 shadow-sm font-title-lg select-none">
                    <div class="flex items-center gap-3">
                        <img src="${imageSrc}" alt="${meal ? meal.name : 'Food'}" class="w-12 h-12 rounded-xl object-cover border border-teal-500/20 shadow-sm shrink-0" />
                        <div>
                            <span class="font-title-lg text-title-lg text-slate-900 dark:text-white font-bold block">${meal ? meal.name : 'Unknown Food'}</span>
                            <span class="text-[11px] text-slate-500 dark:text-gray-400 font-mono font-bold">${price.toFixed(2)} ৳ each</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 font-title-lg">
                        <span class="bg-teal-500/20 text-teal-800 dark:text-teal-300 text-xs font-black font-title-lg px-2.5 py-1 rounded-lg border border-teal-500/30">x${item.quantity}</span>
                        <span class="font-mono text-xs font-black text-slate-900 dark:text-white">${subtotal.toFixed(2)} ৳</span>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="bg-gradient-to-r ${cardGradientClass} ${borderAccentClass} p-5 rounded-2xl border shadow-sm transition-all hover:shadow-md space-y-4 font-title-lg">
                <!-- Card Top Header Box -->
                <div class="flex flex-wrap items-center justify-between gap-3 border-b border-teal-500/20 pb-3 font-title-lg">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl ${isParcel ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300' : 'bg-teal-500/20 text-teal-700 dark:text-teal-300'} flex items-center justify-center font-bold text-sm shrink-0">
                            <span class="material-symbols-outlined text-lg">${isParcel ? 'takeout_dining' : 'restaurant'}</span>
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="font-title-lg text-title-lg text-slate-900 dark:text-white font-black text-base">Order #${order.orderId}</span>
                                <button onclick="window.toggleFavoriteOrder(${order.orderId})" class="text-rose-500 hover:scale-110 transition-transform" title="Toggle Favorite">
                                    <span class="material-symbols-outlined text-lg">${isFav ? 'favorite' : 'favorite_border'}</span>
                                </button>
                            </div>
                            <span class="text-[11px] text-slate-500 dark:text-gray-300 font-medium block mt-0.5">Ordered ${order.timestamp || 'recently'}</span>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-2">
                        <span class="px-3 py-1 bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-title-lg font-black uppercase tracking-wider">
                            ✓ Completed
                        </span>
                    </div>
                </div>

                <!-- Structured Metadata Bento Box -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/70 dark:bg-[#1a1c1e]/60 p-3.5 rounded-xl border border-teal-500/20 font-title-lg text-xs">
                    <div>
                        <span class="text-[10px] text-teal-800 dark:text-teal-300 font-title-lg font-black uppercase tracking-wider block">📅 Date & Time</span>
                        <span class="font-title-lg text-slate-900 dark:text-white font-bold block mt-0.5">${order.timestamp || 'Recent'}</span>
                    </div>
                    <div>
                        <span class="text-[10px] text-teal-800 dark:text-teal-300 font-title-lg font-black uppercase tracking-wider block">🍽️ Service Type</span>
                        <span class="font-title-lg text-slate-900 dark:text-white font-bold block mt-0.5">${order.dineOption || 'Dine In'}</span>
                    </div>
                    <div>
                        <span class="text-[10px] text-teal-800 dark:text-teal-300 font-title-lg font-black uppercase tracking-wider block">💳 Payment Method</span>
                        <span class="font-title-lg text-slate-900 dark:text-white font-bold block mt-0.5">CampusPay Wallet</span>
                    </div>
                    <div>
                        <span class="text-[10px] text-teal-800 dark:text-teal-300 font-title-lg font-black uppercase tracking-wider block">💰 Total Paid</span>
                        <span class="font-mono text-emerald-600 dark:text-[#86d4d3] font-black block mt-0.5">${order.amount.toFixed(2)} ৳</span>
                    </div>
                </div>

                <!-- Ordered Items List Box -->
                <div class="space-y-2 font-title-lg">
                    <span class="text-[10px] text-teal-800 dark:text-teal-300 font-title-lg font-black uppercase tracking-wider block px-1">Ordered Items</span>
                    ${itemsHtml}
                </div>

                <!-- Price Summary Box -->
                <div class="bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-cyan-500/15 border border-emerald-500/30 p-4 rounded-xl flex justify-between items-center font-title-lg">
                    <div>
                        <span class="font-title-lg text-title-lg text-slate-900 dark:text-white font-black uppercase tracking-wide block">Total Paid Amount</span>
                        <span class="text-[10px] text-slate-500 dark:text-gray-300 font-medium">Includes canteen service & item taxes</span>
                    </div>
                    <span class="font-mono text-xl text-emerald-600 dark:text-[#86d4d3] font-black">${order.amount.toFixed(2)} ৳</span>
                </div>

                <!-- Bottom Action Buttons Bar -->
                <div class="flex flex-wrap gap-2 w-full pt-1 font-title-lg">
                    <button onclick="window.viewReceiptPopup(${order.orderId})" class="flex-1 min-w-[110px] bg-teal-500/20 hover:bg-teal-600 text-teal-900 dark:text-teal-200 hover:text-white border border-teal-500/30 py-2.5 rounded-xl text-xs font-title-lg font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm">
                        <span class="material-symbols-outlined text-[14px]">visibility</span> View Details
                    </button>
                    <button onclick="window.downloadReceipt(${order.orderId})" class="flex-1 min-w-[110px] bg-white/80 dark:bg-[#2c2d30] border border-teal-500/20 hover:bg-slate-100 dark:hover:bg-[#3d4043] py-2.5 rounded-xl text-xs font-title-lg font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5 text-slate-800 dark:text-slate-200 shadow-sm">
                        <span class="material-symbols-outlined text-[14px]">download</span> Receipt
                    </button>
                    <button onclick="window.reorderOrderById(${order.orderId})" class="flex-1 min-w-[110px] bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:brightness-110 py-2.5 rounded-xl text-xs font-title-lg font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md">
                        <span class="material-symbols-outlined text-[14px]">refresh</span> Reorder
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Receipt printable ticket triggers & PDF Print Generator
window.viewReceiptPopup = function(orderIdOrIdx) {
    let order = state.orderHistory.find(o => String(o.orderId) === String(orderIdOrIdx));
    if (!order && typeof orderIdOrIdx === 'number' && orderIdOrIdx < state.orderHistory.length) {
        order = state.orderHistory[orderIdOrIdx];
    }
    if (!order && state.activeOrder) {
        order = state.activeOrder;
    }
    if (!order && state.orderHistory.length > 0) {
        order = state.orderHistory[state.orderHistory.length - 1];
    }
    if (!order) return;
    
    // Store current viewed order for printing
    window._currentlyViewedOrder = order;

    const dateEl = document.getElementById('receipt-date-time');
    const idEl = document.getElementById('receipt-id-num');
    const txidEl = document.getElementById('receipt-txid-num');
    const dineEl = document.getElementById('receipt-dine-type');
    const itemsList = document.getElementById('receipt-items-list');
    const totalEl = document.getElementById('receipt-total-cost');
    const qrImg = document.getElementById('receipt-qr-code-img');
    
    if (dateEl) dateEl.innerText = order.timestamp || new Date().toLocaleString();
    if (idEl) idEl.innerText = `#${order.orderId}`;
    if (txidEl) txidEl.innerText = `TXN-${order.orderId * 84920}`;
    if (dineEl) dineEl.innerText = order.dineOption || "Dine In";
    if (totalEl) totalEl.innerText = `${order.amount.toFixed(2)} ৳`;
    if (qrImg) qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ORDER_${order.orderId}`;

    if (itemsList) {
        itemsList.innerHTML = order.items.map(item => {
            const meal = state.meals.find(m => m.id === item.mealId);
            const imageSrc = meal ? meal.image : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&q=80';
            return `
                <div class="flex items-center justify-between py-1.5 border-b border-outline-variant/20 font-sans select-none last:border-0">
                    <div class="flex items-center gap-2">
                        <img src="${imageSrc}" class="w-8 h-8 rounded-lg object-cover border border-slate-200" />
                        <span class="font-bold text-slate-800 dark:text-slate-200">${meal ? meal.name : 'Food'} x${item.quantity}</span>
                    </div>
                    <span class="font-mono font-black text-slate-700 dark:text-slate-300">${meal ? (meal.price * item.quantity).toFixed(2) : '0.00'} ৳</span>
                </div>
            `;
        }).join('');
    }
    
    // Open Receipt Modal
    const modal = document.getElementById('receipt-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.pointerEvents = 'auto';
        void modal.offsetWidth;
        modal.classList.add('modal-open');
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.style.transform = 'translateY(0)';
            content.style.opacity = '1';
        }
        const overlay = modal.querySelector('.drawer-overlay');
        if (overlay) {
            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';
        }
    }
};

window.closeReceiptModal = function() {
    const modal = document.getElementById('receipt-modal');
    if (!modal) return;
    modal.classList.remove('modal-open');
    const content = modal.querySelector('.modal-content');
    if (content) {
        content.style.transform = 'translateY(12px)';
        content.style.opacity = '0';
    }
    const overlay = modal.querySelector('.drawer-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
    }
    setTimeout(() => {
        if (!modal.classList.contains('modal-open')) {
            modal.classList.add('hidden');
        }
    }, 300);
};

window.printReceipt = function(targetOrderId) {
    let order = window._currentlyViewedOrder;
    if (targetOrderId) {
        const found = state.orderHistory.find(o => String(o.orderId) === String(targetOrderId));
        if (found) order = found;
    }
    if (!order && state.activeOrder) {
        order = state.activeOrder;
    }
    if (!order && state.orderHistory.length > 0) {
        order = state.orderHistory[state.orderHistory.length - 1];
    }
    if (!order) {
        showToast("No order details available to print!", "error");
        return;
    }

    const itemsRows = order.items.map(item => {
        const meal = state.meals.find(m => m.id === item.mealId);
        const name = meal ? meal.name : 'Food Item';
        const price = meal ? meal.price : 0;
        const subtotal = price * item.quantity;
        return `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px;"><strong>${name}</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 13px; font-weight: bold;">x${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 13px;">${price.toFixed(2)} ৳</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 13px; font-weight: 800; font-family: monospace;">${subtotal.toFixed(2)} ৳</td>
            </tr>
        `;
    }).join('');

    const printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>CampusPay Official Receipt - Order #${order.orderId}</title>
            <style>
                body { font-family: 'Outfit', 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 30px; color: #0f172a; background: #f8fafc; }
                .receipt-card { max-width: 520px; margin: 0 auto; background: #ffffff; border: 2px solid #0d9488; border-radius: 20px; padding: 30px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
                .brand-header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 20px; margin-bottom: 20px; }
                .brand-header h1 { margin: 0; font-size: 22px; color: #0d9488; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; }
                .brand-header p { margin: 4px 0 0 0; font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; }
                .meta-table { width: 100%; margin-bottom: 20px; font-size: 12px; background: #f1f5f9; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0; }
                .meta-table td { padding: 4px 6px; }
                .meta-label { color: #64748b; font-weight: 700; }
                .meta-val { font-weight: 800; color: #0f172a; }
                .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .items-table th { background: #0d9488; color: #ffffff; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800; border-radius: 6px 6px 0 0; }
                .total-card { background: linear-gradient(135deg, #0d9488, #059669); color: #ffffff; padding: 16px 20px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(13,148,136,0.25); }
                .total-title { font-weight: 900; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; }
                .total-amount { font-size: 22px; font-weight: 900; font-family: monospace; }
                .qr-section { text-align: center; margin-bottom: 20px; background: #f8fafc; padding: 16px; border-radius: 14px; border: 1px border-dashed #cbd5e1; }
                .qr-section img { border: 1px solid #cbd5e1; border-radius: 10px; padding: 6px; background: #fff; }
                .footer-text { text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; pt: 16px; margin-top: 20px; font-weight: 600; }
                @media print {
                    body { background: #fff; padding: 0; }
                    .receipt-card { border: none; box-shadow: none; width: 100%; max-width: 100%; padding: 0; }
                }
            </style>
        </head>
        <body>
            <div class="receipt-card">
                <div class="brand-header">
                    <h1>CampusPay Official Receipt</h1>
                    <p>Military Institute of Science & Technology (MIST) Canteen</p>
                </div>

                <table class="meta-table">
                    <tr>
                        <td class="meta-label">Student Name:</td>
                        <td class="meta-val">Ajmain</td>
                        <td class="meta-label">Order Number:</td>
                        <td class="meta-val" style="color: #0d9488;">#${order.orderId}</td>
                    </tr>
                    <tr>
                        <td class="meta-label">Student ID:</td>
                        <td class="meta-val">202114042</td>
                        <td class="meta-label">TxID:</td>
                        <td class="meta-val">TXN-${order.orderId * 84920}</td>
                    </tr>
                    <tr>
                        <td class="meta-label">Dining Option:</td>
                        <td class="meta-val">${order.dineOption || 'Dine In'}</td>
                        <td class="meta-label">Date & Time:</td>
                        <td class="meta-val">${order.timestamp || new Date().toLocaleString()}</td>
                    </tr>
                </table>

                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Food Item</th>
                            <th style="text-align: center;">Qty</th>
                            <th style="text-align: right;">Price</th>
                            <th style="text-align: right;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsRows}
                    </tbody>
                </table>

                <div class="total-card">
                    <span class="total-title">Total Amount Paid</span>
                    <span class="total-amount">${order.amount.toFixed(2)} ৳</span>
                </div>

                <div class="qr-section">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=ORDER_${order.orderId}" width="110" height="110" alt="QR Code" />
                    <p style="margin: 6px 0 0 0; font-size: 10px; color: #64748b; font-weight: 800; text-transform: uppercase;">Scan at Dispenser Counter for Verification</p>
                </div>

                <div class="footer-text">
                    <p style="margin: 0;">Thank you for dining with MIST Canteen!</p>
                </div>
            </div>

            <script>
                window.onload = function() {
                    window.print();
                };
            </script>
        </body>
        </html>
    `;

    const printWin = window.open('', '_blank', 'width=650,height=800');
    if (printWin) {
        printWin.document.open();
        printWin.document.write(printHtml);
        printWin.document.close();
        showToast(`Generating print-formatted PDF receipt for Order #${order.orderId}... 📄`, "success");
    } else {
        showToast("Please allow popups to open the printable PDF receipt!", "warning");
    }
};

// Tab 4: Notifications Panel renderer
function renderNotificationsPanel() {
    const list = document.getElementById('notifications-panel-list');
    if (!list) return;

    if (state.notifications.length === 0) {
        list.innerHTML = `
            <div class="py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-[#1e2022] rounded-2xl border border-outline-variant p-8 select-none">
                <span class="material-symbols-outlined text-6xl text-outline mb-4">notifications_off</span>
                <h3 class="font-title-lg text-title-lg text-on-surface font-bold mb-2">Clean notifications</h3>
                <p class="text-on-surface-variant max-w-xs">No alerts or notifications recorded today.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = state.notifications.map((notif) => {
        return `
            <div class="bg-white dark:bg-[#1e2022] p-4 rounded-xl border border-outline-variant flex items-start gap-3 select-none">
                <div class="w-8 h-8 rounded-full bg-primary/5 dark:bg-primary/20 text-primary dark:text-[#86d4d3] flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-[18px]">info</span>
                </div>
                <div class="flex-1">
                    <p class="text-xs font-bold text-on-surface leading-snug">${notif.title}</p>
                    <p class="text-[10px] text-on-surface-variant dark:text-gray-400 mt-0.5">${notif.message}</p>
                    <span class="text-[9px] text-outline block mt-1.5">${notif.date}</span>
                </div>
            </div>
        `;
    }).reverse().join('');
    
    // Mark notifications as read, clear badge counts
    const badges = [document.getElementById('notif-badge-count'), document.getElementById('mob-notif-badge-count')];
    badges.forEach(b => {
        if (b) {
            b.innerText = '0';
            b.classList.add('hidden');
        }
    });
}

window.clearNotifications = function() {
    state.notifications = [];
    localStorage.setItem('campuspay-notifications', JSON.stringify(state.notifications));
    renderNotificationsPanel();
    showToast("Cleared all notifications", "info");
}

function pushNotification(title, message) {
    const newNotif = {
        title: title,
        message: message,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    state.notifications.push(newNotif);
    localStorage.setItem('campuspay-notifications', JSON.stringify(state.notifications));
    
    // Update badge count
    const count = state.notifications.length;
    const badges = [document.getElementById('notif-badge-count'), document.getElementById('mob-notif-badge-count')];
    badges.forEach(b => {
        if (b && state.activePanel !== 'notifications') {
            b.innerText = count;
            b.classList.remove('hidden');
        }
    });
    
    if (state.activePanel === 'notifications') {
        renderNotificationsPanel();
    }
}

// Tab 5: Profile Data updates
function loadProfileData() {
    const nameInp = document.getElementById('profile-name-input');
    const idInp = document.getElementById('profile-id-input');
    const deptInp = document.getElementById('profile-dept-input');
    const phoneInp = document.getElementById('profile-phone-input');
    
    if (nameInp) nameInp.value = state.profile.name;
    if (idInp) idInp.value = state.profile.id;
    if (deptInp) deptInp.value = state.profile.department;
    if (phoneInp) phoneInp.value = state.profile.phone;
}

window.saveProfileUpdates = function(e) {
    e.preventDefault();
    const nameVal = document.getElementById('profile-name-input').value.trim();
    const deptVal = document.getElementById('profile-dept-input').value.trim();
    const phoneVal = document.getElementById('profile-phone-input').value.trim();
    
    if (!nameVal || !deptVal || !phoneVal) {
        showToast("Please fill all profile inputs.", "warning");
        return;
    }
    
    state.profile.name = nameVal;
    state.profile.department = deptVal;
    state.profile.phone = phoneVal;
    localStorage.setItem('campuspay-profile', JSON.stringify(state.profile));
    
    // Refresh greet greeting
    renderDashboardGreeting();
    showToast("Profile data updated successfully! 👤", "success");
    pushNotification("Profile Updated", "You successfully changed your profile info settings.");
}

window.changeProfilePassword = function(e) {
    e.preventDefault();
    const curpass = document.getElementById('profile-curpass-input');
    const newpass = document.getElementById('profile-newpass-input');
    
    if (!curpass.value || !newpass.value) {
        showToast("Please fill both password inputs.", "warning");
        return;
    }
    
    state.profile.password = newpass.value;
    localStorage.setItem('campuspay-profile', JSON.stringify(state.profile));
    
    curpass.value = "";
    newpass.value = "";
    showToast("Password updated successfully! 🔑", "success");
    pushNotification("Security Alert", "Your account security password was updated successfully.");
}

// Tab 6: Feedback star interactions
window.setFeedbackStars = function(stars) {
    state.feedbackStars = stars;
    const row = document.getElementById('feedback-star-rating-row');
    if (!row) return;
    const starButtons = row.querySelectorAll('button');
    starButtons.forEach((btn, idx) => {
        if (idx < stars) {
            btn.className = "material-symbols-outlined text-amber-400 text-3xl font-black transition-colors focus:outline-none select-none";
            btn.innerText = "star";
        } else {
            btn.className = "material-symbols-outlined text-outline text-3xl font-black transition-colors focus:outline-none select-none";
            btn.innerText = "star";
        }
    });
}

window.submitFeedbackRating = function(e) {
    e.preventDefault();
    const commentInp = document.getElementById('feedback-comment-input');
    if (!commentInp || !commentInp.value.trim()) return;
    
    showToast("Thank you for rating! Suggestion submitted. ⭐", "success");
    commentInp.value = "";
    window.setFeedbackStars(5);
    pushNotification("Feedback Submitted", "Your review rating has been logged by counter staff.");
}

// Tab 7: Wallet Panel & Recharges
function renderWalletPanel() {
    const rechargeList = document.getElementById('wallet-recharges-list');
    const summarySpent = document.getElementById('wallet-summary-spent');
    const summaryRecharge = document.getElementById('wallet-summary-recharge');
    
    const rechargesOnly = state.transactions.filter(t => t.type === 'Recharge');
    if (rechargeList) {
        if (rechargesOnly.length === 0) {
            rechargeList.innerHTML = `<p class="text-xs text-on-surface-variant py-8 text-center select-none">No recharge history logged yet.</p>`;
        } else {
            rechargeList.innerHTML = rechargesOnly.map(tx => {
                return `
                    <div class="flex items-center justify-between py-2.5 text-xs select-none">
                        <div>
                            <span class="font-bold text-on-surface">${tx.desc}</span>
                            <span class="text-[9px] text-on-surface-variant block mt-0.5">${tx.date}</span>
                        </div>
                        <span class="font-bold text-[#059669]">+${tx.amount.toFixed(2)} ৳</span>
                    </div>
                `;
            }).reverse().join('');
        }
    }
    
    // Update visual spent summary numbers
    if (summarySpent) {
        const todayTotal = state.orderHistory.reduce((sum, order) => sum + order.amount, 0);
        summarySpent.innerText = `${todayTotal.toFixed(2)} ৳`;
    }
    
    if (summaryRecharge) {
        const totalRechargeSum = rechargesOnly.reduce((sum, rx) => sum + rx.amount, 0);
        summaryRecharge.innerText = `${totalRechargeSum.toFixed(2)} ৳`;
    }
}

window.quickWalletTopup = function(amount) {
    state.balance += amount;
    localStorage.setItem('campuspay-balance', state.balance.toFixed(2));
    updateBalanceDOM();
    
    // Record transaction
    const newTx = {
        date: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
        type: "Recharge",
        desc: "Quick Wallet Recharge",
        amount: amount,
        postBalance: state.balance
    };
    state.transactions.push(newTx);
    localStorage.setItem('campuspay-transactions', JSON.stringify(state.transactions));
    
    pushNotification("Wallet Recharged", `Successfully credited +${amount.toFixed(2)} ৳ into wallet.`);
    showToast(`Credited +${amount.toFixed(2)} ৳ to Wallet!`, "success");
    
    if (state.activePanel === 'wallet') renderWalletPanel();
    if (state.activePanel === 'transactions') renderTransactionsPanel();
}

// Dialog recharge desk modal handlers
window.openRechargeModal = function() {
    const modal = document.getElementById('recharge-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.pointerEvents = 'auto';
        void modal.offsetWidth;
        modal.classList.add('modal-open');
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.style.transform = 'translateY(0)';
            content.style.opacity = '1';
        }
        const overlay = modal.querySelector('.drawer-overlay');
        if (overlay) {
            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';
        }
    }
}

window.closeRechargeModal = function() {
    const modal = document.getElementById('recharge-modal');
    if (!modal) return;
    modal.classList.remove('modal-open');
    const content = modal.querySelector('.modal-content');
    if (content) {
        content.style.transform = 'translateY(12px)';
        content.style.opacity = '0';
    }
    const overlay = modal.querySelector('.drawer-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
    }
    setTimeout(() => {
        if (!modal.classList.contains('modal-open')) {
            modal.classList.add('hidden');
        }
    }, 300);
}

window.processRechargeTopup = function(e) {
    e.preventDefault();
    const amountInp = document.getElementById('recharge-amount');
    if (!amountInp) return;
    const amount = parseFloat(amountInp.value);
    if (isNaN(amount) || amount < 50 || amount > 5000) {
        showToast("Please enter a valid amount between 50 and 5000 ৳", "warning");
        return;
    }
    
    const method = document.querySelector('input[name="payment_method"]:checked')?.value || "bkash";
    const methodLabel = method === 'bkash' ? 'bKash' : (method === 'nagad' ? 'Nagad' : 'Counter');
    const txidInp = document.getElementById('recharge-txid');
    const txid = txidInp ? txidInp.value.trim().toUpperCase() : `TX-${Date.now().toString().slice(-6)}`;

    // Create a new request object in campuspay-recharge-requests
    const rawStudentReqs = localStorage.getItem('campuspay-recharge-requests');
    let studentReqs = [];
    if (rawStudentReqs) {
        try {
            studentReqs = JSON.parse(rawStudentReqs);
        } catch (e) {
            console.error(e);
        }
    }

    const newReq = {
        id: Date.now().toString(),
        method: methodLabel,
        amount: amount,
        txid: txid,
        date: new Date().toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }),
        status: "Pending"
    };

    studentReqs.unshift(newReq);
    localStorage.setItem('campuspay-recharge-requests', JSON.stringify(studentReqs));

    pushNotification("Recharge Verification Filed", `Verification filed for +${amount.toFixed(2)} ৳ via ${methodLabel}`);
    showToast(`Recharge request of ৳ ${amount.toFixed(2)} submitted for verification!`, "success");
    
    amountInp.value = "";
    if (txidInp) txidInp.value = "";
    window.closeRechargeModal();
    
    if (state.activePanel === 'wallet') renderWalletPanel();
    if (state.activePanel === 'transactions') renderTransactionsPanel();
}

// Tab 8: Transactions Audit Ledger renderer
function renderTransactionsPanel() {
    const tableBody = document.getElementById('transactions-table-body');
    if (!tableBody) return;
    
    // Filter
    let filtered = state.transactions;
    if (state.txFilter === 'Checkout') {
        filtered = filtered.filter(t => t.type === 'Checkout');
    } else if (state.txFilter === 'Recharge') {
        filtered = filtered.filter(t => t.type === 'Recharge');
    }
    
    // Active class toggling on filter headers
    const btnAll = document.getElementById('btn-tx-all');
    const btnCheckout = document.getElementById('btn-tx-checkout');
    const btnRecharge = document.getElementById('btn-tx-recharge');
    
    if (btnAll) btnAll.className = state.txFilter === 'All' ? "px-3 py-1 bg-primary text-on-primary text-[10px] font-black rounded-lg transition-colors cursor-pointer" : "px-3 py-1 text-on-surface-variant text-[10px] font-black rounded-lg transition-colors cursor-pointer";
    if (btnCheckout) btnCheckout.className = state.txFilter === 'Checkout' ? "px-3 py-1 bg-primary text-on-primary text-[10px] font-black rounded-lg transition-colors cursor-pointer" : "px-3 py-1 text-on-surface-variant text-[10px] font-black rounded-lg transition-colors cursor-pointer";
    if (btnRecharge) btnRecharge.className = state.txFilter === 'Recharge' ? "px-3 py-1 bg-primary text-on-primary text-[10px] font-black rounded-lg transition-colors cursor-pointer" : "px-3 py-1 text-on-surface-variant text-[10px] font-black rounded-lg transition-colors cursor-pointer";
    
    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-12 text-center text-on-surface-variant font-medium select-none">No transactions recorded under this category.</td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = filtered.map(tx => {
        const sign = tx.type === 'Recharge' ? '+' : '-';
        const amountColor = tx.type === 'Recharge' ? 'text-green-600 font-bold' : 'text-primary font-bold';
        const badgeColor = tx.type === 'Recharge' ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400';
        
        return `
            <tr class="border-b border-outline-variant/30 hover:bg-surface-container-low transition-colors">
                <td class="px-6 py-4 whitespace-nowrap font-mono select-none">${tx.date}</td>
                <td class="px-6 py-4 whitespace-nowrap select-none">
                    <span class="px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase ${badgeColor}">${tx.type}</span>
                </td>
                <td class="px-6 py-4 font-medium">${tx.desc}</td>
                <td class="px-6 py-4 whitespace-nowrap ${amountColor}">${sign}${Math.abs(tx.amount).toFixed(2)} ৳</td>
                <td class="px-6 py-4 whitespace-nowrap font-mono font-medium select-none">${tx.postBalance.toFixed(2)} ৳</td>
            </tr>
        `;
    }).reverse().join('');
}

window.setTransactionFilter = function(filter) {
    state.txFilter = filter;
    renderTransactionsPanel();
}

// Tab 9: Help & Support Support Ticketing Form handler
window.submitSupportTicket = function(e) {
    e.preventDefault();
    const category = document.getElementById('support-category').value;
    const subject = document.getElementById('support-subject');
    const desc = document.getElementById('support-description');
    
    if (!subject.value.trim() || !desc.value.trim()) return;
    
    const ticketNum = Math.floor(1000 + Math.random() * 9000);
    showToast(`Ticket #SUP-${ticketNum} filed. Canteen admin will review. ❓`, "success");
    
    subject.value = "";
    desc.value = "";
    pushNotification("Support Ticket Lodged", `Loded SUP-${ticketNum} regarding "${category}".`);
}

// Tab 10: Settings languages mock translator
window.setSettingsLanguage = function(lang) {
    showToast(lang === 'en' ? "Language changed to English (US) 🇺🇸" : "ভাষা পরিবর্তন করা হয়েছে (বাংলা) 🇧🇩", "info");
}

// Header Dropdown Toggles & Dynamic Greeting Handlers
window.toggleNotificationDropdown = function() {
    const notifDropdown = document.getElementById("notification-dropdown");
    const profileDropdown = document.getElementById("profile-dropdown-menu");
    if (profileDropdown) profileDropdown.classList.add("hidden");
    if (notifDropdown) notifDropdown.classList.toggle("hidden");
};

window.toggleProfileDropdown = function() {
    const notifDropdown = document.getElementById("notification-dropdown");
    const profileDropdown = document.getElementById("profile-dropdown-menu");
    if (notifDropdown) notifDropdown.classList.add("hidden");
    if (profileDropdown) profileDropdown.classList.toggle("hidden");
};

// Close header dropdowns when clicking outside
document.addEventListener("click", function(e) {
    const notifBtn = document.getElementById("notification-bell-btn");
    const notifDropdown = document.getElementById("notification-dropdown");
    const profileBtn = e.target.closest("[onclick*='toggleProfileDropdown']");
    const profileDropdown = document.getElementById("profile-dropdown-menu");

    if (notifDropdown && !notifDropdown.contains(e.target) && notifBtn && !notifBtn.contains(e.target)) {
        notifDropdown.classList.add("hidden");
    }
    if (profileDropdown && !profileDropdown.contains(e.target) && !profileBtn) {
        profileDropdown.classList.add("hidden");
    }
});

// Dynamic Header Clock & Time-of-Day Greeting update
function initHeaderClock() {
    const timeDisplay = document.getElementById("canteen-time-display");
    const dateDisplay = document.getElementById("canteen-date-display");
    const greetingText = document.getElementById("header-greeting-text");
    const bannerGreetingText = document.getElementById("welcome-greeting");

    function updateTime() {
        const now = new Date();
        if (timeDisplay) {
            timeDisplay.innerText = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
        if (dateDisplay) {
            dateDisplay.innerText = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        }

        // Wallet Low Balance Indicator
        const lowBadge = document.getElementById("wallet-low-warning-badge");
        if (lowBadge) {
            if (state.walletBalance < 100) {
                lowBadge.classList.remove("hidden");
            } else {
                lowBadge.classList.add("hidden");
            }
        }
    }

    updateTime();
    setInterval(updateTime, 1000);
}
