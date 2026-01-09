import './components/MovieCard.js';
import {
    getWatchlist,
    moveToWatched,
    removeFromWatchlist,
} from './storage/watchlist.js';
import { handleToggleFavorite } from './handlers/favoriteHandler.js';
import { initMenuA11y } from './utils/menuA11y.js';
import { subscribe } from './store/store.js';
import { initThemeToggle } from './utils/themeToggle.js';
import { isLoggedIn } from './services/authGuard.js';
import { getHomeShows } from './services/movieService.js';

const pendingGrid = document.getElementById('pending-grid');
const watchedGrid = document.getElementById('watched-grid');
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

function createWatchlistItem(movie, isPending) {
    const wrapper = document.createElement('div');
    wrapper.className = 'watchlist-item-wrapper';
    const card = document.createElement('movie-card');
    card.setAttribute('movie-id', movie.id);
    card.setAttribute('title', movie.title);
    card.setAttribute('poster', movie.poster);
    card.setAttribute('rating', movie.rating);
    card.setAttribute('description', movie.description);

    const actions = document.createElement('div');
    actions.className = 'watchlist-actions';

    if (isPending) {
        const moveBtn = document.createElement('button');
        moveBtn.className = 'action-btn move';
        moveBtn.textContent = 'Obejrzane';
        moveBtn.onclick = () => moveToWatched(movie.id);
        actions.appendChild(moveBtn);
    }

    const removeBtn = document.createElement('button');
    removeBtn.className = 'action-btn';
    removeBtn.textContent = 'Usuń';
    removeBtn.onclick = () =>
        removeFromWatchlist(movie.id, isPending ? 'pending' : 'watched');

    actions.appendChild(removeBtn);
    wrapper.append(card, actions);
    return wrapper;
}

function render() {
    const logged = isLoggedIn();

    if (logged) {
        guestView.classList.add('hidden');
        authView.classList.remove('hidden');
        const { pending, watched } = getWatchlist();
        pendingGrid.innerHTML = '';
        watchedGrid.innerHTML = '';
        pending.forEach((m) =>
            pendingGrid.appendChild(createWatchlistItem(m, true))
        );
        watched.forEach((m) =>
            watchedGrid.appendChild(createWatchlistItem(m, false))
        );
    } else {
        guestView.classList.remove('hidden');
        authView.classList.add('hidden');
        renderGuestCarousel();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const headerCont = document.getElementById('header-container');
    if (headerCont) {
        const res = await fetch('/header.html');
        headerCont.innerHTML = await res.text();
        initMenuA11y();
        initThemeToggle();
        const btn = document.getElementById('openmenu');
        const pg = document.getElementById('page');
        if (btn) btn.onclick = () => pg.classList.toggle('menuopen');
    }

    render();
    subscribe(() => render());
});

pendingGrid.addEventListener('toggle-favorite', (e) => handleToggleFavorite(e));
watchedGrid.addEventListener('toggle-favorite', (e) => handleToggleFavorite(e));
