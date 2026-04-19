import os, shutil

root = r"C:\Projeler\Github\New Project NASA"
print(f"Working in: {root}")
files = os.listdir(root)
print(f"Current root files: {files}")

targets = {
    "nasa_jet_engine_model.keras": "backend/artifacts",
    "scaler.pkl": "backend/artifacts",
    "feature_cols.pkl": "backend/artifacts",
    "drop_cols.pkl": "backend/artifacts",
    "test_FD001.txt": "backend/data",
    "train_FD001.txt": "backend/data",
    "RUL_FD001.txt": "backend/data",
    "Damage Propagation Modeling.pdf": "docs"
}

for f, folder in targets.items():
    src = os.path.join(root, f)
    dst = os.path.join(root, folder.replace("/", os.sep), f)
    if os.path.exists(src):
        print(f"Moving {src} to {dst}")
        shutil.move(src, dst)
    else:
        print(f"Not found: {src}")

# Junk cleanup
for f in os.listdir(root):
    if "useState" in f:
        print(f"Deleting junk: {f}")
        os.remove(os.path.join(root, f))
