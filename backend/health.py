import numpy as np
def severity(d, healthy):
    if healthy or d < 3: return "Healthy"
    return "Mild" if d < 25 else "Moderate" if d < 50 else "Severe" if d < 75 else "Critical"
def score(damage, healthy, sensors=None):
    s = 100 - damage * 0.85
    if sensors:
        if sensors.get("soil_moisture") is not None and sensors["soil_moisture"] < 20: s -= 5
        if sensors.get("temperature") is not None and not 10 <= sensors["temperature"] <= 38: s -= 5
        if sensors.get("humidity") is not None and not 30 <= sensors["humidity"] <= 90: s -= 3
    s = round(max(0.0, min(100.0, s)), 1)
    surv = round(max(2.0, min(99.0, s * 0.95 + (5 if healthy else 0))), 1)
    risk = "Low" if s >= 75 else "Medium" if s >= 50 else "High" if s >= 30 else "Very High"
    return s, surv, risk
def forecast(history):
    """history: [(datetime, health_score)] oldest->newest. Simple linear trend; an estimate, not a guarantee."""
    if not history: return dict(current=None, trend="Unknown", confidence="Low", lifespan="Not enough data")
    cur = history[-1][1]
    if len(history) < 3:
        return dict(current=cur, trend="Unknown", confidence="Low", survival_risk=None, lifespan="Need at least 3 analyses")
    t = np.array([(h[0] - history[0][0]).total_seconds() / 2592000 for h in history])  # months
    y = np.array([h[1] for h in history]); slope = float(np.polyfit(t, y, 1)[0]) if t[-1] > 0 else 0.0
    trend = "Declining" if slope < -1 else "Improving" if slope > 1 else "Stable"
    if slope < -0.5: m = min(36, max(0, (cur - 20) / -slope)); lo, hi = m * 0.7, m * 1.3
    else: lo, hi = 12, 36
    conf = "Low" if len(history) < 6 else "Medium" if len(history) < 15 else "High"
    return dict(current=cur, trend=trend, slope_per_month=round(slope, 2), confidence=conf,
                survival_risk="High" if cur < 40 or slope < -8 else "Medium" if cur < 70 or slope < -2 else "Low",
                lifespan=f"{lo:.0f}-{hi:.0f} months" if slope < -0.5 else "12+ months (no decline detected)")
def recommendations(disease, sev, healthy, sensors=None):
    if healthy: r = ["Plant looks healthy. Keep the regular monitoring routine."]
    else:
        r = [f"Inspect the affected leaves ({disease}).", "Monitor progression with a new photo every few days."]
        if sev in ("Severe", "Critical"): r.append("Isolate this plant if possible to protect neighbouring plants.")
        r.append("Consult a local agricultural expert before choosing any treatment.")
    if sensors:
        if (sensors.get("soil_moisture") or 100) < 20: r.append("Soil is dry: check irrigation.")
        if (sensors.get("humidity") or 0) > 85: r.append("High humidity favours fungal disease: improve airflow.")
    return r
