import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api.js"; import { Card, Line, Stat } from "../components/ui.jsx";
export default function PlantDetail() {
  const { id } = useParams(); const [p, setP] = useState(null), [pr, setPr] = useState([]), [sn, setSn] = useState([]);
  useEffect(() => { api.plant(id).then(setP); api.predictions(id).then(setPr); api.sensors(id).then(setSn); }, [id]);
  if (!p) return <p>Loading…</p>; const f = p.forecast, col = (k) => sn.map((s) => s[k]).filter((v) => v != null);
  return <div className="space-y-4">
    <h1 className="font-display font-bold text-2xl">{p.plant_name} <span className="text-ink/50 text-lg">{p.crop_type} · {p.location}</span></h1>
    <Card title="Health outlook (estimate)"><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><Stat label="Current health" value={f.current != null ? `${f.current}/100` : "–"} />
      <Stat label="Trend" value={{ Declining: "↓ Declining", Improving: "↑ Improving", Stable: "→ Stable" }[f.trend] || "Not enough data"} /><Stat label="Survival risk" value={f.survival_risk} /><Stat label="Productive lifespan" value={f.lifespan} /></div>
      <p className="text-sm text-ink/60 mt-3">Forecast confidence: {f.confidence}. This is a trend-based estimate from past checks and sensor readings, not an exact lifespan; it improves with more photos.</p></Card>
    <div className="grid md:grid-cols-2 gap-4"><Card><Line data={pr.map((x) => x.health_score)} label="Plant health" /></Card><Card><Line data={pr.map((x) => x.damage_percentage)} label="Damage %" color="#b3402f" /></Card>
      <Card><Line data={col("temperature")} label="Temperature °C" color="#c98a1b" /></Card><Card><Line data={col("humidity")} label="Humidity %" color="#2b6cb0" /></Card>
      <Card><Line data={col("soil_moisture")} label="Soil moisture %" color="#7a5230" /></Card><Card><Line data={col("light_intensity")} label="Light" color="#8a8a1a" /></Card></div>
    <Card title="Past checks">{pr.length ? <ul className="divide-y">{[...pr].reverse().map((x) => <li key={x.id} className="py-2"><Link className="underline" to={`/result/${x.id}`}>{new Date(x.created_at + "Z").toLocaleString()}</Link> – {x.disease}, {x.damage_percentage}% ({x.severity})</li>)}</ul> : <p>No checks yet.</p>}</Card></div>;
}
