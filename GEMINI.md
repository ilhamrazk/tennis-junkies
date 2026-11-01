# The Junkies Co. – Tennis Matchmaking & Tournament Engine
## Project Memory, Conventions & Architectural Guidelines

Dokumen ini berisi rangkuman arsitektur, preferensi desain, aturan database, dan pembelajaran penting untuk proyek **tennis-junkies**.

---

### 1. Tech Stack & Environment
* **Framework**: React 18, Vite 6, TypeScript (`tsc -b && vite build`).
* **Styling**: Tailwind CSS 3 (menggunakan konfigurasi token warna `brand`).
* **Backend & Database**: Supabase (`@supabase/supabase-js`) dengan Postgres Realtime websockets.
* **Icons & UI FX**: `lucide-react`, `canvas-confetti`, `qrcode.react`.
* **Deployment**: Vercel SPA (dikonfigurasi dengan `vercel.json` URL rewrites ke `/index.html`).
* **OS & CLI (Windows)**: Selalu jalankan `npm.cmd` daripada `npm` (untuk menghindari restriksi `ExecutionPolicy` PowerShell).

---

### 2. Design System & UI Rules (PENTING)
> [!IMPORTANT]
> **Selalu gunakan Fresh & Clean Tennis Light Theme.** Pengguna menyukai tampilan cerah ber-kontras tinggi, bukan tema scoreboard gelap.

* **Palet Warna (`tailwind.config.js`)**:
  * **Background Utama**: `#F8FAFC` (Slate-50 / Clean Light Grey).
  * **Cards & Surfaces**: Pure White (`#FFFFFF`) dengan `border-2 border-slate-200 shadow-card`.
  * **Brand Orange (`#FF6B00`)**: Aksen primer (Hover: `#E05E00`, Light: `#FFF5EB`). Digunakan untuk tombol utama, highlight podium #1, dan badge Tim A.
  * **Emerald Green (`#10B981`)**: Aksen sekunder (digunakan untuk Tim B, status *Live*, status kemenangan).
  * **Tipografi**: Deep Slate (`#0F172A` / `#334155`) dengan font family **Inter** (bukan dark theme font).
* **Navigasi Tab**:
  * **Top Segmented Pill Navigation Bar** (`Lapangan`, `Klasemen`, `Riwayat`, `Setup`) diletakkan di bagian atas halaman di bawah Header.
  * **JANGAN** mengganti dengan bottom floating dock.
* **Button Styles**:
  * `.btn-primary`: Gradien oranye `#FF6B00` ke `#FF8533`, teks putih tebal huruf besar (*uppercase*), rounded-2xl, bayangan oranye.
  * `.btn-secondary`: Background putih, border 2px `#E2E8F0`, teks slate-700.

---

### 3. Database Architecture (Supabase)
* **Tabel `sessions`**:
  * `id` (text, primary key)
  * `event_title` (text)
  * `host_name` (text)
  * `game_type` ('Single' | 'Double')
  * `court_count` (int)
  * `current_round` (int)
  * `status` ('draft' | 'active' | 'completed')
  * `created_at` (timestamptz)
* **Tabel `matches`**:
  * `id` (text, primary key)
  * `session_id` (text, foreign key ke `sessions.id`)
  * `round` (int)
  * `court` (int)
  * `team_a1` (text, not null)
  * `team_a2` (text, nullable)
  * `team_b1` (text, not null)
  * `team_b2` (text, nullable)
  * `score_a` (int, nullable)
  * `score_b` (int, nullable)
  * `status` ('pending' | 'completed')
  * `created_at`, `updated_at` (timestamptz)

#### Aturan & Constraint Supabase:
1. **Foreign Key Integrity**: Sesi `sessions` WAJIB di-upsert terlebih dahulu sebelum menyimpan data baris `matches` agar tidak melanggar foreign key.
2. **Status Check Constraint**: Kolom `status` pada tabel `matches` hanya menerima nilai `'pending'` atau `'completed'`.
3. **NOT NULL Constraint**: Kolom `team_b1` memiliki constraint NOT NULL.
4. **Self Check-In / RSVP Realtime**: Pendaftaran pemain mandiri disimpan dengan format `round: 0`, `court: 0`, `team_a1: playerName`, `team_b1: '__RSVP__'`, `status: 'pending'` sehingga otomatis sinkron via websocket tanpa memerlukan alter schema.

---

### 4. 5 Fitur Utama yang Diimplementasikan
1. **Fitur 1: All-Time Leaderboard & Profil Pemain (`PlayerProfileModal.tsx`)**:
   * Switcher `Sesi Ini` vs `Sepanjang Waktu` pada tab Klasemen.
   * Menghitung statistik karir: Win Rate (%), Total Game, Menang/Kalah, +/- Poin, Average Poin.
   * Deteksi otomatis **Partner Terbaik (Chemistry)** berdasarkan tingkat kemenangan duet ganda.
   * Deteksi otomatis **Rival Terberat (Head-to-Head)** dan rekor duel langsung.
   * Form 5 pertandingan terakhir (W / L).
2. **Fitur 2: Arsip Sesi Komunitas (`SessionArchiveModal.tsx`)**:
   * Tombol arsip di Header dan subtab di menu Riwayat.
   * Menampilkan riwayat sesi masa lalu, host, jumlah match, dan podium 3 besar (🥇 🥈 🥉).
   * Aksi "Buka Sesi Ini" dan "Poster Sesi".
3. **Fitur 3: Smart Balanced Matchmaking (`rotation.ts`)**:
   * Opsi rotasi: `Acak & Adil (Fair Rotation)` vs `Skill-Balanced (Seimbang)`.
   * Pada mode ganda seimbang: 4 pemain diurutkan berdasarkan performa/win rate, lalu dipasangkan: *(Pemain 1 Terbaik + Pemain 4 Berkembang) vs (Pemain 2 Mid + Pemain 3 Mid)*.
4. **Fitur 4: Pendaftaran Mabar Mandiri / RSVP (`SelfCheckInView.tsx`)**:
   * Akses via link publik `?mode=rsvp&session=<sessionId>`.
   * Peserta mendaftar sendiri, memantau meter kuota peserta, dan nama otomatis masuk ke daftar pemain host secara realtime.
5. **Fitur 5: PIN Keamanan Host (`HostPinModal.tsx`)**:
   * 4-digit PIN (default `1234`, dapat diatur di Setup).
   * Memproteksi aksi submit skor, live swap, kunci sesi, dan reset agar tidak diubah penonton yang membuka aplikasi.

---

### 5. Aturan State & Form React
* **Anti Circular Loop pada Textarea**: Jangan pernah membuat `useEffect` yang menimpa `setPlayerInput(session.players.join('\n'))` di setiap ketukan tombol pemain, karena akan memotong spasi dan enter. Hanya sinkronkan saat sesi baru dibuat atau reset.
