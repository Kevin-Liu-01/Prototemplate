'use client';

import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';

import { MAX_IMAGE_BYTES, MAX_MARK_BYTES, MAX_UPLOAD_BYTES } from '@/lib/vote/config';
import { MAX_BATCH } from '@/lib/vote/decisions';
import type { AdminOption, DecisionKind, DecisionMeta } from '@/lib/vote/types';

import { adminPath } from '../../api';
import type { Problem } from '../../api';
import Face, { plateClass } from '../../Face';
import { useHydrated } from '../../useHydrated';
import type { Change } from '../useAdminPanel';

/* the multipart fields POST /api/vote/admin/d/[id]/options reads: one or
   more files, or the lines of a text decision; a replace names the key */
const FIELD_FILE = 'file';
const FIELD_LINES = 'lines';
const FIELD_REPLACE = 'replace';
const FIELD_CHECK = 'check';

/* room for the multipart boundaries and headers inside one request */
const BATCH_BYTES = MAX_UPLOAD_BYTES - 64 * 1024;

const ACCEPT: Readonly<Record<Exclude<DecisionKind, 'text'>, string>> = {
  mark: '.svg,.png,image/svg+xml,image/png',
  image: '.svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp',
};

function maxBytes(kind: DecisionKind): number {
  return kind === 'image' ? MAX_IMAGE_BYTES : MAX_MARK_BYTES;
}

function megabytes(bytes: number): string {
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
}

/** The files in request-sized batches, in the order picked: each under the upload limit and MAX_BATCH long. */
function batchesOf(files: readonly File[]): File[][] {
  const out: File[][] = [];
  let batch: File[] = [];
  let size = 0;
  for (const file of files) {
    if (batch.length && (size + file.size > BATCH_BYTES || batch.length >= MAX_BATCH)) {
      out.push(batch);
      batch = [];
      size = 0;
    }
    batch.push(file);
    size += file.size;
  }
  if (batch.length) out.push(batch);
  return out;
}

/** One batch as the add's multipart body; `check` asks the server to check it and write nothing. */
function formOf(batch: readonly File[], check: boolean): FormData {
  const body = new FormData();
  for (const file of batch) body.append(FIELD_FILE, file);
  if (check) body.set(FIELD_CHECK, '1');
  return body;
}

/** Leaves only these files in the form's picker, so a second Add sends the rest and nothing twice. */
function keepOnly(form: HTMLFormElement, files: readonly File[]) {
  const input = form.elements.namedItem(FIELD_FILE);
  if (!(input instanceof HTMLInputElement) || typeof DataTransfer === 'undefined') return;
  const rest = new DataTransfer();
  for (const file of files) rest.items.add(file);
  input.files = rest.files;
}

/** One line for the error toast: the sentence, then the first refused files or lines by name. */
function sentence(error: string, problems: readonly Problem[]): string {
  if (!problems.length) return error;
  const named = problems.slice(0, 4).map((problem) => (problem.name ? `${problem.name}: ${problem.error}` : problem.error));
  const more = problems.length > 4 ? ` And ${problems.length - 4} more.` : '';
  return `${error} ${named.join(' ')}${more}`;
}

function byOrder(a: AdminOption, b: AdminOption): number {
  return a.order - b.order || a.addedAt.localeCompare(b.addedAt) || a.key.localeCompare(b.key);
}

/** Enter in a row's field saves it, through the blur. */
function blurOnEnter(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key === 'Enter') event.currentTarget.blur();
}

type OptionsProps = {
  decision: DecisionMeta;
  options: AdminOption[];
  busy: boolean;
  change: Change;
  reload: () => Promise<void>;
  onError: (message: string | null) => void;
};

/**
 * A decision's options: each row's name, text and order saved on blur, the
 * Hide toggle (a hidden option keeps its votes and leaves the ballot and
 * the results), a new file for a mark or image, and the bulk add under
 * the table.
 */
export default function Options({ decision, options, busy, change, reload, onError }: OptionsProps) {
  const { kind } = decision;
  const fileRef = useRef<HTMLInputElement>(null);
  const target = useRef<AdminOption | null>(null);

  function replace(option: AdminOption) {
    target.current = option;
    fileRef.current?.click();
  }

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    const option = target.current;
    event.currentTarget.value = '';
    target.current = null;
    if (!file || !option) return;
    if (file.size === 0 || file.size > maxBytes(kind)) {
      onError(`${file.name} is empty or over ${megabytes(maxBytes(kind))}.`);
      return;
    }
    const form = new FormData();
    form.set(FIELD_REPLACE, option.key);
    form.set(FIELD_FILE, file);
    void change(adminPath(decision.id, 'options'), form).then((result) => {
      if (!result.ok && result.problems.length) onError(sentence(result.error, result.problems));
    });
  }

  return (
    <section className='vt-sec' aria-labelledby='vt-options-h'>
      <h2 id='vt-options-h' className='vt-h2'>
        Options
      </h2>
      {options.length > 0 ? (
        <div className='vt-scroll pt-scroll-x'>
          <table className='vt-table' data-testid='admin-options'>
            <thead>
              <tr>
                {kind === 'text' ? null : <th scope='col'>Option</th>}
                <th scope='col'>Key</th>
                <th scope='col'>Name</th>
                {kind === 'text' ? <th scope='col'>Text</th> : null}
                <th scope='col'>Order</th>
                <th scope='col' className='is-num'>
                  Elo
                </th>
                <th scope='col' className='is-num'>
                  Games
                </th>
                <th scope='col'>
                  <span className='vt-sr'>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {[...options].sort(byOrder).map((option) => (
                <OptionRow
                  key={option.key}
                  decision={decision}
                  option={option}
                  busy={busy}
                  change={change}
                  onReplace={replace}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {kind === 'text' ? null : (
        <input ref={fileRef} className='vt-sr' type='file' accept={ACCEPT[kind]} tabIndex={-1} aria-hidden='true' onChange={onFile} />
      )}
      <AddForm decision={decision} busy={busy} change={change} reload={reload} onError={onError} />
    </section>
  );
}

type OptionRowProps = {
  decision: DecisionMeta;
  option: AdminOption;
  busy: boolean;
  change: Change;
  onReplace: (option: AdminOption) => void;
};

/**
 * A row field's text: the saved value until the admin types, then their
 * draft until its own save lands, so a reload that another field's save
 * starts never takes what is being typed. `save` answers null when there
 * is nothing to save.
 */
function useDraft(saved: string, save: (value: string) => Promise<unknown> | null) {
  const [draft, setDraft] = useState<string | null>(null);
  const settle = (sent: string) => setDraft((current) => (current === sent ? null : current));
  return {
    value: draft ?? saved,
    onChange: (event: ChangeEvent<HTMLInputElement>) => setDraft(event.currentTarget.value),
    onBlur: () => {
      if (draft === null) return;
      const sent = draft;
      const pending = save(sent);
      if (pending) void pending.finally(() => settle(sent));
      else settle(sent);
    },
  };
}

function OptionRow({ decision, option, busy, change, onReplace }: OptionRowProps) {
  const { kind } = decision;
  const path = adminPath(decision.id, 'option');
  const name = useDraft(option.name, (value) => {
    const next = value.trim();
    return next && next !== option.name ? change(path, { key: option.key, name: next }) : null;
  });
  const text = useDraft(option.text, (value) => {
    const next = value.trim();
    return next !== option.text ? change(path, { key: option.key, text: next }) : null;
  });
  const order = useDraft(String(option.order), (value) => {
    const next = Number(value);
    return value.trim() !== '' && Number.isFinite(next) && next !== option.order ? change(path, { key: option.key, order: next }) : null;
  });

  return (
    <tr className={option.hidden ? 'is-hidden' : undefined} data-testid={`admin-option-${option.key}`}>
      {kind === 'text' ? null : (
        <td className='vt-td-plate'>
          <span className={plateClass(kind, 'is-static', 'is-sm')}>
            <Face kind={kind} option={option} />
          </span>
        </td>
      )}
      <td>
        <code>{option.key}</code>
      </td>
      <td>
        <input
          className='vt-input is-dense'
          aria-label={`Name of ${option.key}`}
          {...name}
          onKeyDown={blurOnEnter}
          autoComplete='off'
          data-testid={`admin-option-name-${option.key}`}
        />
      </td>
      {kind === 'text' ? (
        <td>
          <input
            className='vt-input is-dense is-text'
            aria-label={`Text of ${option.key}`}
            {...text}
            onKeyDown={blurOnEnter}
            autoComplete='off'
            data-testid={`admin-option-text-${option.key}`}
          />
        </td>
      ) : null}
      <td>
        <input
          className='vt-input is-dense is-order'
          aria-label={`Order of ${option.key}`}
          type='number'
          inputMode='numeric'
          {...order}
          onKeyDown={blurOnEnter}
          data-testid={`admin-option-order-${option.key}`}
        />
      </td>
      <td className='is-num'>{Math.round(option.elo)}</td>
      <td className='is-num'>{option.games}</td>
      <td className='vt-td-tools'>
        <button
          type='button'
          className={option.hidden ? 'pt-ib vt-chip is-on' : 'pt-ib vt-chip'}
          aria-pressed={option.hidden}
          onClick={() => void change(path, { key: option.key, hidden: !option.hidden })}
          disabled={busy}
          data-testid={`admin-option-hide-${option.key}`}
        >
          Hide
        </button>
        {kind === 'text' ? null : (
          <button
            type='button'
            className='pt-ib vt-chip'
            onClick={() => onReplace(option)}
            disabled={busy}
            data-testid={`admin-option-replace-${option.key}`}
          >
            {option.missing ? 'Add File' : 'Replace'}
          </button>
        )}
      </td>
    </tr>
  );
}

type AddFormProps = {
  decision: DecisionMeta;
  busy: boolean;
  change: Change;
  reload: () => Promise<void>;
  onError: (message: string | null) => void;
};

/**
 * The bulk add. A mark or image decision takes many files at once, each
 * named after its file; they go in batches that fit one request. Every
 * batch is checked first and none is written until all pass, so a bad
 * file adds nothing; should a write still fail part way, the picker keeps
 * only the files not yet added, so pressing Add again never adds one
 * twice. The panel reads itself once at the end. A text decision takes
 * one option per line, "Name" or "Name: text". The server derives each
 * key and never overwrites one.
 */
function AddForm({ decision, busy, change, reload, onError }: AddFormProps) {
  const { kind } = decision;
  const ready = useHydrated();
  const [sending, setSending] = useState(false);
  const path = adminPath(decision.id, 'options');

  async function addLines(form: HTMLFormElement, fields: FormData) {
    if (!String(fields.get(FIELD_LINES) ?? '').trim()) {
      onError('Write one option per line.');
      return;
    }
    const result = await change(path, fields);
    if (result.ok) form.reset();
    else if (result.problems.length) onError(sentence(result.error, result.problems));
  }

  async function addFiles(form: HTMLFormElement, fields: FormData) {
    const files = fields.getAll(FIELD_FILE).filter((file): file is File => file instanceof File && file.size > 0);
    if (!files.length) {
      onError('Attach one or more files.');
      return;
    }
    const limit = maxBytes(kind);
    const large = files.filter((file) => file.size > limit);
    if (large.length) {
      onError(`Over ${megabytes(limit)}: ${large.map((file) => file.name).join(', ')}.`);
      return;
    }
    const batches = batchesOf(files);
    const problems: Problem[] = [];
    for (const batch of batches) {
      const result = await change(path, formOf(batch, true), false);
      if (result.ok) continue;
      if (!result.problems.length) {
        onError(result.error);
        return;
      }
      problems.push(...result.problems);
    }
    if (problems.length) {
      onError(sentence(problems.length === 1 ? 'A file was refused. Nothing was added.' : `${problems.length} files were refused. Nothing was added.`, problems));
      return;
    }
    let added = 0;
    for (const batch of batches) {
      const result = await change(path, formOf(batch, false), false);
      if (!result.ok) {
        keepOnly(form, files.slice(added));
        await reload();
        onError(`Added ${added} of ${files.length}. The rest are still picked. ${sentence(result.error, result.problems)}`);
        return;
      }
      added += batch.length;
    }
    form.reset();
    await reload();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    setSending(true);
    onError(null);
    if (kind === 'text') await addLines(form, fields);
    else await addFiles(form, fields);
    setSending(false);
  }

  return (
    <form
      className={kind === 'text' ? 'vt-upload is-text' : 'vt-upload'}
      method='post'
      encType='multipart/form-data'
      onSubmit={(event) => void submit(event)}
      data-testid='admin-add'
    >
      {kind === 'text' ? (
        <textarea
          className='vt-input vt-textarea is-dense'
          name={FIELD_LINES}
          aria-label='Options'
          rows={4}
          placeholder='Name: text'
          autoComplete='off'
          data-testid='admin-add-lines'
        />
      ) : (
        <input className='vt-file' name={FIELD_FILE} aria-label='Files' type='file' multiple accept={ACCEPT[kind]} data-testid='admin-add-files' />
      )}
      <button type='submit' className='vt-btn is-dense' disabled={!ready || busy || sending} data-ready={ready} data-testid='admin-add-submit'>
        Add
      </button>
    </form>
  );
}
