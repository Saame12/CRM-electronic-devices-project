const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const complete={id:'customer',email:'test@example.invalid',name:'Khách',phone:'0901234567',addr:'Hà Nội',birthDate:'1998-10-21',gender:'Nữ',need:'Gaming',role:'CUSTOMER'};
async function environment(user){const nodes=new Map(),events=[],storage=new Map();let fetched=0,saves=0;
 const node=s=>{if(!nodes.has(s))nodes.set(s,{innerHTML:'',textContent:'',open:false,showModal(){this.open=true},focus(){},classList:{add(){},remove(){}}});return nodes.get(s)};
 const context=vm.createContext({document:{querySelector:node,addEventListener:(type,handler)=>events.push({type,handler})},sessionStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},localStorage:{getItem:()=>null},console,setTimeout:()=>0,clearTimeout(){}});
 for(const file of ['birth-date.js','app.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
 await new Promise(resolve=>setImmediate(resolve));
 context.record=async(url,options)=>{if(url==='/api/me'&&options?.method==='PUT'){saves++;return {user:{...complete}}}return {user:{...user}}};context.countRefresh=()=>{fetched++};
 vm.runInContext('api=record;refreshData=async()=>countRefresh()',context);
 return {context,node,storage,events,get fetched(){return fetched},get saves(){return saves}};
}
test('Incomplete login shows a non-dismissible OK dialog and keeps surveys locked',async()=>{
 const env=await environment({...complete,addr:'   '});await vm.runInContext("H.login({email:'test@example.invalid',pass:'example-pass'})",env.context);
 assert.equal(vm.runInContext('onboarding',env.context),true);assert.equal(env.fetched,0);assert.ok(env.node('#profileModal').innerHTML.includes('data-act="begin-onboarding"'));assert.ok(!env.node('#profileModal').innerHTML.includes('profile-close'));assert.ok(env.node('#onboardingDialog').open);
 let prevented=false;env.node('#onboardingDialog').oncancel({preventDefault(){prevented=true}});assert.ok(prevented);
 const click=env.events.find(x=>x.type==='click').handler;click({target:{closest:()=>({dataset:{act:'begin-onboarding'}})}});
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
