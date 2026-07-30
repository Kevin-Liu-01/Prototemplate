/**
 * The six first-party stacks, in the order the docs nav lists them. Every
 * sample here is the shipped one from generaltranslation.com, trimmed to the
 * lines that carry the idea.
 */

export type Framework = {
  id: string;
  name: string;
  pkg: string;
  file: string;
  blurb: string;
  /** The two commands a reader runs before the sample above makes sense. */
  install: readonly [string, string];
  code: string;
  caps: readonly string[];
  docs: string;
};

/**
 * One real product output per capability, so the table's cells carry the
 * thing rather than the word: the German number format, the French date the
 * page ships today, the Polish plural pair, the fr pathname the routing
 * diagram draws. Shared across stacks — the capability is the same object
 * whichever SDK renders it.
 */
export const CAP_DEMOS: Record<string, string> = {
  UI: '<T>…</T>',
  Text: "'¡Hola, mundo!'",
  Numbers: '1.234.567,89',
  Currencies: '1.280,00 €',
  Dates: '29 juil. 2026',
  Plurals: '1 plik · 4 pliki',
  Functions: 'useGT() · getGT()',
  Context: 'context="file"',
  Routing: '/fr/a-propos',
  Globals: '<GTProvider>',
  Requests: 'Accept-Language',
  Middleware: 'initializeGT()',
};

export const FRAMEWORKS: readonly Framework[] = [
  {
    id: 'next',
    name: 'Next.js',
    pkg: 'gt-next',
    file: 'app/page.tsx',
    blurb: 'Server components, middleware locale routing, and static translations built at build time.',
    install: ['npm i gt-next', 'npx gt@latest'],
    code: `import { T, Num, DateTime } from 'gt-next';

export default function Home() {
  return (
    <T>
      <main>
        <h1>Hello, world!</h1>
        <p>
          <DateTime>{new Date()}</DateTime>
        </p>
        <p>
          GT has everything you need to ship your
          product in <Num>{118}</Num> languages.
        </p>
      </main>
    </T>
  );
}`,
    caps: ['UI', 'Text', 'Numbers', 'Currencies', 'Dates', 'Plurals', 'Functions', 'Context', 'Routing'],
    docs: '/docs/next',
  },
  {
    id: 'react',
    name: 'React',
    pkg: 'gt-react',
    file: 'src/Home.tsx',
    blurb: 'One provider, one loader. Works in Vite, CRA, and anything else that renders React.',
    install: ['npm i gt-react', 'npx gt@latest'],
    code: `import { T, Num, DateTime } from 'gt-react';

export default function Home() {
  return (
    <T>
      <main>
        <h1>Hello, world!</h1>
        <p>
          <DateTime>{new Date()}</DateTime>
        </p>
        <p>
          GT has everything you need to ship your
          product in <Num>{118}</Num> languages.
        </p>
      </main>
    </T>
  );
}`,
    caps: ['UI', 'Text', 'Numbers', 'Currencies', 'Dates', 'Plurals', 'Functions', 'Context', 'Globals'],
    docs: '/docs/react',
  },
  {
    id: 'react-native',
    name: 'React Native',
    pkg: 'gt-react-native',
    file: 'app/index.tsx',
    blurb: 'The same components on native, with a Babel plugin that bundles each locale.',
    install: ['npm i gt-react-native', 'npx gt@latest'],
    code: `import { Text, View } from 'react-native';
import { T, DateTime } from 'gt-react-native';

export default function Home() {
  return (
    <T>
      <View>
        <Text>Hello, world!</Text>
        <Text>
          <DateTime>{new Date()}</DateTime>
        </Text>
      </View>
    </T>
  );
}`,
    caps: ['UI', 'Text', 'Numbers', 'Currencies', 'Dates', 'Plurals', 'Functions', 'Context', 'Globals'],
    docs: '/docs/react-native',
  },
  {
    id: 'tanstack',
    name: 'TanStack Start',
    pkg: 'gt-tanstack-start',
    file: 'src/routes/index.tsx',
    blurb: 'Translations resolved in the route loader, so the first paint is already localized.',
    install: ['npm i gt-tanstack-start', 'npx gt@latest'],
    code: `import { createFileRoute } from '@tanstack/react-router';
import { T, DateTime } from 'gt-react';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <T>
      <h1>Hello, world!</h1>
      <p>
        <DateTime>{new Date()}</DateTime>
      </p>
    </T>
  );
}`,
    caps: ['UI', 'Text', 'Numbers', 'Currencies', 'Dates', 'Plurals', 'Functions', 'Context', 'Routing'],
    docs: '/docs/tanstack-start',
  },
  {
    id: 'node',
    name: 'Node.js',
    pkg: 'gt-node',
    file: 'server.ts',
    blurb: 'Request-scoped locale for APIs, emails, and anything rendered on the server.',
    install: ['npm i gt-node', 'npx gt@latest'],
    code: `import express from 'express';
import { getGT, initializeGT } from 'gt-node';

initializeGT({
  defaultLocale: 'en',
  locales: ['es', 'fr', 'ja', 'de', 'zh'],
});

const app = express();

app.get('/', async (req, res) => {
  const gt = await getGT();
  res.send(gt('Hello, world!'));
});

app.listen(3000);`,
    caps: ['Text', 'Numbers', 'Currencies', 'Dates', 'Plurals', 'Functions', 'Context', 'Requests', 'Middleware'],
    docs: '/docs/node',
  },
  {
    id: 'python',
    name: 'Python',
    pkg: 'gt-fastapi',
    file: 'app.py',
    blurb: 'FastAPI middleware reads the request locale; t() returns the translated string.',
    install: ['pip install gt-fastapi', 'gt init'],
    code: `from fastapi import FastAPI
from gt_fastapi import initialize_gt, t

app = FastAPI()
initialize_gt(app)

@app.get("/")
def home():
    title = t("Hello, world!")
    body = t(
        "GT has everything you need to ship your "
        "product in {count} languages.",
        count=118,
    )
    return {"title": title, "body": body}`,
    caps: ['Text', 'Numbers', 'Currencies', 'Dates', 'Plurals', 'Functions', 'Context', 'Requests', 'Middleware'],
    docs: '/docs/python',
  },
];
