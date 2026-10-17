<?php
// validasi_mahasiswa.php - fungsi validasi (padanan Kode 9.5)
// Mengembalikan [$data, $galat]. Hanya kolom yang diizinkan yang masuk
// ke $data (anti mass assignment).

function validasiMahasiswa(array $in): array
{
    $galat = [];
    $data  = [];

    $nim = trim((string)($in['nim'] ?? ''));
    if (!preg_match('/^\d{10}$/', $nim)) {
        $galat['nim'] = 'NIM harus 10 digit angka';
    } else {
        $data['nim'] = $nim;
    }

    $nama = trim((string)($in['nama'] ?? ''));
    $panjang = mb_strlen($nama);
    if ($panjang < 1 || $panjang > 100) {
        $galat['nama'] = 'Nama wajib diisi (maks. 100 karakter)';
    } else {
        $data['nama'] = $nama;
    }

    $email = filter_var(strtolower(trim((string)($in['email'] ?? ''))), FILTER_VALIDATE_EMAIL);
    if ($email === false || strlen($email) > 100) {
        $galat['email'] = 'Format email tidak valid';
    } else {
        $data['email'] = $email;
    }

    $prodi = filter_var($in['prodi_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if ($prodi === false) {
        $galat['prodi_id'] = 'Prodi tidak valid';
    } else {
        $data['prodi_id'] = $prodi;
    }

    $maks = (int)date('Y') + 1;
    $angkatan = filter_var($in['angkatan'] ?? null, FILTER_VALIDATE_INT,
        ['options' => ['min_range' => 2000, 'max_range' => $maks]]);
    if ($angkatan === false) {
        $galat['angkatan'] = "Angkatan harus antara 2000 dan $maks";
    } else {
        $data['angkatan'] = $angkatan;
    }

    return [$data, $galat];
}
