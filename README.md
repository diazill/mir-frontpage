# MIR Pakan Ternak: Toko Online

Storefront toko pakan hewan dan ternak, dibangun dengan Next.js. Pengunjung bisa
melihat katalog, mencari produk, mengecek harga dan stok, mengumpulkan produk di
keranjang, lalu mengirim pesanan ke toko lewat WhatsApp.

Proyek ini hanya menampilkan data. Produk, harga, dan stok dikelola di proyek
dashboard Laravel terpisah, dan Next.js membacanya lewat API Laravel tersebut.

## Fitur

- **Beranda:** hero, info toko, produk unggulan, kartu belanja per jenis hewan, dan
  strip logo brand yang bergerak.
- **Katalog (`/produk`):** pencarian, filter jenis hewan, brand, dan harga
  maksimal, pengurutan harga, serta tombol "Muat lebih banyak". Semua filter
  tersimpan di URL, jadi hasilnya bisa dibagikan dan tombol Back bekerja.
  Di HP, filter dibuka sebagai bottom sheet.
- **Detail produk (`/produk/[slug]`):** galeri foto, harga, berat, status stok,
  pemilih jumlah, tambah ke keranjang, tanya lewat WhatsApp, dan tombol berbagi.
- **Keranjang (`/keranjang`):** ubah jumlah, hapus dengan opsi batalkan, dan
  perkiraan subtotal. Harga dan stok diambil ulang dari API, bukan dari data
  browser. Pesanan dikirim sebagai pesan WhatsApp.
- **Pencarian di header:** saran produk muncul saat mengetik, dan bisa
  dioperasikan dengan keyboard.
- **Halaman informasi:** `/brand`, `/tentang`, `/kontak`, dan `/lokasi` (peta,
  jadwal mingguan, serta status buka/tutup sesuai waktu WIB).
- **SEO:** metadata dan canonical per halaman, Open Graph, `sitemap.xml`,
  `robots.txt`, serta schema.org `PetStore` dan `Product`.

## Teknologi

- Next.js 16 (App Router, Cache Components, Turbopack)
- React 19 dan TypeScript
- Tailwind CSS 4
- ESLint

> Versi Next.js ini punya perubahan yang berbeda dari versi lama. Sebelum
> mengubah kode, baca panduan di `node_modules/next/dist/docs/`. Lihat juga
> [AGENTS.md](AGENTS.md).

## Arsitektur

```
Browser ──► Next.js (server) ──► API Laravel ──► PostgreSQL + object storage
   ▲              │
   └── HTML ──────┘
```

- Next.js mengambil data di server: di Server Components dan route handler.
  Browser tidak pernah memanggil API Laravel secara langsung.
- Data katalog disimpan di cache selama sekitar 1 menit (`cacheLife("minutes")`).
  Kalau API gagal, kegagalan itu tidak ikut disimpan di cache, jadi request
  berikutnya mencoba lagi.
- Next.js tidak terhubung ke database atau storage. Jangan tambahkan
  `supabase-js` atau koneksi database ke proyek ini.
- Harga, stok, dan total final selalu dihitung oleh Laravel. Subtotal di
  keranjang hanya perkiraan.

## Persyaratan

- Node.js 20 atau lebih baru, dan npm
- URL API Laravel yang menyediakan endpoint di [Kontrak API](#kontrak-api)

## Menjalankan proyek

1. Pasang dependency:

   ```bash
   npm install
   ```

2. Salin `.env.example` menjadi `.env.local`, lalu isi nilainya:

   ```env
   # URL API Laravel, termasuk prefix versi. Hanya dibaca di server.
   LARAVEL_API_URL=https://<domain-api>/api/v1

   # Kunci dari dashboard yang menaikkan batas API untuk storefront
   # (1.200/menit, bukan 120/menit). Hanya server; boleh dikosongkan.
   STOREFRONT_API_KEY=<kunci-storefront>

   # Origin publik storefront. Dipakai untuk canonical, sitemap, Open Graph,
   # dan tautan berbagi.
   SITE_URL=http://localhost:3000

   # Nomor WhatsApp toko: hanya angka, diawali kode negara (contoh 62812xxxxxxx).
   # Nomor ini memang tampil di situs, jadi boleh terbaca browser.
   NEXT_PUBLIC_STORE_WHATSAPP=<nomor-whatsapp>
   ```

   Untuk API Laravel yang berjalan di komputer sendiri, pakai
   `http://127.0.0.1:8000/api/v1`.

3. Jalankan server development:

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000). Restart perintah ini
   setiap kali `.env.local` berubah.

Di PowerShell Windows, kalau `npm.ps1` diblokir, ganti `npm` dengan `npm.cmd`.

### Perintah lain

| Perintah | Fungsi |
|---|---|
| `npm run lint` | Memeriksa kode dengan ESLint |
| `npm run build` | Build production. **Butuh API Laravel yang menyala**, karena halaman produk diprerender dari data API |
| `npm run start` | Menjalankan hasil build |

## Struktur folder

```
src/
├── app/
│   ├── page.tsx, home-sections.tsx   Beranda
│   ├── produk/                       Katalog dan detail produk
│   ├── keranjang/                    Halaman keranjang
│   ├── brand/, tentang/, kontak/, lokasi/
│   ├── api/search/                   Saran pencarian di header
│   ├── api/cart-products/            Harga dan stok terbaru untuk isi keranjang
│   ├── layout.tsx                    Header, footer, dan skip link
│   ├── globals.css                   Token warna dan animasi
│   └── sitemap.ts, robots.ts
├── components/                       Header, footer, kartu produk, ikon, dsb.
└── lib/
    ├── catalog.ts                    Produk, kategori, brand dari API (server only)
    ├── store.ts                      Info toko dan jadwal dari API (server only)
    ├── cart.ts                       Keranjang di localStorage
    ├── site.ts                       Nilai cadangan toko dan helper jadwal
    ├── brands.ts, animals.ts         Peta logo brand dan ilustrasi hewan
    └── format.ts, search.ts          Format rupiah/berat dan pencocokan pencarian
docs/
├── kebutuhan-api-tahap-2.md          Permintaan endpoint tahap 2 (sebagian besar sudah live)
└── kebutuhan-api-tahap-2b.md         Kekurangan API yang tersisa
public/images/                        Logo, foto toko, logo brand, ilustrasi hewan
```

## Kontrak API

Semua endpoint publik, hanya `GET`, dan dipanggil dari server Next.js lalu
disimpan di cache sekitar 1 menit. Kalau `STOREFRONT_API_KEY` diisi, setiap
request membawa header `X-Storefront-Key`. Satu build memanggil API sekitar
13 kali, berapa pun jumlah produknya.

| Endpoint | Dipakai untuk |
|---|---|
| `GET /products?per_page=100&page=N` | Katalog, produk unggulan, prerender halaman produk, sitemap, dan pencarian. Semua halaman paginasi diambil |
| `GET /products?ids=…` / `?slugs=…` | Harga dan stok terbaru isi keranjang (maksimal 100 per request) |
| `GET /products/{key}` | Hanya untuk key yang tidak ada di daftar: id angka dan slug lama (untuk redirect), serta produk yang tidak ada (404) |
| `GET /categories` | Menu Hewan, kartu belanja per hewan, dan filter katalog |
| `GET /brands` | Halaman brand, strip logo, dan filter katalog |
| `GET /store/public` | Nama, kontak, alamat, jadwal buka, dan libur khusus |

Field produk yang dipakai:

| Field | Keterangan |
|---|---|
| `id`, `slug`, `title`, `blurb` | Identitas. URL produk memakai `slug` |
| `price` | Harga satuan dasar dalam rupiah (integer) |
| `weight_gram` | Berat |
| `stock_status` | `tersedia` atau `habis` |
| `is_best_product` | Ditampilkan sebagai "Pilihan MIR" |
| `category {name, slug}`, `brand {name, slug, logo_url}` | Filter, menu, dan logo |
| `image`, `images[]` | Boleh kosong. Kalau kosong, kartu menampilkan placeholder |
| `updated_at` | `lastModified` di sitemap |

Perilaku penting:

- **URL produk:** `/produk/{slug}`. Tautan lama `/produk/8` dan slug lama
  dialihkan permanen (HTTP 308) ke slug yang berlaku. Produk yang tidak ada
  mengembalikan 404.
- **URL filter:** `/produk?kategori={slug}&brand={slug}`. Tautan lama
  `?category=Kucing` (nama) tetap dikenali.
- **Data toko:** setiap field yang kosong di API memakai nilai cadangan di
  `src/lib/site.ts`. Kalau API mati, situs tetap tampil dengan nilai cadangan.
  Status "Buka sekarang" dihitung ulang di browser dari jadwal dan libur khusus.
- Data yang tidak sesuai bentuk ditolak dan dicatat di log server.

Kebutuhan API yang belum ada dicatat di [docs/](docs/).

Route handler internal milik Next.js:

| Route | Fungsi | Validasi |
|---|---|---|
| `GET /api/search?q=` | Maksimal 6 saran produk | `q` paling panjang 100 karakter |
| `GET /api/cart-products?ids=` | Harga dan stok terbaru untuk isi keranjang | Maksimal 100 ID, hanya huruf, angka, `_`, `-` |

## Status dan keterbatasan

- Belum ada akun pelanggan, checkout, pembayaran, atau riwayat pesanan. Fitur ini
  menunggu endpoint dari backend dan beberapa keputusan bisnis.
- Pesanan dikirim lewat WhatsApp, dan total final dikonfirmasi oleh toko.
- Data toko diambil dari API; selama owner belum mengisinya, situs memakai nilai cadangan.
- Status lengkap per fitur ada di [PRD-CHECKLIST.md](PRD-CHECKLIST.md).

## Aksesibilitas

Warna teks lolos kontras WCAG AA, target sentuh minimal 44 px, fokus keyboard
terlihat, dan ada skip link. Animasi berhenti kalau pengguna mengaktifkan
"kurangi gerakan" di perangkatnya.

## Aset pihak ketiga

- Ilustrasi hewan di `public/images/animals/` berasal dari
  [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (lisensi
  MIT). Detailnya ada di `public/images/animals/LICENSE.md`.
- Logo brand di `public/images/brands/` adalah merek dagang milik pemiliknya
  masing-masing, dan dipakai untuk menunjukkan produk yang dijual toko.
