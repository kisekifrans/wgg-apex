"""One-off: turn near-black backdrop pixels transparent in public/logo/wgg.png."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
LOGO = ROOT / "public" / "logo" / "wgg.png"


def main() -> None:
    img = Image.open(LOGO).convert("RGBA")
    pixels = img.load()
    w, h = img.size
    changed = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            # Remove flat black / near-black backdrop only
            if r < 28 and g < 28 and b < 28 and max(r, g, b) - min(r, g, b) < 12:
                pixels[x, y] = (r, g, b, 0)
                changed += 1
    img.save(LOGO, optimize=True)
    print(f"Updated {LOGO} ({changed} pixels made transparent)")


if __name__ == "__main__":
    main()
