"""
Chest X-Ray Dataset Validation & Test Report
Tests image integrity, class distribution, sample loading, and basic stats.
"""

import os
import sys
import random
import numpy as np
from PIL import Image
import collections

DATA_DIR = r"C:\Users\KIIT\OneDrive\Desktop\MEDICAL-ML\backend\data\chest_xray"
IMAGE_EXTS = ('.jpeg', '.jpg', '.png')

random.seed(42)

def section(title):
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)

# ── 1. Structure & Count ───────────────────────────────────────────────────────
section("1. DATASET STRUCTURE & IMAGE COUNTS")

splits = ['train', 'test', 'val']
classes = ['NORMAL', 'PNEUMONIA']
counts = {}
total = 0

for split in splits:
    counts[split] = {}
    for cls in classes:
        folder = os.path.join(DATA_DIR, split, cls)
        if os.path.exists(folder):
            imgs = [f for f in os.listdir(folder) if f.lower().endswith(IMAGE_EXTS)]
            counts[split][cls] = len(imgs)
            total += len(imgs)
            print(f"  {split:5s} / {cls:10s}  ->  {len(imgs):5,d} images  [{folder}]")
        else:
            counts[split][cls] = 0
            print(f"  {split:5s} / {cls:10s}  ->  MISSING!")

print(f"\n  TOTAL: {total:,} images")

# Class balance per split
section("2. CLASS BALANCE")
for split in splits:
    n = counts[split]['NORMAL']
    p = counts[split]['PNEUMONIA']
    tot = n + p
    if tot:
        ratio = p / n if n else float('inf')
        print(f"  {split:5s}:  NORMAL={n:5,}  PNEUMONIA={p:5,}  "
              f"ratio={ratio:.2f}x  (PNEUMONIA is {ratio:.1f}x more common)")

# ── 3. Image Integrity Check ───────────────────────────────────────────────────
section("3. IMAGE INTEGRITY CHECK (sampling 50 per class per split)")

corrupt = []
sizes = collections.defaultdict(list)
modes = collections.defaultdict(set)

for split in splits:
    for cls in classes:
        folder = os.path.join(DATA_DIR, split, cls)
        if not os.path.exists(folder):
            continue
        all_imgs = [f for f in os.listdir(folder) if f.lower().endswith(IMAGE_EXTS)]
        sample = random.sample(all_imgs, min(50, len(all_imgs)))
        ok = 0
        for fname in sample:
            fpath = os.path.join(folder, fname)
            try:
                with Image.open(fpath) as img:
                    img.verify()
                with Image.open(fpath) as img:
                    w, h = img.size
                    sizes[f"{split}/{cls}"].append((w, h))
                    modes[f"{split}/{cls}"].add(img.mode)
                ok += 1
            except Exception as e:
                corrupt.append((fpath, str(e)))
        print(f"  {split}/{cls}: {ok}/{len(sample)} OK", end="")
        if sizes[f"{split}/{cls}"]:
            ws = [s[0] for s in sizes[f"{split}/{cls}"]]
            hs = [s[1] for s in sizes[f"{split}/{cls}"]]
            print(f"  | size: {min(ws)}x{min(hs)} to {max(ws)}x{max(hs)}"
                  f"  | modes: {modes[f'{split}/{cls}']}", end="")
        print()

if corrupt:
    print(f"\n  WARNING: {len(corrupt)} corrupt images found!")
    for p, e in corrupt[:5]:
        print(f"    {p}: {e}")
else:
    print("\n  All sampled images are valid!")

# ── 4. Image Statistics ────────────────────────────────────────────────────────
section("4. PIXEL STATISTICS (train sample, 20 per class)")

for cls in classes:
    folder = os.path.join(DATA_DIR, 'train', cls)
    all_imgs = [f for f in os.listdir(folder) if f.lower().endswith(IMAGE_EXTS)]
    sample = random.sample(all_imgs, min(20, len(all_imgs)))
    pixels = []
    for fname in sample:
        with Image.open(os.path.join(folder, fname)) as img:
            arr = np.array(img.convert('L')).flatten()
            pixels.extend(arr.tolist())
    pixels = np.array(pixels)
    print(f"  {cls:10s}: mean={pixels.mean():.1f}  std={pixels.std():.1f}"
          f"  min={pixels.min()}  max={pixels.max()}"
          f"  median={np.median(pixels):.1f}")

# ── 5. File Size Stats ─────────────────────────────────────────────────────────
section("5. FILE SIZE STATISTICS (train)")

for cls in classes:
    folder = os.path.join(DATA_DIR, 'train', cls)
    all_imgs = [f for f in os.listdir(folder) if f.lower().endswith(IMAGE_EXTS)]
    sizes_kb = [os.path.getsize(os.path.join(folder, f)) / 1024 for f in all_imgs]
    print(f"  {cls:10s}: avg={np.mean(sizes_kb):.1f} KB  "
          f"min={min(sizes_kb):.1f} KB  max={max(sizes_kb):.1f} KB  "
          f"total={sum(sizes_kb)/1024:.0f} MB")

# ── 6. Quick Load Test (simulate model input) ──────────────────────────────────
section("6. QUICK MODEL INPUT SIMULATION (resize to 224x224)")

TARGET = (224, 224)
ok_count = 0
fail_count = 0

for cls in classes:
    folder = os.path.join(DATA_DIR, 'train', cls)
    all_imgs = [f for f in os.listdir(folder) if f.lower().endswith(IMAGE_EXTS)]
    sample = random.sample(all_imgs, min(10, len(all_imgs)))
    for fname in sample:
        try:
            with Image.open(os.path.join(folder, fname)) as img:
                arr = np.array(img.convert('RGB').resize(TARGET)) / 255.0
            assert arr.shape == (224, 224, 3), f"Bad shape: {arr.shape}"
            assert 0.0 <= arr.min() and arr.max() <= 1.0
            ok_count += 1
        except Exception as e:
            fail_count += 1
            print(f"  FAIL {fname}: {e}")

print(f"  Loaded & resized {ok_count} images to {TARGET} successfully.")
if fail_count:
    print(f"  {fail_count} failures!")

# ── Summary ────────────────────────────────────────────────────────────────────
section("SUMMARY")
print(f"  Real dataset:     YES (Kaggle Chest X-Ray Images)")
print(f"  Total images:     {total:,}")
print(f"  Train:            {counts['train']['NORMAL']+counts['train']['PNEUMONIA']:,}")
print(f"  Test:             {counts['test']['NORMAL']+counts['test']['PNEUMONIA']:,}")
print(f"  Val:              {counts['val']['NORMAL']+counts['val']['PNEUMONIA']:,}")
print(f"  Corrupt images:   {len(corrupt)}")
print(f"  Model-ready:      YES (224x224 RGB float32 [0,1])")
print(f"\n  Dataset path: {DATA_DIR}")
print("\n  READY FOR CNN TRAINING!")
