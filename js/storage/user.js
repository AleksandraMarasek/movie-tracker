(function () {
    const CURRENT_KEY = 'app_current_user';
    const PROFILES_KEY = 'app_user_profiles';

    function setCookie(name, value, days = 30) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
            value
        )}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
    }

    function getCookie(name) {
        const key = encodeURIComponent(name) + '=';
        const parts = document.cookie.split(';').map((s) => s.trim());
        for (const p of parts) {
            if (p.startsWith(key))
                return decodeURIComponent(p.slice(key.length));
        }
        return null;
    }

    function deleteCookie(name) {
        document.cookie = `${encodeURIComponent(
            name
        )}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
    }

    window.CookieUtil = { set: setCookie, get: getCookie, del: deleteCookie };

    let mode = 'local';

    function setMode(nextMode) {
        mode = nextMode === 'session' ? 'session' : 'local';
    }

    function getMode() {
        return mode;
    }

    function getStore() {
        return mode === 'session' ? sessionStorage : localStorage;
    }

    function parseJson(str) {
        try {
            return JSON.parse(str || 'null');
        } catch {
            return null;
        }
    }

    function setCurrent(user) {
        getStore().setItem(CURRENT_KEY, JSON.stringify(user));

        (mode === 'session' ? localStorage : sessionStorage).removeItem(
            CURRENT_KEY
        );
    }

    function getCurrent() {
        const fromSession = parseJson(sessionStorage.getItem(CURRENT_KEY));
        if (fromSession?.email) return fromSession;

        const rememberCookie = window.CookieUtil?.get('mt_remember');
        if (rememberCookie === '0') return null;

        const fromLocal = parseJson(localStorage.getItem(CURRENT_KEY));
        if (fromLocal?.email) return fromLocal;

        return null;
    }

    function clearCurrent() {
        localStorage.removeItem(CURRENT_KEY);
        sessionStorage.removeItem(CURRENT_KEY);
    }

    function isLoggedIn() {
        const u = getCurrent();
        return !!(u && u.email);
    }

    function updateCurrent(patch) {
        const u = getCurrent();
        if (!u) return null;

        const next = { ...u, ...patch };

        if (sessionStorage.getItem(CURRENT_KEY)) {
            sessionStorage.setItem(CURRENT_KEY, JSON.stringify(next));
        } else if (localStorage.getItem(CURRENT_KEY)) {
            localStorage.setItem(CURRENT_KEY, JSON.stringify(next));
        } else {
            setCurrent(next);
        }
        return next;
    }

    function getProfilesMap() {
        try {
            return JSON.parse(localStorage.getItem(PROFILES_KEY) || '{}');
        } catch {
            return {};
        }
    }

    function setProfilesMap(map) {
        localStorage.setItem(PROFILES_KEY, JSON.stringify(map));
    }

    function getPrefs(email) {
        if (!email) return {};
        const map = getProfilesMap();
        return map[email.toLowerCase()] || {};
    }

    function updatePrefs(email, patch) {
        if (!email) return {};
        const key = email.toLowerCase();
        const map = getProfilesMap();
        const next = { ...(map[key] || {}), ...patch };
        map[key] = next;
        setProfilesMap(map);
        return next;
    }

    window.UserStorage = {
        setMode,
        getMode,

        set: setCurrent,
        get: getCurrent,
        clear: clearCurrent,
        isLoggedIn,
        update: updateCurrent,

        getPrefs,
        updatePrefs,
    };
})();
