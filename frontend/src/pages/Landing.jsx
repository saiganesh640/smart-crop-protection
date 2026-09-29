import React from "react";
import { Link } from "react-router-dom";
import { Reveal, Media, Leaf } from "../components/fx.jsx";
const cta = "inline-block bg-white text-deep font-semibold px-7 py-3.5 rounded-full hover:scale-105 hover:shadow-2xl transition duration-300";
export default function Landing() {
  const to = localStorage.getItem("token") ? "/monitor" : "/register";
  return <div className="bg-deep text-white overflow-x-hidden">
    <nav className="fixed top-0 inset-x-0 z-20 backdrop-blur bg-deep/50"><div className="max-w-6xl mx-auto px-4 py-3 flex items-center">
      <span className="font-display font-bold text-xl mr-auto">🌿 CropGuard</span>
      <Link to="/login" className="mr-5 hover:underline">Log in</Link><Link to={to} className="bg-white text-deep font-semibold px-4 py-1.5 rounded-full">Start</Link></div></nav>
    <section className="relative min-h-screen grid place-items-center text-center px-4">
      <div className="absolute inset-0 animate-pan bg-gradient-to-br from-[#0b1d12] via-[#24693c] to-[#0f2a1a]" />
      <Media video="/media/hero.mp4" className="absolute inset-0 w-full h-full object-cover opacity-45" />
      {[["left-[8%] top-[22%] w-16", 0], ["right-[10%] top-[30%] w-24", 1.5], ["left-[18%] bottom-[16%] w-20", 3], ["right-[20%] bottom-[12%] w-12", 2]].map(([c, d], i) =>
        <Leaf key={i} className={`absolute floaty text-white/15 ${c}`} style={{ animationDelay: d + "s" }} />)}
      <div className="relative z-10 max-w-3xl pt-16">
        <p className="uppercase tracking-[0.3em] text-sm text-white/70 mb-4">AI plant doctor</p>
        <h1 className="font-display font-bold text-5xl md:text-7xl leading-[1.05]">Is your crop healthy?<br />Find out in seconds.</h1>
        <p className="mt-6 text-lg text-white/75">Take a photo of a leaf. Get a clear answer and what to do next.</p>
        <div className="mt-9"><Link to={to} className={cta}>Check a plant →</Link></div></div>
      <div className="absolute bottom-6 text-white/60 animate-bounce">↓</div>
    </section>
    <section className="bg-field text-ink py-24 px-4"><div className="max-w-5xl mx-auto">
      <Reveal><h2 className="font-display font-bold text-4xl md:text-5xl text-center">Three steps. No experts needed.</h2></Reveal>
      <div className="grid md:grid-cols-3 gap-6 mt-14">{[["📸", "Snap a leaf", "Use your camera or upload a photo."], ["🧠", "AI checks it", "Trained on tens of thousands of leaf photos."], ["✅", "Get the answer", "Healthy or not, plus simple next steps."]].map(([e, t, d], i) =>
        <Reveal key={t} delay={i * 150}><div className="bg-white rounded-3xl p-8 h-full hover:-translate-y-2 hover:shadow-2xl transition duration-300"><div className="text-5xl">{e}</div><h3 className="font-display font-bold text-2xl mt-4">{t}</h3><p className="text-ink/60 mt-2">{d}</p></div></Reveal>)}</div></div></section>
    <section className="py-24 px-4"><div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-5">{[["farm1.jpg", "Spot problems early"], ["farm2.jpg", "Protect every harvest"], ["farm3.jpg", "Check from anywhere"]].map(([f, c], i) =>
      <Reveal key={f} delay={i * 150}><div className="relative h-80 rounded-3xl overflow-hidden bg-gradient-to-br from-leaf to-[#0b1d12] group">
        <Media img={"/media/" + f} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" /><span className="absolute bottom-5 left-5 font-display font-bold text-2xl">{c}</span></div></Reveal>)}</div></section>
    <section className="pb-28 px-4 text-center"><Reveal><h2 className="font-display font-bold text-4xl md:text-6xl">Ready to look after your crops?</h2>
      <div className="mt-8"><Link to={to} className={cta}>Get started free</Link></div></Reveal></section>
  </div>;
}
