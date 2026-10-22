const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
async function customer(){
 const events=[],storage=new Map(),node={innerHTML:'',classList:{add(){},remove(){}}};
 const c=vm.createContext({document:{querySelector:()=>node,addEventListener:(type,handler)=>events.push({type,handler})},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},sessionStorage:{getItem:()=>null,removeItem(){}},setTimeout:()=>0,clearTimeout(){}});
 for(const f of ['birth-date.js','app.js'])vm.runInContext(source(f),c);
 await new Promise(r=>setImmediate(r));return {c,events,storage};
}
test('Login and both registration password inputs have independent accessible eye buttons',async()=>{
 const {c,events}=await customer();
 assert.equal((vm.runInContext("authTab='login';auth()",c).match(/data-customer-password-toggle/g)||[]).length,1);
 assert.equal((vm.runInContext("authTab='reg';auth()",c).match(/data-customer-password-toggle/g)||[]).length,2);
 const handler=events.find(x=>x.type==='click'&&x.handler.toString().includes('[data-customer-password-toggle]')).handler;
 const input={type:'password',value:'keep-my-input',focus(){}},attrs={},button={parentElement:{querySelector:()=>input},setAttribute:(k,v)=>attrs[k]=v};
 handler({target:{closest:()=>button},preventDefault(){}});assert.equal(input.type,'text');assert.equal(attrs['aria-pressed'],'true');assert.equal(input.value,'keep-my-input');
 handler({target:{closest:()=>button},preventDefault(){}});assert.equal(input.type,'password');assert.equal(attrs['aria-label'],'Hiện mật khẩu');
});
test('Completed and expired unanswered surveys can be hidden, reviewed and restored per customer',async()=>{
 const {c,storage}=await customer();
 vm.runInContext("me={email:'one@test.invalid'};DONE[me.email]={answered:'22/10/2026'};SV=[{id:'answered',title:'Answered',qs:[]},{id:'expired',title:'Expired',qs:[],isExpired:true},{id:'new',title:'New survey',qs:[]}];hideSurvey('answered');hideSurvey('expired')",c);
 let html=vm.runInContext('svList()',c);assert.ok(!html.includes('<h2>Answered</h2>'));assert.ok(html.includes('Xem khảo sát đã ẩn (2)'));assert.ok(html.includes('<h2>New survey</h2>'));
 html=vm.runInContext('showHiddenSurveys=true;svList()',c);assert.ok(html.includes('<h2>Answered</h2>'));assert.ok(html.includes('Quá hạn chưa trả lời'));assert.equal((html.match(/data-act="restore-survey"/g)||[]).length,2);
 assert.equal(vm.runInContext("restoreSurvey('answered');hiddenSurveys().has('answered')",c),false);
 assert.equal(vm.runInContext("DONE[me.email].answered",c),'22/10/2026');
 assert.equal(vm.runInContext("me={email:'two@test.invalid'};hiddenSurveys().size",c),0);
 storage.set('backline_crm_hidden_surveys_two@test.invalid','bad json');assert.equal(vm.runInContext('hiddenSurveys().size',c),0);
});
test('Account list filters combine name/email/phone, role and status without role editing',()=>{
 const node={innerHTML:'',querySelectorAll:()=>[],classList:{add(){},remove(){}}};
 const c=vm.createContext({document:{querySelector:()=>node,querySelectorAll:()=>[],addEventListener(){}},MutationObserver:class{observe(){}},sessionStorage:{getItem:()=>null},setTimeout:()=>0,clearTimeout(){}});
 for(const f of ['admin.js','role-ui.js'])vm.runInContext(source(f),c);
 vm.runInContext("me={id:'admin',role:'ADMIN'};accounts=[{id:'admin',name:'Admin',role:'ADMIN',status:'ACTIVE'},{id:'a',name:'An',email:'an@test.invalid',phone:'0901234567',role:'CUSTOMER',status:'ACTIVE'},{id:'b',name:'Binh',role:'MANAGER',status:'LOCKED'}]",c);
 const html=vm.runInContext('accountPage()',c);assert.ok(!html.includes('data-action="change-role"'));assert.ok(!html.includes('id="role-'));assert.ok(html.includes('id="accountFilters"'));assert.ok(html.includes('name="role"><option value="CUSTOMER"'));
 assert.equal(vm.runInContext("accountFilters={q:'AN@TEST',role:'CUSTOMER',status:'ACTIVE'};filteredAccounts().length",c),1);
 assert.equal(vm.runInContext("accountFilters.status='LOCKED';filteredAccounts().length",c),0);
 assert.equal(vm.runInContext("accountFilters={q:'090123',role:'',status:''};filteredAccounts().length",c),1);
 assert.equal(vm.runInContext("accountFilters={q:'',role:'ADMIN',status:''};filteredAccounts().length",c),1);
 assert.match(source('server.mysql.js'),/accounts\/:id\/role'.*status\(405\)/);
});
