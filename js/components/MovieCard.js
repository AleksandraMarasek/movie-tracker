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

        this.shadowRoot.innerHTML = `
      <style>
        .card {
          width: 200px;
          font-family: Arial, sans-serif;
        }

        img {
          width: 100%;
          border-radius: 8px;
        }

        .heart {
          cursor: pointer;
          font-size: 22px;
          color: #888;
          user-select: none;
        }

        .heart.active {
          color: red;
        }
      </style>

      <div class="card">
        <img src="${poster}" alt="${title}">
        <h3>${title}</h3>
        <p>⭐ ${rating}</p>
        <p>${description}</p>
        <span class="heart">♡</span>
      </div>
    `;
    }

    setupEvents() {
        const heart = this.shadowRoot.querySelector('.heart');

        heart.addEventListener('click', (e) => {
            e.stopPropagation();

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
    }
}

customElements.define('movie-card', MovieCard);
