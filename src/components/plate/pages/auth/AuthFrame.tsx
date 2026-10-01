import type { ReactNode } from 'react';

export const authTitleClassName = 'typo-page-heading';
export const authLedeClassName = 'typo-lede';

type AuthFrameProps = {
  title?: ReactNode;
  lede?: ReactNode;
  /** Closing line under the content, in the caption ink. */
  footnote?: ReactNode;
  children?: ReactNode;
  testId?: string;
};

/**
 * The content stack every secondary auth screen shares (OAuth sign-in,
 * consent, device code, CLI wizard), inside the plate frame's column: the
 * page heading, a lede, the content, then a 13px footnote. The frame
 * supplies the column, the mark and the foot. Hook-free so route tests can
 * render it with react-dom/server.
 */
export default function AuthFrame({
  title,
  lede,
  footnote,
  children,
  testId,
}: AuthFrameProps) {
  return (
    <div className='flex flex-col gap-9' data-testid={testId}>
      {(title || lede) && (
        <div className='flex flex-col gap-4'>
          {title && <h1 className={authTitleClassName}>{title}</h1>}
          {lede && <p className={authLedeClassName}>{lede}</p>}
        </div>
      )}
      {children && <div className='flex flex-col gap-7'>{children}</div>}
      {footnote && <p className='typo-caption'>{footnote}</p>}
    </div>
  );
}
