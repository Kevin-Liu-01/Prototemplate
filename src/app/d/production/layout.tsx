import ProdSystemTheme from './ProdSystemTheme';

import './prod-shell.css';

/**
 * Every page under /d/production: the production shell tokens (the house
 * palette, the 1104px rail and the document ground in prod-shell.css,
 * scoped to .toolchain-root.prod-root) and the live site's theme default,
 * which follows prefers-color-scheme until the visitor picks a theme.
 */
export default function ProductionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ProdSystemTheme />
      {children}
    </>
  );
}
