import type { Metadata } from 'next';

import { fontVariables } from '@/lib/fonts';

import './globals.css';

export const metadata: Metadata = {
  title: 'GT Redesign Explorations',
  description: 'Art directions for the General Translation marketing site.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={fontVariables} suppressHydrationWarning>
      <head>
        {/* apply the persisted theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('gt-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
