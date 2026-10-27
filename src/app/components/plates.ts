'use client';

import type { ComponentType } from 'react';

import * as scenes from '@/components/docs/demos/2d-3d/lazy';
import * as artifacts from '@/components/docs/demos/artifacts/lazy';
import * as ditherLab from '@/components/docs/demos/dither-lab/lazy';
import * as interactables from '@/components/docs/demos/interactables/lazy';
import * as layouts from '@/components/docs/demos/layouts/lazy';
import * as demos from '@/components/docs/demos/lazy';
import * as pages from '@/components/docs/demos/pages/lazy';
import type { LazyPlateModule, ServerPlateModule } from '@/lib/component-library-model';

import MarksLive from './MarksLive';

/**
 * The plate registry of /components: every lazy module the docs Components
 * pages import plates from, by the specifier the MDX writes. The record is
 * keyed by LazyPlateModule, so a module the model adds without an entry
 * here fails tsc, and src/lib/component-library.ts fails the build on a
 * plate whose name its module does not export. Each export is a
 * next/dynamic wrapper, so a plate's code and styles load only when its
 * row mounts it.
 */
const LAZY_PLATES: Readonly<Record<LazyPlateModule, Readonly<Record<string, unknown>>>> = {
  '@/components/docs/demos/lazy': demos,
  '@/components/docs/demos/2d-3d/lazy': scenes,
  '@/components/docs/demos/artifacts/lazy': artifacts,
  '@/components/docs/demos/dither-lab/lazy': ditherLab,
  '@/components/docs/demos/interactables/lazy': interactables,
  '@/components/docs/demos/layouts/lazy': layouts,
  '@/components/docs/demos/pages/lazy': pages,
};

/**
 * The plates with a server half, by the specifier the MDX imports them
 * from: on /components each one is its client plate fed from a prerendered
 * route when its row mounts it, so the page carries none of its data.
 * Keyed by ServerPlateModule, so tsc holds the two lists together.
 */
const SERVER_PLATES: Readonly<Record<ServerPlateModule, ComponentType<Record<string, unknown>>>> = {
  '@/components/docs/demos/MarksDemo': MarksLive,
};

/** The component a docs section mounts, taking the props its MDX writes. */
export function lazyPlate(module: LazyPlateModule, name: string): ComponentType<Record<string, unknown>> {
  return LAZY_PLATES[module][name] as ComponentType<Record<string, unknown>>;
}

/** The /components stand-in for a plate with a server half: the same client plate with the same data. */
export function serverPlate(module: ServerPlateModule): ComponentType<Record<string, unknown>> {
  return SERVER_PLATES[module];
}
