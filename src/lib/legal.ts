const legalCommit = 'f59e27a30a8186e97d7577fcbacecdd10b4f9bdb';
const legalSourceRoot = `https://raw.githubusercontent.com/generaltranslation/legal/${legalCommit}/en-US`;

const legalDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
  year: 'numeric',
});

export type LegalDocumentIndexEntry = {
  route: string;
  title: string;
  description: string;
};

export type LegalDocument = LegalDocumentIndexEntry & {
  lastUpdated: string;
  content: string;
};

export const legalDocuments: readonly LegalDocumentIndexEntry[] = [
  {
    route: 'acceptable-use',
    title: 'Acceptable Use Policy',
    description: 'Acceptable use guidelines for General Translation’s services.',
  },
  {
    route: 'cookie-policy',
    title: 'Cookie Policy',
    description: 'How General Translation uses cookies and similar technologies.',
  },
  {
    route: 'credit-terms',
    title: 'Credit Terms',
    description: 'Terms governing General Translation credits.',
  },
  {
    route: 'data-processing',
    title: 'Data Processing Agreement',
    description: 'Data processing terms for General Translation customer personal data.',
  },
  {
    route: 'privacy-policy',
    title: 'Privacy Policy',
    description: 'How General Translation collects, uses, and discloses personal data.',
  },
  {
    route: 'subprocessors',
    title: 'Subprocessors',
    description: 'List of subprocessors used by General Translation to provide its services.',
  },
  {
    route: 'terms',
    title: 'Terms of Service',
    description: 'Terms governing use of General Translation services.',
  },
] as const;

const readFrontmatterValue = (frontmatter: string, key: string): string | null => {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, 'm'));
  return match?.[1]?.trim() ?? null;
};

const formatLegalDate = (value: string): string | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== (month ?? 1) - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return legalDateFormatter.format(date);
};

export async function getLegalDocument(route: string): Promise<LegalDocument | null> {
  const indexEntry = legalDocuments.find((document) => document.route === route);
  if (!indexEntry) return null;

  const response = await fetch(`${legalSourceRoot}/${route}.md`, {
    cache: 'force-cache',
  });
  if (!response.ok) return null;

  const source = await response.text();
  const sourceMatch = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n+([\s\S]*)$/);
  if (!sourceMatch) return null;

  const frontmatter = sourceMatch[1] ?? '';
  const markdown = sourceMatch[2] ?? '';
  const titleMatch = markdown.match(/^#\s+([^\r\n]+)\r?\n/);
  const updatedValue = readFrontmatterValue(frontmatter, 'last_updated');
  const lastUpdated = updatedValue ? formatLegalDate(updatedValue) : null;
  if (!titleMatch?.[1] || !lastUpdated) return null;

  return {
    ...indexEntry,
    title: titleMatch[1].trim(),
    lastUpdated,
    content: markdown.slice(titleMatch[0].length).replace(/^\r?\n/, ''),
  };
}

export function normalizeLegalDocumentHref(href: string | undefined): string | undefined {
  if (!href) return href;
  if (href.startsWith('https://generaltranslation.com/legal/')) {
    return href.replace('https://generaltranslation.com/legal/', '/d/singularity-dossier/legal/');
  }
  if (
    href.startsWith('/') ||
    href.startsWith('#') ||
    href.startsWith('//') ||
    /^[a-z][a-z\d+.-]*:/i.test(href)
  ) {
    return href;
  }
  return href.replace(/\.md(?=([?#]|$))/, '');
}
