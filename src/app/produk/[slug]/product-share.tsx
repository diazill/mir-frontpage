"use client";

import { useEffect, useState } from "react";
import { CheckIcon, WhatsAppIcon } from "@/components/icons";

function FacebookIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
      <path d="M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4a20 20 0 0 0-2.2-.1c-2.2 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3Z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </svg>
  );
}

const buttonClassName =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold text-ink-soft transition-colors hover:border-line-strong hover:bg-canvas";

/** Share links for a product page. `url` is the absolute canonical URL. */
export default function ProductShare({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeoutId = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  const shareText = `${title} di MIR Pakan Ternak: ${url}`;

  return (
    <div className="mt-6">
      <p className="text-sm font-semibold text-body">Bagikan produk</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <a
          className={buttonClassName}
          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
          rel="noreferrer"
          target="_blank"
        >
          <WhatsAppIcon />
          WhatsApp
        </a>
        <a
          className={buttonClassName}
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
          rel="noreferrer"
          target="_blank"
        >
          <FacebookIcon />
          Facebook
        </a>
        <button
          className={buttonClassName}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopyFailed(false);
              setCopied(true);
            } catch {
              setCopyFailed(true);
            }
          }}
          type="button"
        >
          {copied ? <CheckIcon /> : <LinkIcon />}
          {copied ? "Tautan disalin" : "Salin tautan"}
        </button>
      </div>
      <div aria-live="polite">
        {copyFailed && (
          <p className="mt-2 text-sm text-muted">
            Tautan tidak bisa disalin otomatis. Salin dari sini: <span className="break-all text-ink">{url}</span>
          </p>
        )}
      </div>
    </div>
  );
}
