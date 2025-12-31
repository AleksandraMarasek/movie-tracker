class MovieDetails extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    set data(show) {
        this._show = show;
        this.render();
    }

    render() {
        if (!this._show) return;
        const { name, summary, image, premiered, runtime, genres, rating } =
            this._show;
        const year = premiered ? premiered.split('-')[0] : 'N/A';
        const poster = image?.original || image?.medium || '';

        this.shadowRoot.innerHTML = `
        <style>
        
            :host {
                position: fixed;
                inset: 0;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Segoe UI', sans-serif;
                color: white;
            }
            .overlay {
                position: absolute;
                inset: 0;
                background: rgba(0,0,0,0.85);
                backdrop-filter: blur(10px);
            }
            .bg-blur {
                position: absolute;
                inset: 0;
                background: url('${poster}') center/cover;
                filter: blur(60px) opacity(0.3);
                z-index: -1;
            }
            .content {
                position: relative;
                width: 90%;
                max-width: 800px;
                display: grid;
                grid-template-columns: 300px 1fr;
                gap: 40px;
                background: rgba(255,255,255,0.05);
                padding: 40px;
                border-radius: 24px;
                border: 1px solid rgba(255,255,255,0.1);
                box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                overflow: hidden;
            }
            .close-btn {
                position: absolute;
                top: 20px; right: 20px;
                background: none; border: none; color: white;
                font-size: 30px; cursor: pointer; opacity: 0.5;
            }
            .close-btn:hover { opacity: 1; }
            img.poster { width: 100%; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            h2 { font-size: 42px; margin: 0 0 10px 0; }
            .meta { color: #f2a4f5; font-weight: bold; margin-bottom: 20px; font-size: 14px; }
            .genres { opacity: 0.7; margin-bottom: 20px; }
            .summary { line-height: 1.8; font-size: 15px; color: #ddd; }
            .btn-group { display: flex; gap: 15px; margin-top: 30px; }
            .btn {
                padding: 12px 24px; border-radius: 30px; border: none;
                cursor: pointer; font-weight: bold; transition: 0.3s;
            }
            .btn-fav { background: #f2a4f5; color: black; }
            .btn-watch { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
            
            @media (max-width: 700px) {
                .content { grid-template-columns: 1fr; padding: 20px; max-height: 90vh; overflow-y: auto; }
                img.poster { display: none; }
            }
        </style>
        <div class="overlay"></div>
        <div class="bg-blur"></div>
        <div class="content">
            <button class="close-btn">&times;</button>
            <img class="poster" src="${poster}">
            <div class="info">
                <h2>${name}</h2>
                <div class="meta">${year} • ${runtime || '??'} min • ⭐ ${
            rating?.average || '—'
        }</div>
                <div class="genres">${genres?.join(', ') || ''}</div>
                <div class="summary">${summary || 'Brak opisu.'}</div>
                
                <div class="btn-group">
                    <button class="btn btn-fav">dodaj do ulubionych <3</button>
                    <button class="btn btn-watch">dodaj do obejrzenia +</button>
                </div>
            </div>
        </div>
        `;

        this.shadowRoot.querySelector('.close-btn').onclick = () =>
            this.remove();
        const watchBtn = this.shadowRoot.querySelector('.btn-watch');
        watchBtn.onclick = () => {
            this.dispatchEvent(
                new CustomEvent('add-to-watchlist', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        movie: {
                            id: String(this._show.id),
                            title: this._show.name,
                            poster:
                                this._show.image?.medium ||
                                this._show.image?.original,
                            rating: String(this._show.rating?.average || '—'),
                            description: this._show.summary
                                ? this._show.summary
                                      .replace(/<[^>]*>/g, '')
                                      .slice(0, 140) + '...'
                                : 'Brak opisu.',
                        },
                    },
                })
            );
            watchBtn.textContent = 'Dodano! ✓';
            watchBtn.style.borderColor = 'var(--accent-color)';
        };
        this.shadowRoot.querySelector('.overlay').onclick = () => this.remove();
    }
}
customElements.define('movie-details', MovieDetails);
