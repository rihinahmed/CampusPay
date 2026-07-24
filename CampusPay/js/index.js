// CampusPay Interactive Logic & State Management

// Core State
const state = {
    balance: parseFloat(localStorage.getItem('campuspay-balance')) || 500.00,
    cart: [],
    meals: [
        {
            id: 1,
            name: "Beef Biryani",
            tagline: "Classic MIST special recipe",
            category: "Lunch",
            price: 120.00,
            rating: 4.8,
            stock: 12,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC46DMEC27bruw947J2slMu-46kPQATfSB9rDZ1q2SAszbvllcUEcerUXYqr5n6ytDVA5n14ER8Sa46GXWylW8eUPbdgM4yc2e3bsSzkjeI6F1Sh4AAKsmZpaNZnbwRHT0QtDTn1cIKZYuBdHkpt0LsYI_sgzduX_9u-S9SSfsIBg_QP5VpAY7m9FUeOIerKjhabv39X851Rt8ufm7VRXCKWcQ164w6ecIZ7HIepxCKtwjbxYqNa8noERxBC4zfm9ATwROnDn1dqkcU",
            stockText: "12 left in stock"
        },
        {
            id: 2,
            name: "Crispy Chicken",
            tagline: "2 pieces with wedges",
            category: "Snacks",
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
            category: "Lunch",
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
            category: "Breakfast",
            price: 35.00,
            rating: 4.3,
            stock: 0,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoM9q0ytEusBF3cjxmPl0xKxF_H-B7gXj1oO3aM79ixmWU1qj26lUtwcIXHcW9abF2-Y0FsmBMh9K7mK52Q7WDsinwTLcx1U4zADA0H-ohK34S0ul0muqpHHKHLhnRsVSLJ0W60r6747ICiRoz4WGpv2t3UoTtNP-in0bJUmtKp3wwdFnYVciTY2Eii3NOL_9C5VyqKEaQjfv-Qht7W2gQBqD7druurgCZ9VQTUqZxuLk5LpbkNFkO5kKdEZGjhb77Wn9mBUarepKr",
            stockText: "Restocking at 8:00 AM"
        }
    ],
    selectedCategory: "All Items",
    searchQuery: "",
    isDarkMode: localStorage.getItem('campuspay-theme') === 'dark',
    orderHistory: []
};

// DOM Content Loaded Initializer
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initEventListeners();
    renderFoodGrid();
    updateBalanceDOM();
    updateCartDOM();
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

        return `
            <div class="group bg-white rounded-2xl border border-outline-variant overflow-hidden hover:shadow-lg hover-glow transition-all duration-300 ${cardOpacityClass}" data-meal-id="${meal.id}">
                <div class="h-48 relative overflow-hidden">
                    <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${meal.image}" alt="${meal.name}"/>
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
                    <div class="flex items-center justify-between mt-2">
                        <span class="font-headline-md text-headline-md text-primary font-bold">${meal.price.toFixed(2)} ৳</span>
                        ${isOutOfStock ? `
                            <button class="bg-outline text-on-surface px-4 py-2 rounded-xl font-label-md text-label-md cursor-not-allowed opacity-50 flex items-center gap-2" disabled>
                                <span class="material-symbols-outlined text-[18px]">block</span>
                                Unavailable
                            </button>
                        ` : `
                            <button class="add-to-cart-btn bg-primary text-on-primary px-4 py-2 rounded-xl font-label-md text-label-md hover:bg-primary-container transition-colors flex items-center gap-2">
                                <span class="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                                Order Now
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }).join("");

    // Bind Add to Cart listeners to new buttons
    gridContainer.querySelectorAll(".add-to-cart-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const card = e.target.closest("[data-meal-id]");
            const mealId = parseInt(card.dataset.mealId);
            addToCart(mealId);
        });
    });
}

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
    openCartDrawer();
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

function updateCartDOM() {
    const drawerList = document.getElementById("cart-drawer-list");
    const drawerEmptyBadge = document.getElementById("cart-drawer-empty");
    const drawerSummaryPanel = document.getElementById("cart-drawer-summary");
    const cartCountBadges = document.querySelectorAll(".cart-count-badge");
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
                    <div class="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant hover:border-primary/20 transition-all">
                        <img src="${meal.image}" alt="${meal.name}" class="w-14 h-14 rounded-lg object-cover" />
                        <div class="flex-1">
                            <h4 class="font-title-md text-body-lg text-on-surface font-bold leading-tight">${meal.name}</h4>
                            <p class="text-primary font-bold text-label-md mt-0.5">${meal.price.toFixed(2)} ৳</p>
                        </div>
                        <div class="flex flex-col items-end gap-1.5">
                            <div class="flex items-center gap-1 bg-surface-container-high px-2 py-0.5 rounded-lg border border-outline-variant">
                                <button onclick="window.updateCartQuantity(${meal.id}, -1)" class="w-5 h-5 flex items-center justify-center text-on-surface-variant hover:text-error transition-colors">
                                    <span class="material-symbols-outlined text-[14px]">remove</span>
                                </button>
                                <span class="font-label-md text-label-md px-1 text-on-surface min-w-[14px] text-center">${item.quantity}</span>
                                <button onclick="window.updateCartQuantity(${meal.id}, 1)" class="w-5 h-5 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
                                    <span class="material-symbols-outlined text-[14px]">add</span>
                                </button>
                            </div>
                            <span class="font-label-md text-label-md text-on-surface font-bold">${aggregate.toFixed(2)} ৳</span>
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

// Modals Trigger Handlers
function openRechargeModal() {
    window.location.href = "./recharge.html";
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
            openRechargeModal();
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

            // Store order copy
            state.orderHistory.push({
                timestamp: new Date().toLocaleTimeString(),
                items: [...state.cart],
                amount: totalPrice
            });

            state.cart = []; // Reset Cart

            updateBalanceDOM();
            localStorage.setItem('campuspay-balance', state.balance.toFixed(2));
            updateCartDOM();
            renderFoodGrid();
            closeCartDrawer();

            showSuccessModal(totalPrice);
        }

        // Restore Checkout Button states
        if (checkoutBtn && checkoutSpinner && checkoutBtnText) {
            checkoutBtn.disabled = false;
            checkoutSpinner.classList.add("hidden");
            checkoutBtnText.innerText = "Confirm Tray Order";
        }
    }, 1500);
}

// Show Checkout Success visual Modal overlay
function showSuccessModal(amount) {
    const successOverlay = document.getElementById("success-overlay");
    const successDetails = document.getElementById("success-details");

    if (successDetails) {
        successDetails.innerText = `Successfully placed order for ${amount.toFixed(2)} ৳. Collect it from MIST Canteen counters.`;
    }

    if (successOverlay) {
        successOverlay.classList.remove("hidden");
        successOverlay.classList.add("flex");
    }
}

function closeSuccessModal() {
    const successOverlay = document.getElementById("success-overlay");
    if (successOverlay) {
        successOverlay.classList.add("hidden");
        successOverlay.classList.remove("flex");
    }
    showToast("Enjoy your hot meal! Bon Appétit! 🍽️", "success");
}

// Perform balance recharges
function submitRecharge(amount) {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
        showToast("Invalid recharge amount entered.", "warning");
        return;
    }

    const rechargeBtn = document.getElementById("recharge-submit-btn");
    const rechargeSpinner = document.getElementById("recharge-spinner");
    const rechargeBtnText = document.getElementById("recharge-btn-text");

    if (rechargeBtn && rechargeSpinner && rechargeBtnText) {
        rechargeBtn.disabled = true;
        rechargeSpinner.classList.remove("hidden");
        rechargeBtnText.innerText = "Contacting Bank...";
    }

    setTimeout(() => {
        state.balance += parsed;
        updateBalanceDOM();
        closeRechargeModal();
        showToast(`Recharged ${parsed.toFixed(2)} ৳ successfully!`, "success");

        if (rechargeBtn && rechargeSpinner && rechargeBtnText) {
            rechargeBtn.disabled = false;
            rechargeSpinner.classList.add("hidden");
            rechargeBtnText.innerText = "Secure Recharge Now";
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
    const container = document.getElementById("toast-container");
    if (!container) return;

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

    // Orders Panel Toggles
    const ordersOpenBtn = document.getElementById("orders-sidebar-btn");
    console.log("orders-sidebar-btn element bound:", ordersOpenBtn);
    ordersOpenBtn?.addEventListener("click", () => {
        console.log("orders-sidebar-btn click triggered!");
        try {
            updateOrdersDOM();
            openOrdersDrawer();
        } catch (e) {
            console.error("Error opening orders drawer:", e);
        }
    });

    const mobileOrdersOpenBtn = document.getElementById("mobile-orders-sidebar-btn");
    mobileOrdersOpenBtn?.addEventListener("click", () => {
        console.log("mobile-orders-sidebar-btn click triggered!");
        closeMobileNav();
        try {
            updateOrdersDOM();
            openOrdersDrawer();
        } catch (e) {
            console.error("Error opening mobile orders drawer:", e);
        }
    });

    const ordersCloseBtn = document.getElementById("orders-close-btn");
    ordersCloseBtn?.addEventListener("click", () => {
        console.log("ordersCloseBtn clicked");
        closeOrdersDrawer();
    });

    const ordersOverlay = document.getElementById("orders-overlay");
    ordersOverlay?.addEventListener("click", () => {
        console.log("ordersOverlay clicked");
        closeOrdersDrawer();
    });

    // Mobile Navigation burger triggers
    const menuOpenBtn = document.getElementById("mobile-menu-btn");
    menuOpenBtn?.addEventListener("click", openMobileNav);

    const menuCloseBtn = document.getElementById("mobile-menu-close-btn");
    menuCloseBtn?.addEventListener("click", closeMobileNav);

    const mobileNavOverlay = document.getElementById("mobile-nav-overlay");
    mobileNavOverlay?.addEventListener("click", closeMobileNav);

    // Recharge dialog toggle
    // Recharge click triggers routing
    const rechargeOpenBadges = document.querySelectorAll(".recharge-open-trigger");
    rechargeOpenBadges.forEach(badge => {
        badge.addEventListener("click", openRechargeModal);
    });

    // Checkout Confirmation
    const checkoutConfirmBtn = document.getElementById("checkout-btn");
    checkoutConfirmBtn?.addEventListener("click", processCheckout);

    // Close success overlay helper
    const successCloseBtn = document.getElementById("success-close-btn");
    successCloseBtn?.addEventListener("click", closeSuccessModal);

    // Quick Reorder buttons
    const reorderBtns = document.querySelectorAll(".quick-reorder-btn");
    reorderBtns.forEach(btn => {
        btn.addEventListener("click", triggerQuickReorder);
    });

    // Auto open orders if parameter is set
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openOrders') === 'true') {
        setTimeout(() => {
            updateOrdersDOM();
            openOrdersDrawer();
        }, 300);
    }
}

// Orders UI Mechanics
function openOrdersDrawer() {
    const drawer = document.getElementById("orders-drawer");
    if (!drawer) return;

    // Inline overrides to bypass CSS cache/specificity issues
    drawer.classList.remove("hidden");
    drawer.style.visibility = "visible";
    drawer.style.pointerEvents = "auto";

    const content = drawer.querySelector(".drawer-content");
    if (content) {
        content.style.transform = "translateX(0)";
    }
    const overlay = drawer.querySelector(".drawer-overlay");
    if (overlay) {
        overlay.style.opacity = "1";
        overlay.style.visibility = "visible";
    }

    void drawer.offsetWidth;
    drawer.classList.add("drawer-open");
}

function closeOrdersDrawer() {
    const drawer = document.getElementById("orders-drawer");
    if (!drawer) return;

    drawer.classList.remove("drawer-open");
    drawer.style.visibility = "hidden";
    drawer.style.pointerEvents = "none";

    const content = drawer.querySelector(".drawer-content");
    if (content) {
        content.style.transform = "translateX(100%)";
    }
    const overlay = drawer.querySelector(".drawer-overlay");
    if (overlay) {
        overlay.style.opacity = "0";
        overlay.style.visibility = "hidden";
    }

    setTimeout(() => {
        if (!drawer.classList.contains("drawer-open")) {
            drawer.classList.add("hidden");
        }
    }, 300);
}

function updateOrdersDOM() {
    const list = document.getElementById("orders-drawer-list");
    const emptyState = document.getElementById("orders-drawer-empty");
    if (!list || !emptyState) return;

    if (state.orderHistory.length === 0) {
        list.innerHTML = "";
        emptyState.classList.remove("hidden");
    } else {
        emptyState.classList.add("hidden");
        list.innerHTML = state.orderHistory.map((order, idx) => {
            const itemsHtml = order.items.map(item => {
                const meal = state.meals.find(m => m.id === item.mealId);
                return `<div class="text-xs text-on-surface-variant font-medium">${meal ? meal.name : 'Unknown food'} x ${item.quantity}</div>`;
            }).join('');

            return `
                <div class="p-4 bg-surface-container-low rounded-2xl border border-outline-variant hover:border-[#047857]/20 transition-all flex flex-col gap-2">
                    <div class="flex items-center justify-between border-b border-outline-variant pb-2">
                        <span class="text-[10px] font-bold text-slate-500 uppercase">Order #${1000 + idx}</span>
                        <span class="text-[10px] font-sans font-bold bg-[#d1fae5] text-[#047857] px-2 py-0.5 rounded-full">Collected</span>
                    </div>
                    <div class="space-y-1">
                        ${itemsHtml}
                    </div>
                    <div class="flex justify-between items-center pt-1 mt-1 border-t border-outline-variant/50">
                        <span class="text-[10px] font-semibold text-on-surface-variant">${order.timestamp}</span>
                        <span class="text-sm font-bold text-primary">${order.amount.toFixed(2)} ৳</span>
                    </div>
                </div>
            `;
        }).reverse().join('');
    }
}

// Bind key updater functions to window context for inline event handlers
window.updateCartQuantity = updateCartQuantity;
window.addToCart = addToCart;
window.updateOrdersDOM = updateOrdersDOM;
window.openOrdersDrawer = openOrdersDrawer;
window.closeOrdersDrawer = closeOrdersDrawer;
