import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api.js"; import { Card, Bar, Stat, sevColor, Badge } from "../components/ui.jsx";
export default function Result() {
  const { id } = useParams(); const [r, setR] = useState(null); const [e, setE] = useState("");
  useEffect(() => { api.result(id).then(setR).catch((x) => setE(x.message)); }, [id]);
  if (e) return <p className="text-rust">{e}</p>; if (!r) return <p>Loading…</p>;
  const ok = r.status === "Healthy";
  return <div className="max-w-2xl mx-auto space-y-4">
    <div className={`rounded-3xl overflow-hidden text-white ${ok ? "bg-leaf" : "bg-rust"}`}>
      <img src={r.image_url} alt="Your leaf" className="w-full h-64 object-cover" />
      <div className="p-6"><p className="opacity-80">{r.plant_name}</p>
        <h1 className="font-display font-bold text-4xl">{ok ? "Looking healthy 🌱" : r.disease}</h1>
        {!ok && <p className="mt-1 opacity-90">Confidence {r.confidence}%</p>}</div></div>
    <Card><div className="grid grid-cols-2 gap-4"><Stat label="Health score" value={`${r.health_score}/100`} /><Stat label="Estimated life left" value={r.survival_probability + "%"} /></div><div className="mt-3"><Bar value={r.health_score} /></div></Card>
    {!ok && <Card title="How bad is it?"><div className="flex justify-between mb-1"><Badge sev={r.severity} /><b>{r.damage_percentage}% damaged</b></div><Bar value={r.damage_percentage} color={sevColor[r.severity]} /></Card>}
    <Card title="What to do next"><ul className="list-disc pl-5 space-y-1">{r.recommendations.map((t) => <li key={t}>{t}</li>)}</ul></Card>
    <div className="flex gap-3"><Link className="bg-leaf text-white font-semibold px-5 py-2.5 rounded-lg" to="/monitor">Check another</Link><Link className="underline self-center" to="/dashboard">My crops</Link></div></div>;
}
