import SCENE_DATA from './positions.json';
import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {motion,AnimatePresence} from 'motion/react';
import confetti from 'canvas-confetti';
import {Heart,Volume2,VolumeX,RotateCcw,Sparkles} from 'lucide-react';
import {sound,unlockAudio,setAudioEnabled,setSfxVolume,stopSounds} from './audio';
import './style.css';
const CAT='./images/cat.png', GIFT='./images/pocket4.png';
// Two deliberate 2-second pauses: completed addition and Pocket 4 reveal.
const PAUSE_EQUATION_AT=3.35;
const PAUSE_POCKET_AT=19.85;
const PAUSE_SECONDS=2;
const PAUSE_POCKET_REVEAL_AT=22.0;
const DURATION=33000;
function storyTime(realSeconds){
 if(realSeconds<PAUSE_EQUATION_AT)return realSeconds;
 if(realSeconds<PAUSE_EQUATION_AT+PAUSE_SECONDS)return PAUSE_EQUATION_AT;
 const afterEquation=realSeconds-PAUSE_SECONDS;
 if(afterEquation<PAUSE_POCKET_AT)return afterEquation;
 if(afterEquation<PAUSE_POCKET_AT+PAUSE_SECONDS)return PAUSE_POCKET_AT;
 const afterPocket=afterEquation-PAUSE_SECONDS;
 if(afterPocket<PAUSE_POCKET_REVEAL_AT)return afterPocket;
 if(afterPocket<PAUSE_POCKET_REVEAL_AT+PAUSE_SECONDS)return PAUSE_POCKET_REVEAL_AT;
 return afterPocket-PAUSE_SECONDS;
}
function actualEventTime(ms){
 const seconds=ms/1000;
 return ms+(seconds>=PAUSE_EQUATION_AT?2000:0)+(seconds>=PAUSE_POCKET_AT?2000:0)+(seconds>=PAUSE_POCKET_REVEAL_AT?2000:0);
}
// Real elapsed seconds, matching the visible editing timeline (not storyTime).
// Each letter pop and each Pocket flight receives its own cue.
const SOUND_EVENTS=[
 [0.08,'whoosh'],[.55,'scatter'],[1.18,'scatter'],[2.15,'gather'],[3.0,'magicChime'],[3.9,'reveal'],
 [5.45,'rise'],[6.2,'twinkle'],[7.7,'softWhoosh'],[8.0,'jelly'],[9.2,'twinkle'],
 [10.5,'softWhoosh'],[11.6,'lettersIn'],[12.3,'reveal'],[13.2,'twinkle'],
 [15.25,'broomFly'],[16.15,'magicCharge'],[16.65,'wandCast'],
 ...Array.from({length:6},(_,i)=>[16.9+i*.29,'bubbleBurst',i]),
 [18.65,'magicCharge'],[19.2,'wandCastStrong'],
 ...Array.from({length:6},(_,i)=>[19.2+i*.25,'letterFly',i]),
 [19.78,'heart'],[20.7,'magicChime'],[22.7,'twinkle'],
 [24.0,'giftReveal'],[25.2,'twinkle'],[26.4,'twinkle'],[28.0,'softWhoosh'],
 [30.0,'birthdayFinal'],[31.2,'heart']
].sort((a,b)=>a[0]-b[0]);
function useClock(running,runId){
 const [elapsed,setElapsed]=useState(0);
 const [paused,setPaused]=useState(false);
 const elapsedRef=useRef(0),lastRef=useRef(null);
 useEffect(()=>{elapsedRef.current=0;setElapsed(0);setPaused(false);lastRef.current=null},[runId]);
 useEffect(()=>{if(!running||paused){lastRef.current=null;return;}let raf;
 const tick=(now)=>{if(lastRef.current!==null){elapsedRef.current=Math.min(DURATION,elapsedRef.current+Math.max(0,now-lastRef.current));setElapsed(elapsedRef.current)}lastRef.current=now;if(elapsedRef.current<DURATION)raf=requestAnimationFrame(tick)};
 raf=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(raf);lastRef.current=null};
 },[running,paused,runId]);
 const seek=(ms)=>{const v=Math.max(0,Math.min(DURATION,Number(ms)||0));elapsedRef.current=v;setElapsed(v);lastRef.current=null};
 return {elapsed,paused,setPaused,seek};
}
function Cat({className='',style={}}){return <img src={CAT} alt="Mèo cam đeo nơ hồng" draggable="false" className={'cat '+className} style={style}/>}
function Floating(){return <div className="floaties" aria-hidden="true">{['♡','✦','♥','✧','♡','✿','✦','♥','♡','✧'].map((x,i)=><span key={i} style={{'--x':(i*31+7)%100+'%','--delay':i*.37+'s','--duration':3+(i%4)*.6+'s'}}>{x}</span>)}</div>}
function Button({children,onClick,secondary=false}){return <motion.button whileTap={{scale:.92}} whileHover={{scale:1.025}} onClick={()=>{sound('pop');onClick?.()}} className={'pill '+(secondary?'secondary':'')}>{children}</motion.button>}
const NUMS='16112003'.split('');
const scatter=[[-110,-175,-29,1.55],[115,-205,28,.78],[-142,85,42,1.35],[145,105,-40,1.5],[-85,195,22,.8],[100,205,-30,1.3],[-135,-75,48,.88],[65,-220,-35,1.4]];
// The exact screen coordinates of the three real date inputs are captured before the movie starts.
// No duplicate numbers are drawn in the input boxes: the flying digits themselves start there.
// Coordinates are always measured in the same stage coordinate system.
// Each animated digit has a stable identity; no replacement glyph is introduced.
const centerText={position:'absolute',left:0,top:0,display:'block',whiteSpace:'nowrap',lineHeight:1,fontFamily:'Baloo 2',fontWeight:800,color:'#e66b9e',textShadow:'0 5px #ffcbdf',pointerEvents:'none'};
function Glyph({children,x,y,fontSize=50,...props}){return <motion.div style={{...centerText,fontSize,zIndex:6}} {...props}><span style={{display:'block',transform:'translate(-50%,-50%)'}}>{children}</span></motion.div>}
function NumberStory({t,origin}){
 const root=useRef(null),slot=useRef(null),phone=useRef(null);
 const [geometry,setGeometry]=useState({w:390,h:780,slot:null,phone:null});
 useEffect(()=>{const el=root.current;if(!el)return;const measure=()=>{const r=el.getBoundingClientRect();const pos=node=>{if(!node)return null;const q=node.getBoundingClientRect();return{x:q.left-r.left+q.width/2,y:q.top-r.top+q.height/2}};setGeometry({w:r.width,h:r.height,slot:pos(slot.current),phone:pos(phone.current)})};measure();const ro=new ResizeObserver(measure);ro.observe(el);if(slot.current)ro.observe(slot.current);if(phone.current)ro.observe(phone.current);return()=>ro.disconnect()},[t>=5.1,t>=11.1]);
 const {w,h}=geometry,cx=w/2,cy=h*.47;
 const fields=origin?.fields||[];
 const starts=NUMS.map((n,i)=>{const group=i<2?0:i<4?1:2;const idx=i<2?i:i<4?i-2:i-4;const f=fields[group];if(!f)return{x:cx+(i-3.5)*13,y:cy-130};const count=group===2?4:2;const gap=group===2?16:17;return{x:f.x+f.width/2+(idx-(count-1)/2)*gap,y:f.y+f.height/2}});
 const scattered=t>=.55,gathering=t>=2.25,show14=t>=3.75,topArrives=t>=5.15,oneLands=t>=7.45,topLeaves=t>=10.3,phoneArrives=t>=11.15,fourLands=t>=12.25;
 // Eight digits + seven plus signs: fixed slot centers guarantee no overlaps.
 const gap=Math.min(24,(w-36)/15),startX=cx-7*gap;
 const topY=h*.13,slotPos=geometry.slot||{x:cx+79,y:h*.32};
 const phonePos=geometry.phone||{x:cx-12,y:h*.5};
 // iPhone width is measured from the DOM; 4 sits at its right edge.
 const phoneRight=phone.current?phone.current.getBoundingClientRect().width/2:110;
 const fourPhone={x:phonePos.x+phoneRight+22,y:phonePos.y+3};
 const originTop=h*.43;
 return <div className="number-story" ref={root}>
  {fields.map((f,i)=><motion.div key={'field'+i} className="origin-field" style={{left:f.x,top:f.y,width:f.width,height:f.height}} animate={{opacity:t<.35?1:0}} transition={{duration:.75}}/>)}
  {NUMS.map((n,i)=>{const st=starts[i];const target=!scattered?{x:st.x,y:st.y,scale:.48,rotate:0,opacity:1}:!gathering?{x:cx+scatter[i][0],y:cy+scatter[i][1],scale:scatter[i][3],rotate:scatter[i][2],opacity:1}:{x:startX+i*2*gap,y:cy,scale:.59,rotate:0,opacity:show14?0:1};return <Glyph key={'digit'+i} fontSize={47} initial={{x:st.x,y:st.y,scale:.48,opacity:1}} animate={target} transition={{type:'spring',stiffness:115,damping:14,mass:.6,delay:scattered&&!gathering?i*.05:0}}>{n}</Glyph>})}
  {gathering&&!show14&&Array.from({length:7},(_,i)=><Glyph key={'plus'+i} fontSize={20} initial={{x:startX+(i*2+1)*gap,y:cy,scale:0,opacity:0}} animate={{x:startX+(i*2+1)*gap,y:cy,scale:1,opacity:1}} transition={{type:'spring',delay:i*.055}}>+</Glyph>)}
  {show14&&<>
   <Glyph fontSize={82} initial={{x:cx-23,y:originTop,opacity:0,scale:1.4}} animate={{x:oneLands?slotPos.x:cx-24,y:oneLands?slotPos.y:topArrives?topY:originTop,opacity:topLeaves?0:1,scale:oneLands?.95:topArrives?.9:1.4,rotate:oneLands?[0,-8,4,0]:0}} transition={{type:'spring',stiffness:105,damping:17}}>1</Glyph>
   <Glyph fontSize={82} initial={{x:cx+24,y:originTop,opacity:0,scale:1.4}} animate={{x:fourLands?fourPhone.x:cx+24,y:fourLands?fourPhone.y:topArrives?topY:originTop,opacity:1,scale:fourLands?.9:topArrives?.9:1.4}} transition={{type:'spring',stiffness:105,damping:17}}>4</Glyph>
  </>}
  {topArrives&&<motion.div className="top-layout fixed-top" initial={{opacity:1}} animate={{opacity:topLeaves?0:1,x:topLeaves?-w*1.4:0}} transition={{duration:.7}}>
    <div className="top-head"><motion.span initial={{x:-w}} animate={{x:0}} transition={{type:'spring',bounce:.4}}>TOP</motion.span><div ref={slot} className="one-slot"/></div>
    <div className="top-lines">{['Người đẹp gái nhất thế giới','Người tinh tế nhất vũ trụ','Người chiều anh nhất trên đời','CỦA LÒNG ANH ♡'].map((line,i)=><motion.div className={'top-line '+(i===3?'top-love':'')} key={line} initial={{x:i%2?w:-w,opacity:0}} animate={{x:0,opacity:1}} transition={{delay:i*.25,type:'spring',bounce:.3}}>{line}</motion.div>)}</div>
   </motion.div>}
  {phoneArrives&&<div className="iphone-assembly fixed-phone"><div className="iphone-letters" ref={phone}>{'iPhone'.split('').map((letter,i)=><motion.span key={i} initial={{x:i%2?w:-w,y:i%3===0?-120:140,rotate:i%2?55:-55,scale:.5,opacity:0}} animate={{x:0,y:0,rotate:0,scale:1,opacity:1}} transition={{delay:i*.09,duration:.65,type:'spring',bounce:.5}}>{letter}</motion.span>)}</div></div>}
 </div>
}
// All coordinates are imported from the user-approved 390×780 Position Editor export.
// The same stable element ID is animated across scenes; in particular "four" is never cloned.
const STORY_KEYS=['02-origin-before','03-origin-after','04-scatter','05-equation-before','06-equation-after','07-result-before','08-result-after','09-top-before','10-top-after','11-top-exit','12-iphone-before','13-iphone-after','14-cat-enter','15-cat-eat','16-cat-burp','17-pocket-before','18-pocket-after','19-gift','20-end'];
const STORY_TIMES=[0,.55,1.6,2.7,3.35,4.05,4.95,5.85,7.35,10.15,11.0,12.15,13.25,15.7,18.0,18.85,19.85,20.5,25.0];
const SCENE_FRAMES=STORY_KEYS.map(k=>SCENE_DATA.scenes[k].elements);
const LERP=(a,b,t)=>a+(b-a)*t;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=t=>t*t*(3-2*t);
function interpolateElement(a,b,p){const out={...a,...b};for(const k of ['x','y','size','scale','rotation','opacity','width','height'])out[k]=LERP(a[k]??b[k]??0,b[k]??a[k]??0,p);return out}
// Elements that are not present in an adjacent scene fade rather than jump or duplicate.
function timelineItems(time){let idx=STORY_TIMES.findIndex(v=>v>time)-1;if(idx<0)idx=STORY_TIMES.length-1;
 const next=Math.min(idx+1,STORY_TIMES.length-1),duration=STORY_TIMES[next]-STORY_TIMES[idx];const p=duration?ease(clamp((time-STORY_TIMES[idx])/duration,0,1)):1;
 const a=SCENE_FRAMES[idx],b=SCENE_FRAMES[next];const am=new Map(a.map(e=>[e.id,e])),bm=new Map(b.map(e=>[e.id,e]));
 return [...new Set([...am.keys(),...bm.keys()])].map(id=>{const x=am.get(id),y=bm.get(id);if(x&&y)return interpolateElement(x,y,p);if(x)return {...x,opacity:(x.opacity??100)*(1-p)};return {...y,opacity:(y.opacity??100)*p}});
}
// Witch-cat sequence uses the EDITOR CLOCK (real seconds) so seeking and pausing
// reconstruct exactly the same poses, bubble pops, flying letters and sparkles.
const MAGIC_START=15.25, MAGIC_END=24;
const MAGIC_PHONE_POP=16.9, MAGIC_PHONE_STAGGER=.29, MAGIC_PHONE_LENGTH=.28;
const MAGIC_POCKET_START=19.2, MAGIC_POCKET_STAGGER=.25, MAGIC_POCKET_FLIGHT=1.9;
const MAGIC_CAT_SPRITES={broom:'./images/cat-broom.png',ready:'./images/cat-ready.png',cast:'./images/cat-cast.png',heart:'./images/cat-heart.png'};
const MAGIC_LETTERS='Pocket'.split('');
const MAGIC_POCKET_TARGETS=[67,102,135,169,202,230];
const MAGIC_POCKET_STARTS=[[20,255],[365,280],[25,355],[365,385],[20,205],[365,230]];
function magicFlight(index,progress){
 const [sx,sy]=MAGIC_POCKET_STARTS[index], tx=MAGIC_POCKET_TARGETS[index], ty=125;
 const p=ease(clamp(progress,0,1));
 return {x:LERP(sx,tx,p),y:LERP(sy,ty,p)-Math.sin(Math.PI*p)*(45+index%3*17),rotation:(1-p)*(index%2?-28:28)};
}
function witchItems(realSeconds){
 const base=SCENE_DATA.scenes['13-iphone-after'].elements;
 const four=base.find(e=>e.id==='four');
 const phone=base.filter(e=>/^phone-[0-5]$/.test(e.id)).map((e,index)=>{
  const p=clamp((realSeconds-(MAGIC_PHONE_POP+index*MAGIC_PHONE_STAGGER))/MAGIC_PHONE_LENGTH,0,1);
  const swell=p<.52?1+.65*ease(p/.52):1.65*(1-ease((p-.52)/.48));
  return {...e,opacity:p<.52?100:100*(1-ease((p-.52)/.48)),scale:100*swell,rotation:(index%2?-1:1)*p*20,y:e.y-(p>.52?(p-.52)*24:0)};
 }).filter(e=>e.opacity>.01);
 const pocket=MAGIC_LETTERS.flatMap((letter,index)=>{
  const start=MAGIC_POCKET_START+index*MAGIC_POCKET_STAGGER;
  if(realSeconds<start)return [];
  const p=clamp((realSeconds-start)/MAGIC_POCKET_FLIGHT,0,1);
  const pos=magicFlight(index,p);
  return [{id:'pocket-'+index,text:letter,...pos,size:62,scale:100+(p>=1?0:7*Math.sin(p*Math.PI)),opacity:100,group:'pocket'}];
 });
 let pose='heart';
 if(realSeconds<16.15)pose='broom';
 else if(realSeconds<16.65)pose='ready';
 else if(realSeconds<18.65)pose='cast';
 else if(realSeconds<19.2)pose='ready';
 else if(realSeconds<19.78)pose='cast';
 const entry=clamp((realSeconds-MAGIC_START)/.85,0,1);
 const cat={id:'witch-cat',kind:'witch-cat',sprite:MAGIC_CAT_SPRITES[pose],x:pose==='broom'?LERP(-155,195,ease(entry)):195,y:pose==='broom'?448+Math.sin(realSeconds*9)*8:455,size:210,width:240,height:240,opacity:100,scale:pose==='ready'?104:100,rotation:pose==='broom'?-5+Math.sin(realSeconds*8)*3:pose==='cast'?-4:pose==='heart'?Math.sin(realSeconds*4)*2:5};
 return [four,...phone,...pocket,cat];
}
function MagicTrails({seconds}){
 if(seconds<MAGIC_POCKET_START||seconds>=MAGIC_END)return null;
 const sparks=[];
 for(let i=0;i<6;i++){
  const start=MAGIC_POCKET_START+i*MAGIC_POCKET_STAGGER;
  const progress=(seconds-start)/MAGIC_POCKET_FLIGHT;
  if(progress<=0||progress>=1.18)continue;
  for(let j=1;j<=6;j++){
   const trail=progress-j*.055;
   if(trail<=0||trail>=1)continue;
   const pos=magicFlight(i,trail);
   const seed=i*17+j*13;
   sparks.push(<span key={i+'-'+j} aria-hidden="true" style={{position:'absolute',left:pos.x+Math.sin(seed)*8,top:pos.y+Math.cos(seed)*9,transform:'translate(-50%,-50%)',fontSize:9+j%3*4,color:j%2?'#ffb9df':'#f8d67a',opacity:Math.max(0,.72-j*.095),textShadow:'0 0 8px #ff9acb',pointerEvents:'none',zIndex:4}}>{j%3===0?'✧':'✦'}</span>);
  }
 }
 return <>{sparks}</>;
}

// Final scene animations are isolated from the approved element coordinates.
const finalMotionCSS=`
@keyframes jellyLook {0%,100%{transform:rotate(0deg) scale(1,1)} 18%{transform:rotate(-2deg) scale(1.035,.97)} 38%{transform:rotate(2deg) scale(.975,1.04)} 58%{transform:rotate(-1.3deg) scale(1.025,.98)} 78%{transform:rotate(1.3deg) scale(.99,1.025)}}
@keyframes heartPulseWave {0%{transform:translate(-50%,-50%) scale(.12);opacity:0} 12%{opacity:.95} 65%{opacity:.65} 100%{transform:translate(-50%,-50%) scale(1.8);opacity:0}}
@keyframes birthdayFloat {0%,100%{transform:translate3d(0,0,0) rotate(-7deg)} 50%{transform:translate3d(5px,-15px,0) rotate(7deg)}}
@keyframes birthdayTwinkle {0%,100%{opacity:.32} 50%{opacity:.65}}
@keyframes heartCoreBeat {0%,100%{transform:translate(-50%,-50%) scale(.95)} 50%{transform:translate(-50%,-50%) scale(1.13)}}
`;
// Quiet, edge-positioned birthday accents. Only mounted in the final scene.
const BIRTHDAY_ACCENTS=[
 {icon:'✦',x:24,y:105,size:24,delay:-1.1,duration:6.4},
 {icon:'🎈',x:346,y:138,size:29,delay:-3.2,duration:7.5},
 {icon:'✧',x:362,y:305,size:22,delay:-2.1,duration:5.8},
 {icon:'✳',x:22,y:335,size:19,delay:-4.1,duration:7.1},
 {icon:'🎀',x:34,y:590,size:25,delay:-1.8,duration:8.2},
 {icon:'✦',x:359,y:614,size:23,delay:-3.7,duration:6.9},
 {icon:'✧',x:70,y:710,size:18,delay:-2.7,duration:7.6},
 {icon:'✳',x:323,y:735,size:18,delay:-5.0,duration:8.0},
];
function BirthdayAccents(){return <div aria-hidden="true" style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:0}}>
 {BIRTHDAY_ACCENTS.map((a,i)=><span key={i} style={{position:'absolute',left:a.x,top:a.y,fontSize:a.size,lineHeight:1,opacity:.5,color:i%2?'#ef91bc':'#d8a0cb',filter:'saturate(.65)',animation:`birthdayFloat ${a.duration}s ease-in-out ${a.delay}s infinite, birthdayTwinkle ${a.duration+1.4}s ease-in-out ${a.delay}s infinite`,willChange:'transform,opacity'}}>{a.icon}</span>)}
 </div>}
function HypnoticHeart(){return <div aria-label="Trái tim lan tỏa" style={{position:'relative',width:160,height:160,overflow:'visible',pointerEvents:'none'}}>
 {Array.from({length:4},(_,i)=><span key={i} aria-hidden="true" style={{position:'absolute',left:'50%',top:'50%',fontSize:92,lineHeight:1,color:i%2?'#ff82c4':'#f45caa',textShadow:'0 2px 5px #ffd4e8',transformOrigin:'center',animation:`heartPulseWave 2.8s linear ${-i*.7}s infinite`}}>♡</span>)}
 <span aria-hidden="true" style={{position:'absolute',left:'50%',top:'50%',fontSize:49,lineHeight:1,animation:'heartCoreBeat 1.4s ease-in-out infinite',filter:'drop-shadow(0 3px 5px #f8a4cc)'}}>💗</span>
 </div>}
function StoryItem({item,finalScene=false,clockSeconds=0}){const kind=item.kind||'';const style={left:item.x,top:item.y,fontSize:item.size,width:item.width||'max-content',height:item.height||'auto',opacity:(item.opacity??100)/100,transform:`translate(-50%,-50%) rotate(${item.rotation||0}deg) scale(${(item.scale??100)/100})`,fontFamily:kind==='line'?'Quicksand':'Baloo 2'};
 // Soft jelly motion for the four TOP cards, driven by the editor clock.
 // This makes pause/seek freeze the cards at the correct frame.
 if(/^line-[1-4]$/.test(item.id) && !finalScene){
  const index=Number(item.id.slice(-1))-1;
  const active=clamp((clockSeconds-7.45-index*.12)/.45,0,1)*clamp((11.4-clockSeconds)/.55,0,1);
  const phase=clockSeconds*3.25+index*1.28;
  const sway=Math.sin(phase)*1.35*active;
  const stretchX=1+Math.sin(phase+.5)*.022*active;
  const stretchY=1-Math.sin(phase+.5)*.026*active;
  const floatY=Math.cos(phase*.85)*2.5*active;
  return <div className={'story-element story-kind-'+kind} style={style}><div style={{display:'block',width:'100%',height:'100%',transform:`translateY(${floatY}px) rotate(${sway}deg) scale(${stretchX},${stretchY})`,transformOrigin:'50% 50%'}}><span className={kind==='love'?'story-love':'story-line'}>{item.text}</span></div></div>;
 }
 if(finalScene&&item.id==='message')return null;
 if(finalScene&&item.id==='heart')return <div className="story-element story-final-heart" style={{...style,width:160,height:160,display:'flex',alignItems:'center',justifyContent:'center'}}><HypnoticHeart/></div>;
 if(finalScene&&item.id==='look')return <div className={'story-element story-kind-'+kind} style={style}><div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',animation:'jellyLook 2.6s ease-in-out infinite',transformOrigin:'center'}}><span className="story-love">{item.text}</span></div></div>;
 return <div className={'story-element story-kind-'+kind} style={style}>{kind==='witch-cat'?<img src={item.sprite} draggable="false" alt="Mèo phù thủy" style={{width:'100%',height:'100%',objectFit:'contain'}}/>:kind==='cat'?<img src={CAT} draggable="false" alt="Mèo"/>:kind==='gift'?<img src={GIFT} draggable="false" alt="Pocket 4"/>:<span className={kind==='love'?'story-love':kind==='line'?'story-line':''}>{item.text}</span>}</div>}
// A fixed subtitle beneath iPhone 4 / Pocket 4. Its reveal is driven by the
// editor clock, so pause and scrubbing reproduce the same sparkle positions.
function MagicGiftSubtitle({seconds}){
 if(seconds<15.4||seconds>=24)return null;
 const reveal=clamp((seconds-15.4)/.8,0,1);
 const sparkleWindow=clamp((seconds-15.4)/1.65,0,1);
 const sparks=[[-131,-18],[-105,16],[-72,-24],[-38,20],[5,-23],[43,20],[80,-18],[119,13]];
 return <div aria-label="Là quà sinh nhật của em" style={{position:'absolute',left:195,top:212,transform:'translate(-50%,-50%)',width:340,height:65,pointerEvents:'none',zIndex:8,opacity:reveal}}>
  <div style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',whiteSpace:'nowrap',fontFamily:'Quicksand, sans-serif',fontSize:21,fontWeight:700,color:'#c45b8c',textShadow:'0 2px 4px rgba(255,191,219,.6)'}}>Là quà sinh nhật của em</div>
  {sparks.map(([x,y],i)=>{
   const phase=(seconds-15.4-i*.115);
   const local=clamp(phase/.62,0,1);
   const brightness=Math.sin(Math.PI*local)*(.8-.5*sparkleWindow);
   return <span key={i} aria-hidden="true" style={{position:'absolute',left:`calc(50% + ${x}px)`,top:`calc(50% + ${y}px)`,transform:`translate(-50%,-50%) scale(${.4+local*.9}) rotate(${i*22}deg)`,fontSize:i%3===0?19:13,color:i%2?'#f5a6d3':'#e4b4ff',opacity:phase>=0&&phase<.62?brightness:0,textShadow:'0 0 6px #ffdaef'}}>✦</span>;
  })}
 </div>;
}
function BirthdayMovieBackground(){return <div className="movie-birthday-reference"><section className="panel birthday"><div className="tiny-date">BÍ MẬT NHỎ XÍU</div><div className="birthday-icon">🎀</div><h2>Ngày đặc biệt<br/>của em 🎂</h2><p>Nhập ngày sinh để mở khóa!</p><div className="date-fields"><label>Ngày<div className="movie-date-box">16</div></label><label>Tháng<div className="movie-date-box">11</div></label><label>Năm<div className="movie-date-box">2003</div></label></div><div className="pill">Khám phá bí mật ♡</div><div className="back-link">← Quay lại</div></section></div>}

function Movie({elapsed,paused}){const t=storyTime(elapsed/1000);const host=useRef(null);const [scale,setScale]=useState(1);
 useEffect(()=>{const node=host.current;if(!node)return;const resize=()=>setScale(Math.min(node.clientWidth/390,node.clientHeight/780));resize();const observer=new ResizeObserver(resize);observer.observe(node);return()=>observer.disconnect()},[]);
 // Preserve the original result reveal fade for both 1 and 4. Apply the later 4-only dimming as a multiplier, not an override.
 const clockSeconds = elapsed / 1000;
 const fourOpacity = clockSeconds < 7.7 ? 100 : clockSeconds < 8.2 ? 100 - (clockSeconds - 7.7) / 0.5 * 80 : t < 12.3 ? 20 : t < 12.8 ? 20 + (t - 12.3) / 0.5 * 80 : 100;
 // Editing timeline: keep the complete Pocket 4 reveal from 24s to 30s.
 // At 28–30s the whole reveal fades smoothly; the gift image gently rocks throughout.
 const realSeconds=elapsed/1000;
 const giftHold=realSeconds>=24 && realSeconds<30;
 const giftFade=realSeconds<28?1:clamp((30-realSeconds)/2,0,1);
 const sourceItems=giftHold
    ? SCENE_DATA.scenes['19-gift'].elements
   : realSeconds>=30 ? SCENE_DATA.scenes['20-end'].elements
    : realSeconds>=MAGIC_START ? witchItems(realSeconds) : timelineItems(t);
 const finalScene=realSeconds>=30;
 const items=sourceItems.filter(item=>!(finalScene&&item.id==='message') && item.kind!=='cat' && item.id!=='cat').map(item=>{
   if(giftHold){
     const rocking=item.id==='gift-image' ? 3*Math.sin((realSeconds-24)*Math.PI*1.3) : 0;
     return {...item,opacity:(item.opacity??100)*giftFade,rotation:(item.rotation||0)+rocking};
   }
   // iPhone letters are six independent elements (phone-0 ... phone-5).
   // Override the old scene-wide opacity fade: keep every letter fully visible
   // until its own bubble-pop starts, then inflate, burst and disappear.
   if(realSeconds<MAGIC_START && /^phone-[0-5]$/.test(item.id) && t>=13.25){
     const index=Number(item.id.slice(-1));
     const popStart=15.72+index*0.34;
     const progress=clamp((t-popStart)/0.26,0,1);
     // A quick swell followed by a sharp collapse, with a little upward bounce.
     const popScale=progress<=0.52
       ? 1+0.58*ease(progress/0.52)
       : 1.58*(1-ease((progress-0.52)/0.48));
     const popOpacity=progress<=0.52?100:100*(1-ease((progress-0.52)/0.48));
     return {...item,
       opacity:popOpacity,
       scale:(item.scale??100)*popScale,
       y:item.y-(progress>0.52?(progress-0.52)*18:0),
       rotation:(item.rotation||0)+(index%2?-1:1)*progress*14
     };
   }
   return item.id === 'four' ? {...item, opacity: (item.opacity ?? 100) * fourOpacity / 100} : item;
 });
 // Editing-only equality sign: visible from 3.0s, fades from 6.2s to 6.5s.
 // Anchor it to the left of the approved 14 position (the digit 1 is at x=167).
 const seconds=elapsed/1000;
 const equalOpacity=seconds<3?0:seconds<6.2?1:seconds<6.5?1-(seconds-6.2)/0.3:0;
 const resultOne=items.find(item=>item.id==='one');
 const equalY=resultOne?.y??500;
 return <div className="movie timeline-movie" ref={host}>
 <div className="story-stage" style={{width:390,height:780,transform:`translate(-50%,-50%) scale(${scale})`}}><style>{finalMotionCSS}</style>{finalScene&&<BirthdayAccents/>}{realSeconds>=MAGIC_START&&realSeconds<MAGIC_END&&<MagicTrails seconds={realSeconds}/>}<MagicGiftSubtitle seconds={realSeconds}/> {items.map(item=><StoryItem key={item.id} item={item} finalScene={finalScene} clockSeconds={realSeconds}/>)}
  {equalOpacity>0&&<div className="story-element story-kind-equals" style={{left:91,top:equalY,fontSize:112,opacity:equalOpacity,transform:'translate(-50%,-50%)',fontFamily:'Baloo 2',pointerEvents:'none',zIndex:3}}>=</div>}
 </div></div>
}
function App(){const [screen,setScreen]=useState('welcome');const [popup,setPopup]=useState(false);const [day,setDay]=useState('');const [month,setMonth]=useState('');const [year,setYear]=useState('');const [runId,setRunId]=useState(0);const [muted,setMuted]=useState(false);const [error,setError]=useState('');const [origin,setOrigin]=useState(null);const audioCursor=useRef(0);const musicRef=useRef(null);const MUSIC_VOLUME=.18;const SFX_VOLUME=2;const {elapsed,paused,setPaused,seek}=useClock(screen==='movie',runId);const isEnd=screen==='movie'&&elapsed>=DURATION;
 // Audio is driven by the same clock as the visuals, so pause/seek stay in sync.
 // Seeking deliberately does not replay every cue that was skipped.
 useEffect(()=>{
  if(screen!=='movie'||paused)return;
  const seconds=elapsed/1000;
  const previous=audioCursor.current;
  if(seconds<previous){audioCursor.current=seconds;return;}
  SOUND_EVENTS.forEach(([at,kind,variant=0])=>{
   if(at>previous&&at<=seconds)sound(kind,variant);
  });
  if(previous<24&&seconds>=24)confetti({particleCount:115,spread:95,origin:{y:.45},colors:['#f77aa9','#ffd166','#c7a3ff','#ffffff']});
  if(previous<30&&seconds>=30)confetti({particleCount:110,spread:120,origin:{y:.65},colors:['#ff86b2','#ffcfdf','#d8bbff']});
  audioCursor.current=seconds;
 },[elapsed,paused,screen,runId]);
 // Music is bundled with the website, and continues after the animation ends.
 useEffect(()=>()=>{stopSounds();musicRef.current?.pause()},[]);
 useEffect(()=>{if(musicRef.current)musicRef.current.muted=muted},[muted]);
 useEffect(()=>{setSfxVolume(SFX_VOLUME)},[]);

 const start=()=>{
  if(day!=='16'||month!=='11'||year!=='2003'){setError('Hình như ngày sinh chưa đúng rồi! Thử lại nha ♡');sound('boing');return;}
  setError('');const frame=document.querySelector('.phone-frame');const inputs=[...document.querySelectorAll('.birthday .date-fields select, .birthday .date-fields input')];
  if(frame&&inputs.length===3){const parent=frame.getBoundingClientRect();setOrigin({fields:inputs.map(el=>{const r=el.getBoundingClientRect();return {x:r.left-parent.left,y:r.top-parent.top,width:r.width,height:r.height}})});}
  unlockAudio();stopSounds();audioCursor.current=0;
  const music=musicRef.current;if(music){music.pause();music.currentTime=0;music.volume=MUSIC_VOLUME;music.muted=muted;music.play()
  .then(() => console.log("Nhạc nền đã phát thành công"))
  .catch(err => console.error("LỖI NHẠC NỀN:", err));}
  setRunId(x=>x+1);setScreen('movie');
 };
 const restart=()=>{stopSounds();if(musicRef.current){musicRef.current.pause();musicRef.current.currentTime=0}audioCursor.current=0;setScreen('welcome');setDay('');setMonth('');setYear('');setPopup(false);setError('')};
 return <main className="app"><audio ref={musicRef} src={`${import.meta.env.BASE_URL}music/Music.mp3`} preload="auto" playsInline/><Floating/><div className="sound-toggle"><button aria-label={muted?'Bật âm thanh':'Tắt âm thanh'} onClick={()=>{setMuted(v=>{setAudioEnabled(v);return !v})}}>{muted?<VolumeX size={19}/>:<Volume2 size={19}/>}</button></div><div className="phone-frame">
  <AnimatePresence mode="wait">
   {screen==='welcome'&&<motion.section className="panel welcome" key="welcome" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,x:-60}}><div className="tiny-date">16 · 11 · 2026</div><div className="mini-hearts">♡ ✧ ♡</div><h1>Happy Birthday<br/><em>Linh!</em></h1><div className="cake">🎂</div><p>Anh có một séc rẹt cho cục dànggg 💗</p><div className="buttons"><Button onClick={()=>{unlockAudio();setScreen('birthday')}}>Bắt đầu khám phá ✨</Button><Button secondary onClick={()=>setPopup(true)}>Không khám phá 🙄</Button></div><div className="footer-note">Ken made with ♡ just for Linh iuu</div></motion.section>}
   {screen==='birthday'&&<motion.section className="panel birthday" key="birthday" initial={{opacity:0,x:60}} animate={{opacity:1,x:0}} exit={{opacity:0,transition:{duration:0}}}><div className="tiny-date">BÍ MẬT NHỎ XÍU</div><div className="birthday-icon">🎀</div><h2>Ngày đặc biệt<br/>của em 🎂</h2><p>Nhập ngày sinh để mở khóa!</p><div className="date-fields"><label>Ngày<select value={day} onChange={e=>{sound('tick');setDay(e.target.value)}}><option value="">DD</option>{Array.from({length:31},(_,i)=><option key={i} value={String(i+1)}>{String(i+1).padStart(2,'0')}</option>)}</select></label><label>Tháng<select value={month} onChange={e=>{sound('tick');setMonth(e.target.value)}}><option value="">MM</option>{Array.from({length:12},(_,i)=><option key={i} value={String(i+1)}>{String(i+1).padStart(2,'0')}</option>)}</select></label><label>Năm<input type="number" placeholder="YYYY" value={year} onChange={e=>setYear(e.target.value)} min="1900" max="2100"/></label></div>{error&&<p className="error">{error}</p>}<Button onClick={start}>Khám phá bí mật ♡</Button><button className="back-link" onClick={()=>setScreen('welcome')}>← Quay lại</button></motion.section>}
   {screen==='movie'&&<motion.section className="panel movie-panel" key="movie" initial={{opacity:0}} animate={{opacity:1}}><Movie elapsed={elapsed} paused={paused} origin={origin}/>{isEnd&&<button className="replay" onClick={restart}><RotateCcw size={15}/> Xem lại từ đầu</button>}</motion.section>}
  </AnimatePresence>
 </div><AnimatePresence>{popup&&<motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><motion.div className="modal" initial={{scale:.65,y:60}} animate={{scale:1,y:0}} exit={{scale:.65,y:60}} transition={{type:'spring',bounce:.55}}><Cat className="modal-cat"/><h3>Nay sinh nhật chọn vậy<br/>ko có dui nhennn 😾</h3><Button onClick={()=>{setPopup(false);unlockAudio();setScreen('birthday')}}>Buộc bấm 💕</Button></motion.div></motion.div>}</AnimatePresence></main>
}
createRoot(document.getElementById('root')).render(<App/>);
