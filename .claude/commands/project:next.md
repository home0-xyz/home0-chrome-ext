# Description: Get next recommended action in BMAD workflow
# Usage: /project:next

# BMAD Workflow Navigator

I'll analyze your current project state and recommend the next steps in the BMAD Method workflow.

## Checking Project State...

```javascript
const fs = require('fs');
const path = require('path');

// Load current state
const stateFile = path.join(process.cwd(), '.bmad', 'state', 'current.json');
let currentState = null;

try {
  if (fs.existsSync(stateFile)) {
    currentState = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  }
} catch (error) {
  currentState = null;
}

// Define workflow phases
const workflow = {
  'ideation': {
    agent: 'analyst',
    tasks: ['brainstorm', 'research', 'project-brief'],
    next: 'planning',
    artifacts: ['project-brief.md']
  },
  'planning': {
    agent: 'pm',
    tasks: ['create-prd', 'define-epics'],
    next: 'design',
    artifacts: ['prd.md', 'epics/']
  },
  'design': {
    agent: 'architect',
    tasks: ['create-architecture', 'create-frontend-architecture', 'create-uxui-spec'],
    next: 'validation',
    artifacts: ['architecture.md', 'frontend-architecture.md', 'ux-ui-spec.md']
  },
  'validation': {
    agent: 'po',
    tasks: ['validate-artifacts', 'create-stories'],
    next: 'development',
    artifacts: ['stories/']
  },
  'development': {
    agent: 'sm',
    tasks: ['sprint-planning', 'story-refinement'],
    next: 'implementation',
    artifacts: ['sprint-plan.md']
  },
  'implementation': {
    agent: 'dev',
    tasks: ['implement-stories', 'testing'],
    next: 'delivery',
    artifacts: ['src/', 'tests/']
  }
};

// Determine current phase and recommendations
let phase = currentState?.phase || 'ideation';
let recommendations = workflow[phase];

console.log(`Current Phase: ${phase}`);
console.log(`Recommended Agent: ${recommendations.agent}`);
console.log(`Next Phase: ${recommendations.next}`);
```

## Recommendations

Based on your current progress:

### Current Phase: {{phase}}

**Recommended Actions:**
1. Work with the **{{agent}}** agent
2. Complete these tasks:
   {{tasks}}
3. Create these artifacts:
   {{artifacts}}

### Quick Actions:
- `/project:bmad become {{agent}}` - Switch to recommended agent
- `/project:do {{primary-task}}` - Execute primary task
- `/project:bmad status` - View detailed progress

### Completed Artifacts:
Let me check what you've already completed...

```javascript
// Check for existing artifacts
const artifactsDir = path.join(process.cwd(), '.bmad', 'artifacts');
const completed = [];

if (fs.existsSync(artifactsDir)) {
  const files = fs.readdirSync(artifactsDir);
  completed.push(...files);
}

if (completed.length > 0) {
  console.log('Completed artifacts:', completed);
} else {
  console.log('No artifacts completed yet');
}
```

### Next Steps:
1. **Immediate**: {{immediate-action}}
2. **Then**: {{next-action}}
3. **Finally**: {{final-action}}

Would you like me to help you with the recommended next step?