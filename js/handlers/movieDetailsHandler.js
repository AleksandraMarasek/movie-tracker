import { getShowDetails } from '../services/movieService.js';
import '../components/MovieDetails.js';

export async function attachMovieDetailsHandler(e) {
    const id = e.detail.movieId;

    try {
        const details = await getShowDetails(id);

        const detailsElement = document.createElement('movie-details');
        detailsElement.data = details;
        document.body.appendChild(detailsElement);
    } catch (error) {
        console.error('Błąd pobierania szczegółów filmu:', error);
    }
}
