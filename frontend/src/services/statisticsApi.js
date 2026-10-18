import { request } from './api.js';

export const getStatistics = () => request('/statistics');
