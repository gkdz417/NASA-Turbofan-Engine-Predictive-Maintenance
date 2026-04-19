import os
import shutil

root = r"C:\Projeler\Github\New Project NASA"
backend_artifacts = os.path.join(root, "backend", "artifacts")
backend_data = os.path.join(root, "backend", "data")
docs = os.path.join(root, "docs")

# Create dirs if not exist
os.makedirs(backend_artifacts, exist_ok=True)
os.makedirs(backend_data, exist_ok=True)
os.makedirs(docs, exist_ok=True)

moves = [
    ("nasa_jet_engine_model.keras", backend_artifacts),
    ("scaler.pkl", backend_artifacts),
    ("feature_cols.pkl", backend_artifacts),
    ("drop_cols.pkl", backend_artifacts),
    ("test_FD001.txt", backend_data),
    ("train_FD001.txt", backend_data),
    ("RUL_FD001.txt", backend_data),
    ("Damage Propagation Modeling.pdf", docs),
]

for filename, dest_dir in moves:
    src = os.path.join(root, filename)
    dest = os.path.join(dest_dir, filename)
    if os.path.exists(src):
        try:
            shutil.move(src, dest)
            print(f"Moved {filename} to {dest_dir}")
        except Exception as e:
            print(f"Error moving {filename}: {e}")
    else:
        print(f"File not found: {filename}")

# Cleanup junk
junk_file = os.path.join(root, '[error, setError] = useState("");')
if os.path.exists(junk_file):
    os.remove(junk_file)
    print("Cleaned up junk file")
