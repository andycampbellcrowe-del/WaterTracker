# Contributing to Water Tracker

Thank you for your interest in contributing! Here's how to get started.

## Git Workflow

### Branching Strategy

We use a simplified Git Flow:

```
main (production)
  ├── develop (integration)
  │   ├── feature/add-weekly-summary
  │   ├── feature/notifications
  │   └── bugfix/celebration-timing
  └── hotfix/critical-data-loss
```

### Branch Naming Convention

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical production fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates

### Workflow Steps

1. **Create a feature branch from `develop`:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes and commit:**
   ```bash
   git add .
   git commit -m "feat: add weekly summary view"
   ```

3. **Push and create a Pull Request:**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **After PR approval, merge to `develop`**

5. **When ready for release, merge `develop` to `main`**

## Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `build`: Build system changes
- `ci`: CI/CD changes

### Examples:
```bash
feat(history): add monthly comparison chart
fix(celebration): resolve confetti animation timing
docs(readme): update deployment instructions
refactor(calculations): simplify bottle size logic
perf(charts): optimize data rendering
```

## Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes or data model changes
- **MINOR** (0.1.0): New features (backwards compatible)
- **PATCH** (0.0.1): Bug fixes (backwards compatible)

### Version Bump Scripts:

```bash
npm run version:patch  # 1.0.0 -> 1.0.1
npm run version:minor  # 1.0.0 -> 1.1.0
npm run version:major  # 1.0.0 -> 2.0.0
```

## Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/andycampbellcrowe-del/WaterTracker.git
   cd WaterTracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

## Code Style

- Use TypeScript for all new code
- Follow existing code structure
- Use functional components with hooks
- Maintain accessibility (ARIA labels, keyboard navigation)
- Keep components focused and reusable
- Add comments for complex logic
- Use meaningful variable names

## Pull Request Process

1. Update CHANGELOG.md with your changes
2. Ensure all tests pass and build succeeds
3. Update documentation if needed
4. Fill out the PR template completely
5. Request review from maintainers
6. Address review feedback
7. Squash commits if requested
8. Wait for approval before merging

## Testing Guidelines

- Test on mobile and desktop
- Test with keyboard navigation
- Test with screen readers
- Test data export/import
- Test edge cases (empty states, large data sets)
- Check for console errors
- Verify accessibility compliance

## Questions?

Open an issue or reach out to the maintainers!
