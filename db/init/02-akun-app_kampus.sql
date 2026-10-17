-- Akun aplikasi app_kampus (padanan Kode 8.6 Bab 8)
-- Prinsip hak akses minimum: aplikasi hanya boleh SELECT/INSERT/UPDATE/DELETE,
-- tidak boleh DROP, ALTER, atau GRANT.
-- '%' diperlukan karena aplikasi terhubung dari kontainer lain (bukan localhost).
-- Kata sandi harus sama dengan crud-mahasiswa/.env dan docker-compose.yml (layanan php).

CREATE USER IF NOT EXISTS 'app_kampus'@'%' IDENTIFIED BY 'Kampus#2026';
GRANT SELECT, INSERT, UPDATE, DELETE ON db_kampus.* TO 'app_kampus'@'%';
FLUSH PRIVILEGES;
