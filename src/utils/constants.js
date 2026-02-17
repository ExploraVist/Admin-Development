export const ADMIN_EMAILS = [
  'babraham@g.hmc.edu',
  'exploravist@exploravist.net',
  'dom@exploravist.net',
];

export const TEAMS = [
  { slug: 'cloud-development', label: 'Cloud Development' },
  { slug: 'app-development', label: 'App Development' },
  { slug: 'embedded-development', label: 'Embedded Development' },
  { slug: 'web-development', label: 'Web Development' },
  { slug: 'ml-development', label: 'ML Development' },
  { slug: 'design', label: 'Design' },
  { slug: 'operations', label: 'Operations' },
];

export const STATUSES = [
  { value: 'not-started', label: 'Not Started' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'in-review', label: 'In Review' },
  { value: 'completed', label: 'Completed' },
];

export const PRIORITIES = [
  { value: 1, label: 'Low', color: '#4ade80' },
  { value: 2, label: 'Medium', color: '#facc15' },
  { value: 3, label: 'High', color: '#ef4444' },
];

export const TEAM_MAP = Object.fromEntries(TEAMS.map(t => [t.slug, t.label]));
export const STATUS_MAP = Object.fromEntries(STATUSES.map(s => [s.value, s.label]));
export const PRIORITY_MAP = Object.fromEntries(PRIORITIES.map(p => [p.value, p]));
