// What the activity bar says about the two lists, worded as kijk's app.js words it.
export type List = 'agents' | 'folders';

export interface ListCounts {
  agents: number;
  busy: number;
  finished: number;
  folders: number;
  missing: number;
}

const NAMES: Record<List, string> = { agents: 'Agents', folders: 'Folders' };
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function holds(c: ListCounts): Record<List, string> {
  const agents = [c.agents ? plural(c.agents, 'agent') : 'No running agents', c.busy && `${c.busy} busy`, c.finished && `${c.finished} finished`];
  const folders = [c.folders ? plural(c.folders, 'folder') : 'No folders yet', c.missing && `${c.missing} missing`];
  return { agents: agents.filter(Boolean).join(', '), folders: folders.filter(Boolean).join(', ') };
}

export const label = (l: List, what: string) => `${NAMES[l]}, ${what}`;
export const tip = (l: List, what: string, shown: List) => [NAMES[l], what, l !== shown && 'Ctrl+Alt+0 to show'].filter(Boolean).join('\n');
// While Folders shows, a dot on Agents says an agent is busy or finished.
export const dot = (shown: List, c: ListCounts) => (shown === 'agents' ? 'dot' : c.busy ? 'dot busy' : c.finished ? 'dot fin' : 'dot');
