import './components/MovieCard.js';
import { getFavorites } from './storage/favorites.js';
import { renderMovies } from './utils/renderMovies.js';
import { handleToggleFavorite } from './handlers/favoriteHandler.js';
import { attachMovieDetailsHandler } from './handlers/movieDetailsHandler.js';
import { attachWatchlistHandler } from './handlers/watchlistHandler.js';
import { initMenuA11y } from './utils/menuA11y.js';
import { initThemeToggle } from './utils/themeToggle.js';
import { getHomeShows } from './services/movieService.js';
import { subscribe } from './store/store.js';
import { isLoggedIn } from './services/authGuard.js';

const grid = document.getElementById('movies-grid');
const emptyState = document.getElementById('empty-state');
const guestView = document.getElementById('guest-view');
const authView = document.getElementById('auth-view');

async function renderGuestCarousel() {
    const spinContainer = document.getElementById('spin-container');
    if (!spinContainer || spinContainer.children.length > 0) return;

    try {
        const movies = await getHomeShows(8);
        movies.forEach((movie, i) => {
            const img = document.createElement('img');
            img.src = movie.poster;
            img.alt = movie.title;
            img.style.transform = `rotateY(${
                i * (360 / movies.length)
            }deg) translateZ(350px)`;
            spinContainer.appendChild(img);
        });
        initCarouselAnimation();
    } catch (err) {
        console.error(err);
    }
}

function initCarouselAnimation() {
    const spinContainer = document.getElementById('spin-container');
    let rotateDeg = 0;
    spinContainer.style.width = '190px';
    spinContainer.style.height = '270px';

    function animate() {
        rotateDeg += 0.2;
        spinContainer.style.transform = `rotateY(${rotateDeg}deg)`;
        requestAnimationFrame(animate);
    }
    animate();
}

function render() {
    const logged = isLoggedIn();

    if (logged) {
        guestView.classList.add('hidden');
        authView.classList.remove('hidden');

        const favorites = getFavorites();
        if (favorites.length === 0) {
            grid.innerHTML = '';
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            renderMovies(grid, favorites);
        }
    } else {
        guestView.classList.remove('hidden');
        authView.classList.add('hidden');
        renderGuestCarousel();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('header-container');
    if (container) {
        try {
            const response = await fetch('/header.html');
            const html = await response.text();
            container.innerHTML = html;
            initMenuA11y();
            initThemeToggle();

            const header = document.getElementById('myHeader');
            const page = document.getElementById('page');
            const openMenuButton = document.getElementById('openmenu');

            window.addEventListener('scroll', () => {
                if (page) page.classList.remove('menuopen');
                if (header) {
                    if (window.scrollY >= 100) header.classList.add('sticky');
                    else header.classList.remove('sticky');
                }
            });

            openMenuButton?.addEventListener('click', () => {
                header?.classList.remove('sticky');
                page?.classList.toggle('menuopen');
            });
        } catch (err) {
            console.error(err);
        }
    }

    render();
    subscribe(() => render());
});

grid.addEventListener('toggle-favorite', (e) => handleToggleFavorite(e));
grid.addEventListener('open-details', (e) => attachMovieDetailsHandler(e));
document.addEventListener('add-to-watchlist', (e) => attachWatchlistHandler(e));
