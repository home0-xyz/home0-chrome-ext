# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension for Zillow that allows users to favorite properties and sync them to their home0 account. The extension uses Manifest V3, React/TypeScript, and integrates with Cloudflare Workers backend.

### BMAD Specialists

1. **Analyst (Larry)** - Brainstorming, research, project briefs
2. **Product Manager (John)** - PRDs, epics, requirements
3. **Architect (Mo)** - Technical design, system architecture
4. **Design Architect (Millie)** - UI/UX, frontend architecture
5. **Product Owner (Curly)** - Validation, prioritization, stories
6. **Scrum Master (Sally)** - Sprint planning, story generation
7. **Developer (Dev)** - Implementation, coding, testing

### BMAD Workflow Phases

1. Ideation
2. Planning
3. Design
4. Development
5. Delivery

Project state is stored in `.bmad/state/current.json`

## GitHub Issues and Development Tracking

**IMPORTANT**: All development tasks are tracked as GitHub issues. When implementing features, always reference the corresponding issue number.

### Issue Structure

- **6 Epics** (#1-#6): High-level feature groups
- **22 User Stories** (#7-#28): Individual implementation tasks

### Current Development Order

1. **Epic 1: Project Setup** (#1) - Stories #7-#9
2. **Epic 2: Authentication** (#2) - Stories #10-#12
3. **Epic 3: Sidebar UI** (#3) - Stories #13-#16
4. **Epic 4: Favorite Button** (#4) - Stories #17-#20
5. **Epic 5: API Integration** (#5) - Stories #21-#24
6. **Epic 6: Production** (#6) - Stories #25-#28

**Start with Story #7**: Initialize Chrome Extension Project

View all issues: https://github.com/home0-xyz/home0-chrome-ext/issues

## Development Commands

```bash
# Development workflow
npm install              # Install dependencies
npm run dev             # Start dev server with hot reload
npm run build           # Production build
npm run test            # Run tests

# Chrome extension specific
npm run build:content   # Build content script only
npm run build:bg       # Build background worker only
npm run build:sidebar  # Build sidebar only

# Load extension
# 1. Open chrome://extensions
# 2. Enable Developer mode
# 3. Load unpacked -> select dist/ folder
```

## Architecture Overview

### Tech Stack

- **Extension**: Manifest V3, TypeScript
- **UI Framework**: React 18 with Vite
- **Styling**: shadcn/ui + Tailwind CSS
- **Auth**: Clerk.js
- **Backend**: Cloudflare Workers + D1 Database
- **API**: RESTful endpoints at api.home0.xyz

### Component Structure

```
src/
├── background/        # Service worker
├── content/          # Zillow page injection
├── sidebar/          # React sidebar app
│   ├── components/   # UI components
│   ├── hooks/        # Custom React hooks
│   └── utils/        # Helper functions
└── shared/           # Shared types/utils
```

### Key Implementation Notes

1. **Mock First**: Start with mock auth/data services
2. **Progressive Enhancement**: Build UI with stubs, then connect real APIs
3. **Message Passing**: Use Chrome runtime messaging between components
4. **State Management**: chrome.storage.local for persistence
5. **Error Handling**: User-friendly messages, Sentry for production
