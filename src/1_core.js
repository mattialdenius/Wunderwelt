'use strict';
/* =====================================================================
   ZAUBERWALD – Meilenstein 1
   Aufbau dieser Datei:
     1. KONFIGURATION + SPRACHTABELLE   (hier darfst du gefahrlos ändern)
     2. Kern: Hilfen, Ansicht, Eingabe, Töne, Sprache, Spielstand, Effekte
     3. Grafik: alle Figuren als austauschbare Zeichenfunktionen
     4. Szenen: Start, Benennen
     5. Welt: Zauberwald
     6. Minispiele: Eule, Fuchs, Frosch
     7. Start des Spiels
   ===================================================================== */

/* ============ 1. KONFIGURATION ============ */
const CONFIG = {
  // Kopf von T: Dateiname (liegt neben index.html) oder Data-URL ("data:image/png;base64,...").
  // Solange image = null ist, wird das Platzhalter-Gesicht gezeichnet.
  tHead: { image: null, size: 1.0, offsetX: 0, offsetY: 0 },
  // Ganze Figuren durch Bilder ersetzen: Dateiname oder Data-URL eintragen.
  // Das Bild wird mit den Füßen unten-mittig platziert; Blickrichtung nach rechts.
  sprites: { tBody: null, unicorn: null, owl: null, fox: null, frog: null, dragon: null, butterfly: null, snail: null, squirrel: null, duckNpc: null, bee: null, bear: null, mole: null, bunny: null },
  readUpper: true,            // Leserätsel in GROSSBUCHSTABEN (false = normale Groß-/Kleinschreibung)
  speech: { enabled: true, lang: 'de-DE', rate: 0.95, pitch: 1.15 },
  hintDelay: 10,              // Sekunden ohne Fortschritt, bis das Einhorn hilft
  saveKey: 'zauberwald_save_v1'
};

// Namensvorschläge für das Einhorn (Symbol + gesprochener Name)
const NAMES = [
  { id: 'glitzer',    text: 'Glitzer',    icon: 'sparkle', color: '#ffd9f1' },
  { id: 'sternchen',  text: 'Sternchen',  icon: 'star',    color: '#fff2bd' },
  { id: 'wolke',      text: 'Wolke',      icon: 'cloud',   color: '#d9edff' },
  { id: 'regenbogen', text: 'Regenbogen', icon: 'rainbow', color: '#e0f8d8' }
];

/* Alle Sprachtexte an einer Stelle.
   text:  ein Satz oder eine Liste (dann wird zufällig gewählt). {name} = Name des Einhorns.
   audio: später Dateiname/Data-URL einer Aufnahme eintragen – dann wird die statt der Computerstimme gespielt. */
const SPEECH = {
  start_welcome:   { text: 'Hallo! Tippe auf den großen Knopf, dann geht es los!', audio: null },
  welcome_back:    { text: 'Hallo {spieler}! Schön, dass du wieder da bist! {name} hat schon auf dich gewartet.', audio: null },
  char_intro:      { text: 'Wie siehst du aus? Tippe auf die Bilder und such dir alles aus!', audio: null },
  char_hello:      { text: ['Hallo {spieler}!', 'Toll siehst du aus!', 'Hihi!'], audio: null },
  char_done:       { text: 'Super, {spieler}! So siehst du toll aus!', audio: null },
  snail_intro:     { text: 'Hallo, ich bin Sina, die Postschnecke! In meinen Briefen stehen Wörter. Lies das Wort und tippe auf das passende Bild!', audio: null },
  snail_intro2:    { text: 'Hallo! In meinen Briefen fehlen Buchstaben. Welcher Buchstabe passt in die Lücke?', audio: null },
  snail_intro3:    { text: 'Jetzt wird es kniffliger! Lies ganz genau. Manchmal legst du das Wort sogar selbst.', audio: null },
  read_w2p:        { text: 'Lies das Wort. Welches Bild passt?', audio: null },
  read_gap:        { text: 'Welcher Buchstabe fehlt?', audio: null },
  read_p2w:        { text: 'Welches Wort passt zum Bild?', audio: null },
  read_build:      { text: 'Lege das Wort mit den Buchstaben!', audio: null },
  read_word:       { text: '{wort}!', audio: null },
  read_hint:       { text: 'Hör mal genau: {wort}.', audio: null },
  squirrel_intro:  { text: 'Hallo, ich bin Flink! Ich sammle Nüsse und rechne gern. Tippe auf die richtige Zahl!', audio: null },
  squirrel_intro2: { text: 'Jetzt essen wir auch Nüsse auf! Plus und minus bis zehn.', audio: null },
  squirrel_intro3: { text: 'Jetzt rechnen wir bis zwanzig! Du schaffst das!', audio: null },
  math_task:       { text: '{aufgabe}', audio: null },
  math_hint:       { text: 'Zähl mal die Nüsse. Das Einhorn zeigt dir die Lösung.', audio: null },
  name_intro:      { text: 'Schau mal, das ist dein Einhorn! Wie soll es heißen? Tippe auf ein Bild.', audio: null },
  name_glitzer:    { text: 'Glitzer', audio: null },
  name_sternchen:  { text: 'Sternchen', audio: null },
  name_wolke:      { text: 'Wolke', audio: null },
  name_regenbogen: { text: 'Regenbogen', audio: null },
  name_confirm:    { text: 'Wenn dir der Name gefällt, tippe auf den grünen Haken.', audio: null },
  name_done:       { text: 'Juhu! Ich heiße {name}! Komm, wir gehen in den Zauberwald!', audio: null },
  world_intro:     { text: 'Tippe dorthin, wo du hinlaufen möchtest. Ich komme mit!', audio: null },
  world_hint:      { text: ['Schau mal, dort wartet jemand auf uns! Folge den Sternen.', 'Komm, wir folgen den Sternen!'], audio: null },
  world_hint_crystal: { text: 'Da liegt dein Kristall! Tippe ihn an.', audio: null },
  world_hint_star: { text: ['Schau mal, dort glitzert etwas!', 'Folge den Sternen, da ist ein Glitzerstern versteckt!'], audio: null },
  uni_ride_tip:    { text: 'Tipp mich an, dann darfst du auf mir reiten! Dann sind wir viel schneller.', audio: null },
  uni_ride_on:     { text: ['Hü-hott, los geht\'s!', 'Halt dich gut fest!', 'Juhu, wir reiten!'], audio: null },
  uni_ride_off:    { text: ['Absteigen!', 'Puh, das war schön!'], audio: null },
  map_open:        { text: 'Das ist die Karte. Tippe auf einen Ort, dann reiten wir dorthin!', audio: null },
  star_found:      { text: ['Ein Glitzerstern!', 'Juhu, noch ein Glitzerstern!', 'Toll, du hast einen Glitzerstern gefunden!'], audio: null },
  stars_all:       { text: 'Wow! Du hast alle Glitzersterne im ganzen Zauberwald gefunden!', audio: null },
  uni_tap:         { text: ['Ich bin {name}!', 'Hihi, das kitzelt!', 'Ich hab dich lieb!'], audio: null },
  backpack_0:      { text: 'Dein Rucksack ist noch leer.', audio: null },
  backpack_n:      { text: 'Du hast {n} von {m} Kristallen.', audio: null },
  backpack_all:    { text: 'Du hast alle Kristalle!', audio: null },
  owl_intro:       { text: 'Schuhu! Ich bin die Eule. Schau dir die Reihe an. Welcher Edelstein fehlt?', audio: null },
  owl_intro2:      { text: 'Schuhu! Jetzt wird es kniffliger. Welcher Edelstein fehlt?', audio: null },
  owl_next:        { text: ['Und jetzt?', 'Noch eine Reihe!'], audio: null },
  owl_two:         { text: 'Oh, diesmal fehlen zwei Edelsteine!', audio: null },
  owl_hint:        { text: 'Schau genau hin. Welcher Edelstein passt in die Lücke?', audio: null },
  fox_intro:       { text: 'Hallo, ich bin der Fuchs! Zieh jedes Tier auf seinen Schatten.', audio: null },
  fox_intro2:      { text: 'Jetzt sind es mehr Tiere! Zieh jedes auf seinen Schatten.', audio: null },
  fox_intro3:      { text: 'Achtung, die Schatten schauen jetzt in die andere Richtung! Findest du trotzdem alle?', audio: null },
  fox_next:        { text: ['Prima! Und jetzt noch mehr Schatten!', 'Super! Hier kommt die nächste Reihe.'], audio: null },
  fox_decoy:       { text: 'Jetzt wird es knifflig: Ein Schatten gehört zu niemandem!', audio: null },
  fox_hint:        { text: 'Welcher Schatten sieht genauso aus?', audio: null },
  frog_intro:      { text: 'Quak! Hüpf über die Seerosen zu mir und sammle die Sterne! Mit den Pfeilen läufst du, mit dem großen Knopf springst du.', audio: null },
  frog_intro2:     { text: 'Quak! Diesmal ist der Weg länger. Manche Seerosen schwimmen hin und her, und auf den roten Pilzen hüpfst du ganz hoch!', audio: null },
  frog_hint:       { text: 'Drück auf den großen Knopf, dann springst du!', audio: null },
  frog_splash:     { text: ['Platsch! Nicht schlimm, gleich nochmal!', 'Hoppla! Weiter geht\'s!'], audio: null },
  try_again:       { text: ['Probier\'s nochmal!', 'Fast! Versuch es noch einmal.', 'Hm, schau nochmal genau hin.'], audio: null },
  good:            { text: ['Super!', 'Richtig!', 'Toll gemacht!', 'Prima!'], audio: null },
  win:             { text: ['Juhu! Du hast es geschafft!', 'Hurra! Das war spitze!'], audio: null },
  reward:          { text: 'Du bekommst einen Kristall für deinen Rucksack!', audio: null },
  reward_up:       { text: 'Schau mal, dein Kristall wächst! Er ist jetzt größer.', audio: null },
  reward_gold:     { text: 'Wow! Dein Kristall ist jetzt riesig und glitzert golden!', audio: null },
  all_gold:        { text: 'Unglaublich! Alle Kristalle glitzern golden. Du bist die Meisterin vom Zauberwald!', audio: null },
  /* --- Geschichte, Kapitel 1: Der zerbrochene Regenbogenkristall --- */
  story_owl1:      { text: 'Hallo {spieler}! Schön, dass du da bist. Siehst du die Regenbogenbrücke am Himmel? Sie ist ganz blass geworden.', audio: null },
  story_owl2:      { text: 'Der Regenbogenkristall ist heruntergefallen und in acht Splitter zerbrochen. Ohne ihn leuchtet die Brücke nicht.', audio: null },
  story_owl3:      { text: 'Wir Tiere haben vier Splitter gefunden. Löst du unsere Rätsel, schenken wir sie dir! Fang am besten gleich bei mir an.', audio: null },
  story_funki1:    { text: 'Hihi... du, {spieler}? Ich muss dir was sagen.', audio: null },
  story_funki2:    { text: 'Ich wollte den Regenbogenkristall nur ganz kurz anfassen. Und dann ist er runtergefallen. Plumps!', audio: null },
  story_funki3:    { text: 'Es tut mir leid! Ab jetzt helfe ich dir. Aber erst spielen wir Fangen, ja?', audio: null },
  story_owl4:      { text: 'Du hast alle vier Splitter aus dem Zauberwald! Schau, die Regenbogenbrücke leuchtet schon ein bisschen.', audio: null },
  story_owl5:      { text: 'Die anderen Splitter sind im Pilzdorf und auf den Wolkeninseln. Unten bei der Blumenwiese hat sich das Pilztor geöffnet!', audio: null },
  story_gate:      { text: 'Das Pilztor glitzert! Bald geht es hier ins Pilzdorf.', audio: null },
  gate_closed:     { text: 'Das Pilztor ist noch zu. Sammle erst die Splitter im Zauberwald!', audio: null },
  /* --- Kapitel 2: Pilzdorf --- */
  area_dorf:       { text: 'Willkommen im Pilzdorf!', audio: null },
  area_wald:       { text: 'Zurück im Zauberwald!', audio: null },
  story_mia1:      { text: 'Oh, hallo {spieler}! Willkommen im Pilzdorf. Ich bin Mia, die Bürgermeisterin.', audio: null },
  story_mia2:      { text: 'Seit der Regenbogenkristall zerbrochen ist, sind unsere Laternen aus. Es ist so dunkel hier!', audio: null },
  story_mia3:      { text: 'Igel Ida und ich haben je einen Splitter gefunden. Löst du unsere Rätsel? Fang bei mir mit dem Zählen an!', audio: null },
  story_mia4:      { text: 'Du hast beide Splitter aus dem Pilzdorf! Schau, wie hell es auf einmal ist!', audio: null },
  story_mia5:      { text: 'Und schau mal dein Einhorn an... es hat Flügel bekommen!', audio: null },
  story_uni_wings: { text: 'Ich kann fliegen! Bald fliegen wir zusammen zu den Wolkeninseln!', audio: null },
  mouse_intro:     { text: 'Hilf mir, die Glühwürmchen zu zählen! Tipp sie an, dann zählst du mit.', audio: null },
  mouse_intro2:    { text: 'Jetzt zählen wir manchmal nur die gelben Glühwürmchen. Pass gut auf!', audio: null },
  mouse_intro3:    { text: 'Jetzt sind es ganz viele! Und manchmal fragen wir: Wo sind mehr?', audio: null },
  count_task:      { text: 'Wie viele Glühwürmchen sind im Glas?', audio: null },
  count_only:      { text: 'Zähle nur die gelben Glühwürmchen!', audio: null },
  count_more:      { text: 'In welchem Glas sind mehr Glühwürmchen?', audio: null },
  count_hint:      { text: 'Wir zählen zusammen!', audio: null },
  count_num:       { text: '{n}', audio: null },
  hedgehog_intro:  { text: 'Hallo, ich bin Ida, die Bäckerin! Meine Bilderkarten sind durcheinander. Finde immer zwei gleiche!', audio: null },
  hedgehog_intro2: { text: 'Jetzt sind es mehr Karten! Merk dir gut, wo welches Bild liegt.', audio: null },
  hedgehog_intro3: { text: 'Jetzt ganz viele Karten! Du schaffst das!', audio: null },
  memo_hint:       { text: 'Schau mal, diese zwei gehören zusammen!', audio: null },
  memo_no:         { text: ['Nicht gleich. Merk sie dir!', 'Hm, das passt nicht.'], audio: null },
  q_mouse_offer:   { text: 'Hilfst du mir, die fünf Pilzlaternen im Dorf wieder anzuzünden? Lauf einfach zu jeder Laterne hin!', audio: null },
  q_mouse_remind:  { text: 'Es sind fünf Laternen. Lauf zu jeder hin, dann leuchtet sie!', audio: null },
  q_lamp_item:     { text: ['Die Laterne leuchtet!', 'Wie hell!'], audio: null },
  q_mouse_done:    { text: 'Alle Laternen leuchten! Danke, {spieler}! Hier ist ein Pilzhut für dich. Der steht dir!', audio: null },
  q_hedgehog_offer:  { text: 'Ich möchte einen Kuchen backen! Bringst du mir vier Beeren und zwei goldene Pilze? Die wachsen rund ums Dorf.', audio: null },
  q_hedgehog_remind: { text: 'Ich brauche vier Beeren und zwei goldene Pilze für den Kuchen.', audio: null },
  q_cake_item:     { text: ['Lecker!', 'Für den Kuchen!', 'Gefunden!'], audio: null },
  q_hedgehog_done: { text: 'Mmh, das wird ein feiner Kuchen! Danke! Hier sind zwei Zauberaugen: Damit siehst du beim Memory kurz alle Karten.', audio: null },
  album_open:      { text: 'Das ist dein Album. Hier sind alle deine Freunde!', audio: null },
  album_unknown:   { text: 'Diese Figur kennst du noch nicht. Such sie in der Welt!', audio: null },
  /* --- Kapitel 3: Wolkeninseln --- */
  area_wolken:     { text: 'Willkommen auf den Wolkeninseln!', audio: null },
  sky_need_wings:  { text: 'Das ist ein Startplatz zum Fliegen! Dafür brauche ich aber Flügel.', audio: null },
  sky_fly:         { text: 'Halt dich gut fest! Wir fliegen!', audio: null },
  sky_back:        { text: 'Wir fliegen zurück in den Zauberwald!', audio: null },
  world_hint_pad:  { text: 'Lauf zum Startplatz, dann fliegen wir!', audio: null },
  story_wolli1:    { text: 'Mäh! Hallo {spieler}! Willkommen auf den Wolkeninseln. Ich bin Wolli, das Wolkenschaf.', audio: null },
  story_wolli2:    { text: 'Die letzten zwei Splitter vom Regenbogenkristall sind hier oben gelandet. Einen habe ich, einen hat Sternenvogel Stella.', audio: null },
  story_wolli3:    { text: 'Spielst du mit mir? Wir ordnen Wolken, von klein nach groß!', audio: null },
  story_stella1:   { text: 'Du hast alle acht Splitter gefunden! Hör mal, wie fröhlich der Himmel klingt!', audio: null },
  story_stella2:   { text: 'Jetzt muss der Kristall nur noch zusammengesetzt werden. Das geht nur am Drachenberg. Funki kennt den Weg!', audio: null },
  sheep_intro:     { text: 'Tippe die Wolken an: zuerst die kleinste, dann die nächste, bis zur größten!', audio: null },
  sheep_intro2:    { text: 'Jetzt sind es vier Wolken. Pass auf: Manchmal fangen wir mit der größten an!', audio: null },
  sheep_intro3:    { text: 'Jetzt fünf Wolken! Schau ganz genau hin.', audio: null },
  size_up:         { text: 'Von klein nach groß!', audio: null },
  size_down:       { text: 'Von groß nach klein!', audio: null },
  size_hint:       { text: 'Die hier ist als Nächstes dran!', audio: null },
  bird_intro:      { text: 'Tschiep! Ich singe dir eine Melodie vor. Hör gut zu und tippe die Sterne dann genauso an!', audio: null },
  bird_intro2:     { text: 'Jetzt sind es vier Sterne, und die Melodien werden länger!', audio: null },
  bird_intro3:     { text: 'Jetzt fünf Sterne! Du bist ein echter Musikstar!', audio: null },
  melody_listen:   { text: 'Hör gut zu!', audio: null },
  melody_you:      { text: 'Jetzt du!', audio: null },
  melody_again:    { text: 'Hör noch mal zu.', audio: null },
  q_puff_offer:    { text: 'Hallo, ich bin Puff, die kleine Regenwolke. Ich habe meine fünf Regentropfen verloren! Findest du sie auf den Inseln?', audio: null },
  q_puff_remind:   { text: 'Fünf Regentropfen. Sie glitzern blau!', audio: null },
  q_drop_item:     { text: ['Ein Regentropfen!', 'Plitsch!'], audio: null },
  q_puff_done:     { text: 'Juhu, jetzt kann ich wieder die Blumen gießen! Danke! Für dein Einhorn habe ich einen Sternenkranz.', audio: null },
  q_sheep_offer:   { text: 'Meine drei Lämmchen sind über die Regenbogenbrücken davongehüpft! Bringst du sie mir zurück?', audio: null },
  q_sheep_remind:  { text: 'Drei Lämmchen. Lauf einfach zu ihnen hin, dann hüpfen sie nach Hause.', audio: null },
  q_lamb_item:     { text: ['Mäh!', 'Ein Lämmchen!'], audio: null },
  q_sheep_done:    { text: 'Alle Lämmchen sind wieder da! Danke! Hier ist eine Wolkenmütze für dich, ganz flauschig.', audio: null },
  /* --- Kapitel 4: Drachenberg und Sternenfest --- */
  sound_voice:     { text: 'Jetzt hörst du nur noch die Stimme.', audio: null },
  area_berg:       { text: 'Der Drachenberg!', audio: null },
  story_funki4:    { text: 'Wow, du hast alle acht Splitter! Komm mit auf den Drachenberg, da setzen wir den Kristall wieder zusammen. Ich fliege schon mal vor!', audio: null },
  story_funki5:    { text: 'Hier oben auf dem Drachenberg stand der Regenbogenkristall. Das ist sein Kristallstein.', audio: null },
  story_funki6:    { text: 'Setz die Splitter wieder ein! Und danke, dass du mir verziehen hast.', audio: null },
  fin_intro:       { text: 'Tippe die Splitter an, dann fliegen sie an ihren Platz!', audio: null },
  fin_piece:       { text: ['Passt!', 'Klick!', 'Noch einer!', 'Super!'], audio: null },
  fin_hint:        { text: 'Tippe auf einen glitzernden Splitter!', audio: null },
  fin_done:        { text: 'Der Regenbogenkristall ist wieder ganz!', audio: null },
  fin_uni:         { text: 'Schau, der Regenbogen ist zurück! Alle Freunde kommen zum Sternenfest!', audio: null },
  fest_hello:      { text: 'Willkommen beim Sternenfest! Danke, {spieler}! Tippe in den Himmel, dann gibt es Feuerwerk!', audio: null },
  fest_funki:      { text: 'Wir sind jetzt Freunde für immer!', audio: null },
  cert_read:       { text: 'Urkunde! {spieler} hat zusammen mit {name} den Regenbogenkristall gerettet. Danke, {held}!', audio: null },
  fest_free:       { text: 'Du kannst jetzt weiterspielen, alle Glitzersterne sammeln und alle Spiele golden machen!', audio: null },
  /* --- Nebenaufgaben --- */
  q_duck_offer:    { text: 'Quak quak! Oh je, meine drei Küken sind weggelaufen. Hilfst du mir, sie zu finden?', audio: null },
  q_duck_remind:   { text: 'Hast du meine Küken gesehen? Es sind drei!', audio: null },
  q_duck_item:     { text: ['Piep piep!', 'Piep! Da bin ich!'], audio: null },
  q_duck_done:     { text: 'Meine Küken! Danke, {spieler}! Hier sind zwei Zauber-Seerosen. Damit kommst du beim Frosch über jede Lücke.', audio: null },
  q_bee_offer:     { text: 'Summ summ! Ich sammle Honig. Besuchst du mit mir die drei großen Blumen? Genau in der Reihenfolge, die ich dir zeige!', audio: null },
  q_bee_remind:    { text: 'Zuerst die {f1} Blume, dann die {f2}, dann die {f3}!', audio: null },
  q_bee_good:      { text: ['Summ, richtig!', 'Genau die!'], audio: null },
  q_bee_wrong:     { text: 'Hoppla, falsche Blume. Wir fangen nochmal von vorn an!', audio: null },
  q_bee_ready:     { text: 'Super, alle Blumen! Komm zurück zur Biene!', audio: null },
  q_bee_done:      { text: 'So viel Honig! Den schenke ich dir. Bring ihn doch dem Bären Brummi auf dem Hügel, der liebt Honig.', audio: null },
  q_bear_offer:    { text: 'Brumm... ich habe so einen Hunger auf Honig. Bringst du mir welchen?', audio: null },
  q_bear_remind:   { text: 'Brumm... Honig gibt es bei der Biene Summ auf der Blumenwiese.', audio: null },
  q_bear_done:     { text: 'Mmmh, Honig! Danke! Dafür bekommst du drei Zauberfedern. Die helfen dir bei kniffligen Rätseln.', audio: null },
  q_mole_offer:    { text: 'Oh, wer ist da? Ich sehe so schlecht. Der freche Drache hat meine Brille versteckt, in einem Busch hier auf der Blumenwiese!', audio: null },
  q_mole_remind:   { text: 'Meine Brille ist in einem Busch auf der Blumenwiese. Tippe die Büsche an!', audio: null },
  q_mole_found:    { text: 'Da ist ja die Brille! Bring sie zu Moritz.', audio: null },
  q_mole_done:     { text: 'Jetzt sehe ich wieder alles! Danke! Hier, mein Glitzer-Kompass: Auf der Karte siehst du jetzt, wo noch Glitzersterne liegen.', audio: null },
  q_bunny_offer:   { text: 'Hoppel hoppel! Spielst du Verstecken mit mir? Ich verstecke mich in einem Busch, und du findest mich!', audio: null },
  q_bunny_hide:    { text: ['Ich hab mich versteckt! Such mich!', 'Und nochmal! Wo bin ich jetzt?'], audio: null },
  q_bunny_wrong:   { text: ['Hier ist niemand!', 'Leer! Probier einen anderen Busch.'], audio: null },
  q_bunny_found:   { text: ['Gefunden! Hihi!', 'Oh, du hast mich!'], audio: null },
  q_bunny_ready:   { text: 'Dreimal gefunden! Komm, ich hab was für dich.', audio: null },
  q_bunny_done:    { text: 'Du bist super im Suchen! Für dich: ein Blumenkranz fürs Einhorn!', audio: null },
  q_snail_offer:   { text: 'Ich habe einen Brief für den Fuchs. Ich bin aber so langsam... Bringst du ihn hin?', audio: null },
  q_snail_remind:  { text: 'Der Brief ist für den Fuchs auf der Lichtung.', audio: null },
  q_fox_letter:    { text: 'Oh, ein Brief für mich! Danke! Hier ist meine Antwort für Sina.', audio: null },
  q_snail_remind2: { text: 'Bring die Antwort vom Fuchs zu Sina.', audio: null },
  q_snail_done:    { text: 'Eine Antwort vom Fuchs! Danke, {spieler}! Hier sind zwei Zauberlupen für das Schattenspiel.', audio: null },
  q_squirrel_offer:  { text: 'Ich habe meine Nüsse in den Bäumen versteckt und weiß nicht mehr wo! Schüttel die Bäume und sammle sechs Nüsse für mich!', audio: null },
  q_squirrel_remind: { text: 'Schüttel die Bäume hier im Wald. Sechs Nüsse brauche ich!', audio: null },
  q_nut_found:     { text: ['Eine Nuss!', 'Noch eine Nuss!', 'Nuss gefunden!'], audio: null },
  q_squirrel_done: { text: 'Alle sechs Nüsse! Danke! Hier ist eine Eichelmütze für dich. Und jetzt ist mein Laden offen: Für Glitzersterne gibt es tolle Sachen!', audio: null },
  q_ready_generic: { text: 'Geschafft! Bring es zurück!', audio: null },
  flink_choice:    { text: 'Möchtest du rechnen oder in meinen Laden?', audio: null },
  quest_accept:    { text: ['Danke! Du bist toll!', 'Juhu, danke!'], audio: null },
  quest_later:     { text: 'Okay, vielleicht später.', audio: null },
  quest_full:      { text: 'Du hast schon drei Aufträge. Erledige erst einen davon!', audio: null },
  npc_thanks:      { text: ['Danke nochmal!', 'Schön, dich zu sehen!', 'Hallo {spieler}!'], audio: null },
  reward_got:      { text: ['Und dazu zwei Glitzersterne!', 'Zwei Glitzersterne für dich!'], audio: null },
  pack_open:       { text: 'Das ist dein Rucksack. Tippe auf den Schmuck, dann ziehst du ihn an!', audio: null },
  shop_hello:      { text: 'Willkommen in meinem Laden! Tippe auf etwas, das du haben möchtest.', audio: null },
  shop_buy:        { text: ['Danke! Viel Spaß damit!', 'Gute Wahl!'], audio: null },
  shop_poor:       { text: 'Dafür brauchst du noch mehr Glitzersterne. Spiel und sammle weiter!', audio: null },
  shop_owned:      { text: 'Das hast du schon!', audio: null },
  helper_use:      { text: ['Zauberei!', 'Simsalabim!'], audio: null },
  wear_on:         { text: ['Schick!', 'Sieht toll aus!'], audio: null },
  dragon_steal:    { text: 'Hihihi! Den leih ich mir mal aus!', audio: null },
  dragon_oh:       { text: 'Oh nein, der freche Drache hat einen Kristall stibitzt!', audio: null },
  dragon_dropped:  { text: 'Schau, er hat ihn fallen lassen! Hol ihn dir schnell zurück.', audio: null },
  dragon_back:     { text: 'Geschafft! Der Kristall ist wieder im Rucksack. Weißt du was? Der Drache will mit dir Fangen spielen! Er wohnt bei den Felsen ganz im Osten.', audio: null },
  dragon_back2:    { text: ['Geschafft! Der Kristall ist wieder da.', 'Hab ihn! Frecher kleiner Drache.'], audio: null },
  dragon_paint:    { text: ['Hihihi! Jetzt ist alles schön bunt!', 'Hihi, ich hab ein bisschen angemalt!'], audio: null },
  dragon_hide:     { text: ['Hihi, wo bin ich? Such mich!', 'Ich verstecke mich! Findest du mich?'], audio: null },
  dragon_found:    { text: ['Oh, du hast mich gefunden!', 'Hihi, erwischt!'], audio: null },
  dragon_star_tip: { text: 'Oh, du hast mich gefunden! Zur Belohnung zeig ich dir, wo ein Glitzerstern versteckt ist!', audio: null },
  dragon_visit:    { text: 'Hallo! Spielst du mit mir Fangen? Tipp mich an!', audio: null },
  dragon_intro:    { text: 'Hihi! Ich verstecke mich in den Büschen. Tipp mich schnell an, wenn du mich siehst!', audio: null },
  dragon_intro2:   { text: 'Jetzt bin ich schneller! Und Vorsicht, der Hase versteckt sich auch.', audio: null },
  dragon_intro3:   { text: 'Jetzt bin ich superschnell! Fängst du mich trotzdem?', audio: null },
  dragon_caught:   { text: ['Hihi, erwischt!', 'Oh, du bist schnell!', 'Hups!', 'Na warte!'], audio: null },
  dragon_bunny:    { text: ['Hihi, das war der Hase!', 'Das ist doch der Hase!'], audio: null },
  dragon_hint:     { text: 'Schau, da ist der Drache!', audio: null },
  dragon_tap:      { text: ['Hihihi!', 'Fang mich doch!'], audio: null },
  all_done:        { text: 'Hurra! Du hast alle Kristalle gesammelt! Der ganze Zauberwald feiert mit dir!', audio: null }
};

/* ============ 2. KERN ============ */
const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const rnd = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const ease = t => { t = clamp(t, 0, 1); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
const easeOut = t => { t = clamp(t, 0, 1); return 1 - (1 - t) * (1 - t); };
function seeded(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hit = (p, x, y, r) => (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y) <= r * r;

/* ---- Ansicht: virtuelle Höhe 540, Breite je nach Bildschirm ---- */
const VH = 540;
let VW = 960;
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const View = {
  scale: 1, dpr: 1, ox: 0, oy: 0, portrait: false, btn: 100,
  resize() {
    const w = window.innerWidth || 960, h = window.innerHeight || 540;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = Math.round(w * this.dpr); canvas.height = Math.round(h * this.dpr);
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    this.portrait = h > w * 1.05;
    VW = Math.round(VH * clamp(w / h, 4 / 3, 2.4));
    this.scale = Math.min(canvas.width / VW, canvas.height / VH);
    this.ox = (canvas.width - VW * this.scale) / 2; this.oy = (canvas.height - VH * this.scale) / 2;
    // Knopfgröße (Durchmesser in virtuellen Einheiten), damit es auf dem Handy mind. ~74 CSS-Pixel sind
    this.btn = clamp(74 / (this.scale / this.dpr), 96, 150);
    if (Game.scene && Game.scene.resize) Game.scene.resize();
  },
  toV(cx, cy) { return { x: (cx * this.dpr - this.ox) / this.scale, y: (cy * this.dpr - this.oy) / this.scale }; }
};

function goFullscreen() {
  try {
    const el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen) {
      const pr = el.requestFullscreen({ navigationUI: 'hide' });
      if (pr && pr.then) pr.then(() => { try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} }).catch(() => {});
    }
  } catch (e) {}
}

/* ---- Eingabe: Finger, Maus, Tastatur ---- */
const Input = { pointers: new Map(), keys: new Set() };
function initInput() {
  const mk = e => { const v = View.toV(e.clientX, e.clientY); return { id: e.pointerId, x: v.x, y: v.y, sx: v.x, sy: v.y, t0: Game.time, type: e.pointerType || 'mouse' }; };
  canvas.addEventListener('pointerdown', e => {
    e.preventDefault(); Sfx.unlock();
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    const p = mk(e); Input.pointers.set(p.id, p);
    if (p.type === 'touch' && Game.scene !== StartScene) goFullscreen();
    Game.down(p);
  });
  canvas.addEventListener('pointermove', e => {
    const p = Input.pointers.get(e.pointerId); if (!p) return;
    const v = View.toV(e.clientX, e.clientY); p.x = v.x; p.y = v.y; Game.move(p);
  });
  const end = e => { const p = Input.pointers.get(e.pointerId); if (!p) return; const v = View.toV(e.clientX, e.clientY); p.x = v.x; p.y = v.y; Input.pointers.delete(e.pointerId); Game.up(p); };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  window.addEventListener('keydown', e => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) e.preventDefault();
    if (e.repeat) return;
    Sfx.unlock(); Input.keys.add(e.code); Game.key(e.code);
  });
  window.addEventListener('keyup', e => Input.keys.delete(e.code));
  window.addEventListener('blur', () => { Input.keys.clear(); Input.pointers.clear(); });
}

/* ---- Töne (Web Audio, alles erzeugt, keine Dateien) ---- */
const Sfx = {
  ac: null, master: null,
  unlock() {
    try {
      if (!this.ac) {
        const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
        this.ac = new AC(); this.master = this.ac.createGain(); this.master.gain.value = 0.55; this.master.connect(this.ac.destination);
      }
      if (this.ac.state === 'suspended') this.ac.resume();
    } catch (e) { this.ac = null; }
  },
  tone(f, d, o = {}) {
    if (!this.ac) return;
    try {
      const ac = this.ac, t0 = ac.currentTime + (o.at || 0), osc = ac.createOscillator(), g = ac.createGain();
      osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t0);
      if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + d);
      const v = o.vol == null ? 0.25 : o.vol;
      g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(v, t0 + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      osc.connect(g); g.connect(this.master); osc.start(t0); osc.stop(t0 + d + 0.05);
    } catch (e) {}
  },
  noise(d, o = {}) {
    if (!this.ac) return;
    try {
      const ac = this.ac, t0 = ac.currentTime + (o.at || 0), n = Math.floor(ac.sampleRate * d);
      const buf = ac.createBuffer(1, n, ac.sampleRate), ch = buf.getChannelData(0);
      for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const src = ac.createBufferSource(); src.buffer = buf;
      const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = o.freq || 2000;
      const g = ac.createGain(); g.gain.value = o.vol || 0.2;
      src.connect(f); f.connect(g); g.connect(this.master); src.start(t0);
    } catch (e) {}
  },
  play(name, arg) { if ((Save.data && Save.data.sound || 'all') !== 'all') return; const f = SOUNDS[name]; if (f) f(this, arg); }   // Elternmenü: Ton an / nur Stimme / stumm
};
const SOUNDS = {
  tap: s => s.tone(660, 0.08, { type: 'triangle', vol: 0.18 }),
  pop: s => s.tone(420, 0.12, { to: 880, vol: 0.25 }),
  squeak: s => { s.tone(900, 0.12, { to: 1500, type: 'square', vol: 0.07 }); s.tone(1500, 0.1, { to: 1000, type: 'square', vol: 0.06, at: 0.12 }); },
  rustle: s => { s.noise(0.25, { vol: 0.25, freq: 3000 }); s.noise(0.2, { vol: 0.18, freq: 4500, at: 0.12 }); },
  flutter: s => { for (let i = 0; i < 4; i++) s.tone(1200 + i * 150, 0.05, { vol: 0.08, at: i * 0.06 }); },
  plop: s => s.tone(500, 0.15, { to: 180, vol: 0.3 }),
  splash: s => { s.noise(0.35, { vol: 0.35, freq: 1200 }); s.tone(300, 0.25, { to: 120, vol: 0.2 }); },
  good: s => [523, 659, 784].forEach((f, i) => s.tone(f, 0.16, { type: 'triangle', vol: 0.22, at: i * 0.09 })),
  wrong: s => { s.tone(330, 0.16, { vol: 0.18 }); s.tone(262, 0.22, { vol: 0.18, at: 0.14 }); },
  win: s => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => s.tone(f, 0.2, { type: 'triangle', vol: 0.24, at: i * 0.12 })),
  fanfare: s => { [523, 523, 659, 784, 659, 784, 1047, 1047, 1319].forEach((f, i) => s.tone(f, 0.24, { type: 'triangle', vol: 0.24, at: i * 0.15 })); [262, 330, 392].forEach(f => s.tone(f, 1.4, { vol: 0.1, at: 0.9 })); },
  jump: s => s.tone(380, 0.18, { to: 760, vol: 0.2 }),
  land: s => s.tone(160, 0.06, { vol: 0.15 }),
  star: s => { s.tone(1047, 0.1, { type: 'triangle', vol: 0.2 }); s.tone(1568, 0.18, { type: 'triangle', vol: 0.2, at: 0.08 }); },
  crystal: s => [784, 988, 1175, 1568].forEach((f, i) => s.tone(f, 0.25, { vol: 0.18, at: i * 0.07 })),
  giggle: s => { for (let i = 0; i < 6; i++) s.tone(700 + (i % 2) * 220 + i * 30, 0.07, { type: 'square', vol: 0.06, at: i * 0.085 }); },
  hint: s => { s.tone(880, 0.12, { vol: 0.15 }); s.tone(1175, 0.2, { vol: 0.15, at: 0.12 }); },
  whoosh: s => s.noise(0.4, { vol: 0.22, freq: 800 }),
  hop: s => s.tone(520, 0.1, { to: 700, vol: 0.12 }),
  babble: s => { for (let i = 0; i < 5; i++) s.tone(400 + Math.random() * 300, 0.09, { type: 'triangle', vol: 0.12, at: i * 0.11 }); },
  quak: s => { s.tone(220, 0.12, { to: 160, type: 'sawtooth', vol: 0.1 }); s.tone(240, 0.14, { to: 150, type: 'sawtooth', vol: 0.1, at: 0.16 }); },
  huhu: s => { s.tone(392, 0.2, { vol: 0.2 }); s.tone(330, 0.35, { vol: 0.2, at: 0.24 }); },
  note: (s, f) => s.tone(f, 0.25, { type: 'triangle', vol: 0.22 })
};

/* ---- Sprache: Aufnahme (falls eingetragen) -> Computerstimme -> freundliches Gebrabbel ---- */
const Voice = {
  synth: null, voice: null, hasList: false, last: null, audioEl: null,
  init() {
    try {
      this.synth = window.speechSynthesis || null; if (!this.synth) return;
      const choose = () => {
        try {
          const vs = this.synth.getVoices() || []; this.hasList = vs.length > 0;
          this.voice = vs.find(v => /^de[-_]DE/i.test(v.lang) && v.localService) || vs.find(v => /^de[-_]DE/i.test(v.lang)) || vs.find(v => /^de/i.test(v.lang)) || null;
        } catch (e) {}
      };
      choose();
      if (this.synth.addEventListener) this.synth.addEventListener('voiceschanged', choose); else this.synth.onvoiceschanged = choose;
    } catch (e) { this.synth = null; }
  },
  say(key, o = {}) {
    const e = SPEECH[key]; if (!e) return;
    this.last = key;
    if (!CONFIG.speech.enabled || Save.data.sound === 'off') return;
    let txt = Array.isArray(e.text) ? pick(e.text) : e.text;
    const pl = Save.data.player, vars = Object.assign({ name: Save.data.name || 'dein Einhorn', spieler: (pl && pl.name) || 'du' }, o.vars || {});
    txt = txt.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
    if (e.audio) {
      try {
        this.stop(); const a = new Audio(e.audio); this.audioEl = a;
        const pr = a.play(); if (pr && pr.catch) pr.catch(() => this.tts(txt, o));
        return;
      } catch (err) {}
    }
    this.tts(txt, o);
  },
  tts(txt, o) {
    try {
      // Keine Sprachausgabe oder sicher keine deutsche Stimme: Gebrabbel statt falscher Aussprache
      if (!this.synth || typeof SpeechSynthesisUtterance === 'undefined' || (this.hasList && !this.voice)) { Sfx.play('babble'); return; }
      if (!o.queue) this.synth.cancel();
      const u = new SpeechSynthesisUtterance(txt);
      u.lang = CONFIG.speech.lang; if (this.voice) u.voice = this.voice;
      u.rate = CONFIG.speech.rate; u.pitch = o.pitch || CONFIG.speech.pitch;
      this.synth.speak(u);
    } catch (e) { Sfx.play('babble'); }
  },
  busy() { try { return !!(this.synth && this.synth.speaking); } catch (e) { return false; } },
  stop() { try { if (this.synth) this.synth.cancel(); if (this.audioEl) { this.audioEl.pause(); this.audioEl = null; } } catch (e) {} }
};

/* ---- Spielstand ---- */
const Save = {
  data: null,
  fresh() { return { name: null, nameId: null, crystals: { owl: false, fox: false, frog: false, dragon: false, snail: false, squirrel: false, mouse: false, hedgehog: false, sheep: false, bird: false }, level: { owl: 0, fox: 0, frog: 0, dragon: 0, snail: 0, squirrel: 0, mouse: 0, hedgehog: 0, sheep: 0, bird: 0 }, player: null, learn: true, partyN: 0, goldN: 0, story: 0, quests: {}, inv: {}, helpers: { feather: 0, lens: 0, lily: 0, slow: 0, eye: 0 }, wings: false, cos: [], wear: { t: null, uni: null }, wallet: 0, tools: {}, shopOpen: false, goldParty: false, party4: false, goldParty4: false, dragonFriend: false, stars: [], rideTold: false, worldV: 0, dragon: { state: 'waiting', x: 0, y: 0, who: null }, celebrated: false, pos: null }; },
  load() {
    this.data = this.fresh();
    try {
      const raw = window.localStorage.getItem(CONFIG.saveKey);
      if (raw) { const d = JSON.parse(raw); if (d && typeof d === 'object') { Object.assign(this.data, d); this.data.crystals = Object.assign(this.fresh().crystals, d.crystals || {}); this.data.dragon = Object.assign(this.fresh().dragon, d.dragon || {}); this.data.level = Object.assign(this.fresh().level, d.level || {}); for (const k in this.data.crystals) if (this.data.crystals[k] && !this.data.level[k]) this.data.level[k] = 1; if (!Array.isArray(this.data.stars)) this.data.stars = []; if (d.party4 && !d.partyN) this.data.partyN = 4; if (d.wallet == null) this.data.wallet = this.data.stars.length; this.data.helpers = Object.assign(this.fresh().helpers, d.helpers || {}); if (d.goldParty4 && !d.goldN) this.data.goldN = 4; } }
    } catch (e) {}
  },
  store() { try { window.localStorage.setItem(CONFIG.saveKey, JSON.stringify(this.data)); } catch (e) {} },
  // Nur den Fortschritt löschen (Kristalle, Stufen, Drache); der Name des Einhorns bleibt
  resetProgress() { const f = this.fresh(); f.name = this.data.name; f.nameId = this.data.nameId; f.player = this.data.player; f.learn = this.data.learn; f.cos = this.data.cos; f.wear = this.data.wear; f.wings = this.data.wings; f.sound = this.data.sound; this.data = f; this.store(); },
  reset() { const snd = this.data && this.data.sound; this.data = this.fresh(); if (snd) this.data.sound = snd; try { window.localStorage.removeItem(CONFIG.saveKey); } catch (e) {} }
};

/* ---- Effekte: Glitzer, Konfetti ---- */
const PASTEL = ['#ff9ecb', '#ffd27f', '#9be7c4', '#9ecbff', '#c9a5ff', '#fff38a'];
class Fx {
  constructor() { this.p = []; }
  add(o) { if (this.p.length > 400) return; this.p.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, g: 0, life: 1, max: 1, size: 8, color: '#fff', shape: 'star', rot: 0, vr: 0 }, o, { max: o.life || 1 })); }
  burst(x, y, n, o = {}) {
    for (let i = 0; i < n; i++) {
      const a = rnd(TAU), sp = rnd(o.sp0 || 60, o.sp1 || 260);
      this.add({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.up || 0), g: o.g == null ? 300 : o.g, life: rnd(0.5, o.life || 1.1), size: rnd(o.s0 || 5, o.s1 || 12), color: o.color || pick(PASTEL), shape: o.shape || 'star', rot: rnd(TAU), vr: rnd(-6, 6) });
    }
  }
  confetti(w, n = 60) {
    for (let i = 0; i < n; i++) this.add({ x: rnd(w), y: rnd(-80, -10), vx: rnd(-40, 40), vy: rnd(120, 300), g: 60, life: rnd(2, 3.4), size: rnd(7, 13), color: pick(PASTEL), shape: pick(['rect', 'star', 'dot', 'heart']), rot: rnd(TAU), vr: rnd(-8, 8) });
  }
  update(dt) {
    const p = this.p;
    for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; q.life -= dt; if (q.life <= 0) { p[i] = p[p.length - 1]; p.pop(); continue; } q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.rot += q.vr * dt; }
  }
  draw(c) {
    for (const q of this.p) {
      c.save(); c.globalAlpha = clamp(q.life / q.max * 1.6, 0, 1); c.translate(q.x, q.y); c.rotate(q.rot); c.fillStyle = q.color;
      if (q.shape === 'star') { sparklePath(c, 0, 0, q.size); c.fill(); }
      else if (q.shape === 'rect') c.fillRect(-q.size / 2, -q.size / 3, q.size, q.size * 0.66);
      else if (q.shape === 'heart') { heartPath(c, 0, 0, q.size); c.fill(); }
      else { c.beginPath(); c.arc(0, 0, q.size / 2, 0, TAU); c.fill(); }
      c.restore();
    }
  }
}
const ScreenFx = new Fx();

/* ---- Szenen-Verwaltung: Game.go(Szene, Optionen) blendet weich um ---- */
const Game = {
  scene: null, pending: null, fade: 1, time: 0,
  go(scene, opts) { if (this.pending) return; this.pending = { scene, opts: opts || {} }; },
  update(dt) {
    this.time += dt;
    if (this.pending) {
      this.fade += dt * 4;
      if (this.fade >= 1) { this.fade = 1; const p = this.pending; this.pending = null; if (this.scene && this.scene.leave) this.scene.leave(); this.scene = p.scene; this.scene.enter(p.opts); }
    } else if (this.fade > 0) this.fade = Math.max(0, this.fade - dt * 3);
    if (this.scene) this.scene.update(dt);
    ScreenFx.update(dt);
  },
  draw(c) {
    if (this.scene) this.scene.draw(c);
    ScreenFx.draw(c);
    if (this.fade > 0) { c.globalAlpha = this.fade; c.fillStyle = '#fff8ee'; c.fillRect(0, 0, VW, VH); c.globalAlpha = 1; }
  },
  ok() { return !this.pending && !View.portrait && this.scene; },
  down(p) { if (this.ok() && this.scene.down) this.scene.down(p); },
  move(p) { if (this.ok() && this.scene.move) this.scene.move(p); },
  up(p) { if (this.ok() && this.scene.up) this.scene.up(p); },
  key(k) { if (this.ok() && this.scene.key) this.scene.key(k); }
};
