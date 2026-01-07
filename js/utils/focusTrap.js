const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusable(root) {
    return Array.from(root.querySelectorAll(FOCUSABLE)).filter((el) => {
        const style = window.getComputedStyle(el);
        return (
            style.visibility !== 'hidden' &&
            style.display !== 'none' &&
            !el.hasAttribute('hidden')
        );
    });
}

function getActiveElement(root) {
    const rn = root.getRootNode?.();
    if (rn && 'activeElement' in rn && rn.activeElement)
        return rn.activeElement;
    return document.activeElement;
}

export function trapFocus(root, { initialFocus } = {}) {
    if (!root) return () => {};

    const previouslyFocused = document.activeElement;

    function focusFirst() {
        const focusables = getFocusable(root);
        const target =
            typeof initialFocus === 'string'
                ? root.querySelector(initialFocus)
                : initialFocus;

        (target || focusables[0] || root).focus?.();
    }

    function onKeyDown(e) {
        if (e.key !== 'Tab') return;

        const focusables = getFocusable(root);
        if (focusables.length === 0) {
            e.preventDefault();
            return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = getActiveElement(root);

        if (active && !root.contains(active)) {
            e.preventDefault();
            (e.shiftKey ? last : first).focus();
            return;
        }

        if (e.shiftKey && active === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && active === last) {
            e.preventDefault();
            first.focus();
        }
    }

    root.addEventListener('keydown', onKeyDown);

    setTimeout(focusFirst, 0);

    return () => {
        root.removeEventListener('keydown', onKeyDown);
        previouslyFocused?.focus?.();
    };
}
