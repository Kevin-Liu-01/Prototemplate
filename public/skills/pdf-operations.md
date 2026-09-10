# PDF Operations

Choose the privacy boundary and deployment shape before choosing the tool.

## Route

| Intent | Route |
| --- | --- |
| Classify text/scanned/image/mixed input or decide which pages need OCR | `pdf-inspector` locally; retain its confidence and page-level OCR reasons |
| Read, search, answer questions, or extract text/layout | use the preflight when uncertainty or batch cost warrants it, then `liteparse`; escalate to MarkItDown, MinerU, or OmniParse by document complexity |
| One-off private merge/split/compress/edit/secure job or visual operation chain | PDFCraft in the browser or a verified local static/container build |
| Repeated batch job, server API, multi-user surface, OCR pipeline, signing, or redaction | Self-hosted Stirling-PDF |

Read `wiki/tools/pdf-operations.md` for the current source snapshot and route.
Do not upload a sensitive PDF to an unverified hosted converter.

## Procedure

1. Record the input path, requested output, sensitivity, and whether mutation or
   extraction is required.
2. Preserve the original. Choose a distinct output path; never overwrite unless
   Kevin explicitly asks after seeing the planned operation.
3. For extraction, preflight with pinned `pdf-inspector` when the corpus mixes
   born-digital, scanned, image-only, broken-font, or mixed pages. Route only
   pages that actually require OCR when the returned confidence and reasons are
   sufficient; otherwise treat the result as uncertain. Then use the installed
   document skill and parse once. Inspect page screenshots when OCR, layout,
   charts, signatures, or redactions matter.
4. For a one-off visual workflow, use PDFCraft. Prefer browser-local/offline
   execution; inspect any container or checkout before running confidential data.
5. For a repeatable service/API workflow, use Stirling-PDF. Record its image tag
   or digest, bind to localhost/private network by default, and configure auth,
   storage, logs, and egress before exposing it.
6. State the operation plan: page ranges/order, OCR language, form/annotation
   behavior, redaction regions, encryption/permissions, metadata, and expected
   page count.
7. Execute the smallest representative sample first. For a batch, get approval
   after reporting the sample result and projected scope.
8. Verify output before handoff.

## Verification Receipt

Report:

- input and output paths plus SHA-256 digests;
- tool, source/version or container image digest, and local/network boundary;
- page count and ordering before/after;
- representative visual inspection pages;
- searchable-text/OCR result when relevant;
- preflight class, confidence, per-page OCR route, and machine-readable OCR
  reason when `pdf-inspector` was used;
- redaction, signature, encryption, permission, form, and metadata behavior when
  relevant;
- failures, skipped files, and a resumable recipe for batch work.

Redaction requires visual inspection and a text/content check; drawing a black
rectangle is not proof that underlying content was removed. A successful exit
code is not document-quality proof.

## Installation Boundary

Do not globally install or deploy any application merely because this skill
fires. `pdf-inspector` is MIT, but a pinned local binding still needs a canary
against the actual document family before becoming a batch default. PDFCraft is
AGPL-3.0. Stirling-PDF's root license is MIT only outside
named directories with separate licenses. Inspect the exact source/version and
get approval before adding a persistent service, hook, container, or exposed
port.
