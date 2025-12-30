export function renderMovies(grid, items) {
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
