#!/usr/bin/env python3
"""Generate the PWA icon set in public/icons/ from the 512px master.

The maskable variants pad the artwork to ~80% of the canvas on the court-dark
background, so Android's circular/squircle masks never clip the ball.

    pip install Pillow && python3 make_icons.py
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).parent
MASTER = ROOT / "icon-512.png"
OUT = ROOT / "public" / "icons"

COURT_BG = (15, 26, 11, 255)  # --court #0f1a0b
MASKABLE_SAFE = 0.8  # artwork occupies the inner 80% (Android safe zone)


def main() -> None:
    if not MASTER.exists():
        raise SystemExit(f"missing master icon: {MASTER}")

    OUT.mkdir(parents=True, exist_ok=True)
    master = Image.open(MASTER).convert("RGBA")

    # Plain "any" icons + favicons + apple-touch icon.
    for size, name in [
        (512, "icon-512.png"),
        (192, "icon-192.png"),
        (180, "apple-touch-icon.png"),
        (32, "favicon-32.png"),
        (16, "favicon-16.png"),
    ]:
        master.resize((size, size), Image.LANCZOS).save(OUT / name)
        print("wrote", name)

    # Maskable icons: artwork inset on an opaque background.
    for size in (192, 512):
        canvas = Image.new("RGBA", (size, size), COURT_BG)
        inner = int(size * MASKABLE_SAFE)
        art = master.resize((inner, inner), Image.LANCZOS)
        offset = (size - inner) // 2
        canvas.paste(art, (offset, offset), art)
        name = f"maskable-{size}.png"
        canvas.save(OUT / name)
        print("wrote", name)


if __name__ == "__main__":
    main()
