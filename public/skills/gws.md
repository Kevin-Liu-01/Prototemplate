# Google Workspace

Use this as the single executable router for Google Workspace work.

## Routing

- Start with the shared reference for auth, global flags, pagination, output formats, and shell quoting.
- Route each service to its folded reference: Gmail, Drive, Calendar, Docs, Sheets, Slides, or Tasks.
- Use read/list/get before write actions; ask before sending email, uploading files, changing docs/sheets/slides, creating calendar events, or mutating tasks.

## Reference Loading

Load one folded reference at a time. Prefer the most specific reference that matches the user's named service, framework, command, or error. If no folded reference matches, use the router guidance here and verify with primary docs or local project state.

<!-- folded-skills:auto:start -->
## Folded Skill References

These former standalone skills are bundled here as references to keep the runtime list compact. Load only the reference that matches the user's exact product, framework, or failure mode.

| Former skill | Reference | Description |
| --- | --- | --- |
| `gws-calendar` | [`references/skills/gws-calendar/SKILL.md`](references/skills/gws-calendar/SKILL.md) | Use Google Workspace Calendar CLI skills to list, read, manage, and inspect Google Calendar calendars and events before creating or changing them. |
| `gws-calendar-agenda` | [`references/skills/gws-calendar-agenda/SKILL.md`](references/skills/gws-calendar-agenda/SKILL.md) | Use Google Workspace Calendar agenda workflows to read upcoming events, summarize recent schedules, and inspect calendars across accounts. |
| `gws-calendar-insert` | [`references/skills/gws-calendar-insert/SKILL.md`](references/skills/gws-calendar-insert/SKILL.md) | Use Google Workspace Calendar insert workflows to create a Google Calendar event after confirming calendar, time, guests, and user intent. |
| `gws-docs` | [`references/skills/gws-docs/SKILL.md`](references/skills/gws-docs/SKILL.md) | Use Google Workspace Docs CLI workflows to read, write, inspect, and update Google Docs documents after confirming the target document. |
| `gws-docs-write` | [`references/skills/gws-docs-write/SKILL.md`](references/skills/gws-docs-write/SKILL.md) | Google Docs write helper. Append text to a Google Doc using the gws CLI after reading shared auth/security rules. WHEN: append to a document, write to Google Docs, add text to a doc, update a Google Doc. |
| `gws-drive` | [`references/skills/gws-drive/SKILL.md`](references/skills/gws-drive/SKILL.md) | Use Google Workspace Drive CLI workflows to search, list, read metadata, manage files, folders, and shared drives in Google Drive. |
| `gws-drive-upload` | [`references/skills/gws-drive-upload/SKILL.md`](references/skills/gws-drive-upload/SKILL.md) | Use Google Workspace Drive upload workflows to upload files to Google Drive with metadata after confirming destination and sharing intent. |
| `gws-gmail` | [`references/skills/gws-gmail/SKILL.md`](references/skills/gws-gmail/SKILL.md) | Use Google Workspace Gmail CLI workflows to read, search, summarize, send, and manage Gmail messages while confirming before any email mutation. |
| `gws-gmail-read` | [`references/skills/gws-gmail-read/SKILL.md`](references/skills/gws-gmail-read/SKILL.md) | Use Google Workspace Gmail read workflows to read Gmail messages, summarize recent email, extract bodies or headers, and inspect threads safely. |
| `gws-gmail-send` | [`references/skills/gws-gmail-send/SKILL.md`](references/skills/gws-gmail-send/SKILL.md) | Use Google Workspace Gmail send workflows to draft and send Gmail email only after explicit confirmation of recipient, subject, and body. |
| `gws-gmail-triage` | [`references/skills/gws-gmail-triage/SKILL.md`](references/skills/gws-gmail-triage/SKILL.md) | Gmail triage helper. Show unread inbox summaries with sender, subject, date, labels, query filters, and JSON output using the gws CLI. WHEN: triage inbox, summarize unread Gmail, show unread messages, review Gmail quickly. |
| `gws-shared` | [`references/skills/gws-shared/SKILL.md`](references/skills/gws-shared/SKILL.md) | gws CLI: Shared patterns for authentication, global flags, and output formatting. |
| `gws-sheets` | [`references/skills/gws-sheets/SKILL.md`](references/skills/gws-sheets/SKILL.md) | Use Google Workspace Sheets CLI workflows to read, write, inspect, and update Google Sheets spreadsheets after confirming target range. |
| `gws-sheets-append` | [`references/skills/gws-sheets-append/SKILL.md`](references/skills/gws-sheets-append/SKILL.md) | Google Sheets append helper. Append rows or JSON arrays to a spreadsheet and target a tab/range using the gws CLI. WHEN: append to sheet, add row to spreadsheet, write Google Sheets data, log rows. |
| `gws-sheets-read` | [`references/skills/gws-sheets-read/SKILL.md`](references/skills/gws-sheets-read/SKILL.md) | Use Google Workspace Sheets read workflows to read values from Google Sheets, inspect spreadsheet ranges, and summarize tabular data. |
| `gws-slides` | [`references/skills/gws-slides/SKILL.md`](references/skills/gws-slides/SKILL.md) | Google Slides helper. Read, create, and batch-update presentations, pages, and presentation resources through the gws CLI. WHEN: create slides, edit a Google Slides deck, inspect a presentation, batch update slides. |
| `gws-tasks` | [`references/skills/gws-tasks/SKILL.md`](references/skills/gws-tasks/SKILL.md) | Google Tasks helper. Manage task lists and tasks through the gws CLI, including list/get/insert/update/delete/move operations. WHEN: create a task, update tasks, list Google Tasks, manage task lists. |
<!-- folded-skills:auto:end -->
## Related Skills

- `find-skills` for upstream skill discovery before adding new children
- `skill-creator` for pruning or extending this router
