import './components/MovieCard.js';
import { getFavorites, toggleFavorite } from './storage/favorites.js';
import { renderMovies } from './utils/renderMovies.js';
import { handleToggleFavorite } from './handlers/favoriteHandler.js';

const grid = document.getElementById('movies-grid');
const emptyState = document.getElementById('empty-state');

function render() {
    const favorites = getFavorites();

    if (favorites.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    renderMovies(grid, favorites);
}

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('header-container');
    if (container) {
        const response = await fetch('/header.html');
        const html = await response.text();
        container.innerHTML = html;

        const header = document.getElementById('myHeader');
        const page = document.getElementById('page');
        const openMenuButton = document.getElementById('openmenu');

        window.addEventListener('scroll', () => {
            page.classList.remove('menuopen');
            if (window.scrollY >= 100) {
                header.classList.add('sticky');
            } else {
                header.classList.remove('sticky');
            }
        });

        openMenuButton.addEventListener('click', () => {
            header.classList.remove('sticky');
            page.classList.toggle('menuopen');
        });
    }

    render();
});

grid.addEventListener('toggle-favorite', (e) => {
    handleToggleFavorite(e, {
        onAfterToggle: render,
    });
});
