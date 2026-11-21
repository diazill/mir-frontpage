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
- **Detail produk (`/produk/[id]`):** galeri foto, harga, berat, status stok,
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
- URL API Laravel yang menyediakan `GET /products` (lihat [Kontrak API](#kontrak-api))

## Menjalankan proyek

1. Pasang dependency:

   ```bash
   npm install
   ```

2. Salin `.env.example` menjadi `.env.local`, lalu isi nilainya:

   ```env
   # URL API Laravel, termasuk prefix versi. Hanya dibaca di server.
   LARAVEL_API_URL=https://<domain-api>/api/v1

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
    ├── catalog.ts                    Pengambilan dan validasi data dari API (server only)
    ├── cart.ts                       Keranjang di localStorage
    ├── site.ts                       Info toko dan jadwal buka
    ├── brands.ts, animals.ts         Peta logo brand dan ilustrasi hewan
    └── format.ts, search.ts          Format rupiah/berat dan pencocokan pencarian
docs/
└── kebutuhan-api-tahap-2.md          Endpoint yang dibutuhkan dari backend
public/images/                        Logo, foto toko, logo brand, ilustrasi hewan
```

## Kontrak API

Saat ini storefront hanya memakai satu endpoint publik:

```
GET {LARAVEL_API_URL}/products?per_page=100&page=1
```

Respons berupa paginasi Laravel (`data`, `last_page`). Semua halaman diambil,
jadi katalog tidak terpotong di 100 produk. Field yang dipakai per produk:

| Field | Keterangan |
|---|---|
| `id`, `title`, `blurb` | Identitas dan deskripsi singkat |
| `price` | Harga satuan dasar dalam rupiah (integer) |
| `weight_gram` | Berat |
| `stock_status` | `tersedia` atau `habis` |
| `is_best_product` | Ditampilkan sebagai "Pilihan MIR" |
| `category.name`, `brand.name` | Untuk filter dan menu |
| `image`, `images[]` | Boleh kosong. Kalau kosong, kartu menampilkan placeholder |

Data yang tidak sesuai bentuk ini ditolak dan dicatat di log server. Kebutuhan
endpoint berikutnya (info toko, slug, detail produk, kategori, brand, dan
satuan) ada di [docs/kebutuhan-api-tahap-2.md](docs/kebutuhan-api-tahap-2.md).

Route handler internal milik Next.js:

| Route | Fungsi | Validasi |
|---|---|---|
| `GET /api/search?q=` | Maksimal 6 saran produk | `q` paling panjang 100 karakter |
| `GET /api/cart-products?ids=` | Harga dan stok terbaru untuk isi keranjang | Maksimal 100 ID, hanya huruf, angka, `_`, `-` |

## Status dan keterbatasan

- Belum ada akun pelanggan, checkout, pembayaran, atau riwayat pesanan. Fitur ini
  menunggu endpoint dari backend dan beberapa keputusan bisnis.
- Pesanan dikirim lewat WhatsApp, dan total final dikonfirmasi oleh toko.
- Jadwal buka masih ditulis di `src/lib/site.ts` sampai API menyediakannya.
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
