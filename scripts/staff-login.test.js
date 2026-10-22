const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
async function browser(portal,role,restore=false){
 const events=[],redirects=[],calls=[],storage=new Map(restore?[['backline_crm_admin_token','old-token']]:[]);
 const nodes=new Map(),node=s=>{if(!nodes.has(s))nodes.set(s,{innerHTML:'',textContent:'',classList:{add(){},remove(){}}});return nodes.get(s)};
 const c=vm.createContext({URLSearchParams,MutationObserver:class{observe(){}},location:{pathname:'/nested/'+portal+'.html',replace:url=>redirects.push(url)},document:{querySelector:node,querySelectorAll:()=>[],addEventListener:(type,fn)=>events.push({type,fn})},sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},FormData:class{*[Symbol.iterator](){yield ['email','test@example.invalid'];yield ['password','secret']}},setTimeout:()=>0,clearTimeout(){},fetch:async(url,o)=>{calls.push({url,body:o?.body&&JSON.parse(o.body)});return {ok:true,json:async()=>url==='/api/me'?{user:{id:'u',role}}:url==='/api/auth/login'?{token:'new-token',user:{id:'u',role}}:url==='/api/admin/accounts'?{accounts:[]}:{customers:0,openFeedback:0,openSurveys:0}}}});
 for(const f of ['admin.js','role-ui.js','staff-surveys.js','staff-controller.js','reports.js','staff-bootstrap.js'])vm.runInContext(source(f),c);await new Promise(r=>setImmediate(r));
 if(!restore){await events.find(x=>x.type==='submit').fn({target:{id:'login'},preventDefault(){}})}
 return {c,redirects,calls,storage,node};
}
test('Admin stays on admin.html; manager login there redirects without loading admin data',async()=>{
 const admin=await browser('admin','ADMIN');assert.equal(vm.runInContext('me.role',admin.c),'ADMIN');assert.equal(admin.redirects.length,0);
 const manager=await browser('admin','MANAGER');assert.deepEqual(manager.redirects,['manager.html']);assert.equal(manager.storage.get('backline_crm_admin_token'),'new-token');assert.equal(vm.runInContext('me',manager.c),null);assert.ok(!manager.calls.some(x=>x.url==='/api/admin/dashboard'));assert.equal(manager.calls[0].body.staffPortal,'ADMIN');
});
test('manager.html accepts only manager; admin and customer cannot enter or save login token',async()=>{
 const manager=await browser('manager','MANAGER');assert.equal(vm.runInContext('me.role',manager.c),'MANAGER');
 for(const role of ['ADMIN','CUSTOMER']){const env=await browser('manager',role);assert.equal(vm.runInContext('me',env.c),null);assert.equal(env.storage.get('backline_crm_admin_token'),undefined);assert.ok(env.node('#error').textContent.includes('Quản lý'));assert.equal(env.calls[0].body.staffPortal,'MANAGER')}
});
test('Customer cannot sign in at admin portal',async()=>{
 const env=await browser('admin','CUSTOMER');assert.equal(vm.runInContext('me',env.c),null);assert.equal(env.storage.size,0);
});
test('Restored sessions redirect to their own portal before rendering protected content',async()=>{
 const manager=await browser('admin','MANAGER',true);assert.deepEqual(manager.redirects,['manager.html']);assert.equal(vm.runInContext('me',manager.c),null);
 const admin=await browser('manager','ADMIN',true);assert.deepEqual(admin.redirects,['admin.html']);assert.equal(vm.runInContext('me',admin.c),null);
 const customer=await browser('manager','CUSTOMER',true);assert.equal(customer.storage.size,0);assert.equal(vm.runInContext('me',customer.c),null);
});
test('Server validates portal and role before issuing a token',async()=>{
 const s=source('server.mysql.js'),start=s.indexOf("app.post('/api/auth/login'"),end=s.indexOf("app.post('/api/auth/logout'",start);
 for(const [portal,role,expected] of [['MANAGER','MANAGER',200],['MANAGER','ADMIN',403],['MANAGER','CUSTOMER',403],['ADMIN','ADMIN',200],['ADMIN','MANAGER',200],['ADMIN','CUSTOMER',403],['invalid','ADMIN',400]]){
  let handler,issued=0,status=200;const user={role,account_status:'ACTIVE',password_hash:'hash'};
  const c=vm.createContext({app:{post:(_url,fn)=>handler=fn},wrap:fn=>fn,db:{execute:async()=>[[user]]},bcrypt:{compare:async()=>true},CustomerSession:{issue:()=>{issued++;return 'token'}},tokenFor(){},publicUser:u=>u});
  vm.runInContext(s.slice(start,end),c);const res={status:n=>{status=n;return res},json(){}};
  await handler({body:{staffPortal:portal,email:'test@example.invalid',password:'password'}},res);
  assert.equal(status,expected,portal+'/'+role);assert.equal(issued,expected===200?1:0);
 }
});
