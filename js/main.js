import { getHomeMovies } from './services/movieService.js';
import './components/MovieCard.js';

const grid = document.getElementById('movies-grid');

(async () => {
    grid.innerHTML = '';
    const movies = await getHomeMovies();

    movies.forEach((movie) => {
        const card = document.createElement('movie-card');
        card.setAttribute('movie-id', movie.imdbID);
        card.setAttribute('title', movie.Title);
        card.setAttribute('poster', movie.Poster);
        grid.appendChild(card);
    });
})();
