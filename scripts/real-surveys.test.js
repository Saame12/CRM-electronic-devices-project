const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const definitions=require('../database/real-surveys'),{synchronize}=require('./sync-real-surveys');
test('Database survey content contains all ten questions and twenty-one options',()=>{
 assert.deepEqual(definitions.map(x=>x.questions.length),[4,4,2]);assert.equal(definitions.flatMap(s=>s.questions.flatMap(q=>q.options||[])).length,21);
 for(const s of definitions)for(const q of s.questions){assert.ok(q.text.trim());assert.ok(['ONE','MULTI','TEXT','RATING'].includes(q.type));if(['ONE','MULTI'].includes(q.type))assert.ok(q.options.length>=2)}
});
test('Importer preserves existing custom questions, closed statuses and answers on repeat runs',async()=>{
 const calls=[],db={beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},execute:async(sql,values)=>{calls.push(sql);if(sql.startsWith('SELECT id,title'))return [[{id:'existing',title:values[0],status:'CLOSED',due_date:'2026-09-30'}]];if(sql.includes('FROM survey_responses'))return [[{total:2}]];if(sql.startsWith('SELECT id,question_text'))return [[{id:'custom',question_text:'Nội dung quản lý đã sửa',question_type:'TEXT',display_order:1}]];return [[{questions:1,options:0}]]}};
 const result=await synchronize(db,true);assert.equal(result.length,3);assert.ok(result.every(x=>x.status==='CLOSED'&&x.responses===2&&x.addedQuestions===0));assert.ok(!calls.some(sql=>/^(INSERT|UPDATE|DELETE)/.test(sql)));
});
test('Customer survey list exactly follows API and clears a survey that is no longer returned',async()=>{
 const node={innerHTML:'',classList:{add(){},remove(){}}};const context=vm.createContext({console,document:{querySelector:()=>node,addEventListener(){}},sessionStorage:{getItem:()=>null,removeItem(){}},localStorage:{getItem:()=>null},setTimeout:()=>0,clearTimeout(){}});
 for(const file of ['birth-date.js','app.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
 await new Promise(resolve=>setImmediate(resolve));assert.equal(vm.runInContext('SV.length',context),0);
 vm.runInContext("me={email:'test@example.invalid'};api=async(url)=>url==='/api/surveys'?{surveys:[{id:'from-db',title:'Khảo sát trong DB',qs:[]}]}:url==='/api/feedback'?{feedback:[]}:{completed:{}}",context);await vm.runInContext('refreshData()',context);assert.equal(vm.runInContext('SV[0].id',context),'from-db');
 vm.runInContext("api=async(url)=>url==='/api/surveys'?{surveys:[]}:url==='/api/feedback'?{feedback:[]}:{completed:{}}",context);await vm.runInContext('refreshData()',context);assert.equal(vm.runInContext('SV.length',context),0);
});
