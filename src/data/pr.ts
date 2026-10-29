import { agents, type Status } from './demo';
import { folders, type Folder } from './folders';

// The scene of `kijk <PR link>`: the same machine as the hero, but with no clone of billing yet.
export const before = {
  agents: agents.filter(a => a.id !== 'billing'),
  folders: folders.filter(f => f.id !== 'billing'),
};

export const clone: Folder = {
  id: 'billing',
  repo: 'billing',
  branch: 'main',
  parent: '~/.cache/kijk/clones/github.com/acme',
  add: 0,
  del: 0,
};

export const pr = {
  link: 'https://github.com/acme/billing/pull/12',
  num: 12,
  title: 'Show VAT per line on the PDF',
  author: 'mira',
  head: 'vat-lines',
  base: 'main',
  review: 'Review required',
  description: 'Each invoice line now shows its VAT rate and amount. Totals round once, at the end.',
  jobs: ['lint', 'test', 'build'],
  files: [
    { path: 'src/pdf/invoice.ts', status: 'M', add: 24, del: 6 },
    { path: 'src/pdf/vat-line.ts', status: 'A', add: 31, del: 0 },
    { path: 'src/pdf/invoice.test.ts', status: 'A', add: 48, del: 0 },
  ] satisfies { path: string; status: Status; add: number; del: number }[],
};

// What kijk prints for a link with no clone.
export const said = [
  'No clone of github.com/acme/billing in 23 folders on this machine.',
  `Cloning it with gh into ${clone.parent}/billing …`,
  "Cloning into '…/billing+part-5121'...",
  `Added billing and opened #${pr.num}. It is open in the kijk window.`,
];
