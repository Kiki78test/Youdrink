/* Alamb'hic — avatar qui évolue avec le taux estimé (10 stades, style « portrait dans un cercle »).
   Dépend de NOW() et MIN (app.js ou page de test). */
"use strict";
let AVN=0;
const cl=(v,a=0,z=1)=>Math.max(a,Math.min(z,v));
/* seuils des stades 1 à 9 (g/L) ; stade 9 = KO (≥ 1,5) */
const AV_T=[0.05,0.2,0.35,0.5,0.65,0.8,1.0,1.2,1.5];
const AV_RING=["#3fbf8a","#8fc63a","#cfd03c","#f2b233","#f28a2a","#f2662a","#ee4436","#e83a52","#e5386b","#e0306f"];
function avStage(b){ let s=0; for(const t of AV_T) if(b>=t) s++; return s }
function drinkKind(d){
  if(!d) return null; if(d.water) return "water";
  const l=d.l||""; if(/Bi|Pinte|Cidre/.test(l)) return "beer"; if(/Champ/.test(l)) return "champ"; if(/Vin/.test(l)) return "wine";
  if(/Shot/.test(l)) return "shot"; if(/Cocktail/.test(l)) return "cocktail"; return d.abv>=20?"shot":"wine";
}
function heldGlass(k){
  const G={
   beer:'<path d="M96 62h15l-1.5 23h-12z" fill="#e9a33a" stroke="#3a2216" stroke-width="1"/><path d="M96 62h15l-.4 5h-14.2z" fill="#fff6dd"/><circle cx="99" cy="61.5" r="2.6" fill="#fff6dd"/><circle cx="104" cy="60.8" r="3" fill="#fff6dd"/><circle cx="108.5" cy="61.6" r="2.4" fill="#fff6dd"/><path d="M111 67q5 1 4 7q-.5 4-4.6 4" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="1.6"/><path d="M98.5 70v12" stroke="rgba(255,255,255,.35)" stroke-width="1.4"/>',
   wine:'<path d="M96.5 60h14q.3 13-7 13.6q-7.3-.6-7-13.6z" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.7)" stroke-width=".9"/><path d="M97 66h13q-.8 7-6.5 7.4q-5.7-.4-6.5-7.4z" fill="#8c1d32"/><path d="M103.5 73.6v10M99 84h9" stroke="rgba(255,255,255,.75)" stroke-width="1.2" stroke-linecap="round"/>',
   champ:'<path d="M100 58h7l-.6 15h-5.8z" fill="#f4d47c" stroke="rgba(255,255,255,.7)" stroke-width=".9"/><circle cx="102.5" cy="66" r=".7" fill="#fff"/><circle cx="104.4" cy="62" r=".6" fill="#fff"/><path d="M103.5 73v11M99.5 84h8" stroke="rgba(255,255,255,.75)" stroke-width="1.2" stroke-linecap="round"/>',
   shot:'<path d="M98 72h11l-1.2 12h-8.6z" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.7)" stroke-width=".9"/><path d="M98.6 76h9.8l-.8 7.6h-8.2z" fill="#d68a2e"/>',
   cocktail:'<path d="M95 60h17l-8.5 11z" fill="#ef6fa6" stroke="rgba(255,255,255,.7)" stroke-width=".9"/><circle cx="109" cy="59" r="3" fill="#ffd34d"/><path d="M103.5 71v13M99.5 84h8" stroke="rgba(255,255,255,.75)" stroke-width="1.2" stroke-linecap="round"/><path d="M98 54l7 9" stroke="#5bc88a" stroke-width="1.2"/>',
   water:'<path d="M97 62h13l-1.4 22h-10.2z" fill="rgba(140,200,255,.22)" stroke="#8fd0ff" stroke-width="1"/><path d="M97.6 68h11.8l-1 15.6h-9.8z" fill="#5ab0ff" opacity=".65"/><path d="M99.5 70v11" stroke="rgba(255,255,255,.5)" stroke-width="1.2"/>'};
  return G[k]||"";
}
const AV_CSS=`<style>.av-p{transform-box:view-box;transform-origin:60px 116px;animation:avsw 3.4s ease-in-out infinite}
@keyframes avsw{0%,100%{rotate:calc(var(--sw,0deg) * -1)}50%{rotate:var(--sw,0deg)}}
.av-fl{animation:avfl 2.8s ease-in-out infinite}.av-fl2{animation:avfl 3.6s ease-in-out -1.2s infinite}
@keyframes avfl{50%{transform:translateY(-3px)}}
.av-wb{transform-box:view-box;transform-origin:60px 28px;animation:avwb 2.4s ease-in-out infinite}
@keyframes avwb{0%,100%{rotate:-7deg}50%{rotate:7deg}}
.av-sp{transform-box:fill-box;transform-origin:center;animation:avsp 3s linear infinite}@keyframes avsp{to{rotate:360deg}}
@media (prefers-reduced-motion:reduce){.av-p,.av-fl,.av-fl2,.av-wb,.av-sp{animation:none}}</style>`;

function avatar(p,size){
  const n=++AVN, s=p.sim||{cur:0,prev:0,peak:0}, b=s.cur, c=p.color||"#2f8cff", st=avStage(b);
  const ko=st>=9, down=s.peak>=0.3&&b<s.prev-0.004;
  const now=NOW(), last=(p.drinks||[]).filter(d=>d.t<=now).sort((x,y)=>y.t-x.t)[0];
  const k=ko?null:(last&&now-last.t<25*MIN?drinkKind(last):(down?"water":null));
  const INK="#3a2216", SK="#eeb48a", SKD="#d8946a", HAIR="#4a2c18", ring=AV_RING[st];
  /* ---- paramètres par stade ---- */
  const LID=[0,.05,.35,.52,.6,0,0,.6,.82,1][st], SLANT=[0,0,0,.6,2.2,0,0,2.6,2,0][st];
  const happy=st===5||st===6, sleep=st===9;
  const BROW=[[-3,-3],[-2.4,-2.4],[0,0],[.6,-1.2],[1.8,-1.4],[-2.6,-2.6],[-2.4,-2.4],[1.6,-2],[1.4,-2.2],[1.2,-1.6]][st]; /* [extérieur, intérieur] */
  const tilt=[0,0,-2,-4,-6,5,-7,-9,9,0][st];
  const blush=cl((b-0.15)/0.6), nose=cl((b-0.3)/0.6)*0.85, flush=cl((b-0.9)/0.7)*0.28;
  const eye=(x,side)=>{
    if(happy) return `<path d="M${x-5.2} 58Q${x} 51.5 ${x+5.2} 58" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
    if(sleep) return `<path d="M${x-5.2} 56Q${x} 60.5 ${x+5.2} 56" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/><path d="M${x-4} 59.8q4 2 8 0" fill="none" stroke="#a0586a" stroke-opacity=".5" stroke-width="1"/>`;
    const ly=50.6+LID*11, out=x+side*6, inn=x-side*6, px=st>=7?side*-0.8:0;
    return `<ellipse cx="${x}" cy="56" rx="5.2" ry="5.8" fill="#fffaf3"/>
    <g clip-path="url(#ec${side<0?"l":"r"}${n})">
     <ellipse cx="${x}" cy="56" rx="5.2" ry="5.8" fill="#ff7a6a" opacity="${(cl((b-0.6)/0.8)*0.35).toFixed(2)}"/>
     <circle cx="${x+px}" cy="56.8" r="3.3" fill="#6a4226"/><circle cx="${x+px}" cy="56.8" r="1.7" fill="#1a0f08"/><circle cx="${x+px+1.2}" cy="55.4" r="1" fill="#fff"/>
     <path d="M${x-8} 46H${x+8}L${out} ${(ly+SLANT).toFixed(1)}Q${x} ${(ly+1.6).toFixed(1)} ${inn} ${(ly-SLANT*0.3).toFixed(1)}Z" fill="${SK}"/>
     <path d="M${inn} ${(ly-SLANT*0.3).toFixed(1)}Q${x} ${(ly+1.6).toFixed(1)} ${out} ${(ly+SLANT).toFixed(1)}" fill="none" stroke="${INK}" stroke-width="${LID>0.1?1.6:0}"/>
    </g>
    <ellipse cx="${x}" cy="56" rx="5.2" ry="5.8" fill="none" stroke="${INK}" stroke-width="1.5"/>
    ${st>=4?`<path d="M${x-4} 62.6q4 ${(1.4+b).toFixed(1)} 8 0" fill="none" stroke="#9a5a6a" stroke-opacity="${cl((b-0.4)/1).toFixed(2)}" stroke-width="1.1"/>`:""}`;
  };
  const [bo,bi]=BROW, br=(x0,x1,yo,yi)=>`<path d="M${x0} ${yo}Q${(x0+x1)/2} ${Math.min(yo,yi)-2.6} ${x1} ${yi}" fill="none" stroke="${HAIR}" stroke-width="2.6" stroke-linecap="round"/>`;
  const brows=br(44,55,47+bo,47+bi)+br(76,65,47+bo,47+bi);
  /* bouches : forme ouverte (avec dents et langue découpées dedans) ou trait */
  const open=(d,teeth,tongue)=>`<clipPath id="mc${n}"><path d="${d}"/></clipPath><path d="${d}" fill="#5b1c16"/>
    <g clip-path="url(#mc${n})">${teeth?`<rect x="44" y="${teeth}" width="32" height="4" fill="#fff"/>`:""}${tongue?`<ellipse cx="${tongue[0]}" cy="${tongue[1]}" rx="6" ry="4" fill="#e8706a"/>`:""}</g>
    <path d="${d}" fill="none" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`;
  const line=d=>`<path d="${d}" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
  const tongueOut=(x,y,r)=>`<path d="M${x-4.5} ${y}q0 ${r} 4.5 ${r}q4.5 0 4.5-${r}z" fill="#ef7a73" stroke="${INK}" stroke-width="1.3"/><path d="M${x} ${y+1}v${r-3}" stroke="#c4534e" stroke-width="1"/>`;
  const drool=sleep?`<path d="M66 78q1.6 6 .4 11q-.6 3 1.4 3.6q2.2-.6 1.2-3.6q-1.4-5-2.2-11" fill="#bfe6ff" stroke="#6ab8e6" stroke-width=".8" class="av-fl"/>`:"";
  const MOUTH=[
    ()=>open("M49 70Q60 84 71 70Q60 72.5 49 70Z",69.6,[60,81]),
    ()=>open("M50.5 70.6Q60 81 69.5 70.6Q60 72.6 50.5 70.6Z",70.2,[60,80]),
    ()=>line("M51.5 71.4Q60 77.6 68.5 71.4"),
    ()=>line("M51.5 73.6Q59 76.4 69 70.6"),
    ()=>open("M51 76Q55 70 60 71.2Q65 70 69 76Q60 78.4 51 76Z",70.4,[60,78]),
    ()=>open("M48.5 69.6Q60 83 71.5 69.6Q60 72.4 48.5 69.6Z",69.2,[60,80])+tongueOut(55.5,77.6,7),
    ()=>open("M48 69Q60 85 72 69Q60 72 48 69Z",68.6,[60,82]),
    ()=>open("M52.5 77Q60 70.4 67.5 77Q60 78.6 52.5 77Z",0,[60,79]),
    ()=>open("M50.5 71.6Q60 66.6 69.5 71.6Q67 84 60 84Q53 84 50.5 71.6Z",70.2,[60,83])+tongueOut(60,80.6,8.5),
    ()=>open("M54 76Q60 72 66 76Q64.6 81 60 81Q55.4 81 54 76Z",0,[60,80]),
  ];
  const mouth=MOUTH[st]();
  /* cheveux : ébouriffés, de plus en plus en bataille */
  const hair=`<path d="M36.5 55C33 41 36 31 42 27L39.5 19.5L47 23.5L48.5 15L55 21.5L60 12.5L64.5 21L71.5 15L72.5 23.5L80 19.5L78.5 28C84.5 33 86.5 43 83.5 55C82 47 79 42 74.5 39.5C70.5 43.6 64.5 42 61.5 38C57 43 50.5 42.6 46.5 39.6C42.5 42.6 39 47.5 36.5 55Z" fill="url(#hr${n})" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
   <path d="M46.5 39.6q-1.6 4-4.4 5.6M61.5 38q-.8 4.6-3.4 6.4M74.5 39.5q1.4 3.6 4.2 4.6" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"/>
   <path d="M47 26q6-4 14-3.4M66 23.6q7 1.4 11 6" fill="none" stroke="rgba(255,220,180,.22)" stroke-width="1.8" stroke-linecap="round"/>
   ${st>=4?`<path d="M38 36q-6-2-8-7M84 37q6-1 8-6M55 17q-2-6 1-10M70 18q3-5 7-6" fill="none" stroke="${HAIR}" stroke-width="2.4" stroke-linecap="round"/>`:""}
   ${st>=7?`<path d="M41 47q-5 3-6 8M80 46q5 3 5 9" fill="none" stroke="${HAIR}" stroke-width="2.2" stroke-linecap="round"/>`:""}`;
  const stubble=st>=3?`<path d="M45 72Q47 84 60 86Q73 84 75 72Q72 80 60 81Q48 80 45 72Z" fill="#6b4a36" opacity="${(0.12+cl((b-0.35)/1.2)*0.18).toFixed(2)}"/>`:"";
  const head=`
   <ellipse cx="37.5" cy="58" rx="4.6" ry="6.6" fill="${SK}" stroke="${INK}" stroke-width="1.5"/><path d="M37.5 54q-2 4 0 8" fill="none" stroke="${SKD}" stroke-width="1.3"/>
   <ellipse cx="82.5" cy="58" rx="4.6" ry="6.6" fill="${SK}" stroke="${INK}" stroke-width="1.5"/><path d="M82.5 54q2 4 0 8" fill="none" stroke="${SKD}" stroke-width="1.3"/>
   <path d="M38.5 52Q38.5 30 60 30Q81.5 30 81.5 52Q81.5 71 72 79.5Q60 88 48 79.5Q38.5 71 38.5 52Z" fill="url(#sk${n})" stroke="${INK}" stroke-width="1.6"/>
   <path d="M38.5 52Q38.5 30 60 30Q81.5 30 81.5 52Q81.5 71 72 79.5Q60 88 48 79.5Q38.5 71 38.5 52Z" fill="#ff5a4a" opacity="${flush.toFixed(2)}"/>
   ${stubble}
   <ellipse cx="45" cy="66.5" rx="6.6" ry="4.4" fill="url(#bl${n})" opacity="${blush.toFixed(2)}"/><ellipse cx="75" cy="66.5" rx="6.6" ry="4.4" fill="url(#bl${n})" opacity="${blush.toFixed(2)}"/>
   ${hair}${brows}${eye(50,-1)}${eye(70,1)}
   <path d="M60.5 58.5q-3 6.4-1.4 8.8q2.2 1.2 4.4 0" fill="none" stroke="${SKD}" stroke-width="1.6" stroke-linecap="round"/>
   <ellipse cx="61.2" cy="66.4" rx="3.4" ry="2.6" fill="#e8584e" opacity="${nose.toFixed(2)}"/>
   ${mouth}${drool}
   ${st>=7&&!sleep?`<path d="M82 40q-3.4 5-.2 7.6q3.4-1.6.2-7.6z" fill="#bfe6ff" stroke="#6ab8e6" stroke-width=".7"/>`:""}
   ${sleep?`<path d="M44 61q-1.6 4 0 6q1.8-1.6 0-6z" fill="#bfe6ff" stroke="#6ab8e6" stroke-width=".6"/>`:""}`;
  /* tenue : chemise couleur du joueur, cravate qui se défait au fil des stades */
  const open1=st>=3, tieRot=[0,0,0,4,6,14,18,24,32,38][st], tieY=open1?104:99.5;
  const torso=`
   <path d="M51.5 78L51.5 93Q60 99 68.5 93L68.5 78Z" fill="${SKD}" stroke="${INK}" stroke-width="1.4"/>
   <path d="M10 124C12 103 30 94 47 91L60 ${open1?106:99}L73 91C90 94 108 103 110 124Z" fill="${c}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
   <path d="M10 124C12 103 30 94 47 91L60 ${open1?106:99}L73 91C90 94 108 103 110 124Z" fill="url(#sh${n})"/>
   ${open1?`<path d="M53 92L60 106L67 92Q60 96 53 92Z" fill="${SKD}"/>`:""}
   <path d="M47 91L60 ${open1?106:99}L54.5 ${open1?108:103}L44 94Z" fill="#f4efe8" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round" transform="rotate(${st>=5?-8:0} 47 91)"/>
   <path d="M73 91L60 ${open1?106:99}L65.5 ${open1?108:103}L76 94Z" fill="#f4efe8" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>
   <g transform="rotate(${tieRot} 60 ${tieY})"><path d="M57 ${tieY}h6l-1 4h-4z" fill="#22304d" stroke="${INK}" stroke-width="1.1"/><path d="M58 ${tieY+4}h4l2.6 18l-4.6 5l-4.6-5z" fill="#22304d" stroke="${INK}" stroke-width="1.1"/><path d="M58.6 ${tieY+9}l4-2M58.4 ${tieY+15}l4.6-2.4" stroke="rgba(255,255,255,.18)" stroke-width="1.2"/></g>
   ${st>=5?`<path d="M28 108q6 3 10 1M84 110q6-1 9 2M44 116q4-2 7 0" fill="none" stroke="rgba(0,0,0,.3)" stroke-width="1.6" stroke-linecap="round"/>`:""}
   ${st>=6?`<circle cx="76" cy="113" r="3.4" fill="#8c1d32" opacity=".55"/><circle cx="80" cy="117" r="1.6" fill="#8c1d32" opacity=".5"/>`:""}`;
  const arm=k?`<path d="M88 124Q92 110 93.5 98" fill="none" stroke="${INK}" stroke-width="12.6" stroke-linecap="round"/><path d="M88 124Q92 110 93.5 98" fill="none" stroke="${c}" stroke-width="10" stroke-linecap="round"/>
   <g transform="translate(-10 6)">${heldGlass(k)}</g><ellipse cx="93.5" cy="90.5" rx="5.6" ry="4.8" fill="${SK}" stroke="${INK}" stroke-width="1.3"/><path d="M89 89.5h9M89 92h9" stroke="${SKD}" stroke-width=".9"/>`:"";
  const headRot=sleep?22:0;
  const person=`<g class="av-p"><g transform="rotate(${tilt} 60 116)">${torso}<g transform="rotate(${headRot} 60 86)">${head}</g>${arm}</g></g>`;
  /* effets autour de la tête */
  const bub=(x,y,r,cls)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#dfe9f7" stroke-opacity=".75" stroke-width="1.3" class="${cls}"/>`;
  const star=(x,y,r)=>`<path d="M${x} ${y-r}L${x+r*.3} ${y-r*.3}L${x+r} ${y}L${x+r*.3} ${y+r*.3}L${x} ${y+r}L${x-r*.3} ${y+r*.3}L${x-r} ${y}L${x-r*.3} ${y-r*.3}Z" fill="#ffcf4a" stroke="#c98f12" stroke-width=".6"/>`;
  let fx="";
  if(st===3) fx=`<path d="M86 30l4-6M90 35l6-3M89 25l1-6" stroke="#ffcf4a" stroke-width="2.2" stroke-linecap="round"/>`;
  if(st>=4&&st<=8) fx+=`<g class="av-fl">${bub(91,44,3.2)}${bub(97,33,2)}${st>=5?bub(24,58,2.6):""}</g><g class="av-fl2">${bub(27,44,1.6)}${st>=6?bub(94,62,1.6)+bub(21,70,1.2):""}</g>`;
  if(st===7) fx+=`<path class="av-sp" d="M93 26a4.5 4.5 0 1 1 -4.5-4.5a3 3 0 1 1 -3 3a1.5 1.5 0 1 1 1.5 1.5" fill="none" stroke="#dfe9f7" stroke-width="1.5" stroke-linecap="round"/>`;
  if(st===8) fx+=`<g class="av-wb"><ellipse cx="60" cy="26" rx="25" ry="6" fill="none" stroke="#ffcf4a" stroke-width="1.6"/>${star(36,25,4)}${star(56,20.4,3.2)}${star(80,23,4.4)}${star(70,31.6,3)}</g>`;
  if(st===9) fx+=`<g class="av-fl">${star(30,32,3.6)}${star(90,26,4.4)}</g><g class="av-fl2">${star(82,40,2.6)}${bub(25,56,1.8)}</g><text x="97" y="46" font-family="sans-serif" font-weight="800" font-size="9" fill="#dfe9f7" opacity=".8">z</text><text x="103" y="37" font-family="sans-serif" font-weight="800" font-size="7" fill="#dfe9f7" opacity=".6">z</text>`;
  const keys=b>=0.5&&!ko?`<g transform="translate(-2 -2)"><circle cx="11" cy="11" r="10.5" fill="#18140f" stroke="#ff5a4e" stroke-width="1.8"/><circle cx="7.6" cy="11" r="3" fill="none" stroke="#f7f1ea" stroke-width="1.6"/><path d="M10.6 11h6.4M15 11v2.8M12.8 11v2" stroke="#f7f1ea" stroke-width="1.6"/><path d="M4 18L18 4" stroke="#ff5a4e" stroke-width="2"/></g>`:"";
  const koWater=ko?`<g transform="translate(-62 22) scale(.85)">${heldGlass("water")}</g>`:"";
  const lab=ko?"avatar KO":st>=7?"avatar très éméché":st>=5?"avatar éméché":st>=2?"avatar pompette":"avatar en forme";
  return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="${lab}" style="flex:none;overflow:visible">${AV_CSS}
  <defs><radialGradient id="sk${n}" cx="42%" cy="36%" r="72%"><stop offset="0" stop-color="#f6cba4"/><stop offset=".65" stop-color="#eeb48a"/><stop offset="1" stop-color="#d48d62"/></radialGradient>
  <radialGradient id="bl${n}"><stop offset="0" stop-color="#ff4d4d" stop-opacity=".85"/><stop offset="1" stop-color="#ff4d4d" stop-opacity="0"/></radialGradient>
  <linearGradient id="hr${n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a4126"/><stop offset="1" stop-color="#3c2414"/></linearGradient>
  <linearGradient id="sh${n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></linearGradient>
  <radialGradient id="bg${n}" cx="50%" cy="40%" r="65%"><stop offset="0" stop-color="#1d3354"/><stop offset="1" stop-color="#0c1728"/></radialGradient>
  <clipPath id="cc${n}"><circle cx="60" cy="60" r="55"/></clipPath>
  <clipPath id="ecl${n}"><ellipse cx="50" cy="56" rx="5.2" ry="5.8"/></clipPath><clipPath id="ecr${n}"><ellipse cx="70" cy="56" rx="5.2" ry="5.8"/></clipPath></defs>
  <circle cx="60" cy="60" r="55" fill="url(#bg${n})"/>
  <g clip-path="url(#cc${n})">${person}${fx}${koWater}</g>
  <circle cx="60" cy="60" r="56" fill="none" stroke="${ring}" stroke-width="3.6"/>
  ${keys}</svg>`;
}
