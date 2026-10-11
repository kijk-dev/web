## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

To test in the Cloudflare runtime, run `npm run preview` (http://localhost:8787).

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Adding styles](https://docs.astro.build/en/guides/styling/)
- [Deploying to Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/)

## Home page

The home page shows a working copy of the kijk window (`src/components/KijkWindow.astro`, demo data in `src/data/demo.ts`). It follows the app's UI in the `web/` folder of `kijk-dev/kijk`. Keep it in step with the app, and keep the demo agents labelled as demo.

## Style

- Call kijk an "agent-native code viewer" and say "agents".
- Claude Code is supported today. Codex and Pi are planned.
- Keep every claim in line with the kijk README. Leave out "no telemetry", "listens only on 127.0.0.1" and lists of missing features: these are planned to change.
- Use Recursive for all text: Casual 800 for headlines, Linear for text, Mono for code.
- Use the brand colors: Ink `#191d23`, Paper `#f5f7f9`, Glass Blue `#1e66ca`, Sky Blue `#74a6ef`, Ember `#e9a03e`, Ember Deep `#a86003`.
- Keep code snippets copy-pasteable with explicit language tags.
