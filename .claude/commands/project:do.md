# Description: Execute BMAD Method tasks with the appropriate agent
# Usage: /project:do [task-name] [options]

# BMAD Task Executor

I'll help you execute specific BMAD Method tasks using the most appropriate agent.

**Task requested:** $ARGUMENTS

## Available Tasks

### Creation Tasks
- **create-prd** - Generate Product Requirements Document (PM)
- **create-architecture** - Design system architecture (Architect)
- **create-frontend-architecture** - Design frontend architecture (Design Architect)
- **create-uxui-spec** - Create UI/UX specifications (Design Architect)
- **create-next-story** - Generate user stories from epics (SM)

### Support Tasks
- **create-deep-research-prompt** - Generate research directives (Analyst)
- **create-ai-frontend-prompt** - Create AI UI generation prompts (Design Architect)
- **doc-shard** - Split large documents (Any agent)
- **library-index** - Index code libraries (Dev/Architect)

### Validation Tasks
- **checklist-run** - Run quality checklists (Any agent)
- **correct-course** - Mid-sprint adjustments (SM)
- **core-dump** - Export current state (Any agent)

## Task Execution

Let me identify the task and route to the appropriate agent...

```javascript
// Parse task from arguments
const args = $ARGUMENTS.trim().toLowerCase();
const taskMap = {
  'create-prd': { agent: 'pm', task: 'create-prd' },
  'create-architecture': { agent: 'architect', task: 'create-architecture' },
  'create-frontend-architecture': { agent: 'design-architect', task: 'create-frontend-architecture' },
  'create-uxui-spec': { agent: 'design-architect', task: 'create-uxui-spec' },
  'create-next-story': { agent: 'sm', task: 'create-next-story-task' },
  'create-deep-research-prompt': { agent: 'analyst', task: 'create-deep-research-prompt' },
  'create-ai-frontend-prompt': { agent: 'design-architect', task: 'create-ai-frontend-prompt' },
  'doc-shard': { agent: 'current', task: 'doc-sharding-task' },
  'library-index': { agent: 'architect', task: 'library-indexing-task' },
  'checklist-run': { agent: 'current', task: 'checklist-run-task' },
  'correct-course': { agent: 'sm', task: 'correct-course' },
  'core-dump': { agent: 'current', task: 'core-dump' }
};

let selectedTask = null;
for (const [key, value] of Object.entries(taskMap)) {
  if (args.includes(key)) {
    selectedTask = value;
    break;
  }
}

if (selectedTask) {
  console.log(`Task: ${selectedTask.task}`);
  console.log(`Agent: ${selectedTask.agent}`);
} else {
  console.log('No specific task identified. Please specify a task name.');
}
```

## Execution Options

You can add these options to your task:
- **--interactive** - Step-by-step guidance
- **--yolo** - Automated execution (where supported)
- **--validate** - Run validation after task

Example usage:
- `/project:do create-prd --interactive`
- `/project:do create-architecture`
- `/project:do checklist-run --validate`

Which task would you like to execute?