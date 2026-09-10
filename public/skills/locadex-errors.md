# Locadex Error Handling

All errors thrown in locadex workflow/activity/processing code **must** use typed error classes from `@generaltranslation/locadex/errors`. Never throw generic `new Error()` in workflow-related code.

## Error Classes

Import from `@generaltranslation/locadex/errors`:

| Error class | When to use |
|---|---|
| `GitCloneError` | Git clone failures (network, auth, DNS) |
| `GitPushError` | Git push failures — pass a `kind` (`'auth'`, `'branch_conflict'`, `'not_found'`, `'network'`, `'unknown'`) |
| `GitCommitError` | Git commit failures |
| `IOError` | Filesystem / infra I/O errors |
| `SandboxError` | Sandbox provisioning or execution errors |
| `DryRunError` | Dry-run validation failures |
| `ValidationError` | Project/config validation failures |
| `ConfigError` | Bad user configuration (unsupported framework, missing settings) |
| `LocadexRunError` | Locadex-core CLI errors |
| `TranslationError` | Translation step failures (API timeouts, etc.) |
| `CustomCommandError` | User's pre/post-process command failures — pass `commandType` (`'preprocess'` or `'postprocess'`) |
| `DataError` | Missing or corrupted data (null repo path, missing project, unknown step type) |
| `AbortWorkflowError` | Workflow aborted intentionally |
| `WorkflowCancelledError` | Workflow cancelled by user |
| `WorkflowTimeoutError` | Workflow exceeded time limit |

## Rules

1. **Always throw a specific error class** — `withStepTracking` uses `toLocadexError()` as a fallback, but relying on it loses error metadata (code, source, severity, customer message).
2. **Never throw generic `new Error()`** in any file under `temporal/`, `processing/`, `helpers/`, or `utils/` (except `env.ts` startup validation).
3. **Error metadata is set by the class itself** — do not manually set `errorCode`, `customerMessage`, `source`, or `severity` at the call site. If you need new metadata, create a new error class or extend an existing one.
4. **For user-caused errors**, use classes with `source = 'USER'` (`ConfigError`, `ValidationError`, `DryRunError`, `CustomCommandError`, `WorkflowCancelledError`). These surface `detail` to the customer and skip Slack alerts.
5. **For internal errors**, use classes with `source = 'INTERNAL'`. These hide `detail` from customers and trigger Slack alerts on `FATAL` severity.
6. **Severity drives workflow behavior**: `FATAL`/`ERROR` stops the DAG, `WARNING` records the failure but continues. Only `DryRunError` and `CustomCommandError` have configurable severity — pass it via the constructor if the user's project settings override the default.
7. **`toLocadexError()`** is only a safety net in `withStepTracking` for truly unexpected errors. It wraps unknown errors as `INTERNAL_ERROR`. New code should never rely on this.

## Example

```typescript
import { DataError } from '@generaltranslation/locadex/errors';

if (!workflow.repo_path) {
  throw new DataError('Repo path not found — cannot proceed');
}
```
