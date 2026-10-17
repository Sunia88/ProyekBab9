// server.js - jalankan: node --env-file=.env server.js   (Kode 9.15)
const express = require('express');
const pool = require('./db');
const { validasiMahasiswa } = require('./validasi');

const app = express();
app.use(express.json({ limit: '10kb' })); // batasi ukuran body
app.use(express.static('public'));

const router = express.Router();

function idValid(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'ID tidak valid' });
    return null;
  }
  return id;
}

// READ (daftar + pencarian + paginasi)
router.get('/', async (req, res, next) => {
  try {
    const cari = `%${String(req.query.cari || '').trim()}%`;
    const halaman = Math.max(parseInt(req.query.halaman) || 1, 1);
    const batas = 10;
    const [rows] = await pool.query(
      `SELECT m.id, m.nim, m.nama, m.email, m.angkatan, m.ipk,
              m.prodi_id, p.kode AS prodi
         FROM mahasiswa m JOIN prodi p ON p.id = m.prodi_id
        WHERE m.nama LIKE ? OR m.nim LIKE ?
        ORDER BY m.nim LIMIT ? OFFSET ?`,
      [cari, cari, batas, (halaman - 1) * batas]);
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM mahasiswa
        WHERE nama LIKE ? OR nim LIKE ?`, [cari, cari]);
    res.json({ data: rows, total, halaman, batas });
  } catch (err) { next(err); }
});

// READ (satu data)
router.get('/:id', async (req, res, next) => {
  const id = idValid(req, res); if (!id) return;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM mahasiswa WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ error: 'Tidak ada' });
    }
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// CREATE
router.post('/', async (req, res, next) => {
  const { data, galat, valid } = validasiMahasiswa(req.body);
  if (!valid) return res.status(422).json({ galat });
  try {
    const [hasil] = await pool.execute(
      `INSERT INTO mahasiswa (nim, nama, email, prodi_id, angkatan)
       VALUES (?, ?, ?, ?, ?)`,
      [data.nim, data.nama, data.email, data.prodi_id,
       data.angkatan]);
    res.status(201).json({ id: hasil.insertId, ...data });
  } catch (err) { next(err); }
});

// UPDATE
router.put('/:id', async (req, res, next) => {
  const id = idValid(req, res); if (!id) return;
  const { data, galat, valid } = validasiMahasiswa(req.body);
  if (!valid) return res.status(422).json({ galat });
  try {
    const [hasil] = await pool.execute(
      `UPDATE mahasiswa SET nim = ?, nama = ?, email = ?,
              prodi_id = ?, angkatan = ? WHERE id = ?`,
      [data.nim, data.nama, data.email, data.prodi_id,
       data.angkatan, id]);
    if (!hasil.affectedRows) {
      return res.status(404).json({ error: 'Tidak ada' });
    }
    res.json({ id, ...data });
  } catch (err) { next(err); }
});

// DELETE
router.delete('/:id', async (req, res, next) => {
  const id = idValid(req, res); if (!id) return;
  try {
    const [hasil] = await pool.execute(
      'DELETE FROM mahasiswa WHERE id = ?', [id]);
    if (!hasil.affectedRows) {
      return res.status(404).json({ error: 'Tidak ada' });
    }
    res.status(204).end();
  } catch (err) { next(err); }
});

app.use('/api/mahasiswa', router);

// Penangan galat terpusat: terjemahkan kode galat MySQL
app.use((err, req, res, next) => {
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'NIM atau email sudah ada' });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(422).json({ error: 'Prodi tidak ditemukan' });
  }
  console.error(err); // detail hanya di log
  res.status(500).json({ error: 'Terjadi kesalahan pada peladen' });
});

app.listen(3000, () => console.log('http://localhost:3000'));
