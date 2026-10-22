'use client';

import { useId, useRef, useState } from 'react';

import {
  CARD_DESCRIPTION_MAX,
  CARD_TITLE_MAX,
  OG_HEIGHT,
  OG_WIDTH,
  cardPath,
  type CardInput,
  type SeoSection,
} from '@/lib/seo/card-url';
import { useMountEffect } from '@/lib/use-mount-effect';

import { Choice } from '../controls';
import Plate from '../Plate';

import './artifacts.css';

type SectionValue = SeoSection | 'none';

const SECTIONS: readonly { value: SectionValue; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'Docs', label: 'Docs' },
  { value: 'Handbook', label: 'Handbook' },
  { value: 'Blog', label: 'Blog' },
  { value: 'Motion', label: 'Motion' },
  { value: 'Deck', label: 'Deck' },
];

/** The page the plate's cards name in their footer. */
const PATH = '/docs/components/covers-and-cards';

/** How long typing rests before the plate asks /og for a new card. */
const SETTLE_MS = 450;

function inputOf(title: string, description: string, section: SectionValue): CardInput {
  return { title, description, section: section === 'none' ? undefined : section, kind: 'page', path: PATH };
}

/**
 * The site's real social card: every keystroke rests for a moment, then
 * the plate asks GET /og for the card that seoRoute() would name for
 * these fields, the same 1200 by 630 PNG that X, LinkedIn and Slack
 * fetch. The next card is decoded before it replaces the shown one, so
 * the frame never blanks.
 */
export default function SocialCardDemo() {
  const titleId = useId();
  const descriptionId = useId();
  const [title, setTitle] = useState('Covers and social cards');
  const [description, setDescription] = useState(
    'Post covers, social cards and banners generated from a title and a field, at their export sizes.'
  );
  const [section, setSection] = useState<SectionValue>('Docs');
  const [shown, setShown] = useState(() => cardPath(inputOf(title, description, section)));
  const [waiting, setWaiting] = useState(false);
  const timer = useRef(0);
  const latest = useRef('');

  useMountEffect(() => () => window.clearTimeout(timer.current));

  const request = (next: CardInput) => {
    window.clearTimeout(timer.current);
    setWaiting(true);
    timer.current = window.setTimeout(() => {
      const src = cardPath(next);
      latest.current = src;
      const image = new Image();
      image.decoding = 'async';
      const settle = () => {
        if (latest.current !== src) return;
        setShown(src);
        setWaiting(false);
      };
      image.onload = settle;
      image.onerror = () => {
        if (latest.current === src) setWaiting(false);
      };
      image.src = src;
    }, SETTLE_MS);
  };

  return (
    <Plate
      controls={
        <>
          <div className='dmo-field dmo-field-wide'>
            <label className='dmo-field-label' htmlFor={titleId}>
              Title
            </label>
            <input
              className='dmo-input dmo-input-wide'
              id={titleId}
              maxLength={CARD_TITLE_MAX}
              spellCheck={false}
              type='text'
              value={title}
              onChange={(event) => {
                const next = event.currentTarget.value;
                setTitle(next);
                request(inputOf(next, description, section));
              }}
            />
          </div>
          <div className='dmo-field dmo-field-wide'>
            <label className='dmo-field-label' htmlFor={descriptionId}>
              Description
            </label>
            <input
              className='dmo-input dmo-input-wide'
              id={descriptionId}
              maxLength={CARD_DESCRIPTION_MAX}
              spellCheck={false}
              type='text'
              value={description}
              onChange={(event) => {
                const next = event.currentTarget.value;
                setDescription(next);
                request(inputOf(title, next, section));
              }}
            />
          </div>
          <Choice
            label='Section'
            options={SECTIONS}
            value={section}
            onChange={(next) => {
              setSection(next);
              request(inputOf(title, description, next));
            }}
          />
          <p className='dmo-bar-status' role='status'>
            {waiting ? 'Drawing the card. ' : ''}Title <span className='dmo-num'>{title.length}</span> of {CARD_TITLE_MAX}{' '}
            characters, description <span className='dmo-num'>{description.length}</span> of {CARD_DESCRIPTION_MAX}.
          </p>
        </>
      }
      fit
      label='The social card the site serves from its /og route'
      tag='GET /og?v=&t=&s=&d=&k=&p='
    >
      <div className='dmo-og'>
        <img
          alt={`The social card for ${title || 'Prototemplate'}`}
          className='dmo-og-card'
          decoding='async'
          height={OG_HEIGHT}
          loading='lazy'
          src={shown}
          width={OG_WIDTH}
        />
      </div>
    </Plate>
  );
}
