/* Alamb'hic — moteur de calcul partagé (navigateur + serveur).
   Estimation du taux par la formule de Widmark avec l'eau corporelle de Watson.
   Ce n'est qu'une estimation : jamais une autorisation de conduire. */
(function (root) {
"use strict";
const PRESETS=[
 {l:"Bière",d:"25 cl · 5 %",ml:250,abv:5},{l:"Pinte",d:"50 cl · 5 %",ml:500,abv:5},
 {l:"Vin",d:"12 cl · 12 %",ml:120,abv:12},{l:"Champagne",d:"12 cl · 12 %",ml:120,abv:12},
 {l:"Shot",d:"4 cl · 40 %",ml:40,abv:40},{l:"Cocktail",d:"20 cl · 10 %",ml:200,abv:10},
 {l:"Cidre",d:"25 cl · 5 %",ml:250,abv:5},{l:"Eau",d:"25 cl",ml:250,abv:0,water:1}];
const GAGES=["boire deux grands verres d'eau d'affilée","faire un compliment sincère à chaque joueur","imiter un animal choisi par le groupe pendant une minute","parler avec un accent pendant 5 minutes","servir de l'eau à toute la tablée","raconter sa pire honte de soirée","chanter un refrain choisi par le groupe","mimer un film que les autres doivent deviner"];
const ABS_FED=75, ABS_FAST=30, ELIM=0.15, MIN=60000;
/* Repas : un repas ralentit l'absorption (abs, en min) et réduit la part d'alcool qui passe dans le sang (f),
   pour les verres bus de 30 min avant le repas jusqu'à `dur` min après. */
const MEALS={
  snack:{l:"Grignotage",d:"apéritif, encas",abs:45,dur:90,f:0.95},
  light:{l:"Repas léger",d:"salade, sandwich",abs:60,dur:150,f:0.9},
  full:{l:"Repas complet",d:"plat, féculents",abs:75,dur:240,f:0.85},
  big:{l:"Repas copieux",d:"repas de fête",abs:90,dur:300,f:0.8}};
const MEAL_ORDER=["snack","light","full","big"];
function mealFor(meals,t){
  let best=null;
  for(const m of meals||[]){const M=MEALS[m.kind]; if(!M) continue;
    if(t>=m.t-30*MIN&&t<=m.t+M.dur*MIN&&(!best||M.abs>MEALS[best.kind].abs)) best=m;}
  return best;
}
function absorption(p,d){
  const m=mealFor(p.meals,d.t);
  if(m) return MEALS[m.kind];
  if(d.fed&&!(p.meals&&p.meals.length)) return MEALS.full;   // anciennes saisies « j'ai mangé »
  return {abs:ABS_FAST,f:1};
}
function tbw(p){return p.sex==="F" ? -2.097+0.1069*p.height+0.2466*p.weight : 2.447-0.09516*p.age+0.1074*p.height+0.3362*p.weight}
function simulate(p,now){
  const dr=(p.drinks||[]).filter(d=>d.abv>0).sort((a,b)=>a.t-b.t);
  const out={pts:[],cur:0,prev:0,peak:0,peakT:null,zeroT:null,grams:0};
  if(!dr.length) return out;
  const k=0.8/Math.max(15,tbw(p));
  out.grams=dr.reduce((s,d)=>s+d.ml*d.abv/100*0.789,0);
  const ab=dr.map(d=>absorption(p,d));
  const lastAbs=Math.max(...dr.map((d,i)=>d.t+ab[i].abs*MIN));
  let t=Math.floor(dr[0].t/MIN)*MIN, bac=0; out.pts.push([t,0]);
  const end=Math.max(now,lastAbs)+30*3600e3;
  while(t<end){
    const t0=t; t+=MIN; let g=0;
    dr.forEach((d,i)=>{const dur=ab[i].abs*MIN, a=Math.max(t0,d.t), b=Math.min(t,d.t+dur); if(b>a) g+=d.ml*d.abv/100*0.789*ab[i].f*(b-a)/dur;});
    bac=Math.max(0,bac+g*k-ELIM/60);
    out.pts.push([t,bac]);
    if(t<=now-10*MIN) out.prev=bac;
    if(t<=now){out.cur=bac; if(bac>out.peak){out.peak=bac;out.peakT=t}}
    if(t>=now&&t>lastAbs&&bac<=0){out.zeroT=t;break}
  }
  return out;
}
function hash(s){let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))|0;return Math.abs(h)}
const gage=(p,id)=>GAGES[hash(p.id+id+(p.joined||0))%GAGES.length];
function events(p,sim,now){
  const ev=[], n=p.pseudo||"Quelqu'un", cap=+p.cap||0.8;
  const add=(id,kind,t,title,text)=>ev.push({key:p.id+":"+id,pid:p.id,kind,t,title,text});
  if(p.sam) add("sam","trophy",p.joined||now,"Sam de la soirée",`${n} reste à zéro et veille sur tout le monde.`);
  const TH=[
   [0.2,"bulles","trophy","Premières bulles",`${n} décolle doucement.`],
   [0.4,"joues","trophy","Joues roses",`${n} commence à rosir.`],
   [0.5,"volant","info","Clés confisquées",`${n} passe 0,5 g/L : plus de volant ce soir.`],
   [0.8,"philo","trophy","Philosophe de comptoir",`${n} refait le monde à 0,8 g/L. Dernier titre à gagner en montant.`],
   [1.2,"naufrage","shame","Le Naufragé",`${n} dépasse 1,2 g/L. Gage : ${gage(p,"n")}. Passage à l'eau.`],
   [1.5,"alerte","care","Alerte copains",`${n} est estimé à 1,5 g/L. Apportez-lui de l'eau et gardez un œil sur lui.`],
   [2.0,"rouge","care","Alerte rouge",`${n} dépasse 2 g/L estimé. Restez avec lui. S'il vomit, ne répond plus ou respire mal : appelez le 15.`]];
  const done={}; let pk=0; const pts=sim.pts;
  for(let i=0;i<pts.length&&pts[i][0]<=now;i++){
    const [t,b]=pts[i];
    for(const th of TH) if(!done[th[1]]&&b>=th[0]){done[th[1]]=1;add(th[1],th[2],t,th[3],th[4])}
    if(!done.cap&&cap<1.2&&b>=cap){done.cap=1;add("cap","shame",t,"Hors plafond",`${n} dépasse son plafond de ${fmt(cap)} g/L. Gage : ${gage(p,"c")}. Eau jusqu'à nouvel ordre.`)}
    if(!done.fusee&&i>=60&&b-pts[i-60][1]>=0.5){done.fusee=1;add("fusee","shame",t,"La Fusée",`${n} a pris +0,5 g/L en une heure. Gage : ${gage(p,"f")}.`)}
    pk=Math.max(pk,b);
    if(!done.land&&pk>=0.4&&b<0.2){done.land=1;add("land","trophy",t,"Atterrissage en douceur",`${n} redescend sous 0,2 g/L.`)}
    if(!done.earth&&pk>=0.2&&b<=0){done.earth=1;add("earth","trophy",t,"Retour sur Terre",`${n} est revenu à zéro.`)}
  }
  const w=(p.drinks||[]).filter(d=>d.water).sort((a,b)=>a.t-b.t);
  if(w.length>=3) add("chameau","trophy",w[2].t,"Le Chameau",`${n} a bu 3 verres d'eau.`);
  if(w.length>=6) add("oasis","trophy",w[5].t,"L'Oasis",`${n} en est à 6 verres d'eau.`);
  return ev;
}
const scoreOf=ev=>ev.reduce((s,e)=>s+(e.kind==="trophy"?10:e.kind==="shame"?-15:0),0);
const fmt=b=>(Math.max(0,b)).toFixed(2).replace(".",",");
function scoreSummary(p,now){ const sim=simulate(p,now); const ev=events(p,sim,now); return {sim,ev,score:scoreOf(ev)}; }
const api={PRESETS,GAGES,ABS_FED,ABS_FAST,ELIM,MIN,MEALS,MEAL_ORDER,mealFor,tbw,simulate,events,scoreOf,hash,fmt,scoreSummary};
if(typeof module!=="undefined"&&module.exports) module.exports=api; else root.YD=api;
})(typeof self!=="undefined"?self:this);
