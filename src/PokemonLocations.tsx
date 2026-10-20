import {useEffect,useMemo,useState} from 'react';

type Encounter={location_area:{name:string};version_details:{version:{name:string};max_chance:number;encounter_details:{min_level:number;max_level:number;method:{name:string}}[]}[]};
const format=(name:string)=>name.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
export default function PokemonLocations({id}:{id:number}){
 const [data,setData]=useState<Encounter[]>([]);
 const [edition,setEdition]=useState('');
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState(false);
 useEffect(()=>{let active=true;setLoading(true);setError(false);setData([]);setEdition('');fetch('https://pokeapi.co/api/v2/pokemon/'+id+'/encounters').then(r=>{if(!r.ok)throw Error();return r.json()}).then((d:Encounter[])=>{if(active)setData(d)}).catch(()=>{if(active)setError(true)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[id]);
 const editions=useMemo(()=>[...new Set(data.flatMap(d=>d.version_details.map(v=>v.version.name)))].sort(),[data]);
 useEffect(()=>{if(editions.length&&!editions.includes(edition))setEdition(editions[0])},[editions,edition]);
 const places=useMemo(()=>data.flatMap(d=>{const v=d.version_details.find(v=>v.version.name===edition);if(!v)return [];const levels=[...new Set(v.encounter_details.map(e=>e.min_level===e.max_level?'Lv. '+e.min_level:'Lv. '+e.min_level+'–'+e.max_level))];const methods=[...new Set(v.encounter_details.map(e=>format(e.method.name)))];return [{name:format(d.location_area.name),levels,methods}]}).sort((a,b)=>a.name.localeCompare(b.name,'de')),[data,edition]);
 if(loading)return <p className="muted">Fundorte werden geladen ...</p>;
 if(error)return <p className="muted">Fundorte konnten momentan nicht geladen werden.</p>;
 if(!editions.length)return <p className="muted">Für dieses Pokémon sind in der PokéAPI keine Fundorte hinterlegt. Geschenke, Zucht und manche neuere Editionen werden nicht vollständig erfasst.</p>;
 return <div className="encounter-atlas"><div className="encounter-toolbar"><label htmlFor="encounter-edition">Spieledition</label><select id="encounter-edition" value={edition} onChange={e=>setEdition(e.target.value)}>{editions.map(v=><option key={v} value={v}>{format(v)}</option>)}</select><span>{places.length} Fundorte</span></div><div className="locations-list">{places.map(p=><div className="location-item encounter-location" key={p.name}><strong>{p.name}</strong><span>{p.methods.join(' · ')||'Begegnung'}</span><small>{p.levels.join(' / ')||'Level unbekannt'}</small></div>)}</div><p className="moves-hint">Die Angaben stammen aus der PokéAPI. Je nach Edition können besondere Begegnungen oder Fundorte fehlen.</p></div>;
}
