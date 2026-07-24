// CampusPay Recharge Page Controller & State Management

const state = {
    balance: parseFloat(localStorage.getItem('campuspay-balance')) || 500.00,
    isDarkMode: localStorage.getItem('campuspay-theme') === 'dark',
    requests: JSON.parse(localStorage.getItem('campuspay-recharge-requests')) || [
        { id: "1", method: "bKash", amount: 500, txid: "AH87B9JK2", date: "Oct 12, 2026", status: "Pending" },
        { id: "2", method: "Nagad", amount: 1000, txid: "99M8N2XQ1", date: "Oct 10, 2026", status: "Approved" },
        { id: "3", method: "bKash", amount: 200, txid: "76ZZ2LP45", date: "Oct 05, 2026", status: "Declined" },
        { id: "4", method: "bKash", amount: 1500, txid: "AX22RTY99", date: "Sep 28, 2026", status: "Approved" }
    ]
};

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initEventListeners();
    updateBalanceDOM();
    renderHistory();
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

    // Sync mobile toggle switch visual state if mobile nav is open
    const toggleBall = document.querySelector("#theme-toggle-mobile span span");
    const toggleContainer = document.querySelector("#theme-toggle-mobile span");
    if (toggleBall && toggleContainer) {
        if (state.isDarkMode) {
            toggleBall.className = "inline-block w-4 h-4 transform rounded-full bg-white transition-transform translate-x-6";
            toggleContainer.className = "relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-[#096969] cursor-pointer";
        } else {
            toggleBall.className = "inline-block w-4 h-4 transform rounded-full bg-white transition-transform translate-x-1";
            toggleContainer.className = "relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-outline cursor-pointer";
        }
    }
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

// Balance Refresh
function updateBalanceDOM() {
    const balanceText = `${state.balance.toFixed(2)} ৳`;
    const balanceBadges = document.querySelectorAll(".balance-badge");
    balanceBadges.forEach(badge => {
        badge.innerText = balanceText;
    });
    localStorage.setItem('campuspay-balance', state.balance.toFixed(2));
}

// Render Request History
function renderHistory() {
    const container = document.getElementById("requests-history-list");
    if (!container) return;

    if (state.requests.length === 0) {
        container.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center p-6 text-center select-none py-16">
                <span class="material-symbols-outlined text-outline text-5xl mb-4">history_toggle_off</span>
                <p class="text-on-surface-variant font-body-md">No transaction history requests found.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = state.requests.map(req => {
        let icon = "history";
        let iconBg = "bg-tertiary-fixed dark:bg-[#795400]/20";
        let iconColor = "text-tertiary dark:text-[#ffdeab]";
        let statusClass = "bg-[#fff9c4] text-[#827717] dark:bg-[#827717]/30 dark:text-[#ffff8d]";

        if (req.status === "Approved") {
            icon = "check_circle";
            iconBg = "bg-[#E8F5E9] dark:bg-[#2E7D32]/25";
            iconColor = "text-[#2E7D32] dark:text-[#81C784]";
            statusClass = "bg-[#C8E6C9] text-[#1B5E20] dark:bg-[#1B5E20]/30 dark:text-[#a5d6a7]";
        } else if (req.status === "Declined") {
            icon = "cancel";
            iconBg = "bg-error-container dark:bg-[#93000a]/20";
            iconColor = "text-error dark:text-[#ffb4ab]";
            statusClass = "bg-[#FFCDD2] text-[#B71C1C] dark:bg-[#B71C1C]/30 dark:text-[#ef9a9a]";
        }

        return `
            <div class="flex items-center gap-4 p-4 rounded-xl border border-outline-variant dark:border-[#2d3135] bg-surface-container-low/50 dark:bg-[#202225]/40 hover:bg-surface-container-low dark:hover:bg-[#202225]/80 transition-colors duration-200">
                <div class="w-12 h-12 rounded-full ${iconBg} flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined ${iconColor}" style="font-variation-settings: 'FILL' 1;">${icon}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start mb-1 gap-2">
                        <h4 class="font-title-lg text-body-lg text-on-surface dark:text-gray-200 truncate font-semibold">${req.method} Recharge</h4>
                        <span class="shrink-0 ${statusClass} text-[10px] uppercase font-black px-2 py-0.5 rounded-full select-none">${req.status}</span>
                    </div>
                    <div class="flex justify-between items-end">
                        <div class="text-on-surface-variant dark:text-[#bec8c8]">
                            <p class="text-label-md font-label-md opacity-70">TxID: ${req.txid}</p>
                            <p class="text-label-md font-label-md mt-0.5">${req.date}</p>
                        </div>
                        <span class="font-extrabold text-title-lg text-on-surface dark:text-white select-none">৳ ${req.amount}</span>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

// Visual toast widget creator
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
    } else if (type === "warning") {
        bgClass = "bg-[#fef3c7] dark:bg-[#78350f] text-[#92400e] dark:text-[#fde68a] border-[#fde68a]/30";
        icon = "warning";
        iconColor = "text-[#d97706] dark:text-[#fbbf24]";
    }

    toast.className = `toast-item border flex items-center gap-3 p-4 rounded-xl shadow-lg pointer-events-auto max-w-sm ${bgClass}`;
    toast.innerHTML = `
        <span class="material-symbols-outlined ${iconColor}">${icon}</span>
        <p class="font-body-md text-body-md font-medium flex-1">${message}</p>
        <button class="toast-close-btn text-on-surface-variant dark:text-secondary-fixed-dim hover:text-on-surface dark:hover:text-white transition-colors">
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

function processRechargeRequest(method, amount, txid) {
    const val = parseFloat(amount);
    const newReq = {
        id: Date.now().toString(),
        method: method,
        amount: val,
        txid: txid,
        date: new Date().toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }),
        status: "Approved"
    };

    // Prepend to requests list
    state.requests.unshift(newReq);
    localStorage.setItem('campuspay-recharge-requests', JSON.stringify(state.requests));

    // Add to balance immediately!
    state.balance += val;
    updateBalanceDOM();
    renderHistory();
    showToast(`Top-up of ৳ ${val.toFixed(2)} successfully credited to wallet!`, "success");
}

function initEventListeners() {
    // Theme triggers
    const themeBtn = document.getElementById("theme-toggle");
    themeBtn?.addEventListener("click", toggleTheme);

    const themeBtnMobile = document.getElementById("theme-toggle-mobile");
    themeBtnMobile?.addEventListener("click", toggleTheme);

    // Mobile nav drawers
    const menuOpenBtn = document.getElementById("mobile-menu-btn");
    menuOpenBtn?.addEventListener("click", openMobileNav);

    const menuCloseBtn = document.getElementById("mobile-menu-close-btn");
    menuCloseBtn?.addEventListener("click", closeMobileNav);

    const mobileNavOverlay = document.getElementById("mobile-nav-overlay");
    mobileNavOverlay?.addEventListener("click", closeMobileNav);

    // Form submission simulation
    const form = document.getElementById("recharge-request-form");
    form?.addEventListener("submit", (e) => {
        e.preventDefault();

        const methodEl = document.getElementById("recharge-method");
        const amountEl = document.getElementById("recharge-amount");
        const txidEl = document.getElementById("recharge-txid");
        const btn = document.getElementById("recharge-submit-btn");

        if (!methodEl || !amountEl || !txidEl || !btn) return;

        const method = methodEl.value;
        const amount = amountEl.value;
        const txid = txidEl.value.trim().toUpperCase();

        const btnSpanText = btn.querySelector("span:not(.material-symbols-outlined)");
        const btnIcon = document.getElementById("recharge-submit-icon");
        const originalText = btnSpanText ? btnSpanText.innerText : "Submit Request";
        const originalIcon = btnIcon ? btnIcon.innerText : "send";

        btn.disabled = true;
        btn.classList.add("opacity-70");
        if (btnSpanText) btnSpanText.innerText = "Processing...";
        if (btnIcon) {
            btnIcon.innerText = "progress_activity";
            btnIcon.classList.add("animate-spin");
        }

        setTimeout(() => {
            // Process and append recharge request
            processRechargeRequest(method, amount, txid);

            // Transition to submitted state
            if (btnSpanText) btnSpanText.innerText = "Request Submitted";
            if (btnIcon) {
                btnIcon.classList.remove("animate-spin");
                btnIcon.innerText = "check_circle";
            }
            btn.classList.replace("bg-primary", "bg-[#2E7D32]");
            showToast("Recharge request filed! Reviewing transaction ID...", "success");

            setTimeout(() => {
                // Restore button states
                btn.disabled = false;
                btn.classList.remove("opacity-70");
                btn.classList.replace("bg-[#2E7D32]", "bg-primary");
                if (btnSpanText) btnSpanText.innerText = originalText;
                if (btnIcon) btnIcon.innerText = originalIcon;
                form.reset();
            }, 2000);
        }, 1500);
    });
}
