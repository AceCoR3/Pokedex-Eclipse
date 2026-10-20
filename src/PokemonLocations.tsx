import {useEffect,useMemo,useState} from 'react';
type Encounter={location_area:{name:string;url:string};version_details:{version:{name:string};max_chance:number;encounter_details:{min_level:number;max_level:number;method:{name:string}}[]}[]};
const de=(name:string)=>name.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
export default function PokemonLocations({id}:{id:number}){
const [data,setData]=useState<Encounter[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState(false);
useEffect(()=>{let active=true;setLoading(true);setError(false);setData([]);fetch('https://pokeapi.co/api/v2/pokemon/'+id+'/encounters').then(r=>{if(!r.ok)throw Error();return r.json()}).then((d:Encounter[])=>{if(active)setData(d)}).catch(()=>{if(active)setError(true)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[id]);
const places=useMemo(()=>data.map(d=>({name:de(d.location_area.name),versions:[...new Set(d.version_details.map(v=>de(v.version.name)))],levels:[...new Set(d.version_details.flatMap(v=>v.encounter_details.map(e=>e.min_level===e.max_level?'Lv. '+e.min_level:'Lv. '+e.min_level+'–'+e.max_level)))].slice(0,4)})),[data]);
if(loading)return <p className="muted">Fundorte werden geladen ...</p>;
if(error)return <p className="muted">Fundorte konnten momentan nicht geladen werden.</p>;
if(!places.length)return <p className="muted">Für dieses Pokémon sind in der PokéAPI keine Fangorte hinterlegt. Das gilt häufig für legendäre Pokémon, Geschenke, Zucht und neuere Spiele.</p>;
return <><p className="moves-hint">{places.length} Fundort{places.length!==1?'e':''} aus den verfügbaren Spieleditionen. Nicht jede Edition ist vollständig erfasst.</p><div className="locations-list">{places.map((p,i)=><div className="location-item" key={i}><strong>{p.name}</strong><span>{p.versions.join(' · ')}</span>{p.levels.length>0&&<small>{p.levels.join(' / ')}</small>}</div>)}</div></>
}
