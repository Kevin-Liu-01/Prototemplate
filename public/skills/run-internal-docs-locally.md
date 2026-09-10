# Run Internal Docs Locally

## Configure the checkout

1. Locate the intended `generaltranslation/company` checkout. Require the canonical Markdown corpus, including `README.md` and `standards/document-metadata.md`; do not clone, pull, or modify a checkout unless the user requested it.
2. Set the absolute path in `apps/internal-docs/.env.local`:

   ```dotenv
   COMPANY_DOCS_PATH="/absolute/path/to/company"
   ```

3. Preserve all existing secrets. Never print `.env.local` or expose OAuth credentials.
4. Make the dev-server port match `INTERNAL_DOCS_AUTH_URL`. An origin mismatch causes Better Auth to reject Google sign-in before OAuth starts.

## Start development

Run the app from `apps/internal-docs` using the port encoded in `INTERNAL_DOCS_AUTH_URL`. For a local auth URL on port 3000:

```bash
pnpm exec next dev --turbopack --port 3000
```

Live content mode activates only when both conditions hold:

- `NODE_ENV` is `development`.
- `COMPANY_DOCS_PATH` is explicitly set.

The open page polls `/api/dev/company-content-version` and refreshes when the canonical Markdown corpus changes. The compatibility index is derived again from source in this mode. Production keeps the immutable checkout snapshot, cached derived index, and statically generated docs pages.

## Edit content

- Edit Markdown bodies normally; the current page refreshes automatically.
- After adding, removing, or renaming collection documents, run this in the company checkout:

  ```bash
  npm run docs:generate
  ```

  This refreshes generated collection README contents. Navigation and metadata derive directly from the Markdown sources.
- Restart the dev server after changing `COMPANY_DOCS_PATH` itself because the resolved checkout root is cached per process.

## Verify

1. Open an existing `/docs/...` page and confirm the local checkout's content renders.
2. Confirm authenticated development requests to `/api/dev/company-content-version?documentPath=<encoded-path.md>` return `200`.
3. Make a requested content edit and confirm the already-open page updates without a manual reload. Do not make disposable edits in the user's real company checkout; use a temporary copy when a synthetic test is necessary.
4. Run:

   ```bash
   pnpm test
   pnpm typecheck
   ```

5. When changing the live-reload implementation, stop `next dev` before running the production build because both use `.next`. Confirm the build reports `● /docs/[[...slug]]` as SSG, then restart development.

## Troubleshoot

- `Invalid origin`: align the browser port and `INTERNAL_DOCS_AUTH_URL`, then restart.
- Markdown stays stale: confirm the explicit path, the version endpoint, and that the edited file is the path shown in the endpoint request.
- Sidebar or metadata stays stale: confirm the document has valid frontmatter and an H1 title, then check the content-version endpoint.
- Missing checkout: confirm the absolute path contains `README.md` and `standards/document-metadata.md`.
- Never expose the dev refresh endpoint in production, weaken docs authentication, or replace production snapshot caching with live filesystem reads.
