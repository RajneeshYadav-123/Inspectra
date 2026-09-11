// frontend/src/utils/api.js
// Paste your backend URL here:
const BASE_URL = 'https://inspectra-s4hg.vercel.app';

export const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = new Headers(options.headers || {});
    if (token && !headers.has('Authorization')) {
        headers.append('Authorization', `Bearer ${token}`);
    }

    // Prepend the BASE_URL to the requested url
    return fetch(`${BASE_URL}${url}`, {
        ...options,
        headers
    });
};
