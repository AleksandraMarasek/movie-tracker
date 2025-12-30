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

document.addEventListener('DOMContentLoaded', render);

grid.addEventListener('toggle-favorite', (e) => {
    handleToggleFavorite(e, {
        onAfterToggle: render,
    });
});
