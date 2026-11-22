import { whatsappHref } from "@/lib/site";
import { getStoreInfo } from "@/lib/store";
import { WhatsAppIcon } from "./icons";

/**
 * Customer-facing message when the Laravel catalog cannot be loaded.
 * The technical reason is shown only in development.
 */
export default async function CatalogError({
  detail,
  retryHref,
}: {
  detail: string;
  retryHref: string;
}) {
  const store = await getStoreInfo();
  return (
    <div className="rounded-2xl border border-notice-line bg-notice-tint p-5 text-sm text-notice" role="alert">
      <p className="font-semibold text-ink">Katalog sedang tidak bisa dimuat</p>
      <p className="mt-1 leading-6">
        Muat ulang halaman sebentar lagi. Kalau masih gagal, tanyakan harga dan
        stok langsung ke tim MIR lewat WhatsApp.
      </p>
      {process.env.NODE_ENV !== "production" && (
        <p className="mt-2 font-mono text-xs">Detail (hanya di development): {detail}</p>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          className="inline-flex min-h-11 items-center rounded-full border border-line-strong bg-surface px-5 font-semibold text-brand transition-colors hover:bg-brand-tint"
          href={retryHref}
        >
          Muat ulang
        </a>
        <a
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 font-semibold text-white transition-colors hover:bg-brand-strong"
          href={whatsappHref(store.whatsapp, "Halo MIR, saya ingin tanya harga dan stok produk.")}
          rel="noreferrer"
          target="_blank"
        >
          <WhatsAppIcon />
          Tanya lewat WhatsApp
        </a>
      </div>
    </div>
  );
}
