# 🎾 The Junkies Co. – Matchmaking & Live Leaderboard App

Aplikasi modern manajemen pertandingan main bareng (mabar) tenis dan live standings untuk komunitas **The Junkies Co.** Dibangun dengan **Vite + React (TypeScript)**, **Tailwind CSS**, dan siap terhubung dengan **Supabase Cloud Database**.

---

## 🚀 Cara Menjalankan Aplikasi

Pastikan Anda berada di direktori project:
```bash
npm run dev
```
Buka browser di alamat: `http://localhost:5173`

Untuk melakukan kompilasi production:
```bash
npm run build
```

---

## ✨ Fitur-Fitur Utama

### 1. Host / Admin Mode
* **Setup Mabar Fleksibel:** Pilihan event mabar, pemilihan Host, format Single / Double, serta 1 hingga 4 Court.
* **Live Quota Counter:** Peringatan otomatis jika jumlah pemain melebihi kuota court.
* **Substitusi Pemain:** Ganti nama pemain yang batal/cedera dengan pemain baru tanpa merusak riwayat pertandingan sebelumnya.
* **Matchmaking & Fair Rotation:** Algoritma pembagian giliran main berimbang agar semua peserta mendapat lawan dan partner yang bervariasi.
* **Live Swap Lapangan:** Host bisa langsung menukar susunan pemain di court sebelum submit skor.
* **Input Skor Cepat:** Tombol touch-friendly berukuran besar, nyaman dipencet menggunakan satu tangan di smartphone.
* **Koreksi & Edit Riwayat:** Perbaiki skor atau susunan pemain yang salah catat kapan saja dengan rekalkulasi klasemen instan.
* **Download Poster Klasemen (PNG):** Ekspor kartu klasemen berukuran 720×1280 px dengan estetika dark/orange khas The Junkies Co., siap share ke Story Instagram atau WhatsApp.

### 2. Spectator / Player Mode (Scan QR Code Lapangan)
* **QR Code Lapangan:** Host cukup klik tombol **"QR Lapangan"** di header, dan pemain di pinggir lapangan dapat langsung scan menggunakan kamera smartphone.
* **Pencari Jadwal Mandiri ("Cek Jadwal Main Saya"):** Pemain cukup mengetik nama mereka untuk langsung melihat di court berapa dan ronde ke berapa mereka bertanding.
* **Live Standings:** Pemain dapat melihat perolehan poin dan posisi klasemen secara realtime.

---

## ☁️ Menghubungkan ke Supabase (Opsional untuk Realtime Sync)

Aplikasi ini memiliki fitur **Hybrid**:
1. **Secara default (Offline/Local Mode):** Langsung berfungsi 100% menggunakan `localStorage` tanpa perlu mendaftar akun database apa pun.
2. **Cloud Realtime Mode:** Jika ingin data tersinkronisasi antar-perangkat secara otomatis:
   * Salin file `.env.example` menjadi `.env`:
     ```bash
     copy .env.example .env
     ```
   * Isi URL dan Anon Key proyek Supabase Anda:
     ```env
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-public-key
     ```
   * Jalankan skrip SQL yang ada pada file `init.md` di SQL Editor Dashboard Supabase Anda.

---

## 📁 Struktur Direktori

```
tennis-junkies/
├── init.md                  # Dokumen arsitektur & skema database SQL
├── README.md                # Panduan penggunaan
├── src/
│   ├── components/          # Komponen UI (Header, Setup, Match, History, Standings, QR, Poster)
│   ├── hooks/               # Custom hook state & logic (useTennisSession)
│   ├── lib/                 # Algoritma rotasi (rotation.ts) & Supabase client (supabase.ts)
│   ├── types/               # Definisi tipe data TypeScript (tennis.ts)
│   ├── utils/               # Generator poster canvas 720x1280px (imageGenerator.ts)
│   ├── App.tsx              # Komponen utama & toggle mode
│   ├── main.tsx             # Entry point React
│   └── index.css            # Styling Tailwind & utilitas touch
```

