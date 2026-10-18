import { request } from './api.js';

export const getRepositories = () => request('/repositories');
const repositoryPath = (fullName) => fullName.split('/').map(encodeURIComponent).join('/');
export const getRepository = (fullName) => request(`/repositories/${repositoryPath(fullName)}`);
export const syncRepositories = () => request('/repositories/sync', { method: 'POST' });
export const syncRepository = (fullName) => request(`/repositories/${repositoryPath(fullName)}/sync`, { method: 'POST' });
export const syncAll = () => request('/repositories/sync-all', { method: 'POST' });
