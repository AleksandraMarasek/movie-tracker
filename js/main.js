import { searchMovies } from './services/movieService.js';
import './components/MovieCard.js';

const form = document.querySelector('.search-form');
const input = document.querySelector('#search-input');
const grid = document.getElementById('movies-grid');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    grid.innerHTML = '';

    const movies = await searchMovies(input.value);

    movies.forEach((movie) => {
        const card = document.createElement('movie-card');

        card.setAttribute('movie-id', movie.imdbID);
        card.setAttribute('title', movie.Title);
        card.setAttribute('poster', movie.Poster);

        grid.appendChild(card);
    });
});
