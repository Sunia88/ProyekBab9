-- Skema db_kampus (padanan Kode 8.3 Bab 8)
-- Dieksekusi otomatis oleh kontainer MariaDB saat pertama kali dibuat.
-- Jika Kode 8.3 di buku Anda berbeda, ganti isi berkas ini dengan versi buku,
-- lalu jalankan ulang dari awal: docker compose down -v && docker compose up -d

CREATE DATABASE IF NOT EXISTS db_kampus
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_kampus;

CREATE TABLE prodi (
  id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kode  VARCHAR(10)  NOT NULL UNIQUE,
  nama  VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE mahasiswa (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nim        CHAR(10)     NOT NULL UNIQUE,
  nama       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  prodi_id   INT UNSIGNED NOT NULL,
  angkatan   SMALLINT UNSIGNED NOT NULL,
  ipk        DECIMAL(3,2) NULL DEFAULT NULL,
  dibuat_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mahasiswa_prodi FOREIGN KEY (prodi_id) REFERENCES prodi(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT ck_nim   CHECK (nim REGEXP '^[0-9]{10}$'),
  CONSTRAINT ck_ipk   CHECK (ipk IS NULL OR ipk BETWEEN 0 AND 4)
) ENGINE=InnoDB;

-- id 1, 2, 3 harus cocok dengan <select id="prodi_id"> di index.html
INSERT INTO prodi (id, kode, nama) VALUES
  (1, 'PTI', 'Pendidikan Teknologi Informasi'),
  (2, 'SI',  'Sistem Informasi'),
  (3, 'ILK', 'Ilmu Komputer');

INSERT INTO mahasiswa (nim, nama, email, prodi_id, angkatan, ipk) VALUES
  ('2415091001', 'Ayu Lestari',    'ayu@example.ac.id',   1, 2024, 3.75),
  ('2415091002', 'Budi Santoso',   'budi@example.ac.id',  2, 2024, 3.40),
  ('2315091003', 'Citra Dewi',     'citra@example.ac.id', 3, 2023, 3.90);
