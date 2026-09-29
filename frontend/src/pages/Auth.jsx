import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api.js"; import { btn, input } from "../components/ui.jsx"; import { Media, Leaf } from "../components/fx.jsx";
function Form({ reg }) {
  const [f, setF] = useState({ name: "", email: "", password: "" }); const [msg, setMsg] = useState(""); const nav = useNavigate();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => { e.preventDefault(); setMsg("");
    try { const r = await (reg ? api.register(f) : api.login(f)); localStorage.setItem("token", r.token); nav("/monitor"); } catch (x) { setMsg(x.message); } };
  const forgot = async () => { if (!f.email) return setMsg("Type your email first."); setMsg((await api.forgot({ email: f.email })).message); };
  return <div className="min-h-screen grid md:grid-cols-2">
    <div className="grid place-items-center p-6"><form onSubmit={submit} className="w-full max-w-sm space-y-3">
      <Link to="/" className="font-display font-bold text-xl">🌿 CropGuard</Link>
      <h1 className="font-display font-bold text-4xl pt-6">{reg ? "Create your account" : "Welcome back"}</h1>
      {reg && <input className={input} placeholder="Your name" value={f.name} onChange={set("name")} />}
      <input className={input} type="email" required placeholder="Email" value={f.email} onChange={set("email")} />
      <input className={input} type="password" required minLength={6} placeholder="Password" value={f.password} onChange={set("password")} />
      {msg && <p role="alert" className="text-rust text-sm">{msg}</p>}
      <button className={btn + " w-full"}>{reg ? "Create account" : "Log in"}</button>
      <div className="flex justify-between text-sm">{reg ? <Link className="underline" to="/login">I already have an account</Link> : <><Link className="underline" to="/register">Create an account</Link><button type="button" onClick={forgot} className="underline">Forgot password?</button></>}</div></form></div>
    <div className="hidden md:block relative overflow-hidden bg-gradient-to-br from-[#0b1d12] via-[#24693c] to-[#0f2a1a] animate-pan">
      <Media video="/media/hero.mp4" className="absolute inset-0 w-full h-full object-cover opacity-50" /><Leaf className="absolute floaty w-40 text-white/15 top-1/4 left-1/4" />
      <p className="absolute bottom-10 left-10 right-10 font-display font-bold text-4xl text-white">Healthy crops start with a quick look.</p></div></div>;
}
export const Login = () => <Form />; export const Register = () => <Form reg />;
