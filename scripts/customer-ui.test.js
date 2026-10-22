const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
test('Customer restores a cookie session without a sessionStorage token and logs out through API',async()=>{
 const nodes=new Map(),events=[],calls=[];const node=selector=>{if(!nodes.has(selector))nodes.set(selector,{innerHTML:'',classList:{add(){},remove(){}}});return nodes.get(selector)};
 let loggedIn=true;
 const context=vm.createContext({document:{querySelector:node,addEventListener:(type,handler)=>events.push({type,handler})},sessionStorage:{getItem:()=>null,removeItem(){}},localStorage:{getItem:()=>null},console,setTimeout:()=>0,clearTimeout(){},fetch:async(url,options)=>{calls.push({url,options});const data=url==='/api/me'?{user:{name:'Khách',email:'test@example.invalid',role:'CUSTOMER',phone:'0901234567',addr:'Hà Nội',birthDate:'1998-10-21',gender:'Nữ',need:'Gaming'}}:url==='/api/feedback'?{feedback:[]}:url==='/api/survey-status'?{completed:{}}:url==='/api/surveys'?{surveys:[]}:{};if(url==='/api/auth/logout')loggedIn=false;return {ok:url!=='/api/me'||loggedIn,json:async()=>data}}});
 vm.runInContext(source('birth-date.js'),context);vm.runInContext(source('app.js'),context);await vm.runInContext('restoreSession()',context);
 assert.equal(vm.runInContext('me.email',context),'test@example.invalid');assert.ok(calls.some(x=>x.url==='/api/me'));assert.ok(calls.every(x=>x.options.credentials==='same-origin'));assert.ok(calls.every(x=>!x.options.headers.Authorization));
 const click=events.find(x=>x.type==='click');click.handler({target:{closest:()=>({dataset:{act:'out'}})}});await new Promise(resolve=>setImmediate(resolve));
 assert.ok(calls.some(x=>x.url==='/api/auth/logout'&&x.options.method==='POST'));assert.equal(vm.runInContext('me',context),null);
});
test('Admin account table has no password column; manager can open safe read-only customer details',()=>{
 const nodes=new Map();let dialog;const node=s=>{if(!nodes.has(s))nodes.set(s,{innerHTML:'',querySelectorAll:()=>[],classList:{add(){},remove(){}}});return nodes.get(s)};
 const context=vm.createContext({document:{querySelector:node,querySelectorAll:()=>[],getElementById:()=>null,addEventListener(){},body:{appendChild(){}},createElement:()=>{dialog={setAttribute(){},addEventListener(){},showModal(){this.open=true}};return dialog}},MutationObserver:class{observe(){}},sessionStorage:{getItem:()=>null},setTimeout:()=>0,clearTimeout(){},console});
 for(const file of ['admin.js','role-ui.js','customer-details.js'])vm.runInContext(source(file),context);
 const html=vm.runInContext("me={id:'admin',role:'ADMIN'};accountPage()",context);assert.ok(!html.includes('<th>Mật khẩu</th>'));assert.ok(!html.includes('Đã băm'));assert.ok(html.includes('id="newAccountPassword"'));
 assert.ok(vm.runInContext("me={role:'MANAGER'};customers=[{id:'a'}];customerPage()",context).includes('data-action="view-customer"'));
 vm.runInContext("showCustomerDetails({name:'<script>unsafe</script>',email:'test@example.invalid',phone:'0901234567',birthDate:'1998-10-21',gender:'Nữ',addr:'Hà Nội',need:'Gaming',status:'ACTIVE'})",context);
 assert.ok(dialog.open);assert.ok(dialog.innerHTML.includes('21/10/1998'));assert.ok(dialog.innerHTML.includes('&lt;script&gt;'));assert.ok(!dialog.innerHTML.includes('<script>'));assert.ok(dialog.innerHTML.includes('Chỉ xem'));assert.ok(!dialog.innerHTML.includes('<input'));assert.ok(dialog.innerHTML.includes('Nhu cầu sử dụng'));
});
