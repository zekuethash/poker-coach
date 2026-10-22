// Öğrenme yolu: bölümler → dersler → adımlar.
// Adım türleri: info (bilgi kartı), q (soru: a = doğru seçenek indeksi), gen (dinamik soru).
// [[As Kh]] kart gösterir.
const info = (title, body) => ({ t: 'info', title, body });
const q = (prompt, opts, a, why) => ({ t: 'q', prompt, opts, a, why });
const gen = (kind, arg) => ({ t: 'gen', kind, arg });

window.UNITS = [
  {
    id: 'u1', title: 'Temeller', desc: 'Oyunun amacı, akışı ve el sıralaması', color: 'green',
    lessons: [
      { id: 'goal', icon: '🎯', title: 'Oyunun amacı', steps: [
        info('Merhaba, ben Asa! 🦊', 'Texas Hold\'em dünyanın en popüler pokeridir. Her oyuncu <b>2 özel kart</b> alır. Masanın ortasına ise <b>5 ortak kart</b> açılır.'),
        info('Amaç ne?', '2 özel kart + 5 ortak karttan yapabildiğin <b>en iyi 5 kartlık eli</b> yapmak. Ya da rakipleri <b>pas geçirmek</b>!<br>Örnek: [[Ah Ad]] özel kartların, board: [[Ks 7d 7c 2h 9s]]'),
        q('Her oyuncu kaç özel kart alır?', ['1', '2', '3', '5'], 1, 'Herkes 2 özel kart (hole cards) alır.'),
        q('Masaya toplam kaç ortak kart açılır?', ['3', '4', '5', '7'], 2, 'Flop 3 + Turn 1 + River 1 = 5 ortak kart.'),
        q('Herkes pas geçerse ne olur?', ['Pot yanar', 'Son kalan oyuncu potu alır', 'El yeniden dağıtılır'], 1, 'Kartları göstermeden de potu kazanabilirsin, blöfün gücü bu!'),
        q('Elin [[Ah Ad]], board [[Ks 7d 7c 2h 9s]]. En iyi elin hangisi?', ['İki çift (As ve 7\'ler)', 'Üçlü', 'Full House', 'Bir çift'], 0, 'Aslar ve yediler: iki çift. K en yüksek kicker olur.'),
      ] },
      { id: 'flow', icon: '🔄', title: 'Bir elin akışı', steps: [
        info('Önce blind\'ler', 'Her elde düğmenin solundaki iki oyuncu zorunlu bahis koyar: <b>küçük blind (SB)</b> ve <b>büyük blind (BB)</b>. Böylece her elde kazanılacak bir pot olur.'),
        info('4 tur', '<b>1. Preflop:</b> Kartlar dağıtılır.<br><b>2. Flop:</b> 3 ortak kart açılır.<br><b>3. Turn:</b> 4. ortak kart.<br><b>4. River:</b> 5. ortak kart.<br>Her turun sonunda bir bahis turu vardır.'),
        info('Showdown', 'Son bahis turundan sonra birden fazla oyuncu kaldıysa kartlar açılır; <b>en iyi el</b> potu alır.'),
        q('Flop\'ta kaç ortak kart açılır?', ['1', '2', '3', '5'], 2, 'Flop = 3 kart.'),
        q('Doğru sıra hangisi?', ['Flop → Preflop → Turn → River', 'Preflop → Flop → Turn → River', 'Preflop → Turn → Flop → River'], 1, 'Preflop, Flop, Turn, River.'),
        q('Turn\'de masada kaç ortak kart olur?', ['3', '4', '5'], 1, '3 (flop) + 1 (turn) = 4.'),
        q('Showdown ne zaman olur?', ['Herkes pas geçince', 'Son bahis turundan sonra 2+ oyuncu kalınca', 'Flop açılınca'], 1, 'Kartlar ancak birden fazla oyuncu son tura kalırsa açılır.'),
      ] },
      { id: 'rank1', icon: '🏅', title: 'El sıralaması I', steps: [
        info('Alt 5 el (zayıftan güçlüye)', '<b>Yüksek kart</b> [[Ah Jd 8s 5c 2d]]<br><b>Bir çift</b> [[Th Td Ks 7c 2d]]<br><b>İki çift</b> [[Jh Jd 5s 5c Ad]]<br><b>Üçlü</b> [[Qh Qd Qs 8c 3d]]<br><b>Seri (Straight)</b> — ardışık 5 kart [[5h 6d 7s 8c 9d]]'),
        info('As özel!', 'As hem en yüksek (10-J-Q-K-A) hem en düşük (A-2-3-4-5) seride kullanılabilir.'),
        q('Hangisi daha güçlü?', ['İki çift', 'Bir çift'], 0, 'İki çift, bir çiftten güçlüdür.'),
        q('Hangisi daha güçlü?', ['Üçlü', 'İki çift'], 0, 'Üçlü, iki çiftten güçlüdür.'),
        q('[[5h 6d 7s 8c 9d]] hangi el?', ['Flush', 'Seri (Straight)', 'Üçlü'], 1, 'Ardışık 5 kart ama farklı semboller → seri.'),
        gen('hands', 4), gen('hands', 4), gen('hands', 4),
      ] },
      { id: 'rank2', icon: '🏆', title: 'El sıralaması II', steps: [
        info('Üst 5 el (zayıftan güçlüye)', '<b>Flush (Renk)</b> — aynı sembolden 5 kart [[Ad 9d 7d 4d 2d]]<br><b>Full House</b> — üçlü + çift [[Kh Kd Ks 4c 4d]]<br><b>Kare</b> — 4 aynı değer [[9h 9d 9s 9c 2d]]<br><b>Straight Flush</b> — aynı sembolden seri [[5s 6s 7s 8s 9s]]<br><b>Royal Flush</b> — 10-J-Q-K-A aynı sembol [[Th Jh Qh Kh Ah]]'),
        q('Flush mu Seri mi daha güçlü?', ['Flush', 'Seri'], 0, 'Flush seriyi yener.'),
        q('Full House nedir?', ['İki çift', 'Üçlü + çift', 'Kare', '5 aynı sembol'], 1, 'Üç aynı + iki aynı: Full House.'),
        q('En güçlü el hangisi?', ['Kare', 'Full House', 'Royal Flush', 'Flush'], 2, 'Royal Flush en güçlü eldir.'),
        gen('hands'), gen('hands'), gen('hands'), gen('hands'),
      ] },
      { id: 'who', icon: '⚔️', title: 'Kim kazanır?', steps: [
        info('Kicker', 'İki oyuncunun eli aynı türdeyse <b>kicker</b> (elin parçası olmayan en yüksek kart) belirler. Örnek: [[Ah Kd]] ile [[Ac Jd]] board\'da As çıkarsa ikisinde de çift As olur, ama K kicker\'ı J\'yi yener.'),
        info('Beraberlik', 'Semboller eşit değerdedir. 5 kartlık eller tamamen aynıysa <b>pot bölünür</b>.'),
        q('Board [[As 7d 4c 9h 2s]]. Hangisi kazanır? A: [[Ah Kd]], B: [[Ac Jd]]', ['A (As + K kicker)', 'B (As + J kicker)', 'Beraberlik'], 0, 'İkisinde de çift As; K > J.'),
        q('Board [[Ts Jd Qc Kh Ad]] (seri). Elinde hiçbir şey yardım etmiyor. Sonuç?', ['Kaybedersin', 'Board\'u oynarsın, beraberlik olur', 'Kazanırsın'], 1, 'Board\'daki 5 kart en iyi el ise herkes onu oynar → pot bölünür.'),
        gen('winner'), gen('winner'), gen('winner'),
      ] },
    ],
  },
  {
    id: 'u2', title: 'Oyun Kuralları', desc: 'Aksiyonlar, blind\'ler, pozisyon, bahis', color: 'blue',
    lessons: [
      { id: 'actions', icon: '🎬', title: 'Aksiyonlar', steps: [
        info('Sıra sende', '<b>Fold:</b> Pas geçersin.<br><b>Check:</b> Önünde bahis yoksa para koymadan geçersin.<br><b>Call:</b> Önündeki bahse eşit para koyarsın.<br><b>Bet / Raise:</b> İlk bahsi yaparsın ya da bahsi artırırsın.<br><b>All-in:</b> Tüm fişlerini sürersin.'),
        q('Önünde bahis yok ve para koymadan geçmek istiyorsun.', ['Fold', 'Check', 'Call'], 1, 'Check = bedava geçmek.'),
        q('Rakip 50 bahis yaptı, sen de 50 koyuyorsun.', ['Raise', 'Call', 'Check'], 1, 'Eşit miktar = call.'),
        q('Önünde bahis varken check yapabilir misin?', ['Evet', 'Hayır'], 1, 'Bahis varsa fold, call veya raise yapmalısın.'),
        q('Bedava check yapabilecekken fold etmek ne anlama gelir?', ['Akıllıca', 'Gereksiz yere eli atmak'], 1, 'Check bedavaysa fold etmenin anlamı yok!'),
      ] },
      { id: 'blinds', icon: '💰', title: 'Blind\'ler', steps: [
        info('SB ve BB', 'Düğmenin solundaki oyuncu <b>küçük blind</b>, onun solundaki <b>büyük blind</b> koyar. 1/2 masada SB = 1, BB = 2\'dir. Preflop\'ta ilk konuşan, BB\'nin solundaki oyuncudur (UTG).'),
        q('Blind\'ler neden var?', ['Oyunu uzatmak için', 'Her elde kazanılacak bir pot olsun diye', 'Düğmeyi belirlemek için'], 1, 'Zorunlu bahisler olmasa herkes sürekli pas geçerdi.'),
        q('1/2 masada büyük blind kaç?', ['1', '2', '4'], 1, 'Küçük 1, büyük 2.'),
        q('Preflop\'ta ilk kim konuşur?', ['Düğme', 'Küçük blind', 'BB\'nin solundaki oyuncu (UTG)'], 2, 'Preflop\'ta konuşma sırası BB\'nin solundan başlar.'),
      ] },
      { id: 'position', icon: '📍', title: 'Pozisyon', steps: [
        info('Son konuşmak güçtür', 'Flop\'tan sonra <b>düğmeye (BTN)</b> yakın oyuncular daha geç konuşur. Rakiplerin ne yaptığını görüp sonra karar verirsin. Bu büyük avantajdır!'),
        info('Masadaki yerler', '<b>UTG:</b> Erken, zor pozisyon<br><b>MP:</b> Orta<br><b>CO (Cutoff):</b> Düğmenin sağı<br><b>BTN (Düğme):</b> En iyi pozisyon'),
        q('Hangisi en iyi pozisyon?', ['UTG', 'BTN (Düğme)', 'Büyük blind'], 1, 'Flop sonrası en son konuşan BTN\'dir.'),
        q('Erken pozisyonda (UTG) nasıl oynamalısın?', ['Çok geniş el aralığıyla', 'Sıkı, sadece güçlü ellerle'], 1, 'Arkanda çok oyuncu var, bu yüzden seçici olmalısın.'),
        q('Geç pozisyonda ne yapabilirsin?', ['Daha geniş el aralığıyla oynayabilirsin', 'Her zaman fold etmelisin'], 0, 'Pozisyon avantajı daha fazla eli karlı yapar.'),
      ] },
      { id: 'sizing', icon: '📏', title: 'Bahis büyüklüğü', steps: [
        info('Pot\'a göre bahis', '<b>⅓ pot:</b> Küçük, ucuz bahis<br><b>½ pot:</b> Standart bahis<br><b>¾–1 pot:</b> Güçlü eller veya güçlü baskı<br>Preflop\'ta standart raise: <b>2.5–3 × BB</b>'),
        q('Pot 150. ½ pot bahis kaç eder?', ['50', '75', '150'], 1, '150 ÷ 2 = 75.'),
        q('BB 20 ise standart preflop raise yaklaşık kaç?', ['25', '50–60', '200'], 1, '2.5–3 × 20 = 50–60.'),
        q('Pot 90. ⅓ pot bahis kaç?', ['15', '30', '45'], 1, '90 ÷ 3 = 30.'),
        q('Güçlü elinle ne yapmak mantıklı?', ['Bahis yapıp değer almak', 'Her zaman check yapmak'], 0, 'Güçlü elle rakibin call etmesini isteriz: değer bahsi.'),
      ] },
    ],
  },
  {
    id: 'u3', title: 'Strateji', desc: 'Başlangıç elleri, outs, pot odds, blöf', color: 'purple',
    lessons: [
      { id: 'startinghands', icon: '✋', title: 'Başlangıç elleri', steps: [
        info('Notasyon', '<b>AKs</b> = As-Papaz aynı sembol (suited)<br><b>AKo</b> = farklı sembol (offsuit)<br><b>77</b> = cep çifti<br>Toplam 169 farklı başlangıç eli vardır, çoğunu pas geçersin!'),
        info('Güçlü eller', '<b>Premium:</b> AA KK QQ JJ AKs AKo<br><b>Güçlü:</b> TT 99 AQs AJs KQs<br><b>Zayıf:</b> 72o gibi bağlantısız düşük kartlar'),
        q('"AKs" ne demek?', ['As-Papaz farklı sembol', 'As-Papaz aynı sembol', 'İki As'], 1, 's = suited, aynı sembol.'),
        q('Hangisi daha güçlü başlangıç eli?', ['AA', '72o'], 0, 'AA en güçlü, 72o en zayıf ellerden biridir.'),
        q('Elini oynamak istiyorsan preflop\'ta çoğunlukla ne yapmalısın?', ['Raise ile girmek', 'Sadece call (limp) yapmak'], 0, 'Raise ile girmek pot\'u büyütür ve inisiyatif verir.'),
        gen('preflop'), gen('preflop'), gen('preflop'), gen('preflop'),
      ] },
      { id: 'outs', icon: '🎯', title: 'Outs', steps: [
        info('Out nedir?', 'Elini geliştirecek kalan kartlardır. Flop\'ta 4 kupan varsa (flush çekişi) destede 13 − 4 = <b>9 kupa</b> kalır → <b>9 out</b>.<br>Açık uçlu seri çekişi: <b>8 out</b>. İçten seri (gutshot): <b>4 out</b>.'),
        info('2 ve 4 kuralı', '<b>Flop\'ta:</b> out × <b>4</b> ≈ kazanma %\'si<br><b>Turn\'de:</b> out × <b>2</b><br>Örnek: Flop\'ta 9 out → 9 × 4 = <b>%36</b>.'),
        q('Flop\'ta flush çekişin var. Kaç out?', ['4', '8', '9', '13'], 2, '13 − 4 = 9 kart.'),
        q('Açık uçlu seri çekişi kaç out?', ['4', '8', '9'], 1, 'İki uçtan 4 + 4 = 8.'),
        q('Flop\'ta 8 out. Yaklaşık kazanma şansın?', ['%16', '%32', '%50'], 1, '8 × 4 = 32.'),
        q('Turn\'de 9 out. Yaklaşık river\'da yakalama şansın?', ['%18', '%36', '%9'], 0, '9 × 2 = 18.'),
      ] },
      { id: 'potodds', icon: '🧮', title: 'Pot odds', steps: [
        info('Call etmeli miyim?', '<p class="formula">Gereken % = Call ÷ (Pot + Call)</p>Pot (rakibin bahsi dahil) 100, call 50 ise: 50 ÷ 150 = <b>%33</b>.<br>Eşitliğin bundan yüksekse call karlıdır.'),
        q('Pot 100, call 50. Gereken eşitlik?', ['%25', '%33', '%50'], 1, '50 ÷ (100 + 50) = %33.'),
        q('Eşitliğin %40, gereken %25. Ne yaparsın?', ['Call', 'Fold'], 0, 'Eşitlik gerekenden yüksek → call karlı.'),
        gen('odds'), gen('odds'), gen('odds'), gen('odds'),
      ] },
      { id: 'bluff', icon: '🎭', title: 'Blöf ve zihin', steps: [
        info('Değer bahsi ve blöf', '<b>Değer bahsi:</b> Daha zayıf ellerin call etmesini beklersin.<br><b>Blöf:</b> Daha iyi ellerin pas geçmesini sağlarsın.<br><b>Yarı-blöf:</b> Çekişinle bahis yaparsın; hem pas geçirebilirsin hem tamamlayabilirsin.'),
        info('Tilt ve sermaye', '<b>Tilt:</b> Kötü bir beat sonrası duygusal kararlar vermek. Mola ver!<br><b>Bankroll:</b> Bir masanın buy-in\'inin en az 20–30 katını bulundur. Kaybetmeyi göze alamayacağın parayla oynama.'),
        q('Blöfün amacı nedir?', ['Daha iyi elleri pas geçirmek', 'Daha zayıf elleri call ettirmek'], 0, 'Blöf: daha iyi eli olan rakibi pas geçirtmek.'),
        q('Çekişinle (flush çekişi) bahis yapmak nasıl adlanır?', ['Değer bahsi', 'Yarı-blöf', 'Limp'], 1, 'Yarı-blöf: hem pas geçirebilir hem de tamamlayabilirsin.'),
        q('Üst üste kaybettin ve sinirlisin. Ne yapmalısın?', ['Kaybı hemen çıkarmak için büyük oynamak', 'Mola vermek'], 1, 'Tilt en pahalı hatadır. Mola ver!'),
        q('Rakip sayısı çoksa blöf yapmak...', ['Daha kolaydır', 'Daha zordur'], 1, 'Çok rakip varsa en az birinin elinin güçlü olma olasılığı artar.'),
      ] },
    ],
  },
];
