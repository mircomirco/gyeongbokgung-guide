"use client";

import { useEffect, useMemo, useState } from "react";

type Place = {
  id: string;
  name: string;
  korean: string;
  kind: string;
  lat: number;
  lng: number;
  era: string;
  minutes: number;
  story: string;
  detail: string;
};

const places: Place[] = [
  { id: "gwanghwamun", name: "Gwanghwamun", korean: "광화문", kind: "Porta principale", lat: 37.57590, lng: 126.97684, era: "1395 · ricostruita nel 2010", minutes: 3, story: "La soglia monumentale del palazzo e il punto in cui la città incontra la corte reale.", detail: "Il nome significa “Porta della trasformazione luminosa”. Era l’ingresso meridionale al palazzo principale dei Joseon. Distrutta e spostata più volte, è tornata sul suo asse storico con la ricostruzione completata nel 2010." },
  { id: "heungnyemun", name: "Heungnyemun", korean: "흥례문", kind: "Seconda porta", lat: 37.57718, lng: 126.97691, era: "Area cerimoniale", minutes: 2, story: "Qui il percorso rallenta: oltre la porta iniziava il mondo regolato della corte.", detail: "Il cortile fra Gwanghwamun e Heungnyemun fu profondamente alterato nel periodo coloniale. La porta odierna fa parte del lungo progetto di recupero dell’assetto storico del palazzo." },
  { id: "geunjeongjeon", name: "Geunjeongjeon", korean: "근정전", kind: "Sala del trono", lat: 37.57863, lng: 126.97688, era: "Tesoro nazionale · 1867", minutes: 5, story: "Il cuore politico della dinastia: incoronazioni, udienze e grandi cerimonie di Stato.", detail: "Osserva le pietre di rango nel cortile: indicavano dove dovevano disporsi i funzionari. Il padiglione attuale risale alla grande ricostruzione del 1867 e conserva la solennità dell’architettura reale Joseon." },
  { id: "sajeongjeon", name: "Sajeongjeon", korean: "사정전", kind: "Ufficio del re", lat: 37.57930, lng: 126.97690, era: "1395 · ricostruita nel 1867", minutes: 4, story: "Non solo cerimonie: qui il sovrano lavorava ogni giorno con i suoi ministri.", detail: "Sajeongjeon significa “Sala del governo ponderato”. Era il principale spazio di lavoro quotidiano del re. Gli edifici laterali avevano il riscaldamento ondol e risultavano più confortevoli in inverno." },
  { id: "gyeonghoeru", name: "Gyeonghoeru", korean: "경회루", kind: "Padiglione sul lago", lat: 37.57970, lng: 126.97510, era: "Tesoro nazionale · 1867", minutes: 6, story: "Un’isola cerimoniale sull’acqua, costruita per banchetti reali e ospiti diplomatici.", detail: "Il padiglione si alza su 48 colonne di pietra. La superficie riflettente dello stagno e il profilo del monte Bugaksan trasformano il paesaggio in una scenografia del potere reale." },
  { id: "gangnyeongjeon", name: "Gangnyeongjeon", korean: "강녕전", kind: "Residenza del re", lat: 37.58002, lng: 126.97692, era: "Quartiere privato", minutes: 4, story: "La vita privata del sovrano iniziava qui, dietro le sale ufficiali.", detail: "Era la camera e residenza principale del re. Il tetto è privo della grande trave di colmo decorata: secondo la tradizione, nessun simbolo di drago poteva sovrastare il re, lui stesso associato al drago." },
  { id: "gyotaejeon", name: "Gyotaejeon", korean: "교태전", kind: "Residenza della regina", lat: 37.58054, lng: 126.97693, era: "Quartiere privato", minutes: 4, story: "La residenza della regina e centro della vita della famiglia reale.", detail: "Dietro la sala si trova Amisan, un giardino a terrazze creato con la terra scavata per lo stagno di Gyeonghoeru. I camini decorati uniscono funzione, simbolismo e paesaggio." },
  { id: "hyangwonjeong", name: "Hyangwonjeong", korean: "향원정", kind: "Padiglione del loto", lat: 37.58255, lng: 126.97675, era: "c. 1873", minutes: 5, story: "Il volto più intimo del palazzo: un padiglione esagonale sospeso tra acqua e loto.", detail: "Il nome evoca una “fragranza che arriva lontano”. Il ponte Chwihyanggyo conduce all’isola; l’insieme fu creato durante il regno di Gojong come luogo di riposo nel settore settentrionale." },
  { id: "geoncheonggung", name: "Geoncheonggung", korean: "건청궁", kind: "Residenza reale", lat: 37.58310, lng: 126.97730, era: "1873 · ricostruita nel 2007", minutes: 7, story: "Una residenza quasi domestica, legata agli ultimi anni drammatici della corte.", detail: "Costruita per re Gojong e la regina Myeongseong, adottava lo stile di una casa aristocratica. Nel vicino Gonnyeonghap la regina fu assassinata nel 1895, evento decisivo nella crisi della Corea di fine Ottocento." },
  { id: "jibokjae", name: "Jibokjae", korean: "집옥재", kind: "Biblioteca reale", lat: 37.58215, lng: 126.97810, era: "Fine XIX secolo", minutes: 4, story: "Una biblioteca reale dall’insolito linguaggio architettonico di influenza cinese.", detail: "Gojong la usò come biblioteca e sala di ricevimento. Le facciate in mattoni e le decorazioni la distinguono nettamente dai padiglioni lignei che scandiscono il resto del palazzo." },
];

const bounds = { north: 37.5840, south: 37.57535, west: 126.97425, east: 126.97865 };

function distanceMeters(a: {lat:number; lng:number}, b: {lat:number; lng:number}) {
  const r = 6371000;
  const p1 = a.lat * Math.PI / 180;
  const p2 = b.lat * Math.PI / 180;
  const dp = (b.lat - a.lat) * Math.PI / 180;
  const dl = (b.lng - a.lng) * Math.PI / 180;
  const h = Math.sin(dp/2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) ** 2;
  return 2 * r * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
}

function position(lat:number, lng:number) {
  return { left: `${((lng - bounds.west) / (bounds.east - bounds.west)) * 100}%`, top: `${((bounds.north - lat) / (bounds.north - bounds.south)) * 100}%` };
}

export default function Home() {
  const [selected, setSelected] = useState("geunjeongjeon");
  const [location, setLocation] = useState<{lat:number; lng:number; accuracy?:number} | null>(null);
  const [gpsState, setGpsState] = useState<"idle"|"loading"|"active"|"error">("idle");
  const [sheetOpen, setSheetOpen] = useState(true);

  useEffect(() => {
    if (location) {
      const closest = places.reduce((best, place) => distanceMeters(location, place) < distanceMeters(location, best) ? place : best);
      setSelected(closest.id);
    }
  }, [location]);

  const place = places.find(p => p.id === selected)!;
  const nearestDistance = location ? Math.round(distanceMeters(location, place)) : null;
  const inside = location && location.lat >= bounds.south && location.lat <= bounds.north && location.lng >= bounds.west && location.lng <= bounds.east;
  const ordered = useMemo(() => location ? [...places].sort((a,b) => distanceMeters(location,a)-distanceMeters(location,b)) : places, [location]);

  function locate() {
    if (!navigator.geolocation) return setGpsState("error");
    setGpsState("loading");
    navigator.geolocation.getCurrentPosition(
      p => { setLocation({lat:p.coords.latitude, lng:p.coords.longitude, accuracy:p.coords.accuracy}); setGpsState("active"); setSheetOpen(true); },
      () => setGpsState("error"),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
    );
  }

  function choose(id:string) { setSelected(id); setSheetOpen(true); }

  return (
    <main>
      <header className="topbar">
        <div className="brand"><span className="brandMark">景</span><span><b>Gyeongbokgung</b><small>La tua guida nel palazzo</small></span></div>
        <button className={`gpsButton ${gpsState}`} onClick={locate} aria-label="Trova la mia posizione">
          <span className="targetIcon">⌾</span>{gpsState === "loading" ? "Cerco…" : gpsState === "active" ? "Posizione" : "Localizzami"}
        </button>
      </header>

      <section className="mapArea" aria-label="Mappa interattiva del palazzo">
        <div className="mountain">BUGAKSAN · 북악산</div>
        <div className="mapGrid" />
        <div className="axis" />
        <div className="pond pondNorth" /><div className="pond pondWest" />
        <div className="garden">GIARDINI REALI</div>
        {places.map((p, i) => <button key={p.id} onClick={() => choose(p.id)} style={position(p.lat,p.lng)} className={`marker ${selected === p.id ? "selected" : ""}`} aria-label={p.name}><span>{i+1}</span><em>{p.name}</em></button>)}
        {location && inside && <div className="userPin" style={position(location.lat,location.lng)}><span /><i>Tu sei qui</i></div>}
        <div className="compass"><b>N</b><span>↑</span></div>
        <div className="mapHint">Tocca un luogo per scoprirlo</div>
      </section>

      {gpsState === "error" && <div className="notice">Non riesco a leggere il GPS. Puoi esplorare toccando i punti sulla mappa.</div>}
      {location && !inside && <div className="notice">Sei fuori dal perimetro del palazzo. La mappa resta esplorabile manualmente.</div>}

      <section className={`storySheet ${sheetOpen ? "open" : "closed"}`}>
        <button className="sheetHandle" onClick={() => setSheetOpen(v => !v)} aria-label={sheetOpen ? "Riduci scheda" : "Apri scheda"}><span /></button>
        <div className="storyTop">
          <div><p className="eyebrow">{nearestDistance !== null ? `A ${nearestDistance} m da te` : place.kind}</p><h1>{place.name}</h1><p className="korean">{place.korean} · {place.era}</p></div>
          <div className="stopNumber">{places.findIndex(p=>p.id===place.id)+1}<small>/10</small></div>
        </div>
        <p className="lead">{place.story}</p>
        <p className="detail">{place.detail}</p>
        <div className="actions"><button onClick={() => window.speechSynthesis.speak(new SpeechSynthesisUtterance(`${place.name}. ${place.story} ${place.detail}`))}>▷ Ascolta</button><span>⏱ {place.minutes} min</span></div>
      </section>

      <section className="routeSection">
        <div className="sectionTitle"><div><p className="eyebrow">ESPLORA</p><h2>{location ? "Vicino a te" : "Percorso consigliato"}</h2></div><span>{places.length} luoghi</span></div>
        <div className="placeList">{ordered.map((p,i) => <button key={p.id} onClick={() => choose(p.id)} className={selected===p.id?"active":""}><span className="listNum">{places.findIndex(x=>x.id===p.id)+1}</span><span className="listText"><b>{p.name}</b><small>{p.korean} · {p.kind}</small></span><span className="distance">{location ? `${Math.round(distanceMeters(location,p))} m` : `${p.minutes} min`} ›</span></button>)}</div>
      </section>

      <footer><b>궁 · GUNG</b><p>Contenuti culturali sintetici per la visita. Verifica sempre indicazioni e aree accessibili sul posto.</p><a href="https://www.royalpalace.go.kr/" target="_blank" rel="noreferrer">Sito ufficiale del palazzo ↗</a></footer>
    </main>
  );
}
