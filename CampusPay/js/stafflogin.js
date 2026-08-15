// CampusPay Secure Access Portal Control Scripts

const state = {
    isDarkMode: localStorage.getItem('campuspay-theme') === 'dark'
};

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initEventListeners();
});

// Theme toggler
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

// Float Toast Notifications
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

// Password toggle
function togglePassword() {
    const pwInput = document.getElementById("password");
    const iconEl = document.getElementById("visibilityIcon");
    if (!pwInput || !iconEl) return;

    if (pwInput.type === "password") {
        pwInput.type = "text";
        iconEl.innerText = "visibility_off";
    } else {
        pwInput.type = "password";
        iconEl.innerText = "visibility";
    }
}

// Modal management
function openAdminModal() {
    const modal = document.getElementById("adminModal");
    if (!modal) return;
    modal.classList.add("modal-open");
    modal.classList.remove("hidden");
    void modal.offsetWidth;
    modal.classList.add("opacity-100");
}

function closeAdminModal() {
    const modal = document.getElementById("adminModal");
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

// Login validation — calls real backend API
async function handleLoginSubmit(event) {
    event.preventDefault();

    const staffIdInput = document.getElementById("staff-id");
    const pinInput = document.getElementById("password");
    const submitBtn = document.getElementById("submit-btn");

    if (!staffIdInput || !pinInput || !submitBtn) return;

    const idVal = staffIdInput.value.trim();
    const pinVal = pinInput.value.trim();

    if (idVal === "" || pinVal === "") {
        showToast("Please enter both ID and security PIN.", "error");
        return;
    }

    const oContent = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span class="material-symbols-outlined animate-spin text-white">sync</span> Authenticating...`;
    submitBtn.disabled = true;

    try {
        const res = await fetch('http://127.0.0.1:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: idVal, password: pinVal }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
            localStorage.setItem('campuspay-token', data.data.token);
            localStorage.setItem('campuspay-user', JSON.stringify(data.data.user));

            const role = (data.data.user.role || '').toLowerCase();
            let redirectUrl = './student.html';
            if (role === 'staff') redirectUrl = './staff.html';
            else if (role === 'admin') redirectUrl = './admin.html';

            showToast("Login granted. Redirecting...", "success");
            setTimeout(() => { window.location.href = redirectUrl; }, 900);
        } else {
            showToast(data.message || "Access Denied: Unrecognized ID or Security PIN.", "error");
            submitBtn.innerHTML = oContent;
            submitBtn.disabled = false;
        }
    } catch (err) {
        // Demo fallback
        console.warn('Backend unreachable, demo mode.');
        const staffIds = ['st-0000', 'staff', 'kitchen'];
        const isAdmin = (idVal.toLowerCase() === 'adm-0000' || idVal.toLowerCase() === 'admin') && pinVal === '1234';
        const isStaff = staffIds.includes(idVal.toLowerCase()) && pinVal === '1234';

        if (isAdmin) {
            showToast("Demo: Admin access granted.", "success");
            setTimeout(() => { window.location.href = "./admin.html"; }, 900);
        } else if (isStaff) {
            showToast("Demo: Staff access granted.", "success");
            setTimeout(() => { window.location.href = "./staff.html"; }, 900);
        } else {
            submitBtn.innerHTML = oContent;
            submitBtn.disabled = false;
            showToast("Access Denied: Invalid credentials.", "error");
        }
    }
}

// Bind events
function initEventListeners() {
    const form = document.getElementById("staffLoginForm");
    form?.addEventListener("submit", handleLoginSubmit);

    const togglePw = document.getElementById("toggle-pw-btn");
    togglePw?.addEventListener("click", togglePassword);

    const forgotTrigger = document.getElementById("forgot-pin-trigger");
    forgotTrigger?.addEventListener("click", openAdminModal);

    const closeModalBtn = document.getElementById("btn-close-modal");
    closeModalBtn?.addEventListener("click", closeAdminModal);

    const modalOverlay = document.querySelector("#adminModal > div");
    modalOverlay?.addEventListener("click", closeAdminModal);

    // Escape code
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAdminModal();
    });

    const themeToggleBtn = document.getElementById("theme-toggle");
    themeToggleBtn?.addEventListener("click", toggleTheme);
}
