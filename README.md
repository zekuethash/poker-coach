# Poker Koçu

Texas Hold'em pokerini Türkçe öğreten mobil web uygulaması (PWA). Derleme veya bağımlılık gerektirmez.

## Özellikler
- **Dersler:** Temeller, el sıralaması, aksiyonlar, pozisyon, başlangıç elleri, outs & pot odds, strateji (ilerleme kaydedilir).
- **Quiz:** El sıralaması, kim kazanır, pot odds, başlangıç eli kararı.
- **Strateji tablosu:** Pozisyona göre 13×13 açılış aralığı (UTG / MP / CO / BTN).
- **Simülatör:** Rastgele bir rakibe karşı Monte Carlo eşitlik hesabı; flop/turn/river açtıkça değişimi izle.

## Çalıştırma
```sh
python3 -m http.server 8000   # ya da herhangi bir statik sunucu
```
Telefonda tarayıcıdan aç → "Ana ekrana ekle" ile uygulama gibi kur (çevrimdışı çalışır).

## Test
```sh
node tests/poker.test.js
```
