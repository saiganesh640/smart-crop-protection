import React, { useEffect, useRef, useState } from "react";
export function Reveal({ children, delay = 0, className = "" }) {
  const r = useRef(); const [on, setOn] = useState(false);
  useEffect(() => { const o = new IntersectionObserver(([e]) => e.isIntersecting && (setOn(true), o.disconnect()), { threshold: 0.15 }); o.observe(r.current); return () => o.disconnect(); }, []);
  return <div ref={r} style={{ transitionDelay: delay + "ms" }} className={`transition-all duration-700 ${on ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}>{children}</div>;
}
// Shows a photo/video from /public/media; hides itself if the file is missing.
export function Media({ video, img, className = "", alt = "" }) {
  const [bad, setBad] = useState(false); if (bad) return null;
  return video ? <video className={className} src={video} autoPlay muted loop playsInline onError={() => setBad(true)} />
    : <img className={className} src={img} alt={alt} onError={() => setBad(true)} />;
}
export const Leaf = ({ className = "", style }) => <svg viewBox="0 0 64 64" className={className} style={style} fill="currentColor"><path d="M8 56C8 26 26 8 58 6c0 30-14 50-42 50-2 0-5 0-8 0zm8-6c10-14 20-24 34-34-14 8-26 18-34 34z"/></svg>;
