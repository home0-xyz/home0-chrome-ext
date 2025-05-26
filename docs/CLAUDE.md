# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension project called home0-chrome-ext that uses the BMAD Method (Breakthrough Method of Agile AI-driven Development) for project management.

## BMAD Method with dbmad CLI

This project uses BMAD (Breakthrough Method of Agile AI-driven Development) through the **dbmad** CLI tool. The dbmad CLI is the primary interface for interacting with BMAD agents and executing development workflows.

### Installing and Using dbmad
```bash
# Install dbmad globally
npm install -g dbmad

# Initialize dbmad in project
dbmad

# Run BMAD orchestrator
dbmad project:bmad

# Execute workflow tasks
dbmad project:do

# Get next workflow step
dbmad project:next
```

### Available BMAD Commands via dbmad
- `dbmad project:bmad` - Main orchestrator command
- `dbmad project:do` - Execute tasks
- `dbmad project:next` - Get workflow recommendations

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

## Chrome Extension Development Setup

When initializing this Chrome extension:

1. Create a `manifest.json` file as the entry point
2. Set up the basic extension structure:
   - `src/` - Source code
   - `src/background/` - Background scripts
   - `src/content/` - Content scripts
   - `src/popup/` - Popup UI (if needed)
   - `src/options/` - Options page (if needed)
   - `assets/` - Icons and images

## Recommended Development Commands

Once the project is set up with package.json:

```bash
# Install dependencies
npm install

# Build for development
npm run build:dev

# Build for production
npm run build

# Watch mode for development
npm run watch
```

## Chrome Extension Architecture Notes

- Use Manifest V3 for new extensions
- Background scripts should use service workers
- Content scripts inject into web pages
- Message passing between different contexts uses chrome.runtime.sendMessage