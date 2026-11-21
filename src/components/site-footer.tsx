import Image from "next/image";
import Link from "next/link";
import { STORE, STORE_FULL_ADDRESS, STORE_HOURS_SUMMARY } from "@/lib/site";
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

export default function SiteFooter() {
  return (
    <footer className="on-dark bg-brand text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-8 sm:py-14 md:grid-cols-[1.1fr_0.7fr_1.3fr] md:gap-12">
        <div>
          <Link aria-label="MIR Pakan Ternak, beranda" className="inline-flex items-center gap-3" href="/">
            <Image
              alt=""
              className="h-11 w-11 shrink-0 rounded-xl bg-white object-contain p-1"
              height={44}
              src="/favicon.ico"
              width={44}
            />
            <span>
              <span className="block text-base font-bold tracking-wide">MIR PAKAN TERNAK</span>
              <span className="mt-0.5 block text-xs text-white/75">Tingkir, Salatiga</span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/80">
            Pakan kucing, burung, unggas, dan ternak, plus aksesoris sangkar.
            Cek harga di sini, lalu pesan lewat WhatsApp atau datang ke toko.
          </p>
          <p className="mt-4 flex items-start gap-2 text-sm text-white/80">
            <ClockIcon className="mt-0.5 h-4 w-4" />
            {STORE_HOURS_SUMMARY}
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
              <a className={contactLinkClassName} href={STORE.whatsappUrl} rel="noreferrer" target="_blank">
                <WhatsAppIcon className="mt-0.5 h-5 w-5" />
                <span>WhatsApp {STORE.phoneDisplay}</span>
              </a>
            </li>
            <li>
              <a className={contactLinkClassName} href={`tel:${STORE.phone}`}>
                <PhoneIcon className="mt-0.5 h-5 w-5" />
                <span>Telepon {STORE.phoneDisplay}</span>
              </a>
            </li>
            <li>
              <a className={contactLinkClassName} href={`mailto:${STORE.email}`}>
                <MailIcon className="mt-0.5 h-5 w-5" />
                <span className="[overflow-wrap:anywhere]">{STORE.email}</span>
              </a>
            </li>
            <li>
              <a className={contactLinkClassName} href={STORE.mapsUrl} rel="noreferrer" target="_blank">
                <PinIcon className="mt-0.5 h-5 w-5" />
                <span>{STORE_FULL_ADDRESS}</span>
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
