const TVMAZE_BASE_URL = 'https://api.tvmaze.com';

export async function tvmazeGet(path, options = {}) {
    const res = await fetch(`${TVMAZE_BASE_URL}${path}`, options);
    if (!res.ok) throw new Error(`TVmaze HTTP ${res.status} for ${path}`);
    return res.json();
}
