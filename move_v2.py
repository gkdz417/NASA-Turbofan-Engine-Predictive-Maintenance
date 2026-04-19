import os, shutil

ROOT = r"C:\Projeler\Github\New Project NASA"
FILES = {
    "backend/artifacts": ["nasa_jet_engine_model.keras", "scaler.pkl", "feature_cols.pkl", "drop_cols.pkl"],
    "backend/data": ["test_FD001.txt", "train_FD001.txt", "RUL_FD001.txt"],
    "docs": ["Damage Propagation Modeling.pdf"]
}

for folder, f_list in FILES.items():
    dest_dir = os.path.join(ROOT, folder.replace("/", os.sep))
    os.makedirs(dest_dir, exist_ok=True)
    for f in f_list:
        src = os.path.join(ROOT, f)
        if os.path.exists(src):
            shutil.move(src, os.path.join(dest_dir, f))
            print(f"MOVED: {f} -> {folder}")
        else:
            print(f"NOT FOUND: {f}")

# Cleanup
junk = os.path.join(ROOT, "[error, setError] = useState(\"\")")
if os.path.exists(junk):
    os.remove(junk)
    print("REMOVED JUNK")
