# Kekurangan API setelah tahap 2

Dari: proyek Next.js `mirshop_app` (toko online)
Untuk: proyek dashboard Laravel
Tanggal: 22 November 2026

> **Status (22 November 2026):** poin 1–4 sudah dikerjakan backend dan dipakai
> storefront. Build sekarang memanggil API 13 kali dalam ±3 detik (dari 75 kali
> dalam 22 detik), memakai header `X-Storefront-Key`. Poin 5 masih menunggu owner.

Endpoint tahap 2 (`/products/{key}`, `/categories`, `/brands`, `/store/public`,
dan field `slug`/`updated_at`) sudah dipakai storefront dan berjalan. Dokumen ini
mencatat yang masih kurang, diurutkan dari yang paling berdampak.

---

## 1. Batas request saat build (penting)

Satu kali `npm run build` storefront memanggil API **75 kali dalam 22 detik**
dari satu IP (diukur 22 November 2026):

| Endpoint | Jumlah |
|---|---|
| `GET /products/{key}` | 63 (satu per produk, untuk prerender halaman produk) |
| `GET /products` | 3 |
| `GET /categories` | 4 |
| `GET /store/public` | 4 |
| `GET /brands` | 1 |

Batasnya 120 per menit per IP. Kalau dua build berjalan dalam menit yang sama,
atau build bersamaan dengan pengunjung yang dilayani server yang sama, API akan
menjawab 429 dan **build gagal**. Jumlah ini juga naik seiring jumlah produk:
dengan 200 produk, satu build saja sudah melewati batas.

Pilihan perbaikan di backend (pilih salah satu):

- Batas lebih tinggi untuk server storefront, berdasarkan IP server atau token
  khusus, misalnya header `X-Storefront-Key` yang dikirim dari server Next.js.
  Kuncinya disimpan di env server storefront, tidak di browser.
- Endpoint batch: `GET /products?slugs=a,b,c` (maksimal 100), supaya prerender
  cukup memakai beberapa request.

Sementara backend belum berubah, storefront bisa mengubah prerender halaman
produk agar memakai data dari `GET /products` (1–2 request untuk semua produk),
lalu `GET /products/{key}` hanya dipakai untuk slug lama dan id. Beri tahu kalau
cara ini lebih disukai.

## 2. `name` di `/store/public` berisi "Laravel"

Selama owner belum mengisi nama toko, `name` berisi `"Laravel"`, nama bawaan
aplikasi. Storefront sementara menganggap nilai itu kosong. Sebaiknya API
mengirim `null`, sama seperti field lain yang belum diisi.

## 3. Pencarian batch untuk keranjang

`/keranjang` butuh harga dan stok terbaru untuk produk yang ada di keranjang.
Sekarang storefront mengambil seluruh katalog lalu memfilternya. Cara ini cukup
untuk 63 produk, tetapi makin berat saat produk bertambah.

Usulan: `GET /products?ids=8,12` dan/atau `?slugs=…`, dengan bentuk respons sama
seperti daftar produk, maksimal 100 item, dan produk nonaktif tidak disertakan.
Endpoint ini juga bisa dipakai untuk poin 1.

## 4. Kategori bertingkat (dibutuhkan nanti)

Storefront sekarang hanya menampilkan kategori yang punya produk langsung
(Kucing, Burung, Unggas), jadi kategori induk (Pets, Poultry) tidak dipakai.
Kalau nanti menu ingin dikelompokkan per induk, misalnya "Unggas & Burung", yang
diperlukan:

- `GET /products?category={induk}&include_children=1`: produk di kategori itu
  dan semua turunannya.
- `product_count_total` di `GET /categories`: jumlah produk aktif kategori itu
  ditambah semua turunannya.

## 5. Satuan dan harga per satuan

Masih menunggu keputusan owner (bagian 5–6 di
[kebutuhan-api-tahap-2.md](kebutuhan-api-tahap-2.md)). Storefront belum
menampilkan pilihan satuan.

---

## Data yang perlu diisi owner di dashboard

Ini bukan perubahan API. Data berikut masih kosong atau belum sesuai, dan
storefront menutupinya dengan nilai cadangan:

| Data | Kondisi sekarang | Dampak di toko online |
|---|---|---|
| Info toko (nama, alamat, WhatsApp, email, Maps, koordinat) | Semua kosong | Memakai nilai cadangan di kode storefront |
| Jadwal buka | Kosong | Memakai jadwal cadangan; status buka/tutup dari API tidak dipakai |
| Logo brand | 0 dari 27 brand punya logo | 6 brand memakai logo bawaan storefront, sisanya tampil sebagai teks |
| Foto produk | 21 dari 63 produk tanpa foto | Kartu menampilkan "Foto belum tersedia" |
| Stok | 63 dari 63 berstatus habis | Tombol keranjang tidak muncul di produk mana pun |
| Urutan kategori | Semua `sort_order` = 0 | Urutan jatuh ke nama (Burung, Kucing, Unggas) |
