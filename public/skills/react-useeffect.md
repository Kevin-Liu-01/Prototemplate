# useEffect Is Banned — Use useMountEffect

**Team rule: Never call `useEffect` directly.** For the rare case where you need to sync with an external system on mount, use `useMountEffect()`:

```typescript
export function useMountEffect(effect: () => void | (() => void)) {
  /* eslint-disable no-restricted-syntax */
  useEffect(effect, []);
}
```

Most `useEffect` usage is compensating for something React already gives you better primitives for: derived state, event handlers, and data-fetching abstractions.

This matters even more now that **agents are writing the code**. `useEffect` is often added "just in case," but that move is the seed of the next race condition or infinite loop. Banning the hook forces the logic to be declarative and predictable.

## Why We Banned It

- **Brittleness:** Dependency arrays hide coupling. Unrelated refactors quietly change effect behavior.
- **Infinite loops:** Easy to create state → render → effect → state loops, especially when deps get "fixed" incrementally.
- **Dependency hell:** Effect chains (A sets state that triggers B) are time-based control flow — hard to trace, easy to regress.
- **Debugging pain:** "Why did this run?" / "Why didn't this run?" with no clear entrypoint like a handler.

## Choose Your Bug

`useMountEffect` failures are **binary and loud** (it ran once, or not at all). Direct `useEffect` failures often **degrade gradually** — flaky behavior, performance issues, or loops before a hard failure.

## Quick Reference

| Situation                       | DON'T                          | DO                                       |
| ------------------------------- | ------------------------------ | ---------------------------------------- |
| Derived state from props/state  | `useState` + `useEffect`       | Calculate during render                  |
| Expensive calculations          | `useEffect` to cache           | `useMemo`                                |
| Reset state on prop change      | `useEffect` with `setState`    | `key` prop                               |
| User event responses            | `useEffect` watching state     | Event handler directly                   |
| Notify parent of changes        | `useEffect` calling `onChange` | Call in event handler                    |
| Fetch data                      | `useEffect` without cleanup    | `useQuery` from `@tanstack/react-query`  |
| One-time external sync on mount | `useEffect(..., [])`           | `useMountEffect()`                       |

| Conditional mount logic         | Guard inside `useEffect`       | Split into wrapper + child component     |

## When You DO Need useMountEffect

- **DOM integration** (focus, scroll)
- **Third-party widget lifecycles**
- **Browser API subscriptions**
- **Analytics/logging** that runs because the component was displayed

## When You DON'T Need Any Effect

1. **Transforming data for rendering** - Calculate at top level, re-runs automatically
2. **Handling user events** - Use event handlers, you know exactly what happened
3. **Deriving state** - Just compute it: `const fullName = firstName + ' ' + lastName`
4. **Chaining state updates** - Calculate all next state in the event handler
5. **Data fetching** - Use `useQuery` from `@tanstack/react-query`

## Decision Tree

```
Need to respond to something?
├── User interaction (click, submit, drag)?
│   └── Use EVENT HANDLER
├── Component appeared on screen?
│   └── Use useMountEffect (external sync, analytics)
│       └── Conditional? Split into Wrapper + Child
├── Props/state changed and need derived value?
│   └── CALCULATE DURING RENDER
│       └── Expensive? Use useMemo
├── Need to reset state when prop changes?
│   └── Use KEY PROP on component
└── Need to respond to prop/id change with fresh state?
    └── Use KEY PROP on wrapper, useMountEffect inside
```

## Conditional Mounting Pattern

Don't guard inside effects — split into wrapper + child so the child can assume preconditions are met:

```typescript
// ❌ BAD: Guard inside effect
function VideoPlayer({ isLoading }) {
  useEffect(() => {
    if (!isLoading) playVideo();
  }, [isLoading]);
}

// ✅ GOOD: Mount only when preconditions are met
function VideoPlayerWrapper({ isLoading }) {
  if (isLoading) return <LoadingScreen />;
  return <VideoPlayer />;
}

function VideoPlayer() {
  useMountEffect(() => playVideo());
}

// ✅ ALSO GOOD: Persistent shell + conditional instance
function VideoPlayerContainer({ isLoading }) {
  return (
    <>
      <VideoPlayerShell isLoading={isLoading} />
      {!isLoading && <VideoPlayerInstance />}
    </>
  );
}

function VideoPlayerInstance() {
  useMountEffect(() => playVideo());
}
```

This is Unix philosophy applied to React: each unit does one job, coordination happens at clear boundaries. Parents own orchestration and lifecycle boundaries. Children assume preconditions are already met.

## Reset with Key, Not Dependency Choreography

```typescript
// ❌ BAD: Effect attempts to emulate remount behavior
function VideoPlayer({ videoId }) {
  useEffect(() => {
    loadVideo(videoId);
  }, [videoId]);
}

// ✅ GOOD: key forces clean remount
function VideoPlayerWrapper({ videoId }) {
  return <VideoPlayer key={videoId} videoId={videoId} />;
}

function VideoPlayer({ videoId }) {
  useMountEffect(() => {
    loadVideo(videoId);
  });
}
```

## POST Request vs Analytics Distinction

```typescript
function Form() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // ✅ Correct: runs because component was displayed
  useMountEffect(() => {
    post('/analytics/event', { eventName: 'visit_form' });
  });

  // ✅ Correct: runs because user submitted
  function handleSubmit(e) {
    e.preventDefault();
    post('/api/register', { firstName, lastName });
  }
}
```

## Detailed Guidance

- [Anti-Patterns](./anti-patterns.md) - Common mistakes with fixes
- [Better Alternatives](./alternatives.md) - useMemo, key prop, lifting state, useSyncExternalStore
