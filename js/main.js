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
let searchTimeout = null;
let searchController = null;

function showStatus(message, isError = false) {
    grid.innerHTML = `
        <div class="status-info ${
            isError ? 'error' : ''
        }" style="grid-column: 1/-1; text-align: center; padding: 3rem; opacity: 0.7;">
            <p>${message}</p>
        </div>
    `;
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.style = `
        position: fixed; bottom: 20px; right: 20px; background: var(--accent-color);
        color: black; padding: 12px 24px; border-radius: 8px; font-weight: bold;
        z-index: 9999; transition: opacity 0.5s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function normalizeGenreValue(v) {
    if (!v) return null;
    const mapping = {
        action: 'Action',
        drama: 'Drama',
        'sci-fi': 'Science-Fiction',
    };
    return mapping[v] || null;
}

function applyFilters(items) {
    let out = [...items];
    const wantedGenre = normalizeGenreValue(genreSelect?.value);
    const yVal = yearSelect?.value;

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
            out = out.filter(
                (m) => typeof m.year === 'number' && m.year === Number(yVal)
            );
        }
    }
    return out;
}

function renderCards(items) {
    grid.innerHTML = '';
    if (items.length === 0) {
        showStatus('No movies found that matched the search criteria.');
        return;
    }
    renderMovies(grid, items);
}

const renderFromLast = () => renderCards(applyFilters(lastItems));

async function fetchAndRender(query = '') {
    if (searchController) searchController.abort();
    searchController = new AbortController();

    showStatus('Ładowanie filmów...');

    try {
        if (query) {
            lastItems = await searchShows(query, searchController.signal);
        } else {
            lastItems = await getHomeShows(50);
        }
        renderFromLast();

        const loader = document.getElementById('app-loader');
        if (loader && !loader.classList.contains('hidden')) {
            setTimeout(() => loader.classList.add('hidden'), 1500);
        }
    } catch (error) {
        if (error.name === 'AbortError') return;
        showStatus('Error fetching data. Try again later.', true);
        console.error('Fetch Error:', error);

        document.getElementById('app-loader')?.classList.add('hidden');
    }
}

input?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const q = e.target.value.trim();
    searchTimeout = setTimeout(() => fetchAndRender(q), 400);
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearTimeout(searchTimeout);
    fetchAndRender(input?.value.trim());
});

grid.addEventListener('open-details', attachMovieDetailsHandler);
grid.addEventListener('toggle-favorite', handleToggleFavorite);

document.addEventListener('add-to-watchlist', (e) => {
    attachWatchlistHandler(e);
    showToast(`Added "${e.detail.movie.title}" to watchlist`);
});

genreSelect?.addEventListener('change', renderFromLast);
yearSelect?.addEventListener('change', renderFromLast);

document.addEventListener('DOMContentLoaded', async () => {
    fetchAndRender();

    const container = document.getElementById('header-container');
    if (!container) return;

    try {
        const response = await fetch('/header.html');
        if (!response.ok) throw new Error('Failed to fetch header');

        const html = await response.text();
        container.innerHTML = html;

        initMenuA11y();
        initThemeToggle();

        const header = document.getElementById('myHeader');
        const page = document.getElementById('page');
        const openMenuButton = document.getElementById('openmenu');

        window.addEventListener('scroll', () => {
            page.classList.remove('menuopen');
            if (header)
                header.classList.toggle('sticky', window.scrollY >= 100);
        });

        openMenuButton?.addEventListener('click', () => {
            if (header) header.classList.remove('sticky');
            page?.classList.toggle('menuopen');
        });
    } catch (err) {
        console.error('Error loading header:', err);
    }
});
