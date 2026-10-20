import {useEffect,useMemo,useState} from 'react';
type Encounter={location_area:{name:string;url:string};version_details:{version:{name:string};max_chance:number;encounter_details:{min_level:number;max_level:number;method:{name:string}}[]}[]};
type AreaDetail={location:{name:string;url:string}};
type LocationDetail={region:{name:string}};
type MapConfig={src:string;points:Record<string,{x:number;y:number}>};
const editionRegion:Record<string,string>={'red':'kanto','blue':'kanto','yellow':'kanto','firered':'kanto','leafgreen':'kanto','lets-go-pikachu':'kanto','lets-go-eevee':'kanto','gold':'johto','silver':'johto','crystal':'johto','heartgold':'johto','soulsilver':'johto','ruby':'hoenn','sapphire':'hoenn','emerald':'hoenn','omega-ruby':'hoenn','alpha-sapphire':'hoenn','diamond':'sinnoh','pearl':'sinnoh','platinum':'sinnoh','brilliant-diamond':'sinnoh','shining-pearl':'sinnoh','black':'unova','white':'unova','black-2':'unova','white-2':'unova','x':'kalos','y':'kalos','sun':'alola','moon':'alola','ultra-sun':'alola','ultra-moon':'alola','sword':'galar','shield':'galar','scarlet':'paldea','violet':'paldea'};
const regionNames:Record<string,string>={kanto:'Kanto',johto:'Johto',hoenn:'Hoenn',sinnoh:'Sinnoh',unova:'Einall',kalos:'Kalos',alola:'Alola',galar:'Galar',paldea:'Paldea'};
const de=(name:string)=>name.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
/* Original-map image files can be added under public/maps/ with explicit rights clearance.
   Coordinates must be surveyed against each exact image, never guessed. */
const maps:Record<string,MapConfig>={};
export default function PokemonLocations({id}:{id:number}){
const [data,setData]=useState<Encounter[]>([]);
const [loading,setLoading]=useState(true);
const [error,setError]=useState(false);
const [edition,setEdition]=useState('');
const [selectedArea,setSelectedArea]=useState('');
const [regions,setRegions]=useState<Record<string,string>>({});
const [zoom,setZoom]=useState(false);
useEffect(()=>{let active=true;setLoading(true);setError(false);setData([]);setEdition('');setSelectedArea('');setRegions({});fetch('https://pokeapi.co/api/v2/pokemon/'+id+'/encounters').then(r=>{if(!r.ok)throw Error();return r.json()}).then((d:Encounter[])=>{if(active)setData(d)}).catch(()=>{if(active)setError(true)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[id]);
const editions=useMemo(()=>[...new Set(data.flatMap(d=>d.version_details.map(v=>v.version.name)))].sort(),[data]);
useEffect(()=>{if(editions.length&&!editions.includes(edition))setEdition(editions[0])},[editions,edition]);
const places=useMemo(()=>data.map(d=>{const version=d.version_details.find(v=>v.version.name===edition);if(!version)return null;const levels=[...new Set(version.encounter_details.map(e=>e.min_level===e.max_level?'Lv. '+e.min_level:'Lv. '+e.min_level+'–'+e.max_level))];const methods=[...new Set(version.encounter_details.map(e=>de(e.method.name)))];return {key:d.location_area.name,name:de(d.location_area.name),url:d.location_area.url,levels,methods,chance:version.max_chance}}).filter((p):p is NonNullable<typeof p>=>p!==null),[data,edition]);
useEffect(()=>{setSelectedArea(places[0]?.key||'')},[edition,id,data]);
useEffect(()=>{if(!places.length)return;let active=true;const missing=places.filter(p=>!(p.key in regions));if(!missing.length)return;const run=async()=>{const found:Record<string,string>={};for(let i=0;i<missing.length&&active;i+=6){await Promise.all(missing.slice(i,i+6).map(async p=>{try{const area:AreaDetail=await fetch(p.url).then(r=>{if(!r.ok)throw Error();return r.json()});const loc:LocationDetail=await fetch(area.location.url).then(r=>{if(!r.ok)throw Error();return r.json()});found[p.key]=loc.region.name}catch{found[p.key]=''}}));if(active)setRegions(old=>({...old,...found}))}};void run();return()=>{active=false}},[places,regions]);
const active=places.find(p=>p.key===selectedArea)||places[0];
const fallbackRegion=editionRegion[edition]||'';
const region=active&&regions[active.key]||fallbackRegion;
const map=maps[edition]||maps[region];
const pin=active&&map?.points[active.key];
if(loading)return <p className="muted">Fundorte und Editionen werden geladen ...</p>;
if(error)return <p className="muted">Fundorte konnten momentan nicht geladen werden.</p>;
if(!editions.length)return <p className="muted">Für dieses Pokémon sind in der PokéAPI keine Fangorte hinterlegt. Manche Begegnungen, Geschenke, Zucht und neuere Editionen werden nicht erfasst.</p>;
return <div className="encounter-atlas"><div className="encounter-toolbar"><label htmlFor="encounter-edition">Spieledition</label><select id="encounter-edition" value={edition} onChange={e=>setEdition(e.target.value)}>{editions.map(v=><option key={v} value={v}>{de(v)}</option>)}</select><span>{places.length} Fundorte</span></div><div className="encounter-map" aria-label="Kartenbereich">{map?<div className={'encounter-map-image '+(zoom?'zoomed':'')}><img src={map.src} alt={'Regionskarte '+(regionNames[region]||de(region))}/>{pin&&<div className="encounter-pulse" style={{left:pin.x+'%',top:pin.y+'%'}} title={active?.name}><span/></div>}</div>:<div className="encounter-map-unavailable"><div className="encounter-map-symbol">⌖</div><strong>{regionNames[region]||de(region)||'Region'} · {de(edition)}</strong><p>Für diese Edition ist noch keine rechtlich freigegebene Originalkarte mit geprüften Fundort-Koordinaten hinterlegt.</p></div>}{map&&<button className="encounter-zoom" type="button" onClick={()=>setZoom(v=>!v)}>{zoom?'Karte verkleinern':'Karte vergrößern'}</button>}</div><div className="encounter-selected"><span className="encounter-live-dot"/><div><small>AUSGEWÄHLTER FUNDORT</small><strong>{active?.name||'Kein Fundort'}</strong><span>{active?.levels.join(' · ')||'Level unbekannt'}{active?.methods.length?' · '+active.methods.join(', '):''}</span></div></div><p className="moves-hint">Wähle einen Fundort. Ein blinkender Marker erscheint nur dort, wo die Position auf einer geprüften Karte hinterlegt ist. Die PokéAPI liefert selbst keine Kartenkoordinaten.</p><div className="locations-list">{places.map(p=><button type="button" className={'location-item encounter-location '+(active?.key===p.key?'selected':'')} key={p.key} onClick={()=>setSelectedArea(p.key)}><strong>{p.name}</strong><span>{p.methods.join(' · ')||'Begegnung'}{p.chance>0?' · Chance '+p.chance+' %':''}</span><small>{p.levels.join(' / ')||'Level unbekannt'}</small></button>)}</div></div>
}
