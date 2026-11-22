import Link from "next/link";
import type { Metadata } from "next";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";
import type { StoreInfo } from "@/lib/site";
import { getStoreInfo } from "@/lib/store";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Hubungi MIR Pakan Ternak Salatiga lewat WhatsApp, telepon, atau email untuk tanya produk, stok, dan pesanan.",
  alternates: { canonical: "/kontak" },
};

function contactChannels(store: StoreInfo) {
  return [
    {
      title: "WhatsApp",
      detail: store.phoneDisplay,
      note: "Paling cepat untuk tanya stok, harga, dan pesan antar.",
      href: store.whatsappUrl,
      action: "Chat sekarang",
      external: true,
      icon: WhatsAppIcon,
    },
    {
      title: "Telepon",
      detail: store.phoneDisplay,
      note: `Kami angkat telepon pada jam buka: ${store.hoursSummary}.`,
      href: `tel:${store.phone}`,
      action: "Telepon toko",
      external: false,
      icon: PhoneIcon,
    },
    {
      title: "Email",
      detail: store.email,
      note: "Untuk pertanyaan yang tidak mendesak atau tawaran kerja sama.",
      href: `mailto:${store.email}`,
      action: "Kirim email",
      external: false,
      icon: MailIcon,
    },
  ];
}

const secondaryButtonClassName =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-line-strong px-5 text-sm font-semibold text-brand transition-colors hover:bg-brand-tint";

export default async function ContactPage() {
  const store = await getStoreInfo();
  const channels = contactChannels(store);

  return (
    <section className="bg-canvas px-4 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-5xl">Hubungi MIR</h1>
          <p className="mt-4 text-base leading-7 text-body">
            Tanya produk, stok, atau pesanan lewat WhatsApp, telepon, atau email.
          </p>
        </div>

        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {channels.map(({ title, detail, note, href, action, external, icon: Icon }) => (
            <li className="flex flex-col rounded-3xl border border-line bg-surface p-6" key={title}>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <Icon className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-ink">{title}</h2>
              <p className="mt-1 text-sm font-semibold text-brand [overflow-wrap:anywhere]">{detail}</p>
              <p className="mt-2 flex-1 text-sm leading-6 text-body">{note}</p>
              <a
                className="mt-5 inline-flex min-h-11 items-center justify-center self-start rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
                href={href}
                {...(external ? { rel: "noreferrer", target: "_blank" } : {})}
              >
                {action}
              </a>
            </li>
          ))}
        </ul>

        <section
          aria-labelledby="kunjungi-toko"
          className="mt-6 grid gap-6 rounded-3xl border border-line bg-surface p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center"
        >
          <div>
            <h2 className="text-lg font-semibold text-ink" id="kunjungi-toko">
              Kunjungi toko
            </h2>
            <address className="mt-2 text-sm not-italic leading-6 text-body">{store.fullAddress}</address>
            <p className="mt-2 text-sm text-body">{store.hoursSummary}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a className={secondaryButtonClassName} href={store.mapsUrl} rel="noreferrer" target="_blank">
              Buka Google Maps
            </a>
            <Link className={secondaryButtonClassName} href="/lokasi">
              Peta &amp; jam buka
            </Link>
          </div>
        </section>
      </div>
    </section>
  );
}
