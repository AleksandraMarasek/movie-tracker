const STORAGE_KEY = 'theme';

export function initThemeToggle() {
    const root = document.documentElement;
    const checkbox = document.getElementById('themeToggle');

    if (!checkbox) return;

    const savedTheme =
        localStorage.getItem(STORAGE_KEY) ||
        (window.matchMedia('(prefers-color-scheme: light)').matches
            ? 'dark'
            : 'light');

    setTheme(savedTheme);

    checkbox.addEventListener('change', () => {
        const theme = checkbox.checked ? 'dark' : 'light';
        setTheme(theme);
    });

    function setTheme(theme) {
        root.dataset.theme = theme;
        localStorage.setItem(STORAGE_KEY, theme);

        checkbox.checked = theme === 'dark';
    }
}
