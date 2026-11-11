/* Alamb'hic — interface. Le serveur calcule les taux et les titres ; le mode démo calcule localement. */
"use strict";
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const {PRESETS,MIN,fmt}=YD;
const hm=t=>new Date(t).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
const ls={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const COLORS=["#f7941d","#5ab0ff","#5bc88a","#e879f9","#f2c94c","#ff7a6e","#7dd3fc","#c4b5fd","#fda4af","#a3e635"];

/* état */
const S={screen:"boot",user:null,me:null,code:null,snap:null,tab:"moi",cfg:{},week:null,ws:null,wsTry:0,err:"",authMode:"login"};
let ago=0, feedUnread=0, seen=new Set(), bootT=Date.now(), my={};
let demo=false, demoStart=0, demoT=0, demoSeen=new Set(), demoTimer=null, demoPlayers={};
const NOW=()=>demo?demoT:Date.now();

/* API */
async function api(method,url,body){
  const r=await fetch(url,{method,headers:body?{"Content-Type":"application/json"}:{},body:body?JSON.stringify(body):undefined,credentials:"same-origin"});
  let data={}; try{data=await r.json()}catch(e){}
  if(!r.ok){const e=new Error(data.error||"Erreur réseau. Vérifiez votre connexion.");e.status=r.status;throw e}
  return data;
}
const profileReady=u=>u&&u.pseudo&&u.age>=18&&u.height&&u.weight;

/* liste des joueurs prête à afficher */
function compute(){
  const now=NOW();
  if(demo){
    const list=Object.values(demoPlayers).sort((a,b)=>a.joined-b.joined);
    list.forEach((p,i)=>{p.color=COLORS[i%COLORS.length];p.sim=YD.simulate(p,now);p.ev=YD.events(p,p.sim,now);p.score=YD.scoreOf(p.ev)});
    return {now,list,log:[]};
  }
  const list=(S.snap?.members||[]).map((m,i)=>({...m,color:COLORS[i%COLORS.length]}));
  return {now,list,log:S.snap?.log||[]};
}

function stateOf(b,cap){
  if(b>=1.5) return ["Alerte",`var(--care)`];
  if(b>=cap) return ["Au-dessus du plafond","var(--bad)"];
  if(b>=0.5) return ["Interdit de conduire","var(--warn)"];
  if(b>=0.2) return ["Pompette","var(--accent)"];
  return ["Sobre","var(--ok)"];
}

function viewMe(p,now){
  const s=p.sim, cap=+my.cap||0.8, [lab,col]=stateOf(s.cur,cap), maxB=Math.max(1.6,cap+0.4);

  const std=(s.grams/10).toFixed(1).replace(".",",");
  const sub=s.peakT?`Pic ${fmt(s.peak)} à ${hm(s.peakT)} · ${std} verres standard`+(s.cur>0&&s.zeroT?` · retour à 0 vers ${hm(s.zeroT)}`:""):"Aucun verre d'alcool pour l'instant";
  const mine=(my.drinks||[]).slice().sort((a,b)=>b.t-a.t);
  const titles=p.ev.filter(e=>e.kind!=="info");
  const needMeals=!demo&&!p.mealsOk&&!(my.drinks||[]).some(d=>d.abv>0)&&!my.sam;
  return `${needMeals?viewMealsFirst():mealQuestion()}<section>
  <div class="card" style="display:flex;flex-direction:column;gap:12px">
    <div class="row" style="justify-content:space-between"><span class="label">${esc(my.pseudo)} · taux estimé</span><span class="state" style="color:${col}">${lab}</span></div>
    <div class="row merow">${avx(p,88,lab,"me")}${gauge(s.cur,maxB,cap,col,s.cur<s.prev-0.004)}<div class="bac">${fmt(s.cur)}<small>g/L</small></div></div>
    <div class="muted" style="font-size:13px">${sub}. Plafond perso : ${fmt(cap)} g/L.</div>
  </div></section>
  <section><h2>${my.sam?"Sam boit de l'eau":"Ajouter un verre"}</h2>
  <div class="field"><span class="label">Bu</span><div class="seg" id="ago">${[[0,"Maintenant"],[15,"il y a 15 min"],[30,"30 min"],[60,"1 h"]].map(([v,l])=>`<button data-v="${v}" aria-pressed="${ago===v}">${l}</button>`).join("")}</div></div>
  ${demo?"":`<label class="toggle"><span>Je suis Sam ce soir (zéro alcool)</span><input type="checkbox" id="samT" ${my.sam?"checked":""}></label>`}
  ${needMeals?`<div class="banner">Indiquez d'abord vos repas du jour, juste au-dessus : ils changent beaucoup le calcul. L'eau reste disponible.</div>`:""}
  <div class="drinks${needMeals?" locked":""}">${PRESETS.filter(d=>!my.sam||d.water).map((d,i)=>`<button class="drink${d.water?" water":""}${pend["p"+PRESETS.indexOf(d)]?" "+pend["p"+PRESETS.indexOf(d)]:""}" data-p="${PRESETS.indexOf(d)}" ${pend["p"+PRESETS.indexOf(d)]==="sending"?'aria-busy="true"':""}><b>${d.l}</b><span>${d.d}</span></button>`).join("")}</div>
  ${my.sam?"":`<div class="row"><div class="field" style="flex:1;min-width:90px"><span class="label">Volume (cl)</span><input id="cml" type="number" inputmode="decimal" min="1" max="100" placeholder="15"></div><div class="field" style="flex:1;min-width:90px"><span class="label">Degré (%)</span><input id="cabv" type="number" inputmode="decimal" min="0" max="80" placeholder="13"></div><button class="btn${pend.perso?" "+pend.perso:""}" id="cadd" style="align-self:flex-end">${pend.perso==="ok"?"✓ Noté":pend.perso==="sending"?"Envoi…":"Ajouter"}</button></div>`}
  </section>
  ${needMeals?"":viewMeals()}
  ${titles.length?`<section><h2>Mes titres</h2><div class="badges">${titles.map(e=>`<span class="badge ${e.kind}">${esc(e.title)}</span>`).join("")}</div></section>`:""}
  <section><h2>Mes verres</h2>${mine.length?`<div class="list">${mine.map(d=>`<div class="item"><span class="t">${hm(d.t)}</span><div class="grow"><b>${esc(d.l)}</b> <span class="muted">${d.ml/10} cl · ${String(d.abv).replace(".",",")} %</span></div><button class="x" data-del="${d.id}" aria-label="Supprimer ce verre">×</button></div>`).join("")}</div>`:`<p class="muted">Touchez une boisson ci-dessus pour l'enregistrer. Pensez à l'eau : trois verres débloquent le Chameau.</p>`}</section>`;
}
function viewChart(list,now){
  const withD=list.filter(p=>p.sim.pts.length);
  if(!withD.length) return `<section><h2>Courbes de la soirée</h2><p class="muted">Les courbes apparaissent dès le premier verre d'alcool enregistré.</p></section>`;
  const t0=Math.min(...withD.map(p=>p.sim.pts[0][0]));
  let t1=Math.max(now+30*MIN,...withD.map(p=>p.sim.zeroT||now)); t1=Math.min(t1,now+10*3600e3);
  const ymax=Math.max(1.0,...withD.map(p=>Math.max(...p.sim.pts.filter(x=>x[0]<=t1).map(x=>x[1]))))*1.1;
  const W=Math.max(320,($("#app").clientWidth||340)), H=260, L=34, R=10, T=12, B=26;
  const X=t=>L+(t-t0)/(t1-t0)*(W-L-R), Y=b=>T+(1-b/ymax)*(H-T-B);
  let g="";
  for(const [v,c,lab] of [[0.5,"var(--warn)","0,5"],[0.8,"var(--accent)","0,8"],[1.2,"var(--bad)","1,2"]]) if(v<ymax) g+=`<line x1="${L}" x2="${W-R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${c}" stroke-opacity=".45" stroke-dasharray="3 4"/><text x="${L-6}" y="${Y(v)+4}" text-anchor="end" fill="var(--muted)" font-size="11">${lab}</text>`;
  g+=`<line x1="${L}" x2="${W-R}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--line)"/><text x="${L-6}" y="${Y(0)+4}" text-anchor="end" fill="var(--muted)" font-size="11">0</text>`;
  const span=t1-t0, stepH=span>8*3600e3?2:1; let h0=new Date(t0); h0.setMinutes(0,0,0); let th=h0.getTime()+3600e3;
  for(;th<t1;th+=stepH*3600e3) g+=`<text x="${X(th)}" y="${H-8}" text-anchor="middle" fill="var(--muted)" font-size="11">${new Date(th).getHours()}h</text>`;
  g+=`<line x1="${X(now)}" x2="${X(now)}" y1="${T}" y2="${Y(0)}" stroke="var(--fg)" stroke-opacity=".35"/><text x="${X(now)+4}" y="${T+10}" fill="var(--muted)" font-size="11">maintenant</text>`;
  for(const p of withD){
    const pts=p.sim.pts.filter((x,i)=>i%3===0||x[0]>=now-MIN&&x[0]<=now+MIN), past=pts.filter(x=>x[0]<=now), fut=pts.filter(x=>x[0]>=now&&x[0]<=t1);
    const d=a=>a.map((x,i)=>(i?"L":"M")+X(x[0]).toFixed(1)+" "+Y(x[1]).toFixed(1)).join("");
    if(past.length>1) g+=`<path d="${d(past)}" fill="none" stroke="${p.color}" stroke-width="2.5" stroke-linejoin="round"/>`;
    if(fut.length>1) g+=`<path d="${d(fut)}" fill="none" stroke="${p.color}" stroke-width="2" stroke-dasharray="4 5" stroke-opacity=".7"/>`;
    g+=`<circle cx="${X(now)}" cy="${Y(p.sim.cur)}" r="4.5" fill="${p.color}" stroke="var(--bg)" stroke-width="2"/>`;
  }
  return `<section><h2>Courbes de la soirée</h2><div class="card" style="padding:12px 8px"><div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Taux estimés de chaque joueur au fil de la soirée">${g}</svg></div></div>
  <div class="legend">${withD.map(p=>`<span><i class="dot" style="background:${p.color}"></i>${esc(p.pseudo)} · ${fmt(p.sim.cur)}</span>`).join("")}</div>
  <p class="muted" style="font-size:13px">Trait plein : taux estimé jusqu'à maintenant. Pointillés : redescente prévue si plus personne ne boit.</p></section>`;
}
/* ---------- animations ---------- */
const REDUCE=(()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){return false}})();
/* Jauge : alambic qui se remplit de potion (dessin dans avatar.js), sans graduation (indicatif). */
let gaugePrev=null;
function gauge(cur,maxB,cap,col,down){
  const r=Math.max(0,Math.min(1,cur/maxB)), from=gaugePrev===null?r:gaugePrev; gaugePrev=r;
  return `<div class="gauge alam">${alambic(r,from,down)}</div>`;
}
function animateGauge(){
  document.querySelectorAll(".gauge .alq").forEach(q=>{ const go=()=>{q.style.transform=`translateY(${q.dataset.to}px)`};
    if(REDUCE) return go(); requestAnimationFrame(()=>requestAnimationFrame(go)) });
}
/* Une goutte de potion vole du bouton touché jusqu'à l'entrée du tuyau. */
function flyDrop(rect){
  if(REDUCE||!rect) return;
  const go=()=>{ const g=document.querySelector(".gauge svg"); if(!g) return; const t=g.getBoundingClientRect();
    const x0=rect.left+rect.width/2, y0=rect.top+rect.height/2, x1=t.left+t.width*0.5, y1=t.top-2;
    const d=document.createElement("div"); d.className="dropfx"; document.body.appendChild(d);
    const mx=(x0+x1)/2, my=Math.min(y0,y1)-90;
    const a=d.animate([{transform:`translate(${x0}px,${y0}px) scale(.6)`,opacity:0},{transform:`translate(${mx}px,${my}px) scale(1)`,opacity:1,offset:.45},{transform:`translate(${x1}px,${y1}px) scale(.8)`,opacity:1}],{duration:700,easing:"cubic-bezier(.4,0,.2,1)"});
    a.onfinish=()=>{ d.remove(); const s=document.createElement("div"); s.className="splashfx"; s.style.left=x1+"px"; s.style.top=y1+"px"; document.body.appendChild(s); setTimeout(()=>s.remove(),600) } };
  setTimeout(go,30);
}
/* Fiole qui se remplit, à la place de « Chargement… ». */
const loader=t=>`<div class="loader"><svg viewBox="0 0 40 48" aria-hidden="true"><path d="M15 4h10M17 4v12L7 34a8 8 0 0 0 7 12h12a8 8 0 0 0 7-12L23 16V4" class="lf"/><clipPath id="lc"><path d="M17 16L7 34a8 8 0 0 0 7 12h12a8 8 0 0 0 7-12L23 16z"/></clipPath><g clip-path="url(#lc)"><rect x="0" y="20" width="40" height="30" class="ll"/></g></svg><span>${t}</span></div>`;
let trendPrev={}, statePrev={};
/* Avatar vivant : il se balance d'autant plus que le taux est haut ; à chaque changement de stade (seuils fixes, pas le plafond perso), il sursaute et annonce son nouveau stade. */
function avx(p,size,_lab,key){
  key=key||p.id; const lab=AV_NAMES[avStage(Math.max(0,p.sim?.cur||0))]; const old=statePrev[key], now=Date.now();
  const at=old?(old.lab!==lab?now:old.at):0, el=now-at, changed=!!at&&el<2200&&!REDUCE;   // l'animation continue au fil des rafraîchissements
  const sw=Math.min(1.4,Math.max(0,p.sim?.cur||0))*4.5;
  return `<span class="avw${changed?" avchg":""}${sw<0.4?" still":""}" style="--sw:${sw.toFixed(2)}deg;--el:-${el}ms" data-st="${esc(key)}|${at}|${esc(lab)}">${avatar(p,size)}${changed?`<em class="avbub">${esc(lab)}</em>`:""}</span>`;
}

/* Potes en direct : taux, tendance façon bourse, mini-courbe, dernier titre */
const valAt=(pts,t)=>{let v=0;for(const [x,b] of pts||[]){if(x<=t)v=b;else break}return v};
function trendOf(p,now){
  const cur=p.sim.cur, past=valAt(p.sim.pts,now-15*MIN), rate=(cur-past)*4;   // g/L par heure, sur les 15 dernières minutes
  if(cur<0.01&&past<0.01) return {k:"flat",txt:"stable",rate:0};
  if(Math.abs(rate)<0.02) return {k:"flat",txt:"stable",rate};
  return rate>0?{k:"up",txt:`+${fmt(rate)}/h`,rate}:{k:"down",txt:`−${fmt(-rate)}/h`,rate};
}
function spark(p,now,color){
  const t0=now-120*MIN, t1=now+60*MIN, W=120, H=36, pts=(p.sim.pts||[]).filter(x=>x[0]>=t0-5*MIN&&x[0]<=t1);
  const mx=Math.max(0.6,...pts.map(x=>x[1]))*1.1, X=t=>((t-t0)/(t1-t0))*W, Y=b=>H-2-(b/mx)*(H-4);
  const path=a=>a.map((x,i)=>(i?"L":"M")+X(Math.max(t0,x[0])).toFixed(1)+" "+Y(x[1]).toFixed(1)).join("");
  const past=pts.filter(x=>x[0]<=now), fut=pts.filter(x=>x[0]>=now);
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
    <line x1="${X(now)}" x2="${X(now)}" y1="0" y2="${H}" stroke="var(--line)"/>
    ${past.length>1?`<path d="${path(past)}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round"/>`:""}
    ${fut.length>1?`<path d="${path(fut)}" fill="none" stroke="${color}" stroke-width="1.6" stroke-dasharray="3 4" opacity=".6"/>`:""}
    <circle cx="${X(now)}" cy="${Y(p.sim.cur)}" r="3" fill="${color}"/></svg>`;
}
function viewRank(list,now){
  const live=S.rankMode!=="points";
  const seg=`<div class="seg" id="rankSeg" style="margin-bottom:4px"><button data-rm="live" aria-pressed="${live}">En direct</button><button data-rm="points" aria-pressed="${!live}">Points</button></div>`;
  if(live){
    const r=list.slice().sort((a,b)=>(b.id===S.me)-(a.id===S.me)||b.sim.cur-a.sim.cur);
    return `<section><h2>Mes potes en direct</h2>${seg}
    <p class="muted" style="font-size:13px;margin:0">Taux estimé et tendance sur les 15 dernières minutes : ▲ ça monte, ▼ ça redescend.</p>
    <div class="live">${r.map(p=>{const [lab,col]=stateOf(p.sim.cur,+p.cap||0.8), tr=trendOf(p,now), last=p.ev.filter(e=>e.kind!=="info").sort((a,b)=>b.t-a.t)[0];
      return `<div class="lcard"><div class="lhead">${avx(p,58,lab)}<div class="lname"><b>${esc(p.pseudo)}</b>${p.id===S.me?'<span class="muted"> (vous)</span>':""}<span class="lstate" style="color:${col}">${lab}</span></div></div>
      <div class="lrow"><span class="lnum" style="color:${col}">${fmt(p.sim.cur)}<small>g/L</small></span><span class="ltr ${tr.k}${trendPrev[p.id]&&trendPrev[p.id]!==tr.k?" chg":""}" data-tk="${p.id}|${tr.k}">${tr.k==="up"?"▲":tr.k==="down"?"▼":"■"} ${tr.txt}</span></div>
      ${spark(p,now,p.color)}
      <div class="ltitle ${last?last.kind:""}">${last?`${esc(last.title)} <span class="muted">· ${hm(last.t)}</span>`:`<span class="muted">Pas encore de titre</span>`}</div></div>`}).join("")}</div></section>`;
  }
  const r=list.slice().sort((a,b)=>b.score-a.score||a.sim.peak-b.sim.peak);
  return `<section><h2>Classement des titres</h2>${seg}<p class="muted" style="font-size:13px">Titre gagné : +10. Titre de honte (plafond, Naufragé, Fusée) : −15. Rester raisonnable rapporte plus que grimper.</p>
  ${r.map((p,i)=>{const [lab,col]=stateOf(p.sim.cur,+p.cap||0.8);const t=p.ev.filter(e=>e.kind!=="info");return `<div class="card player">${avx(p,48,lab,"r"+p.id)}<div><b>${i+1}. ${esc(p.pseudo)}</b>${p.id===S.me?' <span class="muted">(vous)</span>':""}${p.sam?' <span class="badge trophy" style="padding:2px 6px;font-size:11px">Sam</span>':""}</div><div class="num" style="color:${col}">${fmt(p.sim.cur)}</div>
  <div class="meta">${lab} · pic ${fmt(p.sim.peak)} · <span class="score">${p.score>0?"+":""}${p.score} pts</span>${t.length?"<br>"+t.map(e=>esc(e.title)).join(", "):""}</div></div>`}).join("")}</section>`;
}

/* ---------- repas ---------- */
const {MEALS,MEAL_ORDER}=YD;
const SLOTS=[{k:"matin",l:"Petit-déjeuner",h:"08:00",def:"light",from:6,to:10.5},{k:"midi",l:"Déjeuner",h:"12:30",def:"full",from:11.5,to:15},
  {k:"gouter",l:"Goûter",h:"16:30",def:"snack",from:15.5,to:18},{k:"soir",l:"Dîner",h:"20:00",def:"full",from:18.5,to:22.5}];
/* La question « avez-vous mangé ? » ne s'affiche que sur les vrais créneaux de repas (déjeuner 12 h-14 h 30, dîner 19 h 30-22 h). */
const ASK={midi:[12,14.5],soir:[19.5,22]};
const myMeals=()=>demo?(demoPlayers[S.me]?.meals||[]):(S.meals||[]);
/* heure saisie dans le futur (au-delà de 15 min) : refusée plutôt que reportée à la veille */
const futureHM=hmS=>{const [h,m]=hmS.split(":").map(Number);const d=new Date(NOW());d.setHours(h,m,0,0);return d.getTime()>NOW()+15*MIN&&d.getHours()>=6};
const atHM=hmS=>{const [h,m]=hmS.split(":").map(Number);const d=new Date(NOW());d.setHours(h,m,0,0);if(d.getTime()>NOW()+15*MIN)d.setDate(d.getDate()-1);return d.getTime()};
const hourNow=()=>{const d=new Date(NOW());return d.getHours()+d.getMinutes()/60};
function kindSelect(id,val,withNone){return `<select id="${id}">${withNone?`<option value="">Rien</option>`:""}${MEAL_ORDER.map(k=>`<option value="${k}" ${val===k?"selected":""}>${MEALS[k].l}</option>`).join("")}</select>`}
function viewMealsFirst(){
  const h=hourNow(), past=SLOTS.filter(x=>x.from<=h);
  return `<section><div class="card meals1"><span class="label" style="color:var(--accent)">Avant votre premier verre</span>
  <h2>Qu'avez-vous mangé aujourd'hui ?</h2>
  <p class="muted" style="margin:0;font-size:13px">Un repas ralentit le passage de l'alcool dans le sang et baisse le pic. Pour chaque repas pris, indiquez son type et son heure.</p>
  ${(past.length?past:SLOTS.slice(0,1)).map(x=>`<div class="mrow"><b>${x.l}</b><input type="time" id="mt-${x.k}" value="" aria-label="Heure du ${x.l}" placeholder="${x.h}">${kindSelect("mk-"+x.k,x.def,true)}</div>`).join("")}
  <div class="row"><button class="btn" id="mealsOk">Valider mes repas</button><button class="btn ghost" id="mealsNone">Rien mangé</button></div></div></section>`;
}
function mealSlotNow(){
  const h=hourNow(); const sl=SLOTS.find(x=>ASK[x.k]&&h>=ASK[x.k][0]&&h<=ASK[x.k][1]); if(!sl) return null;
  const since=atHM(String(Math.floor(sl.from-1)).padStart(2,"0")+":00");
  if(myMeals().some(m=>m.t>=since)) return null;
  const key=`yd_mq_${new Date(NOW()).toDateString()}_${sl.k}`, until=ls.get(key,0);
  if(until===-1||until>NOW()) return null;
  return {...sl,key};
}
function mealQuestion(){
  if(demo) return ""; const sl=mealSlotNow(); if(!sl) return "";
  return `<section><div class="card mq"><span class="label" style="color:var(--care)">Il est ${hm(NOW())}</span><h2>${sl.k==="soir"?"Avez-vous dîné ?":sl.k==="midi"?"Avez-vous déjeuné ?":"Avez-vous mangé quelque chose ?"}</h2>
  <div class="mrow"><b>Oui, à</b><input type="time" id="mqT" value="" aria-label="Heure du repas" placeholder="${sl.h}">${kindSelect("mqK",sl.def,false)}<button class="btn small" id="mqOk">Valider</button></div>
  <div class="row"><button class="btn ghost small" data-mqno="45">Pas encore</button><button class="btn ghost small" data-mqno="-1">Je ne mangerai pas</button></div></div></section>`;
}
function viewMeals(){
  const ms=myMeals().slice().sort((a,b)=>b.t-a.t);
  return `<section><h2>Mes repas</h2>
  ${ms.length?`<div class="list">${ms.map(m=>`<div class="item"><span class="t">${hm(m.t)}</span><div class="grow"><b>${MEALS[m.kind]?.l||m.kind}</b> <span class="muted">${MEALS[m.kind]?.d||""}</span></div><button class="x" data-mdel="${m.id??m.t}" aria-label="Supprimer ce repas">×</button></div>`).join("")}</div>`:`<p class="muted" style="margin:0">Aucun repas noté ces dernières 24 h : l'alcool est compté à jeun.</p>`}
  <div class="mrow add"><input type="time" id="mAddT" value="" aria-label="Heure du repas">${kindSelect("mAddK","full",false)}<button class="btn small" id="mAdd">Ajouter un repas</button></div></section>`;
}
async function addMeals(list){
  if(demo){ const p=demoPlayers[S.me]; p.meals=[...(p.meals||[]),...list]; render(); return }
  for(const m of list) await api("POST","/api/me/meals",m);
  await api("PUT",`/api/parties/${S.code}/me`,{mealsOk:true});
  await loadMeals(); await refresh();
}
async function loadMeals(){ if(demo) return; try{ S.meals=(await api("GET","/api/me/meals")).meals }catch(e){} }
function bindMeals(){
  const ok=$("#mealsOk"); if(ok) ok.onclick=()=>run(async()=>{
    const chosen=SLOTS.filter(x=>$("#mk-"+x.k)&&$("#mk-"+x.k).value), miss=chosen.find(x=>!$("#mt-"+x.k).value);
    if(miss) throw new Error(`Indiquez l'heure du ${miss.l.toLowerCase()}.`);
    const fut=chosen.find(x=>futureHM($("#mt-"+x.k).value)); if(fut) throw new Error(`L'heure du ${fut.l.toLowerCase()} n'est pas encore passée.`);
    const list=chosen.map(x=>({kind:$("#mk-"+x.k).value,t:atHM($("#mt-"+x.k).value)}));
    if(list.some(m=>m.t>NOW()+15*MIN)) throw new Error("Un repas ne peut pas être dans le futur.");
    await addMeals(list); flash("Repas enregistrés",list.length?list.map(m=>`${MEALS[m.kind].l} à ${hm(m.t)}`).join(", "):"Aucun repas : l'alcool sera compté à jeun.") });
  const none=$("#mealsNone"); if(none) none.onclick=()=>run(async()=>{ await addMeals([]); });
  const mq=$("#mqOk"); if(mq) mq.onclick=()=>run(async()=>{ const v=$("#mqT").value; if(!v) throw new Error("Indiquez l'heure du repas."); if(futureHM(v)) throw new Error("Cette heure n'est pas encore passée.");
    const t=atHM(v); await addMeals([{kind:$("#mqK").value,t}]); flash("Bon appétit",`${MEALS[$("#mqK")?.value||"full"]?.l||"Repas"} noté à ${hm(t)} : l'alcool passera plus lentement.`) });
  document.querySelectorAll("[data-mqno]").forEach(b=>b.onclick=()=>{ const sl=mealSlotNow(); if(sl) ls.set(sl.key,+b.dataset.mqno<0?-1:NOW()+45*MIN); render() });
  const ad=$("#mAdd"); if(ad) ad.onclick=()=>run(async()=>{ const v=$("#mAddT").value; if(!v) throw new Error("Indiquez l'heure du repas."); if(futureHM(v)) throw new Error("Cette heure n'est pas encore passée."); const t=atHM(v); await addMeals([{kind:$("#mAddK").value,t}]); flash("Repas ajouté",`${MEALS[$("#mAddK")?.value||"full"]?.l||"Repas"} à ${hm(t)}`) });
  document.querySelectorAll("[data-mdel]").forEach(b=>b.onclick=()=>run(async()=>{ const id=+b.dataset.mdel;
    if(demo){const p=demoPlayers[S.me];p.meals=p.meals.filter(m=>m.t!==id);render();return}
    await api("DELETE","/api/me/meals/"+id); await loadMeals(); await refresh() }));
}

/* ---------- notifications ---------- */
function notify(list,log){
  const all=list.flatMap(p=>p.ev).concat(log);
  let fresh=[];
  if(demo){ fresh=all.filter(e=>!demoSeen.has(e.key)); demoSeen=new Set(all.map(e=>e.key)); }
  else{
    for(const e of all){ if(!seen.has(e.key)){ seen.add(e.key); if(Date.now()-bootT>4000 || e.t>bootT-60000) fresh.push(e) } }
    if(fresh.length) ls.set("yd_seen_"+S.code,[...seen].slice(-600));
  }
  fresh.sort((a,b)=>a.t-b.t).slice(demo?-2:-4).forEach(e=>{toast(e); if(S.tab!=="fil") feedUnread++});
  if(fresh.some(e=>e.kind==="care")) buzz([200,100,200]); else if(fresh.length) buzz(60);
}
/* Notifications de la soirée : une seule à la fois, les suivantes attendent leur tour. */
const ICONS={
  trophy:'<path d="M7 4h10v3a5 5 0 0 1-10 0V4z"/><path d="M7 5H4v1a3 3 0 0 0 3 3M17 5h3v1a3 3 0 0 1-3 3M12 12v4M8 20h8M9 16h6"/>',
  shame:'<circle cx="12" cy="12" r="9"/><path d="M8.5 16c1-1.3 2.2-2 3.5-2s2.5.7 3.5 2M9 9.5h.01M15 9.5h.01"/>',
  care:'<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17h.01"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  ok:'<path d="M5 12.5l4.5 4.5L19 7.5"/>'};
const icon=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]||ICONS.info}</svg>`;
const TQ=[]; let tShown=null, tTimer=null;
function toast(e){ TQ.push(e); if(TQ.length>6) TQ.splice(0,TQ.length-6); updQ(); pump() }
function updQ(){ const q=document.querySelector("#toasts .tq"); if(q){ q.textContent=TQ.length?`+${TQ.length}`:""; q.hidden=!TQ.length } }
function pump(){
  if(tShown||!TQ.length) return;
  const e=TQ.shift(), k=e.kind||"info", dur=k==="care"?12000:k==="shame"?6500:4500;
  const d=document.createElement("div"); d.className="toast "+k; d.setAttribute("role","status");
  d.innerHTML=`<span class="ti">${icon(k)}${k==="trophy"?'<em class="hic">hic!</em><i class="sp s1"></i><i class="sp s2"></i><i class="sp s3"></i>':""}</span><div class="tx"><b>${esc(e.title)}</b><span>${esc(e.text)}</span></div><span class="tq" hidden></span><button class="tc" aria-label="Fermer">×</button><i class="tp" style="animation-duration:${dur}ms"></i>`;
  const box=$("#toasts"); box.innerHTML=""; box.appendChild(d); tShown=d; updQ();
  requestAnimationFrame(()=>d.classList.add("in"));
  const close=()=>{ if(tShown!==d) return; clearTimeout(tTimer); d.classList.remove("in"); d.classList.add("out"); setTimeout(()=>{ d.remove(); tShown=null; pump() },200) };
  d.onclick=close; tTimer=setTimeout(close,dur);
}
/* Confirmations d'action : un bandeau en bas, avec « Annuler » quand c'est possible. */
let sTimer=null;
function snack(title,text="",opt={}){
  const s=$("#snack"); clearTimeout(sTimer);
  s.className="snack "+(opt.err?"err":"ok");
  s.innerHTML=`<span class="si">${icon(opt.err?"care":"ok")}</span><div class="sx"><b>${esc(title)}</b>${text?`<span>${esc(text)}</span>`:""}</div>${opt.undo?`<button class="su">Annuler</button>`:""}`;
  if(opt.undo) s.querySelector(".su").onclick=()=>{ hideSnack(); opt.undo() };
  s.hidden=false; requestAnimationFrame(()=>s.classList.add("show"));
  sTimer=setTimeout(hideSnack,opt.undo?6000:opt.err?5000:2800);
}
function hideSnack(){ const s=$("#snack"); s.classList.remove("show"); clearTimeout(sTimer); sTimer=setTimeout(()=>{s.hidden=true},250) }
const flash=(title,text,kind="info")=>snack(title,text,{err:kind==="err"||kind==="shame"});
const buzz=p=>{ try{ navigator.vibrate&&navigator.vibrate(p) }catch(_){} };

/* ---------- écrans hors soirée ---------- */
function viewAuth(){
  const reg=S.authMode==="register";
  return `<div class="hero"><h1>On trinque, on se chambre, on se surveille.</h1>
  <p class="muted">Chacun note ses verres. Alamb'hic estime les taux, trace les courbes de tout le groupe et prévient les autres quand quelqu'un débloque un titre ou franchit un seuil.</p></div>
  <section>
  <div class="seg tabs2"><button id="mLogin" aria-pressed="${!reg}">Connexion</button><button id="mReg" aria-pressed="${reg}">Créer un compte</button></div>
  <form id="authForm" class="field" style="gap:10px" novalidate>
   <div class="field"><span class="label">E-mail</span><input id="email" type="email" autocomplete="email" required value="${esc(S.fEmail||"")}"></div>
   <div class="field"><span class="label">Mot de passe${reg?" (8 caractères minimum)":""}</span><input id="pass" type="password" autocomplete="${reg?"new-password":"current-password"}" required></div>
   ${reg?`<label class="toggle consent"><input type="checkbox" id="consent" required ${S.fConsent?"checked":""}><span>J'ai 18 ans ou plus, j'accepte les <a href="/conditions" target="_blank">conditions d'utilisation</a> et le traitement de mes consommations décrit dans la <a href="/confidentialite" target="_blank">politique de confidentialité</a>.</span></label>`:""}
   ${S.err?`<div class="banner">${esc(S.err)}</div>`:""}
   <button class="btn" type="submit">${reg?"Créer mon compte":"Me connecter"}</button>
  </form>
  ${S.cfg.googleClientId?`<div class="or">ou</div><div class="google" id="gbtn"></div><p class="muted" style="font-size:12px;margin:0;text-align:center">En continuant avec Google, vous confirmez avoir 18 ans ou plus et acceptez les <a href="/conditions" target="_blank">conditions</a> et la <a href="/confidentialite" target="_blank">politique de confidentialité</a>.</p>`:""}
  <div class="or">pour découvrir</div>
  <button class="btn ghost" id="demoBtn">Voir la démo : une soirée fictive en accéléré</button>
  <p class="note">Réservé aux 18 ans et plus. Les taux affichés sont des estimations, jamais une autorisation de conduire. <a href="/confidentialite">Confidentialité</a> · <a href="/conditions">Conditions</a></p>
  </section>`;
}
function viewProfile(){
  const p=S.user||{}, edit=profileReady(S.user);
  const wk=S.week?weekView():"";
  return `<div class="hero"><h1>${edit?"Mon profil":"Votre profil"}</h1>${edit?"":`<p class="muted">Ces mesures servent au calcul de votre taux. Seuls votre pseudo, vos verres et vos taux sont visibles des autres joueurs.</p>`}</div>
  <section><div class="field"><span class="label">Pseudo</span><input id="pseudo" maxlength="20" value="${esc(p.pseudo||"")}" placeholder="Ex. Kiki"></div>
  <div class="grid2"><div class="field"><span class="label">Sexe biologique</span><select id="sex"><option value="H" ${p.sex!=="F"?"selected":""}>Homme</option><option value="F" ${p.sex==="F"?"selected":""}>Femme</option></select></div>
  <div class="field"><span class="label">Âge</span><input id="age" type="number" inputmode="numeric" min="18" max="99" value="${p.age||""}" placeholder="30"></div>
  <div class="field"><span class="label">Taille (cm)</span><input id="height" type="number" inputmode="numeric" min="130" max="220" value="${p.height||""}" placeholder="175"></div>
  <div class="field"><span class="label">Poids (kg)</span><input id="weight" type="number" inputmode="numeric" min="35" max="200" value="${p.weight||""}" placeholder="75"></div></div>
  <div class="field"><span class="label">Plafond perso (g/L)</span><select id="cap">${[0.5,0.6,0.8,1.0].map(v=>`<option value="${v}" ${(+p.cap||0.8)===v?"selected":""}>${fmt(v)}${v===0.8?" (conseillé)":""}</option>`).join("")}</select></div>
  ${S.err?`<div class="banner">${esc(S.err)}</div>`:""}
  <div class="row"><button class="btn" id="saveProf">Enregistrer</button>${edit?`<button class="btn ghost" id="back">Retour</button>`:""}</div>
  </section>
  ${wk}
  ${edit?`<section><div class="row">${S.user?.admin?`<button class="btn ghost small" id="openDocs">Documentation</button>`:""}<button class="btn ghost small" id="demoBtn2">Voir la démo</button>${S.user?.admin?`<a class="btn ghost small" href="/demo.html" target="_blank" rel="noopener" style="text-decoration:none">Banc de test (ordinateur)</a>`:""}</div></section><section><div class="row">${S.code?`<button class="btn ghost small" id="leave">Quitter la soirée ${esc(S.code)}</button>`:""}<button class="btn ghost small" id="logout">Me déconnecter</button></div>
  <button class="link danger" id="delAcc">Supprimer mon compte et toutes mes données</button><div id="delConfirm" hidden class="banner">Tout sera effacé : profil, verres, titres. <div class="row" style="margin-top:8px"><button class="btn small" id="delYes">Oui, tout supprimer</button><button class="btn ghost small" id="delNo">Annuler</button></div></div></section>`:""}`;
}
function weekView(){
  const days=[]; const by=Object.fromEntries((S.week.days||[]).map(d=>[d.day,d.std]));
  for(let i=6;i>=0;i--){const d=new Date(Date.now()-i*864e5);const k=d.toLocaleDateString("fr-CA",{timeZone:"Europe/Paris"});days.push({k,std:by[k]||0,lab:d.toLocaleDateString("fr-FR",{weekday:"narrow"})})}
  const tot=days.reduce((s,d)=>s+d.std,0), free=days.filter(d=>!d.std).length, mx=Math.max(2,...days.map(d=>d.std));
  return `<section><h2>Mes 7 derniers jours</h2>
  <div class="card" style="display:flex;flex-direction:column;gap:10px">
   <div class="row" style="justify-content:space-between"><span><b style="font-size:22px;font-family:var(--display)">${tot.toFixed(1).replace(".",",")}</b> <span class="muted">verres standard</span></span><span class="state" style="color:${tot>10?"var(--bad)":"var(--ok)"}">${tot>10?"au-dessus du repère":"sous le repère"} de 10</span></div>
   <div class="week">${days.map(d=>`<div><i style="height:${d.std/mx*70}%;background:${d.std>2?"var(--bad)":"var(--accent)"}"></i>${d.lab}</div>`).join("")}</div>
   <div class="muted" style="font-size:13px">${free} jour${free>1?"s":""} sans alcool. Repères de Santé publique France : 10 verres par semaine au plus, 2 par jour, et des jours sans alcool.</div>
  </div></section>`;
}
function viewDocs(){
  const back=`<button class="btn ghost small" id="back">Retour</button>`;
  if(!S.docs) return `<div class="hero"><h1>Documentation</h1></div><section>${loader("Chargement…")}${back}</section>`;
  const cats=[...new Set(S.docs.map(d=>d.cat))];
  const fd=d=>new Date(d+"T12:00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});
  return `<div class="hero"><h1>Documentation</h1><p class="muted">Réservée aux administrateurs. Chaque document est un PDF daté, mis à jour au fil du projet.</p></div>
  ${cats.map(c=>`<section><h2>${esc(c)}</h2>${S.docs.filter(d=>d.cat===c).map(d=>`<a class="card doc" href="/docs/${encodeURI(d.file)}" target="_blank" rel="noopener"><div class="row" style="justify-content:space-between;align-items:baseline"><b>${esc(d.title)}</b><span class="muted" style="font-size:12px">${fd(d.date)}</span></div><span class="muted" style="font-size:13px">${esc(d.desc)}</span><span class="label" style="color:var(--accent)">Ouvrir le PDF</span></a>`).join("")}</section>`).join("")}
  <section>${back}</section>`;
}
/* ---------- amis ---------- */
let fTimer=null;
function stopFriendsPoll(){ if(fTimer){clearInterval(fTimer);fTimer=null} }
async function loadFriends(){ try{ S.friends=await api("GET","/api/friends") }catch(e){ if(!S.friends) S.err=e.message } }
function openFriends(){ S.err=""; S.screen="friends"; render(); loadFriends().then(render); stopFriendsPoll();
  fTimer=setInterval(()=>{ if(document.visibilityState!=="visible"||S.screen!=="friends") return; if(document.activeElement&&/INPUT/.test(document.activeElement.tagName)) return; loadFriends().then(render) },30000) }
const inviteLink=()=>`${location.origin}/?ami=${S.friends?.code||""}`;
function friendCard(f,i,now){
  const L=f.live, color=COLORS[(i+1)%COLORS.length];
  if(!L) return `<div class="lcard off"><div class="lhead">${avatar({id:f.id,color,cap:f.cap,sim:{cur:0,prev:0,peak:0},drinks:[]},50)}<div class="lname"><b>${esc(f.pseudo)}</b><span class="lstate muted">${f.share?"Pas en soirée":"Ne partage pas son taux"}</span></div></div><button class="link danger" data-unf="${f.id}" data-name="${esc(f.pseudo)}">Retirer</button></div>`;
  const p={id:f.id,color,cap:f.cap,sim:{cur:L.cur,prev:L.prev,peak:L.peak,pts:L.pts},drinks:L.drinks};
  const [lab,col]=stateOf(L.cur,+f.cap||0.8), tr=trendOf(p,now);
  return `<div class="lcard"><div class="lhead">${avx(p,58,L.sam?"Sam ce soir":lab,"f"+f.id)}<div class="lname"><b>${esc(f.pseudo)}</b><span class="lstate" style="color:${col}">${L.sam?"Sam ce soir":lab}</span></div></div>
    <div class="lrow"><span class="lnum" style="color:${col}">${fmt(L.cur)}<small>g/L</small></span><span class="ltr ${tr.k}${trendPrev["f"+f.id]&&trendPrev["f"+f.id]!==tr.k?" chg":""}" data-tk="f${f.id}|${tr.k}">${tr.k==="up"?"▲":tr.k==="down"?"▼":"■"} ${tr.txt}</span></div>
    ${spark(p,now,color)}
    <div class="ltitle ${L.last?L.last.kind:""}">${L.last?`${esc(L.last.title)} <span class="muted">· ${hm(L.last.t)}</span>`:`<span class="muted">Pas encore de titre</span>`}</div></div>`;
}
function viewFriends(){
  const F=S.friends, back=`<button class="btn ghost small" id="back">Retour</button>`;
  if(!F) return `<div class="hero"><h1>Mes amis</h1></div><section>${loader("Chargement…")}${back}</section>`;
  const now=Date.now(), on=F.friends.filter(f=>f.live).sort((a,b)=>b.live.cur-a.live.cur), off=F.friends.filter(f=>!f.live);
  const pre=ls.get("yd_ami","")||"";
  return `<div class="hero"><h1>Mes amis</h1><p class="muted">Leur taux en direct quand ils sont en soirée, leur avatar, leur tendance et leur dernier titre.</p></div>
  ${S.err?`<div class="banner">${esc(S.err)}</div>`:""}
  <section><div class="card fcode"><span class="label">Mon code ami</span><div class="row" style="justify-content:space-between"><b class="code">${esc(F.code)}</b><button class="btn small" id="shareLink">Partager mon lien</button></div>
  <label class="toggle" style="margin-top:4px"><span>Mes amis voient mon taux en direct pendant mes soirées</span><input type="checkbox" id="shareT" ${F.share?"checked":""}></label></div>
  <div class="row"><div class="field" style="flex:1;min-width:140px"><span class="label">Ajouter un ami avec son code</span><input id="fCode" maxlength="7" autocapitalize="characters" placeholder="ABC123" value="${esc(pre)}" style="text-transform:uppercase;letter-spacing:.15em"></div><button class="btn${pre?" pulse":""}" id="fAdd" style="align-self:flex-end">Ajouter</button></div></section>
  ${F.incoming.length?`<section><h2>Demandes reçues</h2>${F.incoming.map(r=>`<div class="item req"><div class="grow"><b>${esc(r.pseudo)}</b> <span class="muted">veut vous ajouter</span></div><button class="btn small" data-acc="${r.id}">Accepter</button><button class="btn ghost small" data-dec="${r.id}">Refuser</button></div>`).join("")}</section>`:""}
  <section><h2>En soirée${on.length?` (${on.length})`:""}</h2>${on.length?`<div class="live">${on.map((f,i)=>friendCard(f,i,now)).join("")}</div>`:`<p class="muted">Aucun ami en soirée pour l'instant. Leur taux apparaîtra ici dès qu'ils rejoindront une soirée.</p>`}</section>
  ${off.length?`<section><h2>Les autres</h2><div class="live">${off.map((f,i)=>friendCard(f,i+on.length,now)).join("")}</div></section>`:""}
  ${F.outgoing.length?`<section><h2>En attente</h2>${F.outgoing.map(r=>`<div class="item req"><div class="grow"><b>${esc(r.pseudo)}</b> <span class="muted">n'a pas encore accepté</span></div><button class="btn ghost small" data-dec="${r.id}">Annuler</button></div>`).join("")}</section>`:""}
  ${!F.friends.length&&!F.incoming.length&&!F.outgoing.length?`<section><p class="muted">Pas encore d'amis. Partagez votre lien ou demandez leur code à vos potes.</p></section>`:""}
  <section>${back}</section>`;
}
function rememberStates(){ document.querySelectorAll("[data-st]").forEach(e=>{const [k,at,...l]=e.dataset.st.split("|");statePrev[k]={lab:l.join("|"),at:+at}}) }
function bindFriends(){
  rememberStates();
  const on=(id,f)=>{const el=$("#"+id); if(el) el.onclick=f};
  on("shareLink",async()=>{ const txt=`Ajoute-moi sur Alamb'hic : ${inviteLink()}`;
    try{ if(navigator.share){await navigator.share({title:"Alamb'hic",text:txt});return} await navigator.clipboard.writeText(txt); snack("Lien copié","Envoie-le à tes potes") }catch(e){ snack("Mon lien ami",inviteLink()) } });
  on("fAdd",async()=>{ const c=$("#fCode").value; try{ const r=await api("POST","/api/friends",{code:c}); ls.set("yd_ami","");
      snack(r.state==="accepted"?`${r.pseudo} et vous êtes amis`:r.state==="already"?`Déjà ami avec ${r.pseudo}`:r.state==="pending"?"Demande déjà envoyée":`Demande envoyée à ${r.pseudo}`, r.state==="sent"?"Elle apparaîtra dès qu'il accepte":"");
      buzz(25); await loadFriends(); render() }catch(e){ snack("Ajout impossible",e.message,{err:1}) } });
  const sh=$("#shareT"); if(sh) sh.onchange=async()=>{ try{ await api("PUT","/api/me/share",{share:sh.checked}); S.friends.share=sh.checked; snack(sh.checked?"Partage activé":"Partage désactivé",sh.checked?"Vos amis voient votre taux pendant vos soirées":"Vos amis ne voient plus votre taux") }catch(e){ snack("Réglage non enregistré",e.message,{err:1}) } };
  document.querySelectorAll("[data-acc]").forEach(b=>b.onclick=async()=>{ b.disabled=true; try{ await api("POST",`/api/friends/${b.dataset.acc}/accept`); snack("Ami ajouté"); buzz(25); await loadFriends(); render() }catch(e){ b.disabled=false; snack("Impossible",e.message,{err:1}) } });
  document.querySelectorAll("[data-dec]").forEach(b=>b.onclick=async()=>{ b.disabled=true; try{ await api("DELETE",`/api/friends/${b.dataset.dec}`); snack("Demande retirée"); await loadFriends(); render() }catch(e){ b.disabled=false; snack("Impossible",e.message,{err:1}) } });
  document.querySelectorAll("[data-unf]").forEach(b=>b.onclick=async()=>{
    if(b.dataset.sure!=="1"){ b.dataset.sure="1"; b.textContent=`Retirer ${b.dataset.name} ?`; setTimeout(()=>{ if(b.isConnected){b.dataset.sure="";b.textContent="Retirer"} },3000); return }
    try{ await api("DELETE",`/api/friends/${b.dataset.unf}`); snack(`${b.dataset.name} retiré de vos amis`); await loadFriends(); render() }catch(e){ snack("Impossible",e.message,{err:1}) } });
  document.querySelectorAll("[data-tk]").forEach(e=>{const [id,k]=e.dataset.tk.split("|");trendPrev[id]=k});
}

function viewHome(){
  return `<div class="hero"><h1>Salut ${esc(S.user.pseudo)} !</h1><p class="muted">Créez une soirée et partagez son code, ou rejoignez celle de vos amis.</p></div>
  <section><button class="btn" id="create">Créer une soirée</button>
  <div class="row"><button class="btn ghost" id="friendsBtn2" style="flex:1">Mes amis</button><button class="btn ghost" id="demoBtn3" style="flex:1">Voir la démo</button></div>
  <div class="row"><div class="field" style="flex:1;min-width:120px"><span class="label">Rejoindre avec un code</span><input id="joinCode" maxlength="4" autocapitalize="characters" placeholder="ABCD" style="text-transform:uppercase;letter-spacing:.2em"></div><button class="btn ghost" id="join" style="align-self:flex-end">Rejoindre</button></div>
  ${S.err?`<div class="banner">${esc(S.err)}</div>`:""}</section>${S.week?weekView():""}`;
}

/* ---------- rendu ---------- */
function render(){
  const app=$("#app"), inParty=demo||(S.screen==="party"&&S.code);
  const ready=!!S.user&&profileReady(S.user);
  $("#nav").hidden=!inParty; $("#codeChip").hidden=!inParty; $("#demoHdr").hidden=demo||(ready&&!!S.code);
  $("#profBtn").hidden=demo||!ready||S.screen==="profile";
  $("#friendsBtn").hidden=demo||!ready||S.screen==="friends";
  if(S.screen!=="friends") stopFriendsPoll();
  if(!inParty||(S.screen==="profile"||S.screen==="docs"||S.screen==="friends")&&!demo){
    if(S.screen==="boot") app.innerHTML=`<section>${loader("Chargement…")}</section>`;
    else if(S.screen==="auth") app.innerHTML=viewAuth();
    else if(S.screen==="profile") app.innerHTML=viewProfile();
    else if(S.screen==="docs") app.innerHTML=viewDocs();
    else if(S.screen==="friends") app.innerHTML=viewFriends();
    else app.innerHTML=viewHome();
    bindOut(); if(S.screen==="auth") mountGoogle(); return;
  }
  $("#codeChip").textContent=demo?"Démo":S.code;
  const {now,list,log}=compute();
  notify(list,log);
  const meP=list.find(p=>p.id===S.me);
  my=meP?{pseudo:meP.pseudo,cap:meP.cap,sam:meP.sam,mealsOk:meP.mealsOk,drinks:meP.drinks}:{pseudo:S.user?.pseudo,cap:S.user?.cap||0.8,drinks:[]};
  document.querySelectorAll("nav button").forEach(b=>b.setAttribute("aria-current",b.dataset.tab===S.tab));
  if(S.tab==="fil") feedUnread=0;
  $("#feedN").hidden=!feedUnread; $("#feedN").textContent=feedUnread;
  let h=S.err?`<div class="banner" style="margin-top:14px">${esc(S.err)}</div>`:"";
  if(!demo&&!S.snap) h+=`<section>${loader("Chargement de la soirée…")}</section>`;
  else{
    if(S.tab==="moi") h+= meP?viewMe(meP,now):"";
    if(S.tab==="courbes") h+=viewChart(list,now);
    if(S.tab==="classement") h+=viewRank(list,now);
    if(S.tab==="fil") h+=viewFeed(list,log);
    if(S.tab==="moi"&&!demo) h+=`<section><div class="card"><span class="label">Code de la soirée</span><div class="row" style="justify-content:space-between;margin-top:6px"><b style="font-family:var(--display);font-size:30px;letter-spacing:.15em">${esc(S.code)}</b><button class="btn ghost small" id="copyCode">Copier l'invitation</button></div><p class="muted" style="font-size:13px;margin:8px 0 0">Vos amis ouvrent Alamb'hic et entrent ce code.</p></div></section>`;
  }
  h+=`<p class="note">Taux estimé par la formule de Widmark (eau corporelle de Watson). L'écart avec un éthylotest peut dépasser 0,2 g/L. Ce n'est jamais une autorisation de conduire : après avoir bu, on ne prend pas le volant.</p>`;
  app.innerHTML=h; bindMain();
}
function viewFeed(list,log){
  const all=list.flatMap(p=>p.ev).concat(log||[]).sort((a,b)=>b.t-a.t);
  return `<section><h2>Fil de la soirée</h2>${all.length?all.map(e=>`<div class="ev ${e.kind}"><span class="t">${hm(e.t)}</span><div><b>${esc(e.title)}</b><span class="muted" style="font-size:13px">${esc(e.text)}</span></div></div>`).join(""):`<p class="muted">Les titres et alertes de chacun s'affichent ici et en notification sur tous les téléphones de la soirée.</p>`}</section>`;
}

/* ---------- actions ---------- */
async function run(fn){ S.err=""; try{ await fn() }catch(e){ if(e.status===401){S.user=null;S.screen="auth"} S.err=e.message; render() } }
function readProfile(){const v=id=>$("#"+id).value.trim();return{pseudo:v("pseudo"),sex:v("sex"),age:+v("age"),height:+v("height"),weight:+v("weight"),cap:+v("cap")}}
async function loadWeek(){ try{ S.week=await api("GET","/api/me/week") }catch(e){} }
function bindOut(){
  const on=(id,f)=>{const el=$("#"+id); if(el) el.onclick=f};
  on("mLogin",()=>{S.authMode="login";S.err="";render()}); on("mReg",()=>{S.authMode="register";S.err="";render()});
  const f=$("#authForm"); if(f){ f.oninput=()=>{S.fEmail=$("#email").value;S.fConsent=!!$("#consent")?.checked}; f.onchange=f.oninput }
  if(f) f.onsubmit=e=>{e.preventDefault(); S.fEmail=$("#email").value; S.fConsent=!!$("#consent")?.checked; const pw=$("#pass").value;
    if(S.authMode==="register"&&!S.fConsent){ flash("Case à cocher","Cochez la case d'acceptation pour créer votre compte."); $("#consent").focus(); return }
    run(async()=>{
    await api("POST",S.authMode==="register"?"/api/auth/register":"/api/auth/login",{email:S.fEmail,password:pw}); await afterLogin() })};
  on("demoBtn",startDemo);
  on("saveProf",()=>run(async()=>{ const r=await api("PUT","/api/me",readProfile()); S.user=r.user; await loadWeek(); S.screen=S.code?"party":"home"; render(); if(S.code) refresh() }));
  on("back",()=>{S.err="";S.screen=S.code?"party":"home";render()});
  on("openDocs",openDocs); on("friendsBtn2",openFriends); on("demoBtn2",startDemo); on("demoBtn3",startDemo); bindFriends();
  on("logout",()=>run(async()=>{ await api("POST","/api/auth/logout"); closeWs(); Object.assign(S,{user:null,code:null,snap:null,screen:"auth"}); render() }));
  on("leave",()=>run(async()=>{ await api("POST",`/api/parties/${S.code}/leave`); closeWs(); S.code=null; S.snap=null; S.screen="home"; render() }));
  on("delAcc",()=>{$("#delConfirm").hidden=false}); on("delNo",()=>{$("#delConfirm").hidden=true});
  on("delYes",()=>run(async()=>{ await api("DELETE","/api/me"); closeWs(); Object.assign(S,{user:null,code:null,snap:null,screen:"auth"}); render(); flash("Compte supprimé","Toutes vos données ont été effacées.") }));
  on("create",()=>run(async()=>{ const r=await api("POST","/api/parties"); enterParty(r.code) }));
  on("join",()=>run(async()=>{ const c=$("#joinCode").value.trim().toUpperCase(); if(!/^[A-Z]{4}$/.test(c)) throw new Error("Le code de soirée fait 4 lettres."); const r=await api("POST",`/api/parties/${c}/join`); enterParty(r.code) }));
}
/* Ajout d'un verre : état « envoi » immédiat, coche verte quand c'est enregistré, puis bandeau avec Annuler. */
const pend={};
function setPend(k,v,ms){ if(v) pend[k]=v; else delete pend[k]; render(); if(ms) setTimeout(()=>{ if(pend[k]===v){ delete pend[k]; render() } },ms) }
async function addDrink(d,key,rect){
  key=key??d.l; if(pend[key]==="sending") return;
  const a=ago, when=NOW()-a*MIN;
  if(demo){ const p=demoPlayers[S.me]; p.drinks=[...p.drinks,{id:when,t:when,l:d.l,ml:d.ml,abv:d.abv,...(d.water?{water:1}:{})}]; ago=0;
    buzz(25); setPend(key,"ok",1300); if(!d.water) flyDrop(rect); snack("Verre enregistré",`${d.l} · ${hm(when)}`,{undo:()=>{p.drinks=p.drinks.filter(x=>x.id!==when);render();snack("Verre retiré")}}); return }
  setPend(key,"sending");
  try{
    const r=await api("POST",`/api/parties/${S.code}/drinks`,{label:d.l,ml:d.ml,abv:d.abv,agoMin:a});
    ago=0; buzz(25); setPend(key,"ok",1300); if(!d.water) flyDrop(rect);
    snack("Verre enregistré",`${d.l} · ${hm(r.t||when)}`,{undo:async()=>{ try{ await api("DELETE",`/api/parties/${S.code}/drinks/${r.id}?undo=1`); snack("Verre retiré"); refresh() }catch(e){ snack("Impossible d'annuler",e.message,{err:1}) } }});
    refresh();
  }catch(e){ setPend(key,null); snack("Verre non enregistré",e.message,{err:1}); buzz([40,60,40]) }
}
function bindMain(){
  document.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>addDrink(PRESETS[+b.dataset.p],"p"+b.dataset.p,b.getBoundingClientRect()));
  document.querySelectorAll("#ago button").forEach(b=>b.onclick=()=>{ago=+b.dataset.v;render()});
  bindMeals(); animateGauge(); rememberStates();
  document.querySelectorAll("[data-tk]").forEach(e=>{const [id,k]=e.dataset.tk.split("|");trendPrev[id]=k});
  document.querySelectorAll("[data-rm]").forEach(b=>b.onclick=()=>{S.rankMode=b.dataset.rm;render()});
  const ca=$("#cadd"); if(ca) ca.onclick=()=>{const ml=parseFloat($("#cml").value.replace(",","."))*10, abv=parseFloat($("#cabv").value.replace(",","."));if(!(ml>0&&ml<=1000&&abv>=0&&abv<=80)){flash("Verre incomplet","Indiquez un volume en cl et un degré entre 0 et 80 %.");return}addDrink({l:abv?"Verre perso":"Sans alcool",ml,abv,water:abv?0:1},"perso")};
  document.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{ const id=+b.dataset.del;
    if(demo){const p=demoPlayers[S.me];p.drinks=p.drinks.filter(d=>d.id!==id);render();snack("Verre supprimé");return}
    b.disabled=true; b.closest(".item")?.classList.add("leaving");
    api("DELETE",`/api/parties/${S.code}/drinks/${id}`).then(()=>{ snack("Verre supprimé","visible dans le fil de la soirée"); refresh() })
      .catch(e=>{ b.disabled=false; b.closest(".item")?.classList.remove("leaving"); snack("Suppression impossible",e.message,{err:1}) }) });
  const sm=$("#samT"); if(sm) sm.onchange=()=>run(async()=>{ await api("PUT",`/api/parties/${S.code}/me`,{sam:sm.checked}); await refresh() });
  const cc=$("#copyCode"); if(cc) cc.onclick=async()=>{ const txt=`Rejoins ma soirée Alamb'hic avec le code ${S.code} : ${location.origin}`;
    try{ if(navigator.share){await navigator.share({title:"Alamb'hic",text:txt});return} await navigator.clipboard.writeText(txt); flash("Invitation copiée","Collez-la dans votre groupe.") }catch(e){ flash("Code de la soirée",txt) } };
}

/* ---------- soirée en direct ---------- */
async function refresh(){ if(!S.code||demo) return; try{ S.snap=await api("GET",`/api/parties/${S.code}`); render() }catch(e){ if(e.status===403){S.code=null;S.snap=null;S.screen="home";closeWs()} S.err=e.message; render() } }
function enterParty(code){
  S.code=code; S.snap=null; S.screen="party"; S.tab="moi"; feedUnread=0;
  seen=new Set(ls.get("yd_seen_"+code,[])); bootT=Date.now();
  render(); loadMeals().then(refresh); openWs();
}
function closeWs(){ if(S.ws){ S.ws.onclose=null; S.ws.close(); S.ws=null } }
function openWs(){
  closeWs(); if(!S.code) return;
  const ws=new WebSocket(`${location.protocol==="https:"?"wss":"ws"}://${location.host}/ws?code=${S.code}`);
  S.ws=ws;
  ws.onopen=()=>{S.wsTry=0};
  ws.onmessage=e=>{ try{ const m=JSON.parse(e.data); if(m.type==="party"&&!demo){ S.snap=m.data; if(document.activeElement&&/INPUT|SELECT/.test(document.activeElement.tagName)) return; render() } }catch(_){} };
  ws.onclose=()=>{ S.ws=null; if(!S.code) return; const d=Math.min(30000,1000*2**S.wsTry++); setTimeout(()=>{ if(S.code&&!S.ws){ refresh(); openWs() } },d) };
}
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible"&&S.code&&!demo){ refresh(); if(!S.ws) openWs() } });

/* ---------- Google ---------- */
function mountGoogle(){
  const el=$("#gbtn"); if(!el||!S.cfg.googleClientId) return;
  const go=()=>{ try{ google.accounts.id.initialize({client_id:S.cfg.googleClientId,callback:r=>run(async()=>{await api("POST","/api/auth/google",{credential:r.credential});await afterLogin()})});
    google.accounts.id.renderButton(el,{theme:"filled_black",size:"large",text:"continue_with",locale:"fr",shape:"pill"}) }catch(e){} };
  if(window.google?.accounts) return go();
  if(!document.getElementById("gsi")){ const s=document.createElement("script"); s.id="gsi"; s.src="https://accounts.google.com/gsi/client"; s.async=true; s.onload=go; document.head.appendChild(s) }
}

/* ---------- démarrage ---------- */
async function afterLogin(){
  const r=await api("GET","/api/me"); S.user=r.user; S.me=r.user.id; S.err="";
  if(!profileReady(S.user)){ S.screen="profile"; render(); return }
  loadWeek().then(()=>{ if(S.screen==="home") render() });
  const c=await api("GET","/api/parties/current");
  if(c.code) enterParty(c.code); else { S.screen="home"; render() }
  if(ls.get("yd_ami","")){ openFriends(); snack("Invitation d'un ami","Touchez « Ajouter » pour l'ajouter") }
}

/* ---------- démo ---------- */

const DEMO=self.DEMO_DATA;
let demoSaved=null;
function startDemo(){
  demoSaved={me:S.me,tab:S.tab}; demo=true;
  const d=new Date(); d.setHours(19,0,0,0); demoStart=d.getTime(); demoT=demoStart; demoSeen=new Set();
  demoPlayers={}; DEMO.forEach(x=>{demoPlayers[x.id]={id:x.id,pseudo:x.pseudo,sex:x.sex,age:x.age,height:x.height,weight:x.weight,cap:x.cap,sam:!!x.sam,mealsOk:true,joined:demoStart,meals:(x.meals||[]).map(([m,k])=>({t:demoStart+m*MIN,kind:k})),
    drinks:x.d.map(([m,i])=>{const P=PRESETS[i];const t=demoStart+m*MIN;return{id:t,t,l:P.l,ml:P.ml,abv:P.abv,...(P.water?{water:1}:{})}})}});
  S.me="demo-lea"; S.tab="moi"; feedUnread=0;
  $("#demoRange").value=0; $("#demoBar").hidden=false; document.body.classList.add("isdemo"); setDemo(0);
}
function clearToasts(){ TQ.length=0; clearTimeout(tTimer); tShown=null; $("#toasts").innerHTML="" }
function setDemo(min){ if(!demoTimer) clearToasts(); demoT=demoStart+min*MIN; $("#demoClock").textContent=hm(demoT); render() }
function stopPlay(){ if(demoTimer){clearInterval(demoTimer);demoTimer=null} $("#demoPlay").textContent="Lecture" }
$("#demoHdr").onclick=()=>{ if(!demo) startDemo() };
$("#demoRange").oninput=e=>{stopPlay();setDemo(+e.target.value)};
$("#demoPlay").onclick=()=>{ if(demoTimer){stopPlay();return}
  const r=$("#demoRange"); if(+r.value>=+r.max) r.value=0;
  $("#demoPlay").textContent="Pause";
  demoTimer=setInterval(()=>{ const v=Math.min(+r.max,+r.value+5); r.value=v; setDemo(v); if(v>=+r.max) stopPlay() },450) };
$("#demoQuit").onclick=()=>{ stopPlay(); demo=false; $("#demoBar").hidden=true; document.body.classList.remove("isdemo");
  S.me=demoSaved.me; S.tab=demoSaved.tab; feedUnread=0; clearToasts(); hideSnack(); render() };

document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{S.tab=b.dataset.tab;render();window.scrollTo(0,0)});
function openDocs(){S.err="";S.screen="docs";render();api("GET","/api/docs").then(d=>{S.docs=d;render()}).catch(e=>{S.err=e.message;S.screen=S.code?"party":"home";render()})}
$("#friendsBtn").onclick=openFriends;
$("#profBtn").onclick=()=>{S.err="";S.screen="profile";loadWeek().then(render);render()};
setInterval(()=>{ if(document.activeElement&&/INPUT|SELECT/.test(document.activeElement.tagName)) return; if(S.screen==="party"||demo) render() },30000);
if("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(()=>{});

try{ const a=new URLSearchParams(location.search).get("ami"); if(a){ ls.set("yd_ami",a.toUpperCase().slice(0,6)); history.replaceState(null,"","/") } }catch(e){}
(async function init(){
  render();
  try{ S.cfg=await api("GET","/api/config") }catch(e){}
  try{ await afterLogin() }catch(e){ S.screen="auth"; S.err=e.status===401?"":e.message; render() }
})();
