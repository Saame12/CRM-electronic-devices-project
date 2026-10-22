const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
function route(start,end,extras){
 let handler;const c=vm.createContext({app:{post:(_path,...handlers)=>handler=handlers.at(-1)},auth(){},wrap:fn=>fn,uid:()=> 'new-id',dateVN:()=> '22/10/2026',...extras});
 const s=source('server.mysql.js');vm.runInContext(s.slice(s.indexOf(start),s.indexOf(end,s.indexOf(start))),c);return handler;
}
const response=()=>({code:200,status(n){this.code=n;return this},json(data){this.data=data}});
test('Feedback API accepts one trimmed character and rejects empty or whitespace-only input',async()=>{
 for(const [body,expected]of [['a',201],['  ớ  ',201],['',400],[' \n\t ',400]]){
  const calls=[],db={execute:async(sql,values)=>{calls.push({sql,values});return sql.startsWith('SELECT')?[[{id:'product'}]]:[{affectedRows:1}]}};
  const handler=route("app.post('/api/feedback'","app.get('/api/surveys'",{db,products:['PC'],feedbackTypes:['Góp ý']});
  const res=response();await handler({user:{id:'customer'},body:{prod:'PC',type:'Góp ý',rate:5,body}},res);
  assert.equal(res.code,expected);const inserted=calls.find(c=>c.sql.startsWith('INSERT'));
  if(expected===201)assert.equal(inserted.values.at(-1),body.trim());else assert.equal(inserted,undefined);
 }
});
test('Survey API accepts one text character, rejects missing required text and keeps optional text optional',async()=>{
 for(const [value,required,expected]of [['x',true,201],['  ớ  ',true,201],['',true,400],[' \n ',true,400],[undefined,true,400],['',false,201],['   ',false,201]]){
  const calls=[],connection={beginTransaction:async()=>calls.push('begin'),commit:async()=>calls.push('commit'),rollback:async()=>calls.push('rollback'),release:()=>calls.push('release'),execute:async(sql,values)=>{calls.push({sql,values});return sql.startsWith('SELECT')?[[{id:'q',question_type:'TEXT',is_required:required,display_order:1}]]:[{affectedRows:1}]}};
  const db={execute:async()=>[[{id:'survey',due_date:null}]],getConnection:async()=>connection};
  const handler=route("app.post('/api/surveys/:id/responses'","app.get('/api/admin/dashboard'",{db});
  const res=response();await handler({params:{id:'survey'},user:{id:'customer'},body:{answers:{q0:value}}},res);
  assert.equal(res.code,expected);assert.equal(calls.includes('commit'),expected===201);assert.equal(calls.includes('rollback'),expected===400);assert.equal(calls.at(-1),'release');
  const detail=calls.find(c=>c.sql?.startsWith('INSERT INTO response_details'));
  if(expected===201&&value?.trim())assert.equal(detail.values.at(-1),value.trim());else assert.equal(detail,undefined);
 }
});
test('Customer frontend accepts one-character feedback and required survey text without weakening whitespace checks',async()=>{
 const node={innerHTML:'',textContent:'',dataset:{val:'5'},classList:{add(){},remove(){}}};
 const c=vm.createContext({document:{querySelector:()=>node,addEventListener(){}},sessionStorage:{getItem:()=>null,removeItem(){}},localStorage:{getItem:()=>null},setTimeout:()=>0,clearTimeout(){}});
 for(const file of ['birth-date.js','app.js'])vm.runInContext(source(file),c);await new Promise(r=>setImmediate(r));
 const sent=[];c.record=async(url,options)=>{sent.push({url,body:JSON.parse(options.body)});return {feedback:{id:'f'},completedAt:'22/10/2026'}};
 vm.runInContext("api=record;render=()=>{};me={email:'customer@test.invalid'}",c);
 await vm.runInContext("H.fb({prod:'PC',body:' a ',type:'Góp ý',title:''})",c);assert.equal(sent[0].body.body,'a');
 await vm.runInContext("H.fb({prod:'PC',body:'   ',type:'Góp ý',title:''})",c);assert.equal(sent.length,1);
 vm.runInContext("SV=[{id:'s',qs:[{t:'text',req:1}]}];open='s'",c);
 await vm.runInContext("H.sv({q0:'x'}, {})",c);assert.equal(sent.length,2);
 vm.runInContext("open='s'",c);await vm.runInContext("H.sv({q0:'   '}, {})",c);assert.equal(sent.length,2);
});

