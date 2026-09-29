from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()
def _d(o, skip=()):
    return {c.name: (getattr(o, c.name).isoformat() if isinstance(getattr(o, c.name), datetime) else getattr(o, c.name))
            for c in o.__table__.columns if c.name not in skip}
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True); name = db.Column(db.String(100))
    email = db.Column(db.String(120), unique=True, nullable=False); password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
class Plant(db.Model):
    __tablename__ = "plants"
    id = db.Column(db.Integer, primary_key=True); user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    plant_name = db.Column(db.String(100)); crop_type = db.Column(db.String(60)); location = db.Column(db.String(120))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
class Prediction(db.Model):
    __tablename__ = "predictions"
    id = db.Column(db.Integer, primary_key=True); plant_id = db.Column(db.Integer, db.ForeignKey("plants.id"))
    image_path = db.Column(db.String(255)); disease = db.Column(db.String(120)); confidence = db.Column(db.Float)
    damage_percentage = db.Column(db.Float); severity = db.Column(db.String(20)); health_score = db.Column(db.Float)
    survival_probability = db.Column(db.Float); risk_level = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
class SensorData(db.Model):
    __tablename__ = "sensor_data"
    id = db.Column(db.Integer, primary_key=True); plant_id = db.Column(db.Integer, db.ForeignKey("plants.id"))
    temperature = db.Column(db.Float); humidity = db.Column(db.Float); soil_moisture = db.Column(db.Float)
    light_intensity = db.Column(db.Float); timestamp = db.Column(db.DateTime, default=datetime.utcnow)
class Alert(db.Model):
    __tablename__ = "alerts"
    id = db.Column(db.Integer, primary_key=True); plant_id = db.Column(db.Integer, db.ForeignKey("plants.id"))
    alert_type = db.Column(db.String(40)); message = db.Column(db.Text); severity = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow); status = db.Column(db.String(20), default="open")
