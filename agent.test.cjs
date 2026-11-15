const test=require('node:test');
const assert=require('node:assert/strict');
const handler=require('./api/agent.js');
function response(){return {code:200,headers:{},setHeader(k,v){this.headers[k]=v},status(n){this.code=n;return this},json(data){this.body=data;return this}}}
const request=(body,method='POST')=>({method,headers:{host:'localhost','x-forwarded-for':'test-client'},body});

test('fixed sample tools preserve holds and distinguish completed records',()=>{
 const sources=new Set();
 const held=handler.runTool('get_allowed_next_actions',{return_id:'RV-1048'},sources);
 assert.equal(held.blocked_by_exceptions,true);assert.equal(held.can_advance,false);assert.match(held.next_action,/authorization/);
 const done=handler.runTool('get_allowed_next_actions',{return_id:'RV-1040'},sources);
 assert.equal(done.can_advance,false);assert.match(done.next_action,/Completed/);
 const missing=handler.runTool('get_return',{return_id:'RV-9999'},sources);
 assert.match(missing.error,/fixed sample/);
 const rows=handler.runTool('list_returns',{filter:'blocked'},sources);assert.equal(rows.length,4);
});
test('unconfigured endpoint reports setup without a key or model call',async()=>{
 delete process.env.OPENAI_API_KEY;
 let r=response();await handler(request(null,'GET'),r);assert.equal(r.body.configured,false);
 r=response();await handler(request({question:'Why blocked?'}),r);assert.equal(r.code,503);assert.match(r.body.error,/OPENAI_API_KEY/);
});
test('rejects invalid origin and oversized questions before calling OpenAI',async()=>{
 process.env.OPENAI_API_KEY='test-key-not-a-secret';
 let r=response();const req=request({question:'Hello'});req.headers.origin='https://unrelated.example';await handler(req,r);assert.equal(r.code,403);
 r=response();await handler(request({question:'x'.repeat(1201)}),r);assert.equal(r.code,400);
});
test('executes a read-only function round and returns cited answer',async()=>{
 const originalFetch=global.fetch;let calls=0;
 global.fetch=async(url,options)=>{calls++;const body=JSON.parse(options.body);assert.equal(url,'https://api.openai.com/v1/responses');assert.equal(body.store,false);assert.ok(body.tools.every(t=>!t.name.includes('update')));
 if(calls===1){assert.equal(body.tool_choice,'required');return {ok:true,json:async()=>({output:[{type:'function_call',name:'get_allowed_next_actions',arguments:'{"return_id":"RV-1048"}',call_id:'test-call'}]})};}
 assert.ok(body.input.some(i=>i.type==='function_call_output'&&i.output.includes('authorization')));
 return {ok:true,json:async()=>({output:[{type:'message',content:[{type:'output_text',text:'RV-1048 is blocked by missing RMA authorization. Maya Chen must verify it and record a resolution note.'}]}]})};};
 try{let r=response();await handler(request({question:'Why is RV-1048 blocked?',returnId:'RV-1048'}),r);assert.equal(r.code,200);assert.equal(calls,2);assert.deepEqual(r.body.sources,['RV-1048']);assert.equal(r.body.readOnly,true);assert.match(r.body.answer,/authorization/);}finally{global.fetch=originalFetch;}
});
test('upstream errors return a safe message without credentials',async()=>{
 const originalFetch=global.fetch;global.fetch=async()=>({ok:false,status:401});
 try{const r=response();await handler(request({question:'Explain workflow'}),r);assert.equal(r.code,502);assert.ok(!JSON.stringify(r.body).includes(process.env.OPENAI_API_KEY));}finally{global.fetch=originalFetch;delete process.env.OPENAI_API_KEY;}
});
