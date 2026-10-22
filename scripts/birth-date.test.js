const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const dates=require('../birth-date');
test('dd/mm/yyyy is parsed without switching day and month',()=>{
 assert.equal(dates.parse('21/10/1998','2026-10-21'),'1998-10-21');
 assert.equal(dates.parse('03/04/2000','2026-10-21'),'2000-04-03');
 assert.equal(dates.display('1998-10-21'),'21/10/1998');
});
test('Invalid dates, missing fields and future dates are rejected',()=>{
 for(const value of ['','1/2/2000','31/04/2000','29/02/2001','10/13/2000','00/10/2000','21/10/-1998','22/10/2026','2000-02-03'])assert.equal(dates.parse(value,'2026-10-21'),null,value);
 assert.equal(dates.parse('29/02/2000','2026-10-21'),'2000-02-29');
 assert.equal(dates.parse('21/10/2026','2026-10-21'),'2026-10-21');
});
test('Backend ISO validation rejects rollover dates and unsupported years',()=>{
 assert.equal(dates.validISO('2000-02-29','2026-10-21'),true);
 for(const value of ['2001-02-29','2026-10-22','0000-01-01','1998-1-1',null])assert.equal(dates.validISO(value,'2026-10-21'),false);
});
test('Registration sends full date and gender; profile preserves the date after save',async()=>{
 const elements=new Map(),requests=[];const element=s=>{if(!elements.has(s))elements.set(s,{innerHTML:'',textContent:'',classList:{add(){},remove(){}}});return elements.get(s)};
 const context=vm.createContext({document:{querySelector:element,addEventListener(){}},sessionStorage:{getItem:()=>null,setItem(){},removeItem(){}},localStorage:{getItem:()=>null},console,setTimeout(){},clearTimeout(){},URLSearchParams});
 for(const file of ['birth-date.js','app.js','recovery-client.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
 vm.runInContext("authTab='reg';render()",context);assert.ok(element('#app').innerHTML.includes('placeholder="dd/mm/yyyy"'));assert.ok(element('#app').innerHTML.includes('name="gender"'));assert.ok(!element('#app').innerHTML.includes('name="year"'));
 context.record=(url,o)=>{requests.push({url,body:JSON.parse(o.body)});return {user:{name:'Khách thử',email:'test@example.com',phone:'0901234567',birthDate:'1998-10-21',gender:'Nữ',year:1998,addr:'Hà Nội',need:'Gaming'}}};
 vm.runInContext('api=async(url,o)=>record(url,o);refreshData=async()=>{}',context);
 await vm.runInContext("H.reg({name:'Khách thử',email:'test@example.com',phone:'0901234567',birthDate:'21/10/1998',gender:'Nữ',pass:'example-pass',pass2:'example-pass'})",context);
 assert.equal(requests[0].body.birthDate,'1998-10-21');assert.equal(requests[0].body.gender,'Nữ');assert.ok(!('year' in requests[0].body));
 vm.runInContext('onboardingNoticeOpen=false;render()',context);assert.ok(element('#app').innerHTML.includes('value="21/10/1998"'));
 await vm.runInContext("H.prof({name:'Khách thử',phone:'0901234567',addr:'Hà Nội',birthDate:'21/10/1998',gender:'Nữ',need:'Gaming'})",context);
 assert.equal(requests[1].url,'/api/me');assert.equal(requests[1].body.birthDate,'1998-10-21');assert.equal(vm.runInContext('onboarding',context),false);
});
