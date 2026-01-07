(function () {
    const USERS_URL = () =>
        (location.pathname.includes('/pages/') ? '..' : '.') +
        '/js/data/users.json';

    let cachedUsers = null;

    async function loadUsers() {
        if (cachedUsers) return cachedUsers;

        const res = await fetch(USERS_URL(), { cache: 'no-store' });
        if (!res.ok) throw new Error('Nie mogę wczytać users.json');

        const data = await res.json();
        if (!Array.isArray(data))
            throw new Error('users.json musi być tablicą');

        cachedUsers = data;
        return cachedUsers;
    }

    function sanitizeUser(user) {
        const { password, ...safe } = user;
        return safe;
    }

    async function login(email, password, remember = true) {
        const users = await loadUsers();

        const e = (email || '').trim().toLowerCase();
        const p = password || '';

        const found = users.find(
            (u) =>
                (u.email || '').toLowerCase() === e && (u.password || '') === p
        );

        if (!found)
            return { ok: false, error: 'Nieprawidłowy email lub hasło.' };

        if (window.CookieUtil)
            window.CookieUtil.set('mt_remember', remember ? '1' : '0', 30);

        window.UserStorage.setMode(remember ? 'local' : 'session');

        const baseUser = sanitizeUser({
            ...found,
            lastLoginAt: new Date().toISOString(),
        });

        const prefs = window.UserStorage.getPrefs(baseUser.email);
        const user = { ...baseUser, ...prefs };

        window.UserStorage.set(user);

        if (!remember) {
            localStorage.removeItem('app_current_user');
        }

        return { ok: true, user };
    }

    function logout() {
        window.UserStorage.clear();
    }

    function currentUser() {
        return window.UserStorage.get();
    }

    function getNextUrl(fallbackAccountUrl) {
        const params = new URLSearchParams(location.search);
        return params.get('next') || fallbackAccountUrl;
    }

    function requireAuth(loginUrl) {
        if (window.UserStorage.isLoggedIn()) return true;

        const next = encodeURIComponent(location.pathname);
        location.href = `${loginUrl}?next=${next}`;
        return false;
    }

    window.AuthService = {
        loadUsers,
        login,
        logout,
        currentUser,
        getNextUrl,
        requireAuth,
    };
})();
