// CampusPay Administrator Command Center Access Controller Scripts

const state = {
    isDarkMode: localStorage.getItem('campuspay-theme') === 'dark'
};

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initEventListeners();
});

// Theme initializer
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
    showToast(state.isDarkMode ? "Dark Command Theme Enabled 🌙" : "Light Command Theme Enabled ☀️", "info");
}

// Security Toast Alerts
function showToast(message, type = "info") {
    const container = document.getElementById("toast-wrapper");
    if (!container) return;

    const toast = document.createElement("div");
    let bgClass = "bg-white dark:bg-[#1a1c1e] text-on-surface dark:text-white border-outline-variant dark:border-[#2d3135]";
    let icon = "info";
    let iconColor = "text-primary dark:text-[#86d4d3]";

    if (type === "success") {
        bgClass = "bg-[#d1fae5] dark:bg-[#064e3b] text-[#065f46] dark:text-[#a7f3d0] border-[#a7f3d0]/30";
        icon = "verified_user";
        iconColor = "text-[#059669] dark:text-[#34d399]";
    } else if (type === "error") {
        bgClass = "bg-[#fee2e2] dark:bg-[#7f1d1d] text-[#991b1b] dark:text-[#fca5a5] border-[#fca5a5]/30";
        icon = "gpp_bad";
        iconColor = "text-[#dc2626] dark:text-[#f87171]";
    }

    toast.className = `toast-item border flex items-center gap-3 p-4 rounded-xl shadow-lg pointer-events-auto max-w-sm ${bgClass}`;
    toast.innerHTML = `
        <span class="material-symbols-outlined ${iconColor}">${icon}</span>
        <p class="font-body-md text-body-md font-semibold flex-1">${message}</p>
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

// PIN Mask visibility Toggle
function initPasswordToggle() {
    const toggleBtn = document.getElementById("toggle-pw");
    const input = document.getElementById("password");
    if (!toggleBtn || !input) return;

    toggleBtn.addEventListener("click", () => {
        const iconSpan = toggleBtn.querySelector("span");
        if (input.type === "password") {
            input.type = "text";
            iconSpan.innerText = "visibility_off";
        } else {
            input.type = "password";
            iconSpan.innerText = "visibility";
        }
    });
}

// Modal Emergency Recover overlay selectors
function openForgotModal() {
    const modal = document.getElementById("forgotModal");
    if (!modal) return;
    modal.classList.add("modal-open");
    modal.classList.remove("hidden");
    void modal.offsetWidth;
    modal.classList.add("opacity-100");
}

function closeForgotModal() {
    const modal = document.getElementById("forgotModal");
    if (modal) {
        modal.classList.remove("opacity-100");
        setTimeout(() => {
            if (!modal.classList.contains("opacity-100")) {
                modal.classList.add("hidden");
                modal.classList.remove("modal-open");
            }
        }, 220);
    }
}

// Verify Admin Command Credentials
function handleAdminLogin(event) {
    event.preventDefault();
    const idField = document.getElementById("admin-id");
    const pwField = document.getElementById("password");
    const submitBtn = document.getElementById("submit-btn");

    if (!idField || !pwField || !submitBtn) return;

    const idVal = idField.value.trim();
    const pwVal = pwField.value.trim();

    if (idVal === "" || pwVal === "") {
        showToast("Please enter complete credentials.", "error");
        return;
    }

    const origContent = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span class="material-symbols-outlined animate-spin text-white">sync</span> Authenticating...`;
    submitBtn.disabled = true;

    setTimeout(() => {
        // Accepts: "admin" OR "CP-ADM-XXXXX" formats, with pin: "1234"
        const isValidId = idVal.toLowerCase() === "admin" || (idVal.startsWith("CP-ADM-") && idVal.length > 7);
        if (isValidId && pwVal === "1234") {
            showToast("Access Granted. Redirecting to Command Center...", "success");
            setTimeout(() => {
                window.location.href = "./admin.html";
            }, 1000);
        } else {
            showToast("Access Denied: Unrecognized ID or Security PIN.", "error");
            submitBtn.innerHTML = origContent;
            submitBtn.disabled = false;
        }
    }, 1500);
}

// Bind listeners
function initEventListeners() {
    const themeBtn = document.getElementById("theme-toggle");
    themeBtn?.addEventListener("click", toggleTheme);

    const helpBtn = document.getElementById("forgot-trigger");
    helpBtn?.addEventListener("click", openForgotModal);

    const closeBtn = document.getElementById("btn-close-modal");
    closeBtn?.addEventListener("click", closeForgotModal);

    const modalBackdrop = document.querySelector("#forgotModal > div");
    modalBackdrop?.addEventListener("click", closeForgotModal);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeForgotModal();
    });

    const form = document.getElementById("admin-login-form");
    form?.addEventListener("submit", handleAdminLogin);

    initPasswordToggle();
}
