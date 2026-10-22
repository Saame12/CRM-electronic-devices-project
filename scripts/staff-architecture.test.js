const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const modules=['admin.js','role-ui.js','staff-surveys.js','staff-controller.js','reports.js','recovery-admin.js','customer-details.js'];

test('Staff brand links stay inside their own role portal instead of opening the customer homepage',()=>{
 for(const page of ['admin','manager']){
  const html=source(page+'.html');
  assert.match(html,new RegExp('<a href="'+page+'\\.html" class="brand"'));
  assert.ok(!/<a href="\/" class="brand"/.test(html));
  const target=html.match(/<a href="([^"]+)" class="brand"/)[1];
  assert.equal(new URL(target,'http://localhost:3000/'+page+'.html').pathname,'/'+page+'.html');
 }
});
test('Staff modules have no duplicate named functions, prompt editors or DOM-injected action buttons',()=>{
 const seen=new Map();
 for(const file of modules){
  for(const match of source(file).matchAll(/^(?:async )?function\s+(\w+)\s*\(/gm)){
   assert.ok(!seen.has(match[1]),match[1]+' in '+file+' duplicates '+seen.get(match[1]));seen.set(match[1],file);
  }
  assert.ok(!source(file).includes('MutationObserver'),file);
  assert.ok(!source(file).includes('prompt('),file);
 }
 assert.ok(!source('staff-controller.js').includes("'delete-feedback'"));
 assert.equal((source('staff-controller.js').match(/document.addEventListener\('click'/g)||[]).length,1);
 assert.equal((source('staff-controller.js').match(/document.addEventListener\('submit'/g)||[]).length,1);
});
test('Both portals use exactly the same ordered staff modules and styles; bootstrap is last',()=>{
 const scripts=s=>([...s.matchAll(/<script src="([^"]+)" defer/g)].map(x=>x[1]));
 const css=s=>([...s.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(x=>x[1]));
 const admin=source('admin.html'),manager=source('manager.html');
 assert.deepEqual(scripts(admin),[...modules,'staff-bootstrap.js']);assert.deepEqual(scripts(manager),scripts(admin));assert.deepEqual(css(admin),css(manager));
 assert.ok(!fs.existsSync(path.join(__dirname,'..','manager.js')));
 assert.match(source('server.js'),/require\('\.\/server.mysql'\)/);
});
test('Public files middleware refuses backend source, DB files, legacy data and dependencies',()=>{
 const guard=require('../public-assets');
 for(const pathname of ['/.env','/server.mysql.js','/password-recovery.js','/database/schema.sql','/data/crm.json','/node_modules/mysql2/package.json','/scripts/setup-database.js','/README.md']){
  let passed=false,status;guard({path:pathname,method:'GET'},{status:n=>{status=n;return {end(){}}}},()=>{passed=true});assert.equal(passed,false,pathname);assert.equal(status,404);
 }
 for(const pathname of ['/','/admin.html','/manager.html','/staff-controller.js','/api/me']){
  let passed=false;guard({path:pathname,method:'GET'},{status(){throw Error('Unexpected rejection')}},()=>{passed=true});assert.ok(passed,pathname);
 }
});
function environment(){
 const events=[],node={innerHTML:'',textContent:'',querySelectorAll:()=>[],classList:{add(){},remove(){}}};
 const c=vm.createContext({URLSearchParams,document:{querySelector:()=>node,querySelectorAll:()=>[],addEventListener:(type,handler)=>events.push({type,handler})},sessionStorage:{getItem:()=>null,removeItem(){}},setTimeout:()=>0,clearTimeout(){}});
 for(const file of modules)vm.runInContext(source(file),c);
 return {c,events};
}
test('Action dispatcher deduplicates concurrent mutations and enforces role before calling handlers',async()=>{
 const {c,events}=environment();let calls=0,release;
 c.task=()=>{calls++;return new Promise(resolve=>{release=resolve})};
 vm.runInContext("me={id:'m',role:'MANAGER'};staffActions['close-survey']=task",c);
 const handler=events.find(e=>e.type==='click'&&e.handler.toString().includes('staffActions[action]')).handler;
 const button={dataset:{action:'close-survey'},disabled:false},event={preventDefault(){},target:{closest:selector=>selector==='[data-password-toggle]'?null:button}};
 const first=handler(event);await handler(event);assert.equal(calls,1);release();await first;assert.equal(button.disabled,false);
 vm.runInContext("me={id:'a',role:'ADMIN'}",c);await handler(event);assert.equal(calls,1);
});
test('Logout clears both report data and admin recovery state, not only the token',()=>{
 const {c}=environment();
 vm.runInContext("me={id:'a',role:'ADMIN'};reportData={private:'old'};reportDetail={data:'old'};recoveryAdminData={requests:[{email:'old'}],pending:1,unread:1};resetStaffSession()",c);
 assert.equal(vm.runInContext('me',c),null);assert.equal(vm.runInContext('reportData',c),null);assert.equal(vm.runInContext('reportDetail',c),null);assert.equal(vm.runInContext('recoveryAdminData.requests.length',c),0);
});
test('Late collection response does not overwrite a different logged-in user',async()=>{
 const {c}=environment();let release;c.getData=()=>new Promise(resolve=>{release=resolve});
 vm.runInContext("me={id:'old',role:'ADMIN'};api=getData",c);const loading=vm.runInContext('loadAccounts()',c);
 vm.runInContext("me={id:'new',role:'ADMIN'}",c);release({accounts:[{email:'private-old'}]});await loading;
 assert.equal(vm.runInContext('accounts.length',c),0);
});

