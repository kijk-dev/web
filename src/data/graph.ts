export type GraphFile = { s: 'M' | 'A' | 'U'; path: string; add: number; del: number };
export type GraphCommit = { hash: string; subject: string; ago: string; refs?: string[]; files?: GraphFile[] };
export type GraphRow = { g: string; l?: number; c?: GraphCommit };

// The billing agent on feat/vat: one commit not pushed yet, and main has moved on since the split.
// g is git's text graph for the row; l is the lane colour (0 this branch, 1 the PR target, 2 main).
export const graph = {
  fork: 'f',
  open: 'h1',
  rows: [
    {
      g: '*',
      c: {
        hash: 'h1',
        subject: 'Round VAT per line',
        ago: '6m ago',
        refs: ['HEAD -> feat/vat'],
        files: [
          { s: 'M', path: 'src/invoice.ts', add: 6, del: 2 },
          { s: 'A', path: 'src/tax/round.ts', add: 14, del: 0 },
        ],
      },
    },
    {
      g: '*',
      c: {
        hash: 'h2',
        subject: 'Add VAT rates per country',
        ago: '25m ago',
        refs: ['origin/feat/vat'],
        files: [
          { s: 'A', path: 'src/tax/rates.ts', add: 38, del: 0 },
          { s: 'M', path: 'src/invoice.ts', add: 4, del: 1 },
          { s: 'A', path: 'test/rates.test.ts', add: 22, del: 0 },
        ],
      },
    },
    {
      g: '*',
      c: {
        hash: 'h3',
        subject: 'Add VAT field to invoice',
        ago: '41m ago',
        files: [
          { s: 'M', path: 'src/invoice.ts', add: 9, del: 2 },
          { s: 'M', path: 'src/schema.sql', add: 1, del: 0 },
        ],
      },
    },
    {
      g: '| *',
      l: 2,
      c: {
        hash: 'm1',
        subject: 'Bump payment SDK',
        ago: '2h ago',
        refs: ['origin/main'],
        files: [
          { s: 'M', path: 'package.json', add: 1, del: 1 },
          { s: 'M', path: 'package-lock.json', add: 12, del: 12 },
        ],
      },
    },
    {
      g: '| *',
      l: 2,
      c: {
        hash: 'm2',
        subject: 'Fix currency in receipts',
        ago: '3h ago',
        files: [
          { s: 'M', path: 'src/receipt.ts', add: 3, del: 3 },
          { s: 'M', path: 'test/receipt.test.ts', add: 8, del: 0 },
        ],
      },
    },
    { g: '|/' },
    {
      g: '*',
      c: { hash: 'f', subject: 'Tidy CLI flags', ago: '1d ago', files: [{ s: 'M', path: 'cmd/flags.ts', add: 11, del: 17 }] },
    },
    {
      g: '*',
      c: { hash: 'o', subject: 'Update README', ago: '2d ago', files: [{ s: 'M', path: 'README.md', add: 6, del: 2 }] },
    },
  ] as GraphRow[],
};
