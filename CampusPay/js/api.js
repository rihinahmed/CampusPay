// ─── CampusPay API Client Utility ────────────────────────────────
// Shared across all frontend pages.

const API_BASE = 'http://127.0.0.1:5000/api';

// ─── Token Management ─────────────────────────────────────────────
const Auth = {
    getToken: () => localStorage.getItem('campuspay-token'),
    setToken: (token) => localStorage.setItem('campuspay-token', token),
    removeToken: () => localStorage.removeItem('campuspay-token'),
    getUser: () => {
        try {
            return JSON.parse(localStorage.getItem('campuspay-user')) || null;
        } catch { return null; }
    },
    setUser: (user) => localStorage.setItem('campuspay-user', JSON.stringify(user)),
    removeUser: () => localStorage.removeItem('campuspay-user'),
    logout: () => {
        Auth.removeToken();
        Auth.removeUser();
        localStorage.removeItem('campuspay-active-order');
    },
    isLoggedIn: () => !!Auth.getToken(),
};

// ─── HTTP Helper ──────────────────────────────────────────────────
const api = {
    async request(method, endpoint, body = null, options = {}) {
        const token = Auth.getToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const config = {
            method,
            headers,
            ...options,
        };

        if (body && !(body instanceof FormData)) {
            config.body = JSON.stringify(body);
        } else if (body instanceof FormData) {
            delete headers['Content-Type']; // Let browser set multipart
            config.body = body;
        }

        try {
            const res = await fetch(`${API_BASE}${endpoint}`, config);
            const data = await res.json();

            if (!res.ok) {
                throw { status: res.status, message: data.message, errors: data.errors };
            }

            return data;
        } catch (err) {
            if (err.status === 401) {
                // Token expired — force logout
                Auth.logout();
                window.location.href = '../html/index.html';
            }
            throw err;
        }
    },

    get: (endpoint) => api.request('GET', endpoint),
    post: (endpoint, body) => api.request('POST', endpoint, body),
    put: (endpoint, body) => api.request('PUT', endpoint, body),
    delete: (endpoint) => api.request('DELETE', endpoint),
};

window.API_BASE = API_BASE;
window.Auth = Auth;
window.api = api;
