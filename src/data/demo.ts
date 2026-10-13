export type Status = 'M' | 'A' | 'U';
export type Lang = 'go' | 'ts' | 'py' | 'tf' | 'md';

export interface Change {
  path: string;
  status: Status;
  staged?: boolean;
  lang: Lang;
  // Unified diff lines: ' ' context, '+' added, '-' removed, '@' hunk header, '!' added live by the demo.
  diff: string[];
  // Lines of the file above and below the hunk, so the Files tab can show the whole file.
  before?: string[];
  after?: string[];
  rendered?: { html: string; changed?: boolean }[];
}

export interface Agent {
  id: string;
  names: string[];
  repo: string;
  branch: string;
  busy: boolean;
  finished?: boolean;
  agoSec: number;
  pr?: { host: 'github' | 'gitlab'; num: number; title: string; checks: 'pass' | 'run'; review: string };
  ahead?: number;
  tree: string[];
  changes: Change[];
  open?: string;
  tab: 'files' | 'git';
}

export const agents: Agent[] = [
  {
    id: 'docs',
    names: ['Rewrite the install guide', 'Fix broken links'],
    repo: 'docs',
    branch: 'docs/install-guide',
    busy: true,
    agoSec: 0,
    tab: 'git',
    pr: { host: 'gitlab', num: 23, title: 'Rewrite the install guide', checks: 'run', review: 'Review required' },
    tree: ['guide/', '  install.md', '  update.md', '  setup.md', 'images/', 'README.md', 'mkdocs.yml'],
    changes: [
      {
        path: 'guide/install.md',
        status: 'M',
        lang: 'md',
        diff: [
          '@@ -1,8 +1,12 @@',
          ' # Install',
          ' ',
          '-Download the binary from the releases page and put it on your PATH.',
          '+Run one line. The script picks the right build for your system',
          '+and checks it against `checksums.txt`.',
          '+',
          '+```sh',
          '+curl -fsSL https://example.com/install.sh | sh',
          '+```',
          ' ',
          ' ## Update',
          ' ',
          '-Download the new binary and replace the old one.',
          '+Run `tool update`, or click **Update** in the status bar.',
        ],
        rendered: [
          { html: '<h1>Install</h1>' },
          { html: '<p>Run one line. The script picks the right build for your system and checks it against <code>checksums.txt</code>.</p>', changed: true },
          { html: '<pre><code>curl -fsSL https://example.com/install.sh | sh</code></pre>', changed: true },
          { html: '<h2>Update</h2>' },
          { html: '<p>Run <code>tool update</code>, or click <b>Update</b> in the status bar.</p>', changed: true },
        ],
      },
      {
        path: 'guide/update.md',
        status: 'M',
        lang: 'md',
        before: ['# Update', '', 'Click Update when the status bar offers it.'],
        diff: [
          '@@ -4,3 +4,3 @@',
          ' The update keeps your settings.',
          '-See the [old guide](./setup.md) for details.',
          '+See the [install guide](./install.md) for details.',
          ' ',
        ],
        rendered: [
          { html: '<h1>Update</h1>' },
          { html: '<p>Click Update when the status bar offers it. The update keeps your settings.</p>' },
          { html: '<p>See the <a>install guide</a> for details.</p>', changed: true },
        ],
      },
    ],
  },
  {
    id: 'search',
    names: ['Speed up search ranking'],
    repo: 'search-perf-rank',
    branch: 'perf/rank',
    busy: true,
    agoSec: 0,
    tab: 'git',
    tree: ['rank/', '  __init__.py', '  score.py', '  tokens.py', 'tests/', 'pyproject.toml', 'README.md'],
    changes: [
      {
        path: 'rank/score.py',
        status: 'M',
        lang: 'py',
        before: [
          '"""Ranking for search results."""',
          '',
          '',
          'def score(doc, query):',
          '    """How well doc matches query, from 0 up."""',
          '    if not query:',
          '        return 0.0',
        ],
        after: ['    ranked = sorted(docs, key=lambda d: score(d, query), reverse=True)', '    return ranked[:limit]'],
        diff: [
          '@@ -8,7 +8,7 @@ def score(doc, query):',
          '-    terms = query.lower().split()',
          '-    hits = 0',
          '-    for term in terms:',
          '-        hits += doc.text.lower().count(term)',
          '-    return hits / max(len(doc.text), 1)',
          '+    terms = set(query.lower().split())',
          '+    words = doc.words  # lower-cased once, at index time',
          '+    hits = sum(words.count(t) for t in terms)',
          '+    boost = 2.0 if terms & doc.title_words else 1.0',
          '+    return boost * hits / max(len(words), 1)',
          ' ',
          ' ',
          ' def rank(docs, query, limit=20):',
        ],
      },
    ],
  },
  {
    id: 'shop-api',
    names: ['Fix token refresh'],
    repo: 'shop-api',
    branch: 'fix/token-refresh',
    busy: true,
    agoSec: 0,
    tab: 'git',
    pr: { host: 'github', num: 142, title: 'Fix token refresh race', checks: 'run', review: 'Review required' },
    open: 'internal/auth/refresh.go',
    tree: ['cmd/', 'internal/', '  auth/', '    clock.go', '    refresh.go', '    refresh_test.go', '    token.go', '  billing/', 'go.mod', 'go.sum', 'README.md'],
    changes: [
      {
        path: 'internal/auth/refresh.go',
        status: 'M',
        lang: 'go',
        before: [
          'package auth',
          '',
          'import (',
          '\t"context"',
          '\t"fmt"',
          '\t"sync"',
          '\t"time"',
          ')',
          '',
          '// Refresher renews the API token before it expires.',
          'type Refresher struct {',
          '\tmu            sync.Mutex',
          '\tevery, margin time.Duration',
          '}',
          '',
          '',
          'func (r *Refresher) Run(ctx context.Context) error {',
        ],
        diff: [
          '@@ -18,14 +18,29 @@ func (r *Refresher) Run(ctx context.Context) error {',
          '\tticker := time.NewTicker(r.every)',
          '\tdefer ticker.Stop()',
          '\tfor {',
          '\t\tselect {',
          '\t\tcase <-ctx.Done():',
          '\t\t\treturn ctx.Err()',
          '\t\tcase <-ticker.C:',
          '-\t\t\ttok, err := r.store.Current()',
          '-\t\t\tif err != nil {',
          '-\t\t\t\treturn err',
          '-\t\t\t}',
          '-\t\t\tif time.Until(tok.Expiry) < r.margin {',
          '-\t\t\t\tr.refresh(ctx, tok)',
          '-\t\t\t}',
          '+\t\t\tif err := r.refreshIfDue(ctx); err != nil {',
          '+\t\t\t\tr.log.Warn("token refresh failed", "err", err)',
          '!\t\t\t\tr.metrics.RefreshFailed.Inc()',
          '+\t\t\t}',
          '\t\t}',
          '\t}',
          '}',
          '+',
          '+// refreshIfDue holds the lock, so two ticks never refresh the same token.',
          '+func (r *Refresher) refreshIfDue(ctx context.Context) error {',
          '+\tr.mu.Lock()',
          '+\tdefer r.mu.Unlock()',
          '+\ttok, err := r.store.Current()',
          '+\tif err != nil {',
          '+\t\treturn fmt.Errorf("read token: %w", err)',
          '+\t}',
          '+\tif r.clock.Until(tok.Expiry) >= r.margin {',
          '+\t\treturn nil',
          '+\t}',
          '+\treturn r.refresh(ctx, tok)',
          '+}',
        ].map(l => (/^[ +\-@!]/.test(l) ? l : ' ' + l)),
      },
      {
        path: 'internal/auth/refresh_test.go',
        status: 'M',
        lang: 'go',
        before: [
          'package auth',
          '',
          'import (',
          '\t"context"',
          '\t"sync"',
          '\t"testing"',
          '\t"time"',
          ')',
          '',
          'func TestRefreshExpired(t *testing.T) {',
          '\tif err := newTestRefresher(&fakeStore{}).refreshIfDue(context.Background()); err != nil {',
        ],
        diff: [
          '@@ -12,3 +12,17 @@ func TestRefreshExpired(t *testing.T) {',
          ' \t\tt.Fatal(err)',
          ' \t}',
          ' }',
          '+',
          '+func TestRefreshTwoTicksOneCall(t *testing.T) {',
          '+\tstore := &fakeStore{tok: expiringIn(time.Second)}',
          '+\tr := newTestRefresher(store)',
          '+\tvar wg sync.WaitGroup',
          '+\tfor range 2 {',
          '+\t\twg.Add(1)',
          '+\t\tgo func() { defer wg.Done(); r.refreshIfDue(context.Background()) }()',
          '+\t}',
          '+\twg.Wait()',
          '+\tif store.calls != 1 {',
          '+\t\tt.Fatalf("refresh calls = %d, want 1", store.calls)',
          '+\t}',
          '+}',
        ],
      },
      {
        path: 'internal/auth/clock.go',
        status: 'U',
        lang: 'go',
        diff: [
          '@@ -0,0 +1,11 @@',
          '+package auth',
          '+',
          '+import "time"',
          '+',
          '+// Clock lets tests move time without sleeping.',
          '+type Clock interface {',
          '+\tUntil(t time.Time) time.Duration',
          '+}',
          '+',
          '+type realClock struct{}',
          '+',
          '+func (realClock) Until(t time.Time) time.Duration { return time.Until(t) }',
        ],
      },
    ],
  },
  {
    id: 'infra',
    names: ['Plan the VPC'],
    repo: 'infra',
    branch: 'tf/vpc',
    busy: true,
    agoSec: 190,
    pr: { host: 'gitlab', num: 8, title: 'Plan the VPC', checks: 'pass', review: 'Review required' },
    tab: 'files',
    tree: ['modules/', 'network/', '  main.tf', '  vpc.tf', '  outputs.tf', 'providers.tf', 'README.md'],
    changes: [
      {
        path: 'network/vpc.tf',
        status: 'U',
        lang: 'tf',
        diff: [
          '@@ -0,0 +1,12 @@',
          '+resource "aws_vpc" "main" {',
          '+  cidr_block           = "10.20.0.0/16"',
          '+  enable_dns_hostnames = true',
          '+  tags                 = { Name = "main" }',
          '+}',
          '+',
          '+resource "aws_subnet" "private" {',
          '+  count             = 3',
          '+  vpc_id            = aws_vpc.main.id',
          '+  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 4, count.index)',
          '+  availability_zone = data.aws_availability_zones.all.names[count.index]',
          '+}',
        ],
      },
    ],
  },
  {
    id: 'billing',
    names: ['Add VAT to invoices'],
    repo: 'billing',
    branch: 'feat/vat',
    busy: false,
    finished: true,
    agoSec: 260,
    tab: 'git',
    pr: { host: 'github', num: 57, title: 'Add VAT to invoices', checks: 'pass', review: 'Approved' },
    tree: ['src/', '  invoice.ts', '  tax/', '    rates.ts', '    vat.test.ts', 'package.json', 'tsconfig.json'],
    changes: [
      {
        path: 'src/invoice.ts',
        status: 'M',
        lang: 'ts',
        before: ["import { rates } from './tax/rates';", "import type { Line, Money } from './types';", '', 'export function total(lines: Line[]): Money {'],
        diff: [
          '@@ -5,4 +5,12 @@ export function total(lines: Line[]): Money {',
          '   const net = lines.reduce((sum, l) => sum + l.price * l.qty, 0);',
          '-  return { net, gross: net };',
          '+  const vat = vatFor(lines);',
          '+  return { net, vat, gross: net + vat };',
          ' }',
          '+',
          '+function vatFor(lines: Line[]): number {',
          '+  return lines.reduce((sum, l) => {',
          '+    const rate = rates[l.country] ?? 0;',
          '+    return sum + Math.round(l.price * l.qty * rate);',
          '+  }, 0);',
          '+}',
        ],
      },
      {
        path: 'src/tax/rates.ts',
        status: 'M',
        lang: 'ts',
        diff: [
          '@@ -1,3 +1,6 @@',
          ' export const rates: Record<string, number> = {',
          '-  NL: 0.2,',
          '+  NL: 0.21,',
          '+  BE: 0.21,',
          '+  DE: 0.19,',
          '+  FR: 0.2,',
          ' };',
        ],
      },
      {
        path: 'src/tax/vat.test.ts',
        status: 'A',
        staged: true,
        lang: 'ts',
        diff: [
          '@@ -0,0 +1,7 @@',
          "+import { total } from '../invoice';",
          '+',
          "+test('adds Dutch VAT', () => {",
          "+  const t = total([{ price: 1000, qty: 2, country: 'NL' }]);",
          '+  expect(t.vat).toBe(420);',
          '+  expect(t.gross).toBe(2420);',
          '+});',
        ],
      },
    ],
  },
  {
    id: 'mobile',
    names: ['Quiet hours for push'],
    repo: 'mobile-app',
    branch: 'feat/push',
    busy: false,
    agoSec: 1340,
    tab: 'git',
    tree: ['src/', '  App.tsx', '  push.ts', '  settings.ts', 'app.json', 'package.json'],
    changes: [
      {
        path: 'src/App.tsx',
        status: 'M',
        lang: 'ts',
        before: [
          "import { useEffect } from 'react';",
          "import { registerPush } from './push';",
          "import { useSettings } from './settings';",
          "import { Home } from './Home';",
          '',
          'export default function App() {',
          '  const settings = useSettings();',
          '',
        ],
        after: ['  return <Home />;', '}'],
        diff: [
          '@@ -9,5 +9,5 @@ export default function App() {',
          '   useEffect(() => {',
          '-    registerPush();',
          '+    registerPush({ quietHours: settings.quietHours });',
          '   }, [settings.quietHours]);',
          ' ',
        ],
      },
    ],
  },
  {
    id: 'cli',
    names: ['Tidy CLI flags'],
    repo: 'cli',
    branch: 'main',
    busy: false,
    agoSec: 3900,
    tab: 'files',
    tree: ['cmd/', '  root.go', '  flags.go', 'internal/', 'go.mod', 'README.md'],
    changes: [],
  },
];

export function counts(c: Change) {
  let add = 0;
  let del = 0;
  for (const l of c.diff) {
    if (l[0] === '+') add++;
    else if (l[0] === '-') del++;
  }
  return { add, del };
}

export function totals(a: Agent) {
  return a.changes.map(counts).reduce((t, c) => ({ add: t.add + c.add, del: t.del + c.del }), { add: 0, del: 0 });
}

export function ago(sec: number) {
  if (sec < 60) return 'just now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

const KEYWORDS: Record<Lang, string[]> = {
  go: ['func', 'return', 'if', 'err', 'for', 'range', 'select', 'case', 'defer', 'var', 'type', 'struct', 'interface', 'package', 'import', 'go', 'nil', 'true', 'false'],
  ts: ['const', 'let', 'return', 'function', 'export', 'import', 'from', 'default', 'true', 'false'],
  py: ['def', 'return', 'for', 'in', 'if', 'else', 'not', 'and', 'or', 'import', 'from'],
  tf: ['resource', 'data', 'true', 'false'],
  md: [],
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// A small tokenizer: enough to colour the demo's own snippets the way kijk does.
export function highlight(src: string, lang: Lang): string {
  if (lang === 'md') {
    if (/^#/.test(src)) return `<span class="hk">${esc(src)}</span>`;
    return esc(src).replace(/`[^`]*`/g, m => `<span class="hs">${m}</span>`);
  }
  const kw = new Set(KEYWORDS[lang]);
  const comment = lang === 'py' ? '#' : '//';
  const re = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|(.)/g;
  let out = '';
  let rest = src;
  const ci = src.indexOf(comment);
  let tail = '';
  if (ci >= 0 && !/["'`]/.test(src.slice(0, ci).replace(/"[^"]*"|'[^']*'/g, ''))) {
    rest = src.slice(0, ci);
    tail = `<span class="hc">${esc(src.slice(ci))}</span>`;
  }
  let m: RegExpExecArray | null;
  while ((m = re.exec(rest))) {
    const [tok, str, num, word] = m;
    if (str) out += `<span class="hs">${esc(str)}</span>`;
    else if (num) out += `<span class="hn">${num}</span>`;
    else if (word) {
      const next = rest.slice(m.index + tok.length);
      if (kw.has(word)) out += `<span class="hk">${word}</span>`;
      else if (next.startsWith('(')) out += `<span class="hf">${word}</span>`;
      else if (/^[A-Z]/.test(word)) out += `<span class="ht">${word}</span>`;
      else out += word;
    } else out += esc(tok);
  }
  return out + tail;
}

export interface Row {
  kind: 'ctx' | 'add' | 'del' | 'sep' | 'live';
  old?: number;
  new?: number;
  html: string;
}

export function rows(c: Change): Row[] {
  let o = 0;
  let n = 0;
  return c.diff.map(line => {
    const mark = line[0];
    const text = line.slice(1).replace(/\t/g, '    ');
    if (mark === '@') {
      const h = /-(\d+)(?:,\d+)? \+(\d+)/.exec(line);
      o = h ? +h[1] : 0;
      n = h ? +h[2] : 0;
      return { kind: 'sep', html: esc(line.slice(0)) };
    }
    if (mark === '-') return { kind: 'del', old: o++, html: highlight(text, c.lang) };
    if (mark === '+') return { kind: 'add', new: n++, html: highlight(text, c.lang) };
    if (mark === '!') return { kind: 'live', new: n++, html: highlight(text, c.lang) };
    return { kind: 'ctx', old: o++, new: n++, html: highlight(text, c.lang) };
  });
}

export interface FileRow {
  mark?: 'add' | 'mod' | 'del';
  live?: boolean;
  html: string;
}

// The new side of the file with kijk's gutter marks: added, changed, and a notch where lines were deleted.
export function fileRows(c: Change): FileRow[] {
  const out: FileRow[] = [];
  let dels = 0;
  let adds = 0;
  let notch = false;
  const push = (text: string, mark?: FileRow['mark'], live = false) => {
    if (notch && !mark) mark = 'del';
    notch = false;
    out.push({ mark, live, html: highlight(text.replace(/\t/g, '    '), c.lang) });
  };
  const close = () => {
    if (dels && !adds) notch = true;
    dels = adds = 0;
  };
  (c.before ?? []).forEach(t => push(t));
  for (const line of c.diff) {
    const m = line[0];
    if (m === '@') continue;
    if (m === '-') dels++;
    else if (m === '+' || m === '!') {
      adds++;
      push(line.slice(1), dels ? 'mod' : 'add', m === '!');
    } else {
      close();
      push(line.slice(1));
    }
  }
  close();
  (c.after ?? []).forEach(t => push(t));
  return out;
}

// Demo agents on a remote machine, for the machines section.
export const devbox: Agent[] = [
  {
    id: 'spam-model',
    names: ['Retrain the spam filter'],
    repo: 'spam-model',
    branch: 'feat/retrain',
    busy: true,
    agoSec: 2,
    tree: [],
    tab: 'git',
    changes: [
      {
        path: 'train.py',
        status: 'M',
        lang: 'py',
        diff: [
          '@@ -18,12 +18,16 @@ def train(cfg):',
          ' def train(cfg):',
          '     model = build_model(cfg)',
          '-    opt = torch.optim.SGD(model.parameters(), lr=cfg.lr)',
          '+    opt = torch.optim.AdamW(model.parameters(), lr=cfg.lr, weight_decay=0.01)',
          '+    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, cfg.epochs)',
          '     for epoch in range(cfg.epochs):',
          '         for batch in loader(cfg):',
          '             loss = model(batch).loss',
          '             loss.backward()',
          '             opt.step()',
          '             opt.zero_grad()',
          '-        print(epoch, loss)',
          '+        sched.step()',
          '+        log(epoch, loss.item(), sched.get_last_lr())',
          '+    save(model, cfg.out)',
          '     return model',
        ],
      },
      {
        path: 'data/loader.py',
        status: 'M',
        lang: 'py',
        diff: ['@@ -4,3 +4,4 @@', '-BATCH = 32', '+BATCH = 128', '+WORKERS = 8', ' '],
      },
      {
        path: 'notes/run-42.md',
        status: 'A',
        lang: 'md',
        diff: ['@@ -0,0 +1,4 @@', '+# Run 42', '+', '+AdamW, cosine schedule, batch 128.', '+Val F1 0.941 (was 0.917).'],
      },
    ],
  },
  {
    id: 'db-ops',
    names: ['Upgrade Postgres to 17'],
    repo: 'db-ops',
    branch: 'chore/pg17',
    busy: false,
    finished: true,
    agoSec: 380,
    tree: [],
    tab: 'git',
    changes: [
      {
        path: 'postgres.tf',
        status: 'M',
        lang: 'tf',
        diff: [
          '@@ -1,8 +1,8 @@',
          ' resource "postgres_cluster" "main" {',
          '   name    = "orders"',
          '-  version = "16.4"',
          '+  version = "17.2"',
          '   size    = "large"',
          '-  params  = "pg16-default"',
          '+  params  = "pg17-default"',
          ' }',
        ],
      },
    ],
  },
];
