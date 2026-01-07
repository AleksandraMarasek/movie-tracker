import { toggleFavorite } from '../storage/favorites.js';
import { requireAuth } from '../services/authGuard.js';

export function handleToggleFavorite(e, { onAfterToggle } = {}) {
    if (!requireAuth()) return;

    const card = e.target.closest('movie-card');
    if (!card) return;

    const movie = {
        id: card.getAttribute('movie-id'),
        title: card.getAttribute('title'),
        poster: card.getAttribute('poster'),
        rating: card.getAttribute('rating'),
        description: card.getAttribute('description'),
    };

    toggleFavorite(movie);

    if (typeof onAfterToggle === 'function') {
        onAfterToggle(movie);
    }
}
