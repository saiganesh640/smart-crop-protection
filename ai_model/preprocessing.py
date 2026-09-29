import numpy as np, cv2
from PIL import Image
IMG_SIZE = (224, 224)

def load_for_model(path):
    """Model has Rescaling/preprocess layers inside, so feed raw 0-255 RGB."""
    img = Image.open(path).convert("RGB").resize(IMG_SIZE)
    return np.expand_dims(np.asarray(img, dtype="float32"), 0)

def estimate_damage(path):
    """Colour-segmentation estimate: share of leaf pixels that are not healthy green.
    A heuristic, not a lab measurement."""
    bgr = cv2.imread(path)
    bgr = cv2.resize(bgr, (256, 256))
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    leaf = (s > 35) & (v > 40)                      # drop white/grey background
    green = leaf & (h >= 35) & (h <= 85)
    total = int(leaf.sum())
    if total < 500:
        return 0.0
    return round(100.0 * (total - int(green.sum())) / total, 1)
