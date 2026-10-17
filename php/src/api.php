<?php
// api.php - versi PHP (PDO). Contoh: api.php?id=5   (Kode 9.18)
//
// [PENYESUAIAN] ditandai di bawah: pada buku, GET daftar mengembalikan array
// polos tanpa kolom prodi, sedangkan app.js (Kode 9.17) membaca
// hasil.data / hasil.total / hasil.batas dan m.prodi. Agar Front-end yang
// sama benar-benar jalan, GET daftar dibuat setara dengan versi Node.
require __DIR__ . '/koneksi.php';
require __DIR__ . '/validasi_mahasiswa.php';

header('Content-Type: application/json; charset=utf-8');

function balas(int $kode, $data = null): void
{
    http_response_code($kode);
    if ($data !== null) echo json_encode($data);
    exit;
}

$metode = $_SERVER['REQUEST_METHOD'];
$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
$input = json_decode(file_get_contents('php://input'), true) ?? [];

try {
    $pdo = db();   // [PENYESUAIAN] di dalam try agar DB mati -> 500 generik (uji g)

    if ($metode === 'GET' && !$id) {
        // [PENYESUAIAN] paginasi + JOIN prodi, format sama dengan server.js
        $cari = '%' . trim($_GET['cari'] ?? '') . '%';
        $halaman = max((int)($_GET['halaman'] ?? 1), 1);
        $batas = 10;
        $s = $pdo->prepare('SELECT m.id, m.nim, m.nama, m.email, m.angkatan,
                                   m.ipk, m.prodi_id, p.kode AS prodi
                              FROM mahasiswa m JOIN prodi p ON p.id = m.prodi_id
                             WHERE m.nama LIKE ? OR m.nim LIKE ?
                             ORDER BY m.nim LIMIT ? OFFSET ?');
        $s->bindValue(1, $cari);
        $s->bindValue(2, $cari);
        $s->bindValue(3, $batas, PDO::PARAM_INT);
        $s->bindValue(4, ($halaman - 1) * $batas, PDO::PARAM_INT);
        $s->execute();
        $data = $s->fetchAll();

        $t = $pdo->prepare('SELECT COUNT(*) FROM mahasiswa WHERE nama LIKE ? OR nim LIKE ?');
        $t->execute([$cari, $cari]);
        balas(200, ['data' => $data, 'total' => (int)$t->fetchColumn(),
                    'halaman' => $halaman, 'batas' => $batas]);
    }

    if ($metode === 'GET' && $id) {
        // [PENYESUAIAN] setara GET /api/mahasiswa/:id
        $s = $pdo->prepare('SELECT * FROM mahasiswa WHERE id = ?');
        $s->execute([$id]);
        $baris = $s->fetch();
        $baris ? balas(200, $baris) : balas(404, ['error' => 'Tidak ada']);
    }

    if ($metode === 'POST' || $metode === 'PUT') {
        [$d, $galat] = validasiMahasiswa($input);
        if ($galat) balas(422, ['galat' => $galat]);
        $nilai = [$d['nim'], $d['nama'], $d['email'],
                  $d['prodi_id'], $d['angkatan']];
        if ($metode === 'POST') {
            $s = $pdo->prepare('INSERT INTO mahasiswa
                (nim, nama, email, prodi_id, angkatan) VALUES (?,?,?,?,?)');
            $s->execute($nilai);
            balas(201, ['id' => (int)$pdo->lastInsertId()] + $d);
        }
        if (!$id) balas(400, ['error' => 'ID wajib diisi']);
        $s = $pdo->prepare('UPDATE mahasiswa SET nim=?, nama=?, email=?,
            prodi_id=?, angkatan=? WHERE id=?');
        $s->execute([...$nilai, $id]);
        balas(200, ['id' => $id] + $d);
    }

    if ($metode === 'DELETE' && $id) {
        $s = $pdo->prepare('DELETE FROM mahasiswa WHERE id = ?');
        $s->execute([$id]);
        $s->rowCount() ? balas(204) : balas(404, ['error' => 'Tidak ada']);
    }

    balas(405, ['error' => 'Metode tidak didukung']);
} catch (PDOException $e) {
    if (($e->errorInfo[1] ?? 0) === 1062) {
        balas(409, ['error' => 'NIM atau email sudah ada']);
    }
    if (($e->errorInfo[1] ?? 0) === 1452) {   // [PENYESUAIAN] setara ER_NO_REFERENCED_ROW_2
        balas(422, ['error' => 'Prodi tidak ditemukan']);
    }
    error_log($e->getMessage());
    balas(500, ['error' => 'Terjadi kesalahan pada peladen']);
}
