import { requireAuth } from '../services/authGuard.js';
import { isFavorite, subscribe } from '../store/store.js';

class MovieCard extends HTMLElement {
    static get observedAttributes() {
        return ['movie-id', 'title', 'rating', 'description', 'poster'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._unsubscribe = null;
    }

    connectedCallback() {
        this.render();
        this.setupEvents();

        if (!this._unsubscribe) {
            this._unsubscribe = subscribe(() => this.updateHeart());
        }
    }

    disconnectedCallback() {
        if (this._unsubscribe) {
            this._unsubscribe();
            this._unsubscribe = null;
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        if (this.isConnected) {
            this.render();
            this.setupEvents();
        }
    }

    set movie(data) {
        if (!data) return;
        this.setAttribute('movie-id', String(data.id ?? ''));
        this.setAttribute('title', String(data.title ?? ''));
        this.setAttribute('rating', String(data.rating ?? '—'));
        this.setAttribute('description', String(data.description ?? ''));
        this.setAttribute('poster', String(data.poster ?? ''));
    }

    get movieId() {
        return this.getAttribute('movie-id');
    }

    updateHeart() {
        const heart = this.shadowRoot?.querySelector('.heart');
        if (!heart) return;

        const fav = isFavorite(this.movieId);
        heart.classList.toggle('active', fav);
        heart.textContent = fav ? '♥' : '♡';
    }

    render() {
        const title = this.getAttribute('title') || '';
        const rating = this.getAttribute('rating') || '—';
        const description = this.getAttribute('description') || '';
        const poster = this.getAttribute('poster') || '';

        const posterMedium = this.getAttribute('poster') || '';
        const posterOriginal =
            this.getAttribute('poster-original') || posterMedium;

        const fav = isFavorite(this.movieId);

        this.shadowRoot.innerHTML = `
      <style>
        img { 
          width: 100%; 
          border-radius: 8px; 
          aspect-ratio: 2/3; 
          object-fit: cover;
          background: #222; 
        }

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
        <img 
          src="${posterMedium}" 
          srcset="${posterMedium} 210w, ${posterOriginal} 680w"
          sizes="(max-width: 600px) 150px, 210px"
          alt="${title}"
          loading="lazy" 
        >
        <h3 title="${title}">${title}</h3>
        <p class="rating">⭐ ${rating}</p>
        <p class="desc">${description}</p>

        <div class="actions">
          <span class="heart ${fav ? 'active' : ''}">${fav ? '♥' : '♡'}</span>
          <button class="more-btn" type="button">Więcej</button>
        </div>
      </div>
    `;
    }

    setupEvents() {
        const heart = this.shadowRoot.querySelector('.heart');
        const moreBtn = this.shadowRoot.querySelector('.more-btn');

        heart?.addEventListener('click', (e) => {
            e.stopPropagation();

            if (!requireAuth()) return;

            heart.classList.toggle('active');
            heart.textContent = heart.classList.contains('active') ? '♥' : '♡';

            this.dispatchEvent(
                new CustomEvent('toggle-favorite', {
                    bubbles: true,
                    composed: true,
                    detail: { movieId: this.movieId },
                })
            );
        });

        moreBtn?.addEventListener('click', () => {
            this.dispatchEvent(
                new CustomEvent('open-details', {
                    bubbles: true,
                    composed: true,
                    detail: { movieId: this.movieId },
                })
            );
        });
    }
}

customElements.define('movie-card', MovieCard);
