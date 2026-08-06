# General Translation — Landing Page Content Inventory

Source: `/Users/kevinliu/gt/gt-cloud-wt-design-samples/apps/landing` (clean checkout of main, read-only).
Home page component tree: `src/app/[locale]/(home)/page.tsx` → `src/components/pages/home/HomePage.tsx` → sections in `src/components/landing/*`. Header/footer come from the shared UI package: `packages/ui/src/components/frame/NewHeader.tsx` and `NewFooter.tsx`.

This document contains ALL copy, links, code snippets, logos, and numbers on the current page, in page order. Builders should use ONLY this document for content.

---

## 0. Global / meta

- **Site name:** General Translation (legal: "General Translation, Inc.")
- **Meta title:** `General Translation` (template: `%s | General Translation`)
- **Meta description:** `End-to-end localization for the world's best companies`
- **Keywords:** translation, localization, internationalization, l10n, i18n, automate, next.js, nextjs, react
- **Theme colors:** dark `#0A0A0A`, light `#fff`
- **Page shell:** `<main class='relative z-2 container max-w-[1120px] px-2'>` — all sections sit inside a 1120px bordered column (`border-x` on each section creates continuous vertical rails down the page). Decorative "+" crosshair accents (`PlusAccent`) sit at section corners.

### Home page section order (HomePage.tsx)

1. HeroSection
2. LogosSection
3. DemoSection (mock browser with language tabs, "see the code" toggle reveals code panel)
4. LocadexSection (`id="translation-agents"`)
5. DeveloperExperienceSection (`id="code-libraries"`)
6. EditorPreviewSection (`id="context-platform"`)
7. BentoSection (feature grid linking to docs)
8. TestimonialsSection
9. LanguagesSection (100+ locales marquee)
10. DocsBlogPreviewSection
11. ClosingCTA
12. (Footer, from layout)

---

## 1. Navigation (header)

Left: **Logo** (GT logomark, 40×40) → links to `/home`.

### Top-level nav items

| Label | Type | Link |
|---|---|---|
| Resources | dropdown menu | fallback link `/blog` |
| Docs | dropdown menu (centered) | fallback link `/docs` |
| Pricing | link | `/pricing` |
| Enterprise | link | `/enterprise` |

Right side (desktop): **Search** toggle (large search field), then buttons: **Sign In** (outline → dashboard URL) and **Get a Demo** (solid → `/enterprise/contact`). Mobile: "Get a Demo" button + hamburger; mobile panel also gets **Sign In** (outline) and **Get a Demo** buttons.

### "Resources" dropdown (2 columns)

**Column: Company**
- **Blog** — "News and updates" — `/blog` (icon: newspaper)
- **Careers** — "Join our growing team" — `/careers` (icon: briefcase)
- **Supported Locales** — "100+ languages supported" — `/supported-locales` (icon: map pin)

**Column: Community**
- **GitHub** — "Open source libraries" — `https://github.com/generaltranslation/gt` (external)
- **Discord** — "Join our developer community" — `https://generaltranslation.com/discord` (external)
- **Contact** — "Get in touch with us" — `/contact` (icon: mail)

### "Docs" dropdown (4 columns)

**Column: Libraries**
- **Translation CLI** — `gt` — `/docs/cli` (terminal icon)
- **Next.js SDK** — `gt-next` — `/docs/next` (Next.js logo)
- **React SDK** — `gt-react` — `/docs/react` (React logo)
- **React Native SDK** — `gt-react-native` — `/docs/react-native` (React logo)

**Column (continuation, blank title)**
- **TanStack Start SDK** — `gt-tanstack-start` — `/docs/tanstack-start` (TanStack logo)
- **Node.js SDK** — `gt-node` — `/docs/node` (Node.js logo)
- **Python SDK** — `gt-python` — `/docs/python` (Python logo)
- **Core** — `generaltranslation` — `/docs/core` (network icon)

**Column: Content**
- **Sanity** — `gt-sanity` — `/docs/sanity` (Sanity logo)
- **Mintlify** — "Locadex for Mintlify" — `/docs/locadex/mintlify` (Mintlify logo)

**Column: Platform**
- **Platform** — "Dashboard" — `/docs/platform` (globe icon)
- **Locadex** — "AI Agent" — `/docs/locadex` (Locadex logo)

---

## 2. Hero (HeroSection.tsx)

- **Top element** (above the h1, deliberately — comment in code: "npx gt@latest is at the top of the page to emphasize that we are a developer first company"): a copyable command chip, monospace, with `$` prefix and copy/check icon:
  - `$ npx gt@latest` (click copies `npx gt@latest`)
- **Headline (h1):** `Launch in every language`
- **Subheadline:** `General Translation helps developers localize apps into {rotating language}` — the last word is an animated typewriter **LanguageRotator** that types/deletes through: Spanish, French, German, Japanese, Chinese, Portuguese, Korean, Italian, Hindi, Arabic (visitor's own locale language is moved to the front when known; mapping covers English, Spanish, French, German, Japanese, Chinese).
- **CTAs (2 buttons):**
  - **Get Started** → `/dashboard` — "rainbow" variant (the one colorful accent on the page) with forward-arrow icon
  - **Docs** → `/docs` — outline variant

---

## 3. Customer logos (LogosSection.tsx + LogosGrid.tsx)

- **Kicker (uppercase, letterspaced, muted, centered):** `Trusted by the world's best companies`
- **Logos** (grayscale at 80% opacity; hover: full color/opacity + slight scale; theme-paired light/dark SVGs; each links out, new tab):
  1. **Cursor** — https://www.cursor.com
  2. **Ramp** — https://ramp.com
  3. **Mintlify** — https://www.mintlify.com
  4. **Profound** — https://www.tryprofound.com
  5. **Partiful** — https://www.partiful.com
  6. **Clickhouse** — https://www.clickhouse.com
- Assets live in `public/logos/` as `{name}.light.svg` / `{name}.dark.svg` pairs.

---

## 4. Interactive demo (DemoSection.tsx + demo/MockWebsite.tsx + demo/translations.ts)

**Purpose:** show the product working. A mock browser window whose tabs are languages; clicking a tab re-renders the fake website in that language (this section itself has no heading — the artifact *is* the content). A framework grid inside the mock site reveals real code below.

### Browser chrome
- Traffic-light dots, back/forward/refresh icons, URL pill reading `example.com` (or `{framework}.example.com` / `localhost:8081` for React Native when a framework is selected, plus `/{locale}` path for non-English tabs).
- **Language tabs** (with flag emoji, native names): English (US), Español, Français, 日本語, Deutsch, 中文 — visitor's locale is moved first or prepended.

### Mock website copy (English source; also shipped in es/fr/ja/de/zh in translations.ts)
- App name: `Example App`
- Title: `Hello, world!`
- Below title: today's date, locale-formatted
- Toggle chip: `code displayed` / `code hidden` (dot indicator; toggles the code panel). Alt strings in data: `See the code` / `Hide the code`.
- Body (verbatim; the three product-pillar phrases are in-page anchor links):

  > General Translation builds full-stack infrastructure for localizing apps, docs, and websites.
  >
  > From [translation agents](#translation-agents), to [code libraries](#code-libraries), to [context platform](#context-platform), GT has everything you need to ship your product in {count} languages, for your next 1,000,000,000 users.

  `{count}` renders `supportedLocales.length` live via `<Num>` (code samples hardcode `118`). The 1,000,000,000 demonstrates locale-aware number formatting.

### Framework grid (right side of mock website)
Label: `Supported frameworks` (aria). Blocks: **Next.js**, **TanStack Start**, **React**, **React Native**, **Node.js**, **Python**. Clicking one opens a code IDE panel (tabbed, line numbers, syntax highlighted) under the browser.

### Code panel contents (verbatim, per framework)

Placeholders below resolve at runtime from the demo's locale tabs: target locales = `"es", "fr", "ja", "de", "zh"` and runtime locales = `"en", "es", "fr", "ja", "de", "zh"`. Links resolve to `https://generaltranslation.com#translation-agents` etc.

#### Next.js — tabs: page.tsx, layout.tsx, gt.config.json, next.config.ts, loadTranslations.ts

`page.tsx` (highlighted lines 1, 5, 17):
```tsx
import { T, Num, DateTime } from 'gt-next';

export default function Home() {
  return (
    <T>
      <main>
        <h1>Hello, world!</h1>
        <p className="text-gray-500">
          <DateTime>{new Date()}</DateTime>
        </p>
        <p>
          General Translation builds full-stack
          infrastructure for localizing apps, docs,
          and websites.
        </p>
        <p>
          From <a href="https://generaltranslation.com#translation-agents">translation agents</a>,
          to <a href="https://generaltranslation.com#code-libraries">code libraries</a>,
          to <a href="https://generaltranslation.com#context-platform">context platform</a>,
          GT has everything you need to ship your product in{' '}
          <Num>{118}</Num> languages, for your next <Num>{1_000_000_000}</Num> users.
        </p>
      </main>
    </T>
  );
}
```

`layout.tsx` (highlighted lines 1, 9):
```tsx
import { GTProvider } from 'gt-next';
import { useLocale } from 'gt-next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  return (
    <html lang={locale}>
      <body>
        <GTProvider>
          {children}
        </GTProvider>
      </body>
    </html>
  );
}
```

`gt.config.json`:
```json
{
  "defaultLocale": "en",
  "locales": ["es", "fr", "ja", "de", "zh"],
  "files": {
    "gt": {
      "output": "public/_gt/[locale].json"
    }
  }
}
```

`next.config.ts` (highlighted lines 1, 5):
```typescript
import { withGTConfig } from 'gt-next/config';

const nextConfig = {};

export default withGTConfig(nextConfig);
```

`loadTranslations.ts`:
```typescript
export default async function loadTranslations(
  locale: string
) {
  const t = await import(
    `../public/_gt/${locale}.json`
  );
  return t.default;
}
```

#### TanStack Start — tabs: index.tsx, __root.tsx, gt.config.json, loadTranslations.ts

`index.tsx` (highlighted 2, 8, 18):
```tsx
import { createFileRoute } from '@tanstack/react-router';
import { T, DateTime, Num } from 'gt-react';

export const Route = createFileRoute('/')({ component: Home });

function Home() {
  return (
    <T>
      <h1>Hello, world!</h1>
      <p>
        <DateTime>{new Date()}</DateTime>
      </p>
      <p>
        General Translation builds full-stack infrastructure
        for localizing apps, docs, and websites.
      </p>
      <p>
        From <a href="https://generaltranslation.com#translation-agents">translation agents</a>,
        to <a href="https://generaltranslation.com#code-libraries">code libraries</a>,
        to <a href="https://generaltranslation.com#context-platform">context platform</a>,
        GT has everything you need to ship your product in
        <Num>{118}</Num> languages, for your next
        <Num>{1_000_000_000}</Num> users.
      </p>
    </T>
  );
}
```

`__root.tsx` (highlighted 7, 16, 31):
```tsx
import {
  HeadContent,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router';
import {
  initializeGT,
  GTProvider,
  getTranslations,
  getLocale,
  LocaleSelector,
} from 'gt-tanstack-start';
import gtConfig from '../../gt.config.json';
import loadTranslations from '../../loadTranslations';

initializeGT({ ...gtConfig, loadTranslations });

export const Route = createRootRoute({
  loader: async () => ({
    translations: await getTranslations(),
    locale: getLocale(),
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const { translations, locale } = Route.useLoaderData();
  return (
    <html lang={locale}>
      <body>
        <GTProvider translations={translations}>
          <LocaleSelector />
          {children}
        </GTProvider>
        <Scripts />
      </body>
    </html>
  );
}
```

`gt.config.json`:
```json
{
  "defaultLocale": "en",
  "locales": ["es", "fr", "ja", "de", "zh"],
  "files": {
    "gt": {
      "output": "src/_gt/[locale].json"
    }
  }
}
```

`loadTranslations.ts`:
```typescript
export default async function loadTranslations(
  locale: string
) {
  const t = await import(
    `./src/_gt/${locale}.json`
  );
  return t.default;
}
```

#### React — tabs: Home.tsx, App.tsx, gt.config.json, loadTranslations.ts

`Home.tsx` (highlighted 1, 5, 16):
```tsx
import { T, DateTime, Num } from 'gt-react';

export default function Home() {
  return (
    <T>
      <main>
        <h1>Hello, world!</h1>
        <p>
          <DateTime>{new Date()}</DateTime>
        </p>
        <p>
          General Translation builds full-stack infrastructure
          for localizing apps, docs, and websites.
        </p>
        <p>
          From <a href="https://generaltranslation.com#translation-agents">translation agents</a>,
          to <a href="https://generaltranslation.com#code-libraries">code libraries</a>,
          to <a href="https://generaltranslation.com#context-platform">context platform</a>,
          GT has everything you need to ship your product in
          <Num>{118}</Num> languages, for your next
          <Num>{1_000_000_000}</Num> users.
        </p>
      </main>
    </T>
  );
}
```

`App.tsx` (highlighted 1, 8):
```tsx
import { GTProvider, LocaleSelector } from 'gt-react';
import gtConfig from '../gt.config.json';
import loadTranslations from './loadTranslations';
import Home from './components/Home';

export default function App() {
  return (
    <GTProvider config={gtConfig} loadTranslations={loadTranslations}>
      <LocaleSelector />
      <Home />
    </GTProvider>
  );
}
```

`gt.config.json`:
```json
{
  "defaultLocale": "en",
  "locales": ["es", "fr", "ja", "de", "zh"],
  "files": {
    "gt": {
      "output": "src/_gt/[locale].json"
    }
  }
}
```

`loadTranslations.ts`:
```typescript
export default async function loadTranslations(
  locale: string
) {
  try {
    const t = await import(`./_gt/${locale}.json`);
    return t.default;
  } catch {
    return {};
  }
}
```

#### React Native — tabs: index.tsx, _layout.tsx, loadTranslations.ts, babel.config.js, gt.config.json

`index.tsx` (highlighted 2, 6, 20):
```tsx
import { Linking, Text, View } from 'react-native';
import { T, DateTime, Num } from 'gt-react-native';

export default function Home() {
  return (
    <T>
      <View>
        <Text>Hello, world!</Text>
        <Text>
          <DateTime>{new Date()}</DateTime>
        </Text>
        <Text>
          General Translation builds full-stack infrastructure
          for localizing apps, docs, and websites.
        </Text>
        <Text>
          From{' '}
          <Text
            accessibilityRole="link"
            onPress={() => Linking.openURL('https://generaltranslation.com#translation-agents')}
          >
            translation agents
          </Text>
          , to{' '}
          <Text
            accessibilityRole="link"
            onPress={() => Linking.openURL('https://generaltranslation.com#code-libraries')}
          >
            code libraries
          </Text>
          , to{' '}
          <Text
            accessibilityRole="link"
            onPress={() => Linking.openURL('https://generaltranslation.com#context-platform')}
          >
            context platform
          </Text>
          ,
          GT has everything you need to ship your product in
          <Num>{118}</Num> languages, for your next
          <Num>{1_000_000_000}</Num> users.
        </Text>
      </View>
    </T>
  );
}
```

`_layout.tsx` (highlighted 2, 8):
```tsx
import { Slot } from 'expo-router';
import { GTProvider } from 'gt-react-native';
import gtConfig from '../gt.config.json';
import { loadTranslations } from '../loadTranslations';

export default function RootLayout() {
  return (
    <GTProvider
      config={gtConfig}
      loadTranslations={loadTranslations}
      projectId={process.env.EXPO_PUBLIC_GT_PROJECT_ID}
      devApiKey={process.env.EXPO_PUBLIC_GT_DEV_API_KEY}
    >
      <Slot />
    </GTProvider>
  );
}
```

`loadTranslations.ts`:
```typescript
const translations: Record<string, unknown> = {
  es: require('./content/es.json'),
  fr: require('./content/fr.json'),
  ja: require('./content/ja.json'),
  de: require('./content/de.json'),
  zh: require('./content/zh.json'),
};

export function loadTranslations(locale: string) {
  return translations[locale] ?? {};
}
```

`babel.config.js` (highlighted 1, 8):
```javascript
const gtPlugin = require('gt-react-native/plugin');
const gtConfig = require('./gt.config.json');

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [[gtPlugin, {
      locales: [gtConfig.defaultLocale, ...gtConfig.locales],
      entryPointFilePath: require.resolve('expo-router/entry'),
    }]],
  };
};
```

`gt.config.json`:
```json
{
  "defaultLocale": "en",
  "locales": ["es", "fr", "ja", "de", "zh"],
  "files": {
    "gt": {
      "output": "content/[locale].json"
    }
  }
}
```

#### Node.js — tabs: server.ts, gt.config.json, package.json

`server.ts` (highlighted 2, 20, 35):
```typescript
import express from 'express';
import { getGT, initializeGT, withGT } from 'gt-node';

initializeGT({
  defaultLocale: 'en',
  locales: ["en", "es", "fr", "ja", "de", "zh"],
  projectId: process.env.GT_PROJECT_ID,
  devApiKey: process.env.GT_API_KEY,
});

const app = express();

app.use((req, _res, next) => {
  const locale =
    req.headers['accept-language']?.split(',')[0] ?? 'en';
  withGT(locale, () => next());
});

app.get('/', async (req, res) => {
  const gt = await getGT();
  const locale =
    req.headers['accept-language']?.split(',')[0] ?? 'en';
  const date = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  }).format(new Date());

  res.type('html').send(`
    <main>
      <h1>${gt('Hello, world!')}</h1>
      <p>${date}</p>
      <p>${gt(
        "General Translation builds full-stack infrastructure for localizing apps, docs, and websites."
      )}</p>
      <p>
        ${gt('From')} <a href="https://generaltranslation.com#translation-agents">${gt('translation agents')}</a>,
        ${gt('to')} <a href="https://generaltranslation.com#code-libraries">${gt('code libraries')}</a>,
        ${gt('to')} <a href="https://generaltranslation.com#context-platform">${gt('context platform')}</a>,
        ${gt(
          'GT has everything you need to ship your product in {count, number} languages, for your next {users, number} users.',
          { count: 118, users: 1_000_000_000 }
        )}
      </p>
    </main>
  `);
});

app.listen(3000);
```

`gt.config.json`:
```json
{
  "defaultLocale": "en",
  "locales": ["es", "fr", "ja", "de", "zh"]
}
```

`package.json` (highlighted 5, 9):
```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "npx gt translate"
  },
  "dependencies": {
    "express": "latest",
    "gt-node": "latest"
  },
  "devDependencies": {
    "gt": "latest",
    "tsx": "latest"
  }
}
```

#### Python — tabs: app.py, gt.config.json, requirements.txt

`app.py` (highlighted 4, 12, 29):
```python
from datetime import date
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from gt_fastapi import initialize_gt, t

app = FastAPI()
initialize_gt(app)

@app.get("/", response_class=HTMLResponse)
def home():
    today = date.today().strftime("%b %d, %Y")
    body = t(
        "General Translation builds full-stack infrastructure "
        "for localizing apps, docs, and websites."
    )
    scale = t(
        "GT has everything you need to "
        "ship your product in "
        "{count} languages, for your next {users} users.",
        count=118,
        users="1,000,000,000",
    )
    return f"""
      <main>
        <h1>{t("Hello, world!")}</h1>
        <p>{today}</p>
        <p>{body}</p>
        <p>
          {t("From")} <a href="https://generaltranslation.com#translation-agents">{t("translation agents")}</a>,
          {t("to")} <a href="https://generaltranslation.com#code-libraries">{t("code libraries")}</a>,
          {t("to")} <a href="https://generaltranslation.com#context-platform">{t("context platform")}</a>,
          {scale}
        </p>
      </main>
    """
```

`gt.config.json`:
```json
{
  "projectId": "your-project-id",
  "defaultLocale": "en",
  "locales": ["es", "fr", "ja", "de", "zh"]
}
```

`requirements.txt` (highlighted 2):
```text
fastapi[standard]
gt-fastapi
```

---

## 5. Locadex AI Agent (LocadexSection.tsx, `id="translation-agents"`)

**Purpose:** pitch the AI agent that does localization end-to-end. Two-column: copy left, animated flowchart right.

- **Kicker (with Locadex logomark image):** `Locadex AI Agent`
- **Heading (h2):** `End-to-end localization`
- **Body:** `AI agents connect to your codebase, internationalize your code, and open pull requests with translations.`
- **CTAs:**
  - **Connect GitHub** (solid, GitHub icon) → `/dashboard/api/integrations/github/start?returnTo=%2Fproject%2Flocadex`
  - **Docs** (outline, forward arrow) → `/docs/platform/locadex`

### Flowchart (LocadexFlowchart.tsx — animated vertical stepper, auto-advances ~1.2s/step, loops)

| Step | Label | Description | Icon |
|---|---|---|---|
| 1 | Push to repo | A commit or PR triggers the workflow | git commit |
| 2 | Scan codebase | Agent maps out what has changed | search |
| 3 | Edit code | Agent internationalizes code and strings | file-code |
| 4 | Translate content | Agent creates translations in context | languages |
| 5 | Open PR | Pull request created for review | git pull request |

---

## 6. Frameworks / SDKs (DeveloperExperienceSection.tsx, `id="code-libraries"`)

**Purpose:** show breadth of SDK support and per-SDK capabilities. Two-column: copy + framework picker left, capability block grid right.

- **Kicker (boxes icon):** `Frameworks`
- **Heading (h2):** `Powerful developer tools`
- **Body:** `Developer-first SDKs to translate everything from simple sites to complex user experiences`
- **Framework selector (text buttons with icons):** Next.js, TanStack Start, React, React Native, Node.js, Python (default: Next.js).

Selecting a framework swaps a grid of 9 capability blocks (icon tile + label, each links to docs, opens in new tab):

- **gt-next (Next.js):** UI, Text, Numbers, Currencies, Dates, Plurals, Functions, Context, Routing
- **gt-react (React):** UI, Text, Numbers, Currencies, Dates, Plurals, Functions, Context, Globals
- **gt-react-native:** UI, Text, Numbers, Currencies, Dates, Plurals, Functions, Context, Globals
- **gt-tanstack-start:** UI, Text, Numbers, Currencies, Dates, Plurals, Functions, Context, Routing
- **gt-node (Node.js):** Text, Numbers, Currencies, Dates, Plurals, Functions, Context, Requests, Middleware
- **gt-python (Python):** Text, Numbers, Currencies, Dates, Plurals, Functions, Context, Requests, Middleware

(Representative doc links: UI → `/docs/react/reference/components/t`; Text → `/docs/react/reference/hooks/use-gt`; Numbers/Currencies/Dates → `/docs/{sdk}/api/components/{num|currency|datetime}`; Plurals → `/docs/react/reference/components/plural`; Functions → `/docs/react/reference/components/derive`; Context → `/docs/{sdk}/api/components/t`; Routing → `/docs/react/nextjs/app-router-middleware`; Node/Python variants under `/docs/node/...` and `/docs/python/...`.)

---

## 7. Translation Editor (EditorPreviewSection.tsx, `id="context-platform"`)

**Purpose:** human review workflow. Two-column: copy + bullet list left, abstract animated editor graphic right.

- **Kicker (pen icon):** `Translation Editor`
- **Heading (h2):** `Edit in context`
- **Body:** `Agents write translations. You review, edit, and approve in a focused workspace.`
- **Bullets (icon + text):**
  - (eye) `Side-by-side source and translation view`
  - (git compare) `See diffs when translations are regenerated`
  - (check circle) `Edit translations before or after they go live`
- **Graphic (EditorGraphic.tsx):** a card with two columns labeled `Source` and `Translation` (tiny uppercase labels); rows of skeleton "text lines" where translation lines animate their widths on a loop — an abstract animation of edits being made. No other text.

---

## 8. Feature bento grid (AutomationSection.tsx, exported as BentoSection)

**Purpose:** 9-cell grid (2-col mobile / 3-col desktop; each cell links to docs). Format per cell: small header (icon + category), title (h3), description.

| # | Category | Title | Description | Link |
|---|---|---|---|---|
| 1 | Libraries | Code | Developer-first libraries for React, Next.js, and more, battle-tested in production apps with millions of users. | `/docs/react` |
| 2 | Platform | Context | Glossaries, locale rules, and custom prompts. Control tone, terminology, and regional nuance. | `/docs/platform/dashboard/guides/adding-translation-context` |
| 3 | AI | Translation | AI agents that understand your project structure and localize your content in context. | `/docs/platform/locadex` |
| 4 | Middleware | Routing | Automatic language detection and locale-based routing. SEO-friendly paths with zero configuration. | `/docs/react/nextjs/app-router-middleware` |
| 5 | CI/CD | Deployment | Detects changes in PRs and updates translations automatically. No manual work required. | `/docs/platform/locadex/quickstart` (hidden below lg) |
| 6 | Edge | Delivery | A global, low-latency translation CDN. Push over-the-air updates without redeploying your app. | `/docs/react` |
| 7 | Dashboard | Previews | Preview translations in development before they go live. Catch issues early and ship with confidence. | `/docs/platform/dashboard/guides/reviewing-translations` |
| 8 | Runtime | Live Translation | Translate user-generated content on demand, with low latency and full context. | `/docs/react/reference/config` |
| 9 | Config | Customization | Build your own language detection functions, locale-specific components, and more. | `/docs/react/reference/config` |

---

## 9. Testimonial (TestimonialsSection.tsx)

Single centered quote, italic, large:

> Every once in awhile, I see a snippet of code that makes me a bit emotional.
>
> Now is one of those moments. Internationalization went from "$%!# this" to "trivial".

- **Attribution:** avatar (github.com/t3dotgg.png), **Theo** — `CEO, T3Chat`
- Links to: `https://x.com/theo/status/2008302190168019187`

---

## 10. Languages (LanguagesSection.tsx)

- **Kicker (languages icon):** `Languages`
- **Heading (h2):** `100+ languages supported`
- **Body:** `From {firstLanguageCode} to {lastLanguageCode} — every locale ships production-ready.` (first/last language codes computed from the supported locale list, e.g. "af" → "zh")
- **Visual:** 3 marquee rows of locale pills (flag emoji + native language name, e.g. "🇫🇷 Français"), rows alternate direction, pause on hover, shuffled with a fixed seed, edge-faded, lazy-loaded on scroll.
- **CTA (ghost link + arrow):** `Browse all supported locales` → `/supported-locales`

---

## 11. Docs & Blog preview (DocsBlogPreviewSection.tsx)

Two columns split by a border.

### Left — Documentation
- **Kicker (book icon):** `Documentation`
- **Heading (h3):** `Docs and API reference`
- **Body:** `Learn by example and ship faster.`
- **Sub-column "FRAMEWORKS"** (rows: colored tick + logo + name, all link to docs):
  - Next.js → `/docs/react`
  - React → `/docs/react`
  - React Native → `/docs/react/react-native`
  - Python → `/docs/cli/reference/formats/json-files`
  - Mintlify → `/docs/integrations/mintlify/quickstart`
  - Sanity → `/docs/integrations/sanity`
- **Sub-column "FILETYPES"**:
  - Markdown / MDX → `/docs/cli/reference/formats/mdx-md-files`
  - JSON → `/docs/cli/reference/formats/json-files`
  - YAML → `/docs/cli/reference/formats/yaml-files`
  - HTML → `/docs/cli/reference/formats/html-files`
  - JS / TS → `/docs/cli/reference/formats/ts-js-files`
  - TXT → `/docs/cli/reference/formats/plain-text-files`

### Right — Blog
- **Kicker (newspaper icon):** `Blog`
- **Heading (h3):** `Updates and research`
- **Body:** `Product releases, tips, and best practices.`
- **List:** 3 most recent posts (date, title, 2-line summary — pulled from blog content at build time), each → `/blog/{slug}`
- **CTA:** `All posts →` → `/blog`

---

## 12. Closing CTA (ClosingCTA.tsx)

- **Kicker (globe icon):** `Reach Every User`
- **Heading (h2):** `Deploy today in {rotating language}` (same LanguageRotator as hero)
- **Body:** `Talk to an engineer about implementation or get started for free`
- **CTAs:**
  - **Get a Demo** (rainbow variant) → `/enterprise/contact` (tracked link, location `landing-cta`)
  - **Sign Up** (outline) → `/dashboard`

---

## 13. Footer (packages/ui NewFooter.tsx)

**Left brand column:** GT logo (100×100) → home; below it, three compliance shields (all link to `https://trust.inc/generaltranslation`):
- SOC 2 Type II
- GDPR Compliant
- ISO 27001 Certified

**Link columns (5):**

| Guides | Resources | Social | Company | Legal |
|---|---|---|---|---|
| Locadex Agent → `/docs/locadex` | Documentation → `/docs` | GitHub → github.com/generaltranslation/gt | Careers → `/careers` | Terms of Service → `/legal/terms` |
| Next.js → `/docs/next` | Blog → `/blog` | 𝕏 → x.com/generaltxn | Contact → `/contact` | Privacy → `/legal/privacy-policy` |
| React → `/docs/react` | Pricing → `/pricing` | LinkedIn → linkedin.com/company/generaltranslation | | Acceptable Use Policy → `/legal/acceptable-use` |
| React Native → `/docs/react-native` | Supported Locales → `/supported-locales` | Discord → generaltranslation.com/discord | | Manage Cookies (opens cookie settings dialog) |

**Bottom bar:** system status badge (left) · theme toggle + language selector (right).
**Copyright:** `© {year} General Translation, Inc. All rights reserved.`

---

## 14. Pricing page (linked from nav; `/pricing` — components/pages/pricing/*)

Not on the home page, but part of landing-site content:

- **Hero kicker (globe icon):** `Start free. Upgrade anytime.`
- **Hero h1:** `Pricing for everyone`
- **Hero sub:** `Full-stack localization across buildtime, runtime, and review`
- **Plan cards (2):** **Starter** (featured; CTA `Get Started` → `/signin?selected_plan=tier1`) and **Enterprise** (CTA `Contact Us` → `/enterprise/contact`). Prices/features come from shared `@generaltranslation/settings/services` + `PricingFeatureGrid`/`PlansCard` in packages/ui.
- **Section: `Full-stack localization`** — `Four powerful APIs and services to cover every stage of your development workflow.` Four tiles:
  1. **Code → Internationalization** — "Mark up UI copy, route locales, and ship static translations in your codebase."
  2. **Content → Translation APIs** — "Translate user-generated and backend content on demand across every runtime surface."
  3. **Dashboard → Context Platform** — "Curate glossaries, style rules, and project context, along with editing, versioning, and integrations."
  4. **Locadex → Agent Automations** — "Locadex scans repos, updates i18n code, generates translations, runs visual QA, and opens guarded PRs."
- **Section h2:** `Compare plans` — feature comparison grid; usage pricing link → `/pricing/usage`.

---

## 15. Design system summary (DESIGN.md + globals.css + packages/ui shared.css/fd-theme.css)

### Stated goals (DESIGN.md — note: file references an older `components/marketing/` structure; current code is `components/landing/`)
- "Developer-first, minimalist: black/white with subtle titanium accents."
- "Clear IA: Landing + Docs + Blog under one App Router app."
- "Strong DX cues: instant install, examples, automation focus."
- "UI tokens map to brand; neon accents reserved for CTA/announcements."
- Footer carries SOC 2 & GDPR note.

### Fonts
- **Sans (default):** Inter (`--font-sans`, next/font, latin subset, antialiased)
- **Mono:** Geist Mono (`--font-mono`) — used for the `npx gt@latest` chip and code panels
- The mock demo website intentionally uses `font-serif` to look like a "different site"
- Legacy `.hero-text { font-family: Palatino }` utility exists in shared.css (not used on current landing)

### Colors (shadcn-style HSL tokens, light/dark via `.dark` class; fumadocs `--color-fd-*` aliases map 1:1 onto them)
- Light: background `0 0% 100%` (white), foreground `240 10% 3.9%` (near-black), muted-foreground `240 3.8% 46.1%`, border/input `240 5.9% 90%`, secondary/muted/accent `240 4.8% 95.9%`, primary `240 5.9% 10%`
- Dark: background `240 10% 3.9%` (#0A0A0A), foreground `0 0% 98%`, border/muted `240 3.7% 15.9%`, muted-foreground `240 5% 64.9%`
- **Emphasis (the one brand accent, blue):** light `217 91% 60%`, dark `213 94% 68%`; used at low alphas for selected/hover states (`emphasis/5`, `/30`, `/40`), active icons, animated lines
- Link accent: `#458dff` light / `#6ba5ff` dark
- Status colors: success green `142 76% 45%`, warning `38 92% 50%`, error `0 84% 60%`, in-progress orange `25 95% 53%`
- "Flourish" titanium gradient (dark grays light mode / silver in dark mode) for gradient text/backgrounds
- The "rainbow" button variant is the sole polychrome element (hero Get Started, closing Get a Demo)

### Radius / spacing / layout philosophy
- `--radius: 0.5rem`; everything normalized to md radius (docs bridge remaps lg/xl/2xl → md); flat surfaces, decorative shadows stripped
- Landing layout: single centered `max-w-[1120px]` column; every section has `border-x` + `border-t` so the page reads as one continuous ruled panel; section padding standardized (`px-14`/`3.5rem` desktop, `1.25rem` mobile via `main.container section.border-x` rule); `PlusAccent` "+" marks at rail intersections
- Sections are typically 2-col grids (`md:grid-cols-2`), copy left / artifact right, `min-h-[420px]`
- Section headers follow a strict pattern: kicker (icon + small muted text) → h2 `text-2xl sm:text-3xl font-semibold tracking-tight` → muted body `text-sm sm:text-base`
- Cards: `bg-fd-card`, hairline borders; hover states are subtle (`hover:bg-fd-accent/50`, underline-on-hover for links)
- Animations: marquee (60s linear loop), typewriter rotator, stepper progress, width-morphing skeleton lines, `fade-in`/`slide-*` keyframes; all restrained and looping

### Theming
- next-themes, light/dark/system; theme toggle + language selector live in the footer; logos ship in light/dark pairs and grayscale until hover

---

## 16. Product names & taglines

| Name | What it is | Tagline / descriptor used on site |
|---|---|---|
| **General Translation** ("GT") | Company/platform | "Launch in every language" (hero); "End-to-end localization for the world's best companies" (meta); "General Translation builds full-stack infrastructure for localizing apps, docs, and websites." (demo copy) |
| **Locadex** / **Locadex AI Agent** | AI localization agent | "End-to-end localization"; "AI agents connect to your codebase, internationalize your code, and open pull requests with translations."; docs nav descriptor "AI Agent"; pricing: "Agent Automations" |
| **Translation Editor** | Review workspace | "Edit in context" |
| **Context Platform** | Dashboard/glossaries/rules | one of the three pillars ("from translation agents, to code libraries, to context platform") |
| **gt** (npm) / **Translation CLI** | CLI — `npx gt@latest` | — |
| **gt-next** | Next.js SDK | — |
| **gt-react** | React SDK | — |
| **gt-react-native** | React Native SDK | — |
| **gt-tanstack-start** | TanStack Start SDK | — |
| **gt-node** | Node.js SDK | — |
| **gt-python** / **gt-fastapi** | Python SDK | — |
| **generaltranslation** (npm) | Core library | docs nav descriptor "Core" |
| **gt-sanity** | Sanity integration | — |
| **Locadex for Mintlify** | Mintlify docs integration | — |

**Three product pillars** (anchor IDs on home page): translation agents (`#translation-agents`), code libraries (`#code-libraries`), context platform (`#context-platform`).

**Recurring numbers:** 100+ languages supported (118 in code samples; live count rendered from locale list); 1,000,000,000 ("your next billion users" motif); 6 customer logos; 6 frameworks; 9 SDK capabilities; 5 Locadex flow steps.
