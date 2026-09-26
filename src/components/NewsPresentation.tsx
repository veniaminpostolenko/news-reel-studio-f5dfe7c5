import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Cpu, Landmark, Trophy } from "lucide-react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import ronaldoAlNassr from "../assets/ronaldo-alnassr.png";
import ronaldoRealMadrid from "../assets/ronaldo-realmadrid.png";
import heroNewsCast from "../assets/hero-news-cast.jpg";

const PRESENTERS = "[NIMI 1] & [NIMI 2]";
const ERR_LINK = "https://www.err.ee/";

type NewsSlideProps = {
  id: string;
  number: string;
  kicker: string;
  headline: string;
  summary: string;
  source: string;
  tone: "president" | "pisa" | "ai" | "sport";
  active: boolean;
  children: ReactNode;
};

function NewsSlide({ id, number, kicker, headline, summary, source, tone, active, children }: NewsSlideProps) {
  return (
    <section id={id} data-section={number} aria-hidden={!active} className={`deck-slide news-section section-${tone} ${active ? "is-active" : ""}`}>
      <span className="ghost-number" aria-hidden="true">{number}</span>
      <div className="section-wash" aria-hidden="true" />
      <div className="story-copy reveal">
        <div className="kicker"><span />{kicker}</div>
        <h2>{headline}</h2>
        <p>{summary}</p>
        <div className="source-badge">{source}</div>
      </div>
      <div className="story-visual reveal">{children}</div>
    </section>
  );
}

function PresidentVisual() {
  return (
    <div className="president-visual">
      <div className="gold-dust" aria-hidden="true">{Array.from({ length: 20 }, (_, i) => <i key={i} />)}</div>
      <div className="flag" aria-label="Eesti lipp"><i /><i /><i /></div>
      <div className="monogram" aria-label="Ülle Madise monogramm">ÜM</div>
      <div className="vote-block"><strong data-count="71">0</strong><span>häält</span><small>vaja oli 68</small></div>
      <div className="timeline"><b>2. sept</b><span>valimised</span><i>→</i><b>12. okt</b><span>ametisse astumine</span></div>
    </div>
  );
}

const scores = [
  ["Loodusteadused", 527],
  ["Matemaatika", 508],
  ["Lugemine", 499],
] as const;

function PisaVisual() {
  return (
    <div className="pisa-visual">
      <div className="laurel">#1 <span>EUROOPAS</span></div>
      <div className="chart" aria-label="PISA tulemused punktides">
        {scores.map(([label, value], index) => (
          <div className="bar-row" key={label}>
            <span>{label}</span>
            <div className="bar-track"><i data-width={`${(value / 550) * 100}%`} /></div>
            <strong data-count={value}>0</strong>
            {index === 2 && <em>kahaneb ↓</em>}
          </div>
        ))}
      </div>
      <p>Eesti on Euroopas esikohal</p>
    </div>
  );
}

function AiVisual({ active }: { active: boolean }) {
  const rain = ["01001101", "DELETE *", "01100110", "DROP DB", "10110101", "NO BACKUP"];
  const text = "> claude --execute\n> kustutan andmebaasi...\n> varukoopiad eemaldatud\n> valmis: üheksa sekundiga";
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) {
      setElapsed(0);
      return;
    }
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const next = Math.min(9, (now - started) / 1000);
      setElapsed(next);
      if (next < 9) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  const typed = text.slice(0, Math.floor(text.length * (elapsed / 9)));
  return (
    <div className="ai-visual">
      <div className="code-rain" aria-hidden="true">{rain.map((line, i) => <span key={i}>{line}</span>)}</div>
      <div className={`terminal ${elapsed >= 9 ? "is-done" : ""}`}>
        <div className="terminal-top"><i /><i /><i /><span>pocketOS / production</span></div>
        <div className="ai-timer" aria-label={`Möödunud ${elapsed.toFixed(1)} sekundit`}><strong>{elapsed.toFixed(1)}</strong><span>/ 9.0 SEK</span></div>
        <code className="terminal-copy"><span>{typed}</span></code>
        <div className="delete-progress"><i style={{ transform: `scaleX(${1 - elapsed / 9})` }} /></div>
        <div className="stamp">9 SEKUNDIT</div>
      </div>
    </div>
  );
}

function RonaldoVisual() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [swapped, setSwapped] = useState(false);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch" || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(x, y);
    setSwapped(distance < Math.min(200, rect.width * 0.42));
    gsap.to(wrapRef.current, { rotateY: x / rect.width * 10, rotateX: -y / rect.height * 8, duration: 0.35 });
  }

  return (
    <div className="ronaldo-scene" onPointerMove={handlePointerMove} onPointerLeave={() => {
      setSwapped(false);
      if (wrapRef.current) gsap.to(wrapRef.current, { rotateX: 0, rotateY: 0, duration: 0.4 });
    }}>
      <div className="floodlights" aria-hidden="true" />
      <div className="scoreboard">Al-Taawoun&nbsp; 0 : 6 &nbsp;Al-Hilal <b>90′</b></div>
      <div className="impact" aria-hidden="true" />
      <div className={`ronaldo-wrap ${swapped ? "is-swapped" : ""}`} ref={wrapRef} onClick={() => setSwapped((value) => !value)} role="button" tabIndex={0} aria-label="Vaheta Ronaldo särki" onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSwapped((value) => !value); }}>
        <img src={ronaldoRealMadrid} alt="Cristiano Ronaldo valges särgis, selgvaates" loading="lazy" width={1024} height={1536} />
        <img className="alnassr" src={ronaldoAlNassr} alt="Cristiano Ronaldo kollases särgis, selgvaates" loading="lazy" width={1024} height={1536} />
      </div>
      <span className="kit-hint">HOVERI / PUUDUTA</span>
    </div>
  );
}

const reasons = [
  { Icon: Trophy, source: "ERR", tone: "sport", text: "Valisime selle uudise, sest see puudutab spordietiikat ja fännikultuuri — ka maailmakuulsad staarid seavad käitumisele piire." },
  { Icon: Cpu, source: "Õhtuleht", tone: "ai", text: "Tehisintellekt mõjutab juba praegu meie kõigi elu, aga see lugu näitab ka selle riske. See on üks aktuaalsemaid tehnoloogiauudiseid." },
  { Icon: BookOpen, source: "Delfi", tone: "pisa", text: "Haridus puudutab meid otseselt kui õpilasi. Eesti tulemused on Euroopa tipus, kuid lugemisoskuse langus näitab, et arenguruumi on veel." },
  { Icon: Landmark, source: "Postimees", tone: "president", text: "Presidendivalimised on üks tähtsamaid poliitilisi sündmusi Eestis. Ülle Madise on Eesti seitsmes president ja teine naispresident — ajalooline sündmus." },
] as const;

const sources = [
  { outlet: "ERR", date: "13.09.2026", title: "Ronaldo nõudis Saudi profiliiga fännidele Jota skandeerimise eest eluaegset staadionikeeldu", url: ERR_LINK },
  { outlet: "Õhtuleht", date: "03.05.2026", title: "Ai-Ai! AI isetegevus kustutas ettevõtte kogu andmebaasi üheksa sekundiga", url: "https://www.ohtuleht.ee/1156878/ai-ai-ai-isetegevus-kustutas-ettevotte-kogu-andmebaasi-uheksa-sekundiga" },
  { outlet: "Delfi", date: "08.09.2026", title: "PISA 2025 tulemused: Eesti püsib Euroopas esikohal, kuid lugemisoskus halveneb", url: "https://www.delfi.ee/artikkel/120609068/otsepilt-ja-blogi-pisa-2025-tulemused-eesti-pusib-euroopas-esikohal-kuid-lugemisoskus-langeb" },
  { outlet: "Postimees", date: "02.09.2026", title: "Riigikogu valis presidendiks Ülle Madise", url: "https://news.postimees.ee/8538554/estonian-parliament-elects-ulle-madise-as-new-president" },
];

export function NewsPresentation() {
  const rootRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = String(activeIndex + 1).padStart(2, "0");
  const goTo = useCallback((index: number) => setActiveIndex(Math.max(0, Math.min(6, index))), []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const section = rootRef.current?.querySelector<HTMLElement>(`.deck-slide[data-section="${active}"]`);
    if (!section || reduceMotion) return;
    const context = gsap.context(() => {
      gsap.fromTo(section.querySelectorAll(".reveal"), { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: .75, stagger: .08, ease: "power3.out" });
      section.querySelectorAll<HTMLElement>("[data-count]").forEach((element) => {
        const target = Number(element.dataset["count"] ?? 0);
        const counter = { value: 0 };
        gsap.to(counter, { value: target, duration: 1.5, ease: "power2.out", onUpdate: () => { element.textContent = Math.round(counter.value).toString(); } });
      });
      section.querySelectorAll<HTMLElement>(".bar-track i").forEach((bar) => gsap.fromTo(bar, { width: 0 }, { width: bar.dataset["width"] ?? "0%", duration: 1.3, ease: "power3.out" }));
      if (activeIndex === 4) gsap.fromTo(section.querySelector(".ronaldo-wrap"), { y: "-120vh", rotate: -10 }, { y: 0, rotate: 0, duration: 1.05, ease: "bounce.out", onComplete: () => section.querySelector(".ronaldo-scene")?.classList.add("landed") });
      if (activeIndex === 5) gsap.fromTo(section.querySelectorAll(".reason-card"), { opacity: 0, rotateX: -70, y: 70 }, { opacity: 1, rotateX: 0, y: 0, stagger: .14, duration: .8, ease: "back.out(1.4)" });
    }, section);
    return () => context.revert();
  }, [active, activeIndex]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") goTo(activeIndex + 1);
      if (event.key === "ArrowLeft") goTo(activeIndex - 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, goTo]);

  return (
    <main ref={rootRef} className="presentation-shell">
      <div className="progress-track" aria-hidden="true"><i style={{ transform: `scaleX(${(activeIndex + 1) / 7})` }} /></div>
      <aside className="section-indicator" aria-label="Praegune osa"><strong>{active}</strong><span>/ 07</span></aside>
      <nav className="deck-controls" aria-label="Slaidide juhtimine">
        <Button variant="outline" size="icon" onClick={() => goTo(activeIndex - 1)} disabled={activeIndex === 0} aria-label="Eelmine slaid"><ArrowLeft /></Button>
        <span>{active} / 07</span>
        <Button variant="outline" size="icon" onClick={() => goTo(activeIndex + 1)} disabled={activeIndex === 6} aria-label="Järgmine slaid"><ArrowRight /></Button>
      </nav>

      <section className={`deck-slide hero-section ${activeIndex === 0 ? "is-active" : ""}`} data-section="01" aria-hidden={activeIndex !== 0}>
        <div className="hero-grid" aria-hidden="true" />
        <img className="hero-cast" src={heroNewsCast} alt="Ülle Madise, Eesti õpilane, tehisintellekt ja Cristiano Ronaldo" width={1920} height={1088} />
        <div className="hero-content">
          <p className="hero-label">SEPTEMBER 2026 · UUDISTE ÜLEVAADE</p>
          <h1><span>4</span> UUDIST</h1>
          <div className="outlet-row">{["ERR", "Delfi", "Postimees", "Õhtuleht"].map((name) => <b key={name}>{name}</b>)}</div>
          <p className="presenters">{PRESENTERS}</p>
        </div>
      </section>

      <NewsSlide active={activeIndex === 1} id="president" number="02" kicker="POLIITIKA" headline="Riigikogu valis presidendiks Ülle Madise" summary="2. septembril valis Riigikogu salajasel hääletusel Eesti uueks presidendiks põhiseadusjuristi ja õiguskantsleri Ülle Madise. Tema poolt hääletas 71 saadikut, võiduks oli vaja 68 häält. Madise on Eesti seitsmes president ja teine naispresident. Ametisse astub ta 12. oktoobril." source="Postimees · 02.09.2026" tone="president"><PresidentVisual /></NewsSlide>
      <NewsSlide active={activeIndex === 2} id="pisa" number="03" kicker="HARIDUS" headline="PISA 2025: Eesti püsib Euroopas esikohal, kuid lugemisoskus halveneb" summary="8. septembril avaldatud PISA 2025 tulemuste järgi on Eesti 15-aastaste õpilaste teadmised jätkuvalt Euroopa parimate hulgas: loodusteadustes 527, matemaatikas 508 ja lugemises 499 punkti. OECD riikide seas edestas Eestit üldpunktidega vaid Jaapan. Samas on lugemisoskus langenud, mis teeb hariduseksperte murelikuks." source="Delfi · 08.09.2026" tone="pisa"><PisaVisual /></NewsSlide>
      <NewsSlide active={activeIndex === 3} id="ai" number="04" kicker="TEHNOLOOGIA" headline="AI kustutas ettevõtte kogu andmebaasi üheksa sekundiga" summary="Tarkvarafirma PocketOS tehisintellekt Claude otsustas omapäi kustutada kogu ettevõtte andmebaasi koos varukoopiatega. Kadusid klientide andmed ja broneeringud. „See võttis üheksa sekundit,“ kirjutas asutaja Jer Crane. Andmed õnnestus mõne päevaga taastada." source="Õhtuleht · 03.05.2026" tone="ai"><AiVisual active={activeIndex === 3} /></NewsSlide>
      <NewsSlide active={activeIndex === 4} id="ronaldo" number="05" kicker="SPORT" headline="Ronaldo nõuab fännidele eluaegset staadionikeeldu" summary="Saudi profiliiga mängu ajal skandeerisid Al-Taawouni fännid Al-Hilali mängija Ruben Nevesi suunas tema surnud meeskonnakaaslase Diogo Jota nime. Cristiano Ronaldo ütles, et sellised fännid tuleks staadionile eluks ajaks keelata. Mäng lõppes Al-Hilali 6:0 võiduga." source="ERR · 13.09.2026" tone="sport"><RonaldoVisual /></NewsSlide>

      <section className={`deck-slide reasons-section ${activeIndex === 5 ? "is-active" : ""}`} data-section="06" aria-hidden={activeIndex !== 5}>
        <span className="ghost-number" aria-hidden="true">06</span>
        <div className="kicker"><span />MEIE VALIK</div>
        <h2>Miks me need uudised valisime?</h2>
        <div className="reasons-grid">{reasons.map(({ Icon, source, tone, text }) => <article className={`reason-card ${tone}`} key={source}><Icon aria-hidden="true" /><b>{source}</b><p>{text}</p></article>)}</div>
      </section>

      <section className={`deck-slide sources-section ${activeIndex === 6 ? "is-active" : ""}`} data-section="07" aria-hidden={activeIndex !== 6}>
        <span className="ghost-number" aria-hidden="true">07</span>
        <div className="kicker"><span />VIITED</div>
        <h2>Allikad</h2>
        <ol>{sources.map((source, index) => <li key={source.outlet}><a href={source.url} target="_blank" rel="noreferrer"><span>{String(index + 1).padStart(2, "0")}</span><div><b>{source.outlet} · {source.date}</b><p>{source.title}</p></div><ArrowUpRight aria-hidden="true" /></a></li>)}</ol>
        <footer><p>Koostasid: {PRESENTERS.replace(" & ", " ja ")} · september 2026 · Aitäh!</p><div><i /><i /><i /></div></footer>
      </section>
    </main>
  );
}