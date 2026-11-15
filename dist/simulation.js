(function(root){
 'use strict';
 const stations=['Receiving','Inspection','Testing','Disposition','Inventory','Shipping'];
 const defaults={volume:40,staff:2,testCapacity:2,testTime:25,exceptionRate:20,holdTime:120};
 function random(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
 function run(settings={},seed=42){
  const p={...defaults,...settings};
  for(const k of Object.keys(defaults))if(!Number.isFinite(p[k]))throw Error('Invalid '+k);
  if(p.volume<1||p.volume>200||p.staff<1||p.testCapacity<1||!Number.isInteger(p.staff)||!Number.isInteger(p.testCapacity)||p.testTime<=0||p.holdTime<0||p.exceptionRate<0||p.exceptionRate>100)throw Error('Parameters out of range');
  const rng=random(seed),horizon=480,units=Math.round(p.volume),resources=[p.staff,p.staff,p.testCapacity,p.staff,p.staff,p.staff];
  const available=resources.map(n=>Array(n).fill(0)),busy=resources.map(()=>0),visits=[],items=[];
  // Pre-sample by item so baseline and scenario use paired random inputs.
  for(let i=0;i<units;i++)items.push({id:'SIM-'+String(i+1).padStart(3,'0'),arrival:(i+rng())*horizon/units,hold:rng()*100<p.exceptionRate,jitter:stations.map(()=>0.8+rng()*0.4),next:0,ready:0,trace:[]});
  const events=items.map(item=>({item,time:item.arrival+(item.hold?p.holdTime:0),stage:0}));
  while(events.length){events.sort((a,b)=>a.time-b.time||a.item.id.localeCompare(b.item.id));const e=events.shift(),s=e.stage,r=e.item;
   const pool=available[s],slot=pool.indexOf(Math.min(...pool)),start=Math.max(e.time,pool[slot]);
   const duration=[9,15,p.testTime,8,10,7][s]*r.jitter[s],end=start+duration;pool[slot]=end;
   busy[s]+=Math.max(0,Math.min(horizon,end)-Math.min(horizon,start));
   const v={id:r.id,stage:s,ready:e.time,start,end,wait:start-e.time};r.trace.push(v);visits.push(v);
   if(s<stations.length-1)events.push({item:r,time:end,stage:s+1});else r.finished=end;
  }
  const done=items.filter(r=>r.finished<=horizon),mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
  const detail=stations.map((name,s)=>({name,queue:visits.filter(v=>v.stage===s&&v.ready<=horizon&&v.start>horizon).length,processing:visits.filter(v=>v.stage===s&&v.start<=horizon&&v.end>horizon).length,wait:mean(visits.filter(v=>v.stage===s).map(v=>v.wait)),utilization:busy[s]/(resources[s]*horizon)}));
  return {settings:p,horizon,items,detail,completed:done.length,wip:units-done.length,held:items.filter(r=>r.arrival<=horizon&&r.arrival+(r.hold?p.holdTime:0)>horizon).length,turnaround:mean(done.map(r=>r.finished-r.arrival)),eventualTurnaround:mean(items.map(r=>r.finished-r.arrival)),bottleneck:detail.reduce((a,b)=>a.wait>b.wait?a:b).name};
 }
 function compare(settings){const baseline=[],scenario=[];for(let i=0;i<20;i++){baseline.push(run(defaults,100+i));scenario.push(run(settings,100+i));}
  const summary=rs=>{const avg=k=>rs.reduce((a,r)=>a+r[k],0)/rs.length;return {completed:avg('completed'),wip:avg('wip'),turnaround:avg('turnaround'),eventualTurnaround:avg('eventualTurnaround'),minCompleted:Math.min(...rs.map(r=>r.completed)),maxCompleted:Math.max(...rs.map(r=>r.completed))};};
  return {baseline:summary(baseline),scenario:summary(scenario),example:run(settings,100),baseExample:run(defaults,100)};
 }
 const api={stations,defaults,run,compare};if(typeof module!=='undefined')module.exports=api;else root.TwinSimulation=api;
})(typeof window!=='undefined'?window:globalThis);
