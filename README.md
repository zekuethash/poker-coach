# Poker Koçu

Texas Hold'em pokerini Türkçe öğreten mobil web uygulaması (PWA). Derleme veya bağımlılık gerektirmez.

## Özellikler
- **Öğren:** Duolingo tarzı yol: 3 bölüm, 13 kısa interaktif ders; XP, günlük seri 🔥, kalpler ❤️, günlük hedef.
- **Oyna:** 3 bota (Tilki, Kedi, Aslan) karşı 4 kişilik No-Limit Hold'em; side pot, all-in, 💡 Koç ipucu (eşitlik + pot odds).
- **Pratik:** 4 quiz türü (7+ doğru = +1 kalp), başlangıç eli tablosu (UTG/MP/CO/BTN), eşitlik simülatörü.
- **Profil:** Seviye, XP, seri, istatistikler.

## Çalıştırma
```sh
python3 -m http.server 8000   # ya da herhangi bir statik sunucu
```
Telefonda tarayıcıdan aç → "Ana ekrana ekle" ile uygulama gibi kur (çevrimdışı çalışır).

## Test
```sh
node tests/poker.test.js && node tests/game.test.js
```

## iPhone'a kurulum
1. Repo'da **Settings → Pages → Source: GitHub Actions** seç.
2. Değişiklikler `main`'e birleşince (ya da Actions → "Deploy to GitHub Pages" → Run workflow) site `https://<kullanıcı>.github.io/poker-coach/` adresinde yayınlanır.
3. iPhone'da **Safari** ile adresi aç → Paylaş → **Ana Ekrana Ekle**.
