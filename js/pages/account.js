(function () {
    if (!window.AuthService || !window.UserStorage) return;
    if (!window.AuthService.requireAuth('../pages/login.html')) return;

    const user = window.AuthService.currentUser();
    const $ = (sel) => document.querySelector(sel);

    const name =
        user?.name || (user?.email ? user.email.split('@')[0] : 'Użytkownik');
    const email = user?.email || '—';
    const kontoOd = user?.kontoOd || '—';
    const lastLogin = user?.lastLoginAt
        ? new Date(user.lastLoginAt).toLocaleString('pl-PL')
        : '—';

    $('[data-user-name]').textContent = name;
    $('[data-user-email]').textContent = email;
    $('[data-user-since]').textContent = kontoOd;
    $('[data-last-login]').textContent = lastLogin;

    function setCountsFromStore() {
        if (!window.AppStore) return;

        const st = window.AppStore.getState();
        const favCount = Array.isArray(st.favorites) ? st.favorites.length : 0;
        const wl = st.watchlist || { pending: [], watched: [] };
        const watchCount =
            (Array.isArray(wl.pending) ? wl.pending.length : 0) +
            (Array.isArray(wl.watched) ? wl.watched.length : 0);

        $('#favCount').textContent = String(favCount);
        $('#watchCount').textContent = String(watchCount);
    }
    function setCountsFallback() {
        const safeArrLen = (key) => {
            try {
                const v = JSON.parse(localStorage.getItem(key) || '[]');
                return Array.isArray(v) ? v.length : 0;
            } catch {
                return 0;
            }
        };

        $('#favCount').textContent = String(safeArrLen('favorites'));

        try {
            const w = JSON.parse(
                localStorage.getItem('movie_tracker_watchlist') || '{}'
            );
            const pending = Array.isArray(w?.pending) ? w.pending.length : 0;
            const watched = Array.isArray(w?.watched) ? w.watched.length : 0;
            $('#watchCount').textContent = String(pending + watched);
        } catch {
            $('#watchCount').textContent = '0';
        }
    }

    if (window.AppStore) {
        setCountsFromStore();
        window.AppStore.subscribe(() => setCountsFromStore());
    } else {
        setCountsFallback();
    }

    const logoutBtn = $('[data-logout]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.AuthService.logout();
            location.href = '../pages/login.html';
        });
    }

    const avatarEl = $('[data-avatar]');
    const modal = $('[data-modal]');
    const avatarsWrap = $('[data-avatars]');
    const openBtn = $('[data-open-avatar]');

    const AVAILABLE = [
        '../js/data/img/profile1.jpg',
        '../js/data/img/profile2.jpg',
        '../js/data/img/profile3.jpg',
    ];

    function currentAvatar() {
        return (
            user?.profilePic ||
            window.UserStorage.getPrefs(email).profilePic ||
            AVAILABLE[0]
        );
    }

    function setAvatar(src) {
        if (avatarEl) avatarEl.src = src;
        window.UserStorage.updatePrefs(email, { profilePic: src });
        window.UserStorage.update({ profilePic: src });
    }

    setAvatar(currentAvatar());

    function openModal() {
        if (!modal || !avatarsWrap) return;

        modal.hidden = false;
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modalOpen');

        const selected = currentAvatar();
        avatarsWrap.innerHTML = AVAILABLE.map((src) => {
            const isActive = src === selected ? ' is-active' : '';
            return `
        <button class="avatarPick${isActive}" type="button" data-pick="${src}">
          <img src="${src}" alt="Avatar" />
        </button>
      `;
        }).join('');

        avatarsWrap.querySelectorAll('[data-pick]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const src = btn.getAttribute('data-pick');
                setAvatar(src);
                closeModal();
            });
        });
    }

    function closeModal() {
        if (!modal) return;

        modal.hidden = true;
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modalOpen');
    }

    if (openBtn) openBtn.addEventListener('click', openModal);

    if (modal) {
        modal.querySelectorAll('[data-close]').forEach((el) => {
            el.addEventListener('click', closeModal);
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
    });
})();
