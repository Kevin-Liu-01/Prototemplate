import 'react';

/*
 * Custom properties in a style object, so `style={{ '--n': 3 }}` type-checks
 * without a cast. Module augmentation merges into React's own interface,
 * the one place this repository writes `interface`.
 */
declare module 'react' {
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined;
  }
}
