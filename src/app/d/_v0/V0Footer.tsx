"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import type { ComponentType, ReactNode } from "react";

import {
  SiDiscord,
  SiGithub,
  SiNextdotjs,
  SiReact,
  SiX,
} from "@icons-pack/react-simple-icons";

import { ThemeButton } from "@/components/viewer/ThemeButton";

import V0FooterMark from "./V0FooterMark";

import "./v0-footer.css";

type MarkProps = {
  className?: string;
  color?: string;
  "aria-hidden"?: boolean;
};

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
  /** Brand mark, only where the cell names a tool or venue. Functional, never ornament. */
  mark?: ComponentType<MarkProps>;
  /** Manage Cookies: a button where the page passes onManageCookies, as the live footer's opens its consent dialog. */
  action?: "cookies";
};

const DOCS = "https://generaltranslation.com/docs";

/** The real lambda mark, drawn dark for light ground; dark mode inverts it
    in CSS the way the story chip does. */
function LocadexMark({ className }: MarkProps) {
  return (
    <Image
      alt=""
      aria-hidden
      className={`${className ?? ""} is-locadex`}
      height={14}
      src="/brand/no-bg-locadex-logo-light.png"
      width={14}
    />
  );
}

/** LinkedIn shipped out of both icon packs (trademark policy), so the glyph
    is inlined once here — same 24-box, same currentColor contract as the
    Si* marks beside it. */
function LinkedInMark({ className, color, ...rest }: MarkProps) {
  return (
    <svg
      className={className}
      fill={color ?? "currentColor"}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

/* The production footer's full roster, regrouped under the ledger's heads.
 *
 * Internal destinations resolve against the CURRENT concept's base, the same
 * way V0Nav's menus do: every concept that mounts this footer ships its own
 * blog, pricing, locales, careers and contact, so a hardcoded
 * generaltranslation.com href sent readers off to the live site instead of
 * the page sitting one route away. Only what has no page here stays absolute:
 * the docs and the social venues. The legal column resolves against the
 * concept too: the production concept ships the live /legal/<document>
 * pages under /d/production/legal.
 *
 * The production concept follows the live footer-links.tsx (gt-cloud
 * apps/landing/src/components/landing/shell, origin/main): Supported Locales
 * at /supported-locales, the Report Card label, the Guides and Documentation
 * rows on their docs pages, and the live social addresses. The other
 * concepts keep the addresses they were drawn with. */
const PRODUCTION = "/d/production";

const columns = (
  base: string,
): readonly { title: string; links: readonly FooterLink[] }[] => {
  const isProduction = base === PRODUCTION;
  return [
  {
    title: "Guides",
    links: [
      {
        label: "Locadex Agent",
        href: isProduction ? `${DOCS}/platform/locadex/quickstart` : DOCS,
        external: true,
        mark: LocadexMark,
      },
      {
        label: "Next.js",
        href: isProduction ? `${DOCS}/react/nextjs-quickstart` : DOCS,
        external: true,
        mark: SiNextdotjs,
      },
      {
        label: "React",
        href: isProduction ? `${DOCS}/react/overview` : DOCS,
        external: true,
        mark: SiReact,
      },
      {
        label: "React Native",
        href: isProduction ? `${DOCS}/react/react-native-quickstart` : DOCS,
        external: true,
        mark: SiReact,
      },
    ],
  },
  {
    title: "Resources",
    links: [
      {
        label: "Documentation",
        href: isProduction ? `${DOCS}/overview/get-started` : DOCS,
        external: true,
      },
      { label: "Blog", href: `${base}/blog` },
      { label: "Pricing", href: `${base}/pricing` },
      {
        label: "Supported Locales",
        href: isProduction ? `${base}/supported-locales` : `${base}/locales`,
      },
      {
        label: isProduction ? "Report Card" : "Report card",
        href:
          isProduction ? `${base}/report-card` : "/d/singularity-dossier/try",
      },
    ],
  },
  {
    title: "Social",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/generaltranslation",
        external: true,
        mark: SiGithub,
      },
      {
        label: "X",
        href: isProduction ? "https://x.com/generaltxn" : "https://x.com/generaltranslation",
        external: true,
        mark: SiX,
      },
      {
        label: "LinkedIn",
        href: isProduction
          ? "https://www.linkedin.com/company/generaltranslation"
          : "https://www.linkedin.com/company/general-translation",
        external: true,
        mark: LinkedInMark,
      },
      {
        label: "Discord",
        href: isProduction
          ? "https://discord.gg/SjQwPjZaGa"
          : "https://discord.gg/generaltranslation",
        external: true,
        mark: SiDiscord,
      },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Careers", href: `${base}/careers` },
      { label: "Contact", href: `${base}/contact` },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: `${base}/legal/terms` },
      { label: "Privacy", href: `${base}/legal/privacy-policy` },
      { label: "Acceptable Use Policy", href: `${base}/legal/acceptable-use` },
      { label: "Manage Cookies", href: "#", action: "cookies" },
    ],
  },
];
};

/* The compliance program, as the production shields (the site's own
   /shields SVGs, vendored) — side by side, all three doors into the same
   trust center. Inked for the light ground; dark inverts them, exactly the
   production footer's dark:invert. */
const BADGES: readonly { alt: string; src: string }[] = [
  { alt: "SOC 2 Type II", src: "/shields/soc-2-type-2.svg" },
  { alt: "GDPR Compliant", src: "/shields/gdpr.svg" },
  { alt: "ISO 27001 Certified", src: "/shields/iso-27001.svg" },
];

/**
 * The v0 close: the production footer's full contents on one open sheet.
 * The metal-masked mark and the drawn compliance seals in the left cell,
 * five link columns beside it with no interior seams (founder note): the
 * columns separate by rhythm alone, and only the closing strip keeps its
 * hairline. Then live status, the copyright line and the theme switch.
 *
 * The production mirror mounts it through production/sections/ProdFooter,
 * which passes live's language selector and theme switch as `tools` and
 * opens its consent stub from Manage Cookies. The footer imports nothing
 * from the production concept, so the other concepts load none of its
 * styles, and they keep their own markup: h3 column heads, the "Report
 * card" label, a plain mark and a Manage Cookies link.
 */
export default function V0Footer({
  tools,
  onManageCookies,
}: {
  /** Replaces the shell's ThemeButton at the end of the closing strip. */
  tools?: ReactNode;
  /** Makes Manage Cookies a button that runs this. */
  onManageCookies?: () => void;
} = {}) {
  // /d/singularity-dossier/... -> /d/singularity-dossier, as V0Nav resolves it
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? "";
  const isProduction = base === PRODUCTION;
  /* h2 on the mirror, as the live footer: some of its pages head only at
     h1, so an h3 would skip a level (Lighthouse heading-order). The other
     concepts head their sections at h2 and keep h3. The ledger's own rule
     in v0-footer.css pins the type either way. */
  const ColumnHead = isProduction ? "h2" : "h3";
  const mark = <V0FooterMark />;

  return (
    <footer className="tc-sec v0-foot">
      <div className="v0-foot-grid">
        <div className="v0-foot-cell v0-foot-brand">
          {/* The mark in living metal: the drawn glyph masks an animated
              chrome shader (V0FooterMark); the static gradient stays as the
              no-WebGL and reduced-motion ground. */}
          {isProduction ? (
            /* the mark links home, as the live footer's does */
            <a
              aria-label="General Translation home"
              className="v0-foot-home"
              href={base}
            >
              {mark}
            </a>
          ) : (
            mark
          )}
          <p>
            {base === PRODUCTION ? "Full-stack" : "End-to-end"}
            {" localization for the world\u2019s best companies"}
          </p>

          {/* fetchPriority low keeps React from preloading the badges in
              the head; they still load eagerly, so a full-page capture
              shows them */}
          <div className="v0-foot-badges">
            {BADGES.map(({ alt, src }) => (
              <a
                className="v0-foot-badge"
                href="https://trust.inc/generaltranslation"
                key={src}
                rel="noreferrer"
                target="_blank"
              >
                <img
                  alt={alt}
                  decoding="async"
                  fetchPriority="low"
                  src={src}
                  width={40}
                  height={40}
                />
              </a>
            ))}
          </div>
        </div>

        {columns(base).map((column) => (
          <nav
            aria-label={column.title}
            className="v0-foot-cell v0-foot-col"
            key={column.title}
          >
            <ColumnHead>{column.title}</ColumnHead>
            <ul>
              {column.links.map((link) => {
                const Mark = link.mark;
                if (link.action === "cookies" && onManageCookies) {
                  /* the production mirror opens its consent stub's
                     settings dialog; the other concepts run no consent
                     dialog and keep the link */
                  return (
                    <li key={link.label}>
                      <button type="button" onClick={onManageCookies}>
                        {link.label}
                      </button>
                    </li>
                  );
                }
                return (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      rel={link.external ? "noreferrer" : undefined}
                      target={link.external ? "_blank" : undefined}
                    >
                      {Mark ? (
                        <Mark
                          aria-hidden
                          className="v0-foot-mark"
                          color="currentColor"
                        />
                      ) : null}
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        ))}
      </div>

      <div className="v0-foot-bar">
        <a
          className="v0-foot-status"
          href="https://gt-status.com/"
          rel="noreferrer"
          target="_blank"
        >
          <span aria-hidden className="v0-foot-dot" />
          All Systems Operational
        </a>
        <span className="v0-foot-copy max-[640px]:ml-0 max-[640px]:w-full max-[640px]:text-left">
          © 2026 General Translation, Inc. All rights reserved.
        </span>
        {tools ?? <ThemeButton className="v0-foot-theme max-[640px]:ml-auto" />}
      </div>
    </footer>
  );
}
