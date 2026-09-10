# Effective LiteParse

Extract text from documents locally with the `lit` CLI. This skill is about using LiteParse cheaply:
each `lit parse` call re-runs extraction, and every dumped line stays in context on later turns.

## Golden Rule

Parse once to a file, then search that file.

```bash
lit parse "/abs/path/doc.pdf" --format text --no-ocr -o /tmp/doc.txt && wc -l /tmp/doc.txt
```

Use `--no-ocr` for born-digital PDFs. Drop it only for scanned PDFs or images.

## Choose the output for the job

- Use `--format text` for bounded grep/BM25 question answering. It is the
  smallest useful working representation.
- Use `--format markdown` when headings, lists, links, table structure, and
  reading order are part of the answer or downstream artifact.
- Use JSON when coordinates, page provenance, or programmatic layout inspection
  matter. Keep the JSON on disk and query only the needed records.

Do not select Markdown because a launch benchmark called it universally more
accurate. Parser quality varies by document class; test representative inputs,
inspect tables and multi-column pages, and escalate complex or scanned pages.
Whichever output you choose, parse once and reuse it.

## Search Discipline

Get context in the same command instead of grepping and then doing a second read:

```bash
grep -n -i -C4 "total assets" /tmp/doc.txt | head -40
```

Batch independent lookups into one command:

```bash
for q in "carbon intensity" "scope 1" "total revenue"; do
  echo "=== $q ==="
  grep -n -i -C3 "$q" /tmp/doc.txt | head -25
done
```

Keep output bounded with `head`. Aim to resolve a question in three search commands or fewer. If
two targeted greps do not find the answer, switch to the bundled BM25 helper instead of trying one
keyword variant per turn.

## Ranked Search

Use the helper when keywords are uncertain:

```bash
./skills/engineering/liteparse/scripts/search.py /tmp/doc.txt \
  -q "materiality assessment priority topics" \
  -k 8 \
  -e 5
```

`-k` is the number of matches. `-e` is the number of context lines before and after each match.

## Born-Digital Vs Scanned

- Born-digital PDFs usually have a text layer. Use `--no-ocr`.
- Scanned PDFs and images need OCR. If digits look wrong, inspect the page visually rather than
  trusting OCR blindly.

## Visual Page Reads

Only screenshot when text search cannot answer the question: dense tables, figures, charts, or bad
OCR. Render one page at modest DPI.

```bash
lit screenshot "/abs/path/doc.pdf" --target-pages "13" --dpi 150 -o /tmp/shots/
```

Do not start at 300 DPI, and do not re-render the same page unless the first image is illegible.

## Many Questions About One Document

Keep `/tmp/doc.txt` and reuse it across questions. Do not reparse the same document for each
question.

## Setup

PDFs work out of the box. If `lit` is missing:

```bash
npm i -g @llamaindex/liteparse
```

Office documents require LibreOffice. Images require ImageMagick. Both are converted into PDF before
LiteParse extraction.
