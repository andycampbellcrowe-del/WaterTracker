# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-06

### Added
- Initial release of Water Tracker application
- Shared daily water intake goal for Rachel and Andy
- Individual bottles per goal settings for each user
- Real-time progress tracking with progress ring and stacked bars
- Today page with quick-add buttons (+1 bottle, +½ bottle, custom amounts)
- History & KPIs page with Week/Month/Year views
  - Days goal met statistics
  - Average daily intake tracking
  - Streak tracking (current and longest)
  - Contribution split between users
  - Peak day identification
- Settings page with comprehensive configuration
  - Unit switching (oz/L) with automatic conversion
  - Individual bottles per goal for Rachel and Andy
  - Celebration and sound toggles
  - Data export/import (JSON)
  - Reset functionality with confirmation
- Celebration feature with confetti animation and optional sound
- 30 days of demo data for initial testing
- Local storage persistence
- Mobile-first responsive design
- WCAG AA accessibility compliance
- Smooth color gradients and rounded UI elements

### Technical
- Built with React 18 + TypeScript
- Vite for fast development and building
- React Router for navigation
- Recharts for data visualization
- Tailwind CSS for styling
- Canvas Confetti for celebrations
- Lucide React for icons

---

## Version Format

- **MAJOR** version for incompatible API changes or data model changes
- **MINOR** version for new features (backwards compatible)
- **PATCH** version for bug fixes (backwards compatible)

Example: `1.2.3` = Major.Minor.Patch
