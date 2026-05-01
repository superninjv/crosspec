// app.jsx — single-page configurator: hero form on top, results below.

const { useState, useEffect, useMemo, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "regular",
  "showFeaturedRing": true,
  "openReasoningByDefault": false
}/*EDITMODE-END*/;

function ecoStatus(entity, ecoId){
  if (entity.native.includes(ecoId)) return "native";
  if (entity.bridge.includes(ecoId)) return "bridge";
  if (entity.eco.includes(ecoId)) return "bridge";
  return "no";
}
function pricePretty(n){ return typeof n === "number" ? "$" + n.toFixed(n%1===0 ? 0 : 2) : "—"; }
function rankEntities(entities, ecoId){
  return [...entities].sort((a,b)=>{
    const sa = a.native.includes(ecoId)?0:1, sb = b.native.includes(ecoId)?0:1;
    if (sa!==sb) return sa-sb;
    const ma = /Matter/i.test(a.protocol)?0:1, mb = /Matter/i.test(b.protocol)?0:1;
    if (ma!==mb) return ma-mb;
    return (a.price ?? 9999) - (b.price ?? 9999);
  });
}
function pickPerType(ecoId, wants, n=3){
  const out = {};
  for (const t of wants){
    const pool = ENTITIES.filter(e=> e.type===t && e.eco.includes(ecoId));
    out[t] = rankEntities(pool, ecoId).slice(0, n);
  }
  return out;
}
function distinctHubs(picksByType){
  const set = new Set();
  for (const arr of Object.values(picksByType))
    for (const e of arr) if (e.hub && e.hub !== "none") set.add(e.hub);
  return [...set];
}

// ────────── pieces ──────────
function Topbar(){
  return (
    <header className="topbar">
      <div className="brand">
        <span className="glyph">×</span>
        <span>crosspec</span>
        <span className="crumbs">
          <span className="sep">/</span><span>smart-home</span>
          <span className="sep">/</span><span className="here">configurator</span>
        </span>
      </div>
      <div className="topbar-spacer" />
      <div className="topbar-meta">
        <span><span className="pip" />live</span>
        <span><code>kb v0.1 · {ENTITIES.length} entities</code></span>
      </div>
    </header>
  );
}

function Hero({ eco, setEco, wants, toggleWant, picksByType, applyPreset, scrollToResults }){
  const totalPicks = Object.values(picksByType).reduce((a,b)=>a+b.length,0);
  const hubs = distinctHubs(picksByType);
  const ecoObj = ECOSYSTEMS.find(e=>e.id===eco);

  const stepEcoDone = !!eco;
  const stepWantsDone = wants.length > 0;
  const allDone = stepEcoDone && stepWantsDone;

  return (
    <section className="hero">
      <div className="hero-inner">
        <span className="h-eyebrow"><span className="pip" /> smart-home v0.1</span>
        <h1 className="h-title">
          Compose a smart-home setup that <em>actually works together</em>.
        </h1>
        <p className="h-sub">
          Pick your ecosystem and what you want to add. Crosspec resolves protocol, hub, and
          ecosystem constraints across {ENTITIES.length}+ devices and shows exactly why each pick is compatible.
        </p>

        <div className="config-card" id="configurator">
          <div className="config-tabs">
            <div className={"config-tab " + (stepEcoDone ? "done " : "") + (!stepEcoDone ? "active" : "")}>
              <span className="n">1</span> ecosystem
            </div>
            <div className={"config-tab " + (stepWantsDone ? "done " : "") + (stepEcoDone && !stepWantsDone ? "active" : "")}>
              <span className="n">2</span> devices
            </div>
            <div className={"config-tab " + (allDone ? "active" : "")}>
              <span className="n">→</span> solve
            </div>
          </div>

          <div className="config-body">
            {/* step 1 */}
            <div className="cfg-step">
              <h3><span className="ord">1</span> Which ecosystem?</h3>
              <p className="hint">The voice / app you'll use day-to-day. Determines which devices show up.</p>
              <div className="eco-grid">
                {ECOSYSTEMS.map(e => (
                  <button key={e.id} className="eco-pick"
                    aria-pressed={eco === e.id} onClick={()=> setEco(e.id)}>
                    <span className="name">{e.name}</span>
                    <span className="sub">{e.controllers}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* step 2 */}
            <div className="cfg-step">
              <h3><span className="ord">2</span> What do you want to add?</h3>
              <p className="hint">Tap any combination. Counts show how many compatible devices we have for {ecoObj?.name}.</p>
              <div className="want-grid">
                {DEVICE_TYPES.map(t => {
                  const checked = wants.includes(t.id);
                  const ct = ENTITIES.filter(e=> e.type===t.id && e.eco.includes(eco)).length;
                  return (
                    <button key={t.id} className="want-chip" aria-pressed={checked}
                      onClick={()=> toggleWant(t.id)}>
                      {checked && <span className="x">✓</span>}
                      <span>{t.label}</span>
                      <span className="ct">{ct}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* step 3 */}
            <div className="cfg-solve">
              <span className="solve-label">live preview</span>
              <div className="solve-stats">
                <div className="solve-stat"><span className="k">picks</span>
                  <span className="v">{totalPicks || "—"}</span></div>
                <div className="solve-stat"><span className="k">device types</span>
                  <span className="v">{wants.length || "—"}</span></div>
                <div className="solve-stat"><span className="k">hubs needed</span>
                  <span className={"v " + (hubs.length===0 && totalPicks>0 ? "ok" : "")}>
                    {totalPicks === 0 ? "—" : hubs.length || "0"}</span></div>
                <div className="solve-stat"><span className="k">ecosystem</span>
                  <span className="v" style={{fontSize:11.5,fontWeight:500}}>{ecoObj?.short || "—"}</span></div>
              </div>
              <button className="btn-solve" onClick={scrollToResults}
                disabled={!allDone}
                style={!allDone ? {opacity:0.5,cursor:"not-allowed"} : undefined}>
                {allDone
                  ? <>show {totalPicks} compatible picks <span className="arr">↓</span></>
                  : <>pick an ecosystem and at least one device <span className="arr">↓</span></>}
              </button>
              {allDone && (
                <button className="btn-link" onClick={()=>{ }}>
                  share this configuration · copy link
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="presets-row">
        <span className="presets-label">or jump in:</span>
        {PRESETS.map(p => (
          <button key={p.id} className="preset-chip" onClick={()=> applyPreset(p)}>
            <span>{p.label}</span>
            <span className="tag">{p.tag}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ShareStrip({ hash }){
  const [flash, setFlash] = useState(false);
  return (
    <div className="share">
      <span>shareable URL</span>
      <span className="hash">{hash}</span>
      <button className="copy" onClick={()=>{ navigator.clipboard?.writeText(hash); setFlash(true); setTimeout(()=>setFlash(false),1400); }}>
        {flash ? <span className="ok-flash">copied ✓</span> : "copy link"}
      </button>
    </div>
  );
}

function CompatStrip({ entity, activeEco }){
  return (
    <div className="compat-strip">
      {ECOSYSTEMS.map(e => {
        const s = ecoStatus(entity, e.id);
        const cls = "compat-cell s-" + s + (e.id === activeEco ? " s-active" : "");
        return (
          <div key={e.id} className={cls}
            title={e.name + ": " + (s==="native"?"native":s==="bridge"?"via bridge":"no path")}>
            <span className="dot" />
            <span className="lbl">{e.short}</span>
          </div>
        );
      })}
    </div>
  );
}

function ProductCard({ entity, activeEco, idx, showFeatured }){
  const s = ecoStatus(entity, activeEco);
  return (
    <article className={"pcard" + (entity.featured && showFeatured ? " featured" : "")}>
      <div className="topline">
        <span className="left">
          <span className="mono">{entity.id}</span>
          {s === "native"
            ? <span className="badge-native">native</span>
            : <span className="badge-bridge">via bridge</span>}
        </span>
        <span className="pin">#{String(idx+1).padStart(2,"0")}</span>
      </div>
      <h4 className="title">{entity.name}</h4>
      <div className="submodel">
        <span>{entity.brand}</span><span className="sep">·</span>
        <span>{entity.model}</span><span className="sep">·</span>
        <span>{entity.protocol}</span>
      </div>
      <CompatStrip entity={entity} activeEco={activeEco} />
      <div className="stats">
        <div className="stat"><span className="k">protocol</span><span className="v">{entity.protocol}</span></div>
        <div className="stat"><span className="k">hub</span>
          <span className={"v " + (entity.hub === "none" ? "ok" : "warn")}>
            {HUB_LABELS[entity.hub] || entity.hub}
          </span></div>
        {entity.specs.slice(0, 4).map(([k,v],i)=> (
          <div className="stat" key={i}><span className="k">{k}</span><span className="v">{v}</span></div>
        ))}
      </div>
      <p className="why">{entity.summary}</p>
      <div className="pcard-foot">
        <span className="price">
          {entity.price ? pricePretty(entity.price) : <span className="nope">price not tracked</span>}
        </span>
        <a className="cta" href={`/go/smart-home/${entity.id}`} rel="sponsored nofollow">
          find on retailer <span className="arr">→</span>
        </a>
      </div>
    </article>
  );
}

function HubCallout({ hubs }){
  const total = hubs.reduce((a,h)=> a + (HUB_PRICES[h] ?? 0), 0);
  return (
    <div className="hub-callout">
      <span className="lbl">hubs you'll need</span>
      <div className="hubs">
        {hubs.length === 0
          ? <span className="hub-chip none">none — every pick works without an extra hub</span>
          : hubs.map(h => <span key={h} className="hub-chip">{HUB_LABELS[h] || h}</span>)}
      </div>
      <div className="total">
        <span>added hub cost</span>
        <span className="v" style={hubs.length===0 ? {color:"var(--ok)"} : null}>${total}</span>
      </div>
    </div>
  );
}

function Results({ eco, wants, picksByType, openReasoning, showFeatured, resultsRef }){
  const ecoObj = ECOSYSTEMS.find(e=>e.id===eco);
  const total = Object.values(picksByType).reduce((a,b)=>a+b.length,0);
  const hubs = distinctHubs(picksByType);
  const totalPrice = Object.values(picksByType).flat().reduce((a,e)=> a + (e.price ?? 0), 0);
  const nativeCount = Object.values(picksByType).flat().filter(e => e.native.includes(eco)).length;

  if (wants.length === 0) {
    return (
      <section className="results" ref={resultsRef}>
        <div className="empty">
          <h3>Pick a device type to see compatible recommendations.</h3>
          <p>Or tap a preset above for an opinionated start. The configurator filters {ENTITIES.length}+ devices in real time as you change inputs.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="results" ref={resultsRef}>
      <header className="results-head">
        <h2>
          <span className="num">{total}</span> picks for <span className="qb">{ecoObj?.name}</span>,
          ranked by native compatibility, Matter support, and price.
        </h2>
        <span className="stamp">solved · {new Date().toISOString().slice(0,10)}</span>
      </header>

      <div className="meta-strip">
        <div className="cell"><span className="k">ecosystem</span><span className="v">{ecoObj?.name}</span></div>
        <div className="cell"><span className="k">native picks</span><span className="v ok">{nativeCount}/{total}</span></div>
        <div className="cell"><span className="k">hubs</span><span className={"v " + (hubs.length===0?"ok":"warn")}>{hubs.length || "none"}</span></div>
        <div className="cell"><span className="k">est. parts cost</span><span className="v">${totalPrice.toFixed(0)}</span></div>
        <div className="cell"><span className="k">price freshness</span><span className="v">2026-04-30</span></div>
      </div>

      <HubCallout hubs={hubs} />

      {wants.map(t => {
        const picks = picksByType[t] || [];
        if (!picks.length) return null;
        const label = DEVICE_TYPES.find(x=>x.id===t)?.label ?? t;
        return (
          <section className="res-section" key={t}>
            <header className="res-section-head">
              <h3>{label}</h3>
              <span className="ct">{picks.length} picks · top {picks.length} of {ENTITIES.filter(e=>e.type===t).length}</span>
            </header>
            <div className="grid">
              {picks.map((p,i)=> <ProductCard key={p.id} entity={p} idx={i} activeEco={eco} showFeatured={showFeatured} />)}
            </div>
          </section>
        );
      })}

      <details className="reasoning" open={openReasoning}>
        <summary>
          <span className="chev">▸</span>
          <span>How we picked these</span>
          <span className="ct">{REASONING.length} reasoning steps · {SOURCES.length} sources</span>
        </summary>
        <div className="reasoning-body">
          {REASONING.map((r,i)=>(
            <div key={i} className={"rstep" + (r.fired ? " fired" : "")}>
              <div className="n">{String(i+1).padStart(2,"0")}</div>
              <div>
                <p className="step">{r.step}</p>
                <p className="body">{r.body
                  .replace("{ECO}", ecoObj?.name || "—")
                  .replace("{WANTS}", wants.join(", "))}</p>
                <p className="src">
                  {r.srcs.map(id => {
                    const s = SOURCES.find(x=>x.id===id);
                    return s ? <a key={id} href={"#src-"+id}>[{id}] {s.name}</a> : null;
                  })}
                </p>
              </div>
            </div>
          ))}
          <div className="sources">
            {SOURCES.map(s=>(
              <div className="src-item" key={s.id} id={"src-"+s.id}>
                <span className="id">[{s.id}]</span>
                <div>
                  <div className="name">{s.name}</div>
                  <div className="meta">ingest {s.ingest}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </details>
    </section>
  );
}

function App(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [eco, setEco] = useState("homekit");
  const [wants, setWants] = useState([]);
  const resultsRef = useRef(null);

  const picksByType = useMemo(()=> pickPerType(eco, wants, 3), [eco, wants]);

  function toggleWant(id){ setWants(w => w.includes(id) ? w.filter(x=>x!==id) : [...w, id]); }
  function applyPreset(p){
    setEco(p.eco); setWants(p.wants);
    setTimeout(()=> resultsRef.current?.scrollIntoView({behavior:"smooth",block:"start"}), 80);
  }
  function scrollToResults(){
    resultsRef.current?.scrollIntoView({behavior:"smooth", block:"start"});
  }

  const hash = useMemo(()=>{
    const p = new URLSearchParams();
    p.set("ecosystem", eco);
    if (wants.length) p.set("wants", wants.join(","));
    return "crosspec.com/smart-home/#" + p.toString();
  }, [eco, wants]);

  // hash sync
  useEffect(()=>{
    const h = window.location.hash.replace(/^#/,"");
    if (!h) return;
    const p = new URLSearchParams(h);
    const e = p.get("ecosystem"); if (e) setEco(e);
    const w = p.get("wants"); if (w) setWants(w.split(",").filter(Boolean));
  }, []);

  return (
    <div data-density={t.density}>
      <Topbar />
      <Hero
        eco={eco} setEco={setEco}
        wants={wants} toggleWant={toggleWant}
        picksByType={picksByType}
        applyPreset={applyPreset}
        scrollToResults={scrollToResults}
      />
      {wants.length > 0 && <ShareStrip hash={hash} />}
      <Results
        eco={eco} wants={wants} picksByType={picksByType}
        openReasoning={t.openReasoningByDefault}
        showFeatured={t.showFeaturedRing}
        resultsRef={resultsRef}
      />
      <TweaksPanel>
        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density}
          options={["compact","regular","comfy"]}
          onChange={v=>setTweak("density", v)} />
        <TweakSection label="Cards" />
        <TweakToggle label="Highlight featured pick" value={t.showFeaturedRing}
          onChange={v=>setTweak("showFeaturedRing", v)} />
        <TweakSection label="Reasoning" />
        <TweakToggle label="Open reasoning by default" value={t.openReasoningByDefault}
          onChange={v=>setTweak("openReasoningByDefault", v)} />
      </TweaksPanel>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);
