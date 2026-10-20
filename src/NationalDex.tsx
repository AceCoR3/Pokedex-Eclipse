import {useEffect,useMemo,useRef,useState} from 'react';
import {ArrowRight,Search,MapPin} from 'lucide-react';

type Entry={id:number;name:string};
type Region={id:string;name:string;generation:string;from:number;to:number};
const regions:Region[]=[
{id:'kanto',name:'Kanto',generation:'Generation I',from:1,to:151},
{id:'johto',name:'Johto',generation:'Generation II',from:152,to:251},
{id:'hoenn',name:'Hoenn',generation:'Generation III',from:252,to:386},
{id:'sinnoh',name:'Sinnoh',generation:'Generation IV',from:387,to:493},
{id:'einall',name:'Einall',generation:'Generation V',from:494,to:649},
{id:'kalos',name:'Kalos',generation:'Generation VI',from:650,to:721},
{id:'alola',name:'Alola',generation:'Generation VII',from:722,to:809},
{id:'galar',name:'Galar / Hisui',generation:'Generation VIII',from:810,to:905},
{id:'paldea',name:'Paldea',generation:'Generation IX',from:906,to:1025}
];
const batch=36;
const fmt=(id:number)=>'#'+String(id).padStart(4,'0');
const animated=(id:number)=>'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/'+id+'.gif';
const still=(id:number)=>'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+id+'.png';
function DexSprite({id}:{id:number}){const [src,setSrc]=useState(animated(id));useEffect(()=>setSrc(animated(id)),[id]);return <img src={src} alt="" loading="lazy" onError={()=>setSrc(old=>old===animated(id)?still(id):old)}/>}
export default function NationalDex({list,names,onSelect}:{list:{name:string;url:string}[];names:Record<number,string>;onSelect:(id:number)=>void}){
const [region,setRegion]=useState('all');const [search,setSearch]=useState('');const [visible,setVisible]=useState(batch);const sentinel=useRef<HTMLDivElement|null>(null);
const items=useMemo<Entry[]>(()=>list.map((p,i)=>({id:i+1,name:p.name})),[list]);
const filtered=useMemo(()=>items.filter(p=>{const area=regions.find(r=>p.id>=r.from&&p.id<=r.to);if(region!=='all'&&area?.id!==region)return false;const q=search.trim().toLocaleLowerCase('de-DE');return !q||(names[p.id]||p.name).toLocaleLowerCase('de-DE').includes(q)||p.name.includes(q)||String(p.id)===q||fmt(p.id).includes(q)}),[items,region,search,names]);
useEffect(()=>setVisible(batch),[region,search]);
useEffect(()=>{const node=sentinel.current;if(!node||visible>=filtered.length)return;const observer=new IntersectionObserver(entries=>{if(entries[0]?.isIntersecting)setVisible(n=>Math.min(n+batch,filtered.length))},{rootMargin:'550px 0px'});observer.observe(node);return()=>observer.disconnect()},[visible,filtered.length,region,search]);
const shown=filtered.slice(0,visible);
const grouped=regions.map(r=>({region:r,pokemon:shown.filter(p=>p.id>=r.from&&p.id<=r.to)})).filter(group=>group.pokemon.length>0);
return <div className="nationaldex"><div className="topline"><span>POKÉDEX / <b>NATIONALDEX</b></span><span>ALLE GENERATIONEN</span></div><div className="listhead"><span className="eyebrow">POKÉDEX ECLIPSE</span><h1>Nationaler Pokédex</h1><p>Alle {list.length||1025} Pokémon, nach Regionen und Generationen sortiert. Weitere Pokémon erscheinen automatisch beim Scrollen.</p></div><div className="dex-toolbar"><div className="searchbox"><Search size={19}/><input placeholder="Pokémon suchen (Name oder Nummer) ..." value={search} onChange={e=>setSearch(e.target.value)}/></div><label className="region-select"><MapPin size={18}/><select value={region} onChange={e=>setRegion(e.target.value)} aria-label="Region auswählen"><option value="all">Alle Regionen</option>{regions.map(r=><option key={r.id} value={r.id}>{r.name} · {r.generation}</option>)}</select></label></div><div className="region-chips"><button className={region==='all'?'active':''} onClick={()=>setRegion('all')}>Alle <small>{items.length}</small></button>{regions.map(r=><button key={r.id} className={region===r.id?'active':''} onClick={()=>setRegion(r.id)}>{r.name} <small>{items.filter(p=>p.id>=r.from&&p.id<=r.to).length}</small></button>)}</div><div className="dex-count">{shown.length} von {filtered.length} Pokémon angezeigt</div>{grouped.map(group=><section className="dex-region" key={group.region.id}><div className="dex-region-head"><div><span className="eyebrow">{group.region.generation} · #{String(group.region.from).padStart(4,'0')}–#{String(group.region.to).padStart(4,'0')}</span><h2>{group.region.name}</h2></div><span className="dex-region-total">{filtered.filter(p=>p.id>=group.region.from&&p.id<=group.region.to).length} Pokémon</span></div><div className="pokegrid">{group.pokemon.map(p=><button className="pokecard" key={p.id} onClick={()=>onSelect(p.id)}><span className="num">{fmt(p.id)}</span><DexSprite id={p.id}/><strong>{names[p.id]||p.name.replace(/-/g,' ')}</strong><ArrowRight size={16}/></button>)}</div></section>)}{!list.length&&<p className="muted">Pokémon werden geladen ...</p>}{list.length>0&&!filtered.length&&<p className="muted">Keine Pokémon für diese Suche gefunden.</p>}<div ref={sentinel} className="dex-sentinel">{visible<filtered.length?'Weitere Pokémon werden geladen ...':filtered.length?'Alle Pokémon dieser Auswahl angezeigt':''}</div></div>
}
