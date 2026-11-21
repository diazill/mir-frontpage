import type { ReactNode } from "react";

// One outline icon set: 24px grid, 2px stroke, round caps and joins.
// Icons are decorative (aria-hidden); the control or text next to them
// carries the accessible name.

type IconProps = { className?: string };

function Outline({ className = "h-5 w-5", children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.2 4.2" />
    </Outline>
  );
}

export function CartIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 1.9-1.5L21 8H6" />
      <circle cx="10" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </Outline>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M12 5v14M5 12h14" />
    </Outline>
  );
}

export function MinusIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M5 12h14" />
    </Outline>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Outline>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Outline>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="m7 10 5 5 5-5" />
    </Outline>
  );
}

export function ArrowDownIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M12 5v14m0 0 6-6m-6 6-6-6" />
    </Outline>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M5 12h14m0 0-6-6m6 6-6 6" />
    </Outline>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
    </Outline>
  );
}

export function ExternalIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M7 17 17 7M8 7h9v9" />
    </Outline>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </Outline>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </Outline>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Outline>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M5 4h3l2 5-2 1.5a15 15 0 0 0 5.5 5.5L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </Outline>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <rect height="14" rx="2" width="18" x="3" y="5" />
      <path d="m4 7 8 6 8-6" />
    </Outline>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M4 5h16v11H9l-5 4V5Z" />
      <path d="M8 10h8M8 13h5" />
    </Outline>
  );
}

export function TruckIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="17.5" cy="17.5" r="1.5" />
    </Outline>
  );
}

export function StoreIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M4 10v10h16V10M3 10l2-6h14l2 6M3 10h18M9 20v-6h6v6" />
    </Outline>
  );
}

export function BoxIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8ZM3 8l9 5 9-5M12 13v8" />
    </Outline>
  );
}

export function HelpIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </Outline>
  );
}

export function ImageIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <rect height="16" rx="2" width="18" x="3" y="4" />
      <circle cx="8.5" cy="9" r="1.5" />
      <path d="m21 15-5-5L5 20" />
    </Outline>
  );
}

/** Picks an animal outline from a category name ("Kucing", "Unggas", ...). */
export function CategoryIcon({ category, className }: IconProps & { category: string }) {
  const name = category.toLocaleLowerCase("id-ID");

  if (name.includes("kucing")) {
    return (
      <Outline className={className}>
        <path d="m5 9 1-5 5 3h2l5-3 1 5a8 8 0 1 1-14 0Z" />
        <path d="M9 11h.01M15 11h.01m-4 3 1 .7 1-.7" />
      </Outline>
    );
  }

  if (name.includes("burung")) {
    return (
      <Outline className={className}>
        <path d="M3 16c3-1 5-4 7-8 2 3 4 5 7 5l4-2-2 4c-2 4-6 6-11 5l-5-1 3-2-3-1Z" />
        <path d="M14 8h.01" />
      </Outline>
    );
  }

  if (name.includes("unggas") || name.includes("ayam") || name.includes("ternak")) {
    return (
      <Outline className={className}>
        <path d="M8 10a2 2 0 1 1 4 0m-4 0a2 2 0 0 0-3 2 2 2 0 0 0 1 3.7 2 2 0 0 0 3 2.3 2 2 0 0 0 3-2.3 2 2 0 0 0 1-3.7 2 2 0 0 0-3-2" />
        <path d="M12 12c2-2 5-2 6 0l2 1-2 1a5 5 0 0 1-5 4m-3 0v2m4-2v2" />
      </Outline>
    );
  }

  return (
    <Outline className={className}>
      <path d="M12 20s-7-4.2-7-9a3.7 3.7 0 0 1 7-1.8A3.7 3.7 0 0 1 19 11c0 4.8-7 9-7 9Z" />
    </Outline>
  );
}

/** WhatsApp brand glyph (filled, as the brand mark is). */
export function WhatsAppIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg aria-hidden="true" className={`shrink-0 ${className}`} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.04 2a9.93 9.93 0 0 0-8.52 15.04L2 22l5.1-1.34A10 10 0 1 0 12.04 2Zm0 18.18a8.14 8.14 0 0 1-4.15-1.13l-.3-.18-3.03.8.81-2.95-.2-.3a8.16 8.16 0 1 1 6.87 3.76Zm4.48-6.12c-.25-.13-1.47-.73-1.7-.81-.23-.08-.4-.13-.57.13-.17.25-.65.81-.8.98-.15.17-.3.19-.55.06-.25-.13-1.05-.39-2-.1-.74-.67-1.23-1.5-1.37-1.75-.14-.25-.02-.38.11-.5.11-.11.25-.3.38-.44.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.57-1.38-.78-1.89-.2-.5-.41-.43-.57-.44h-.49c-.17 0-.45.06-.68.32-.23.25-.89.87-.89 2.12s.91 2.46 1.03 2.63c.13.17 1.79 2.73 4.34 3.83.61.26 1.09.42 1.46.54.61.19 1.16.16 1.6.1.49-.07 1.47-.6 1.68-1.19.21-.59.21-1.1.15-1.2-.06-.1-.23-.17-.48-.3Z" />
    </svg>
  );
}
