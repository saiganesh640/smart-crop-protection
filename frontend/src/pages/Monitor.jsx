import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js"; import { Card, btn, btn2, input } from "../components/ui.jsx";
export default function Monitor() {
  const [crop, setCrop] = useState(""); const [names, setNames] = useState([]); const [mode, setMode] = useState("upload");
  const [file, setFile] = useState(null); const [preview, setPreview] = useState(""); const [on, setOn] = useState(false);
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const vid = useRef(), stream = useRef(); const nav = useNavigate();
  useEffect(() => { api.plants().then((p) => setNames(p.map((x) => x.plant_name))); return stop; }, []);
  const pick = (f) => { setFile(f); setPreview(f ? URL.createObjectURL(f) : ""); };
  async function start() { setErr(""); try { stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }); vid.current.srcObject = stream.current; setOn(true); } catch { setErr("Camera is blocked. Allow it in your browser, or upload a photo."); } }
  function stop() { stream.current?.getTracks().forEach((t) => t.stop()); setOn(false); }
  function capture() { const v = vid.current, c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight; c.getContext("2d").drawImage(v, 0, 0);
    c.toBlob((b) => pick(new File([b], "capture.jpg", { type: "image/jpeg" })), "image/jpeg", 0.92); }
  async function analyze() { if (!crop.trim()) return setErr("Enter the crop name first."); setBusy(true); setErr("");
    try { const f = new FormData(); f.append("image", file); f.append("crop", crop.trim()); const r = await api.predictForm(f); nav("/result/" + r.id); } catch (x) { setErr(x.message); setBusy(false); } }
  return <div className="max-w-xl mx-auto space-y-4">
    <h1 className="font-display font-bold text-4xl pt-4">Check a plant</h1>
    <Card><label className="block text-sm text-ink/60 mb-1">Crop name</label>
      <input list="crops" className={input} placeholder="e.g. Tomato" value={crop} onChange={(e) => setCrop(e.target.value)} /><datalist id="crops">{[...new Set(names)].map((n) => <option key={n} value={n} />)}</datalist></Card>
    <div className="flex gap-2">{[["upload", "Upload photo"], ["camera", "Use camera"]].map(([m, t]) => <button key={m} onClick={() => { setMode(m); stop(); pick(null); }} className={mode === m ? btn : btn2}>{t}</button>)}</div>
    <Card>{mode === "camera" ? <div className="space-y-3"><video ref={vid} autoPlay playsInline muted className={`w-full rounded-lg bg-deep ${on ? "" : "hidden"}`} />
      <div className="flex gap-2 flex-wrap">{!on ? <button className={btn} onClick={start}>Start camera</button> : <><button className={btn} onClick={capture}>Capture</button><button className={btn2} onClick={stop}>Stop</button></>}</div></div>
      : <label className="block border-2 border-dashed border-deep/25 rounded-xl p-8 text-center cursor-pointer hover:bg-deep/5 transition"><input type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files[0])} />Tap to choose a leaf photo</label>}
      {preview && <div className="mt-4"><img src={preview} alt="Selected leaf" className="max-h-72 rounded-xl" /><button className={btn + " mt-3 w-full"} disabled={busy} onClick={analyze}>{busy ? "Checking…" : "Analyze plant"}</button></div>}
      {err && <p role="alert" className="text-rust mt-3">{err}</p>}</Card></div>;
}
