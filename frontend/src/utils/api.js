export const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = new Headers(options.headers || {});
    if (token && !headers.has('Authorization')) {
        headers.append('Authorization', `Bearer ${token}`);
    }
    return fetch(url, {
        ...options,
        headers
    });
};
