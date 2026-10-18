import { Octokit } from '@octokit/rest';

export function getOctokit() {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is required to synchronize GitHub data');
  }
  return new Octokit({ auth: process.env.GITHUB_TOKEN });
}
