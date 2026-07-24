"""
Extract 'dataset medical.zip' from Desktop into backend/data/chest_xray/
and verify the final folder structure + image counts.
"""
import zipfile
import os
import sys

ZIP_PATH = r"C:\Users\KIIT\OneDrive\Desktop\dataset medical.zip"
EXTRACT_TO = r"C:\Users\KIIT\OneDrive\Desktop\MEDICAL-ML\backend\data\chest_xray_raw"
FINAL_DIR  = r"C:\Users\KIIT\OneDrive\Desktop\MEDICAL-ML\backend\data\chest_xray"

# ── Step 1: Peek inside the ZIP ────────────────────────────────────────────────
print("=" * 60)
print("  EXTRACTING KAGGLE CHEST X-RAY DATASET")
print("=" * 60)

print(f"\n[1/4] Inspecting ZIP: {ZIP_PATH}")
with zipfile.ZipFile(ZIP_PATH, 'r') as zf:
    all_names = zf.namelist()
    print(f"  Total entries: {len(all_names)}")
    # Show top-level structure
    top_dirs = sorted(set(n.split('/')[0] for n in all_names if '/' in n))
    print(f"  Top-level folders: {top_dirs}")
    # Count images per key folder
    for folder in ['train/NORMAL', 'train/PNEUMONIA', 'test/NORMAL', 'test/PNEUMONIA', 'val/NORMAL', 'val/PNEUMONIA']:
        count = sum(1 for n in all_names if folder in n and n.lower().endswith(('.jpeg','.jpg','.png')))
        if count:
            print(f"    {folder}: {count} images")

# ── Step 2: Extract ────────────────────────────────────────────────────────────
print(f"\n[2/4] Extracting to: {EXTRACT_TO}")
print("  (This may take a few minutes for 2+ GB...)")
os.makedirs(EXTRACT_TO, exist_ok=True)

with zipfile.ZipFile(ZIP_PATH, 'r') as zf:
    total = len([n for n in zf.namelist() if n.lower().endswith(('.jpeg','.jpg','.png'))])
    done = 0
    for item in zf.infolist():
        zf.extract(item, EXTRACT_TO)
        if item.filename.lower().endswith(('.jpeg','.jpg','.png')):
            done += 1
            if done % 500 == 0 or done == total:
                pct = done * 100 // total
                print(f"  Extracted {done}/{total} images ({pct}%)", flush=True)

print("  Extraction complete.")

# ── Step 3: Find the chest_xray folder inside the extracted content ────────────
print(f"\n[3/4] Locating chest_xray folder...")
target = None
for root, dirs, files in os.walk(EXTRACT_TO):
    if 'train' in dirs and 'test' in dirs:
        target = root
        print(f"  Found dataset root: {target}")
        break

if not target:
    # Maybe extracted directly
    target = EXTRACT_TO
    print(f"  Using extract root: {target}")

# ── Step 4: Rename/move to canonical path ─────────────────────────────────────
import shutil
if os.path.abspath(target) != os.path.abspath(FINAL_DIR):
    if os.path.exists(FINAL_DIR):
        print(f"\n[4/4] Removing old chest_xray dir and replacing with real dataset...")
        shutil.rmtree(FINAL_DIR)
    print(f"  Moving {target} -> {FINAL_DIR}")
    shutil.move(target, FINAL_DIR)
else:
    print(f"\n[4/4] Already at correct path: {FINAL_DIR}")

# ── Step 5: Verify ─────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("  FINAL STRUCTURE VERIFICATION")
print("=" * 60)

image_exts = ('.jpeg', '.jpg', '.png')
total_images = 0
for split in ['train', 'test', 'val']:
    for cls in ['NORMAL', 'PNEUMONIA']:
        folder = os.path.join(FINAL_DIR, split, cls)
        if os.path.exists(folder):
            count = len([f for f in os.listdir(folder) if f.lower().endswith(image_exts)])
            total_images += count
            print(f"  [OK] {split:5s}/{cls:10s}  ->  {count:5d} images")
        else:
            print(f"  [--] {split:5s}/{cls:10s}  ->  NOT FOUND")

print(f"\n  Total real images: {total_images:,}")
print("  Dataset ready for training!")
