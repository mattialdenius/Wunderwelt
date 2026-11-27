# Zauberwald

Ein Handyspiel für Kinder ab etwa 5 Jahren: eine Fabelwelt mit Einhorn, Rätseln und einer kleinen Geschichte. Es läuft komplett offline im Browser (Chrome auf Android, Querformat).

- **Spielen:** `index.html` öffnen, über GitHub Pages: https://mattialdenius.github.io/Wunderwelt/
- **Eltern-Menü:** drei blasse Punkte unten rechts (Startbildschirm) bzw. unten links (Welt) 1,5 Sekunden gedrückt halten.

## Aufbau

- `index.html` – das fertige Spiel in einer Datei (wird gebaut, nicht von Hand ändern)
- `src/` – Quelltexte, werden in dieser Reihenfolge zusammengesetzt:
  - `0_head.html` Seitenkopf
  - `1_core.js` Einstellungen (`CONFIG`), alle Sprachtexte (`SPEECH`), Eingabe, Töne, Sprache, Spielstand
  - `2_art.js` alle Zeichnungen (Figuren, Bildwörter, Gegenstände, Schmuck)
  - `3_scenes.js` Startbildschirm mit Eltern-Menü, Figur gestalten, Einhorn benennen
  - `4_world.js` die Welt (Karte, Wegsuche, Reiten, Drache)
  - `4b_story.js` Geschichte, Gespräche, Nebenaufgaben (`QUESTS`), Rucksack, Laden
  - `5_minigames.js` die sechs Minispiele mit je drei Stufen, Zauberhelfer
  - `6_boot.js` Start
- `tools/build.sh` – baut `index.html` neu (braucht Node.js für die Syntaxprüfung)
- `tests/` – automatische Durchspiel-Tests (Python + Playwright + Chrome); die Pfade darin zeigen auf die Arbeitsumgebung und müssen bei lokaler Nutzung angepasst werden
