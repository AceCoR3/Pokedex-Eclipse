import {useEffect,useMemo,useState} from 'react';
import {ArrowLeft,ArrowRight,Search,Star} from 'lucide-react';

const api='https://pokeapi.co/api/v2';
type Named={name:string;url:string};
type Localized={name:string;language:{name:string}};
type TextEntry={effect?:string;short_effect?:string;flavor_text?:string;language:{name:string};version_group?:Named};
type Ability={id:number;name:string;names:Localized[];effect_entries:TextEntry[];flavor_text_entries:TextEntry[];pokemon:{is_hidden:boolean;slot:number;pokemon:Named}[];generation:Named;is_main_series:boolean};
const idFrom=(url:string)=>Number(url.match(/\/(\d+)\/$/)?.[1]||0);
const readable=(name:string)=>name.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
const german=(a:Ability)=>a.names.find(n=>n.language.name==='de')?.name||readable(a.name);
const clean=(s:string)=>s.replace(/[\n\f\r]+/g,' ').trim();
const sprite=(id:number)=>'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/'+id+'.png';
export default function AbilityDex({onPokemon}:{onPokemon:(id:number)=>void}){
 const [all,setAll]=useState<Named[]>([]);
 const [data,setData]=useState<Record<number,Ability>>({});
 const [query,setQuery]=useState('');
 const [page,setPage]=useState(0);
 const [active,setActive]=useState<Ability|null>(null);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const [showPokemon,setShowPokemon]=useState(48);
 const [pokemonNames,setPokemonNames]=useState<Record<number,string>>({});
 useEffect(()=>{let live=true;fetch(api+'/ability?limit=1000').then(r=>{if(!r.ok)throw Error('Fähigkeiten konnten nicht geladen werden.');return r.json()}).then((d:{results:Named[]})=>{if(live)setAll(d.results)}).catch(()=>{if(live)setError('Die PokéAPI ist derzeit nicht erreichbar.')});return()=>{live=false}},[]);
 const filtered=useMemo(()=>{const q=query.trim().toLocaleLowerCase('de');return all.filter(a=>{const id=idFrom(a.url);return !q||a.name.includes(q)||String(id)===q||data[id]?.names.some(n=>n.language.name==='de'&&n.name.toLocaleLowerCase('de').includes(q))})},[all,query,data]);
 const shown=filtered.slice(page*48,(page+1)*48);
 useEffect(()=>{if(active)return;let live=true;const missing=shown.filter(a=>!data[idFrom(a.url)]);const run=async()=>{for(let i=0;i<missing.length&&live;i+=8){const batch=await Promise.all(missing.slice(i,i+8).map(async a=>{try{const r=await fetch(a.url);if(!r.ok)return null;return await r.json() as Ability}catch{return null}}));if(live)setData(old=>({...old,...Object.fromEntries(batch.filter((a):a is Ability=>a!==null).map(a=>[a.id,a]))}))}};void run();return()=>{live=false}},[page,query,all,active]);
 const open=async(a:Named)=>{setLoading(true);setError('');setShowPokemon(48);try{const id=idFrom(a.url);let ability=data[id];if(!ability){const r=await fetch(a.url);if(!r.ok)throw Error();ability=await r.json() as Ability;setData(old=>({...old,[id]:ability}))}setActive(ability);window.scrollTo({top:0,behavior:'smooth'})}catch{setError('Fähigkeit konnte nicht geladen werden.')}finally{setLoading(false)}};
 const pokemon=useMemo(()=>active?[...active.pokemon].sort((a,b)=>idFrom(a.pokemon.url)-idFrom(b.pokemon.url)):[],[active]);
 useEffect(()=>{if(!active)return;let live=true;const unknown=pokemon.slice(0,showPokemon).filter(p=>{const id=idFrom(p.pokemon.url);return id>0&&!pokemonNames[id]});const run=async()=>{for(let i=0;i<unknown.length&&live;i+=8){const batch=await Promise.all(unknown.slice(i,i+8).map(async p=>{const id=idFrom(p.pokemon.url);try{const r=await fetch(api+'/pokemon-species/'+id);if(!r.ok)return [id,readable(p.pokemon.name)] as const;const d=await r.json() as {names:Localized[]};return [id,d.names.find(n=>n.language.name==='de')?.name||readable(p.pokemon.name)] as const}catch{return [id,readable(p.pokemon.name)] as const}}));if(live)setPokemonNames(old=>({...old,...Object.fromEntries(batch)}))}};void run();return()=>{live=false}},[active,showPokemon]);
 const effect=active?.effect_entries.find(e=>e.language.name==='de');
 const flavor=active?.flavor_text_entries.filter(e=>e.language.name==='de').slice(-1)[0];
 const fallback=active?.effect_entries.find(e=>e.language.name==='en');
 const description=effect?.short_effect||flavor?.flavor_text||fallback?.short_effect||'Für diese Fähigkeit liegt in der PokéAPI noch keine Beschreibung vor.';
 return <div className="abilitydex">
 <div className="topline"><span>POKÉDEX / <b>FÄHIGKEITEN</b></span><span>{all.length?all.length+' FÄHIGKEITEN':'POKÉAPI'}</span></div>
 {active?<><button className="attack-back" onClick={()=>setActive(null)}><ArrowLeft size={17}/> Alle Fähigkeiten</button>
 <div className="ability-hero"><span className="ability-hero-icon"><Star size={30}/></span><div><span className="eyebrow">FÄHIGKEIT #{String(active.id).padStart(3,'0')}</span><h1>{german(active)}</h1><p>{readable(active.name)} · {readable(active.generation.name)} {active.is_main_series?'':'· Außerhalb der Hauptspiele'}</p></div></div>
 <div className="panel ability-description"><div className="panelhead"><span>WIRKUNG DER FÄHIGKEIT</span></div><p>{clean(description)}</p>{effect?.effect&&effect.effect!==effect.short_effect&&<><h3>Ausführliche Wirkung</h3><p>{clean(effect.effect)}</p></>}{!effect&&<p className="muted">Hinweis: Die PokéAPI bietet hierfür keine vollständige deutsche Wirkungsbeschreibung. {fallback?'Der angezeigte Ersatztext stammt aus dem englischen Datensatz.':''}</p>}</div>
 <div className="panel ability-pokemon-panel"><div className="panelhead"><span>POKÉMON MIT DIESER FÄHIGKEIT</span><span className="muted">{pokemon.length} POKÉMON · {pokemon.filter(p=>p.is_hidden).length} VERSTECKT</span></div>
 <p className="ability-hint">Die Kennzeichnung „Versteckt“ zeigt an, dass ein Pokémon diese Fähigkeit als versteckte Fähigkeit besitzen kann.</p>
 <div className="ability-pokemon-grid">{pokemon.slice(0,showPokemon).map(p=>{const id=idFrom(p.pokemon.url);return <button key={p.pokemon.name} className="ability-pokemon-card" onClick={()=>onPokemon(id)}><span className="ability-pokemon-id">#{String(id).padStart(4,'0')}</span><img loading="lazy" src={sprite(id)} alt={pokemonNames[id]||readable(p.pokemon.name)} onError={e=>{e.currentTarget.style.opacity='.2'}}/><strong>{pokemonNames[id]||readable(p.pokemon.name)}</strong><span className={p.is_hidden?'ability-hidden':'ability-regular'}>{p.is_hidden?'Versteckt':'Regulär'}</span></button>})}</div>
 {showPokemon<pokemon.length&&<button className="ability-more" onClick={()=>setShowPokemon(n=>n+48)}>Weitere Pokémon anzeigen ({pokemon.length-showPokemon} übrig) <ArrowRight size={16}/></button>}
 {!pokemon.length&&<p className="muted">Keine Pokémon-Zuordnungen in der PokéAPI hinterlegt.</p>}</div></>:<>
 <div className="listhead"><span className="eyebrow">POKÉDEXION / WISSENSDATENBANK</span><h1>Alle Fähigkeiten</h1><p>Alle Fähigkeiten aus der PokéAPI – deutsche Namen, Wirkungen und die Pokémon, die sie besitzen können.</p></div>
 <div className="searchbox"><Search size={19}/><input value={query} onChange={e=>{setQuery(e.target.value);setPage(0)}} placeholder="Fähigkeit suchen (Deutsch, Englisch oder Nummer) …"/></div>
 <p className="ability-hint">{filtered.length} Fähigkeiten · Deutsche Namen werden beim Laden der Einträge ergänzt.</p>
 <div className="ability-grid">{shown.map(a=>{const id=idFrom(a.url);const d=data[id];return <button className="ability-card" key={a.name} onClick={()=>open(a)}><span className="ability-number">#{String(id).padStart(3,'0')}</span><span className="ability-card-icon"><Star size={21}/></span><strong>{d?german(d):readable(a.name)}</strong><small>{d?d.pokemon.length+' Pokémon':'PokéAPI'}</small><ArrowRight size={17}/></button>})}</div>
 {all.length>0&&!filtered.length&&<p className="muted">Keine Fähigkeiten gefunden. Bei deutschen Namen werden die Daten seitenweise geladen.</p>}
 <div className="attack-pages"><button disabled={page===0} onClick={()=>setPage(p=>p-1)}>Zurück</button><span>Seite {page+1} / {Math.max(1,Math.ceil(filtered.length/48))}</span><button disabled={(page+1)*48>=filtered.length} onClick={()=>setPage(p=>p+1)}>Weiter</button></div></>}
 {loading&&<p className="attack-loading">Fähigkeit wird geladen …</p>}{error&&<p className="error">{error}</p>}
 </div>
}
