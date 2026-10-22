const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {buildOverview,aggregateQuestion,range,registerReports}=require('../reports-service');
const now=new Date('2026-10-20T12:00:00+07:00');
const customer={birth_year:2000,address:'Hà Nội',gender:'Nam',need:'Gaming',account_status:'ACTIVE',created_at:'2026-10-01'};
const feedback=(id,rate,extra={})=>({id,customer_id:'customer',product_id:'pc',product_name:'PC',rating:rate,status:'NEW',is_hidden:0,feedback_type:'Góp ý',created_at:'2026-10-02',...extra});
test('Empty data has no invented percentages or scores',()=>{
 const d=buildOverview([],[],[],now);assert.equal(d.customers.completionRate,null);assert.equal(d.feedback.averageRating,null);assert.equal(d.feedback.satisfactionRate,null);assert.equal(d.feedback.resolutionRate,null);assert.equal(d.surveys.responses,0);
});
test('Customer cohorts include unknown ages, unknown needs, locked accounts',()=>{
 const d=buildOverview([customer,{...customer,birth_year:null,need:'Chưa xác định',account_status:'LOCKED'},{...customer,birth_year:0,gender:''}],[],[],now).customers;
 assert.equal(d.total,3);assert.equal(d.active,2);assert.equal(d.locked,1);assert.equal(d.complete,1);assert.equal(d.completionRate,33.3);assert.equal(d.byAge.find(x=>x.label==='Chưa có năm sinh hợp lệ').total,2);assert.equal(d.byNeed.find(x=>x.label==='Chưa xác định').percentage,33.3);
});
test('Average uses all individual ratings, hidden feedback remains counted',()=>{
 const d=buildOverview([], [feedback('a',5),feedback('b',5),feedback('c',1,{product_id:'laptop',product_name:'Laptop',is_hidden:1,status:'RESOLVED',feedback_type:'Báo lỗi / Khiếu nại'})],[],now).feedback;
 assert.equal(d.averageRating,3.7);assert.equal(d.satisfactionRate,66.7);assert.equal(d.total,3);assert.equal(d.hidden,1);assert.equal(d.pending,2);assert.equal(d.resolutionRate,33.3);assert.equal(d.respondents,1);assert.equal(d.byProduct.find(x=>x.id==='laptop').complaints,1);
});
test('Completion denominator matches recipients, not all respondents',()=>{
 const items=buildOverview([],[],[{id:'a',status:'OPEN',due_day:'2026-10-19',recipients:2,responses:4,matched_responses:1},{id:'b',status:'OPEN',due_day:'2026-10-20',recipients:0,responses:2,matched_responses:0},{id:'c',status:'CLOSED',due_day:'2026-10-19',recipients:1,responses:1,matched_responses:1}],now).surveys.items;
 assert.equal(items[0].completionRate,50);assert.equal(items[0].outsideResponses,3);assert.equal(items[0].notAnswered,1);assert.equal(items[0].effectiveStatus,'EXPIRED');assert.equal(items[1].completionRate,null);assert.equal(items[1].effectiveStatus,'OPEN');assert.equal(items[2].effectiveStatus,'CLOSED');
});
test('Multiple choice counts each respondent once per option and allows sum > 100%',()=>{
 const q=aggregateQuestion({id:'q',question_type:'MULTI',question_text:'Chọn'},[{id:'a',option_text:'A'},{id:'b',option_text:'B'}],[{response_id:'r1',option_id:'a'},{response_id:'r1',option_id:'a'},{response_id:'r1',option_id:'b'},{response_id:'r2',option_id:'b'}],3);
 assert.equal(q.answered,2);assert.equal(q.skipped,1);assert.deepEqual(q.options.map(x=>x.percentage),[50,100]);
});
test('Rating question averages scores; text examples are explicitly capped',()=>{
 const rating=aggregateQuestion({question_type:'RATING'},[],[{response_id:'a',rating_value:5},{response_id:'b',rating_value:3}],3);assert.equal(rating.averageRating,4);assert.equal(rating.skipped,1);
 const text=aggregateQuestion({question_type:'TEXT'},[],Array.from({length:102},(_,i)=>({response_id:String(i),text_answer:'ý kiến'})),102);assert.equal(text.textCount,102);assert.equal(text.texts.length,100);
 const invalid=aggregateQuestion({question_type:'RATING'},[],[{response_id:'a',rating_value:null},{response_id:'b',rating_value:9}],2);assert.equal(invalid.answered,0);assert.equal(invalid.averageRating,null);assert.equal(invalid.skipped,2);
});
test('Filter rejects reversed ranges, invalid dates and malformed values',()=>{
 for(const input of [{from:'2026-02-30'},{to:'2026-13-01'},{from:'2026-10-20',to:'2026-10-01'},{from:"' OR 1=1"}])assert.throws(()=>range(input));
 assert.deepEqual(range({from:'2026-10-20',to:'2026-10-20'}),{from:'2026-10-20',to:'2026-10-20'});
});
test('Reporting endpoints require authentication and manager authorization',()=>{
 const routes=[],auth=()=>{},staff=()=>{};registerReports({get:(...args)=>routes.push(args)},null,auth,staff,x=>x);
 assert.equal(routes.length,2);for(const route of routes){assert.equal(route[1],auth);assert.equal(route[2],staff)}
});
test('Overview parameterizes inclusive end date and commits a consistent snapshot',async()=>{
 const calls=[],connection={query:async(sql)=>{calls.push([sql]);return sql.includes('CURDATE()')?[[{today:'2026-10-20'}]]:[[]]},beginTransaction:async()=>calls.push(['begin']),execute:async(sql,params)=>{calls.push([sql,params]);return [[]]},commit:async()=>calls.push(['commit']),rollback:async()=>calls.push(['rollback']),release:()=>calls.push(['release'])},routes=[];
 registerReports({get:(...args)=>routes.push(args)},{getConnection:async()=>connection},()=>{},()=>{},x=>x);let output;
 await routes[0].at(-1)({query:{from:'2026-10-01',to:'2026-10-20'}},{json:d=>output=d});
 assert.equal(output.asOf,'2026-10-20');const queries=calls.filter(x=>x[1]);assert.equal(queries.length,3);for(const [sql,params] of queries){assert.ok(sql.includes('< DATE_ADD(?, INTERVAL 1 DAY)'));assert.deepEqual(params,['2026-10-01','2026-10-20'])}assert.deepEqual(calls.slice(-2),[['commit'],['release']]);
});
test('Reports render safely after both existing scripts, with no MySQL dependency',()=>{
 const elements=new Map(),events=[],element=s=>{if(!elements.has(s))elements.set(s,{innerHTML:'',textContent:'',querySelector:()=>null,querySelectorAll:()=>[],classList:{add(){},remove(){}}});return elements.get(s)};
 const context=vm.createContext({console,document:{querySelector:element,querySelectorAll:()=>[],addEventListener:(...x)=>events.push(x),createElement:()=>({click(){}})},MutationObserver:class{observe(){}},sessionStorage:{getItem:()=>null},setTimeout:()=>0,clearTimeout(){},URLSearchParams,URL,Blob,window:{},fetch:()=>{throw Error('Unexpected network access')}});
 for(const file of ['admin.js','role-ui.js','reports.js','recovery-admin.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context,{filename:file});
 context.fixture=buildOverview([customer],[],[],now);context.fixture.generatedAt=now.toISOString();context.fixture.asOf='2026-10-20';
 vm.runInContext("me={role:'MANAGER',name:'Quản lý'};page='reports';reportData=fixture;render()",context);
 assert.ok(element('#app').innerHTML.includes('Chân dung khách hàng'));
 context.fixture.feedback.byProduct=[{name:'<script>alert(1)</script>',total:1}];
 vm.runInContext("reportSection='feedback';render()",context);assert.ok(element('#app').innerHTML.includes('&lt;script&gt;'));assert.ok(!element('#app').innerHTML.includes('<script>alert'));
 vm.runInContext("reportSection='surveys';render()",context);assert.ok(element('#app').innerHTML.includes('Hiệu quả khảo sát'));
 vm.runInContext("me={role:'ADMIN',id:'a',name:'Admin'};render()",context);assert.ok(element('#app').innerHTML.includes('Quản trị tài khoản'));
});
