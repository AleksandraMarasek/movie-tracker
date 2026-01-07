import { addToWatchlist } from '../storage/watchlist.js';
import { requireAuth } from '../services/authGuard.js';

export function attachWatchlistHandler(e) {
    if (!requireAuth()) return;

    addToWatchlist(e.detail.movie);
    console.log('Added to watchlist:', e.detail.movie.title);
}
