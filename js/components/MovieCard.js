import { isFavorite } from '../storage/favorites.js';
import { requireAuth } from '../services/authGuard.js';

class MovieCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupEvents();
    }

    render() {
        const title = this.getAttribute('title');
        const rating = this.getAttribute('rating');
        const description = this.getAttribute('description');
        const poster = this.getAttribute('poster');

        const movieId = this.getAttribute('movie-id');
        const fav = isFavorite(movieId);

        this.shadowRoot.innerHTML = `
      <style>
        .card {
          width: 200px;
          font-family: 'Segoe UI', sans-serif;
          background: var(--surface-color, rgba(255,255,255,0.05));
          border-radius: 12px;
          padding: 10px;
          transition: 0.3s;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .card:hover { transform: translateY(-5px); background: rgba(255,255,255,0.1); }
        img { width: 100%; border-radius: 8px; aspect-ratio: 2/3; object-fit: cover; }
        h3 { font-size: 16px; margin: 10px 0 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .rating { color: #ffcc00; font-weight: bold; font-size: 14px; }
        .desc { font-size: 12px; color: #ccc; margin: 8px 0; flex-grow: 1; }

        .actions { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
        .heart { cursor: pointer; font-size: 20px; color: #888; transition: 0.3s; user-select: none; }
        .heart.active { color: #f2a4f5; }

        .more-btn {
          background: none;
          border: 1px solid #f2a4f5;
          color: #f2a4f5;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          cursor: pointer;
          text-transform: uppercase;
          font-weight: bold;
          transition: 0.3s;
        }
        .more-btn:hover { transform: translateY(-1px); filter: brightness(1.1); }
      </style>

      <div class="card">
        <img src="${poster}" alt="${title}">
        <h3>${title}</h3>
        <p class="rating">⭐ ${rating}</p>
        <p class="desc">${description}</p>
        <div class="actions">
          <span class="heart ${fav ? 'active' : ''}">
            ${fav ? '♥' : '♡'}
          </span>
          <button class="more-btn">Więcej</button>
        </div>
      </div>
    `;
    }

    setupEvents() {
        const heart = this.shadowRoot.querySelector('.heart');
        const moreBtn = this.shadowRoot.querySelector('.more-btn');

        heart.addEventListener('click', (e) => {
            e.stopPropagation();

            if (!requireAuth()) return;

            heart.classList.toggle('active');
            heart.textContent = heart.classList.contains('active') ? '♥' : '♡';

            this.dispatchEvent(
                new CustomEvent('toggle-favorite', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        movieId: this.getAttribute('movie-id'),
                    },
                })
            );
        });

        moreBtn.addEventListener('click', () => {
            this.dispatchEvent(
                new CustomEvent('open-details', {
                    bubbles: true,
                    composed: true,
                    detail: { movieId: this.getAttribute('movie-id') },
                })
            );
        });
    }
}

customElements.define('movie-card', MovieCard);
