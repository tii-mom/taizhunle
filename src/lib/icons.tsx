import type { SVGProps } from 'react';

export function WalletIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <rect x="8" y="16" width="48" height="32" rx="10" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="2" />
      <path
        d="M46 26H50C53.3137 26 56 28.6863 56 32C56 35.3137 53.3137 38 50 38H46"
        stroke="var(--color-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="12" y="22" width="26" height="20" rx="6" fill="var(--color-background)" stroke="var(--color-border)" strokeWidth="2" />
      <circle cx="48" cy="32" r="4" fill="var(--color-accent)" opacity="0.85" />
      <circle cx="22" cy="32" r="3" fill="var(--color-accent)" opacity="0.35" />
    </svg>
  );
}
