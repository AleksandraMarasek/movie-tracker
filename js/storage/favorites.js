const KEY = 'favorites';

export function getFavorites() {
    const data = JSON.parse(localStorage.getItem(KEY)) || [];

    return data.filter(
        (item) =>
            typeof item === 'object' &&
            item !== null &&
            'id' in item &&
            'title' in item
    );
}

export function isFavorite(id) {
    return getFavorites().some((m) => m.id === id);
}

export function toggleFavorite(movie) {
    const favorites = getFavorites();
    const exists = favorites.find((m) => m.id === movie.id);

    const updated = exists
        ? favorites.filter((m) => m.id !== movie.id)
        : [...favorites, movie];

    localStorage.setItem(KEY, JSON.stringify(updated));
    return updated;
}
