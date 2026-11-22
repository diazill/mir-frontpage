# Checklist PRD — Toko Online Next.js

Berdasarkan `02-prd-toko-online-nextjs.md`, versi 0.1 (3 November 2026).

**Proyek:** Sistem Mir Pakan Ternak  
**Versi PRD:** 0.1 (draf)  
**Status proyek:** Fase 1 (katalog, detail, SEO, halaman informasi) hampir selesai. Keranjang dan pemesanan lewat WhatsApp tersedia. Akun, checkout, dan pembayaran menunggu endpoint Laravel dan keputusan bisnis.
**Terakhir diperbarui:** 22 November 2026

## Arti status

- [x] Sudah tersedia di proyek
- [~] Sebagian tersedia; belum memenuhi kriteria selesai
- [ ] Belum tersedia

## Yang sudah ada

- [x] Scaffold Next.js App Router, React, TypeScript, Tailwind CSS, dan ESLint.
- [x] Struktur kode menggunakan folder `src/` dan alias import `@/*`.
- [x] Skrip npm untuk development, lint, build, dan start.
- [x] Beranda menampilkan hero, info toko, produk Pilihan MIR, kartu belanja per hewan, dan logo brand berjalan; `/produk` menampilkan semua produk dengan pencarian, filter kategori/brand/harga yang tersimpan di URL, dan pengurutan harga; `/brand` menampilkan daftar merek; `/lokasi` menampilkan peta, jadwal mingguan, dan status buka/tutup otomatis menurut waktu WIB.
- [x] Header dan footer ada di root layout; token warna di `globals.css` lolos kontras WCAG AA.
- [x] Referensi logo, foto toko, dan gambar produk disalin dari katalog React lama ke `public/images/`.
- [x] Katalog membaca produk aktif, harga, stok, kategori, merek, dan foto melalui Laravel API; database serta object storage tetap dikelola Laravel.
- [x] Metadata dasar berbahasa Indonesia.
- [x] README berisi cara menjalankan proyek dan prinsip integrasi.
- [x] Beranda dan katalog live diuji di browser; pencarian dan filter kategori berjalan pada data API.

> Checklist di bawah menilai fitur PRD, bukan sekadar ketersediaan teknologi
> atau scaffold. Belum ada fitur toko yang boleh dianggap selesai hanya karena
> proyek Next.js sudah bisa dijalankan.

## MVP — fitur dan kriteria selesai

| Status | ID | Fitur | Kriteria selesai |
|---|---|---|---|
| [x] | WEB-01 | Katalog | Produk aktif dari Laravel API (semua halaman API diambil, tidak terpotong di 100 produk) dengan filter kategori/brand, pencarian, urutan harga, layout responsif, dan tombol "Muat lebih banyak" per 20 produk. |
| [~] | WEB-02 | Detail produk | Rute `/produk/[slug]` mengambil satu produk lewat `GET /products/{key}`; id dan slug lama dialihkan 308 ke slug. Halaman menampilkan galeri foto, brand/kategori/berat, harga, stok, deskripsi API, pemilih jumlah, tombol tambah ke keranjang, tanya via WhatsApp, dan tombol berbagi. Sisa: checkout ke Laravel. |
| [~] | WEB-03 | SEO dan berbagi | Metadata dan canonical untuk semua halaman, Open Graph (gambar produk atau foto toko), `sitemap.xml` dari katalog, `robots.txt`, schema.org `Product` di detail produk, `PetStore` di beranda, dan tombol berbagi (WhatsApp, Facebook, salin tautan) sudah tersedia. Sisa: `SITE_URL` production belum ditetapkan. |
| [~] | WEB-04 | Keranjang | `/keranjang`: ubah jumlah, hapus dengan opsi batalkan, kosongkan, perkiraan subtotal dengan harga dan stok terbaru dari Laravel (lewat `/api/cart-products`), pilihan ambil/antar, catatan, dan kirim pesanan lewat WhatsApp. Isi disimpan di `localStorage`. Sisa: pilih satuan (belum ada di API) dan sinkronisasi ke Laravel saat akun tersedia. |
| [ ] | WEB-05 | Akun | Daftar, masuk, profil, dan buku alamat; pelanggan hanya dapat mengakses datanya sendiri. |
| [ ] | WEB-06 | Checkout | Penerima, ambil/antar, alamat, biaya antar, catatan, ringkasan; total sama dengan hasil Laravel. |
| [ ] | WEB-07 | Pembayaran v1 | Transfer manual dan/atau COD untuk area tertentu; status sesuai metode pembayaran. |
| [ ] | WEB-08 | Riwayat dan lacak pesanan | Daftar/detail pesanan dan riwayat status sesuai perubahan admin/kasir. |
| [x] | WEB-09 | Jam buka | Jadwal, libur khusus, dan zona waktu dibaca dari `GET /store/public`; status buka/tutup dihitung ulang di browser. Selama owner belum mengisi jadwal, dipakai jadwal cadangan. |
| [ ] | WEB-10 | Notifikasi | Konfirmasi pesanan dan perubahan status dikirim oleh Laravel melalui email dan/atau WhatsApp. |
| [~] | WEB-11 | Halaman statis | `/lokasi` (peta dan jam buka), `/tentang` (profil, opsi layanan, jenis hewan), dan `/kontak` (WhatsApp, telepon, email, alamat) tersedia; konten diambil dari situs lama `mirshop-frontpage`. Halaman syarat dan ketentuan belum ada karena belum ada isinya. |

## Fondasi dan aturan sistem

- [x] Next.js menjadi aplikasi storefront dengan App Router.
- [x] Produk katalog dibaca melalui Laravel API; Next.js tidak mengakses database atau Supabase secara langsung.
- [x] Laravel API terhubung ke PostgreSQL Supabase dan Supabase Storage melalui disk S3.
- [x] Storefront memakai API production (`LARAVEL_API_URL`, hanya server). Data toko dari `GET /store/public` dengan nilai cadangan per field; `NEXT_PUBLIC_STORE_WHATSAPP` jadi cadangan terakhir nomor WhatsApp.
- [x] Endpoint Tahap 2 (info toko dan jadwal, slug, detail produk, kategori, brand) sudah live dan dipakai storefront. Satuan masih menunggu keputusan owner. Kekurangan di `docs/kebutuhan-api-tahap-2b.md` poin 1–4 sudah dikerjakan: header `X-Storefront-Key` (env `STOREFRONT_API_KEY`), keranjang lewat `?ids=`/`?slugs=`, dan nama toko kosong menjadi `null`.
- [~] Endpoint publik produk tersedia; endpoint untuk akun dan transaksi belum dibuat.
- [~] Request ke Laravel berjalan di server (Server Components dan route handler `/api/search`, `/api/cart-products`); belum ada request sensitif karena akun dan transaksi belum ada.
- [x] Token/rahasia tidak dikirim ke browser: bundle `.next/static` diperiksa, tidak memuat URL API, nama env, atau kunci; tidak ada variabel `NEXT_PUBLIC_*`.
- [~] Laravel menjadi sumber harga dan status stok katalog; total final dan validasi checkout belum dibuat.
- [x] Tidak menggunakan `supabase-js` maupun fitur Supabase di scaffold saat ini.
- [ ] Penanganan sesi, autentikasi, dan isolasi data pelanggan.

## Alur checkout dan kasus gagal

- [ ] Mengirim ID produk, satuan, jumlah, alamat, metode pengiriman/pembayaran,
  dan `Idempotency-Key` ke `POST /orders`.
- [ ] Menampilkan nomor pesanan, total final Laravel, dan instruksi pembayaran.
- [ ] Unggah bukti transfer melalui `POST /orders/{id}/payment-proof`.
- [ ] `STOK_TIDAK_CUKUP`: tampilkan produk bermasalah dan stok tersedia.
- [ ] Harga berubah: tampilkan harga terbaru dan minta konfirmasi pelanggan.
- [ ] Toko tutup dengan aturan blokir: tampilkan jam buka dan nonaktifkan checkout.
- [ ] Koneksi putus: retry menggunakan `Idempotency-Key` yang sama.
- [ ] Pesanan melewati batas waktu pembayaran: tampilkan status pembatalan dari Laravel.
- [ ] Stok dan harga pada halaman cache divalidasi ulang saat checkout.

## Halaman dan strategi render

- [x] `/` — beranda diprerender dengan Cache Components dan revalidasi 1 menit (setara ISR).
- [~] `/produk` — katalog diprerender dengan revalidasi 1 menit; filter berjalan di klien lewat `?kategori={slug}&brand={slug}` (tautan lama `?category=Nama` tetap dikenali). Rute terpisah `/kategori/[slug]` belum dibuat.
- [~] `/produk/[id]` — detail produk berbasis data Laravel dengan metadata produk dan Open Graph; validasi checkout belum tersedia.
- [x] `/keranjang` — interaksi sisi klien; harga diambil ulang dari Laravel; `noindex` dan dikecualikan di `robots.txt`.
- [ ] `/checkout` — server dan klien; membutuhkan data akun.
- [ ] `/akun` dan `/pesanan/[id]` — data dinamis, tidak di-cache sebagai konten publik.
- [x] `/tentang` dan `/kontak` — halaman statis.

Homepage menampilkan katalog dari endpoint Laravel `/api/v1/products`. Data di-cache
dengan `cacheLife("minutes")` (revalidasi 1 menit); kegagalan API tidak ikut di-cache.
Halaman `/produk/[id]` diprerender dari `generateStaticParams` dan mengembalikan HTTP 404
untuk produk yang tidak ada. Rute checkout belum dibuat.

## Kebutuhan non-fungsional

- [x] Layout mobile-first; diuji otomatis tanpa scroll horizontal pada 375 px.
- [ ] Halaman produk dimuat dalam 2–3 detik pada koneksi seluler biasa.
- [x] Gambar katalog menggunakan `next/image` dengan ukuran responsif.
- [x] SEO: sitemap, metadata, Open Graph, dan schema.org `Product`.
- [~] Aksesibilitas: kontras AA, target sentuh 44 px, skip link, fokus terlihat, menu dan combobox bisa dipakai dengan keyboard, reduced motion dihormati. Pengecualian yang disengaja: logo brand berjalan tidak punya tombol jeda (hanya berhenti saat hover/fokus). Belum diuji dengan pembaca layar sungguhan.
- [x] Bahasa dokumen Indonesia; copy storefront disunting (sapaan "kamu", fakta konkret, jam buka dari satu sumber).
- [~] Validasi input di route handler (`/api/search`: panjang kata kunci ≤ 100; `/api/cart-products`: ≤ 100 ID dengan pola aman). Form transaksi ke Laravel belum ada.
- [x] Pemeriksaan bahwa tidak ada rahasia di bundle/browser (lihat poin fondasi).

## Tahapan PRD

- [~] **Fase 1:** katalog, detail produk, SEO, tombol berbagi, serta halaman tentang/kontak/lokasi tersedia; sisa: `SITE_URL` production dan halaman syarat & ketentuan (menunggu isi) (WEB-01–03, WEB-11).
- [~] **Fase 2:** keranjang dan pesanan via WhatsApp tersedia; akun, checkout, transfer manual/COD menunggu endpoint Laravel dan jawaban pertanyaan terbuka (WEB-04–07).
- [~] **Fase 3:** tampilan jam buka dan status real-time sudah tersedia; riwayat pesanan dan notifikasi belum tersedia (WEB-08–10).
- [ ] **Fase 4:** payment gateway, ongkir otomatis, voucher/harga langganan, dan beli ulang.

## Di luar MVP / tahap berikutnya

- [ ] Payment gateway Midtrans/Xendit (QRIS dan virtual account).
- [ ] Ongkir otomatis melalui Biteship/RajaOngkir bila memakai ekspedisi.
- [ ] Voucher dan harga khusus pelanggan langganan.
- [ ] Beli ulang satu klik dari riwayat.
- [x] Pemesanan melalui WhatsApp sebagai alternatif checkout (dari `/keranjang`).
- [ ] Ulasan produk.

## Migrasi dari katalog React

- [ ] Rapikan pemanggilan data katalog lama ke satu lapisan API (`src/api/...`).
- [x] Sediakan API publik produk di Laravel.
- [~] Bangun storefront Next.js yang membaca Laravel API dan gunakan ulang komponen
  React lama yang relevan.
- [ ] Alihkan domain setelah katalog Next.js setara dengan katalog lama.
- [ ] Hapus `supabase-js` dari aplikasi lama saat migrasi selesai.

## Pertanyaan terbuka dari PRD

- [ ] Pengiriman: antar sendiri, ekspedisi, atau hanya ambil di toko? Apa area dan biayanya?
- [ ] Saat toko tutup: pesanan diblokir atau diterima untuk diproses saat buka?
- [ ] Apakah harga langganan hanya terlihat setelah pelanggan masuk?
- [ ] Apakah ada minimum order atau kelipatan pembelian?
- [ ] Hosting: VPS sendiri atau Vercel?

## Keputusan implementasi penting

1. Jangan menampilkan total pratinjau sebagai total final sebelum dikonfirmasi Laravel.
2. Jangan menyimpan token autentikasi di `localStorage` atau mengeksposnya ke klien.
3. Gunakan `Idempotency-Key` yang sama saat mengulangi request checkout yang hasilnya
   belum diketahui.
4. Jangan mengaktifkan COD, biaya/area antar, minimum order, atau perilaku toko tutup
   sebelum aturan bisnisnya diputuskan.

## Temuan data (14 November 2026)

Dari Laravel API asli (63 produk):

- [ ] Semua 63 produk berstatus `habis`, sehingga tombol keranjang tidak muncul di mana pun. Perlu dicek apakah stok memang habis atau belum diinput di dashboard.
- [ ] Ketiga produk Pilihan MIR berstatus habis, padahal tampil paling depan di beranda.
- [ ] Banyak produk belum punya foto (tampil "Foto belum tersedia").
- [ ] Endpoint yang belum ada di Laravel untuk Fase 2: daftar/masuk pelanggan, profil dan alamat, `POST /orders`, detail dan riwayat pesanan, unggah bukti transfer.

## Validasi scaffold

- [x] `npm run lint` — berhasil (22 November 2026).
- [x] `npm run build` — berhasil, 78 halaman dari API production (22 November 2026); satu build memanggil API 13 kali (sebelumnya 75), karena halaman produk diprerender dari daftar produk. Next.js dinaikkan dari 16.4.4 ke 16.4.6 karena build 16.4.4 dihentikan `SecurityFatalError` (advisory keamanan).
- [x] `npm audit --omit=dev` — 0 kerentanan dependency produksi (20 November 2026).
- [~] `npm audit` — 16 temuan moderate pada dependency tooling development (terkait
  `minimatch`/ESLint). `npm audit fix --force` menyarankan downgrade ESLint besar,
  jadi tidak dijalankan.
