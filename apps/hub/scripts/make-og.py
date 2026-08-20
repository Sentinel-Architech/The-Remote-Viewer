#!/usr/bin/env python3
"""Custom share cards for The Remote Viewer — charcoal / ash silver, no neon."""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path("/workspace/public")
ROOT.mkdir(parents=True, exist_ok=True)


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BG = (8, 9, 11)
SILVER = (197, 207, 200)
INK = (236, 236, 232)
MUTED = (138, 141, 136)


def ripple_field(w: int, h: int, cx: float, cy: float, rings: int = 22) -> Image.Image:
    img = Image.new("RGB", (w, h), BG)
    px = img.load()
    aspect = w / h
    for y in range(h):
        for x in range(w):
            nx = (x - cx) / w
            ny = (y - cy) / h
            # slight vortex swirl
            ang = math.atan2(ny, nx)
            r = math.hypot(nx * aspect, ny)
            swirl = ang + r * 3.4
            rr = r + 0.018 * math.sin(swirl * 6.0)
            wave = 0.5 + 0.5 * math.sin(rr * rings * math.pi)
            fall = math.exp(-rr * 3.2)
            v = wave * fall
            # crest highlight
            crest = max(0.0, 1.0 - abs(wave - 0.92) * 14) * fall
            g = int(8 + v * 38 + crest * 70)
            b = int(11 + v * 36 + crest * 62)
            rch = int(8 + v * 34 + crest * 64)
            px[x, y] = (min(255, rch), min(255, g), min(255, b))
    # soft grain
    img = img.filter(ImageFilter.GaussianBlur(radius=0.6))
    return img


def draw_centered(draw: ImageDraw.ImageDraw, text: str, y: int, fnt, fill, width: int) -> None:
    bbox = draw.textbbox((0, 0), text, font=fnt)
    tw = bbox[2] - bbox[0]
    draw.text(((width - tw) / 2, y), text, font=fnt, fill=fill)


def make_og() -> None:
    w, h = 1200, 630
    img = ripple_field(w, h, w * 0.5, h * 0.52, rings=20)
    draw = ImageDraw.Draw(img)
    # center watchful point
    cx, cy = w // 2, int(h * 0.52)
    draw.ellipse((cx - 7, cy - 7, cx + 7, cy + 7), fill=INK)
    draw.ellipse((cx - 18, cy - 18, cx + 18, cy + 18), outline=SILVER, width=1)

    title_f = font(SERIF, 54)
    small_f = font(SANS, 18)
    # Title sits in true center with comfortable margins
    draw_centered(draw, "THE REMOTE VIEWER", 168, title_f, INK, w)
    draw_centered(draw, "SENTINEL OS  ·  NATIVE NODE", 248, small_f, MUTED, w)

    img.save(ROOT / "og.jpg", "JPEG", quality=88, optimize=True)
    print("wrote", ROOT / "og.jpg", img.size)


def make_banner() -> None:
    w, h = 1200, 264
    img = ripple_field(w, h, w * 0.72, h * 0.42, rings=16)
    draw = ImageDraw.Draw(img)
    title_f = font(SERIF, 36)
    small_f = font(SANS, 16)
    # lockup: left half, above midline, not bottom fifth
    draw.text((48, 58), "THE REMOTE VIEWER", font=title_f, fill=INK)
    draw.text((50, 112), "Sentinel OS  ·  native node", font=small_f, fill=MUTED)
    img.save(ROOT / "x-banner.jpg", "JPEG", quality=88, optimize=True)
    print("wrote", ROOT / "x-banner.jpg", img.size)


if __name__ == "__main__":
    make_og()
    make_banner()
