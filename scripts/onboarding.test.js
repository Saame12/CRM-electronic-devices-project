const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const complete={id:'customer',email:'test@example.invalid',name:'Khách',phone:'0901234567',addr:'Hà Nội',birthDate:'1998-10-21',gender:'Nữ',need:'Gaming',role:'CUSTOMER'};
async function environment(user){const nodes=new Map(),events=[],storage=new Map();let fetched=0,saves=0;
 const node=s=>{if(!nodes.has(s))nodes.set(s,{innerHTML:'',textContent:'',open:false,showModal(){this.open=true},focus(){},classList:{add(){},remove(){}}});return nodes.get(s)};
 const context=vm.createContext({document:{querySelector:node,addEventListener:(type,handler)=>events.push({type,handler})},sessionStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},localStorage:{getItem:()=>null},console,setTimeout:()=>0,clearTimeout(){}});
 for(const file of ['crm-domain.js','customer-fields.js','birth-date.js','app.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
 await new Promise(resolve=>setImmediate(resolve));
 context.record=async(url,options)=>{if(url==='/api/me'&&options?.method==='PUT'){saves++;return {user:{...complete,...JSON.parse(options.body)}}}return {user:{...user}}};context.countRefresh=()=>{fetched++};
 vm.runInContext('api=record;refreshData=async()=>countRefresh()',context);
 return {context,node,storage,events,get fetched(){return fetched},get saves(){return saves}};
}
test('Need rejection after successful login opens completion instead of leaving the login form visible',async()=>{
 const env=await environment({...complete,need:'Chưa xác định'});
 vm.runInContext("refreshData=async()=>{const e=Error('Vui lòng chọn và lưu nhu cầu');e.status=403;e.code='NEED_CONFIRMATION_REQUIRED';throw e}",env.context);
 await vm.runInContext("H.login({email:'test@example.invalid',pass:'example-pass'})",env.context);
 assert.equal(vm.runInContext('me.id',env.context),'customer');
 assert.equal(vm.runInContext('onboarding',env.context),true);
 assert.equal(vm.runInContext('me.needConfirmed',env.context),false);
 assert.ok(env.node('#app').innerHTML.includes('Hoàn thiện thông tin cá nhân'));
 assert.ok(!env.node('#app').innerHTML.includes('id="login"'));
});

test('Cookie restore keeps the authenticated customer when a business API requests need confirmation',async()=>{
 const env=await environment({...complete,need:'Chưa xác định'});
 vm.runInContext("refreshData=async()=>{const e=Error('Vui lòng chọn nhu cầu');e.status=403;e.code='NEED_CONFIRMATION_REQUIRED';throw e}",env.context);
 await vm.runInContext('restoreSession()',env.context);
 assert.equal(vm.runInContext('me.id',env.context),'customer');
 assert.equal(vm.runInContext('onboarding',env.context),true);
 assert.ok(env.node('#onboardingDialog').open);
});

test('Business network failure after login does not become an authentication failure',async()=>{
 const env=await environment(complete);
 vm.runInContext("refreshData=async()=>{throw Error('Mất kết nối')}",env.context);
 await vm.runInContext("H.login({email:'test@example.invalid',pass:'example-pass'})",env.context);
 assert.equal(vm.runInContext('me.id',env.context),'customer');
 assert.ok(!env.node('#app').innerHTML.includes('id="login"'));
});

test('Staff-created default need must be explicitly confirmed even with every other profile field complete',async()=>{
 const env=await environment({...complete,need:'Chưa xác định',needConfirmed:false});
 await vm.runInContext("H.login({email:'test@example.invalid',pass:'example-pass'})",env.context);
 assert.equal(vm.runInContext('onboarding',env.context),true); assert.equal(env.fetched,0);
 const html=vm.runInContext('profView()',env.context);
 assert.ok(html.includes('value="" disabled selected>Vui lòng chọn nhu cầu sử dụng'));
 assert.ok(!html.includes('value="Chưa xác định" selected'));
 await vm.runInContext("H.prof({name:'Khách',phone:'0901234567',addr:'Hà Nội',birthDate:'21/10/1998',gender:'Nữ',need:''})",env.context);
 assert.equal(env.saves,0);
 await vm.runInContext("H.prof({name:'Khách',phone:'0901234567',addr:'Hà Nội',birthDate:'21/10/1998',gender:'Nữ',need:'Chưa xác định'})",env.context);
 assert.equal(env.saves,1); assert.equal(vm.runInContext('onboarding',env.context),false);
});

test('Incomplete login shows a non-dismissible OK dialog and keeps surveys locked',async()=>{
 const env=await environment({...complete,addr:'   '});await vm.runInContext("H.login({email:'test@example.invalid',pass:'example-pass'})",env.context);
 assert.equal(vm.runInContext('onboarding',env.context),true);assert.equal(env.fetched,0);assert.ok(env.node('#profileModal').innerHTML.includes('data-act="begin-onboarding"'));assert.ok(!env.node('#profileModal').innerHTML.includes('profile-close'));assert.ok(env.node('#onboardingDialog').open);
 let prevented=false;env.node('#onboardingDialog').oncancel({preventDefault(){prevented=true}});assert.ok(prevented);
 const click=env.events.find(x=>x.type==='click' && x.handler.toString().includes("'[data-act]'")).handler;click({target:{closest:()=>({dataset:{act:'begin-onboarding'}})}});
 assert.equal(vm.runInContext('onboardingNoticeOpen',env.context),false);assert.equal(vm.runInContext('onboarding',env.context),true);assert.ok(env.node('#app').innerHTML.includes('Hoàn thiện thông tin cá nhân'));assert.ok(!env.node('#app').innerHTML.includes('data-act="tab"'));
 click({target:{closest:()=>({dataset:{act:'tab',v:'fb'}})}});assert.equal(vm.runInContext('tab',env.context),'survey');
});
test('Cookie restore enforces completion without relying on sessionStorage flags',async()=>{
 const env=await environment({...complete,gender:''});await vm.runInContext('restoreSession()',env.context);assert.equal(env.storage.get('backline_crm_profile_onboarding'),'1');assert.equal(vm.runInContext('onboardingNoticeOpen',env.context),true);assert.equal(env.fetched,0);
});
test('Invalid profile cannot unlock surveys; successful save loads surveys and unlocks',async()=>{
 const env=await environment({...complete,addr:''});await vm.runInContext("H.login({email:'test@example.invalid',pass:'example-pass'})",env.context);
 await vm.runInContext("H.prof({name:'Khách',phone:'0901234567',addr:'',birthDate:'21/10/1998',gender:'Nữ',need:'Gaming'})",env.context);assert.equal(env.saves,0);assert.equal(vm.runInContext('onboarding',env.context),true);
 await vm.runInContext("H.prof({name:'Khách',phone:'0901234567',addr:'Hà Nội',birthDate:'21/10/1998',gender:'Nữ',need:'Gaming'})",env.context);assert.equal(env.saves,1);assert.equal(env.fetched,1);assert.equal(vm.runInContext('onboarding',env.context),false);assert.equal(env.storage.has('backline_crm_profile_onboarding'),false);assert.ok(env.node('#app').innerHTML.includes('Khảo sát dành cho bạn'));
});
test('Complete profile enters surveys directly and clears an obsolete completion flag',async()=>{
 const env=await environment(complete);env.storage.set('backline_crm_profile_onboarding','1');await vm.runInContext("H.login({email:'test@example.invalid',pass:'example-pass'})",env.context);assert.equal(vm.runInContext('onboarding',env.context),false);assert.equal(vm.runInContext('onboardingNoticeOpen',env.context),false);assert.equal(env.fetched,1);assert.equal(env.storage.has('backline_crm_profile_onboarding'),false);
});
test('Undetermined need is valid on login and does not force profile completion',async()=>{
 const env=await environment({...complete,need:'Chưa xác định'});
 await vm.runInContext("H.login({email:'test@example.invalid',pass:'example-pass'})",env.context);
 assert.equal(vm.runInContext('onboarding',env.context),false);assert.equal(env.fetched,1);
 assert.ok(vm.runInContext('profView()',env.context).includes('value="Chưa xác định" selected'));
});
test('Saving an otherwise complete profile with undetermined need unlocks surveys',async()=>{
 const env=await environment({...complete,addr:'',need:'Chưa xác định'});
 await vm.runInContext("H.login({email:'test@example.invalid',pass:'example-pass'})",env.context);
 await vm.runInContext("H.prof({name:'Khách',phone:'0901234567',addr:'Hà Nội',birthDate:'21/10/1998',gender:'Nữ',need:'Chưa xác định'})",env.context);
 assert.equal(env.saves,1);assert.equal(vm.runInContext('me.need',env.context),'Chưa xác định');assert.equal(vm.runInContext('onboarding',env.context),false);
});
test('Empty or invalid need still requires a real choice instead of silently defaulting to Gaming',async()=>{
 for(const need of ['', 'Không hợp lệ']){
  const env=await environment({...complete,need});env.context.testNeed=need;
  await vm.runInContext("H.login({email:'test@example.invalid',pass:'example-pass'})",env.context);
  assert.equal(vm.runInContext('onboarding',env.context),true);
  assert.ok(vm.runInContext('profView()',env.context).includes('value="" disabled selected>Vui lòng chọn nhu cầu sử dụng'));
  await vm.runInContext("H.prof({name:'Khách',phone:'0901234567',addr:'Hà Nội',birthDate:'21/10/1998',gender:'Nữ',need:testNeed})",env.context);
  assert.equal(env.saves,0);
 }
});

