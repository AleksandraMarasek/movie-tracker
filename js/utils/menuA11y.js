import { trapFocus } from './focusTrap.js';

export function initMenuA11y() {
    const header = document.getElementById('myHeader');
    const page = document.getElementById('page');
    const nav = header?.querySelector('.main-nav');
    const btn = document.getElementById('openmenu');

    if (!header || !page || !nav || !btn) return;

    btn.type = 'button';
    btn.setAttribute('aria-label', 'Menu');
    btn.setAttribute('aria-expanded', 'false');

    let cleanup = null;

    const setOpen = (open) => {
        page.classList.toggle('menuopen', open);
        btn.setAttribute('aria-expanded', String(open));

        if (open) {
            page.setAttribute('aria-hidden', 'true');
            cleanup = trapFocus(nav, { initialFocus: btn });
            btn.focus();
        } else {
            page.removeAttribute('aria-hidden');
            if (cleanup) cleanup();
            cleanup = null;
            btn.focus();
        }
    };

    btn.addEventListener('click', () => {
        header.classList.remove('sticky');
        setOpen(!page.classList.contains('menuopen'));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && page.classList.contains('menuopen')) {
            setOpen(false);
        }
    });
}
