# LuxRide GitHub Ownership and Update Guide

This guide explains how the project owner can keep LuxRide in their own GitHub account and safely upload future code changes.

## What GitHub stores

The repository stores the React frontend, WordPress theme, LuxRide plugin, scripts, project assets, and documentation. It is not a backup of the production database, bookings, WordPress media library, server configuration, or secrets.

Keep database dumps, `wp-content/uploads`, and server backups in separate secure backup storage.

## Recommended ownership handoff

To preserve the complete Git history, commits, links, issues, and releases, transfer the existing repository to the client's GitHub account:

1. The client creates a GitHub account and enables two-factor authentication.
2. The client shares only their GitHub username, never their password or verification code.
3. The current repository owner transfers repository ownership to the client.
4. The client adds future developers as collaborators when maintenance is needed.
5. Keep `main` as the production source branch and protect it against deletion and force pushes.

## Creating a new client repository

If the existing repository will not be transferred:

1. Create a private repository named `LuxRide` in the client's account.
2. Do not initialize it with a README, `.gitignore`, or license.
3. Add the developer under `Settings > Collaborators`.
4. The developer connects and pushes the existing local repository:

```bash
git remote rename origin previous-origin
git remote add origin https://github.com/CLIENT_USERNAME/LuxRide.git
git push -u origin main
```

The client should authenticate through GitHub Desktop or GitHub's official browser flow and should never share account credentials.

## GitHub Desktop workflow

### First setup

1. Install GitHub Desktop from the official website and sign in.
2. Select `File > Clone repository`.
3. Select `LuxRide` and choose a local folder.

### Upload a future update

1. Click `Fetch origin`, then `Pull origin` before starting.
2. Make the required changes inside the project folder.
3. Review `Changes` and confirm that no secrets, database dumps, or backups are included.
4. Enter a clear summary such as `Update transfer prices`.
5. Commit approved small changes to `main`, or use a feature branch for larger development work.
6. Click `Push origin` and confirm the commit appears on GitHub.

Pushing to GitHub does not automatically deploy the WordPress production site. Production deployment remains a separate backup, build, upload, cache-purge, and verification process.

## Developer command-line workflow

Before work:

```bash
git switch main
git pull --rebase origin main
git status
```

After implementation and verification:

```bash
npm install
npm run check
git status
git diff
git add path/to/changed-file
git commit -m "Describe the completed change"
git pull --rebase origin main
git push origin main
```

For larger changes, use a branch and pull request:

```bash
git switch -c feature/short-description
git add path/to/changed-file
git commit -m "Describe the completed change"
git push -u origin feature/short-description
```

## Required checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Run `php -l` on every changed WordPress PHP file.

## Never upload

- `.env`, credentials, API keys, passwords, or authentication codes.
- `wp-config.php`.
- SSH keys, `.pem`, or `.ppk` files.
- `.sql`, `.sql.gz`, `.dump`, or other database backups.
- Production bookings or customer exports.
- WordPress uploads, cache, upgrade, migration, or backup folders.
- `node_modules`, `dist`, logs, and runtime cache files.

## Restoring on a new computer

1. Install GitHub Desktop or Git and Node.js 20 or newer.
2. Clone `LuxRide` from the client's account.
3. Run:

```bash
npm install
npm run check
```

4. Restore environment configuration from the secure handoff source, not GitHub.
5. Restore the WordPress database and media from the separate server backup only when a complete WordPress environment is required.

## Handoff checklist

- The repository is private and owned by the client.
- The client is the owner; developers are collaborators.
- Two-factor authentication is enabled.
- No secrets, databases, or customer data are committed.
- `main` is current and the latest commit is visible on GitHub.
- Checks pass before every push.
- Database and media backups exist outside GitHub.
- Production deployment remains a separate controlled process.
