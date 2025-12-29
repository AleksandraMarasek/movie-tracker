import { loadConfig } from '../api/omdb.js';

export async function searchMovies(title) {
    const config = await loadConfig();

    /*const url = ${config.OMDB_BASE_URL}?apikey=${config.OMDB_API_KEY}&s=${encodeURIComponent(title)}; */
    const url = 'http://www.omdbapi.com/?i=tt3896198&apikey=5a089b8b';
    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === 'False') return [];
    return data.Search;
}
