const test=require('node:test'),assert=require('node:assert/strict'),{copySurvey,register}=require('../survey-copy');
function fixture({missing=false,empty=false,fail=false}={}){
 const writes=[],calls=[];const questions=['ONE','MULTI','TEXT','RATING'].map((type,i)=>({id:'old-q'+i,question_text:'Câu '+i,question_type:type,is_required:i%2,display_order:i*2+2}));
 const c={beginTransaction:async()=>calls.push('begin'),commit:async()=>calls.push('commit'),rollback:async()=>calls.push('rollback'),release:()=>calls.push('release'),execute:async(sql,params)=>{
  if(sql.includes('FROM surveys WHERE'))return [missing?[]:[{id:'old',title:'Khảo sát cũ',description:'Mô tả cũ'}]];
  if(sql.includes('FROM survey_questions'))return [empty?[]:questions];
  if(sql.includes('FROM question_options'))return [params[0]==='old-q0'||params[0]==='old-q1'?[{option_text:'Lựa chọn A',display_order:3},{option_text:'Lựa chọn B',display_order:5}]:[]];
  writes.push({sql,params});if(fail&&sql.includes('INSERT INTO question_options'))throw Error('database test failure');return [{affectedRows:1}];
 }};return {db:{getConnection:async()=>c},calls,writes,questions};
}
test('Copy makes an independent draft with fresh IDs, same questions/options and no answers',async()=>{
 const f=fixture(),result=await copySurvey(f.db,'old','manager');assert.notEqual(result.id,'old');assert.equal(result.survey.status,'DRAFT');assert.equal(result.survey.due_date,null);assert.equal(result.survey.response_count,0);assert.equal(result.survey.created_by,'manager');assert.equal(result.questions.length,4);
 result.questions.forEach((q,i)=>{assert.notEqual(q.id,f.questions[i].id);assert.equal(q.question_text,f.questions[i].question_text);assert.equal(q.question_type,f.questions[i].question_type);assert.equal(q.is_required,f.questions[i].is_required);assert.equal(q.display_order,i+1)});
 assert.deepEqual(result.questions[0].options,['Lựa chọn A','Lựa chọn B']);assert.deepEqual(result.questions[1].options,['Lựa chọn A','Lựa chọn B']);assert.ok(f.writes.every(x=>/^INSERT INTO (surveys|survey_questions|question_options) /.test(x.sql)));assert.ok(!f.writes.some(x=>/responses|recipients/.test(x.sql)));assert.deepEqual(f.calls,['begin','commit','release']);
});
test('Missing and empty source surveys roll back without creating drafts',async()=>{
 for(const [options,status]of [[{missing:true},404],[{empty:true},409]]){const f=fixture(options);await assert.rejects(()=>copySurvey(f.db,'old','manager'),e=>e.status===status);assert.equal(f.writes.length,0);assert.deepEqual(f.calls,['begin','rollback','release'])}
});
test('A database failure rolls back the whole copy and releases the connection',async()=>{
 const f=fixture({fail:true});await assert.rejects(()=>copySurvey(f.db,'old','manager'));assert.deepEqual(f.calls,['begin','rollback','release']);
});
test('Copy endpoint uses authentication plus manager permission',()=>{
 let route;const auth=()=>{},staff=()=>{};register({post:(...args)=>route=args},null,auth,staff,x=>x);assert.equal(route[0],'/api/admin/surveys/:id/copy');assert.equal(route[1],auth);assert.equal(route[2],staff);
});
