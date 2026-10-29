# ⚽ Penalty - Mobile Football Game Hub & Trivia Portal

> **Teknopark Ön Kuluçka Standartlarında Profesyonel Mobil Oyun Altyapısı**  
> *"İstemci Tarafında Ağır, Sunucu Tarafında Hafif" (Thick Client, Thin Server)*

---

## 📌 Proje Genel Bakışı
**Penalty**, Süper Lig ve Avrupa'nın 5 Büyük Ligi'ni kapsayan, hibrit oyun döngüsüne (Sonsuz Seviye Haritası + 00:00 UTC Günün Sorusu) sahip, yüksek eşzamanlı trafiği (10.000+ CCU) sıfır gecikmeyle kaldırabilen çok modlu bir mobil futbol oyun portalıdır.

### 🎮 6 Profesyonel Oyun Modu:
1. **Kim Bu Yıldız? (Scout Raporu - Who Are Ya?):** 8 kademeli netleşen bulanık fotoğraf ve Wordle benzeri nitelik karşılaştırmalarıyla futbolcuyu tahmin etme.
2. **Transfer Rotası (Career Path):** Futbolcunun kronolojik kulüp kariyerini inceleyerek doğru yıldızı bulma (Her 3 seviyede bir 👑 Efsane İkon boss seviyeleri!).
3. **Arma Avcısı (Club Logo):** Bulanıklaştırılmış kulüp armalarından ve kadrodaki yıldız ipuçlarından takımı bulma.
4. **Sıcak Temas (Contextinho):** Sıcak-soğuk benzerlik sinyallerini ve ortak özellikleri takip ederek #1 numaralı hedef yıldızı bulma.
5. **Tiki-Taka (3x3):** Satır ve sütun kesişimlerine uyan futbolcuları bulma (Serbest oyuncu arama ve Çoklu Kombo desteğiyle).
6. **Futbol Bingo (4x4):** 42 kartlık desteden gelen aktif futbolcuları ve efsaneleri doğru 16 kriter kutusuna yerleştirme.

### 🌟 Öne Çıkan Özellikler:
* **Çift Modlu UX:** 🇹🇷 Süper Lig Modu & 🌍 Global 5 Büyük Lig Modu (La Liga, Premier League, Serie A, Bundesliga, Ligue 1).
* **500+ Efsane İkon & Sezon Doğrulamalı Kupa Motoru:** UCL, Dünya Kupası, Ballon d'Or, Gol Kralı ve Lig Şampiyonluğu başarıları.
* **Scout & Taraftar Dükkanı:** Sarı Kanarya, Kükreyen Aslan, Kara Kartal ve Eflatun Krallar taraftar paketleri ile özel temalar.
* **Gelişmiş Monetizasyon & Hak Sistemi:** İpuçları için Ödüllü Reklamlar (Rewarded Ads), hak bitince "+2 Ekstra Hak (Revive)" mekanizması ve her 3 seviyede bir Tam Ekran Geçiş Reklamları (Interstitial).
* **Tribün Atmosferi & Haptik:** Gerçek stadyum ses efektleri, gol sevinçleri, düdük sesleri ve zengin titreşim geribildirimi.
* **Modern Navigasyon & Android Uyumluluğu:** Cihaz navigasyon çubuğu çakışmalarını engelleyen güvenli alt menü (Oyna, Dükkan, Kariyerim, Ayarlar) ve tek dokunuşla modal yönetimi.

---

## 🏗️ Teknoloji Yığını ve Mimari
| Katman | Teknoloji | Mimari Rolü ve Seçim Sebebi |
|---|---|---|
| **Mobil Uygulama** | React Native (Expo) + TypeScript | Cross-platform MVP ve EAS bulut derleme hızı. |
| **State Yönetimi** | Zustand | Hafif, reaktif durum yönetimi. |
| **Yerel Depolama** | MMKV (C++) | Milisaniyenin altında çalışan şifreli C++ yerel hafıza motoru. |
| **Arama Motoru** | Fuse.js (On-Device) | Cihaz işlemcisinde <2ms fuzzy search (Sıfır sunucu yükü). |
| **Backend API** | Node.js + Express + TypeScript | Günlük görevler, anti-cheat UTC zaman senkronizasyonu ve seviye paketleri. |
| **Veritabanı** | MongoDB (Atlas) | Kaggle futbol verilerini esnek, yüksek okuma performanslı BSON dokümanlarında tutma. |
| **Görsel İşleme** | Sharp (Server-side) | İstemci RAM'ini korumak için 8 kademeli bulanıklık önbellek üretimi. |

Detaylı mimari belgelendirme: [docs/ARCHITECTURE.md](file:///c:/Users/bedir/OneDrive/Desktop/penalty/docs/ARCHITECTURE.md)

---

## 📁 Proje Dizin Yapısı
```
penalty/
├── backend/                       # Node.js + Express + MongoDB Backend
│   ├── src/
│   │   ├── api/                   # REST API Controller ve Rotaları
│   │   ├── config/                # Veritabanı ve Çevre Değişkenleri
│   │   ├── models/                # Mongoose Şemaları (Player, DailyChallenge, Level)
│   │   ├── scripts/               # Veri Tohumlama ve Arama İndeksi Dışa Aktarma
│   │   └── services/              # Görsel İşleme (Sharp), Zaman Senkronizasyonu
│   └── tsconfig.json
├── mobile/                        # React Native / Expo Mobil Uygulama
│   ├── assets/                    # İkonlar, Ses Efektleri, Grafikler
│   ├── src/
│   │   ├── api/                   # Backend API İstemcileri & Çevrimdışı Önbellek
│   │   ├── features/              # Modüler Özellik Mimarisi
│   │   │   ├── home/              # Ana Ekran Kartları ve Alt Menü (HomeBottomNav)
│   │   │   ├── games/             # 6 Oyun Modu Bileşenleri ve Mantığı
│   │   │   │   ├── whoAreYa/      # Kim Bu Yıldız
│   │   │   │   ├── careerPath/    # Transfer Rotası
│   │   │   │   ├── clubLogo/      # Arma Avcısı
│   │   │   │   ├── contextinho/   # Sıcak Temas
│   │   │   │   ├── ticTacToe/     # Tiki-Taka 3x3
│   │   │   │   └── footballBingo/ # Futbol Bingo 4x4
│   │   │   ├── shop/              # Scout & Taraftar Kozmetik Mağazası
│   │   │   ├── stats/             # Kariyerim, Rütbe & İstatistik Modalları
│   │   │   ├── settings/          # Ayarlar, Ses, Titreşim & Veritabanı Eşitleme
│   │   │   └── monetization/      # Rewarded ve Interstitial Reklam Yönetimi
│   │   ├── navigation/            # Ekran Yönlendirmeleri
│   │   ├── services/              # Fuse.js Arama Motoru, Ses Efektleri, MMKV
│   │   ├── stores/                # Zustand Store'ları (useGameStore, useSettingsStore)
│   │   └── theme/                 # Renk Paletleri, Tipografi ve Boşluklar
│   ├── app.json                   # Expo Konfigürasyonu
│   └── tsconfig.json
└── README.md
```

---

## 🚀 Hızlı Başlangıç

### 1. Backend Kurulumu & Çalıştırma
```bash
cd backend
npm install
npm run build
npm run dev
```

Test verilerini tohumlamak ve yerel arama indeksini dışa aktarmak için:
```bash
npm run pipeline:seed-demo
```

### 2. Mobil Uygulama Kurulumu & Çalıştırma
```bash
cd mobile
npm install
npm run start
```

* **Web önizlemesi:** `npm run web`  
* **Android emülatör / cihaz:** `npm run android`  
* **iOS simülatör:** `npm run ios`
