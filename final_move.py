import os

root = r"C:\Projeler\Github\New Project NASA"
mapping = {
    "nasa_jet_engine_model.keras": "backend/artifacts",
    "scaler.pkl": "backend/artifacts",
    "feature_cols.pkl": "backend/artifacts",
    "drop_cols.pkl": "backend/artifacts",
    "test_FD001.txt": "backend/data",
    "train_FD001.txt": "backend/data",
    "RUL_FD001.txt": "backend/data",
    "Damage Propagation Modeling.pdf": "docs"
}

for src_name, dest_folder in mapping.items():
    src_path = os.path.join(root, src_name)
    dest_path = os.path.join(root, dest_folder.replace("/", os.sep), src_name)
    
    if os.path.exists(src_path):
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        try:
            os.replace(src_path, dest_path)
            print(f"OK: {src_name}")
        except Exception as e:
            print(f"ERR: {src_name} -> {e}")
    else:
        print(f"SKIP: {src_name}")
