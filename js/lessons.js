// Dersler. [[As Kh]] biçimi kart gösterir (As = maça As, h = kupa, d = karo, c = sinek).
window.LESSONS = [
  {
    id: 'basics', icon: '🃏', title: 'Texas Hold\'em Temelleri', time: '4 dk',
    summary: 'Oyunun amacı ve bir elin akışı.',
    body: `
<h3>Amaç</h3>
<p>Her oyuncu 2 özel kart (<b>hole cards</b>) alır. Masanın ortasına sırayla 5 ortak kart (<b>board</b>) açılır. Kazanan, kendi 2 kartı ve 5 ortak karttan oluşturduğu <b>en iyi 5 kartlık eli</b> yapan oyuncudur. Ya da herkes pas geçerse, son kalan oyuncu potu alır.</p>
<h3>Bir elin akışı</h3>
<ol>
<li><b>Blind'ler:</b> Düğmenin solundaki iki oyuncu zorunlu bahisleri koyar: <i>küçük blind (SB)</i> ve <i>büyük blind (BB)</i>.</li>
<li><b>Preflop:</b> Herkes 2 kart alır. BB'nin solundaki oyuncudan başlayarak bahis turu oynanır.</li>
<li><b>Flop:</b> 3 ortak kart açılır → bahis turu.</li>
<li><b>Turn:</b> 4. ortak kart → bahis turu.</li>
<li><b>River:</b> 5. ortak kart → son bahis turu.</li>
<li><b>Showdown:</b> Birden fazla oyuncu kaldıysa kartlar açılır, en iyi el potu alır.</li>
</ol>
<div class="tip"><b>İpucu:</b> 2 özel kartın <i>ikisini de</i> kullanmak zorunda değilsin. Board'daki 5 kartın hepsi de eli oluşturabilir ("board'u oynamak").</div>
<h3>Örnek</h3>
<p>Elin: [[Ah Ad]] Board: [[Ks 7d 7c 2h 9s]]</p>
<p>En iyi 5 kart: <b>iki çift</b> (Aslar ve yediler) + K kicker.</p>`,
  },
  {
    id: 'ranks', icon: '🏆', title: 'El Sıralaması', time: '5 dk',
    summary: 'Güçlüden zayıfa 10 el türü.',
    body: `
<p>Güçlüden zayıfa doğru sıralama. Bunu ezberlemek poker'in ilk ve en önemli adımıdır.</p>
<ol class="ranks">
<li><b>Royal Flush</b> — Aynı sembolden 10-J-Q-K-A.<br>[[Th Jh Qh Kh Ah]]</li>
<li><b>Straight Flush</b> — Aynı sembolden ardışık 5 kart.<br>[[5s 6s 7s 8s 9s]]</li>
<li><b>Kare</b> — Aynı değerden 4 kart.<br>[[9h 9d 9s 9c 2d]]</li>
<li><b>Full House</b> — Bir üçlü + bir çift.<br>[[Kh Kd Ks 4c 4d]]</li>
<li><b>Flush (Renk)</b> — Aynı sembolden 5 kart (ardışık değil).<br>[[Ad 9d 7d 4d 2d]]</li>
<li><b>Seri (Straight)</b> — Farklı sembollerden ardışık 5 kart. As hem en alçak (A-2-3-4-5) hem en yüksek (10-J-Q-K-A) olabilir.<br>[[5h 6d 7s 8c 9d]]</li>
<li><b>Üçlü</b> — Aynı değerden 3 kart.<br>[[Qh Qd Qs 8c 3d]]</li>
<li><b>İki Çift</b><br>[[Jh Jd 5s 5c Ad]]</li>
<li><b>Bir Çift</b><br>[[Th Td Ks 7c 2d]]</li>
<li><b>Yüksek Kart</b> — Hiçbiri yoksa en yüksek kart sayılır.<br>[[Ah Jd 8s 5c 2d]]</li>
</ol>
<h3>Kicker nedir?</h3>
<p>İki oyuncunun eli aynı türdeyse, eli oluşturmayan en yüksek kart (<b>kicker</b>) belirler. Örneğin [[Ah Kd]] ile [[Ac Jd]] board'da As çıkarsa ikisinde de çift As olur; ama K kicker'ı J'yi yener.</p>
<div class="tip"><b>Unutma:</b> Sembollerin üstünlüğü yoktur; ♠ ile ♥ eşit değerdedir. Aynı el beraberlik olur ve pot bölünür.</div>`,
  },
  {
    id: 'actions', icon: '🎯', title: 'Aksiyonlar ve Bahis', time: '4 dk',
    summary: 'Fold, check, call, bet, raise.',
    body: `
<p>Sıran geldiğinde şu seçeneklerin birini yaparsın:</p>
<ul>
<li><b>Fold (Pas):</b> Elini atarsın. Elde o ana kadar koyduğun parayı kaybedersin.</li>
<li><b>Check:</b> Önünde bahis yoksa, para koymadan sırayı geçersin.</li>
<li><b>Bet:</b> Bu turdaki ilk bahsi yaparsın.</li>
<li><b>Call:</b> Önündeki bahse eşit miktar koyarsın.</li>
<li><b>Raise:</b> Önündeki bahsi artırırsın. Rakipler artırmaya cevap vermek zorundadır.</li>
<li><b>All-in:</b> Önündeki tüm fişleri sürersin.</li>
</ul>
<h3>Blind yapısı</h3>
<p>Örneğin 1/2 masada küçük blind 1, büyük blind 2'dir. Preflop'ta BB'ye eşit olan ilk "raise" tipik olarak 2.5–3 BB'dir.</p>
<h3>Bahis büyüklüğü (pot'a göre)</h3>
<table class="t"><tr><th>Bahis</th><th>Anlamı</th></tr>
<tr><td>⅓ pot</td><td>Küçük: bilgi toplar, ucuz blöf/değer.</td></tr>
<tr><td>½ pot</td><td>Standart c-bet ve değer bahsi.</td></tr>
<tr><td>¾–1 pot</td><td>Güçlü eller ya da güçlü baskı.</td></tr></table>
<div class="tip"><b>Altın kural:</b> Güçlü elinle <i>değer</i> için, zayıf ama potansiyelli elinle <i>blöf</i> için bahis yap. Orta güçteki ellerde çoğunlukla check/call tercih edilir.</div>`,
  },
  {
    id: 'position', icon: '📍', title: 'Pozisyon', time: '4 dk',
    summary: 'Poker\'de en büyük avantaj: son konuşmak.',
    body: `
<p>Flop'tan sonra <b>düğmeye (BTN)</b> yakın oyuncular daha geç konuşur. Rakiplerin ne yaptığını görmek büyük avantajdır.</p>
<h3>Masadaki yerler (düğmeden geriye)</h3>
<ul>
<li><b>BTN (Düğme):</b> En iyi pozisyon; flop sonrası son konuşur.</li>
<li><b>CO (Cutoff):</b> Düğmenin sağı, ikinci en iyi.</li>
<li><b>MP (Orta):</b> Ortadaki oyuncular.</li>
<li><b>UTG (Erken):</b> BB'nin solu; preflop'ta ilk konuşur, en zor yer.</li>
<li><b>SB / BB:</b> Zorunlu para koyarlar ama flop sonrası ilk konuşurlar.</li>
</ul>
<h3>Bu neden önemli?</h3>
<ul>
<li>Geç pozisyonda <b>daha geniş</b> el aralığıyla oynayabilirsin.</li>
<li>Erken pozisyonda <b>sıkı</b> oynamalısın: arkanda konuşacak çok oyuncu var.</li>
<li>Pozisyondayken check'leyip pot'u küçük tutabilir, rakibin zayıflığını kullanabilirsin.</li>
</ul>
<div class="tip"><b>Pratik:</b> "Strateji" sekmesinde pozisyona göre açılış aralıklarına bak. UTG'de ~%9, BTN'de ~%29 el oynanır.</div>`,
  },
  {
    id: 'preflop', icon: '✋', title: 'Başlangıç Elleri', time: '5 dk',
    summary: 'Hangi 2 kartla oynamalısın?',
    body: `
<p>Toplam 169 farklı başlangıç eli vardır. Çoğunlukla fold etmek gerekir; başarılı oyuncular elleri seçici oynar.</p>
<h3>Notasyon</h3>
<ul>
<li><b>AKs</b> = As-Papaz aynı sembolden (<i>suited</i>)</li>
<li><b>AKo</b> = As-Papaz farklı sembolden (<i>offsuit</i>)</li>
<li><b>77</b> = Cep çifti (pocket pair)</li>
</ul>
<h3>El grupları</h3>
<table class="t"><tr><th>Grup</th><th>Eller</th></tr>
<tr><td>Premium</td><td>AA KK QQ JJ AKs AKo</td></tr>
<tr><td>Güçlü</td><td>TT 99 AQs AJs KQs AQo</td></tr>
<tr><td>Oynanabilir</td><td>88–66, ATs, KJs, QJs, JTs, AJo</td></tr>
<tr><td>Spekülatif</td><td>Küçük çiftler, suited bağlayıcılar (76s, 98s), suited As</td></tr>
<tr><td>Zayıf</td><td>72o, 93o gibi bağlantısız düşük kartlar</td></tr></table>
<h3>Neden suited ve bağlayıcı?</h3>
<p>Aynı sembol flush şansı verir (~%+3 eşitlik), bağlayıcı kartlar seri şansı verir. Ama asıl güç yüksek kartlardan ve çiftlerden gelir.</p>
<h3>Preflop kuralı</h3>
<p>Elini oynamak istiyorsan genellikle <b>raise ile gir</b>, limp (sadece call) etme. Raise; pot'u büyütür, blind'leri çalma şansı verir ve inisiyatifi sana verir.</p>
<div class="tip"><b>Pratik:</b> Strateji sekmesindeki tablo, her pozisyon için açılış (open-raise) aralığını gösterir. Quiz'de "Başlangıç Eli" testini çöz.</div>`,
  },
  {
    id: 'odds', icon: '🧮', title: 'Outs ve Pot Odds', time: '6 dk',
    summary: 'Matematikle call/fold kararı.',
    body: `
<h3>Out nedir?</h3>
<p>Elini geliştirecek kalan kartlardır. Örneğin flop'ta 4 kupa kartın var (flush çekişi): destede 13 − 4 = <b>9 kupa</b> kalır → 9 out.</p>
<table class="t"><tr><th>Çekiş</th><th>Out</th></tr>
<tr><td>Flush çekişi</td><td>9</td></tr>
<tr><td>Açık uçlu seri (OESD)</td><td>8</td></tr>
<tr><td>İçten seri (gutshot)</td><td>4</td></tr>
<tr><td>İki overcard</td><td>6</td></tr>
<tr><td>Flush + açık uçlu seri</td><td>~15</td></tr></table>
<h3>2 ve 4 kuralı</h3>
<ul>
<li><b>Flop'ta</b> (turn+river gelecek): out sayısı × <b>4</b> ≈ kazanma yüzdesi.</li>
<li><b>Turn'de</b> (sadece river): out sayısı × <b>2</b>.</li>
</ul>
<p>Örnek: Flop'ta flush çekişi → 9 × 4 = <b>%36</b> (gerçek: ~%35).</p>
<h3>Pot odds</h3>
<p>Call yapmak için gereken minimum şans:</p>
<p class="formula">Gereken % = Call miktarı ÷ (Pot + Call miktarı)</p>
<p>Pot (rakibin bahsi dahil) 100, call 50 ise: 50 ÷ 150 = <b>%33</b>. Eşitliğin bundan yüksekse call karlıdır.</p>
<div class="tip"><b>Karar:</b> Eşitlik &gt; gereken % → Call. Eşitlik &lt; gereken % → Fold (ileride ek kazanç beklemiyorsan).</div>
<h3>Örnek</h3>
<p>Flop'ta açık uçlu seri çekişin (8 out → %32). Pot 150, call 50 → gereken %25. 32 &gt; 25 → <b>Call</b>.</p>`,
  },
  {
    id: 'strategy', icon: '🧠', title: 'Strateji ve Sermaye', time: '5 dk',
    summary: 'Bluf, değer bahsi, bankroll ve tilt.',
    body: `
<h3>Değer bahsi vs Blöf</h3>
<ul>
<li><b>Değer bahsi:</b> Daha zayıf ellerin call etmesini bekleyerek bahis yaparsın.</li>
<li><b>Blöf:</b> Daha iyi ellerin pas geçmesini sağlamak için bahis yaparsın. Rakip sayısı azken, pozisyondayken ve hikayen tutarlıyken işe yarar.</li>
<li><b>Yarı-blöf:</b> Çekişle bahis yaparsın. Hem rakibi pas geçirebilirsin hem de çekişi tamamlayabilirsin.</li>
</ul>
<div class="tip">Her blöf mantıklı bir hikaye anlatmalı: "Bu board'da hangi eli temsil ediyorum?"</div>
<h3>Continuation bet (c-bet)</h3>
<p>Preflop'ta raise yapan oyuncu flop'ta genellikle bahis yapar. Kuru board'larda (K-7-2 gibi) sık, bağlantılı board'larda (9-8-7) seçici yap.</p>
<h3>Bankroll yönetimi</h3>
<ul>
<li>Cash game için bir masa buy-in'inin en az <b>20–30 katı</b> bankroll bulundur.</li>
<li>Kaybetmeyi göze alamayacağın parayla oynama.</li>
<li>Bankroll düşünce limiti indir, yükselince çık.</li>
</ul>
<h3>Tilt</h3>
<p>Kötü bir beat sonrası duygusal kararlar vermek en büyük para kaybıdır. Fark ettiğinde: mola ver, nefes al, gerekirse masayı bırak.</p>
<h3>Başlangıç için 7 kural</h3>
<ol>
<li>Seçici başla, agresif oyna.</li>
<li>Pozisyonu kullan.</li>
<li>Pot odds'u hesapla.</li>
<li>Çok sık blöf yapma, çok sık call etme.</li>
<li>Rakibi gözlemle (kim sıkı, kim gevşek?).</li>
<li>Duygularını yönet.</li>
<li>Her elden sonra öğren.</li>
</ol>`,
  },
];
