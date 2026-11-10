/* Youdrink — interface. Le serveur calcule les taux et les titres ; le mode démo calcule localement. */
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
  const ticks=[0.5,cap,1.2].filter((v,i,a)=>a.indexOf(v)===i&&v<maxB).map(v=>`<span style="left:${v/maxB*100}%">${fmt(v)}</span>`).join("");
  const std=(s.grams/10).toFixed(1).replace(".",",");
  const sub=s.peakT?`Pic ${fmt(s.peak)} à ${hm(s.peakT)} · ${std} verres standard`+(s.cur>0&&s.zeroT?` · retour à 0 vers ${hm(s.zeroT)}`:""):"Aucun verre d'alcool pour l'instant";
  const mine=(my.drinks||[]).slice().sort((a,b)=>b.t-a.t);
  const titles=p.ev.filter(e=>e.kind!=="info");
  const needMeals=!demo&&!p.mealsOk&&!(my.drinks||[]).some(d=>d.abv>0)&&!my.sam;
  return `${needMeals?viewMealsFirst():mealQuestion()}<section>
  <div class="card" style="display:flex;flex-direction:column;gap:12px">
    <div class="row" style="justify-content:space-between"><span class="label">${esc(my.pseudo)} · taux estimé</span><span class="state" style="color:${col}">${lab}</span></div>
    <div class="row" style="gap:16px;flex-wrap:nowrap">${avatar(p,96)}<div class="bac">${fmt(s.cur)}<small>g/L</small></div></div>
    <div><div class="bar"><i style="width:${Math.min(100,s.cur/maxB*100)}%;background:${col}"></i></div><div class="ticks">${ticks}</div></div>
    <div class="muted" style="font-size:13px">${sub}. Plafond perso : ${fmt(cap)} g/L.</div>
  </div></section>
  <section><h2>${my.sam?"Sam boit de l'eau":"Ajouter un verre"}</h2>
  <div class="field"><span class="label">Bu</span><div class="seg" id="ago">${[[0,"Maintenant"],[15,"il y a 15 min"],[30,"30 min"],[60,"1 h"]].map(([v,l])=>`<button data-v="${v}" aria-pressed="${ago===v}">${l}</button>`).join("")}</div></div>
  ${demo?"":`<label class="toggle"><span>Je suis Sam ce soir (zéro alcool)</span><input type="checkbox" id="samT" ${my.sam?"checked":""}></label>`}
  ${needMeals?`<div class="banner">Indiquez d'abord vos repas du jour, juste au-dessus : ils changent beaucoup le calcul. L'eau reste disponible.</div>`:""}
  <div class="drinks${needMeals?" locked":""}">${PRESETS.filter(d=>!my.sam||d.water).map((d,i)=>`<button class="drink${d.water?" water":""}" data-p="${PRESETS.indexOf(d)}"><b>${d.l}</b><span>${d.d}</span></button>`).join("")}</div>
  ${my.sam?"":`<div class="row"><div class="field" style="flex:1;min-width:90px"><span class="label">Volume (cl)</span><input id="cml" type="number" inputmode="decimal" min="1" max="100" placeholder="15"></div><div class="field" style="flex:1;min-width:90px"><span class="label">Degré (%)</span><input id="cabv" type="number" inputmode="decimal" min="0" max="80" placeholder="13"></div><button class="btn" id="cadd" style="align-self:flex-end">Ajouter</button></div>`}
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
function viewRank(list,now){
  const r=list.slice().sort((a,b)=>b.score-a.score||a.sim.peak-b.sim.peak);
  return `<section><h2>Classement des titres</h2><p class="muted" style="font-size:13px">Titre gagné : +10. Titre de honte (plafond, Naufragé, Fusée) : −15. Rester raisonnable rapporte plus que grimper.</p>
  ${r.map((p,i)=>{const [lab,col]=stateOf(p.sim.cur,+p.cap||0.8);const t=p.ev.filter(e=>e.kind!=="info");return `<div class="card player">${avatar(p,48)}<div><b>${i+1}. ${esc(p.pseudo)}</b>${p.id===S.me?' <span class="muted">(vous)</span>':""}${p.sam?' <span class="badge trophy" style="padding:2px 6px;font-size:11px">Sam</span>':""}</div><div class="num" style="color:${col}">${fmt(p.sim.cur)}</div>
  <div class="meta">${lab} · pic ${fmt(p.sim.peak)} · <span class="score">${p.score>0?"+":""}${p.score} pts</span>${t.length?"<br>"+t.map(e=>esc(e.title)).join(", "):""}</div></div>`}).join("")}</section>`;
}

/* ---------- repas ---------- */
const {MEALS,MEAL_ORDER}=YD;
const SLOTS=[{k:"matin",l:"Petit-déjeuner",h:"08:00",def:"light",from:6,to:10.5},{k:"midi",l:"Déjeuner",h:"12:30",def:"full",from:11.5,to:15},
  {k:"gouter",l:"Goûter",h:"16:30",def:"snack",from:15.5,to:18},{k:"soir",l:"Dîner",h:"20:00",def:"full",from:18.5,to:22.5}];
const myMeals=()=>demo?(demoPlayers[S.me]?.meals||[]):(S.meals||[]);
const atHM=hmS=>{const [h,m]=hmS.split(":").map(Number);const d=new Date(NOW());d.setHours(h,m,0,0);if(d.getTime()>NOW()+15*MIN)d.setDate(d.getDate()-1);return d.getTime()};
const hourNow=()=>{const d=new Date(NOW());return d.getHours()+d.getMinutes()/60};
function kindSelect(id,val,withNone){return `<select id="${id}">${withNone?`<option value="">Rien</option>`:""}${MEAL_ORDER.map(k=>`<option value="${k}" ${val===k?"selected":""}>${MEALS[k].l}</option>`).join("")}</select>`}
function viewMealsFirst(){
  const h=hourNow(), past=SLOTS.filter(x=>x.from<=h);
  return `<section><div class="card meals1"><span class="label" style="color:var(--accent)">Avant votre premier verre</span>
  <h2>Qu'avez-vous mangé aujourd'hui ?</h2>
  <p class="muted" style="margin:0;font-size:13px">Un repas ralentit le passage de l'alcool dans le sang et baisse le pic. Corrigez l'heure si besoin.</p>
  ${(past.length?past:SLOTS.slice(0,1)).map(x=>`<div class="mrow"><b>${x.l}</b><input type="time" id="mt-${x.k}" value="${x.h}" aria-label="Heure du ${x.l}">${kindSelect("mk-"+x.k,x.def,true)}</div>`).join("")}
  <div class="row"><button class="btn" id="mealsOk">Valider mes repas</button><button class="btn ghost" id="mealsNone">Rien mangé</button></div></div></section>`;
}
function mealSlotNow(){
  const h=hourNow(); const sl=SLOTS.find(x=>x.k!=="matin"&&h>=x.from+0.5&&h<=x.to); if(!sl) return null;
  const since=atHM(String(Math.floor(sl.from-1)).padStart(2,"0")+":00");
  if(myMeals().some(m=>m.t>=since)) return null;
  const key=`yd_mq_${new Date(NOW()).toDateString()}_${sl.k}`, until=ls.get(key,0);
  if(until===-1||until>NOW()) return null;
  return {...sl,key};
}
function mealQuestion(){
  if(demo) return ""; const sl=mealSlotNow(); if(!sl) return "";
  return `<section><div class="card mq"><span class="label" style="color:var(--care)">Il est ${hm(NOW())}</span><h2>${sl.k==="soir"?"Avez-vous dîné ?":sl.k==="midi"?"Avez-vous déjeuné ?":"Avez-vous mangé quelque chose ?"}</h2>
  <div class="row">${MEAL_ORDER.map(k=>`<button class="btn small" data-mq="${k}">Oui : ${MEALS[k].l.toLowerCase()}</button>`).join("")}</div>
  <div class="row"><button class="btn ghost small" data-mqno="45">Pas encore</button><button class="btn ghost small" data-mqno="-1">Je ne mangerai pas</button></div></div></section>`;
}
function viewMeals(){
  const ms=myMeals().slice().sort((a,b)=>b.t-a.t);
  return `<section><h2>Mes repas</h2>
  ${ms.length?`<div class="list">${ms.map(m=>`<div class="item"><span class="t">${hm(m.t)}</span><div class="grow"><b>${MEALS[m.kind]?.l||m.kind}</b> <span class="muted">${MEALS[m.kind]?.d||""}</span></div><button class="x" data-mdel="${m.id??m.t}" aria-label="Supprimer ce repas">×</button></div>`).join("")}</div>`:`<p class="muted" style="margin:0">Aucun repas noté ces dernières 24 h : l'alcool est compté à jeun.</p>`}
  <div class="mrow add"><input type="time" id="mAddT" value="${new Date(NOW()).toTimeString().slice(0,5)}" aria-label="Heure du repas">${kindSelect("mAddK","full",false)}<button class="btn small" id="mAdd">Ajouter un repas</button></div></section>`;
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
    const list=SLOTS.filter(x=>$("#mk-"+x.k)&&$("#mk-"+x.k).value).map(x=>({kind:$("#mk-"+x.k).value,t:atHM($("#mt-"+x.k).value||x.h)}));
    if(list.some(m=>m.t>NOW()+15*MIN)) throw new Error("Un repas ne peut pas être dans le futur.");
    await addMeals(list); flash("Repas enregistrés",list.length?list.map(m=>`${MEALS[m.kind].l} à ${hm(m.t)}`).join(", "):"Aucun repas : l'alcool sera compté à jeun.") });
  const none=$("#mealsNone"); if(none) none.onclick=()=>run(async()=>{ await addMeals([]); });
  document.querySelectorAll("[data-mq]").forEach(b=>b.onclick=()=>run(async()=>{ await addMeals([{kind:b.dataset.mq,t:NOW()}]); flash("Bon appétit","Repas noté : l'alcool passera plus lentement.") }));
  document.querySelectorAll("[data-mqno]").forEach(b=>b.onclick=()=>{ const sl=mealSlotNow(); if(sl) ls.set(sl.key,+b.dataset.mqno<0?-1:NOW()+45*MIN); render() });
  const ad=$("#mAdd"); if(ad) ad.onclick=()=>run(async()=>{ const t=atHM($("#mAddT").value||"12:00"); await addMeals([{kind:$("#mAddK").value,t}]); flash("Repas ajouté",`${MEALS[$("#mAddK")?.value||"full"]?.l||"Repas"} à ${hm(t)}`) });
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
  fresh.sort((a,b)=>a.t-b.t).slice(-3).forEach(e=>{toast(e); if(S.tab!=="fil") feedUnread++});
  try{ if(fresh.some(e=>e.kind==="care")) navigator.vibrate&&navigator.vibrate([200,100,200]); else if(fresh.length) navigator.vibrate&&navigator.vibrate(80) }catch(_){}
}
function toast(e){
  const d=document.createElement("div"); d.className="toast "+(e.kind||"");
  d.innerHTML=`<b>${esc(e.title)}</b><div class="muted" style="font-size:13px">${esc(e.text)}</div>`;
  d.onclick=()=>d.remove(); const box=$("#toasts"); box.appendChild(d); while(box.children.length>3) box.firstElementChild.remove(); setTimeout(()=>d.remove(),e.kind==="care"?15000:6000);
}
const flash=(title,text,kind="info")=>toast({title,text,kind});

/* ---------- écrans hors soirée ---------- */
function viewAuth(){
  const reg=S.authMode==="register";
  return `<div class="hero"><h1>On trinque, on se chambre, on se surveille.</h1>
  <p class="muted">Chacun note ses verres. Youdrink estime les taux, trace les courbes de tout le groupe et prévient les autres quand quelqu'un débloque un titre ou franchit un seuil.</p></div>
  <section>
  <div class="seg tabs2"><button id="mLogin" aria-pressed="${!reg}">Connexion</button><button id="mReg" aria-pressed="${reg}">Créer un compte</button></div>
  <form id="authForm" class="field" style="gap:10px" novalidate>
   <div class="field"><span class="label">E-mail</span><input id="email" type="email" autocomplete="email" required></div>
   <div class="field"><span class="label">Mot de passe${reg?" (8 caractères minimum)":""}</span><input id="pass" type="password" autocomplete="${reg?"new-password":"current-password"}" required></div>
   ${S.err?`<div class="banner">${esc(S.err)}</div>`:""}
   <button class="btn" type="submit">${reg?"Créer mon compte":"Me connecter"}</button>
  </form>
  ${S.cfg.googleClientId?`<div class="or">ou</div><div class="google" id="gbtn"></div>`:""}
  <div class="or">pour découvrir</div>
  <button class="btn ghost" id="demoBtn">Voir la démo : une soirée fictive en accéléré</button>
  <p class="note">Réservé aux 18 ans et plus. Les taux affichés sont des estimations, jamais une autorisation de conduire.</p>
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
  ${edit?`<section><div class="row">${S.code?`<button class="btn ghost small" id="leave">Quitter la soirée ${esc(S.code)}</button>`:""}<button class="btn ghost small" id="logout">Me déconnecter</button></div>
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
  if(!S.docs) return `<div class="hero"><h1>Documentation</h1></div><section><p class="muted">Chargement…</p>${back}</section>`;
  const cats=[...new Set(S.docs.map(d=>d.cat))];
  const fd=d=>new Date(d+"T12:00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});
  return `<div class="hero"><h1>Documentation</h1><p class="muted">Réservée aux administrateurs. Chaque document est un PDF daté, mis à jour au fil du projet.</p></div>
  ${cats.map(c=>`<section><h2>${esc(c)}</h2>${S.docs.filter(d=>d.cat===c).map(d=>`<a class="card doc" href="/docs/${encodeURI(d.file)}" target="_blank" rel="noopener"><div class="row" style="justify-content:space-between;align-items:baseline"><b>${esc(d.title)}</b><span class="muted" style="font-size:12px">${fd(d.date)}</span></div><span class="muted" style="font-size:13px">${esc(d.desc)}</span><span class="label" style="color:var(--accent)">Ouvrir le PDF</span></a>`).join("")}</section>`).join("")}
  <section>${back}</section>`;
}
function viewHome(){
  return `<div class="hero"><h1>Salut ${esc(S.user.pseudo)} !</h1><p class="muted">Créez une soirée et partagez son code, ou rejoignez celle de vos amis.</p></div>
  <section><button class="btn" id="create">Créer une soirée</button>
  <div class="row"><div class="field" style="flex:1;min-width:120px"><span class="label">Rejoindre avec un code</span><input id="joinCode" maxlength="4" autocapitalize="characters" placeholder="ABCD" style="text-transform:uppercase;letter-spacing:.2em"></div><button class="btn ghost" id="join" style="align-self:flex-end">Rejoindre</button></div>
  ${S.err?`<div class="banner">${esc(S.err)}</div>`:""}</section>${S.week?weekView():""}`;
}

/* ---------- rendu ---------- */
function render(){
  const app=$("#app"), inParty=demo||(S.screen==="party"&&S.code);
  $("#nav").hidden=!inParty; $("#codeChip").hidden=!inParty; $("#demoHdr").hidden=demo;
  $("#profBtn").hidden=demo||!S.user||!profileReady(S.user)||S.screen==="profile";
  $("#docsBtn").hidden=demo||!S.user?.admin||S.screen==="docs";
  if(!inParty||(S.screen==="profile"||S.screen==="docs")&&!demo){
    if(S.screen==="boot") app.innerHTML=`<section><p class="muted">Chargement…</p></section>`;
    else if(S.screen==="auth") app.innerHTML=viewAuth();
    else if(S.screen==="profile") app.innerHTML=viewProfile();
    else if(S.screen==="docs") app.innerHTML=viewDocs();
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
  if(!demo&&!S.snap) h+=`<section><p class="muted">Chargement de la soirée…</p></section>`;
  else{
    if(S.tab==="moi") h+= meP?viewMe(meP,now):"";
    if(S.tab==="courbes") h+=viewChart(list,now);
    if(S.tab==="classement") h+=viewRank(list,now);
    if(S.tab==="fil") h+=viewFeed(list,log);
    if(S.tab==="moi"&&!demo) h+=`<section><div class="card"><span class="label">Code de la soirée</span><div class="row" style="justify-content:space-between;margin-top:6px"><b style="font-family:var(--display);font-size:30px;letter-spacing:.15em">${esc(S.code)}</b><button class="btn ghost small" id="copyCode">Copier l'invitation</button></div><p class="muted" style="font-size:13px;margin:8px 0 0">Vos amis ouvrent Youdrink et entrent ce code.</p></div></section>`;
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
  const f=$("#authForm"); if(f) f.onsubmit=e=>{e.preventDefault(); run(async()=>{
    await api("POST",S.authMode==="register"?"/api/auth/register":"/api/auth/login",{email:$("#email").value,password:$("#pass").value}); await afterLogin() })};
  on("demoBtn",startDemo);
  on("saveProf",()=>run(async()=>{ const r=await api("PUT","/api/me",readProfile()); S.user=r.user; await loadWeek(); S.screen=S.code?"party":"home"; render(); if(S.code) refresh() }));
  on("back",()=>{S.err="";S.screen=S.code?"party":"home";render()});
  on("logout",()=>run(async()=>{ await api("POST","/api/auth/logout"); closeWs(); Object.assign(S,{user:null,code:null,snap:null,screen:"auth"}); render() }));
  on("leave",()=>run(async()=>{ await api("POST",`/api/parties/${S.code}/leave`); closeWs(); S.code=null; S.snap=null; S.screen="home"; render() }));
  on("delAcc",()=>{$("#delConfirm").hidden=false}); on("delNo",()=>{$("#delConfirm").hidden=true});
  on("delYes",()=>run(async()=>{ await api("DELETE","/api/me"); closeWs(); Object.assign(S,{user:null,code:null,snap:null,screen:"auth"}); render(); flash("Compte supprimé","Toutes vos données ont été effacées.") }));
  on("create",()=>run(async()=>{ const r=await api("POST","/api/parties"); enterParty(r.code) }));
  on("join",()=>run(async()=>{ const c=$("#joinCode").value.trim().toUpperCase(); if(!/^[A-Z]{4}$/.test(c)) throw new Error("Le code de soirée fait 4 lettres."); const r=await api("POST",`/api/parties/${c}/join`); enterParty(r.code) }));
}
function addDrink(d){
  if(demo){ const p=demoPlayers[S.me]; const t=NOW()-ago*MIN; p.drinks=[...p.drinks,{id:t,t,l:d.l,ml:d.ml,abv:d.abv,...(d.water?{water:1}:{})}]; ago=0; render(); return }
  const a=ago; ago=0;
  run(async()=>{ await api("POST",`/api/parties/${S.code}/drinks`,{label:d.l,ml:d.ml,abv:d.abv,agoMin:a}); await refresh() });
}
function bindMain(){
  document.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>addDrink(PRESETS[+b.dataset.p]));
  document.querySelectorAll("#ago button").forEach(b=>b.onclick=()=>{ago=+b.dataset.v;render()});
  bindMeals();
  const ca=$("#cadd"); if(ca) ca.onclick=()=>{const ml=parseFloat($("#cml").value.replace(",","."))*10, abv=parseFloat($("#cabv").value.replace(",","."));if(!(ml>0&&ml<=1000&&abv>=0&&abv<=80)){flash("Verre incomplet","Indiquez un volume en cl et un degré entre 0 et 80 %.");return}addDrink({l:abv?"Verre perso":"Sans alcool",ml,abv,water:abv?0:1})};
  document.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{ const id=+b.dataset.del;
    if(demo){const p=demoPlayers[S.me];p.drinks=p.drinks.filter(d=>d.id!==id);render();return}
    run(async()=>{ await api("DELETE",`/api/parties/${S.code}/drinks/${id}`); await refresh() }) });
  const sm=$("#samT"); if(sm) sm.onchange=()=>run(async()=>{ await api("PUT",`/api/parties/${S.code}/me`,{sam:sm.checked}); await refresh() });
  const cc=$("#copyCode"); if(cc) cc.onclick=async()=>{ const txt=`Rejoins ma soirée Youdrink avec le code ${S.code} : ${location.origin}`;
    try{ if(navigator.share){await navigator.share({title:"Youdrink",text:txt});return} await navigator.clipboard.writeText(txt); flash("Invitation copiée","Collez-la dans votre groupe.") }catch(e){ flash("Code de la soirée",txt) } };
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
}

/* ---------- démo ---------- */

const DEMO=[
 {id:"demo-lea",pseudo:"Léa",sex:"F",age:28,height:165,weight:58,cap:0.8,meals:[[-390,"full"],[60,"full"]],d:[[15,3],[50,7],[75,2],[110,7],[140,2],[170,7],[200,5],[240,7],[300,7]]},
 {id:"demo-max",pseudo:"Max",sex:"H",age:31,height:182,weight:85,cap:0.8,meals:[[-400,"light"],[140,"snack"]],d:[[5,1],[40,1],[60,4],[65,4],[90,1],[130,5],[150,4],[155,4],[180,1],[260,7],[320,7]]},
 {id:"demo-tom",pseudo:"Tom",sex:"H",age:25,height:178,weight:72,cap:0.8,meals:[[-380,"full"],[75,"big"]],d:[[20,1],[70,0],[100,2],[150,7],[180,2],[220,7],[260,7]]},
 {id:"demo-sam",pseudo:"Inès",sex:"F",age:30,height:170,weight:62,cap:0.5,sam:true,meals:[[60,"full"]],d:[[30,7],[120,7],[200,7],[280,7]]}];
let demoSaved=null;
function startDemo(){
  demoSaved={me:S.me,tab:S.tab}; demo=true;
  const d=new Date(); d.setHours(19,0,0,0); demoStart=d.getTime(); demoT=demoStart; demoSeen=new Set();
  demoPlayers={}; DEMO.forEach(x=>{demoPlayers[x.id]={id:x.id,pseudo:x.pseudo,sex:x.sex,age:x.age,height:x.height,weight:x.weight,cap:x.cap,sam:!!x.sam,mealsOk:true,joined:demoStart,meals:(x.meals||[]).map(([m,k])=>({t:demoStart+m*MIN,kind:k})),
    drinks:x.d.map(([m,i])=>{const P=PRESETS[i];const t=demoStart+m*MIN;return{id:t,t,l:P.l,ml:P.ml,abv:P.abv,...(P.water?{water:1}:{})}})}});
  S.me="demo-lea"; S.tab="moi"; feedUnread=0;
  $("#demoRange").value=0; $("#demoBar").hidden=false; document.body.classList.add("isdemo"); setDemo(0);
}
function setDemo(min){ demoT=demoStart+min*MIN; $("#demoClock").textContent=hm(demoT); render() }
function stopPlay(){ if(demoTimer){clearInterval(demoTimer);demoTimer=null} $("#demoPlay").textContent="Lecture" }
$("#demoHdr").onclick=()=>{ if(!demo) startDemo() };
$("#demoRange").oninput=e=>{stopPlay();setDemo(+e.target.value)};
$("#demoPlay").onclick=()=>{ if(demoTimer){stopPlay();return}
  const r=$("#demoRange"); if(+r.value>=+r.max) r.value=0;
  $("#demoPlay").textContent="Pause";
  demoTimer=setInterval(()=>{ const v=Math.min(+r.max,+r.value+5); r.value=v; setDemo(v); if(v>=+r.max) stopPlay() },450) };
$("#demoQuit").onclick=()=>{ stopPlay(); demo=false; $("#demoBar").hidden=true; document.body.classList.remove("isdemo");
  S.me=demoSaved.me; S.tab=demoSaved.tab; feedUnread=0; document.querySelectorAll("#toasts .toast").forEach(t=>t.remove()); render() };

document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{S.tab=b.dataset.tab;render();window.scrollTo(0,0)});
$("#docsBtn").onclick=()=>{S.err="";S.screen="docs";render();api("GET","/api/docs").then(d=>{S.docs=d;render()}).catch(e=>{S.err=e.message;S.screen=S.code?"party":"home";render()})};
$("#profBtn").onclick=()=>{S.err="";S.screen="profile";loadWeek().then(render);render()};
setInterval(()=>{ if(document.activeElement&&/INPUT|SELECT/.test(document.activeElement.tagName)) return; if(S.screen==="party"||demo) render() },30000);
if("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(()=>{});

(async function init(){
  render();
  try{ S.cfg=await api("GET","/api/config") }catch(e){}
  try{ await afterLogin() }catch(e){ S.screen="auth"; S.err=e.status===401?"":e.message; render() }
})();
