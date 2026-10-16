import { request } from './api.js';

export const getWorkflows = (repository) => request(`/workflows${repository ? `?repository=${encodeURIComponent(repository)}` : ''}`);
export const getWorkflow = (id) => request(`/workflows/${id}`);
export const getRuns = (params = '') => request(`/runs${params ? `?${params}` : ''}`);
export const getRun = (id) => request(`/runs/${id}`);
export const getJobs = (runId) => request(`/jobs/run/${runId}`);
export const getJob = (id) => request(`/jobs/${id}`);
