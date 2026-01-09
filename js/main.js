import { getHomeShows, searchShows } from './services/movieService.js';
import './components/MovieCard.js';
import './components/MovieDetails.js';
import { renderMovies } from './utils/renderMovies.js';
import { handleToggleFavorite } from './handlers/favoriteHandler.js';
import { attachMovieDetailsHandler } from './handlers/movieDetailsHandler.js';
import { attachWatchlistHandler } from './handlers/watchlistHandler.js';
import { initMenuA11y } from './utils/menuA11y.js';
import { initThemeToggle } from './utils/themeToggle.js';

const form = document.querySelector('.search-form');
const input = document.querySelector('#search-input');
const grid = document.getElementById('movies-grid');

const genreSelect = document.getElementById('genre-filter');
const yearSelect = document.getElementById('year-filter');

let lastItems = [];

grid.addEventListener('open-details', async (e) => {
    attachMovieDetailsHandler(e);
});

document.addEventListener('add-to-watchlist', (e) => {
    attachWatchlistHandler(e);
});

grid.addEventListener('toggle-favorite', (e) => {
    handleToggleFavorite(e);
});

function normalizeGenreValue(v) {
    if (!v) return null;
    if (v === 'action') return 'Action';
    if (v === 'drama') return 'Drama';
    if (v === 'sci-fi') return 'Science-Fiction';
    return null;
}

function applyFilters(items) {
    let out = [...items];

    const gVal = genreSelect?.value || '';
    const yVal = yearSelect?.value || '';

    const wantedGenre = normalizeGenreValue(gVal);

    if (wantedGenre) {
        out = out.filter(
            (m) => Array.isArray(m.genres) && m.genres.includes(wantedGenre)
        );
    }

    if (yVal) {
        if (yVal === 'older') {
            out = out.filter(
                (m) => typeof m.year === 'number' && m.year <= 2022
            );
        } else {
            const yNum = Number(yVal);
            out = out.filter(
                (m) => typeof m.year === 'number' && m.year === yNum
            );
        }
    }

    return out;
}

function renderCards(items) {
    grid.innerHTML = '';
    renderMovies(grid, items);
}

function renderFromLast() {
    renderCards(applyFilters(lastItems));
}

document.addEventListener('DOMContentLoaded', async () => {
    lastItems = await getHomeShows(50);
    renderFromLast();

    const container = document.getElementById('header-container');
    if (!container) return;

    const response = await fetch('/header.html');
    const html = await response.text();
    container.innerHTML = html;
    initMenuA11y();
    initThemeToggle();

    const header = document.getElementById('myHeader');
    const page = document.getElementById('page');
    const openMenuButton = document.getElementById('openmenu');

    window.addEventListener('scroll', () => {
        page.classList.remove('menuopen');
        if (window.scrollY >= 100) header.classList.add('sticky');
        else header.classList.remove('sticky');
    });

    openMenuButton.addEventListener('click', () => {
        header.classList.remove('sticky');
        page.classList.toggle('menuopen');
    });
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const q = (input?.value || '').trim();

    if (q) lastItems = await searchShows(q);
    else lastItems = await getHomeShows(50);

    renderFromLast();
});

genreSelect?.addEventListener('change', renderFromLast);
yearSelect?.addEventListener('change', renderFromLast);
