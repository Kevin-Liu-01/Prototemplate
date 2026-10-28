'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

import { MAX_APPEARANCES, STATUSES } from '@/lib/vote/decisions';
import type { DecisionMeta, DecisionStatus } from '@/lib/vote/types';

import { adminPath } from '../../api';
import { useHydrated } from '../../useHydrated';
import { STATUS_LABEL } from '../labels';
import type { Change } from '../useAdminPanel';

type SettingsProps = { decision: DecisionMeta; busy: boolean; change: Change; onError: (message: string | null) => void };

/** The access list as typed: one entry per line (commas and spaces split too), blanks and repeats dropped. */
function entriesOf(text: string): string[] {
  return [...new Set(text.split(/[\s,]+/).map((entry) => entry.trim().toLowerCase()).filter(Boolean))];
}

function sameList(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((entry, i) => entry === b[i]);
}

/**
 * A decision's settings in one form: the title, the question, the status,
 * who may vote, the matchups per option, the likes step and the order on
 * the hub. Save posts every field; the panel then reads the decision again
 * and this form starts over from what was stored (its key is the meta).
 */
export default function Settings({ decision, busy, change, onError }: SettingsProps) {
  const ready = useHydrated();
  const [title, setTitle] = useState(decision.title);
  const [question, setQuestion] = useState(decision.question);
  const [status, setStatus] = useState<DecisionStatus>(decision.status);
  const [access, setAccess] = useState(decision.access.join('\n'));
  const [appearances, setAppearances] = useState(String(decision.appearances));
  const [likes, setLikes] = useState(decision.likes);
  const [order, setOrder] = useState(String(decision.order));

  const next = {
    title: title.trim(),
    question: question.trim(),
    status,
    access: entriesOf(access),
    appearances: Number(appearances),
    likes,
    order: Number(order),
  };
  const dirty =
    next.title !== decision.title ||
    next.question !== decision.question ||
    next.status !== decision.status ||
    !sameList(next.access, decision.access) ||
    next.appearances !== decision.appearances ||
    next.likes !== decision.likes ||
    next.order !== decision.order;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dirty) return;
    if (!next.title) {
      onError('A decision needs a title.');
      return;
    }
    if (!Number.isInteger(next.appearances) || next.appearances < 1 || next.appearances > MAX_APPEARANCES) {
      onError(`Appearances is a whole number from 1 to ${MAX_APPEARANCES}.`);
      return;
    }
    if (order.trim() === '' || !Number.isFinite(next.order)) {
      onError('The order is a number.');
      return;
    }
    await change(adminPath(decision.id, 'meta'), next);
  }

  return (
    <section className='vt-sec' aria-labelledby='vt-settings-h'>
      <h2 id='vt-settings-h' className='vt-h2'>
        Settings
      </h2>
      <form className='vt-fields' method='post' onSubmit={(event) => void submit(event)} noValidate data-testid='admin-settings'>
        <label className='vt-field'>
          <span className='vt-label'>Title</span>
          <input
            className='vt-input is-dense'
            name='title'
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
            autoComplete='off'
            data-testid='admin-settings-title'
          />
        </label>
        <label className='vt-field'>
          <span className='vt-label'>Question</span>
          <input
            className='vt-input is-dense'
            name='question'
            value={question}
            onChange={(event) => setQuestion(event.currentTarget.value)}
            autoComplete='off'
            data-testid='admin-settings-question'
          />
        </label>
        <div className='vt-field is-wide'>
          <span className='vt-label' id='vt-status-l'>
            Status
          </span>
          <div className='vt-seg' role='group' aria-labelledby='vt-status-l'>
            {STATUSES.map((value) => (
              <button
                type='button'
                key={value}
                className={value === status ? 'pt-ib vt-chip is-on' : 'pt-ib vt-chip'}
                aria-pressed={value === status}
                onClick={() => setStatus(value)}
                data-testid={`admin-settings-status-${value}`}
              >
                {STATUS_LABEL[value]}
              </button>
            ))}
          </div>
        </div>
        <label className='vt-field is-wide'>
          <span className='vt-label'>Access</span>
          <textarea
            className='vt-input vt-textarea is-dense'
            name='access'
            rows={4}
            value={access}
            onChange={(event) => setAccess(event.currentTarget.value)}
            placeholder='@generaltranslation.com'
            autoCapitalize='none'
            autoComplete='off'
            spellCheck={false}
            data-testid='admin-settings-access'
          />
        </label>
        <label className='vt-field'>
          <span className='vt-label'>Appearances</span>
          <input
            className='vt-input is-dense is-order'
            name='appearances'
            type='number'
            inputMode='numeric'
            min={1}
            max={MAX_APPEARANCES}
            value={appearances}
            onChange={(event) => setAppearances(event.currentTarget.value)}
            data-testid='admin-settings-appearances'
          />
        </label>
        <label className='vt-field'>
          <span className='vt-label'>Order</span>
          <input
            className='vt-input is-dense is-order'
            name='order'
            type='number'
            inputMode='numeric'
            value={order}
            onChange={(event) => setOrder(event.currentTarget.value)}
            data-testid='admin-settings-order'
          />
        </label>
        <div className='vt-field is-wide vt-field-row'>
          <button
            type='button'
            className={likes ? 'pt-ib vt-chip is-on' : 'pt-ib vt-chip'}
            aria-pressed={likes}
            onClick={() => setLikes((on) => !on)}
            data-testid='admin-settings-likes'
          >
            Likes
          </button>
          <button
            type='submit'
            className='vt-btn is-dense'
            disabled={!ready || busy || !dirty}
            data-ready={ready}
            data-testid='admin-settings-save'
          >
            Save
          </button>
        </div>
      </form>
    </section>
  );
}
