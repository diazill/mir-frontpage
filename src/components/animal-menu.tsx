"use client";

import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { CategoryIcon, ChevronDownIcon } from "./icons";

/**
 * "Hewan" disclosure menu. Opens on click or tap (not hover), closes on
 * Escape, outside click, link choice, or when the page is hidden by
 * Next.js' Activity-based navigation.
 */
export default function AnimalMenu({
  categories,
  className,
}: {
  categories: string[];
  className: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useLayoutEffect(() => () => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  if (categories.length === 0) {
    return (
      <Link className={className} href="/produk">
        Hewan
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
      ref={rootRef}
    >
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className={`${className} inline-flex items-center gap-1`}
        onClick={() => setIsOpen((open) => !open)}
        ref={buttonRef}
        type="button"
      >
        Hewan
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`absolute left-1/2 top-full z-50 min-w-52 -translate-x-1/2 pt-2 ${
          isOpen ? "" : "hidden"
        }`}
        id={panelId}
      >
        <ul className="rounded-2xl border border-line bg-surface p-2 shadow-pop">
          {categories.map((category) => (
            <li key={category}>
              <Link
                className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-ink-soft transition-colors hover:bg-sand hover:text-brand"
                href={`/produk?category=${encodeURIComponent(category)}`}
                onClick={() => setIsOpen(false)}
              >
                <CategoryIcon category={category} />
                {category}
              </Link>
            </li>
          ))}
          <li className="mt-1 border-t border-line pt-1">
            <Link
              className="flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-sage transition-colors hover:bg-sand hover:text-brand"
              href="/produk"
              onClick={() => setIsOpen(false)}
            >
              Semua produk
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
