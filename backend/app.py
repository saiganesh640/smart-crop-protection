import os, uuid
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Plant, Prediction, SensorData, Alert, _d
import ai, health

ROOT = os.path.join(os.path.dirname(__file__), "..")
UPLOADS = os.path.abspath(os.path.join(ROOT, "uploads"))
os.makedirs(UPLOADS, exist_ok=True)
app = Flask(__name__)
app.config.update(SQLALCHEMY_DATABASE_URI=os.getenv("DATABASE_URL", "sqlite:///" + os.path.join(ROOT, "crop.db")),
                  JWT_SECRET_KEY=os.getenv("JWT_SECRET", "dev-secret-change-me"),
                  JWT_ACCESS_TOKEN_EXPIRES=timedelta(days=1), MAX_CONTENT_LENGTH=10 * 1024 * 1024)
CORS(app); db.init_app(app); JWTManager(app)
with app.app_context(): db.create_all()
ai.load()

def uid(): return int(get_jwt_identity())
def err(m, c=400): return jsonify(error=m), c
def own(pid): return Plant.query.filter_by(id=pid, user_id=uid()).first()
def latest_sensor(pid): return SensorData.query.filter_by(plant_id=pid).order_by(SensorData.id.desc()).first()
def add_alert(pid, typ, msg, sev):
    if not Alert.query.filter_by(plant_id=pid, alert_type=typ, status="open").filter(
            Alert.created_at > datetime.utcnow() - timedelta(hours=6)).first():
        db.session.add(Alert(plant_id=pid, alert_type=typ, message=msg, severity=sev))

# ---- auth ----
@app.post("/api/auth/register")
def register():
    d = request.get_json(force=True); e = (d.get("email") or "").strip().lower()
    if not e or len(d.get("password", "")) < 6: return err("Email and a password of 6+ characters are required")
    if User.query.filter_by(email=e).first(): return err("This email is already registered", 409)
    u = User(name=d.get("name", ""), email=e, password_hash=generate_password_hash(d["password"]))
    db.session.add(u); db.session.commit()
    return jsonify(token=create_access_token(identity=str(u.id)), user=dict(id=u.id, name=u.name, email=u.email)), 201
@app.post("/api/auth/login")
def login():
    d = request.get_json(force=True); u = User.query.filter_by(email=(d.get("email") or "").strip().lower()).first()
    if not u or not check_password_hash(u.password_hash, d.get("password", "")): return err("Wrong email or password", 401)
    return jsonify(token=create_access_token(identity=str(u.id)), user=dict(id=u.id, name=u.name, email=u.email))
@app.post("/api/auth/forgot-password")
def forgot():  # placeholder: wire an email provider before production use
    return jsonify(message="If this email exists, reset instructions will be sent.")

# ---- plants ----
@app.get("/api/plants")
@jwt_required()
def plants():
    out = []
    for p in Plant.query.filter_by(user_id=uid()).all():
        pr = Prediction.query.filter_by(plant_id=p.id).order_by(Prediction.id.desc()).first(); s = latest_sensor(p.id)
        out.append({**_d(p), "latest_prediction": _d(pr) if pr else None, "latest_sensor": _d(s) if s else None})
    return jsonify(out)
@app.post("/api/plants")
@jwt_required()
def add_plant():
    d = request.get_json(force=True)
    if not d.get("plant_name"): return err("plant_name is required")
    p = Plant(user_id=uid(), plant_name=d["plant_name"], crop_type=d.get("crop_type", ""), location=d.get("location", ""))
    db.session.add(p); db.session.commit(); return jsonify(_d(p)), 201
@app.get("/api/plants/<int:pid>")
@jwt_required()
def plant(pid):
    p = own(pid)
    if not p: return err("Plant not found", 404)
    preds = Prediction.query.filter_by(plant_id=pid).order_by(Prediction.id).all()
    s = latest_sensor(pid)
    return jsonify(**_d(p), latest_sensor=_d(s) if s else None,
                   forecast=health.forecast([(x.created_at, x.health_score) for x in preds]))

# ---- prediction (same endpoint for camera + upload) ----
@app.post("/api/predict")
@app.post("/api/upload")
@jwt_required()
def predict():
    if not ai.ready(): return err("AI model not loaded. Train it with ai_model/training.ipynb and restart the server.", 503)
    f = request.files.get("image"); pid = request.form.get("plant_id", type=int)
    crop = (request.form.get("crop") or "").strip()[:60]
    if not pid and crop:
        pl = Plant.query.filter_by(user_id=uid(), plant_name=crop).first()
        if not pl: pl = Plant(user_id=uid(), plant_name=crop, crop_type=crop, location=""); db.session.add(pl); db.session.commit()
        pid = pl.id
    if not f or not pid or not own(pid): return err("Please enter the crop name and add a photo")
    if f.mimetype not in ("image/jpeg", "image/png", "image/webp"): return err("Use a JPG, PNG or WEBP image")
    name = f"{uuid.uuid4().hex}.jpg"; path = os.path.join(UPLOADS, name)
    try:
        from PIL import Image
        Image.open(f.stream).convert("RGB").save(path, "JPEG")
    except Exception: return err("Could not read this image")
    r = ai.predict(path); s = latest_sensor(pid); sd = _d(s) if s else None
    sev = health.severity(r["damage"], r["healthy"]); hs, surv, risk = health.score(r["damage"], r["healthy"], sd)
    prev = Prediction.query.filter_by(plant_id=pid).order_by(Prediction.id.desc()).first()
    pr = Prediction(plant_id=pid, image_path=name, disease=r["disease"], confidence=r["confidence"], damage_percentage=r["damage"],
                    severity=sev, health_score=hs, survival_probability=surv, risk_level=risk)
    db.session.add(pr)
    if not r["healthy"]: add_alert(pid, "disease", f"Disease detected: {r['disease']}. Damage {r['damage']}%, severity {sev}. Inspection recommended.", "high" if sev in ("Severe", "Critical") else "medium")
    if prev and r["damage"] - prev.damage_percentage >= 10: add_alert(pid, "damage_increase", f"Damage rose from {prev.damage_percentage}% to {r['damage']}%.", "high")
    if prev and prev.health_score - hs >= 10: add_alert(pid, "health_drop", f"Plant health fell from {prev.health_score} to {hs}.", "medium")
    if sev == "Critical": add_alert(pid, "critical", "Plant is in critical condition.", "critical")
    db.session.commit()
    return jsonify(result_json(pr, sd)), 201
def result_json(pr, sd=None):
    p = db.session.get(Plant, pr.plant_id); healthy = pr.disease == "Healthy"
    return {**_d(pr), "plant_name": p.plant_name, "image_url": f"/api/uploads/{pr.image_path}", "status": "Healthy" if healthy else "Diseased",
            "affected_area": f"{pr.damage_percentage}% of visible leaf", "recommendations": health.recommendations(pr.disease, pr.severity, healthy, sd)}
@app.get("/api/results/<int:rid>")
@jwt_required()
def result(rid):
    pr = db.session.get(Prediction, rid)
    if not pr or not own(pr.plant_id): return err("Result not found", 404)
    s = latest_sensor(pr.plant_id); return jsonify(result_json(pr, _d(s) if s else None))
@app.get("/api/uploads/<name>")
def uploads(name): return send_from_directory(UPLOADS, name)
@app.get("/api/predictions/<int:pid>")
@jwt_required()
def preds(pid):
    if not own(pid): return err("Plant not found", 404)
    return jsonify([_d(x) for x in Prediction.query.filter_by(plant_id=pid).order_by(Prediction.id).all()])

# ---- sensors ----
@app.post("/api/iot/sensor-data")
def iot():
    if request.headers.get("X-Device-Key") != os.getenv("DEVICE_KEY", "esp32-secret-key"): return err("Invalid device key", 401)
    d = request.get_json(force=True); pid = d.get("plant_id")
    if not db.session.get(Plant, pid): return err("Unknown plant_id", 404)
    db.session.add(SensorData(plant_id=pid, **{k: d.get(k) for k in ("temperature", "humidity", "soil_moisture", "light_intensity")}))
    if (d.get("soil_moisture") or 100) < 20: add_alert(pid, "soil_dry", f"Soil moisture is low ({d['soil_moisture']}%).", "medium")
    if d.get("temperature") is not None and not 10 <= d["temperature"] <= 38: add_alert(pid, "temperature", f"Abnormal temperature: {d['temperature']} C.", "medium")
    if d.get("humidity") is not None and not 30 <= d["humidity"] <= 90: add_alert(pid, "humidity", f"Abnormal humidity: {d['humidity']}%.", "medium")
    db.session.commit(); return jsonify(ok=True), 201
@app.get("/api/sensors/<int:pid>")
@jwt_required()
def sensors(pid):
    if not own(pid): return err("Plant not found", 404)
    rows = SensorData.query.filter_by(plant_id=pid).order_by(SensorData.id.desc()).limit(200).all()
    return jsonify([_d(x) for x in reversed(rows)])

# ---- alerts ----
@app.get("/api/alerts")
@jwt_required()
def alerts():
    ids = [p.id for p in Plant.query.filter_by(user_id=uid())]
    rows = Alert.query.filter(Alert.plant_id.in_(ids)).order_by(Alert.id.desc()).limit(100).all()
    return jsonify([{**_d(a), "plant_name": db.session.get(Plant, a.plant_id).plant_name} for a in rows])
@app.post("/api/alerts/<int:aid>/resolve")
@jwt_required()
def resolve(aid):
    a = db.session.get(Alert, aid)
    if not a or not own(a.plant_id): return err("Alert not found", 404)
    a.status = "resolved"; db.session.commit(); return jsonify(_d(a))
@app.get("/api/health")
def hc(): return jsonify(ok=True, model_loaded=ai.ready())

if __name__ == "__main__": app.run(host="0.0.0.0", port=5000)
