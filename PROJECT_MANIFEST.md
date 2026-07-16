# Hybrid OS Project Manifest v1.0

---

# Executive Summary

Hybrid OS adalah proyek Smart Room yang dikembangkan dengan prinsip stabilitas, modularitas, dan maintainability.

Nama **Hybrid OS** dipilih karena sistem menggunakan pendekatan **Local First** dengan **Cloud Fallback**, sehingga setiap device dapat menggunakan jalur komunikasi yang paling sesuai tanpa mengubah arsitektur inti.

---

# Project Objectives

Tujuan utama proyek adalah membangun sistem Smart Room yang:

- Stabil.
- Modular.
- Mudah dipelihara.
- Mudah dikembangkan.
- Tidak bergantung pada satu jenis koneksi device.

---

# Development Facts

## Workspace

Seluruh pengembangan dilakukan secara offline pada workspace:

~/smart-room-os-v4/offline_dev

---

## Versioning

Selama pengembangan offline digunakan:

- checkpoint.sh
- resume.sh
- backup.sh

Checkpoint menjadi histori pekerjaan selama pengembangan.

---

## Git Strategy

GitHub tidak digunakan sebagai media iterasi harian.

GitHub digunakan sebagai baseline setelah UI selesai.

UI dipush ke GitHub menggunakan satu commit final.

---

# Hybrid OS Architecture

## Design Principle

Local First

↓

Cloud Fallback

---

## Smart Plug

Menggunakan Local Tuya.

---

## Lamp

Urutan pengambilan status:

1. Local Tuya
2. Jika gagal → Tuya Cloud

---

## connector.js

connector.js bertugas menentukan sumber data device.

UI tidak mengetahui apakah data berasal dari Local maupun Cloud.

---

# Firebase Integration

Setelah integrasi Firebase ditemukan kasus:

Double Writer

Audit dilakukan terhadap jalur penulisan data.

---

# Audit Result

Hasil audit menunjukkan bahwa penyebab Double Writer berasal dari:

TV Module

Bukan berasal dari:

- Hybrid OS Core
- Lamp
- Smart Plug

---

# Architecture Decision Record

## ADR-001

Keputusan:

Memutus jalur TV.

Alasan:

TV menyebabkan Double Writer pada Firebase.

Core Hybrid OS tidak diubah.

TV dijadikan modul independen sehingga dapat diintegrasikan kembali tanpa mengubah arsitektur sistem.

---

# Engineering Principles

- Core Hybrid OS harus tetap stabil.
- Device bersifat modular.
- Masalah device diselesaikan pada layer device.
- Tidak mengubah core hanya karena satu device bermasalah.
- Seluruh keputusan harus berdasarkan fakta yang dapat diverifikasi.
- Tidak membuat asumsi tanpa label.

---

# Development Workflow

1. Offline Development

↓

2. Checkpoint

↓

3. UI Final

↓

4. Single UI Commit

↓

5. Push GitHub

↓

6. Firebase Integration

↓

7. Device Integration

↓

8. Testing

↓

9. Production Release

---

# Lessons Learned

1. Local Tuya tidak selalu kompatibel dengan seluruh device.

2. Lamp memerlukan Cloud Fallback.

3. Audit Firebase lebih penting daripada mengubah arsitektur.

4. Memutus modul device lebih baik daripada mengubah core sistem.

5. Dokumentasi keputusan arsitektur sangat penting agar tidak mengulang kesalahan.

---

# Project Constitution

Dokumen ini menjadi pedoman utama seluruh pengembangan Hybrid OS.

Setiap perubahan arsitektur harus mempertimbangkan:

- Tujuan proyek.
- Stabilitas sistem.
- Modularitas.
- Workflow pengembangan.
- Keputusan arsitektur yang telah disepakati.

Dokumen ini digunakan sebagai pengingat proyek agar seluruh pengembangan tetap konsisten dari awal hingga Production Release.

