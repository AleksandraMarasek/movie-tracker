import { movies } from './data/movies.mock.js';
import './components/MovieCard.js';

const grid = document.getElementById('movies-grid');

movies.forEach((movie) => {
    const card = document.createElement('movie-card');

    card.setAttribute('movie-id', movie.id);
    card.setAttribute('title', movie.title);
    card.setAttribute('rating', movie.rating);
    card.setAttribute('description', movie.description);
    card.setAttribute('poster', movie.poster);

    card.addEventListener('toggle-favorite', (e) => {
        console.log('Ulubiony film ID:', e.detail.movieId);
    });

    grid.appendChild(card);
});
