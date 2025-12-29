(function () {
    const CURRENT_KEY = 'app_current_user';
    const PROFILES_KEY = 'app_user_profiles';

    function setCurrent(user) {
        localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
    }

    function getCurrent() {
        try {
            return JSON.parse(localStorage.getItem(CURRENT_KEY) || 'null');
        } catch {
            return null;
        }
    }

    function clearCurrent() {
        localStorage.removeItem(CURRENT_KEY);
    }

    function isLoggedIn() {
        const u = getCurrent();
        return !!(u && u.email);
    }

    function updateCurrent(patch) {
        const u = getCurrent();
        if (!u) return null;
        const next = { ...u, ...patch };
        setCurrent(next);
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
        set: setCurrent,
        get: getCurrent,
        clear: clearCurrent,
        isLoggedIn,
        update: updateCurrent,
        getPrefs,
        updatePrefs,
    };
})();
