const CURRENT_KEY = 'app_current_user';

function getCookie(name) {
    const key = encodeURIComponent(name) + '=';
    const parts = document.cookie.split(';').map((s) => s.trim());
    for (const p of parts) {
        if (p.startsWith(key)) return decodeURIComponent(p.slice(key.length));
    }
    return null;
}

function parseJson(str) {
    try {
        return JSON.parse(str || 'null');
    } catch {
        return null;
    }
}

export function currentUser() {
    const fromSession = parseJson(sessionStorage.getItem(CURRENT_KEY));
    if (fromSession?.email) return fromSession;

    const remember = getCookie('mt_remember');
    if (remember === '0') return null;

    const fromLocal = parseJson(localStorage.getItem(CURRENT_KEY));
    if (fromLocal?.email) return fromLocal;

    return null;
}

export function isLoggedIn() {
    return !!currentUser();
}

export function requireAuth() {
    if (isLoggedIn()) return true;

    const next = encodeURIComponent(location.pathname + location.search);
    location.href = `/pages/login.html?next=${next}`;
    return false;
}
