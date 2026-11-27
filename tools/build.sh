#!/bin/sh
# Baut die spielbare index.html aus den Quelltexten in src/ (Reihenfolge ist wichtig).
cd "$(dirname "$0")/.."
FILES="src/1_core.js src/2_art.js src/3_scenes.js src/4_world.js src/4b_story.js src/5_minigames.js src/6_boot.js"
{ cat src/0_head.html $FILES; printf '</script>\n</body>\n</html>\n'; } > index.html
cat $FILES > /tmp/zauberwald_all.js && node --check /tmp/zauberwald_all.js && wc -c index.html
