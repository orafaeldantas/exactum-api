# Contributing Guidelines

This document defines the version control and contribution standards for this repository. Following these conventions ensures a readable Git history, enables automated changelog generation, and speeds up bug tracking across the team.

---

## Table of Contents

1. [Branching Strategy](#1-branching-strategy)
2. [Commit Message Convention](#2-commit-message-convention)
3. [Commit Types](#3-commit-types)
4. [Breaking Changes](#4-breaking-changes)
5. [Scopes](#5-scopes)
6. [Subject Line Rules](#6-subject-line-rules)
7. [Pull Requests](#7-pull-requests)
8. [Enforcement](#8-enforcement)
9. [Examples](#9-examples)

---

## 1. Branching Strategy

We follow **GitHub Flow** — a trunk-based approach where every change branches off `main` (or `develop`) and merges back as quickly as possible. Long-lived feature branches are strongly discouraged.

### Branch Naming

Use the appropriate type prefix followed by a short, descriptive name in **kebab-case** (lowercase words separated by hyphens).

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feat/` | New features | `feat/dashboard-revenue-chart` |
| `fix/` | Bug fixes | `fix/login-white-screen` |
| `hotfix/` | Critical production fixes | `hotfix/payment-gateway-crash` |
| `chore/` | Maintenance, config, or tooling | `chore/update-vite-config` |

> **Golden Rule:** Branches should be short-lived. If a feature is too large to land quickly, break it into smaller, independent pull requests.

---

## 2. Commit Message Convention

We follow the **[Conventional Commits](https://www.conventionalcommits.org/)** specification.

### Structure

```
<type>(<scope>): <subject in imperative mood>

[optional body — explain what was done and why]
```

### Full Example

```
feat(api): add email validation on user registration

Validates email format and uniqueness before persisting to the database.
Returns a 422 with a descriptive error message on failure.
```

---

## 3. Commit Types

| Type | When to Use |
|------|-------------|
| `feat` | A new feature or resource |
| `fix` | A bug fix |
| `refactor` | Code restructuring that neither fixes a bug nor adds a feature |
| `format` | Formatting only — spaces, semicolons, Prettier output. **Not** CSS/UI styling |
| `perf` | A change that improves performance |
| `chore` | Dependency updates, build tools, or package upgrades |
| `docs` | Documentation-only changes — READMEs, inline comments |

> **Why `format` instead of `style`?** The type `style` is commonly confused with CSS or UI styling. Using `format` removes that ambiguity entirely.

---

## 4. Breaking Changes

A breaking change is any commit that modifies a public contract — an API response shape, a removed route, a renamed prop, a changed database schema — in a way that requires consumers to update their code.

### How to Signal a Breaking Change

**Option A — Append `!` to the type (preferred for visibility):**

```
feat(api)!: remove v1 authentication endpoint
```

**Option B — Add a `BREAKING CHANGE` footer in the commit body:**

```
refactor(backend): rename user ID field from `id` to `userId`

BREAKING CHANGE: All API consumers must update references from `id` to `userId`
in user-related payloads. Frontend and any external integrations are affected.
```

Both options are valid and can be combined. Breaking changes automatically bump the **major version** when using automated release tools.

> **When in doubt, flag it.** It is better to mark something as breaking and be wrong than to silently break a contract.

---

## 5. Scopes

The scope indicates **where** the change happened. Use only the scopes defined below.

### Frontend

| Scope | Use For |
|-------|---------|
| `(ui)` | Purely visual changes — dumb components, CSS, Tailwind. No business logic. |
| `(frontend)` | Client-side logic — screens, API integrations, React Router, complex hooks. |

```
feat(ui): add primary button component
feat(frontend): implement lazy loading on sales routes
fix(frontend): resolve infinite loop in auth hook
```

### Backend & Database

| Scope | Use For |
|-------|---------|
| `(api)` | Controllers, HTTP routes, request/response validation, middlewares. |
| `(backend)` | Business logic, services, background processing, domain rules. |
| `(db)` | Migrations, schemas, ORM models (Prisma/TypeORM), complex queries. |

```
feat(api): create POST route for tenant creation
refactor(backend): optimize average ticket calculation algorithm
chore(db): add status column to sales table
```

### Global & DevOps

| Scope | Use For |
|-------|---------|
| `(infra)` | Server config, Docker, CI/CD, Vite, root-level files. |
| `(repo)` | Root-level documentation and repository config — README, CONTRIBUTING, LICENSE, .env.example. |

```
chore(infra): unify CSS files into global index.css
chore(infra): add GitHub Actions workflow for staging deploy
```

> **Security fixes** do not need a dedicated scope. Use `fix` with the appropriate scope where the vulnerability lives (e.g., `fix(api)`, `fix(frontend)`), and mention the security context in the commit body.

---

## 6. Subject Line Rules

### 1. Use the imperative mood
Write as if giving an instruction to the codebase.

| | Example |
|--|---------|
| ✅ | `feat(api): add email validation` |
| ❌ | `feat(api): adding email validation` |
| ❌ | `feat(api): added email validation` |

### 2. Keep it short and lowercase
Aim for **50–72 characters**. Use the commit body to explain context or reasoning — not the subject line.

### 3. No trailing period
Do not end the subject line with a period (`.`).

---

## 7. Pull Requests

A good PR is as important as a good commit. It provides context that the commit history alone cannot.

### Before Opening a PR

- [ ] The branch is up to date with `main` (or `develop`).
- [ ] All commits follow the convention in this document.
- [ ] The code compiles and all existing tests pass locally.
- [ ] New behavior is covered by tests where applicable.

### PR Description

Every PR must include:

**What** — A short summary of what changed and why.
**How to test** — Steps for the reviewer to verify the behavior.
**Breaking changes** — Explicitly call out any breaking changes, even if already flagged in commits.

### PR Size

Keep PRs small and focused. A PR that touches more than **400 lines** (excluding generated files and migrations) is a signal to break it down. Smaller PRs are reviewed faster, merged sooner, and produce cleaner history.

### Review & Approval

- At least **1 approval** is required before merging.
- The PR author is responsible for resolving all review comments before merging.
- Prefer **squash merge** for feature branches to keep `main` history clean. Use a conventional commit message for the squash commit.

---

## 8. Enforcement

Rules without automation depend entirely on human discipline, which degrades over time. We use the following tools to enforce this standard automatically.

### Repository Structure

The tooling lives at the **root of the repository**, outside `/frontend` and `/backend`. It covers the entire repo regardless of the language used in each subfolder.

```
/
├── .husky/
│   └── commit-msg
├── frontend/
├── backend/
├── commitlint.config.js
└── package.json
```

### Setup (run once at the repo root)

**1. Initialize `package.json` at the root** (if it does not exist yet):

```bash
npm init -y
```

**2. Install the dependencies:**

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional husky
```

**3. Add the `prepare` script to `package.json`** so husky activates automatically on `npm install`:

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

**4. Create `commitlint.config.js` at the root:**

```js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'refactor', 'format', 'perf', 'chore', 'docs']],
    'scope-enum': [2, 'always', ['ui', 'frontend', 'api', 'backend', 'db', 'infra', 'repo']],
  },
};
```

**5. Initialize husky and create the Git hook:**

```bash
npx husky init
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg
```

### Onboarding a New Team Member

Every developer who clones the repository only needs to run this once:

```bash
npm install
```

The `prepare` script handles the rest — no manual hook setup required.

### How It Works in Practice

From this point on, every `git commit` is intercepted and validated before being accepted.

**Valid commit — passes immediately:**

```bash
git commit -m "feat(api): add email validation"
# ✔  found 0 problems, 0 warnings
```

**Invalid commit — rejected with a clear error:**

```bash
git commit -m "adicionando validação de email"
# ✖  subject may not be empty [subject-empty]
# ✖  type may not be empty [type-empty]
# ✖  found 2 problems, 0 warnings
```

The commit does not enter the history until the message is corrected.

### Testing commitlint Manually

You can validate a message at any time without making a commit:

```bash
echo "feat(api): add email validation" | npx commitlint
# no output = valid

echo "wrong message" | npx commitlint
# shows all rule violations
```

---

## 9. Examples

A well-maintained Git history should look like this:

```
feat(ui): create custom table with styled scrollbar
feat(frontend): integrate tenant form with the backend api
fix(api): handle 500 error when payload is empty
feat(api)!: remove v1 authentication endpoint
refactor(frontend): move stepper logic to features folder
chore(infra): update react-router-dom version
docs(readme): add contributing guidelines and commit rules
```

Each line is self-explanatory: the type communicates intent, the scope communicates location, and the subject communicates the change — no ambiguity.