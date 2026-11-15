// Synthesized, royalty-free cartoon SFX. No audio assets or network requests.
// All voices are tracked so pausing/seeking stops the current sounds immediately.
let ctx, enabled=true, sfxVolume=1, masterGain;
export function setSfxVolume(value){
 sfxVolume=Math.max(0,Math.min(2,Number(value)||0));
 if(masterGain&&ctx)masterGain.gain.setTargetAtTime(sfxVolume,ctx.currentTime,.015);
}
function ensureMaster(){
 if(!ctx||masterGain)return;
 masterGain=ctx.createGain();masterGain.gain.value=sfxVolume;
 const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-8;limiter.knee.value=6;limiter.ratio.value=8;limiter.attack.value=.003;limiter.release.value=.15;
 masterGain.connect(limiter);limiter.connect(ctx.destination);
}
const active=new Set();
export function unlockAudio(){
 try{ctx ||= new (window.AudioContext||window.webkitAudioContext)();ensureMaster();if(ctx.state==='suspended')ctx.resume();}catch{}
}
export function stopSounds(){
 for(const voice of active){try{voice.gain.gain.cancelScheduledValues(ctx.currentTime);voice.gain.gain.setTargetAtTime(.00001,ctx.currentTime,.012);voice.osc.stop(ctx.currentTime+.07);}catch{}}
 active.clear();
}
export function setAudioEnabled(value){enabled=!!value;if(!enabled)stopSounds();else unlockAudio();}
function tone(start,end,duration,volume=.045,type='sine',delay=0,attack=.012){
 if(!ctx||!enabled)return;
 const at=ctx.currentTime+delay,osc=ctx.createOscillator(),gain=ctx.createGain();
 const voice={osc,gain};active.add(voice);
 osc.type=type;osc.frequency.setValueAtTime(Math.max(30,start),at);
 osc.frequency.exponentialRampToValueAtTime(Math.max(30,end),at+duration);
 osc.connect(gain);gain.connect(masterGain);
 gain.gain.setValueAtTime(.00001,at);
 gain.gain.exponentialRampToValueAtTime(Math.max(.0001,volume),at+Math.min(attack,duration*.3));
 gain.gain.exponentialRampToValueAtTime(.00001,at+duration);
 osc.onended=()=>{active.delete(voice);try{osc.disconnect();gain.disconnect()}catch{}};
 osc.start(at);osc.stop(at+duration+.025);
}
function chime(notes,spacing=.09,volume=.033,duration=.28){
 notes.forEach((freq,i)=>{tone(freq,freq*1.035,duration,volume,'sine',i*spacing);tone(freq*2,freq*2.02,duration*.7,volume*.17,'sine',i*spacing)});
}
function sweep(up=true,duration=.32,volume=.038){
 tone(up?260:900,up?1100:240,duration,volume,'triangle');
 tone(up?440:1350,up?1500:400,duration*.82,volume*.35,'sine',.025);
}
export function sound(kind='pop',variant=0){
 if(!enabled)return;unlockAudio();if(!ctx)return;
 const shift=1+(variant%6)*.045;
 switch(kind){
  case 'tick':tone(830,590,.07,.027);break;
  case 'pop':tone(590,180,.13,.07);break;
  case 'boing':tone(270,610,.25,.075);break;
  case 'whoosh':sweep(true,.25,.04);break;
  case 'softWhoosh':sweep(true,.26,.022);break;
  case 'scatter':tone(550*shift,260*shift,.24,.032,'triangle');tone(990*shift,550*shift,.12,.012,'sine',.05);break;
  case 'gather':sweep(true,.34,.036);chime([660,880],.12,.018,.25);break;
  case 'magicChime':chime([740,988,1175,1480],.09,.032,.4);break;
  case 'reveal':chime([523,784,1046],.10,.038,.4);break;
  case 'rise':sweep(true,.45,.034);break;
  case 'twinkle':chime([1108*shift,1480*shift],.07,.015,.22);break;
  case 'jelly':tone(410,620,.15,.029);break;
  case 'lettersIn':chime([659,880,1047],.09,.026,.25);break;
  case 'broomFly':sweep(true,.7,.052);tone(280,560,.55,.017,'sine',.08);break;
  case 'magicCharge':
   tone(230,680,.48,.055,'triangle');
   tone(470,1260,.44,.024,'sine',.06);
   chime([740,990,1245],.10,.018,.20);break;
  case 'wandCast':
   sweep(true,.42,.075);
   chime([880,1320,1760],.075,.035,.32);break;
  case 'wandCastStrong':
   sweep(true,.55,.075);
   chime([784,1175,1568,2093],.09,.042,.43);break;
  case 'bubbleBurst':
   // Six individual bubbly pops, with slightly different pitches.
   tone((780+variant*65),115,.19,.075,'sine');
   tone((1150+variant*80),360,.075,.025,'triangle',.045);
   break;
  case 'letterFly':
   // A short magical trail for each flying Pocket letter.
   tone(680*shift,1320*shift,.48,.026,'sine');
   chime([900*shift,1350*shift],.095,.016,.24);
   break;
  case 'giftReveal':chime([523,659,784,1047,1319],.13,.042,.6);break;
  case 'birthdayFinal':chime([659,784,988,1319],.15,.036,.65);break;
  case 'heart':chime([660,880,1100],.12,.028,.34);break;
  default:tone(520,230,.12,.07);
 }
}
