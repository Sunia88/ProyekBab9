// app.js - versi PHP: konstanta API = 'api.php' dan pola URL api.php?id=... (lihat 9.5.4)
const API = 'api.php';
const $ = (id) => document.getElementById(id);
const state = { halaman: 1, total: 0, batas: 10, cari: '' };

async function api(url, opsi = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' }, ...opsi });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) {
    const pesan = data.galat
      ? Object.values(data.galat).join(', ') : data.error;
    throw new Error(pesan);
  }
  return data;
}

// READ: muat dan render tabel secara AMAN (textContent)
async function muat() {
  const q = new URLSearchParams({ cari: state.cari,
    halaman: state.halaman });
  const hasil = await api(`${API}?${q}`);
  Object.assign(state, { total: hasil.total, batas: hasil.batas });
  const tbody = $('tabel-body');
  tbody.replaceChildren();
  for (const m of hasil.data) {
    const tr = document.createElement('tr');
    for (const nilai of [m.nim, m.nama, m.prodi, m.angkatan]) {
      const td = document.createElement('td');
      td.textContent = nilai; // anti stored XSS
      tr.appendChild(td);
    }
    const aksi = document.createElement('td');
    aksi.append(tombol('Ubah', () => isiForm(m)),
      tombol('Hapus', () => hapus(m)));
    tr.appendChild(aksi);
    tbody.appendChild(tr);
  }
  const jmlHalaman = Math.max(Math.ceil(state.total / state.batas), 1);
  $('info-halaman').textContent = `${state.halaman} / ${jmlHalaman}`;
}

function tombol(label, fn) {
  const b = document.createElement('button');
  b.textContent = label;
  b.addEventListener('click', fn);
  return b;
}

function isiForm(m) {
  const kolom = ['id', 'nim', 'nama', 'email', 'prodi_id', 'angkatan'];
  for (const k of kolom) {
    $(k).value = m[k];
  }
  $('tombol-simpan').textContent = 'Perbarui';
}

// CREATE & UPDATE
$('form-mhs').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('id').value;
  const body = JSON.stringify({
    nim: $('nim').value, nama: $('nama').value,
    email: $('email').value, prodi_id: Number($('prodi_id').value),
    angkatan: Number($('angkatan').value) });
  try {
    await api(id ? `${API}?id=${id}` : API,
      { method: id ? 'PUT' : 'POST', body });
    $('form-mhs').reset();
    await muat();
  } catch (err) { $('pesan-galat').textContent = err.message; }
});

$('form-mhs').addEventListener('reset', () => {
  $('id').value = '';
  $('pesan-galat').textContent = '';
  $('tombol-simpan').textContent = 'Simpan';
});

// DELETE
async function hapus(m) {
  if (!confirm(`Hapus ${m.nama}?`)) return;
  try { await api(`${API}?id=${m.id}`, { method: 'DELETE' }); await muat(); }
  catch (err) { alert(err.message); }
}

// Pencarian (debounce 300 ms) dan paginasi
let jeda;
$('cari').addEventListener('input', (e) => {
  clearTimeout(jeda);
  jeda = setTimeout(() => {
    Object.assign(state, { cari: e.target.value, halaman: 1 });
    muat();
  }, 300);
});
$('sebelum').addEventListener('click', () => {
  if (state.halaman > 1) { state.halaman--; muat(); }
});
$('berikut').addEventListener('click', () => {
  if (state.halaman * state.batas < state.total) {
    state.halaman++; muat();
  }
});

muat();
