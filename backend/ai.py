import os, sys, json, re
import numpy as np
D = os.path.join(os.path.dirname(__file__), "..", "ai_model")
sys.path.insert(0, D)
from preprocessing import load_for_model, estimate_damage
model, classes = None, []

def load():
    """Called once at server start."""
    global model, classes
    mp = os.path.join(D, "trained_model.keras")
    if not os.path.exists(mp):
        print("[AI] trained_model.keras not found - run ai_model/training.ipynb first"); return
    import tensorflow as tf
    model = tf.keras.models.load_model(mp)
    classes = json.load(open(os.path.join(D, "class_names.json")))
    print(f"[AI] model loaded, {len(classes)} classes")

def ready(): return model is not None

def predict(path):
    p = model.predict(load_for_model(path), verbose=0)[0]
    i = int(np.argmax(p)); raw = classes[i]
    healthy = "healthy" in raw.lower() or "background" in raw.lower()
    parts = re.split(r"_{2,}", raw, maxsplit=1)
    crop, dis = parts[0], (parts[1] if len(parts) > 1 else raw)
    disease = "Healthy" if healthy else dis.replace("_", " ").strip()
    damage = 0.0 if healthy else estimate_damage(path)
    return dict(disease=disease, crop=crop.replace("_", " "), confidence=round(float(p[i]) * 100, 1),
                healthy=healthy, damage=damage)