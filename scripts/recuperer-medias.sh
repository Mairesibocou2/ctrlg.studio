#!/usr/bin/env bash
# Télécharge toutes les images et vidéos du site depuis Framer (framerusercontent.com)
# vers le dossier assets/. Les fichiers déjà présents sont ignorés.
# Les vidéos de plus de 15 Mo sont recompressées si ffmpeg est installé.
# Utilisation (depuis la racine du site) :  bash scripts/recuperer-medias.sh
set -u
cd "$(dirname "$0")/.."

LISTE="scripts/medias.txt"
total=0; ok=0; deja=0; echec=0

while read -r chemin url; do
  [ -z "${chemin:-}" ] && continue
  total=$((total + 1))
  if [ -s "$chemin" ]; then deja=$((deja + 1)); continue; fi
  mkdir -p "$(dirname "$chemin")"
  if curl -fsSL --retry 3 --retry-delay 2 -o "$chemin.part" "$url"; then
    mv "$chemin.part" "$chemin"; ok=$((ok + 1)); echo "✓ $chemin"
  else
    rm -f "$chemin.part"; echec=$((echec + 1)); echo "✗ ÉCHEC : $url"
  fi
done < "$LISTE"

# Compression des vidéos trop lourdes (plus légères à charger, même rendu)
if command -v ffmpeg >/dev/null 2>&1; then
  for v in assets/video/*.mp4; do
    [ -f "$v" ] || continue
    taille=$(wc -c < "$v")
    if [ "$taille" -gt 15000000 ]; then
      echo "Compression de $v ($((taille / 1000000)) Mo)…"
      ffmpeg -loglevel error -y -i "$v" -vf "scale='min(1920,iw)':-2" \
        -c:v libx264 -preset veryfast -crf 26 -pix_fmt yuv420p -an -movflags +faststart "$v.tmp.mp4" \
        && mv "$v.tmp.mp4" "$v" && echo "  → $(( $(wc -c < "$v") / 1000000 )) Mo"
    fi
  done
fi

echo ""
echo "Médias : $total au total — $ok téléchargés, $deja déjà présents, $echec en échec."
[ "$echec" -eq 0 ] || exit 1
