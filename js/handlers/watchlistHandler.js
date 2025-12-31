import { addToWatchlist } from '../storage/watchlist.js';

export function attachWatchlistHandler(e) {
    addToWatchlist(e.detail.movie);
    console.log('Added to watchlist:', e.detail.movie.title);
}
