// CampusPay Admin Panel Controller & State Management

// Seed state records (or load from localStorage if already customized)
const state = {
    isDarkMode: localStorage.getItem('campuspay-theme') === 'dark',
    currentTab: 'dashboard',
    searchQuery: '',
    verifFilter: 'all',
    rechargeFilter: 'all',

    // Verifications Queue local storage state
    verifications: JSON.parse(localStorage.getItem('campuspay-admin-verifications')) || [
        { id: "v1", name: "Abdullah Safwan", roll: "202114042", role: "Student", submitted: "2h ago", status: "Pending" },
        { id: "v2", name: "Dr. Khulna Habib", roll: "T-77291", role: "Teacher", submitted: "4h ago", status: "Pending" },
        { id: "v3", name: "Raisa Mahfuz", roll: "202214109", role: "Student", submitted: "5h ago", status: "Pending" },
        { id: "v4", name: "Mashiat Rahman", roll: "202314115", role: "Student", submitted: "1d ago", status: "Approved" }
    ],

    // User Base state
    users: JSON.parse(localStorage.getItem('campuspay-admin-users')) || [
        { id: "202114042", name: "Abdullah Safwan", role: "Student", balance: parseFloat(localStorage.getItem('campuspay-balance')) || 500.00, status: "Active", avatar: "AS" },
        { id: "T-77291", name: "Dr. Khulna Habib", role: "Teacher", balance: 2450.00, status: "Active", avatar: "KH" },
        { id: "202214109", name: "Raisa Mahfuz", role: "Student", balance: 350.00, status: "Active", avatar: "RM" },
        { id: "202114001", name: "Tanvir Rahman", role: "Student", balance: 670.00, status: "Active", avatar: "TR" },
        { id: "202314055", name: "Sumaiya Akhter", role: "Student", balance: 140.00, status: "Active", avatar: "SA" },
        { id: "T-99812", name: "Zubair Karim", role: "Teacher", balance: 4120.00, status: "Active", avatar: "ZK" }
    ],

    // Recharges state - check if student requests exist in localStorage, prepend/append them!
    recharges: []
};

// Initialize Recharges list
function initRechargesState() {
    const rawStudentReqs = localStorage.getItem('campuspay-recharge-requests');
    let studentReqs = [];
    if (rawStudentReqs) {
        try {
            studentReqs = JSON.parse(rawStudentReqs).map(req => {
                return {
                    id: req.id || Date.now().toString(),
                    name: "Abdullah Safwan", // Active student user
                    studentId: "202114042",
                    method: req.method,
                    amount: parseFloat(req.amount),
                    txid: req.txid,
                    date: req.date,
                    status: req.status
                };
            });
        } catch (e) {
            console.error("Failed to parse student requests: ", e);
        }
    }

    const defaultRecharges = [
        { id: "rec1", name: "Tanvir Rahman", studentId: "202114001", method: "bKash", amount: 500, txid: "9X3M2K8P9W", date: "Oct 14, 2026", status: "Pending" },
        { id: "rec2", name: "Sumaiya Akhter", studentId: "202314055", method: "Nagad", amount: 1200, txid: "NAGAD8841Z", date: "Oct 14, 2026", status: "Pending" },
        { id: "rec3", name: "Zubair Karim", studentId: "T-99812", method: "bKash", amount: 2500, txid: "BK772L1X0Y", date: "Oct 13, 2026", status: "Pending" },
        { id: "rec4", name: "Abdullah Safwan", studentId: "202114042", method: "bKash", amount: 1000, txid: "99M8N2XQ1", date: "Oct 10, 2026", status: "Approved" },
        { id: "rec5", name: "Rashidul Bari", studentId: "202014022", method: "Nagad", amount: 200, txid: "NG34L9X11", date: "Oct 05, 2026", status: "Declined" }
    ];

    // Filter out studentReqs that have same txid as defaultRecharges to avoid duplicates
    const filteredDefaults = defaultRecharges.filter(def => !studentReqs.some(st => st.txid === def.txid));
    state.recharges = [...studentReqs, ...filteredDefaults];

    // Sync student balance from localstorage into users array entry
    const studentBal = parseFloat(localStorage.getItem('campuspay-balance')) || 500.00;
    const safwan = state.users.find(u => u.id === "202114042");
    if (safwan) {
        safwan.balance = studentBal;
        saveState();
    }
}

// Persist states to storage keys
function saveState() {
    localStorage.setItem('campuspay-admin-verifications', JSON.stringify(state.verifications));
    localStorage.setItem('campuspay-admin-users', JSON.stringify(state.users));

    // Map back student recharges to campuspay-recharge-requests key
    const studentReqs = state.recharges
        .filter(r => r.studentId === "202114042")
        .map(r => ({
            id: r.id,
            method: r.method,
            amount: r.amount,
            txid: r.txid,
            date: r.date,
            status: r.status
        }));
    localStorage.setItem('campuspay-recharge-requests', JSON.stringify(studentReqs));
}

// Write to Admin Log Console
function addSystemLog(level, message) {
    const timestamp = new Date().toLocaleTimeString();
    const consoleLogs = document.getElementById("terminal-console-logs");
    if (!consoleLogs) return;

    let colorClass = "text-[#1cd186]";
    if (level === "WARN") colorClass = "text-[#ffba31]";
    if (level === "ERR") colorClass = "text-[#ff5454]";
    if (level === "INFO") colorClass = "text-[#00b0ff]";

    const logDiv = document.createElement("div");
    logDiv.className = "flex gap-2 py-0.5 hover:bg-white/5 px-2 rounded";
    logDiv.innerHTML = `
        <span class="text-gray-500 shrink-0 select-none">[${timestamp}]</span>
        <span class="${colorClass} shrink-0 select-none">${level}:</span>
        <span class="text-gray-300 select-all">${message}</span>
    `;

    consoleLogs.appendChild(logDiv);
    consoleLogs.scrollTop = consoleLogs.scrollHeight;
}

document.addEventListener("DOMContentLoaded", () => {
    initRechargesState();
    initTheme();
    initEventListeners();
    addSystemLog("INFO", "CampusPay Administration panel environment initialized.");
    addSystemLog("INFO", `Active database synced successfully. Loaded ${state.users.length} active users.`);
    renderActiveTab();
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
    addSystemLog("INFO", `Admin theme settings changed to ${state.isDarkMode ? 'Dark' : 'Light'} Mode.`);
}

// SideNav Controls (Mobile Drawer navigation)
function openMobileNav() {
    const nav = document.getElementById("admin-sidebar");
    const backdrop = document.getElementById("mobile-nav-backdrop");
    if (!nav || !backdrop) return;

    backdrop.classList.remove("hidden");
    void backdrop.offsetWidth;
    backdrop.classList.remove("opacity-0");
    backdrop.classList.add("opacity-100");

    nav.classList.add("drawer-open");
}
function closeMobileNav() {
    const nav = document.getElementById("admin-sidebar");
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

// Tab router handler
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

    addSystemLog("INFO", `Admin navigated to [${tabId.toUpperCase()}] controls.`);
    renderActiveTab();
    closeMobileNav();
}

// Switch render depending on active tab
function renderActiveTab() {
    initRechargesState(); // Refresh localstorage balances before rendering
    if (state.currentTab === "dashboard") {
        renderDashboardTab();
    } else if (state.currentTab === "verifications") {
        renderVerificationsTab();
    } else if (state.currentTab === "recharges") {
        renderRechargesTab();
    } else if (state.currentTab === "users") {
        renderUsersTab();
    }
}

// ----------------------------------------------------
// TAB 1: DASHBOARD
// ----------------------------------------------------
function renderDashboardTab() {
    const listQueue = document.getElementById("table-body-verifications");
    const rechargesContainer = document.getElementById("recharges-queue-container");
    const verifCount = document.getElementById("dashboard-pending-verifications-count");
    const volText = document.getElementById("dashboard-recharge-volume");

    // Set Pending Verifications metric text
    const pendingVerifs = state.verifications.filter(v => v.status === "Pending");
    if (verifCount) verifCount.innerText = pendingVerifs.length;

    // Set Daily Volume statistic dynamically
    const totalApprovedVal = state.recharges
        .filter(r => r.status === "Approved")
        .reduce((sum, r) => sum + r.amount, 452800);
    if (volText) volText.innerText = `৳ ${totalApprovedVal.toLocaleString()}`;

    // Render verification queue limit 3 rows
    if (listQueue) {
        if (pendingVerifs.length === 0) {
            listQueue.innerHTML = `
                <tr>
                    <td colspan="4" class="px-6 py-8 text-center text-on-surface-variant font-medium">
                        Verification queue is empty.
                    </td>
                </tr>
            `;
        } else {
            listQueue.innerHTML = pendingVerifs.slice(0, 3).map(ver => {
                let initial = ver.name.split(" ").map(n => n[0]).join("").slice(0, 2);
                let roleColor = ver.role === "Student" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/35 dark:text-[#a5d6a7]" : "bg-purple-100 text-purple-800 dark:bg-purple-900/35 dark:text-purple-300";
                return `
                    <tr class="hover:bg-surface-container-low dark:hover:bg-[#25272a] transition-all">
                        <td class="px-gutter py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-secondary-container dark:bg-[#2d3135] text-primary dark:text-[#86d4d3] flex items-center justify-center font-bold text-xs">${initial}</div>
                                <div>
                                    <p class="font-body-md text-sm font-semibold text-on-surface dark:text-white">${ver.name}</p>
                                    <p class="text-[10px] text-on-surface-variant dark:text-gray-400">Roll ID: ${ver.roll}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-gutter py-4 select-none">
                            <span class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${roleColor}">${ver.role}</span>
                        </td>
                        <td class="px-gutter py-4 font-body-md text-xs text-on-surface-variant dark:text-[#bec8c8]">${ver.submitted}</td>
                        <td class="px-gutter py-4 text-right">
                            <div class="flex justify-end gap-2">
                                <button onclick="quickApproveVerification('${ver.id}', true)" class="p-1 hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-500/25 dark:hover:text-emerald-400 text-emerald-600 dark:text-emerald-500 rounded-full transition-all material-symbols-outlined text-[18px]">check</button>
                                <button onclick="quickApproveVerification('${ver.id}', false)" class="p-1 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-500/25 dark:hover:text-red-400 text-red-600 dark:text-red-500 rounded-full transition-all material-symbols-outlined text-[18px]">close</button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
        }
    }

    // Render charge requests queue
    if (rechargesContainer) {
        const pendingReloads = state.recharges.filter(r => r.status === "Pending");
        if (pendingReloads.length === 0) {
            rechargesContainer.innerHTML = `
                <div class="col-span-full py-10 flex flex-col items-center justify-center text-center text-on-surface-variant">
                    <span class="material-symbols-outlined text-4xl mb-2 text-gray-400">check_circle</span>
                    <p class="font-medium">No recharge approvals pending review.</p>
                </div>
            `;
        } else {
            rechargesContainer.innerHTML = pendingReloads.slice(0, 3).map(rec => {
                let initial = rec.name.split(" ").map(n => n[0]).join("").slice(0, 2);
                let tagColor = rec.method.toLowerCase() === "bkash" ? "text-pink-600 dark:text-pink-400" : "text-orange-600 dark:text-orange-400";
                return `
                    <div class="p-4 rounded-xl border border-outline-variant dark:border-[#2d3135] bg-surface-bright dark:bg-[#1a1b1d] flex flex-col gap-4 shadow-sm hover:border-[#096969] transition-all duration-200">
                        <div class="flex justify-between items-start">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-secondary-container dark:bg-[#2d3135] text-primary dark:text-[#86d4d3] flex items-center justify-center font-bold text-xs shrink-0">${initial}</div>
                                <div>
                                    <p class="font-body-md font-bold text-on-surface dark:text-white text-sm">${rec.name}</p>
                                    <p class="text-[10px] text-on-surface-variant dark:text-gray-400">ID: ${rec.studentId}</p>
                                </div>
                            </div>
                            <div class="text-right select-none">
                                <p class="text-primary dark:text-[#86d4d3] font-black text-sm">৳ ${rec.amount.toFixed(2)}</p>
                                <p class="text-[9px] font-black uppercase ${tagColor}">${rec.method}</p>
                            </div>
                        </div>
                        <div class="bg-surface-container-low dark:bg-[#242628] p-2 rounded text-[10px] font-mono border border-outline-variant/30 dark:border-[#2d3135]/50 text-on-surface-variant dark:text-[#bec8c8] flex justify-between items-center select-all">
                            <span>TXID: ${rec.txid}</span>
                            <button onclick="navigator.clipboard.writeText('${rec.txid}'); showToast('TxID Copied!', 'info');" class="material-symbols-outlined text-xs hover:text-primary dark:hover:text-[#86d4d3]">content_copy</button>
                        </div>
                        <div class="grid grid-cols-2 gap-2 select-none">
                            <button onclick="processDeposit('${rec.id}', 'Approved')" class="py-2 bg-primary dark:bg-primary-container text-on-primary dark:text-[#86d4d3] rounded-lg font-bold text-[10px] uppercase tracking-wider hover:brightness-105 active:scale-95 transition-all">Approve</button>
                            <button onclick="processDeposit('${rec.id}', 'Declined')" class="py-2 border border-error text-error hover:bg-error/5 dark:hover:bg-error/10 rounded-lg font-bold text-[10px] uppercase tracking-wider active:scale-95 transition-all">Reject</button>
                        </div>
                    </div>
                `;
            }).join("");
        }
    }
}

// ----------------------------------------------------
// TAB 2: VERIFICATIONS
// ----------------------------------------------------
function renderVerificationsTab() {
    const listQueue = document.getElementById("full-table-verifications");
    if (!listQueue) return;

    let filtered = state.verifications;
    if (state.verifFilter === "pending") {
        filtered = state.verifications.filter(v => v.status === "Pending");
    } else if (state.verifFilter === "approved") {
        filtered = state.verifications.filter(v => v.status === "Approved");
    }

    // Filter by global search query
    if (state.searchQuery.trim() !== "") {
        const query = state.searchQuery.trim().toLowerCase();
        filtered = filtered.filter(v => v.name.toLowerCase().includes(query) || v.roll.toLowerCase().includes(query));
    }

    if (filtered.length === 0) {
        listQueue.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-12 text-center text-on-surface-variant font-medium dark:text-gray-400">
                    No matching verification logs found.
                </td>
            </tr>
        `;
        return;
    }

    listQueue.innerHTML = filtered.map(ver => {
        let initial = ver.name.split(" ").map(n => n[0]).join("").slice(0, 2);
        let roleColor = ver.role === "Student" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/35 dark:text-[#a5d6a7]" : "bg-purple-100 text-purple-800 dark:bg-purple-900/35 dark:text-purple-300";

        let statusBadge = "";
        let actionsButtons = "";

        if (ver.status === "Pending") {
            statusBadge = `<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-900/35 dark:text-amber-300">Pending</span>`;
            actionsButtons = `
                <div class="flex justify-end gap-2">
                    <button onclick="approveVerification('${ver.id}', true)" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all">Approve</button>
                    <button onclick="approveVerification('${ver.id}', false)" class="px-3 py-1 border border-error text-error hover:bg-error/5 rounded-lg text-xs font-bold transition-all">Reject</button>
                </div>
            `;
        } else if (ver.status === "Approved") {
            statusBadge = `<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-[#1a4a2a] dark:text-[#81c784]">Approved</span>`;
            actionsButtons = `<span class="text-xs text-on-surface-variant dark:text-gray-500">None Action Required</span>`;
        } else {
            statusBadge = `<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-800 dark:bg-[#681d24] dark:text-[#ffb4ab]">Declined</span>`;
            actionsButtons = `<button onclick="revertVerification('${ver.id}')" class="px-3 py-1 bg-surface-container hover:bg-surface-container-high dark:bg-[#2d3135] dark:hover:bg-[#3d4246] rounded-lg text-xs font-semibold transition-all">Re-Open</button>`;
        }

        return `
            <tr class="hover:bg-surface-container-low dark:hover:bg-[#25272a] transition-all">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-secondary-container dark:bg-[#34363a] text-primary dark:text-[#86d4d3] flex items-center justify-center font-bold text-xs">${initial}</div>
                        <span class="font-semibold text-on-surface dark:text-white text-sm">${ver.name}</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm font-semibold">${ver.roll}</td>
                <td class="px-6 py-4 select-none">
                    <span class="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase ${roleColor}">${ver.role}</span>
                </td>
                <td class="px-6 py-4 select-none">${statusBadge}</td>
                <td class="px-6 py-4 text-right">${actionsButtons}</td>
            </tr>
        `;
    }).join("");
}

// ----------------------------------------------------
// TAB 3: RECHARGES
// ----------------------------------------------------
function renderRechargesTab() {
    const listQueue = document.getElementById("full-table-recharges");
    if (!listQueue) return;

    let filtered = state.recharges;
    if (state.rechargeFilter === "pending") {
        filtered = state.recharges.filter(r => r.status === "Pending");
    } else if (state.rechargeFilter === "approved") {
        filtered = state.recharges.filter(r => r.status === "Approved");
    } else if (state.rechargeFilter === "declined") {
        filtered = state.recharges.filter(r => r.status === "Declined");
    }

    // Filter by global search query
    if (state.searchQuery.trim() !== "") {
        const query = state.searchQuery.trim().toLowerCase();
        filtered = filtered.filter(r => r.name.toLowerCase().includes(query) || r.studentId.toLowerCase().includes(query) || r.txid.toLowerCase().includes(query));
    }

    if (filtered.length === 0) {
        listQueue.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-12 text-center text-on-surface-variant font-medium dark:text-gray-400">
                    No matching recharge records found in audit logs.
                </td>
            </tr>
        `;
        return;
    }

    listQueue.innerHTML = filtered.map(rec => {
        let tagColor = rec.method.toLowerCase() === "bkash" ? "bg-pink-100 text-pink-700 dark:bg-pink-900/35 dark:text-pink-300" : "bg-orange-100 text-orange-700 dark:bg-orange-900/35 dark:text-orange-300";

        let statusBadge = "";
        let actionsButtons = "";

        if (rec.status === "Pending") {
            statusBadge = `<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-900/35 dark:text-amber-300">Pending</span>`;
            actionsButtons = `
                <div class="flex justify-end gap-1.5">
                    <button onclick="approveDeposit('${rec.id}', 'Approved')" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all">Approve</button>
                    <button onclick="approveDeposit('${rec.id}', 'Declined')" class="px-3 py-1 border border-error text-error hover:bg-error/5 rounded-lg text-xs font-bold transition-all">Reject</button>
                </div>
            `;
        } else if (rec.status === "Approved") {
            statusBadge = `<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-[#1a4a2a] dark:text-[#81c784]">Approved</span>`;
            actionsButtons = `<span class="text-xs text-on-surface-variant dark:text-gray-500 font-medium">Reconciled</span>`;
        } else {
            statusBadge = `<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-800 dark:bg-[#681d24] dark:text-[#ffb4ab]">Declined</span>`;
            actionsButtons = `<span class="text-xs text-on-surface-variant dark:text-gray-500 font-medium">Invalid TxID</span>`;
        }

        return `
            <tr class="hover:bg-surface-container-low dark:hover:bg-[#25272a] transition-all">
                <td class="px-6 py-4 font-semibold text-on-surface dark:text-white text-sm">${rec.name}</td>
                <td class="px-6 py-4 select-none">
                    <span class="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${tagColor}">${rec.method}</span>
                </td>
                <td class="px-6 py-4 font-mono text-xs text-on-surface-variant dark:text-[#bec8c8] select-all">${rec.txid}</td>
                <td class="px-6 py-4 font-extrabold text-sm text-on-surface dark:text-white">৳ ${rec.amount.toFixed(2)}</td>
                <td class="px-6 py-4 select-none">${statusBadge}</td>
                <td class="px-6 py-4 font-body-md text-xs text-on-surface-variant dark:text-[#bec8c8]">${rec.date}</td>
                <td class="px-6 py-4 text-right">${actionsButtons}</td>
            </tr>
        `;
    }).join("");
}

// ----------------------------------------------------
// TAB 4: USER MANAGEMENT
// ----------------------------------------------------
function renderUsersTab() {
    const listQueue = document.getElementById("full-table-users");
    if (!listQueue) return;

    let filtered = state.users;
    // Filter by global search query
    if (state.searchQuery.trim() !== "") {
        const query = state.searchQuery.trim().toLowerCase();
        filtered = filtered.filter(u => u.name.toLowerCase().includes(query) || u.id.toLowerCase().includes(query) || u.role.toLowerCase().includes(query));
    }

    listQueue.innerHTML = filtered.map(user => {
        let roleColor = user.role === "Student" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/35 dark:text-[#a5d6a7]" : "bg-purple-100 text-purple-800 dark:bg-purple-900/35 dark:text-purple-300";
        let statusBadge = user.status === "Active"
            ? `<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-[#1a4a2a] dark:text-[#81c784]">Active</span>`
            : `<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-800 dark:bg-[#681d24] dark:text-[#ffb4ab]">Blocked</span>`;

        let toggleButtonText = user.status === "Active" ? "Suspend" : "Activate";
        let toggleColor = user.status === "Active" ? "text-amber-600 hover:bg-amber-50 dark:text-amber-500 dark:hover:bg-amber-55/10" : "text-emerald-600 hover:bg-emerald-50 dark:text-emerald-500 dark:hover:bg-[#1d3d2c]";

        return `
            <tr class="hover:bg-surface-container-low dark:hover:bg-[#25272a] transition-all">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-secondary-container dark:bg-[#34363a] text-primary dark:text-[#86d4d3] flex items-center justify-center font-bold text-xs">${user.avatar}</div>
                        <span class="font-semibold text-on-surface dark:text-white text-sm">${user.name}</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm font-semibold">${user.id}</td>
                <td class="px-6 py-4 select-none">
                    <span class="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase ${roleColor}">${user.role}</span>
                </td>
                <td class="px-6 py-4 font-extrabold text-sm text-on-surface dark:text-white">৳ ${user.balance.toFixed(2)}</td>
                <td class="px-6 py-4 select-none">${statusBadge}</td>
                <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-2">
                        <button onclick="openEditBalanceModal('${user.id}')" class="px-2 py-1 text-primary hover:bg-primary/5 dark:text-[#86d4d3] dark:hover:bg-[#86d4d3]/5 border border-outline dark:border-[#2d3135] rounded-lg text-xs font-bold transition-all">Edit Balance</button>
                        <button onclick="toggleUserStatus('${user.id}')" class="px-2 py-1 ${toggleColor} rounded-lg text-xs font-bold transition-all">${toggleButtonText}</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// ----------------------------------------------------
// ADMINISTRATIVE ACTIONS LOGIC BLOCK
// ----------------------------------------------------

// 1. Verification quick check clicks
window.quickApproveVerification = function (id, isApprove) {
    const ver = state.verifications.find(v => v.id === id);
    if (!ver) return;

    ver.status = isApprove ? "Approved" : "Declined";
    saveState();

    if (isApprove) {
        showToast(`Approved registration for ${ver.name}!`, "success");
        addSystemLog("OK", `Modified credential scope of rollback user ID '${ver.roll}' (${ver.name}) to APPROVED.`);
    } else {
        showToast(`Rejected registration for ${ver.name}.`, "error");
        addSystemLog("WARN", `Credential request of user ID '${ver.roll}' (${ver.name}) set to BLOCKED/REJECTED.`);
    }

    renderActiveTab();
};

window.approveVerification = function (id, isApprove) {
    window.quickApproveVerification(id, isApprove);
};

window.revertVerification = function (id) {
    const ver = state.verifications.find(v => v.id === id);
    if (!ver) return;
    ver.status = "Pending";
    saveState();
    showToast(`Verification status reset for ${ver.name}.`, "info");
    addSystemLog("INFO", `Resubmitted verification status to PENDING for user ID '${ver.roll}'.`);
    renderActiveTab();
};

// 2. Deposit card approvals (instantly loads to campuspay-balance)
window.processDeposit = function (id, status) {
    const rec = state.recharges.find(r => r.id === id);
    if (!rec) return;

    rec.status = status;
    const amountVal = parseFloat(rec.amount);

    if (status === "Approved") {
        // Find user by studentId in system and credit them
        const trgUser = state.users.find(u => u.id === rec.studentId);
        if (trgUser) {
            trgUser.balance += amountVal;
        }

        // If it targets the active student user, we immediately update campuspay-balance key too!
        if (rec.studentId === "202114042") {
            const currentBal = parseFloat(localStorage.getItem('campuspay-balance')) || 500.00;
            const finalBal = currentBal + amountVal;
            localStorage.setItem('campuspay-balance', finalBal.toFixed(2));

            // Sync with local users mapping
            if (trgUser) trgUser.balance = finalBal;
        }

        showToast(`Approved ৳ ${amountVal.toFixed(2)} deposit for ${rec.name}!`, "success");
        addSystemLog("OK", `Approved Bkash/Nagad credit of ৳ ${amountVal.toFixed(2)} to account ID ${rec.studentId} (${rec.name}). (TxID: ${rec.txid})`);
    } else {
        showToast(`Rejected top-up request of ৳ ${amountVal.toFixed(2)} for ${rec.name}.`, "error");
        addSystemLog("WARN", `Rejected deposit request of ৳ ${amountVal.toFixed(2)} for account ID ${rec.studentId}. Reason: Invalid/Expired TxID.`);
    }

    saveState();
    renderActiveTab();
};

window.approveDeposit = function (id, status) {
    window.processDeposit(id, status);
};

// 3. User balance edit override actions
window.openEditBalanceModal = function (id) {
    const user = state.users.find(u => u.id === id);
    if (!user) return;

    const modal = document.getElementById("modal-edit-balance");
    const editIdInput = document.getElementById("edit-user-id");
    const editNameText = document.getElementById("edit-user-name");
    const editCurText = document.getElementById("edit-user-current-bal");
    const editNewInput = document.getElementById("edit-user-new-val");

    if (!modal || !editIdInput || !editNameText || !editCurText || !editNewInput) return;

    editIdInput.value = user.id;
    editNameText.innerText = user.name;
    editCurText.innerText = `${user.balance.toFixed(2)} ৳`;
    editNewInput.value = user.balance.toFixed(0);

    modal.classList.add("modal-open");
    modal.classList.remove("hidden");
    void modal.offsetWidth;
    modal.classList.add("opacity-100");
    editNewInput.focus();
};

function closeEditBalanceModal() {
    const modal = document.getElementById("modal-edit-balance");
    if (!modal) return;

    modal.classList.remove("opacity-100");
    setTimeout(() => {
        if (!modal.classList.contains("opacity-100")) {
            modal.classList.add("hidden");
            modal.classList.remove("modal-open");
        }
    }, 250);
}

window.toggleUserStatus = function (id) {
    const user = state.users.find(u => u.id === id);
    if (!user) return;

    user.status = user.status === "Active" ? "Suspended" : "Active";
    saveState();
    showToast(`Account of ${user.name} is now ${user.status}.`, user.status === "Active" ? "success" : "error");
    addSystemLog(user.status === "Active" ? "INFO" : "WARN", `Modified status of database profile Roll ID '${user.id}' to ${user.status.toUpperCase()}.`);
    renderActiveTab();
};

// ----------------------------------------------------
// BIND GLOBAL EVENT LISTENERS
// ----------------------------------------------------
function initEventListeners() {
    // 1. Sidebar selection buttons
    const tabButtons = document.querySelectorAll(".sidebar-tab-btn");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const destTab = btn.getAttribute("data-tab");
            switchTab(destTab);
        });
    });

    // Dashboard navigation links
    const dashboardNavTriggers = document.querySelectorAll("[data-tab-btn]");
    dashboardNavTriggers.forEach(btn => {
        btn.addEventListener("click", () => {
            const destTab = btn.getAttribute("data-tab-btn");
            switchTab(destTab);
        });
    });

    // 2. Global search engine query trigger
    const searchInput = document.getElementById("admin-global-search");
    searchInput?.addEventListener("input", (e) => {
        state.searchQuery = e.target.value;
        renderActiveTab();
    });

    // 3. Verifications Tab filter options
    const verifAll = document.getElementById("filter-verif-all");
    const verifPend = document.getElementById("filter-verif-pending");
    const verifApp = document.getElementById("filter-verif-approved");

    const clearActiveVerifFilters = () => {
        [verifAll, verifPend, verifApp].forEach(btn => {
            if (btn) btn.className = "px-4 py-2 text-xs font-bold rounded-lg text-on-surface-variant dark:text-secondary-fixed-dim hover:bg-white/50 dark:hover:bg-white/5 transition-colors";
        });
    };

    verifAll?.addEventListener("click", () => {
        clearActiveVerifFilters();
        verifAll.className = "px-4 py-2 text-xs font-bold rounded-lg bg-white dark:bg-[#1e2022] text-primary dark:text-white shadow-sm transition-colors";
        state.verifFilter = "all";
        renderActiveTab();
    });
    verifPend?.addEventListener("click", () => {
        clearActiveVerifFilters();
        verifPend.className = "px-4 py-2 text-xs font-bold rounded-lg bg-white dark:bg-[#1e2022] text-primary dark:text-white shadow-sm transition-colors";
        state.verifFilter = "pending";
        renderActiveTab();
    });
    verifApp?.addEventListener("click", () => {
        clearActiveVerifFilters();
        verifApp.className = "px-4 py-2 text-xs font-bold rounded-lg bg-white dark:bg-[#1e2022] text-primary dark:text-white shadow-sm transition-colors";
        state.verifFilter = "approved";
        renderActiveTab();
    });

    // 4. Recharges Tab filters
    const rAll = document.getElementById("filter-recharge-all");
    const rPend = document.getElementById("filter-recharge-pending");
    const rApp = document.getElementById("filter-recharge-approved");
    const rDec = document.getElementById("filter-recharge-declined");

    const clearRechargeFilters = () => {
        [rAll, rPend, rApp, rDec].forEach(btn => {
            if (btn) btn.className = "px-4 py-2 text-xs font-bold rounded-lg bg-surface-container dark:bg-[#2c2d30] border border-outline-variant dark:border-[#3a3d40] text-on-surface dark:text-gray-200 hover:bg-surface-container-high dark:hover:bg-[#34363a]";
        });
    };

    rAll?.addEventListener("click", () => {
        clearRechargeFilters();
        rAll.className = "px-4 py-2 text-xs font-bold rounded-lg bg-primary dark:bg-primary-container text-on-primary dark:text-[#86d4d3] shadow-sm hover:opacity-90";
        state.rechargeFilter = "all";
        renderActiveTab();
    });
    rPend?.addEventListener("click", () => {
        clearRechargeFilters();
        rPend.className = "px-4 py-2 text-xs font-bold rounded-lg bg-primary dark:bg-primary-container text-on-primary dark:text-[#86d4d3] shadow-sm hover:opacity-90";
        state.rechargeFilter = "pending";
        renderActiveTab();
    });
    rApp?.addEventListener("click", () => {
        clearRechargeFilters();
        rApp.className = "px-4 py-2 text-xs font-bold rounded-lg bg-primary dark:bg-primary-container text-on-primary dark:text-[#86d4d3] shadow-sm hover:opacity-90";
        state.rechargeFilter = "approved";
        renderActiveTab();
    });
    rDec?.addEventListener("click", () => {
        clearRechargeFilters();
        rDec.className = "px-4 py-2 text-xs font-bold rounded-lg bg-primary dark:bg-primary-container text-on-primary dark:text-[#86d4d3] shadow-sm hover:opacity-90";
        state.rechargeFilter = "declined";
        renderActiveTab();
    });

    // 5. Edit Balance Modal closing and form submit triggers
    const editClose = document.getElementById("modal-edit-close");
    editClose?.addEventListener("click", closeEditBalanceModal);

    // Close modal if overlay is clicked
    const editModal = document.getElementById("modal-edit-balance");
    editModal?.addEventListener("click", (e) => {
        if (e.target === editModal) closeEditBalanceModal();
    });

    const editForm = document.getElementById("form-edit-balance");
    editForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = document.getElementById("edit-user-id").value;
        const newBal = parseFloat(document.getElementById("edit-user-new-val").value);

        if (isNaN(newBal)) return;

        const targetUser = state.users.find(u => u.id === id);
        if (targetUser) {
            targetUser.balance = newBal;

            // If editing active student user, adjust and write to campuspay-balance key
            if (id === "202114042") {
                localStorage.setItem('campuspay-balance', newBal.toFixed(2));
            }

            saveState();
            closeEditBalanceModal();
            showToast(`Balance overridden successfully for ${targetUser.name}!`, "success");
            addSystemLog("OK", `Manual override: Adjusted balance of user ID ${id} (${targetUser.name}) to ৳ ${newBal.toFixed(2)}.`);
            renderActiveTab();
        }
    });

    // 6. Generate reports micro simulation
    const genReportBtn = document.getElementById("btn-generate-report");
    const qAuditBtn = document.getElementById("btn-quick-audit");

    const triggerReportGenerator = () => {
        const spinnerModal = document.getElementById("modal-report-spinner");
        if (!spinnerModal) return;

        spinnerModal.classList.remove("hidden");
        spinnerModal.classList.add("modal-open");
        void spinnerModal.offsetWidth;
        spinnerModal.classList.add("opacity-100");

        addSystemLog("INFO", "Audit report generator task initiated.");

        setTimeout(() => {
            spinnerModal.classList.remove("opacity-100");
            setTimeout(() => {
                spinnerModal.classList.add("hidden");
                spinnerModal.classList.remove("modal-open");
                showToast("Audit Report generated and saved successfully! 📄", "success");
                addSystemLog("OK", `Audit Report CampusPay_Report_${Date.now().toString().slice(-6)}.xlsx successfully compiled and backed up to vault storage.`);
            }, 250);
        }, 1800);
    };

    genReportBtn?.addEventListener("click", triggerReportGenerator);
    qAuditBtn?.addEventListener("click", triggerReportGenerator);

    // 7. General Broadcast simulation
    const announceBtn = document.getElementById("btn-announce");
    announceBtn?.addEventListener("click", () => {
        const announcementInput = prompt("Enter announcement text to broadcast to university canteens network:");
        if (announcementInput && announcementInput.trim() !== "") {
            showToast("Broadcast message dispatched to mobile applications!", "success");
            addSystemLog("OK", `Global push announcement broadcasted: "${announcementInput.trim()}"`);
        }
    });

    // 8. Focus search
    const lookUpBtn = document.getElementById("btn-user-search-focus");
    lookUpBtn?.addEventListener("click", () => {
        searchInput?.focus();
        showToast("Enter ID or name in header bar to query directory.", "info");
    });

    // 9. Clear log stream
    const clearLogsBtn = document.getElementById("btn-clear-logs");
    clearLogsBtn?.addEventListener("click", () => {
        const logsContainer = document.getElementById("terminal-console-logs");
        if (logsContainer) {
            logsContainer.innerHTML = "";
            addSystemLog("INFO", "System log terminal stream cleared.");
        }
    });

    // 10. Responsive mobile nav toggles
    const mobileMenuBtn = document.getElementById("admin-menu-toggle-btn");
    mobileMenuBtn?.addEventListener("click", openMobileNav);

    const backdrop = document.getElementById("mobile-nav-backdrop");
    backdrop?.addEventListener("click", closeMobileNav);

    // 11. Theme toggle
    const themeBtn = document.getElementById("theme-toggle");
    themeBtn?.addEventListener("click", toggleTheme);
}
