import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js"; import { Card, Badge, Stat, Bar } from "../components/ui.jsx";
export default function Dashboard() {
  const [ps, setPs] = useState(null); useEffect(() => { api.plants().then(setPs); }, []);
  if (!ps) return <p>Loading…</p>; const chk = ps.filter((p) => p.latest_prediction), ok = chk.filter((p) => p.latest_prediction.severity === "Healthy").length;
  return <div className="space-y-4"><h1 className="font-display font-bold text-4xl pt-2">My crops</h1>
    <Card><div className="grid grid-cols-3 gap-4"><Stat label="Crops" value={ps.length} /><Stat label="Healthy" value={ok} /><Stat label="Need attention" value={chk.length - ok} /></div></Card>
    {!ps.length && <Card><p>Nothing here yet. <Link className="underline" to="/monitor">Check your first plant.</Link></p></Card>}
    <div className="grid sm:grid-cols-2 gap-4">{ps.map((p) => { const a = p.latest_prediction;
      return <Link key={p.id} to={`/plants/${p.id}`}><Card className="hover:-translate-y-1 hover:shadow-xl transition duration-300"><div className="flex justify-between"><div className="font-display font-bold text-xl">{p.plant_name}</div>{a && <Badge sev={a.severity} />}</div>
        {a ? <div className="mt-3"><Bar value={a.health_score} /><p className="text-sm text-ink/60 mt-1">Health {a.health_score}/100</p></div> : <p className="text-sm text-ink/50 mt-2">Not checked yet</p>}</Card></Link>; })}</div></div>;
}
