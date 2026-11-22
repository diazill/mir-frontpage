import Image from "next/image";
import Link from "next/link";
import { FALLBACK_STORE_INFO, type StoreInfo } from "@/lib/site";
import { getStoreInfo } from "@/lib/store";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "./icons";

const FOOTER_LINKS = [
  { href: "/produk", label: "Semua produk" },
  { href: "/brand", label: "Brand" },
  { href: "/tentang", label: "Tentang MIR" },
  { href: "/lokasi", label: "Lokasi & jam buka" },
  { href: "/kontak", label: "Kontak" },
];

const contactLinkClassName =
  "flex items-start gap-3 rounded-md py-1 transition-colors hover:text-white";

/** Footer markup; the layout shows it with fallback data until the API answers. */
export function SiteFooterView({ store }: { store: StoreInfo }) {
  return (
    <footer className="on-dark bg-brand text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-8 sm:py-14 md:grid-cols-[1.1fr_0.7fr_1.3fr] md:gap-12">
        <div>
          <Link aria-label={`${store.name}, beranda`} className="inline-flex items-center gap-3" href="/">
            <Image
              alt=""
              className="h-11 w-11 shrink-0 rounded-xl bg-white object-contain p-1"
              height={44}
              src="/favicon.ico"
              width={44}
            />
            <span>
              <span className="block text-base font-bold uppercase tracking-wide">{store.name}</span>
              <span className="mt-0.5 block text-xs text-white/75">{store.locality}</span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/80">
            Pakan kucing, burung, unggas, dan ternak, plus aksesoris sangkar.
            Cek harga di sini, lalu pesan lewat WhatsApp atau datang ke toko.
          </p>
          <p className="mt-4 flex items-start gap-2 text-sm text-white/80">
            <ClockIcon className="mt-0.5 h-4 w-4" />
            {store.hoursSummary}
          </p>
        </div>

        <nav aria-label="Tautan footer">
          <h2 className="text-sm font-bold">Jelajahi</h2>
          <ul className="mt-3 text-sm text-white/80">
            {FOOTER_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link className="inline-flex min-h-10 items-center transition-colors hover:text-white" href={href}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold">Hubungi kami</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li>
              <a className={contactLinkClassName} href={store.whatsappUrl} rel="noreferrer" target="_blank">
                <WhatsAppIcon className="mt-0.5 h-5 w-5" />
                <span>WhatsApp {store.phoneDisplay}</span>
              </a>
            </li>
            <li>
              <a className={contactLinkClassName} href={`tel:${store.phone}`}>
                <PhoneIcon className="mt-0.5 h-5 w-5" />
                <span>Telepon {store.phoneDisplay}</span>
              </a>
            </li>
            <li>
              <a className={contactLinkClassName} href={`mailto:${store.email}`}>
                <MailIcon className="mt-0.5 h-5 w-5" />
                <span className="[overflow-wrap:anywhere]">{store.email}</span>
              </a>
            </li>
            <li>
              <a className={contactLinkClassName} href={store.mapsUrl} rel="noreferrer" target="_blank">
                <PinIcon className="mt-0.5 h-5 w-5" />
                <span>{store.fullAddress}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 bg-brand-strong">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs text-white/75 sm:px-8">
          © 2026 MIR Pakan Ternak · #MIRsayangternak
        </p>
      </div>
    </footer>
  );
}

export default async function SiteFooter() {
  return <SiteFooterView store={await getStoreInfo()} />;
}

export function SiteFooterFallback() {
  return <SiteFooterView store={FALLBACK_STORE_INFO} />;
}
