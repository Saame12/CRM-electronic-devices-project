// Chỉ tạo bản sao trong bảng TEMPORARY; không thêm bản nháp kiểm thử vào dữ liệu thật.
require('dotenv').config({quiet:true});
const mysql=require('mysql2/promise'),assert=require('node:assert/strict'),{copySurvey}=require('../survey-copy');
async function main(){const c=await mysql.createConnection({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD,database:process.env.DB_NAME||'backline_crm'});
 try{
  for(const [temp,real]of [['copy_test_surveys','surveys'],['copy_test_questions','survey_questions'],['copy_test_options','question_options']])await c.query(`CREATE TEMPORARY TABLE ${temp} LIKE ${real}`);
  await c.query("INSERT INTO copy_test_surveys SELECT * FROM surveys WHERE id IN ('s1','s2','s3')");
  await c.query("INSERT INTO copy_test_questions SELECT * FROM survey_questions WHERE survey_id IN ('s1','s2','s3')");
  await c.query("INSERT INTO copy_test_options SELECT o.* FROM question_options o JOIN survey_questions q ON q.id=o.question_id WHERE q.survey_id IN ('s1','s2','s3')");
  const rewrite=sql=>sql.replace(/\bsurveys\b/g,'copy_test_surveys').replace(/\bsurvey_questions\b/g,'copy_test_questions').replace(/\bquestion_options\b/g,'copy_test_options');
  const db={getConnection:async()=>({beginTransaction:()=>c.beginTransaction(),commit:()=>c.commit(),rollback:()=>c.rollback(),release(){},execute:(sql,values)=>c.execute(rewrite(sql),values)})};
  let checked=0;
  for(const id of ['s1','s2','s3']){
   const [[source]]=await c.execute('SELECT * FROM copy_test_surveys WHERE id=?',[id]);if(!source)continue;
   const [oldQuestions]=await c.execute('SELECT * FROM copy_test_questions WHERE survey_id=? ORDER BY display_order',[id]);
   const result=await copySurvey(db,id,source.created_by);assert.equal(result.survey.status,'DRAFT');assert.equal(result.survey.due_date,null);assert.equal(result.questions.length,oldQuestions.length);assert.notEqual(result.id,id);
   for(let i=0;i<oldQuestions.length;i++){assert.equal(result.questions[i].question_text,oldQuestions[i].question_text);assert.equal(result.questions[i].question_type,oldQuestions[i].question_type);assert.notEqual(result.questions[i].id,oldQuestions[i].id);const [opts]=await c.execute('SELECT option_text FROM copy_test_options WHERE question_id=? ORDER BY display_order',[oldQuestions[i].id]);assert.deepEqual(result.questions[i].options,opts.map(x=>x.option_text))}
   const [[unchanged]]=await c.execute('SELECT status,due_date FROM copy_test_surveys WHERE id=?',[id]);assert.equal(unchanged.status,source.status);assert.equal(String(unchanged.due_date),String(source.due_date));checked++;
  }
  assert.equal(checked,3,'Cần đủ ba khảo sát đã chuyển vào DB để kiểm tra.');console.log('MySQL copy verification passed for all three surveys on temporary tables; originals preserved.');
 }finally{await c.end()}
}
main().catch(e=>{console.error(e.code||e.message);process.exitCode=1});
