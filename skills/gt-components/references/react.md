# React and translation rules

The team rules for React code in gt-cloud's dashboard, landing and packages/ui, from `$GT_CLOUD/.agents/skills/react-useeffect`, `$GT_CLOUD/.agents/skills/gt-ui/SKILL.md`, gt-cloud's CLAUDE.md and `.oxlintrc.json`, with the Prototemplate differences at the end.

## Effects

Direct `useEffect` is banned (`gt-ui/no-use-effect`). Agents add effects "just in case", and those effects become the next race or loop. `useMountEffect` fails in one of two loud ways (it ran once, or not at all); a dependency array fails slowly.

| situation | write this |
| --- | --- |
| a value derived from props or state | compute it during render |
| an expensive derivation | `useMemo` |
| reset state when a prop changes | a `key` on the component |
| respond to a click, submit or drag | the event handler |
| tell the parent about a change | call the callback in the event handler |
| fetch data | `useQuery` from `@tanstack/react-query` |
| sync with something outside React once on mount (focus, scroll, a third-party widget, a browser subscription, an analytics view event) | `useMountEffect` from `@generaltranslation/ui/hooks/use-mount-effect` |
| a value only the client knows during hydration | `useMounted` from `@generaltranslation/ui/hooks/use-mounted` |
| a mount effect that should run only under a condition | split into a wrapper that checks the condition and a child that runs `useMountEffect` |
| a fresh mount effect when an id changes | `key={id}` on the child, `useMountEffect` inside it |

```tsx
function PlayerGate({ isLoading }: { isLoading: boolean }) {
  if (isLoading) return <LoadingScreen />;
  return <Player />;
}

function Player() {
  useMountEffect(() => playVideo());
  return null;
}
```

The parent owns the condition and the lifecycle boundary; the child assumes its preconditions hold.

A POST that runs because the user acted belongs in the handler. An analytics event that runs because the component was shown belongs in `useMountEffect`.

Canvas and GL engines on the landing mount through `useGSAP` from `@gsap/react`, returning the engine's `destroy()` as cleanup (`HeroField.tsx`, `GlyphRain.tsx`).

## Code shape

- `type` aliases for props and data; `typescript/consistent-type-definitions` is set to `type`.
- No `any` (`typescript/no-explicit-any`) and no explicit `unknown` (`gt-ui/no-unknown-type`) without an `oxlint-disable` comment that says why.
- No `import()` (`gt-ui/no-dynamic-import`). Static imports only.
- No barrel files. Import a component from its own file.
- One component per file, exported as default.
- Test ids (`data-testid`) on components a test drives.
- Imports ordered React, external libraries, internal modules; `@/` for an app's `src`.
- Decisions the JSX consumes (hrefs, tracking slugs, tables) live in exported constants with tests; rendering needs a browser, so tests assert the data (gt-landing, "Section Recipe").

## Translation

gt-cloud's UI is translated with gt-next. The `gt-react/static-jsx` and `gt-react/static-string` rules check the static parts.

- Wrap the largest static JSX block in one `<T>` from `gt-next`. `<T>` can wrap elements and components, which gives the translator the markup context.
- Never nest `<T>`.
- No raw variables, ternaries or mapped expressions inside `<T>`. Use the GT components for dynamic content: `Var`, `Num`, `Currency`, `DateTime`, `Plural`, `Branch`.
- `<T>` does not translate props passed to children. Translate a user-facing prop (a placeholder, an `aria-label`, a title) with `gt()`.
- In a client component: `const gt = useGT();`. `useGT()` returns the function itself; `const { gt } = useGT()` is wrong.
- In an async server component: `const gt = await getGT();` from `gt-next/server`.
- Data arrays use `msg()` where they are defined and `useMessages()` or `getMessages()` where they render.
- On the landing, finished UI strings live in `ui.<locale>.json` at the app root.
- An action's internal error string never reaches the UI ("No Stripe customer associated with this org"). Show one translated sentence the user can act on and `console.error` the internal one (Kevin, dashboard onboarding round, September 2026).

## Prototemplate differences

- `$PROTOTEMPLATE/src/lib/use-mount-effect.ts` defers its cleanup by one task. React StrictMode (on in `next.config.ts`) calls cleanup and then the effect again right after mount; the deferred cleanup is cancelled by that re-run, so listeners stay live in development, and a real unmount still cleans up once. gt-cloud's version is a plain `useEffect(effect, [])`. Do not copy one over the other.
- `pnpm lint:practices` counts `bare-useEffect` outside files whose path contains `use-mount-effect`, plus `button-missing-type`, `img-missing-alt`, `any-type`, `raw-hex-in-tsx`, `important-in-css` and three rail checks (`outer-rail-pair`, `rail-outer-token`, `retired-rail-vocabulary`), against the baseline in `scripts/lint/practices.baseline.json`. A violation missing from the baseline fails the run; recorded ones stay listed until they are fixed, and `--update-baseline` rewrites the file after a deliberate cleanup.
- Prototemplate has no translation layer. The plate port (`src/components/plate`) keeps the dashboard's `gt-next` imports by name and rewrites the module path to `src/components/plate/shims/gt-next.tsx`, whose `T`, `Var`, `Branch`, `useGT` and `getGT` render the English as written. A diff against the dashboard then shows the copy untouched.
- The theme is `data-theme` on `<html>`, persisted under the `gt-theme` key and stamped before first paint by the boot script in `src/app/layout.tsx`. There is no `.dark` class; ported code rewrites `.dark` selectors to `:root[data-theme='dark']`.

## Sources

- gt-cloud: .agents/skills/react-useeffect/SKILL.md; .agents/skills/gt-ui/SKILL.md ("Translation Wrapping"); .agents/skills/gt-landing/SKILL.md; CLAUDE.md ("Code Style"); .oxlintrc.json; tooling/oxlint-plugins/gt-ui.ts (`no-use-effect`, `no-dynamic-import`, `no-unknown-type`); packages/ui/src/hooks/use-mount-effect.ts, use-mounted.ts; packages/ui/design-guide/why-we-banned-useeffect.md.
- Prototemplate: src/lib/use-mount-effect.ts; scripts/lint/practices.mjs; src/components/plate/shims/gt-next.tsx; src/components/viewer/ThemeButton.tsx.
