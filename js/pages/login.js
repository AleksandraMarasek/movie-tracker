(function () {
    const form = document.querySelector('form.form');
    if (!form) return;

    if (window.UserStorage.isLoggedIn()) {
        location.href = window.AuthService.getNextUrl('../pages/account.html');
        return;
    }

    const email = form.querySelector('input[name="email"]');
    const pass = form.querySelector('input[name="password"]');
    const rememberBox = form.querySelector('input[name="remember"]');

    if (rememberBox && window.CookieUtil) {
        const v = window.CookieUtil.get('mt_remember');
        if (v === '0') rememberBox.checked = false;
        if (v === '1') rememberBox.checked = true;
    }

    const logoImg = document.querySelector('.brand__logo img');
    const logoMark = document.querySelector('.brand__logoMark');
    if (logoImg && logoImg.getAttribute('src') && logoMark)
        logoMark.style.display = 'none';

    function setError(input, msg) {
        const field = input.closest('.field');
        if (!field) return;
        field.classList.toggle('is-invalid', !!msg);

        const hint = field.querySelector('.field__hint');
        if (!hint) return;

        if (msg) {
            hint.textContent = msg;
            hint.style.display = 'block';
        } else {
            hint.textContent = hint.getAttribute('data-default') || '';
            hint.style.display = 'none';
        }
    }

    function validate() {
        let ok = true;

        const e = (email.value || '').trim();
        if (!e) {
            setError(email, 'Podaj adres e-mail.');
            ok = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
            setError(email, 'Wpisz poprawny adres e-mail.');
            ok = false;
        } else {
            setError(email, '');
        }

        const p = pass.value || '';
        if (!p) {
            setError(pass, 'Hasło jest wymagane.');
            ok = false;
        } else {
            setError(pass, '');
        }

        return ok;
    }

    form.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        if (!validate()) return;

        const remember = !!rememberBox?.checked;

        const res = await window.AuthService.login(
            email.value,
            pass.value,
            remember
        );
        if (!res.ok) {
            setError(pass, res.error);
            return;
        }

        location.href = window.AuthService.getNextUrl('../pages/account.html');
    });

    form.addEventListener('blur', validate, true);
    form.addEventListener('input', () => {
        if (form.querySelector('.is-invalid')) validate();
    });
})();
