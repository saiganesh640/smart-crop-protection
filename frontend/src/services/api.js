const tok = () => localStorage.getItem("token");
async function req(path, opts = {}) {
  const h = { ...(opts.body && !(opts.body instanceof FormData) ? { "Content-Type": "application/json" } : {}), ...(tok() ? { Authorization: "Bearer " + tok() } : {}) };
  const r = await fetch("/api" + path, { ...opts, headers: h, body: opts.body instanceof FormData ? opts.body : opts.body && JSON.stringify(opts.body) });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && tok()) { localStorage.clear(); location.href = "/login"; }
  if (!r.ok) throw new Error(j.error || j.msg || "Something went wrong");
  return j;
}
export const api = {
  login: (b) => req("/auth/login", { method: "POST", body: b }), register: (b) => req("/auth/register", { method: "POST", body: b }),
  forgot: (b) => req("/auth/forgot-password", { method: "POST", body: b }),
  plants: () => req("/plants"), addPlant: (b) => req("/plants", { method: "POST", body: b }), plant: (id) => req("/plants/" + id),
  predictions: (id) => req("/predictions/" + id), sensors: (id) => req("/sensors/" + id),
  predict: (file, plantId) => { const f = new FormData(); f.append("image", file); f.append("plant_id", plantId); return req("/predict", { method: "POST", body: f }); },
  predictForm: (f) => req("/predict", { method: "POST", body: f }),
  result: (id) => req("/results/" + id), alerts: () => req("/alerts"), resolve: (id) => req(`/alerts/${id}/resolve`, { method: "POST" }),
};
