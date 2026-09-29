import React, { useEffect, useState } from "react";
import { api } from "../services/api.js"; import { Card, btn2 } from "../components/ui.jsx";
export default function Alerts() {
  const [a, setA] = useState(null); const load = () => api.alerts().then(setA); useEffect(() => { load(); }, []);
  if (!a) return <p>Loading…</p>; if (!a.length) return <Card><p>No alerts. Your plants are quiet right now.</p></Card>;
  return <div className="space-y-3">{a.map((x) => <Card key={x.id} className={x.status === "open" ? (x.severity === "critical" || x.severity === "high" ? "border-rust" : "border-amber2") : "opacity-60"}>
    <div className="flex justify-between gap-3"><div><div className="font-display font-bold">⚠️ {x.plant_name}</div><p>{x.message}</p><p className="text-sm text-ink/60">{new Date(x.created_at + "Z").toLocaleString()}</p></div>
      {x.status === "open" && <button className={btn2} onClick={() => api.resolve(x.id).then(load)}>Mark resolved</button>}</div></Card>)}</div>;
}
