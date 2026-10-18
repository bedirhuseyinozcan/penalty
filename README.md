# ⚽ Penalty - Mobile Football Game Hub

> **Teknopark Ön Kuluçka Standartlarında Profesyonel Mobil Oyun Altyapısı**  
> *"İstemci Tarafında Ağır, Sunucu Tarafında Hafif" (Thick Client, Thin Server)*

---

## 📌 Proje Genel Bakışı
**Penalty**, Süper Lig ve Avrupa'nın 5 Büyük Ligi'ni kapsayan, hibrit oyun döngüsüne (Sonsuz Kariyer Modu + 00:00 UTC Günün Sorusu) sahip, yüksek eşzamanlı trafiği (10.000+ CCU) sıfır gecikmeyle kaldırabilen bir mobil futbol oyun portalıdır.

### 🎮 İlk Sürüm (MVP) Oyun Mekanikleri:
1. **Kim Bu Yıldız? (Scout Raporu - Who Are Ya?):** 8 seviyeli kademeli netleşen bulanık fotoğraftan ve Wordle benzeri nitelik karşılaştırmalarından futbolcuyu tahmin etme.
2. **Transfer Rotası (Career Path):** Futbolcunun kronolojik kulüp kariyerini inceleyerek doğru yıldızı bulma.
3. **Çift Modlu UX:** 🇹🇷 Süper Lig Modu (Yerel viral büyüme) & 🌍 Global 5 Büyük Lig Modu (Yüksek reklam eCPM).
4. **Monetizasyon:** Zorlanan kullanıcılar için ipucu açan Ödüllü Video Reklamlar (Rewarded Ads) ve seviye geçişlerinde Tam Ekran Geçiş Reklamları (Interstitial).

---

## 🏗️ Teknoloji Yığını ve Mimari
| Katman | Teknoloji | Mimari Rolü ve Seçim Sebebi |
|---|---|---|
| **Mobil Uygulama** | React Native (Expo) + TypeScript | Cross-platform MVP ve EAS bulut derleme hızı. |
| **State Yönetimi** | Zustand | Redux'ın hantallığından uzak, hafif ve reaktif durum yönetimi. |
| **Yerel Depolama** | MMKV (C++) | AsyncStorage yerine milisaniyenin altında çalışan şifreli C++ motoru. |
| **Arama Motoru** | Fuse.js (On-Device) | Sunucuya her tuş vuruşunda istek atmak yerine cihaz işlemcisinde <2ms fuzzy search. |
| **Backend API** | Node.js + Express + TypeScript | Günlük görevler, anti-cheat UTC zaman senkronizasyonu ve seviye paketleri. |
| **Veritabanı** | MongoDB (Atlas) | Kaggle futbol verilerini esnek, yüksek okuma performanslı BSON dokümanlarında tutma. |
| **Görsel İşleme** | Sharp (Server-side) | İstemci RAM'ini yormamak için 8 seviyeli bulanıklığı sunucuda önceden üreterek CDN'e verme. |

Detaylı teknik mimari ve kurallar için: [docs/ARCHITECTURE.md](file:///c:/Users/bedir/OneDrive/Desktop/penalty/docs/ARCHITECTURE.md)

---

## 🚀 Hızlı Başlangıç

### 1. Backend Kurulumu & Çalıştırma
```bash
cd backend
npm install
npm run build
npm run dev
```

Test verilerini tohumlamak için:
```bash
npm run pipeline:seed-demo
```

### 2. Mobil Uygulama Kurulumu & Çalıştırma
```bash
cd mobile
npm install
npm run start
```
Web önizlemesi için: `npm run web`  
Android emülatörü için: `npm run android`
