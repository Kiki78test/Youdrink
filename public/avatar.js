/* Youdrink — avatar qui évolue avec le taux estimé. Dépend de NOW() et MIN (app.js). */
"use strict";
/* ---------- avatar ---------- */
let AVN=0;
const cl=(v,a=0,z=1)=>Math.max(a,Math.min(z,v));
function drinkKind(d){
  if(!d) return null; if(d.water) return "water";
  const l=d.l||""; if(/Bi|Pinte|Cidre/.test(l)) return "beer"; if(/Champ/.test(l)) return "champ"; if(/Vin/.test(l)) return "wine";
  if(/Shot/.test(l)) return "shot"; if(/Cocktail/.test(l)) return "cocktail"; return d.abv>=20?"shot":"wine";
}
function heldGlass(k){
  const G={
   beer:'<path d="M96 62h15l-1.5 23h-12z" fill="#e9a33a"/><path d="M96 62h15l-.4 5h-14.2z" fill="#fff6dd"/><circle cx="99" cy="61.5" r="2.6" fill="#fff6dd"/><circle cx="104" cy="60.8" r="3" fill="#fff6dd"/><circle cx="108.5" cy="61.6" r="2.4" fill="#fff6dd"/><path d="M111 67q5 1 4 7q-.5 4-4.6 4" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.6"/><path d="M98.5 70v12" stroke="rgba(255,255,255,.35)" stroke-width="1.4"/>',
   wine:'<path d="M96.5 60h14q.3 13-7 13.6q-7.3-.6-7-13.6z" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.55)" stroke-width=".9"/><path d="M97 66h13q-.8 7-6.5 7.4q-5.7-.4-6.5-7.4z" fill="#8c1d32"/><path d="M103.5 73.6v10M99 84h9" stroke="rgba(255,255,255,.65)" stroke-width="1.2" stroke-linecap="round"/>',
   champ:'<path d="M100 58h7l-.6 15h-5.8z" fill="#f4d47c" stroke="rgba(255,255,255,.6)" stroke-width=".9"/><circle cx="102.5" cy="66" r=".7" fill="#fff"/><circle cx="104.4" cy="62" r=".6" fill="#fff"/><path d="M103.5 73v11M99.5 84h8" stroke="rgba(255,255,255,.65)" stroke-width="1.2" stroke-linecap="round"/>',
   shot:'<path d="M98 72h11l-1.2 12h-8.6z" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.6)" stroke-width=".9"/><path d="M98.6 76h9.8l-.8 7.6h-8.2z" fill="#d68a2e"/>',
   cocktail:'<path d="M95 60h17l-8.5 11z" fill="#ef6fa6" stroke="rgba(255,255,255,.6)" stroke-width=".9"/><circle cx="109" cy="59" r="3" fill="#ffd34d"/><path d="M103.5 71v13M99.5 84h8" stroke="rgba(255,255,255,.65)" stroke-width="1.2" stroke-linecap="round"/><path d="M98 54l7 9" stroke="#5bc88a" stroke-width="1.2"/>',
   water:'<path d="M97 62h13l-1.4 22h-10.2z" fill="rgba(140,200,255,.22)" stroke="#8fd0ff" stroke-width="1"/><path d="M97.6 68h11.8l-1 15.6h-9.8z" fill="#5ab0ff" opacity=".65"/><path d="M99.5 70v11" stroke="rgba(255,255,255,.5)" stroke-width="1.2"/>'};
  return G[k]||"";
}
function avatar(p,size){
  const n=++AVN, s=p.sim||{cur:0,prev:0,peak:0}, b=s.cur, cap=+p.cap||0.8, c=p.color||"#f7941d";
  const lying=b>=1.5, over=b>=cap, down=s.peak>=0.3&&b<s.prev-0.004;
  const tilt=cl(b,0,1.4)*11, blush=cl(b/0.6)*0.85, nose=cl((b-0.3)/0.9)*0.75, green=over?cl(0.14+(b-cap)*0.55,0,0.5):0;
  const lid=lying?1:cl(b/1.3)*0.6, cross=over?cl((b-cap)*3,0,1.5):0, red=cl((b-0.4)/1)*0.35;
  const now=NOW(), last=(p.drinks||[]).filter(d=>d.t<=now).sort((x,y)=>y.t-x.t)[0];
  const k=lying?null:(last&&now-last.t<25*MIN?drinkKind(last):(down?"water":null));
  const SK="#f0c19a", LID="#e6b089", INK="#2b1d15", HAIR="#3b2719";
  const eye=(x,px,side)=>{const ly=51.4+lid*9.2;return `<ellipse cx="${x}" cy="56" rx="6.4" ry="4.4" fill="#fbf7f2"/>
   <g clip-path="url(#e${side}${n})"><ellipse cx="${x}" cy="56" rx="6.4" ry="4.4" fill="#ff6b6b" opacity="${red.toFixed(2)}"/>
   <circle cx="${x+px}" cy="56.4" r="3.4" fill="#5d84a8"/><circle cx="${x+px}" cy="56.4" r="3.4" fill="none" stroke="#2f4d6b" stroke-width=".7"/>
   <circle cx="${x+px}" cy="56.4" r="1.7" fill="#140e0a"/><circle cx="${x+px+1.1}" cy="55.2" r=".85" fill="#fff"/>
   <path d="M${x-8} 50H${x+8}V${ly.toFixed(1)}Q${x} ${(ly+2.4).toFixed(1)} ${x-8} ${ly.toFixed(1)}Z" fill="${LID}"/></g>
   ${lying?`<path d="M${x-6} 56.6q6 3 12 0" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"/>`
   :`<path d="M${x-6.6} 56Q${x} ${(51.2+lid*9).toFixed(1)} ${x+6.6} 56" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"/>`}
   <path d="M${x-5} 61.4q5 ${(1.6+b*1.2).toFixed(1)} 10 0" fill="none" stroke="#9a5f7a" stroke-opacity="${cl(b/1.2*0.55).toFixed(2)}" stroke-width="1.1"/>`};
  const by=46-cl(b/0.6)*1.6, ub=over?2.4:0;
  const brows=`<path d="M42.5 ${(by+1).toFixed(1)}q6.5-3.6 13 -.6" fill="none" stroke="${HAIR}" stroke-width="2.3" stroke-linecap="round"/><path d="M64.5 ${(by+0.4-ub).toFixed(1)}q6.5-3 13 ${over?1.6:0.6}" fill="none" stroke="${HAIR}" stroke-width="2.3" stroke-linecap="round"/>`;
  let mouth;
  if(lying) mouth='<ellipse cx="60" cy="77" rx="3" ry="2.2" fill="#6e2a20"/>';
  else if(over) mouth=`<path d="M50 76.5q4-3 8 0t8 0q3-1.6 4.5-.4" fill="none" stroke="#a5504a" stroke-width="2.2" stroke-linecap="round"/>`;
  else { const sm=b<0.12?4:4+cl(b/cap)*7; mouth = sm>7
    ? `<path d="M50 74.5Q60 ${(74.5+sm*1.5).toFixed(1)} 70 74.5Z" fill="#6b241c"/><path d="M51.6 74.9Q60 77.2 68.4 74.9L68.6 74.5H51.4z" fill="#fff"/><path d="M55 ${(74.5+sm*1.05).toFixed(1)}q5 2 10 0" fill="none" stroke="#e0756c" stroke-width="1.6"/><path d="M49.6 74.4Q60 72.6 70.4 74.4" fill="none" stroke="#b9645a" stroke-width="1.3"/>`
    : `<path d="M50.5 75Q60 ${(75+sm*1.1).toFixed(1)} 69.5 75" fill="none" stroke="#a5504a" stroke-width="2.2" stroke-linecap="round"/>`; }
  const strands=over&&!lying?`<path d="M44 29q-7-5-6-12M58 24q1-9 7-11M75 29q8-5 11-2M38 40q-7-1-9-6" fill="none" stroke="${HAIR}" stroke-width="2.6" stroke-linecap="round"/>`:"";
  const glasses=b>=0.8&&!lying?`<g transform="rotate(${(6+cross*4).toFixed(1)} 60 56)" fill="rgba(255,255,255,.06)" stroke="#1d1712" stroke-width="1.7"><rect x="40" y="49.5" width="18" height="13" rx="5"/><rect x="62" y="49.5" width="18" height="13" rx="5"/><path d="M58 54.5q2-2 4 0M40 54l-6-2M80 54l6-2" fill="none"/></g>`:"";
  const sweat=b>=1&&!lying?`<path d="M84 39q-3.6 5.4-.2 8q3.6-1.6.2-8z" fill="#9fd8ff" stroke="#5ab0ff" stroke-width=".6"/>`:"";
  const hic=b>=0.6&&b<1.5?`<g fill="none" stroke="#8fd0ff" stroke-opacity=".7"><circle cx="24" cy="30" r="3"/><circle cx="17" cy="20" r="2"/><circle cx="21" cy="11" r="1.3"/></g>`:"";
  const wrink=over&&!lying?`<path d="M38 104q5 3 9 1M72 106q5-1 8 2M52 112q4-2 7 0" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="1.6" stroke-linecap="round"/>`:"";
  const collarOpen=b>=0.5;
  const arm=k?`<path d="M90 101Q103 99 103 88" fill="none" stroke="${c}" stroke-width="10" stroke-linecap="round"/><path d="M90 101Q103 99 103 88" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="10" stroke-linecap="round" stroke-dasharray="0 6 30"/>${heldGlass(k)}<ellipse cx="103.5" cy="84.5" rx="5.6" ry="4.6" fill="${SK}"/><path d="M99 83.5h9M99 86h9" stroke="#d39b72" stroke-width=".8"/>`:"";
  const person=`
   <path d="M16 120C17 99 34 90 60 90S103 99 104 120Z" fill="${c}"/>
   <path d="M16 120C17 99 34 90 60 90S103 99 104 120Z" fill="url(#sh${n})"/>
   ${wrink}
   <path d="M51 76h18v14q-9 6-18 0z" fill="#dda57d"/>
   ${collarOpen?`<path d="M52 89l8 11l8-11z" fill="#dda57d"/>`:""}
   <path d="M49 88L60 ${collarOpen?100:97}L71 88L68 85.5L60 ${collarOpen?94:92}L52 85.5Z" fill="#f4efe8"/>
   <path d="M60 ${collarOpen?100:97}V120" stroke="rgba(0,0,0,.2)" stroke-width="1"/>
   ${collarOpen?"":'<circle cx="60" cy="100" r="1.2" fill="rgba(255,255,255,.7)"/>'}<circle cx="60" cy="108" r="1.2" fill="rgba(255,255,255,.7)"/><circle cx="60" cy="116" r="1.2" fill="rgba(255,255,255,.7)"/>
   <ellipse cx="33.5" cy="58" rx="5" ry="7.6" fill="${SK}"/><path d="M33.5 53q-2.6 5 0 10" fill="none" stroke="#c98d64" stroke-width="1.2"/>
   <ellipse cx="86.5" cy="58" rx="5" ry="7.6" fill="${SK}"/><path d="M86.5 53q2.6 5 0 10" fill="none" stroke="#c98d64" stroke-width="1.2"/>
   <ellipse cx="60" cy="57" rx="26" ry="29.5" fill="url(#sk${n})"/>
   <ellipse cx="60" cy="57" rx="26" ry="29.5" fill="#86c97a" opacity="${green.toFixed(2)}"/>
   <ellipse cx="45" cy="67" rx="7.5" ry="4.6" fill="url(#bl${n})" opacity="${blush.toFixed(2)}"/><ellipse cx="75" cy="67" rx="7.5" ry="4.6" fill="url(#bl${n})" opacity="${blush.toFixed(2)}"/>
   <path d="M34 50C30 28 45 20 61 20C79 20 91 31 86.5 51C84 41 77 35 67 37C60 31 47 34 41 42C37.5 45 35.5 47 34 50Z" fill="url(#hr${n})"/>
   <path d="M47 27q8-4 18-2M70 26q8 3 12 9" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1.6" stroke-linecap="round"/>
   ${strands}${brows}
   ${eye(49,cross,"l")}${eye(71,-cross,"r")}
   <path d="M60 58q-3.4 7.4-2.2 10.4q2.4 1.6 5 .2" fill="none" stroke="#c2845c" stroke-width="1.4" stroke-linecap="round"/>
   <ellipse cx="61" cy="67.6" rx="3.4" ry="2.4" fill="#e8615a" opacity="${nose.toFixed(2)}"/>
   ${mouth}${glasses}${sweat}`;
  const body=lying
   ? `<ellipse cx="70" cy="84" rx="30" ry="9" fill="#e9e2d6"/><ellipse cx="70" cy="81" rx="26" ry="5.5" fill="#f6f1e8"/><g transform="translate(8 8) scale(.82) rotate(90 60 60)">${person}</g>`
   : `<g transform="rotate(${tilt.toFixed(1)} 60 118)">${person}${arm}</g>`;
  const keys=b>=0.5&&!lying?`<g transform="translate(2 2)"><circle cx="11" cy="11" r="10.5" fill="#18140f" stroke="#ff5a4e" stroke-width="1.8"/><circle cx="7.6" cy="11" r="3" fill="none" stroke="#f7f1ea" stroke-width="1.6"/><path d="M10.6 11h6.4M15 11v2.8M12.8 11v2" stroke="#f7f1ea" stroke-width="1.6"/><path d="M4 18L18 4" stroke="#ff5a4e" stroke-width="2"/></g>`:"";
  const lyingWater=lying?`<g transform="translate(22 32) scale(.8)">${heldGlass("water")}</g>`:"";
  const lab=lying?"avatar allongé":over?"avatar au-dessus du plafond":b>=0.5?"avatar éméché":b>=0.2?"avatar pompette":"avatar en forme";
  return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="${lab}" style="flex:none;overflow:visible">
  <defs><radialGradient id="sk${n}" cx="42%" cy="38%" r="70%"><stop offset="0" stop-color="#f8d7b8"/><stop offset=".6" stop-color="#efbd94"/><stop offset="1" stop-color="#d4966b"/></radialGradient>
  <radialGradient id="bl${n}"><stop offset="0" stop-color="#ff5d5d" stop-opacity=".9"/><stop offset="1" stop-color="#ff5d5d" stop-opacity="0"/></radialGradient>
  <linearGradient id="hr${n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4c3322"/><stop offset="1" stop-color="#2a1b11"/></linearGradient>
  <linearGradient id="sh${n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
  <clipPath id="el${n}"><ellipse cx="49" cy="56" rx="6.4" ry="4.4"/></clipPath><clipPath id="er${n}"><ellipse cx="71" cy="56" rx="6.4" ry="4.4"/></clipPath></defs>
  ${hic}${body}${lyingWater}${keys}</svg>`;
}

