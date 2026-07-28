/**
 * Self-hosted Renovate — bot-level config
 * Used by .github/workflows/renovate.yml via configurationFile.
 *
 * Auth: GitHub App installation token (created in the workflow).
 *   Secrets: RENOVATE_APP_ID + RENOVATE_APP_PRIVATE_KEY
 *
 * Repo-level rules live in /renovate.json.
 */
module.exports = {
  platform: 'github',
  // Identity is taken from the GitHub App; override only if needed:
  // gitAuthor: 'renovate[bot] <123456+your-app[bot]@users.noreply.github.com>',
  onboarding: false,
  requireConfig: 'required',
  repositories: ['Sentinel-Archetecht/The-Remote-Viewer'],
  logLevel: 'info',
  persistRepoData: true,
};
