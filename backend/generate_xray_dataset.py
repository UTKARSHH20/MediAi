"""
Synthetic Chest X-Ray Dataset Generator
Generates realistic-looking grayscale X-ray images using PIL.
  NORMAL    → dark background, subtle oval lung fields, fine texture
  PNEUMONIA → same base but with bright white consolidation patches
"""

import os
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
import random

random.seed(42)
np.random.seed(42)

# ── Config ────────────────────────────────────────────────────────────────────
IMG_SIZE   = (224, 224)
BASE_DIR   = "data/chest_xray"
SPLITS = {
    "train": {"NORMAL": 100, "PNEUMONIA": 100},
    "test":  {"NORMAL":  20, "PNEUMONIA":  20},
    "val":   {"NORMAL":  10, "PNEUMONIA":  10},
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def make_lung_base(size=(224, 224)) -> np.ndarray:
    """Dark X-ray background with soft vignette and rib-like noise."""
    W, H = size
    # Start very dark (like an exposed X-ray plate)
    img = np.full((H, W), 18, dtype=np.float32)

    # Vignette — brighter toward centre
    cx, cy = W / 2, H / 2
    for y in range(H):
        for x in range(W):
            d = np.sqrt(((x - cx) / cx) ** 2 + ((y - cy) / cy) ** 2)
            img[y, x] += max(0, 1 - d) * 35

    # Fine Gaussian noise (film grain)
    img += np.random.normal(0, 4, (H, W)).astype(np.float32)
    return img


def draw_lung_fields(arr: np.ndarray, size=(224, 224)) -> np.ndarray:
    """Draw two soft oval lung fields (slightly brighter than background)."""
    W, H = size
    arr = arr.copy()
    pil = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), mode="L")
    draw = ImageDraw.Draw(pil)

    for side in [-1, 1]:            # left / right lung
        cx = W // 2 + side * W // 5
        cy = H // 2 - H // 12
        rx, ry = W // 6, H // 3
        # Filled ellipse with slightly elevated brightness
        draw.ellipse(
            [cx - rx, cy - ry, cx + rx, cy + ry],
            fill=None, outline=None
        )
        # Simulate lung brightness by adding a gradient blob
        for r in range(min(rx, ry), 0, -3):
            alpha = int(12 * (r / min(rx, ry)))
            draw.ellipse(
                [cx - r * rx // min(rx, ry),
                 cy - r * ry // min(rx, ry),
                 cx + r * rx // min(rx, ry),
                 cy + r * ry // min(rx, ry)],
                fill=alpha
            )

    arr = np.array(pil).astype(np.float32)
    return arr


def add_vessels(arr: np.ndarray, size=(224, 224), n=18) -> np.ndarray:
    """Add thin branching lines to mimic pulmonary vasculature."""
    W, H = size
    pil = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), mode="L")
    draw = ImageDraw.Draw(pil)
    for _ in range(n):
        x0 = random.randint(W // 4, 3 * W // 4)
        y0 = random.randint(H // 4, 3 * H // 4)
        angle = random.uniform(0, 2 * np.pi)
        length = random.randint(10, 35)
        x1 = int(x0 + np.cos(angle) * length)
        y1 = int(y0 + np.sin(angle) * length)
        brightness = random.randint(45, 70)
        draw.line([(x0, y0), (x1, y1)], fill=brightness, width=1)
    return np.array(pil).astype(np.float32)


def add_rib_shadows(arr: np.ndarray, size=(224, 224)) -> np.ndarray:
    """Add faint horizontal bands to mimic rib cage shadows."""
    W, H = size
    arr = arr.copy()
    n_ribs = random.randint(5, 8)
    for i in range(n_ribs):
        y = int(H * 0.25 + i * H * 0.09 + random.uniform(-5, 5))
        thickness = random.randint(3, 6)
        intensity  = random.uniform(6, 14)
        for dy in range(-thickness, thickness + 1):
            yy = y + dy
            if 0 <= yy < H:
                arr[yy, :] += intensity * (1 - abs(dy) / thickness)
    return arr


def make_normal_xray(size=(224, 224)) -> Image.Image:
    arr = make_lung_base(size)
    arr = draw_lung_fields(arr, size)
    arr = add_vessels(arr, size)
    arr = add_rib_shadows(arr, size)
    # Slight global brightness jitter
    arr += random.uniform(-5, 5)
    arr = np.clip(arr, 0, 255).astype(np.uint8)
    pil = Image.fromarray(arr, mode="L")
    pil = pil.filter(ImageFilter.GaussianBlur(radius=0.8))
    return pil


def add_consolidation(arr: np.ndarray, size=(224, 224)) -> np.ndarray:
    """Add 1–3 bright irregular blobs to one lung field (pneumonia consolidation)."""
    W, H = size
    arr = arr.copy()
    pil = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), mode="L")
    draw = ImageDraw.Draw(pil)

    side = random.choice([-1, 1])   # which lung is affected
    n_patches = random.randint(1, 3)
    for _ in range(n_patches):
        cx = W // 2 + side * random.randint(W // 8, W // 4)
        cy = random.randint(H // 3, 2 * H // 3)
        rx = random.randint(14, 32)
        ry = random.randint(10, 26)
        # Bright core
        for r in range(max(rx, ry), 0, -2):
            alpha = int(160 * (r / max(rx, ry)) ** 0.6 + 80)
            draw.ellipse(
                [cx - r * rx // max(rx, ry),
                 cy - r * ry // max(rx, ry),
                 cx + r * rx // max(rx, ry),
                 cy + r * ry // max(rx, ry)],
                fill=min(alpha, 230)
            )
    arr = np.array(pil).astype(np.float32)
    # Add noise inside the affected area for realism
    arr += np.random.normal(0, 6, arr.shape).astype(np.float32)
    return arr


def make_pneumonia_xray(size=(224, 224)) -> Image.Image:
    arr = make_lung_base(size)
    arr = draw_lung_fields(arr, size)
    arr = add_vessels(arr, size, n=10)
    arr = add_rib_shadows(arr, size)
    arr = add_consolidation(arr, size)
    arr += random.uniform(-5, 5)
    arr = np.clip(arr, 0, 255).astype(np.uint8)
    pil = Image.fromarray(arr, mode="L")
    pil = pil.filter(ImageFilter.GaussianBlur(radius=0.6))
    return pil


# ── Main ──────────────────────────────────────────────────────────────────────

def generate_dataset():
    print("=" * 60)
    print("  SYNTHETIC CHEST X-RAY DATASET GENERATOR")
    print("=" * 60)

    total_created = 0
    summary = {}

    for split, classes in SPLITS.items():
        summary[split] = {}
        for cls, count in classes.items():
            folder = os.path.join(BASE_DIR, split, cls)
            os.makedirs(folder, exist_ok=True)
            print(f"\n  Generating {count} {cls} images -> {split}/")

            gen_fn = make_normal_xray if cls == "NORMAL" else make_pneumonia_xray
            for i in range(count):
                img = gen_fn(IMG_SIZE)
                fname = os.path.join(folder, f"{cls.lower()}_{split}_{i+1:04d}.jpeg")
                img.save(fname, "JPEG", quality=90)
                if (i + 1) % 25 == 0 or i == count - 1:
                    print(f"    [{i+1}/{count}] saved", flush=True)

            summary[split][cls] = count
            total_created += count

    print("\n" + "=" * 60)
    print("  FINAL STRUCTURE VERIFICATION")
    print("=" * 60)
    for split, classes in summary.items():
        for cls, count in classes.items():
            folder = os.path.join(BASE_DIR, split, cls)
            actual = len([f for f in os.listdir(folder) if f.endswith(".jpeg")])
            status = "OK" if actual == count else "FAIL"
            print(f"  [{status}] {split:5s}/{cls:10s} -> {actual:4d} images  ({folder})")

    print(f"\n  Total images created: {total_created}")
    print("  Dataset ready!")


if __name__ == "__main__":
    generate_dataset()
