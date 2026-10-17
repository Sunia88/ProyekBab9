# Proyek Mini BAB 9 — CRUD Mahasiswa dengan Docker (tanpa XAMPP)

| XAMPP            | Docker (proyek ini)                        | Alamat                  |
|------------------|--------------------------------------------|-------------------------|
| MySQL/MariaDB    | layanan `db` (mariadb:11)                  | `localhost:3307`        |
| phpMyAdmin       | layanan `phpmyadmin`                       | http://localhost:8081   |
| Apache + PHP     | layanan `php` (php:8.3-apache + pdo_mysql) | http://localhost:8080   |
| (Node.js)        | layanan `node` (node:22-alpine)            | http://localhost:3000   |

Anda **tidak perlu** menginstal Node.js, PHP, maupun MariaDB di Windows. Cukup Docker Desktop.

## Struktur folder

```
Proyek Mini BAB 9/
├── docker-compose.yml
├── db/init/
│   ├── 01-skema-db_kampus.sql   <- Kode 8.3 (skema + data prodi)
│   └── 02-akun-app_kampus.sql   <- Kode 8.6 (akun hak akses minimum)
├── crud-mahasiswa/              <- versi utama Node.js (Kode 9.14–9.17)
│   ├── .env.example  package.json  db.js  validasi.js  server.js
│   └── public/ index.html  app.js
└── php/                         <- Opsi alternatif 9.5.4 (Kode 9.18)
    ├── Dockerfile
    └── src/ koneksi.php  validasi_mahasiswa.php  api.php  index.html  app.js
```

## 1. Sekali saja: pasang Docker Desktop

1. Unduh dari https://www.docker.com/products/docker-desktop/ dan instal (pilih backend **WSL 2**).
2. Restart jika diminta, buka Docker Desktop, tunggu status **Engine running**.
3. Cek di terminal: `docker --version` dan `docker compose version`.

## 2. Jalankan semuanya

Di PhpStorm buka **Terminal** (Alt+F12), lalu:

```bash
docker compose up -d          # pertama kali: mengunduh image & membuat DB (1–3 menit)
docker compose ps             # semua layanan harus "running" / db "healthy"
docker compose logs -f node   # tunggu tulisan http://localhost:3000, Ctrl+C untuk keluar
```

Alternatif GUI: buka `docker-compose.yml`, klik ikon ▶▶ di sebelah `services:`.

Buka:
- Versi Node (utama buku): http://localhost:3000
- Versi PHP: http://localhost:8080
- phpMyAdmin: http://localhost:8081 — login `root` / `root_rahasia` (atau `app_kampus` / `Kampus#2026`)

Kedua versi memakai basis data yang sama, jadi data yang ditambah lewat satu versi terlihat di versi lain.

## 3. Menghubungkan PhpStorm

**Docker (Services)**: Settings → Build, Execution, Deployment → Docker → `+` → Docker for Windows.
Kontainer lalu tampil di jendela **Services** (Alt+8): bisa start/stop, lihat log, buka terminal.

**Database** (pengganti HeidiSQL): jendela Database → `+` → Data Source → MariaDB.
Host `localhost`, Port `3307`, User `root`, Password `root_rahasia`, Database `db_kampus`.
Unduh driver jika diminta, lalu **Test Connection**.

**Interpreter PHP (opsional, untuk inspeksi kode)**: Settings → PHP → CLI Interpreter → `…` →
`+` → From Docker… → Docker Compose → service `php`.

## 4. Mengedit kode

- **PHP**: simpan berkas → refresh browser. Langsung berlaku.
- **Node**: setelah mengubah `server.js`/`db.js`/`validasi.js`, jalankan `docker compose restart node`.
  Berkas di `public/` cukup refresh browser.

## 5. Skenario pengujian 9.5.5 versi Docker

| Uji | Cara di Docker |
|-----|----------------|
| a. CRUD dasar | Tambah/ubah/hapus lewat halaman, cek di phpMyAdmin (8081) atau jendela Database PhpStorm |
| b. Validasi peladen | Hapus atribut `pattern` via DevTools (F12), kirim NIM 5 digit → 422 |
| c. Duplikasi | Tambah NIM `2415091001` (sudah ada) → 409 |
| d. Mass assignment | lihat perintah curl di bawah, lalu cek kolom `ipk` tetap NULL |
| e. Injeksi SQL | Ketik `' OR '1'='1` di kolom cari → tidak ada data yang tampil |
| f. Stored XSS | Nama `<img src=x onerror=alert(1)>` → tampil sebagai teks |
| g. Ketersediaan | `docker compose stop db`, refresh → 500 pesan generik; detail di `docker compose logs node`. Nyalakan lagi: `docker compose start db` |

Uji d (PowerShell di Windows memakai `curl.exe`, bukan `curl`):

```powershell
curl.exe -i -X POST http://localhost:3000/api/mahasiswa -H "Content-Type: application/json" -d "{\"nim\":\"2415091099\",\"nama\":\"Uji Mass\",\"email\":\"mass@example.ac.id\",\"prodi_id\":1,\"angkatan\":2024,\"ipk\":4.0}"
```

Untuk versi PHP ganti URL menjadi `http://localhost:8080/api.php`.

## 6. Perintah penting

```bash
docker compose stop            # hentikan (data tetap)
docker compose start           # nyalakan lagi
docker compose down            # hapus kontainer (data tetap di volume)
docker compose down -v         # hapus kontainer + DATA; skrip db/init dijalankan ulang saat up berikutnya
docker compose up -d --build   # jika mengubah php/Dockerfile
```

## Catatan

- `crud-mahasiswa/.env` dibuat otomatis dari `.env.example` saat kontainer `node` pertama kali
  jalan (atau salin manual). Berkas `.env` tidak boleh di-commit (Kode 8.15).

- `db/init/*.sql` hanya dieksekusi **saat volume basis data masih kosong**. Jika Anda mengubah skema,
  jalankan `docker compose down -v` lalu `docker compose up -d`.
- Kode 8.3, 8.6, 8.8, 8.15, 8.17, 9.5 dan 9.6 berasal dari Bab 8 / Sub-bab 9.4 yang tidak ada di dokumen
  BAB 9 ini, jadi berkas padanannya disusun agar cocok dengan kode Bab 9. Jika isi buku Anda berbeda
  (mis. nama kolom), sesuaikan dengan versi buku.
- `api.php` sedikit disesuaikan (ditandai `[PENYESUAIAN]`): versi di buku mengembalikan array polos
  tanpa kolom prodi, sehingga tabel dan paginasi di `app.js` tidak akan tampil.
- Port bentrok? Ubah angka kiri pada `ports:` di `docker-compose.yml` (mis. `"3001:3000"`).
- Folder ini ada di OneDrive. Jika Docker lambat atau berkas tidak terbaca, pindahkan folder proyek
  ke luar OneDrive (mis. `C:\proyek\bab9`), atau aktifkan "Always keep on this device" pada folder ini.
# ProyekBab9
