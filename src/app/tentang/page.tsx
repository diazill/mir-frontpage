import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRightIcon,
  BoxIcon,
  CategoryIcon,
  HelpIcon,
  StoreIcon,
  TruckIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { STORE, STORE_HOURS_SUMMARY } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tentang MIR",
  description:
    "MIR Pet Shop & Pakan Ternak di Tingkir, Salatiga menjual pakan kucing, burung, unggas, dan ternak. Belanja di toko, ambil pesanan, atau pesan antar lewat WhatsApp.",
  alternates: { canonical: "/tentang" },
};

const services = [
  {
    title: "Pesan antar",
    description: "Pesan lewat WhatsApp, lalu atur jadwal dan alamat antar dengan tim MIR.",
    icon: TruckIcon,
  },
  {
    title: "Belanja di toko",
    description: "Datang, lihat produknya langsung, dan bandingkan merek di rak.",
    icon: StoreIcon,
  },
  {
    title: "Ambil di toko",
    description: "Pesan dulu lewat WhatsApp, lalu ambil saat pesananmu sudah siap.",
    icon: BoxIcon,
  },
  {
    title: "Tanya rekomendasi",
    description: "Bingung pilih pakan? Tanya tim MIR saat kamu di toko atau lewat chat.",
    icon: HelpIcon,
  },
];

const animals = ["Kucing", "Burung", "Unggas"];

export default function AboutPage() {
  return (
    <div className="bg-canvas">
      <section className="px-4 py-12 sm:px-8 sm:py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-sage">Tentang MIR</p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-ink [text-wrap:balance] sm:text-5xl">
              Toko pakan hewan dan ternak di Tingkir, Salatiga
            </h1>
            <p className="mt-6 text-base leading-7 text-body sm:text-lg sm:leading-8">
              MIR menjual pakan kucing, burung, ayam, dan ternak, plus aksesoris
              sangkar. Warga sekitar Tingkir belanja di sini untuk kebutuhan
              hewan peliharaan dan unggas mereka sehari-hari.
            </p>
            <p className="mt-4 text-base leading-7 text-body">
              Toko buka {STORE_HOURS_SUMMARY}. Di luar jam itu, kamu tetap
              bisa cek harga di katalog dan kirim pesan lewat WhatsApp.
            </p>
            <p className="mt-5 text-sm font-semibold tracking-wide text-brand">#MIRsayangternak</p>
          </div>

          <div className="mx-auto w-full max-w-[540px] lg:ml-auto">
            <div className="relative aspect-[1.14/1] overflow-hidden rounded-[28px] bg-sand shadow-hero sm:rounded-[36px]">
              <Image
                alt="Tampak depan toko MIR Pakan Ternak di Salatiga"
                className="h-full w-full object-cover object-center"
                height={800}
                priority
                sizes="(max-width: 1024px) 90vw, 540px"
                src="/images/reference/storefront.webp"
                width={653}
              />
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="layanan-judul"
        className="border-y border-line bg-surface px-4 py-12 sm:px-8 sm:py-16"
        id="layanan"
      >
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl" id="layanan-judul">
            Cara belanja di MIR
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map(({ title, description, icon: Icon }) => (
              <li className="rounded-3xl border border-line bg-canvas p-5 sm:p-6" key={title}>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-body">{description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="hewan-judul" className="px-4 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl" id="hewan-judul">
              Cari produk per jenis hewan
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-body">
              Pilih hewanmu untuk melihat pakan yang ada di katalog, atau lihat
              daftar merek yang dijual MIR.
            </p>
            <Link
              className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand-strong"
              href="/brand"
            >
              Lihat daftar brand
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <ul className="grid grid-cols-3 gap-3 sm:gap-4">
            {animals.map((animal) => (
              <li key={animal}>
                <Link
                  className="flex flex-col items-center gap-3 rounded-3xl border border-line bg-surface px-3 py-6 text-center transition-colors hover:border-line-strong hover:bg-brand-tint sm:py-8"
                  href={`/produk?category=${encodeURIComponent(animal)}`}
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <CategoryIcon category={animal} className="h-7 w-7" />
                  </span>
                  <span className="text-sm font-semibold text-ink sm:text-base">{animal}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-4 pb-14 sm:px-8 sm:pb-20">
        <div className="on-dark mx-auto flex max-w-7xl flex-col gap-6 rounded-[28px] bg-brand p-7 text-white sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Mau tanya stok atau harga?</h2>
            <p className="mt-2 max-w-xl text-base leading-7 text-white/80">
              Chat tim MIR lewat WhatsApp di {STORE.phoneDisplay}.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-brand transition-colors hover:bg-brand-tint"
              href={STORE.whatsappUrl}
              rel="noreferrer"
              target="_blank"
            >
              <WhatsAppIcon />
              Chat WhatsApp
            </a>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/40 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              href="/kontak"
            >
              Kontak lainnya
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
