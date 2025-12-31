import {
    getHomeShows,
    searchShows,
    getShowDetails,
    getShowEpisodes,
    getShowCast,
} from './services/movieService.js';
import './components/MovieCard.js';
import './components/MovieDetails.js';
import { renderMovies } from './utils/renderMovies.js';
import { handleToggleFavorite } from './handlers/favoriteHandler.js';
import { addToWatchlist } from './storage/watchlist.js';

const form = document.querySelector('.search-form');
const input = document.querySelector('#search-input');
const grid = document.getElementById('movies-grid');

function renderCards(items) {
    grid.innerHTML = '';

    renderMovies(grid, items);
}

document.addEventListener('DOMContentLoaded', async () => {
    const items = await getHomeShows(50);
    renderCards(items);
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const items = await searchShows(input.value);
    renderCards(items);
});

grid.addEventListener('toggle-favorite', (e) => {
    handleToggleFavorite(e);
});

grid.addEventListener('open-details', async (e) => {
    const id = e.detail.movieId;

    try {
        const details = await getShowDetails(id);

        const detailsElement = document.createElement('movie-details');
        detailsElement.data = details;
        document.body.appendChild(detailsElement);
    } catch (error) {
        console.error('Błąd pobierania danych:', error);
    }
});

document.addEventListener('add-to-watchlist', (e) => {
    addToWatchlist(e.detail.movie);
    console.log('Added to watchlist:', e.detail.movie.title);
});

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('header-container');
    if (!container) return;

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
});
