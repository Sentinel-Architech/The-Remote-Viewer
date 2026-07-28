/**
 * Self-hosted Renovate — bot-level config
 * Used by .github/workflows/renovate.yml via configurationFile.
 *
 * Repo-level rules live in /renovate.json (packageRules, schedule, groups).
 * This file only sets platform identity and which repos the bot may touch.
 *
 * Required secret: RENOVATE_TOKEN
 *   - Fine-grained PAT or classic PAT with: repo, workflow
 *   - Or a GitHub App installation token (preferred for multi-repo later)
 */
module.exports = {
  platform: 'github',
  // Bot identity on commits/PRs
  gitAuthor: 'Renovate Bot <renovate@whitesourcesoftware.com>',
  onboarding: false,
  requireConfig: 'required',
  // Only this repository (expand the array if you add more later)
  repositories: ['Sentinel-Archetecht/The-Remote-Viewer'],
  // Keep log noise manageable in Actions
  logLevel: 'info',
  // Persist repo cache between runs when the action mounts /tmp
  persistRepoData: true,
};
