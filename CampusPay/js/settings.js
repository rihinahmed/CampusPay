// parse url search params
const urlParams = new URLSearchParams(window.location.search);
const activeRole = urlParams.get('role') || 'student'; // fallback

// config constants
const sideNavigations = {
    student: [
        { name: 'Food Menu', icon: 'restaurant', url: './student.html' },
        { name: 'Orders', icon: 'shopping_bag', url: '#' },
        { name: 'Recharge', icon: 'add_card', url: './recharge.html' },
        { name: 'Settings', icon: 'settings', url: '#', active: true },
    ],
    staff: [
        { name: 'Orders Queue', icon: 'restaurant', url: './staff.html' },
        { name: 'Inventory Logs', icon: 'inventory_2', url: '#' },
        { name: 'POS Control', icon: 'point_of_sale', url: '#' },
        { name: 'Settings', icon: 'settings', url: '#', active: true },
    ],
    admin: [
        { name: 'System Overview', icon: 'dashboard', url: './admin.html' },
        { name: 'Verify Users', icon: 'verified_user', url: '#' },
        { name: 'Financial Ledger', icon: 'account_balance', url: '#' },
        { name: 'Settings', icon: 'settings', url: '#', active: true },
    ]
};

const roleIdentitySubtitle = {
    student: 'MIST Student Portal',
    staff: 'Canteen Staff Operator',
    admin: 'Central Command Center'
};

const backRedirectionUrl = {
    student: './student.html',
    staff: './staff.html',
    admin: './admin.html'
};

// toast display
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `flex items-center gap-3 px-6 py-4 bg-white dark:bg-[#1e2022] border border-outline-variant dark:border-[#2d3135] rounded-xl shadow-lg transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto`;

    let icon = 'check_circle';
    let iconClass = 'text-green-500';
    if (type === 'error') {
        icon = 'cancel';
        iconClass = 'text-red-500';
    } else if (type === 'warning') {
        icon = 'warning';
        iconClass = 'text-yellow-500';
    }

    toast.innerHTML = `
        <span class="material-symbols-outlined ${iconClass}">${icon}</span>
        <span class="text-sm font-bold text-on-surface dark:text-white">${message}</span>
    `;

    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    // Remove toast
    setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// populate links
function populateSidebar() {
    const navItems = sideNavigations[activeRole] || sideNavigations.student;

    // desktop
    const desktopNav = document.getElementById('desktop-nav');
    if (desktopNav) {
        desktopNav.innerHTML = navItems.map(item => `
            <a class="${item.active ? 'bg-secondary-container dark:bg-[#004f4f]/30 text-on-secondary-container dark:text-[#86d4d3]' : 'text-on-surface-variant dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-[#202225]'} px-4 py-3 mx-2 flex items-center gap-3 transition-all duration-200 ease-in-out rounded-lg font-label-md text-label-md" 
               href="${item.url}">
                <span class="material-symbols-outlined">${item.icon}</span>
                ${item.name}
            </a>
        `).join('');
    }

    const desktopFooter = document.getElementById('desktop-footer');
    if (desktopFooter) {
        desktopFooter.innerHTML = `
            <a class="text-on-surface-variant dark:text-secondary-fixed-dim px-4 py-3 mx-2 flex items-center gap-3 transition-all duration-200 ease-in-out hover:bg-surface-container-high dark:hover:bg-[#202225] rounded-lg font-label-md text-label-md"
                href="./login.html">
                <span class="material-symbols-outlined">logout</span>
                Logout
            </a>
        `;
    }

    // mobile
    const mobileNav = document.getElementById('mobile-nav-links');
    if (mobileNav) {
        mobileNav.innerHTML = navItems.map(item => `
            <a class="${item.active ? 'bg-secondary-container dark:bg-[#004f4f]/30 text-on-secondary-container' : 'text-on-surface-variant dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-[#202225]'} px-4 py-3 mx-2 flex items-center gap-3 rounded-lg font-label-md text-label-md" 
               href="${item.url}">
                <span class="material-symbols-outlined">${item.icon}</span>
                ${item.name}
            </a>
        `).join('');
    }

    const mobileFooter = document.getElementById('mobile-footer');
    if (mobileFooter) {
        mobileFooter.innerHTML = `
            <a class="text-on-surface-variant dark:text-secondary-fixed-dim px-4 py-3 mx-2 flex items-center gap-3 hover:bg-surface-container-high dark:hover:bg-[#2d3135] rounded-lg font-label-md text-label-md" 
               href="./login.html">
                <span class="material-symbols-outlined">logout</span>
                Logout
            </a>
        `;
    }

    // Set role subtitle slots
    document.querySelectorAll('.default-subtitle-slot').forEach(el => {
        el.textContent = roleIdentitySubtitle[activeRole];
    });
}

// inject dynamic settings inputs based on active role
function injectSettingsFields() {
    const fieldsContainer = document.getElementById('settings-fields');
    if (!fieldsContainer) return;

    let html = '';

    // load saved values if any
    const rawSaved = localStorage.getItem(`campuspay-config-${activeRole}`);
    let savedSettings = {};
    if (rawSaved) {
        try { savedSettings = JSON.parse(rawSaved); } catch (e) { }
    }

    if (activeRole === 'student') {
        html = `
            <!-- Full Name -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label class="font-bold text-sm text-on-surface-variant dark:text-gray-400">Student Name</label>
                <div class="md:col-span-2">
                    <input type="text" name="student_name" class="w-full px-4 py-3 bg-surface-container-low dark:bg-[#2c2d30] border border-outline-variant dark:border-[#3d4043] rounded-xl text-on-surface dark:text-white" value="${savedSettings.student_name || 'Mashiat S. MIST'}">
                </div>
            </div>
            <!-- Student ID -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label class="font-bold text-sm text-on-surface-variant dark:text-gray-400">Institutional ID</label>
                <div class="md:col-span-2">
                    <input type="text" name="student_id" readonly class="w-full px-4 py-3 bg-surface-container-high dark:bg-[#202123] border border-outline-variant dark:border-[#3d4043] rounded-xl text-gray-500 cursor-not-allowed" value="202114042">
                </div>
            </div>
            <!-- Pin Update -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label class="font-bold text-sm text-on-surface-variant dark:text-gray-400">Security PIN</label>
                <div class="md:col-span-2">
                    <input type="password" name="student_pin" placeholder="Enter new 4-digit PIN" class="w-full px-4 py-3 bg-surface-container-low dark:bg-[#2c2d30] border border-outline-variant dark:border-[#3d4043] rounded-xl text-on-surface dark:text-white">
                </div>
            </div>
            <!-- Threshold limit -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label class="font-bold text-sm text-on-surface-variant dark:text-gray-400">Low Balance Warnings (৳)</label>
                <div class="md:col-span-2">
                    <input type="number" name="student_min_balance" class="w-full px-4 py-3 bg-surface-container-low dark:bg-[#2c2d30] border border-outline-variant dark:border-[#3d4043] rounded-xl text-on-surface dark:text-white" value="${savedSettings.student_min_balance || '100'}">
                </div>
            </div>
            <!-- Notification Toggle -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label class="font-bold text-sm text-on-surface-variant dark:text-gray-400">Tray Dispatch Emails</label>
                <div class="md:col-span-2 flex items-center">
                    <input type="checkbox" name="dispatch_notifications" ${savedSettings.dispatch_notifications !== false ? 'checked' : ''} class="w-5 h-5 rounded border-outline-variant dark:border-[#3d4043] text-primary focus:ring-primary">
                    <span class="ml-3 text-xs text-on-surface-variant">Notify when canteen dispatch clears my plate to the checkout terminal.</span>
                </div>
            </div>
        `;
    } else if (activeRole === 'staff') {
        html = `
            <!-- Counter Identifier -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label class="font-bold text-sm text-on-surface-variant dark:text-gray-400">Canteen Counter Name</label>
                <div class="md:col-span-2">
                    <input type="text" name="counter_name" class="w-full px-4 py-3 bg-surface-container-low dark:bg-[#2c2d30] border border-outline-variant dark:border-[#3d4043] rounded-xl text-on-surface dark:text-white" value="${savedSettings.counter_name || 'MIST Counter A'}">
                </div>
            </div>
            <!-- Operator ID -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label class="font-bold text-sm text-on-surface-variant dark:text-gray-400">Operator ID</label>
                <div class="md:col-span-2">
                    <input type="text" name="operator_id" readonly class="w-full px-4 py-3 bg-surface-container-high dark:bg-[#202123] border border-outline-variant dark:border-[#3d4043] rounded-xl text-gray-500 cursor-not-allowed" value="ST-00000">
                </div>
            </div>
            <!-- Shift selection -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label class="font-bold text-sm text-on-surface-variant dark:text-gray-400">Shift Configuration</label>
                <div class="md:col-span-2">
                    <input type="text" name="operator_shift" class="w-full px-4 py-3 bg-surface-container-low dark:bg-[#2c2d30] border border-outline-variant dark:border-[#3d4043] rounded-xl text-on-surface dark:text-white" value="${savedSettings.operator_shift || '08:00 AM - 04:00 PM'}">
                </div>
            </div>
            <!-- Printer Toggle -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label class="font-bold text-sm text-on-surface-variant dark:text-gray-400">Auto Print Billing Receipts</label>
                <div class="md:col-span-2 flex items-center">
                    <input type="checkbox" name="print_receipts" ${savedSettings.print_receipts ? 'checked' : ''} class="w-5 h-5 rounded border-outline-variant dark:border-[#3d4043] text-primary focus:ring-primary">
                    <span class="ml-3 text-xs text-on-surface-variant">Send order confirmations straight to thermal receipt printer.</span>
                </div>
            </div>
            <!-- Audio Toggle -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label class="font-bold text-sm text-on-surface-variant dark:text-gray-400">Sound Notifications</label>
                <div class="md:col-span-2 flex items-center">
                    <input type="checkbox" name="sound_effects" ${savedSettings.sound_effects !== false ? 'checked' : ''} class="w-5 h-5 rounded border-outline-variant dark:border-[#3d4043] text-primary focus:ring-primary">
                    <span class="ml-3 text-xs text-on-surface-variant">Play sound alerts when new online student orders are queued.</span>
                </div>
            </div>
        `;
    } else if (activeRole === 'admin') {
        html = `
            <!-- Admin Identity -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label class="font-bold text-sm text-on-surface-variant dark:text-gray-400">Administrator Handle</label>
                <div class="md:col-span-2">
                    <input type="text" name="admin_handle" class="w-full px-4 py-3 bg-surface-container-low dark:bg-[#2c2d30] border border-outline-variant dark:border-[#3d4043] rounded-xl text-on-surface dark:text-white" value="${savedSettings.admin_handle || 'CP-ADM-001'}">
                </div>
            </div>
            <!-- Trans limit -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label class="font-bold text-sm text-on-surface-variant dark:text-gray-400">Single Recharge Limit (৳)</label>
                <div class="md:col-span-2">
                    <input type="number" name="recharge_limit" class="w-full px-4 py-3 bg-surface-container-low dark:bg-[#2c2d30] border border-outline-variant dark:border-[#3d4043] rounded-xl text-on-surface dark:text-white" value="${savedSettings.recharge_limit || '1000'}">
                </div>
            </div>
            <!-- Verification workflow -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label class="font-bold text-sm text-on-surface-variant dark:text-gray-400">Verification Scheme</label>
                <div class="md:col-span-2">
                    <select name="verification_scheme" class="w-full px-4 py-3 bg-surface-container-low dark:bg-[#2c2d30] border border-outline-variant dark:border-[#3d4043] rounded-xl text-on-surface dark:text-white">
                        <option value="auto" ${savedSettings.verification_scheme === 'auto' ? 'selected' : ''}>Instant Automatic approval</option>
                        <option value="manual" ${savedSettings.verification_scheme === 'manual' ? 'selected' : ''}>Manual Clerk Audit Required</option>
                    </select>
                </div>
            </div>
            <!-- Backup systems -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label class="font-bold text-sm text-on-surface-variant dark:text-gray-400">Hourly Database Backups</label>
                <div class="md:col-span-2 flex items-center">
                    <input type="checkbox" name="hourly_backups" ${savedSettings.hourly_backups !== false ? 'checked' : ''} class="w-5 h-5 rounded border-outline-variant dark:border-[#3d4043] text-primary focus:ring-primary">
                    <span class="ml-3 text-xs text-on-surface-variant font-medium">Backup transaction ledgers and login registry databases hourly.</span>
                </div>
            </div>
            <!-- Administrative lock -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label class="font-bold text-sm text-on-surface-variant dark:text-gray-400">System-wide Lockout</label>
                <div class="md:col-span-2 flex items-center">
                    <input type="checkbox" name="system_lock" ${savedSettings.system_lock ? 'checked' : ''} class="w-5 h-5 rounded border-outline-variant dark:border-[#3d4043] text-red-600 focus:ring-red-500">
                    <span class="ml-3 text-xs text-red-600 font-bold">EMERGENCY: Immediate lockdown. Disables all order checkout points.</span>
                </div>
            </div>
        `;
    }

    fieldsContainer.innerHTML = html;

    // Set specific page titles
    const titles = {
        student: { title: 'Student Portal Configuration', desc: 'Securely manage notifications, limits, and authentication PIN.' },
        staff: { title: 'Staff Operator Settings', desc: 'Modify POS counter configurations, order sound settings, and printer states.' },
        admin: { title: 'Central Administration Panel', desc: 'Adjust global security limits, automatic backups, and counter locks.' }
    };

    const roleTitleMap = titles[activeRole] || titles.student;
    document.getElementById('settings-title').textContent = roleTitleMap.title;
    document.getElementById('settings-subtitle').textContent = roleTitleMap.desc;
}

// setup cancel/back redirection
function setupNavigationRedirections() {
    const cancelBtn = document.getElementById('settings-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = backRedirectionUrl[activeRole] || './student.html';
        });
    }
}

// handle save submit
function handleSettingsSubmit(e) {
    e.preventDefault();

    // read values inside form
    const formData = new FormData(e.target);
    const settingsObj = {};

    for (let [key, val] of formData.entries()) {
        if (key === 'dispatch_notifications' || key === 'print_receipts' || key === 'sound_effects' || key === 'hourly_backups' || key === 'system_lock') {
            settingsObj[key] = true;
        } else {
            settingsObj[key] = val;
        }
    }

    // handle toggles not selected in FormData array
    const toggles = {
        student: ['dispatch_notifications'],
        staff: ['print_receipts', 'sound_effects'],
        admin: ['hourly_backups', 'system_lock']
    };

    const expectedToggles = toggles[activeRole] || [];
    expectedToggles.forEach(name => {
        if (!formData.has(name)) {
            settingsObj[name] = false;
        }
    });

    // save values in localStorage
    localStorage.setItem(`campuspay-config-${activeRole}`, JSON.stringify(settingsObj));

    showToast('Settings saved successfully! Redirecting...', 'success');

    // redirect to dashboard
    setTimeout(() => {
        window.location.href = backRedirectionUrl[activeRole] || './student.html';
    }, 1500);
}

// bind submit
document.getElementById('settings-form')?.addEventListener('submit', handleSettingsSubmit);

// theme toggle
function setupThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;

    themeBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
            localStorage.setItem('campuspay-theme', 'light');
        } else {
            document.documentElement.classList.remove('light');
            document.documentElement.classList.add('dark');
            localStorage.setItem('campuspay-theme', 'dark');
        }
    });
}

// mobile drawer controls
function setupMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('mobile-menu-close-btn');
    const overlay = document.getElementById('mobile-nav-overlay');
    const drawer = document.getElementById('mobile-nav');
    const drawerContent = document.getElementById('mobile-drawer-content');

    if (!menuBtn || !closeBtn || !drawer || !drawerContent) return;

    function openMenu() {
        drawer.classList.remove('hidden');
        setTimeout(() => {
            overlay.classList.add('opacity-100');
            drawerContent.classList.remove('-translate-x-full');
        }, 10);
    }

    function closeMenu() {
        overlay.classList.remove('opacity-100');
        drawerContent.classList.add('-translate-x-full');
        setTimeout(() => {
            drawer.classList.add('hidden');
        }, 300);
    }

    menuBtn.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);
    overlay?.addEventListener('click', closeMenu);
}

// initialize everything
window.addEventListener('DOMContentLoaded', () => {
    populateSidebar();
    injectSettingsFields();
    setupNavigationRedirections();
    setupThemeToggle();
    setupMobileMenu();
});
