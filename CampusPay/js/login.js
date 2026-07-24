// CampusPay Client Authorization page Scripts

const state = {
    isDarkMode: localStorage.getItem('campuspay-theme') === 'dark'
};

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initEventListeners();
});

// Theme switcher
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

// Flat Toast Notifications
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

// Switch between Signup and Login form modes
function switchAuthMode(mode) {
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const btnLogin = document.getElementById("btn-login");
    const btnSignup = document.getElementById("btn-signup");
    const title = document.getElementById("form-title");
    const subtitle = document.getElementById("form-subtitle");

    if (!loginForm || !signupForm || !btnLogin || !btnSignup || !title || !subtitle) return;

    if (mode === "signup") {
        // Toggle Slider Selector style classes
        btnLogin.className = "flex-1 py-3 rounded-lg font-label-md text-label-md font-bold transition-all text-on-surface-variant dark:text-gray-400 hover:text-on-surface dark:hover:text-white";
        btnSignup.className = "flex-1 py-3 rounded-lg font-label-md text-label-md font-bold transition-all bg-white dark:bg-[#2c2d30] text-primary dark:text-[#86d4d3] shadow-md border border-neutral-200/20";

        // Dynamic Forms transitions
        loginForm.classList.add("opacity-0", "-translate-x-12", "pointer-events-none");
        loginForm.classList.remove("opacity-100", "translate-x-0");
        signupForm.classList.remove("opacity-0", "translate-x-12", "pointer-events-none");
        signupForm.classList.add("opacity-100", "translate-x-0");

        title.innerText = "Join the Platform";
        subtitle.innerText = "Complete your registration to start using CampusPay.";
    } else {
        // Toggle Slider Selector style classes
        btnSignup.className = "flex-1 py-3 rounded-lg font-label-md text-label-md font-bold transition-all text-on-surface-variant dark:text-gray-400 hover:text-on-surface dark:hover:text-white";
        btnLogin.className = "flex-1 py-3 rounded-lg font-label-md text-label-md font-bold transition-all bg-white dark:bg-[#2c2d30] text-primary dark:text-[#86d4d3] shadow-md border border-neutral-200/20";

        // Dynamic Forms transitions
        signupForm.classList.add("opacity-0", "translate-x-12", "pointer-events-none");
        signupForm.classList.remove("opacity-100", "translate-x-0");
        loginForm.classList.remove("opacity-0", "-translate-x-12", "pointer-events-none");
        loginForm.classList.add("opacity-100", "translate-x-0");

        title.innerText = "Welcome Back";
        subtitle.innerText = "Please enter your credentials to access the portal.";
    }
}

// Password Field Mask Visibility Toggle
function initPasswordToggles() {
    const toggles = document.querySelectorAll(".toggle-pw-btn");
    toggles.forEach(toggle => {
        toggle.addEventListener("click", () => {
            const container = toggle.closest("div");
            const inputField = container?.querySelector("input");
            const iconEl = toggle.querySelector(".material-symbols-outlined");

            if (!inputField || !iconEl) return;

            if (inputField.type === "password") {
                inputField.type = "text";
                iconEl.innerText = "visibility_off";
            } else {
                inputField.type = "password";
                iconEl.innerText = "visibility";
            }
        });
    });
}

// Modals management
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
        }, 250);
    }
}

// Submit Sign In handler
function handleLoginSubmit(event) {
    event.preventDefault();
    const idEl = document.getElementById("login-id");
    const pwEl = document.getElementById("login-password");
    const submitBtn = document.getElementById("login-submit-btn");

    if (!idEl || !pwEl || !submitBtn) return;

    const rawId = idEl.value.trim();
    const pwVal = pwEl.value.trim();

    if (rawId === "" || pwVal === "") {
        showToast("ID and password are required fields.", "error");
        return;
    }

    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span class="material-symbols-outlined animate-spin text-white">sync</span> Signing In...`;
    submitBtn.disabled = true;

    setTimeout(() => {
        // Validation check against active prototype credentials
        if (rawId === "202114042" && pwVal === "1234") {
            showToast("Login successful! Redirecting to student profile...", "success");
            setTimeout(() => {
                window.location.href = "./student.html";
            }, 1000);
        } else {
            submitBtn.innerHTML = originalContent;
            submitBtn.disabled = false;
            showToast("Access Denied: Unrecognized ID or incorrect password.", "error");
        }
    }, 1500);
}

// Submit Registration/Signup handler
function handleSignupSubmit(event) {
    event.preventDefault();
    const nameEl = document.getElementById("signup-name");
    const idEl = document.getElementById("signup-id");
    const deptEl = document.getElementById("signup-dept");
    const emailEl = document.getElementById("signup-email");
    const pwEl = document.getElementById("signup-password");
    const submitBtn = document.getElementById("signup-submit-btn");

    if (!nameEl || !idEl || !deptEl || !emailEl || !pwEl || !submitBtn) return;

    const name = nameEl.value.trim();
    const id = idEl.value.trim();
    const dept = deptEl.value;
    const email = emailEl.value.trim();
    const pw = pwEl.value.trim();

    if (name === "" || id === "" || email === "" || pw === "") {
        showToast("Please fill out all required fields.", "error");
        return;
    }

    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span class="material-symbols-outlined animate-spin text-white">sync</span> Creating Account...`;
    submitBtn.disabled = true;

    setTimeout(() => {
        showToast("Registration requested! Awaiting administrator approval.", "success");
        // Reset forms inputs
        nameEl.value = "";
        idEl.value = "";
        emailEl.value = "";
        pwEl.value = "";

        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;

        // Route back to sign in view
        setTimeout(() => {
            switchAuthMode("login");
        }, 1200);
    }, 1800);
}

// Event bindings
function initEventListeners() {
    const btnLogin = document.getElementById("btn-login");
    btnLogin?.addEventListener("click", () => switchAuthMode("login"));

    const btnSignup = document.getElementById("btn-signup");
    btnSignup?.addEventListener("click", () => switchAuthMode("signup"));

    const themeToggleBtn = document.getElementById("theme-toggle");
    themeToggleBtn?.addEventListener("click", toggleTheme);

    const forgotTrigger = document.getElementById("forgot-pw");
    forgotTrigger?.addEventListener("click", openForgotModal);

    const closeModalBtn = document.getElementById("btn-close-modal");
    closeModalBtn?.addEventListener("click", closeForgotModal);

    const modalOverlay = document.querySelector("#forgotModal > div");
    modalOverlay?.addEventListener("click", closeForgotModal);

    // Escape listener
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeForgotModal();
    });

    const loginForm = document.getElementById("login-form");
    loginForm?.addEventListener("submit", handleLoginSubmit);

    const signupForm = document.getElementById("signup-form");
    signupForm?.addEventListener("submit", handleSignupSubmit);

    initPasswordToggles();
}
