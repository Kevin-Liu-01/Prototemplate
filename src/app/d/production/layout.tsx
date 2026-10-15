import './prod-shell.css';
import './prod-taps.css';

/**
 * Every page under /d/production: the production shell tokens (the house
 * palette, the 1104px rail and the document ground in prod-shell.css,
 * scoped to .toolchain-root.prod-root), and the phone tap floor for
 * content links and controls (prod-taps.css). The live site's theme default,
 * which follows prefers-color-scheme until the visitor picks a theme, is
 * the boot script in src/app/layout.tsx and ProdSystemTheme.tsx, which the
 * root layout mounts so it sees the visitor leave as well as arrive.
 */
export default function ProductionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
