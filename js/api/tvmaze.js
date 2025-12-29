const TVMAZE_BASE_URL = 'https://api.tvmaze.com';

export async function tvmazeGet(path) {
    const res = await fetch(`${TVMAZE_BASE_URL}${path}`);
    if (!res.ok) throw new Error(`TVmaze HTTP ${res.status} for ${path}`);
    return res.json();
}
