// validasi.js - aturan validasi mahasiswa (padanan Kode 9.6)
// Mengembalikan { data, galat, valid }. Hanya kolom yang diizinkan
// yang masuk ke `data` (anti mass assignment).

function validasiMahasiswa(body = {}) {
  const galat = {};
  const data = {};

  const nim = String(body.nim ?? '').trim();
  if (!/^\d{10}$/.test(nim)) galat.nim = 'NIM harus 10 digit angka';
  else data.nim = nim;

  const nama = String(body.nama ?? '').trim();
  if (nama.length < 1 || nama.length > 100) galat.nama = 'Nama wajib diisi (maks. 100 karakter)';
  else data.nama = nama;

  const email = String(body.email ?? '').trim().toLowerCase();
  if (email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) galat.email = 'Format email tidak valid';
  else data.email = email;

  const prodiId = Number(body.prodi_id);
  if (!Number.isInteger(prodiId) || prodiId < 1) galat.prodi_id = 'Prodi tidak valid';
  else data.prodi_id = prodiId;

  const angkatan = Number(body.angkatan);
  const tahunIni = new Date().getFullYear();
  if (!Number.isInteger(angkatan) || angkatan < 2000 || angkatan > tahunIni + 1) {
    galat.angkatan = `Angkatan harus antara 2000 dan ${tahunIni + 1}`;
  } else data.angkatan = angkatan;

  return { data, galat, valid: Object.keys(galat).length === 0 };
}

module.exports = { validasiMahasiswa };
