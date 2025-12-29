import {
    getHomeShows,
    searchShows,
    getShowDetails,
    getShowEpisodes,
    getShowCast,
} from './services/movieService.js';
import './components/MovieCard.js';

const form = document.querySelector('.search-form');
const input = document.querySelector('#search-input');
const grid = document.getElementById('movies-grid');

function renderCards(items) {
    grid.innerHTML = '';

    items.forEach((item) => {
        const card = document.createElement('movie-card');
        card.setAttribute('movie-id', item.id);
        card.setAttribute('title', item.title);
        card.setAttribute('poster', item.poster);
        card.setAttribute('rating', item.rating);
        card.setAttribute('description', item.description);
        grid.appendChild(card);
    });
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
    console.log('FAVORITE TOGGLE:', e.detail.movieId);
});

grid.addEventListener('open-details', async (e) => {
    const id = e.detail.movieId;

    const [details, episodes, cast] = await Promise.all([
        getShowDetails(id),
        getShowEpisodes(id),
        getShowCast(id),
    ]);

    console.log('DETAILS:', details);
    console.log(
        'EPISODES COUNT:',
        Array.isArray(episodes) ? episodes.length : 0
    );
    console.log(
        'CAST (first 5):',
        (cast || []).slice(0, 5).map((c) => c.person?.name)
    );
});
