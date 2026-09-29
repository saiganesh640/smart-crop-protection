import React from "react";
import { Link, useNavigate } from "react-router-dom";
export const sevColor = { Healthy: "bg-leaf", Mild: "bg-lime-600", Moderate: "bg-amber2", Severe: "bg-orange-700", Critical: "bg-rust" };
export const Badge = ({ sev }) => <span className={`${sevColor[sev] || "bg-gray-500"} text-white text-sm font-semibold px-2.5 py-0.5 rounded-full`}>{sev}</span>;
export const Card = ({ title, children, className = "" }) => (
  <section className={`bg-white rounded-xl p-4 border border-deep/10 ${className}`}>{title && <h3 className="font-display font-bold text-lg mb-3">{title}</h3>}{children}</section>);
export const Bar = ({ value, color = "bg-leaf" }) => (
  <div className="h-3 bg-deep/10 rounded-full overflow-hidden" role="progressbar" aria-valuenow={value}><div className={`h-full ${color}`} style={{ width: `${Math.min(100, value)}%` }} /></div>);
export const Stat = ({ label, value }) => <div><div className="text-sm text-ink/60">{label}</div><div className="font-display text-2xl font-bold">{value ?? "–"}</div></div>;
export function Line({ data, label, color = "#2f6b3f" }) {
  if (!data.length) return <div><div className="text-sm text-ink/60">{label}</div><p className="text-sm py-6 text-ink/50">No data yet.</p></div>;
  const mn = Math.min(...data), mx = Math.max(...data), r = mx - mn || 1;
  const pts = data.map((v, i) => `${(i / Math.max(1, data.length - 1)) * 300},${58 - ((v - mn) / r) * 52}`).join(" ");
  return <div><div className="flex justify-between text-sm"><span className="text-ink/60">{label}</span><span className="font-semibold">{data.at(-1)}</span></div>
    <svg viewBox="0 0 300 64" className="w-full h-16"><polyline fill="none" stroke={color} strokeWidth="2.5" points={pts} /></svg>
    <div className="flex justify-between text-xs text-ink/40"><span>min {mn}</span><span>max {mx}</span></div></div>;
}
export function Shell({ children }) {
  const nav = useNavigate();
  return <div className="min-h-screen"><header className="bg-deep/90 backdrop-blur sticky top-0 z-20 text-white"><div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
    <Link to="/" className="font-display font-bold text-xl mr-auto">🌿 CropGuard</Link>
    {[["/dashboard", "Dashboard"], ["/monitor", "Check a plant"], ["/alerts", "Alerts"]].map(([to, t]) => <Link key={to} to={to} className="hover:underline underline-offset-4">{t}</Link>)}
    <button onClick={() => { localStorage.clear(); nav("/login"); }} className="text-white/70 hover:text-white">Log out</button></div></header>
    <main className="max-w-5xl mx-auto p-4 space-y-4">{children}</main></div>;
}
export const btn = "bg-leaf hover:bg-deep text-white font-semibold px-4 py-2.5 rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber2";
export const btn2 = "border border-deep/30 hover:bg-deep/5 font-semibold px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber2";
export const input = "w-full border border-deep/25 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-leaf";
