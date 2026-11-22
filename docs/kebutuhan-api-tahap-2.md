# Kebutuhan API Tahap 2 untuk toko online

Dari: proyek Next.js `mirshop_app` (toko online)
Untuk: proyek Laravel `mirshop-dashboard`
Tanggal: 20 November 2026

> **Status (22 November 2026):** bagian 1–4 dan 7 sudah live dan sudah dipakai
> storefront. Bagian 5 (satuan) menunggu keputusan owner di bagian 6. Kekurangan
> yang tersisa ada di [kebutuhan-api-tahap-2b.md](kebutuhan-api-tahap-2b.md).

Semua endpoint di bawah **publik** (tanpa login), hanya `GET`, memakai prefix `/api/v1`,
pola error `{code, message, errors}`, dan rate limit yang sama dengan `GET /products`.
Next.js memanggil semuanya dari server lalu menyimpannya di cache sekitar 1 menit,
jadi satu pengunjung tidak memicu satu request ke Laravel.

Urutan prioritas:

1. `GET /store/public`: info toko dan jam buka
2. Tambahan field di `GET /products`: `slug`, `updated_at`
3. `GET /products/{slug}`: detail produk
4. `GET /categories` dan `GET /brands`
5. Satuan dan harga per satuan (`units`), setelah owner memutuskan pertanyaan di bagian 6

---

## 1. `GET /store/public`

**Dipakai di:** header, footer, beranda (strip info), `/lokasi` (jadwal dan status buka), `/kontak`, tombol WhatsApp di semua halaman, schema.org `PetStore`.

**Menggantikan:** data toko dan jadwal yang sekarang ditulis langsung di kode Next.js (`src/lib/site.ts`), serta env `NEXT_PUBLIC_STORE_WHATSAPP`.

```json
{
  "data": {
    "name": "MIR Pakan Ternak",
    "address": {
      "landmark": "Sebelah Mr. Piss",
      "street": "Jl. Tingkir Raya No. Km 07, Tingkir Tengah, Kec. Tingkir",
      "city": "Salatiga",
      "province": "Jawa Tengah",
      "postal_code": "50745",
      "country": "ID"
    },
    "maps_url": "https://maps.app.goo.gl/EmHKnvp4FF49raCw7",
    "latitude": -7.36173909,
    "longitude": 110.52008103,
    "phone": "+6285155428611",
    "whatsapp": "6285155428611",
    "email": "mirpakanternak@gmail.com",
    "timezone": "Asia/Jakarta",
    "schedule": [
      { "day": 1, "opens_at": "09:00", "closes_at": "17:00", "is_closed": false },
      { "day": 7, "opens_at": null, "closes_at": null, "is_closed": true }
    ],
    "closures": [
      { "date": "2026-12-25", "reason": "Libur Natal" }
    ],
    "status": {
      "is_open": true,
      "closes_at": "2026-11-20T17:00:00+07:00",
      "next_open_at": null
    }
  }
}
```

Catatan:
- `schedule` berisi 7 baris, `day` 1 = Senin sampai 7 = Minggu (ISO-8601).
- `closures` adalah libur khusus di tanggal tertentu, mulai hari ini sampai 60 hari ke depan. Boleh kosong.
- `status` dihitung server memakai `timezone`. Isinya `next_open_at` kalau toko tutup, dan `closes_at` kalau buka.
- `whatsapp` berisi digit saja, dengan kode negara, untuk `https://wa.me/{whatsapp}`.
- Field yang belum ada di database boleh `null`. Next.js punya nilai cadangan.

---

## 2. Tambahan field di `GET /products`

Tambahan ini tidak memutus kompatibilitas. Field lama tetap.

| Field | Tipe | Untuk apa |
|---|---|---|
| `slug` | string, unik, stabil | URL `/produk/{slug}` yang terbaca manusia dan bagus untuk SEO |
| `updated_at` | ISO-8601 | `lastModified` di `sitemap.xml` |
| `category.slug` | string | URL filter `/produk?kategori=kucing` |
| `brand.slug` | string | URL filter `/produk?brand=royal-canin` |
| `brand.logo_url` | string \| null | Logo di halaman brand dan strip logo beranda (sekarang file statis di Next.js) |

Aturan slug:
- Dibuat dari `title` saat produk dibuat, contoh `bolt-adult-cat-food-salmon-flavor-800gr`.
- Kalau judul berubah, slug lama tetap dikenali, entah lewat tabel riwayat slug atau dengan membiarkan slug tidak ikut berubah. Tautan yang sudah dibagikan ke WhatsApp tidak boleh mati.

---

## 3. `GET /products/{slug}`

**Dipakai di:** `/produk/{slug}`.

Sekarang Next.js mengambil **seluruh** daftar produk hanya untuk menampilkan satu produk. Dengan respons API sekitar 5 detik, cara ini lambat begitu cache kosong.

- Menerima `slug`. Selama masa transisi, `id` angka juga diterima, supaya tautan lama `/produk/8` tetap jalan.
- Produk nonaktif atau tidak ada mengembalikan `404 TIDAK_DITEMUKAN`.

```json
{
  "data": {
    "id": 8,
    "slug": "bolt-adult-cat-food-salmon-flavor-800gr",
    "title": "BOLT Adult Cat Food Salmon Flavor 800gr",
    "blurb": "",
    "description": "Teks panjang, boleh berisi baris baru.",
    "price": 19000,
    "weight_gram": 800,
    "stock_status": "habis",
    "is_best_product": true,
    "category": { "id": 2, "name": "Kucing", "slug": "kucing" },
    "brand": { "id": 3, "name": "BOLT", "slug": "bolt", "logo_url": null },
    "images": [
      { "id": 1, "url": "https://…", "is_primary": true, "sort_order": 0 }
    ],
    "updated_at": "2026-11-18T10:21:00+07:00"
  }
}
```

`description` cukup diisi kalau memang ada kolom deskripsi panjang yang terpisah dari `blurb`. Kalau tidak ada, abaikan.

---

## 4. `GET /categories` dan `GET /brands`

**Dipakai di:** menu "Hewan" di header, kartu "Belanja per hewan" di beranda, filter di `/produk`, dan halaman `/brand`.

Sekarang daftar ini diturunkan dari `GET /products`. Kategori atau brand yang belum punya produk aktif jadi tidak bisa ditampilkan.

```json
{
  "data": [
    { "id": 2, "name": "Kucing", "slug": "kucing", "product_count": 60, "sort_order": 1 }
  ]
}
```

```json
{
  "data": [
    { "id": 3, "name": "BOLT", "slug": "bolt", "logo_url": "https://…", "product_count": 5 }
  ]
}
```

- `product_count` hanya menghitung produk aktif.
- Urutan kategori mengikuti `sort_order` dari dashboard. Brand diurutkan berdasarkan `name`.
- Tanpa paginasi. Jumlahnya kecil.

---

## 5. Satuan dan harga per satuan

**Dipakai di:** kartu produk ("mulai Rp 8.500 / kg"), halaman produk (pilih satuan), keranjang, dan nanti checkout.

Usulan bentuk, sebagai tambahan di `GET /products` dan `GET /products/{slug}`:

```json
"units": [
  {
    "id": 31,
    "name": "Kg",
    "is_base": true,
    "factor": 1,
    "price": 8500,
    "stock_status": "tersedia"
  },
  {
    "id": 32,
    "name": "Karung",
    "is_base": false,
    "factor": 25,
    "price": 200000,
    "stock_status": "habis",
    "wholesale": [
      { "min_qty": 5, "price": 195000 }
    ]
  }
]
```

- `factor` menyatakan isi satu satuan dalam satuan dasar, misalnya 1 karung = 25 kg.
- `stock_status` per satuan dihitung server. Satuan berstatus `tersedia` kalau stok dasar ≥ `factor`. Jumlah stok tetap tidak dikirim.
- `price` di level produk tetap ada, yaitu harga satuan dasar, supaya klien lama tidak rusak.
- `wholesale` hanya dikirim kalau owner memutuskan harga grosir boleh terlihat publik (bagian 6).

---

## 6. Keputusan owner sebelum bagian 5 dibuat

1. Apakah harga grosir boleh terlihat semua pengunjung, hanya pelanggan yang login, atau tidak ditampilkan online?
2. Satuan mana yang boleh dijual online? Misalnya karung boleh, tetapi eceran per kg hanya di toko.
3. Apakah ada minimum order online?

---

## 7. Performa

- `GET /products?per_page=100` saat ini butuh **sekitar 5 detik** dari luar server (diukur 20 November 2026). Ada kemungkinan terjadi N+1 query pada relasi `category`, `brand`, atau `images`. Coba cek eager loading dan indeks. Targetnya di bawah 500 ms.
- Header saat ini adalah `Cache-Control: no-cache, private`. Untuk endpoint publik di atas, `public, max-age=60, stale-while-revalidate=300` aman dipakai, karena datanya sama untuk semua orang.

---

## Tahap 3 (gambaran awal, belum perlu dibuat)

Next.js akan menyimpan token pelanggan di cookie `httpOnly` lewat route handler di servernya sendiri. Token tidak pernah masuk ke JavaScript browser atau `localStorage`.

| Endpoint | Fungsi |
|---|---|
| `POST /customer/register`, `POST /customer/login`, `POST /customer/logout` | Akun pelanggan, terpisah dari login staf |
| `GET /customer/me`, `PATCH /customer/me` | Profil |
| `GET/POST/PATCH/DELETE /customer/addresses` | Buku alamat |
| `POST /orders` | Checkout. Wajib header `Idempotency-Key`. Server menghitung ulang harga, stok, dan ongkir. Error `STOK_TIDAK_CUKUP` dan `HARGA_BERUBAH` membawa detail per item |
| `GET /orders`, `GET /orders/{number}` | Riwayat pesanan dan status |
| `POST /orders/{number}/payment-proof` | Unggah bukti transfer |

Sebelum Tahap 3 bisa dimulai, owner perlu menjawab: area dan biaya antar, COD atau tidak, perlakuan pesanan saat toko tutup, dan batas waktu pembayaran.
