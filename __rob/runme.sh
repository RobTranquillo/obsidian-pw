#!/bin/bash
set -e

# Obsidian-ordner definieren
TARGET_DIR="/Users/rob/Documents/Obsidian/.obsidian/plugins/proletarian-wizard-dev"
DIST_DIR="$(pwd dirname "$0")"/dist

cd "$(dirname "$0")"/..

# Prüfen, ob main.js existiert
if [ ! -f "main.js" ]; then
  echo "main.js nicht gefunden. Führe npm install aus..."
  npm install
fi

# Paket bauen
npm run build

# Prüfen, ob main.js nach dem Build existiert
if [ ! -f "main.js" ]; then
  echo "Fehler: main.js wurde nicht erstellt."
  exit 1
fi


# copy to /dist
mkdir -p "$DIST_DIR"
cp main.js "$DIST_DIR"

# copy to Obsidian
mkdir -p "$TARGET_DIR"
cp "$DIST_DIR"/* "$TARGET_DIR/"
echo "DEV Plugin wurde erfolgreich in Obsidian kopiert."