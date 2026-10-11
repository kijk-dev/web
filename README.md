# kijk.dev

The website for [kijk](https://github.com/kijk-dev/kijk). Built with Astro and served by Cloudflare Workers static assets.

```sh
npm install
npm run dev       # local dev server
npm run preview   # build and run in the Cloudflare runtime
npm run deploy    # build and deploy to Cloudflare
```

`public/_redirects` sends `/install.sh` and `/install.ps1` to the files of the latest GitHub release.
`public/_headers` sets the cache and security headers.
