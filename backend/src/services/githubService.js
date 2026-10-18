import { getOctokit } from '../config/github.js';
import Repository from '../models/Repository.js';
import Workflow from '../models/Workflow.js';
import WorkflowRun from '../models/WorkflowRun.js';
import Job from '../models/Job.js';
import Step from '../models/Step.js';
import Commit from '../models/Commit.js';

const perPage = 100;

export async function syncRepositories() {
  const octokit = getOctokit();
  const { data } = await octokit.repos.listForAuthenticatedUser({ per_page: perPage, sort: 'updated' });
  const repositories = await Promise.all(data.map(saveRepository));
  return repositories;
}

function saveRepository(repo) {
  return Repository.findOneAndUpdate(
    { githubId: repo.id },
    {
      owner: repo.owner.login,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description ?? '',
      htmlUrl: repo.html_url,
      defaultBranch: repo.default_branch,
      isPrivate: repo.private
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

function mapRun(run, repository, workflow) {
  return {
    githubId: run.id,
    repository: repository._id,
    workflow: workflow?._id,
    name: run.name ?? '',
    event: run.event,
    status: run.status,
    conclusion: run.conclusion,
    branch: run.head_branch ?? '',
    commitSha: run.head_sha,
    actor: run.actor?.login ?? '',
    htmlUrl: run.html_url,
    runNumber: run.run_number,
    runAttempt: run.run_attempt,
    createdAt: run.created_at,
    startedAt: run.run_started_at,
    updatedAtGitHub: run.updated_at,
    completedAt: run.updated_at && run.status === 'completed' ? run.updated_at : undefined
  };
}

async function syncRunJobs(octokit, repository, savedRun, githubRunId) {
  const { data } = await octokit.actions.listJobsForWorkflowRun({
    owner: repository.owner,
    repo: repository.name,
    run_id: githubRunId,
    per_page: perPage
  });
  for (const job of data.jobs) {
    const savedJob = await Job.findOneAndUpdate(
      { githubId: job.id },
      {
        run: savedRun._id,
        name: job.name,
        status: job.status,
        conclusion: job.conclusion,
        htmlUrl: job.html_url,
        startedAt: job.started_at,
        completedAt: job.completed_at,
        runnerName: job.runner_name,
        runnerGroupName: job.runner_group_name
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await Promise.all(job.steps.map((step) => Step.findOneAndUpdate(
      { job: savedJob._id, number: step.number },
      {
        name: step.name,
        status: step.status,
        conclusion: step.conclusion,
        startedAt: step.started_at,
        completedAt: step.completed_at
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )));
  }
}

export async function syncRepository(fullName) {
  const repository = await Repository.findOne({ fullName, enabled: true });
  if (!repository) {
    const error = new Error(`Repository not found or disabled: ${fullName}`);
    error.status = 404;
    throw error;
  }

  const octokit = getOctokit();
  const [{ data: workflowData }, { data: runData }] = await Promise.all([
    octokit.actions.listRepoWorkflows({ owner: repository.owner, repo: repository.name, per_page: perPage }),
    octokit.actions.listWorkflowRunsForRepo({ owner: repository.owner, repo: repository.name, per_page: perPage })
  ]);
  const workflows = await Promise.all(workflowData.workflows.map((workflow) => Workflow.findOneAndUpdate(
    { githubId: workflow.id },
    {
      repository: repository._id,
      name: workflow.name,
      path: workflow.path,
      state: workflow.state,
      htmlUrl: workflow.html_url,
      badgeUrl: workflow.badge_url
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )));
  const workflowsById = new Map(workflows.map((workflow) => [workflow.githubId, workflow]));

  for (const run of runData.workflow_runs) {
    const savedRun = await WorkflowRun.findOneAndUpdate(
      { githubId: run.id },
      mapRun(run, repository, workflowsById.get(run.workflow_id)),
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await syncRunJobs(octokit, repository, savedRun, run.id);
  }

  const commitCount = await syncCommitHistoryForRepository(octokit, repository);

  repository.lastSyncedAt = new Date();
  await repository.save();
  return {
    repository,
    workflowCount: workflows.length,
    runCount: runData.workflow_runs.length,
    commitCount
  };
}

async function syncCommitHistoryForRepository(octokit, repository) {
  const commits = await octokit.paginate(octokit.repos.listCommits, {
    owner: repository.owner,
    repo: repository.name,
    sha: repository.defaultBranch,
    per_page: perPage
  });
  const latestRuns = await WorkflowRun.find({ repository: repository._id })
    .sort({ updatedAtGitHub: -1, createdAt: -1 })
    .select('githubId commitSha')
    .lean();
  const latestRunBySha = new Map();
  for (const run of latestRuns) {
    if (!latestRunBySha.has(run.commitSha)) latestRunBySha.set(run.commitSha, run);
  }

  for (let offset = 0; offset < commits.length; offset += 500) {
    const batch = commits.slice(offset, offset + 500);
    await Commit.bulkWrite(batch.map((commit) => ({
      updateOne: {
        filter: { repository: repository._id, sha: commit.sha },
        update: {
          $set: {
            branch: repository.defaultBranch,
            message: commit.commit.message,
            author: commit.author?.login ?? commit.commit.author?.name ?? '',
            committedAt: commit.commit.author?.date,
            htmlUrl: commit.html_url,
            workflowRun: latestRunBySha.get(commit.sha)?._id ?? null
          }
        },
        upsert: true
      }
    })));
  }
  return commits.length;
}

export async function syncCommitHistory(fullName) {
  const [owner, name, ...extra] = fullName.split('/');
  if (!owner || !name || extra.length) {
    const error = new Error('Repository must use the owner/name format');
    error.status = 400;
    throw error;
  }
  const octokit = getOctokit();
  const { data } = await octokit.repos.get({ owner, repo: name });
  const repository = await saveRepository(data);
  const commitCount = await syncCommitHistoryForRepository(octokit, repository);
  repository.lastSyncedAt = new Date();
  await repository.save();
  return { repository: repository.fullName, commitCount };
}

export async function syncAll() {
  const repositories = await syncRepositories();
  const results = [];
  for (const repository of repositories) {
    results.push(await syncRepository(repository.fullName));
  }
  return results;
}

export async function upsertWebhookRun(payload) {
  const repoData = payload.repository;
  if (!repoData) return null;
  const repository = await Repository.findOneAndUpdate(
    { githubId: repoData.id },
    {
      owner: repoData.owner.login,
      name: repoData.name,
      fullName: repoData.full_name,
      description: repoData.description ?? '',
      htmlUrl: repoData.html_url,
      defaultBranch: repoData.default_branch,
      isPrivate: repoData.private
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const sourceRun = payload.workflow_run;
  if (sourceRun) {
    const workflow = sourceRun.workflow_id
      ? await Workflow.findOne({ githubId: sourceRun.workflow_id })
      : null;
    const run = await WorkflowRun.findOneAndUpdate(
      { githubId: sourceRun.id },
      mapRun(sourceRun, repository, workflow),
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    if (payload.action === 'completed' || payload.action === 'in_progress') {
      await syncRunJobs(getOctokit(), repository, run, sourceRun.id);
    }
    return run;
  }
  const sourceJob = payload.workflow_job;
  if (sourceJob) {
    const run = await WorkflowRun.findOne({ githubId: sourceJob.run_id });
    if (!run) return null;
    const job = await Job.findOneAndUpdate(
      { githubId: sourceJob.id },
      {
        run: run._id,
        name: sourceJob.name,
        status: sourceJob.status,
        conclusion: sourceJob.conclusion,
        htmlUrl: sourceJob.html_url,
        startedAt: sourceJob.started_at,
        completedAt: sourceJob.completed_at,
        runnerName: sourceJob.runner_name,
        runnerGroupName: sourceJob.runner_group_name
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await Promise.all((sourceJob.steps ?? []).map((step) => Step.findOneAndUpdate(
      { job: job._id, number: step.number },
      { name: step.name, status: step.status, conclusion: step.conclusion, startedAt: step.started_at, completedAt: step.completed_at },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )));
    return job;
  }
  return null;
}
