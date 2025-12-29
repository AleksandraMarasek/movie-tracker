import { loadConfig } from '../api/omdb.js';

const HOME_IDS = [
    'tt0111161', //Shawshank
    'tt0068646', //The Godfather
    'tt0468569', //The Dark Knight
    'tt0109830', //Forrest Gump
    'tt0133093', //Matrix
    'tt1375666', //Inception
];

async function getById(imdbID, config) {
    const url = `${config.OMDB_BASE_URL}?apikey=${config.OMDB_API_KEY}&i=${imdbID}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.Response === 'False') return null;
    return data;
}

export async function getHomeMovies() {
    const config = await loadConfig();
    const movies = await Promise.all(HOME_IDS.map((id) => getById(id, config)));
    return movies.filter(Boolean);
}
