import {useEffect,useState} from 'react';

/** Original PokeAPI item sprites: tm-{type}.png for all 18 Pokemon types. */
const spriteRoot='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/';
const supportedTypes=new Set(['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy']);
const hmTypes=new Set(['normal','fighting','flying','water']);
export function MoveDisc({type,sprite,kind='tm'}:{type:string;sprite?:string;kind?:'tm'|'hm'}){
  const validType=supportedTypes.has(type)?type:'normal';
  const machineKind=kind==='hm'&&hmTypes.has(validType)?'hm':'tm';
  const typedSprite=spriteRoot+machineKind+'-'+validType+'.png';
  const [url,setUrl]=useState(typedSprite);
  useEffect(()=>setUrl(typedSprite),[typedSprite]);
  return <span className="profile-move-disc" aria-hidden="true"><img src={url} alt="" width="40" height="40" loading="lazy" style={{objectFit:'contain',imageRendering:'pixelated'}} onError={()=>{if(url!==sprite&&sprite)setUrl(sprite);else if(url!==spriteRoot+'tm-normal.png')setUrl(spriteRoot+'tm-normal.png')}}/></span>;
}
