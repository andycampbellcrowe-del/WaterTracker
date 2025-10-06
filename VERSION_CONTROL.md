# Version Control Guide

This document explains how to properly version control the Water Tracker project.

## Quick Reference

### Creating a New Feature
```bash
# Start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature description"

# Push and create PR
git push origin feature/your-feature-name
```

### Releasing a New Version

#### Patch Release (1.0.0 → 1.0.1)
Bug fixes, small improvements
```bash
npm run version:patch
```

#### Minor Release (1.0.0 → 1.1.0)
New features, backwards compatible
```bash
npm run version:minor
```

#### Major Release (1.0.0 → 2.0.0)
Breaking changes, data model changes
```bash
npm run version:major
```

## Branch Structure

```
main (production)
  ├── develop (integration branch)
  │   ├── feature/weekly-summary
  │   ├── feature/notifications
  │   └── bugfix/celebration-timing
  └── hotfix/critical-fix
```

### Branch Types

| Branch | Purpose | Merge To |
|--------|---------|----------|
| `main` | Production code | - |
| `develop` | Integration branch | `main` |
| `feature/*` | New features | `develop` |
| `bugfix/*` | Bug fixes | `develop` |
| `hotfix/*` | Critical production fixes | `main` & `develop` |
| `refactor/*` | Code improvements | `develop` |
| `docs/*` | Documentation | `develop` |

## Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `perf`: Performance
- `test`: Tests
- `chore`: Maintenance

### Examples
```bash
feat(history): add monthly comparison chart
fix(celebration): resolve animation timing bug
docs(readme): update installation instructions
refactor(calculations): simplify bottle size logic
perf(charts): optimize rendering with memoization
```

## Versioning Strategy

We use **Semantic Versioning (SemVer)**: `MAJOR.MINOR.PATCH`

### When to Bump

**MAJOR** (Breaking Changes)
- Data model changes that require migration
- Removing features
- Incompatible API changes
- Examples: 1.0.0 → 2.0.0

**MINOR** (New Features)
- Adding new features
- Adding new pages/components
- Backwards compatible changes
- Examples: 1.0.0 → 1.1.0

**PATCH** (Bug Fixes)
- Bug fixes
- Performance improvements
- Small UI tweaks
- Examples: 1.0.0 → 1.0.1

## Release Process

### 1. Prepare Release
```bash
# Ensure you're on develop with latest changes
git checkout develop
git pull origin develop

# Update CHANGELOG.md with changes
# Follow the format in CHANGELOG.md
```

### 2. Bump Version
```bash
# Choose appropriate version bump
npm run version:patch   # for bug fixes
npm run version:minor   # for new features
npm run version:major   # for breaking changes
```

### 3. Merge to Main
```bash
# Create PR from develop to main
git checkout main
git pull origin main
git merge develop
git push origin main
```

### 4. Tag and Release
The version scripts automatically create tags and push them, which triggers:
- GitHub Actions CI/CD
- Automatic deployment to Vercel (if configured)
- GitHub Release creation

## GitHub Actions

### Continuous Integration (CI)
Runs on every push to `main` or `develop`:
- ✅ Lints code
- ✅ Runs TypeScript compiler
- ✅ Builds project
- ✅ Verifies build output

### Release Workflow
Runs on version tags (`v*`):
- 📦 Creates GitHub release
- 📝 Includes CHANGELOG excerpt
- 🔖 Tags commit

## Best Practices

### DO ✅
- Create feature branches from `develop`
- Write descriptive commit messages
- Update CHANGELOG.md before releasing
- Test thoroughly before merging to main
- Keep commits focused and atomic
- Rebase or squash before merging
- Delete branches after merging

### DON'T ❌
- Commit directly to `main`
- Mix multiple features in one PR
- Forget to update CHANGELOG.md
- Push breaking changes without major version bump
- Leave orphaned branches
- Force push to shared branches

## Workflow Examples

### Example 1: Adding a New Feature
```bash
# Start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/weekly-goals

# Make changes
# ... code changes ...

# Commit with conventional format
git add .
git commit -m "feat(goals): add weekly goal setting"

# Push and create PR
git push origin feature/weekly-goals
# Create PR on GitHub: feature/weekly-goals → develop
```

### Example 2: Fixing a Bug
```bash
# Create bugfix branch
git checkout develop
git checkout -b bugfix/celebration-sound

# Fix the bug
# ... code changes ...

# Commit
git commit -m "fix(celebration): correct audio context timing"

# Push and PR
git push origin bugfix/celebration-sound
```

### Example 3: Hotfix Production
```bash
# Critical bug in production
git checkout main
git checkout -b hotfix/data-loss

# Fix immediately
# ... code changes ...

# Commit and merge
git commit -m "fix(storage): prevent data loss on import"
git checkout main
git merge hotfix/data-loss
git push origin main

# Also merge back to develop
git checkout develop
git merge hotfix/data-loss
git push origin develop

# Bump patch version
npm run version:patch
```

### Example 4: Creating a Release
```bash
# Ensure develop is ready
git checkout develop
git pull origin develop

# Update CHANGELOG.md
# ... edit CHANGELOG.md ...

# Commit changelog
git add CHANGELOG.md
git commit -m "docs(changelog): update for v1.1.0"

# Bump version (creates tag automatically)
npm run version:minor

# Merge to main
git checkout main
git merge develop
git push origin main

# GitHub Actions will handle the rest!
```

## Troubleshooting

### Merge Conflicts
```bash
# Pull latest changes
git pull origin develop

# Resolve conflicts in your editor
# ... fix conflicts ...

# Complete merge
git add .
git commit -m "chore: resolve merge conflicts"
```

### Wrong Commit Message
```bash
# Before pushing
git commit --amend -m "corrected message"

# After pushing (not recommended)
git push --force-with-lease
```

### Need to Undo Last Commit
```bash
# Keep changes
git reset --soft HEAD~1

# Discard changes
git reset --hard HEAD~1
```

## Resources

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
