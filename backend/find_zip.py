import os

keywords = ['chest', 'xray', 'x-ray', 'pneumonia', 'kaggle']
extensions = ['.zip', '.tar', '.gz', '.7z']
search_root = r'C:\Users\KIIT'

print(f"Searching in: {search_root}")
print("=" * 60)

found = []
for root, dirs, files in os.walk(search_root):
    # Skip venv and node_modules to speed up search
    dirs[:] = [d for d in dirs if d not in ('venv', 'node_modules', '__pycache__', '.git')]
    for fname in files:
        if any(fname.lower().endswith(ext) for ext in extensions):
            if any(k in fname.lower() for k in keywords):
                full = os.path.join(root, fname)
                size_mb = os.path.getsize(full) / (1024 * 1024)
                found.append((full, size_mb))
                print(f"  FOUND: {full}  ({size_mb:.1f} MB)")

if not found:
    print("No chest/xray/pneumonia ZIP files found anywhere under C:/Users/KIIT")
    print("\nAlso checking Desktop top-level for any ZIP:")
    desktop = r'C:\Users\KIIT\OneDrive\Desktop'
    for f in os.listdir(desktop):
        if f.endswith('.zip'):
            fp = os.path.join(desktop, f)
            print(f"  ZIP on Desktop: {fp}  ({os.path.getsize(fp)/(1024*1024):.1f} MB)")
else:
    print(f"\nTotal found: {len(found)} file(s)")
