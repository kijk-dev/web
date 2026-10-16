import { agents, totals } from './demo';

export interface Folder {
  id: string;
  repo: string;
  branch: string;
  parent: string;
  add: number;
  del: number;
  missing?: boolean;
}

const from = (id: string, parent: string): Folder => {
  const a = agents.find(x => x.id === id)!;
  return { id, repo: a.repo, branch: a.branch, parent, ...totals(a) };
};

export const folders: Folder[] = [
  from('shop-api', '~/code'),
  from('billing', '~/code'),
  from('cli', '~/code'),
  { id: 'ksml', repo: 'ksml', branch: '', parent: '~/code/worktrees', add: 0, del: 0, missing: true },
];

// The folder that kijk ~/code/docs adds in the demo; its plate is the docs agent's.
export const arriving: Folder = from('docs', '~/code');
