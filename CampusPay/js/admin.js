// CampusPay Admin Panel Controller & State Management

// Seed state records (or load from localStorage if already customized)
const state = {
    isDarkMode: localStorage.getItem('campuspay-theme') === 'dark',
    currentTab: 'dashboard',
    searchQuery: '',
    verifFilter: 'all',
    rechargeFilter: 'all',
    userSearchQuery: '',
    userRoleFilter: 'all',
    userStatusFilter: 'all',

    // Verifications Queue local storage state
    verifications: JSON.parse(localStorage.getItem('campuspay-admin-verifications')) || [
        { id: "v1", name: "Ajmain", roll: "202314033", role: "Student", submitted: "10m ago", status: "Pending" },
        { id: "v2", name: "Abdullah Safwan", roll: "202114042", role: "Student", submitted: "2h ago", status: "Pending" },
        { id: "v3", name: "Dr. Khulna Habib", roll: "FAC-0000", role: "Teacher", submitted: "4h ago", status: "Approved" },
        { id: "v4", name: "Counter Staff #1", roll: "ST-0000", role: "Staff", submitted: "1d ago", status: "Approved" }
    ],

    // User Base state
    users: JSON.parse(localStorage.getItem('campuspay-admin-users')) || [
        { id: "202314033", name: "Ajmain (Student)", role: "Student", balance: parseFloat(localStorage.getItem('campuspay-balance')) || 500.00, status: "Active", avatar: "AJ" },
        { id: "202114042", name: "Abdullah Safwan", role: "Student", balance: 500.00, status: "Active", avatar: "AS" },
        { id: "FAC-0000", name: "Dr. Khulna Habib", role: "Teacher", balance: 2450.00, status: "Active", avatar: "KH" },
        { id: "ST-0000", name: "Counter Staff #1", role: "Staff", balance: 0.00, status: "Active", avatar: "CS" },
        { id: "ADM-0000", name: "System Administrator", role: "Admin", balance: 9999.00, status: "Active", avatar: "SA" },
        { id: "202214109", name: "Raisa Mahfuz", role: "Student", balance: 350.00, status: "Active", avatar: "RM" },
        { id: "202114001", name: "Tanvir Rahman", role: "Student", balance: 670.00, status: "Suspended", avatar: "TR" }
    ],

    // Recharges state
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
        { id: "rec1", name: "Tanvir Rahman", studentId: "202114001", method: "bKash", amount: 500, txid: "9X3M2K8P9W", date: "Aug 5, 2026, 04:15 PM", status: "Pending" },
        { id: "rec2", name: "Sumaiya Akhter", studentId: "202314055", method: "Nagad", amount: 1200, txid: "NAGAD8841Z", date: "Aug 5, 2026, 03:40 PM", status: "Pending" },
        { id: "rec3", name: "Dr. Khulna Habib", studentId: "FAC-0000", method: "bKash", amount: 2500, txid: "BK772L1X0Y", date: "Aug 5, 2026, 02:10 PM", status: "Pending" },
        { id: "rec4", name: "Ajmain (Student)", studentId: "202314033", method: "bKash", amount: 1000, txid: "99M8N2XQ1", date: "Aug 4, 2026, 01:25 PM", status: "Approved" },
        { id: "rec5", name: "Rashidul Bari", studentId: "202014022", method: "Nagad", amount: 200, txid: "NG34L9X11", date: "Aug 3, 2026, 11:05 AM", status: "Declined" }
    ];

    // Filter out studentReqs that have same txid as defaultRecharges to avoid duplicates
    const filteredDefaults = defaultRecharges.filter(def => !studentReqs.some(st => st.txid === def.txid));
    state.recharges = [...studentReqs, ...filteredDefaults];

    // Sync student balance from localstorage into users array entry
    const studentBal = parseFloat(localStorage.getItem('campuspay-balance')) || 500.00;
    const safwan = state.users.find(u => u.id === "202314033");
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
                        <div class="flex items-center justify-between gap-2 select-none pt-1">
                            <div class="flex items-center gap-1.5">
                                <button onclick="processDeposit('${rec.id}', 'Approved')" class="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1" title="Approve"><span class="material-symbols-outlined text-sm">check</span> Approve</button>
                                <button onclick="processDeposit('${rec.id}', 'Declined')" class="px-2.5 py-1.5 border border-error text-error hover:bg-error/5 rounded-lg text-xs font-bold transition-all flex items-center gap-1" title="Reject"><span class="material-symbols-outlined text-sm">close</span> Reject</button>
                            </div>
                            <button onclick="openEditBalanceModal('${rec.studentId}')" class="px-2.5 py-1.5 text-primary dark:text-[#86d4d3] border border-outline-variant dark:border-[#2d3135] hover:bg-primary/5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"><span class="material-symbols-outlined text-xs">edit</span>Edit Bal</button>
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
        let reviewIcons = "";
        let editBalPen = `<button onclick="openEditBalanceModal('${rec.studentId}')" class="p-1.5 hover:bg-primary/10 text-primary dark:text-[#86d4d3] border border-outline-variant dark:border-[#2d3135] rounded-lg transition-all" title="Edit User Balance"><span class="material-symbols-outlined text-base">edit</span></button>`;

        if (rec.status === "Pending") {
            statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-900/35 dark:text-amber-300">Pending</span>`;
            reviewIcons = `
                <div class="flex justify-center items-center gap-1.5 select-none">
                    <button onclick="approveDeposit('${rec.id}', 'Approved')" class="p-1.5 bg-emerald-100 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white rounded-lg transition-all" title="Approve (Tick)"><span class="material-symbols-outlined text-base">check</span></button>
                    <button onclick="approveDeposit('${rec.id}', 'Declined')" class="p-1.5 bg-rose-100 hover:bg-rose-600 hover:text-white text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white rounded-lg transition-all" title="Reject (Cross)"><span class="material-symbols-outlined text-base">close</span></button>
                </div>
            `;
        } else if (rec.status === "Approved") {
            statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-[#1a4a2a] dark:text-[#81c784]">Approved</span>`;
            reviewIcons = `<div class="flex justify-center select-none"><span class="material-symbols-outlined text-emerald-500 text-lg" title="Approved">check_circle</span></div>`;
        } else {
            statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-800 dark:bg-[#681d24] dark:text-[#ffb4ab]">Declined</span>`;
            reviewIcons = `<div class="flex justify-center select-none"><span class="material-symbols-outlined text-rose-500 text-lg" title="Declined">cancel</span></div>`;
        }

        let dateParts = rec.date.split(",");
        let dateStr = dateParts[0].trim();
        if (dateParts.length > 1 && !isNaN(dateParts[1].trim())) {
            dateStr += `, ${dateParts[1].trim()}`;
        }
        let timeStr = dateParts.length > 2 ? dateParts.slice(2).join(",").trim() : (dateParts.length === 2 && isNaN(dateParts[1].trim()) ? dateParts[1].trim() : "");

        let timestampHtml = timeStr ? `
            <div class="leading-tight select-none text-center">
                <div class="font-semibold text-xs text-on-surface dark:text-gray-200 tracking-tight whitespace-nowrap">${dateStr}</div>
                <div class="text-[10px] text-on-surface-variant dark:text-gray-400 font-mono tracking-tight whitespace-nowrap mt-0.5">${timeStr}</div>
            </div>
        ` : `<div class="font-mono text-xs text-on-surface dark:text-gray-200 tracking-tight whitespace-nowrap text-center">${rec.date}</div>`;

        return `
            <tr class="hover:bg-surface-container-low dark:hover:bg-[#25272a] transition-all">
                <td class="px-4 py-3 font-semibold text-on-surface dark:text-white text-sm whitespace-nowrap">${rec.name}</td>
                <td class="px-4 py-3 select-none whitespace-nowrap">
                    <span class="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${tagColor}">${rec.method}</span>
                </td>
                <td class="px-4 py-3 font-mono text-xs text-on-surface-variant dark:text-[#bec8c8] select-all whitespace-nowrap">${rec.txid}</td>
                <td class="px-4 py-3 font-extrabold text-sm text-on-surface dark:text-white whitespace-nowrap">৳ ${rec.amount.toFixed(2)}</td>
                <td class="px-4 py-3 select-none whitespace-nowrap text-center">${timestampHtml}</td>
                <td class="px-4 py-3 select-none whitespace-nowrap">${statusBadge}</td>
                <td class="px-4 py-3 text-center whitespace-nowrap">${reviewIcons}</td>
                <td class="px-4 py-3 text-right whitespace-nowrap">${editBalPen}</td>
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

    // Filter by search query (user search bar or header search bar)
    const query = (state.userSearchQuery || state.searchQuery).trim().toLowerCase();
    if (query !== "") {
        filtered = filtered.filter(u => u.name.toLowerCase().includes(query) || u.id.toLowerCase().includes(query) || u.role.toLowerCase().includes(query));
    }

    // Filter by role
    if (state.userRoleFilter && state.userRoleFilter !== "all") {
        filtered = filtered.filter(u => u.role.toLowerCase() === state.userRoleFilter.toLowerCase());
    }

    // Filter by status
    if (state.userStatusFilter && state.userStatusFilter !== "all") {
        filtered = filtered.filter(u => u.status.toLowerCase() === state.userStatusFilter.toLowerCase());
    }

    if (filtered.length === 0) {
        listQueue.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-gray-400 dark:text-gray-500 font-medium select-none">
                    <span class="material-symbols-outlined text-4xl block mb-2 text-gray-300 dark:text-gray-600">person_off</span>
                    No user accounts match the selected filters. Try adjusting your search query or dropdown criteria.
                </td>
            </tr>
        `;
        return;
    }

    listQueue.innerHTML = filtered.map(user => {
        let roleColor = user.role === "Student" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/35 dark:text-[#a5d6a7]" : (user.role === "Teacher" || user.role === "Faculty" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/35 dark:text-purple-300" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/35 dark:text-emerald-300");
        let statusBadge = user.status === "Active"
            ? `<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-[#1a4a2a] dark:text-[#81c784]">Active</span>`
            : `<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-800 dark:bg-[#681d24] dark:text-[#ffb4ab]">Suspended</span>`;

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
                        <button onclick="toggleUserStatus('${user.id}')" class="px-3 py-1 ${toggleColor} border border-outline-variant dark:border-[#2d3135] rounded-lg text-xs font-bold transition-all">${toggleButtonText}</button>
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

            // Log transaction to student transaction history
            const rawTxs = localStorage.getItem('campuspay-transactions');
            let txs = [];
            if (rawTxs) {
                try {
                    txs = JSON.parse(rawTxs);
                } catch (e) {
                    console.error(e);
                }
            }
            const methodLabel = rec.method || 'Online';
            const newTx = {
                date: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
                type: "Recharge",
                desc: `Top-up via ${methodLabel} (Approved)`,
                amount: amountVal,
                postBalance: finalBal
            };
            txs.push(newTx);
            localStorage.setItem('campuspay-transactions', JSON.stringify(txs));
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

    // 7. Broadcast Announcement Modal & Form Handlers
    const announceBtn = document.getElementById("btn-announce");
    const broadcastModal = document.getElementById("modal-broadcast-announcement");
    const broadcastCloseBtn = document.getElementById("modal-broadcast-close");
    const broadcastCancelBtn = document.getElementById("btn-cancel-broadcast");
    const broadcastForm = document.getElementById("form-broadcast-announcement");

    const openBroadcastModal = () => {
        if (!broadcastModal) return;
        broadcastModal.classList.remove("hidden");
        broadcastModal.classList.add("modal-open");
        void broadcastModal.offsetWidth;
        broadcastModal.classList.add("opacity-100");
        document.getElementById("announce-title")?.focus();
    };

    const closeBroadcastModal = () => {
        if (!broadcastModal) return;
        broadcastModal.classList.remove("opacity-100");
        setTimeout(() => {
            if (!broadcastModal.classList.contains("opacity-100")) {
                broadcastModal.classList.add("hidden");
                broadcastModal.classList.remove("modal-open");
            }
        }, 250);
    };

    announceBtn?.addEventListener("click", openBroadcastModal);
    broadcastCloseBtn?.addEventListener("click", closeBroadcastModal);
    broadcastCancelBtn?.addEventListener("click", closeBroadcastModal);

    broadcastModal?.addEventListener("click", (e) => {
        if (e.target === broadcastModal) closeBroadcastModal();
    });

    broadcastForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("announce-title")?.value.trim();
        const audience = document.getElementById("announce-audience")?.value;
        const priority = document.getElementById("announce-priority")?.value;
        const message = document.getElementById("announce-message")?.value.trim();

        if (!title || !message) return;

        // Push into global notification array in localStorage if available
        const rawNotifs = localStorage.getItem('campuspay-notifications');
        let notifs = [];
        if (rawNotifs) {
            try { notifs = JSON.parse(rawNotifs); } catch (_err) {}
        }
        notifs.unshift({
            title: title,
            message: message,
            date: "Just Now",
            audience: audience,
            priority: priority
        });
        localStorage.setItem('campuspay-notifications', JSON.stringify(notifs));

        closeBroadcastModal();
        broadcastForm.reset();

        showToast(`Announcement Broadcast Published Successfully! 📢`, "success");
        addSystemLog("OK", `Global Push Broadcast Dispatched [Audience: ${audience.toUpperCase()}, Priority: ${priority.toUpperCase()}]: "${title}"`);
    });

    // 8. User Management Advanced Search & Filter Controls
    const userSearchInput = document.getElementById("user-search-input");
    const userRoleFilter = document.getElementById("user-role-filter");
    const userStatusFilter = document.getElementById("user-status-filter");
    const userResetBtn = document.getElementById("user-filter-reset-btn");

    userSearchInput?.addEventListener("input", (e) => {
        state.userSearchQuery = e.target.value;
        renderUsersTab();
    });

    userRoleFilter?.addEventListener("change", (e) => {
        state.userRoleFilter = e.target.value;
        renderUsersTab();
    });

    userStatusFilter?.addEventListener("change", (e) => {
        state.userStatusFilter = e.target.value;
        renderUsersTab();
    });

    userResetBtn?.addEventListener("click", () => {
        if (userSearchInput) userSearchInput.value = "";
        if (userRoleFilter) userRoleFilter.value = "all";
        if (userStatusFilter) userStatusFilter.value = "all";

        state.userSearchQuery = "";
        state.userRoleFilter = "all";
        state.userStatusFilter = "all";
        renderUsersTab();
        showToast("User filters reset.", "info");
    });

    // 9. Focus search
    const lookUpBtn = document.getElementById("btn-user-search-focus");
    lookUpBtn?.addEventListener("click", () => {
        // Switch to users tab and focus user search input!
        const usersTabBtn = document.querySelector('[data-tab="users"]');
        if (usersTabBtn) usersTabBtn.click();
        setTimeout(() => userSearchInput?.focus(), 150);
        showToast("Enter ID or name in search box to query directory.", "info");
    });

    // 10. Clear log stream
    const clearLogsBtn = document.getElementById("btn-clear-logs");
    clearLogsBtn?.addEventListener("click", () => {
        const logsContainer = document.getElementById("terminal-console-logs");
        if (logsContainer) {
            logsContainer.innerHTML = "";
            addSystemLog("INFO", "System log terminal stream cleared.");
        }
    });

    // 11. Responsive mobile nav toggles
    const mobileMenuBtn = document.getElementById("admin-menu-toggle-btn");
    mobileMenuBtn?.addEventListener("click", openMobileNav);

    const backdrop = document.getElementById("mobile-nav-backdrop");
    backdrop?.addEventListener("click", closeMobileNav);

    // 12. Theme toggle
    const themeBtn = document.getElementById("theme-toggle");
    themeBtn?.addEventListener("click", toggleTheme);
}
// ----------------------------------------------------
// MANUAL CASH RECHARGE LOGIC
// ----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const btnManualRecharge = document.getElementById("btn-manual-recharge");
    const modalManualRecharge = document.getElementById("modal-manual-recharge");
    const btnManualClose = document.getElementById("modal-manual-close");
    const formManualRecharge = document.getElementById("form-manual-recharge");
    
    // Autocomplete elements
    const userIdInput = document.getElementById("manual-user-id");
    const userDropdown = document.getElementById("manual-user-dropdown");

    // Autocomplete Logic
    if (userIdInput && userDropdown) {
        const renderDropdown = (query) => {
            userDropdown.innerHTML = "";
            const lowerQuery = query.toLowerCase();
            const matchedUsers = state.users.filter(u => 
                u.id.toLowerCase().includes(lowerQuery) || 
                u.name.toLowerCase().includes(lowerQuery)
            ).slice(0, 5); // Limit to 5 results

            if (matchedUsers.length === 0) {
                userDropdown.innerHTML = `<div class="p-3 text-xs text-on-surface-variant dark:text-gray-400 text-center">No users found</div>`;
            } else {
                matchedUsers.forEach(user => {
                    const item = document.createElement("div");
                    item.className = "flex items-center gap-3 p-2 hover:bg-surface-container-low dark:hover:bg-[#34363a] rounded-lg cursor-pointer transition-colors";
                    item.innerHTML = `
                        <div class="w-8 h-8 rounded-full bg-primary/10 text-primary dark:text-[#86d4d3] flex items-center justify-center font-bold text-[10px] uppercase">
                            ${user.avatar || user.name.slice(0,2)}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="text-sm font-bold text-on-surface dark:text-white truncate">${user.name}</div>
                            <div class="text-[10px] text-on-surface-variant dark:text-gray-400 font-mono tracking-tight">${user.id} &bull; ${user.role}</div>
                        </div>
                    `;
                    item.addEventListener("click", () => {
                        userIdInput.value = user.id;
                        userDropdown.classList.add("hidden");
                    });
                    userDropdown.appendChild(item);
                });
            }
            userDropdown.classList.remove("hidden");
        };

        userIdInput.addEventListener("input", (e) => {
            const val = e.target.value.trim();
            if (val.length > 0) {
                renderDropdown(val);
            } else {
                userDropdown.classList.add("hidden");
            }
        });

        userIdInput.addEventListener("focus", (e) => {
            const val = e.target.value.trim();
            if (val.length > 0) {
                renderDropdown(val);
            }
        });

        // Hide dropdown on click outside
        document.addEventListener("click", (e) => {
            if (!userIdInput.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.add("hidden");
            }
        });
    }

    if (btnManualRecharge && modalManualRecharge) {
        btnManualRecharge.addEventListener("click", () => {
            modalManualRecharge.classList.remove("hidden");
            setTimeout(() => {
                modalManualRecharge.classList.remove("opacity-0");
                modalManualRecharge.querySelector("div").classList.remove("translate-y-4");
            }, 10);
        });
    }

    if (btnManualClose && modalManualRecharge) {
        btnManualClose.addEventListener("click", () => {
            modalManualRecharge.classList.add("opacity-0");
            modalManualRecharge.querySelector("div").classList.add("translate-y-4");
            setTimeout(() => {
                modalManualRecharge.classList.add("hidden");
                if (userDropdown) userDropdown.classList.add("hidden");
            }, 300);
        });
    }

    if (formManualRecharge) {
        formManualRecharge.addEventListener("submit", (e) => {
            e.preventDefault();
            const amountInput = document.getElementById("manual-amount");
            
            if (!userIdInput || !amountInput) return;
            
            const userId = userIdInput.value.trim();
            const amount = parseFloat(amountInput.value);
            
            if (!userId || isNaN(amount) || amount <= 0) return;

            // Generate unique TXID for cash
            const txid = "CASH-" + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
            
            const now = new Date();
            const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

            // Fetch name if exists
            const matchedUser = state.users.find(u => u.id === userId);
            const userName = matchedUser ? matchedUser.name : "User " + userId;

            // Create new record
            const newRecord = {
                id: "rech_" + Date.now(),
                name: userName,
                studentId: userId, // Keeping the field name studentId in data model for consistency with other parts of the app
                method: "Cash",
                txid: txid,
                amount: amount,
                date: `${dateStr}, ${timeStr}`,
                status: "Approved"
            };

            state.recharges.unshift(newRecord);
            
            showToast("Success", `Cash recharge of ৳${amount} for ${userId} added successfully.`, "success");
            
            // Close modal & rerender
            btnManualClose.click();
            formManualRecharge.reset();
            renderRechargesTab();
        });
    }
});
