require('dotenv').config({quiet:true});
const mysql=require('mysql2/promise'),crypto=require('node:crypto');
const definitions=require('../database/real-surveys');
async function synchronize(connection,apply=false){
 const changes=[];
 await connection.beginTransaction();
 try{
  for(const definition of definitions){
   const [matches]=await connection.execute('SELECT id,title,status,DATE_FORMAT(due_date,\'%Y-%m-%d\') due_date FROM surveys WHERE title=? FOR UPDATE',[definition.title]);
   if(matches.length>1)throw Error(`Có nhiều khảo sát cùng tên: ${definition.title}. Cần đối chiếu trước khi cập nhật.`);
   let survey=matches[0],created=false;
   if(!survey){
    if(!apply){changes.push({title:definition.title,action:'Chưa có trong DB'});continue}
    const [[owner]]=await connection.query("SELECT id FROM users WHERE role IN ('MANAGER','ADMIN') ORDER BY (role='MANAGER') DESC,created_at LIMIT 1");
    if(!owner)throw Error('Cần có tài khoản Quản lý hoặc Admin để ghi nhận người tạo khảo sát.');
    const [[used]]=await connection.execute('SELECT id FROM surveys WHERE id=?',[definition.legacyId]);
    survey={id:used?crypto.randomUUID():definition.legacyId,title:definition.title,status:'DRAFT',due_date:null};
    await connection.execute('INSERT INTO surveys (id,title,description,status,created_by) VALUES (?,?,?,\'DRAFT\',?)',[survey.id,survey.title,definition.description,owner.id]);created=true;
   }
   const [[answered]]=await connection.execute('SELECT COUNT(*) total FROM survey_responses WHERE survey_id=?',[survey.id]);
   const [existing]=await connection.execute('SELECT id,question_text,question_type,display_order FROM survey_questions WHERE survey_id=? ORDER BY display_order',[survey.id]);
   let addedQuestions=0,addedOptions=0;
   if(apply){
    // Giữ nguyên khảo sát đã có nội dung hoặc lịch sử trả lời, không ghi đè nội dung người quản lý đã sửa.
    if(existing.length===0&&Number(answered.total)===0){
     for(let index=0;index<definition.questions.length;index++){
      const q=definition.questions[index],id=crypto.randomUUID();
      await connection.execute('INSERT INTO survey_questions (id,survey_id,question_text,question_type,is_required,display_order) VALUES (?,?,?,?,?,?)',[id,survey.id,q.text,q.type,q.required,index+1]);addedQuestions++;
      for(let j=0;j<(q.options||[]).length;j++){await connection.execute('INSERT INTO question_options (id,question_id,option_text,display_order) VALUES (?,?,?,?)',[crypto.randomUUID(),id,q.options[j],j+1]);addedOptions++}
     }
    }else if(existing.length===0&&Number(answered.total)>0){throw Error(`Khảo sát ${survey.title} có lượt trả lời nhưng không có câu hỏi. Không tự sửa lịch sử.`)}
   }
   const [[counts]]=await connection.execute('SELECT (SELECT COUNT(*) FROM survey_questions WHERE survey_id=?) questions,(SELECT COUNT(*) FROM question_options o JOIN survey_questions q ON q.id=o.question_id WHERE q.survey_id=?) options',[survey.id,survey.id]);
   changes.push({...survey,questions:Number(counts.questions),options:Number(counts.options),responses:Number(answered.total),addedQuestions,addedOptions,created});
  }
  if(apply)await connection.commit();else await connection.rollback();
  return changes;
 }catch(e){await connection.rollback();throw e}
}
async function main(){const connection=await mysql.createConnection({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD,database:process.env.DB_NAME||'backline_crm'});try{const apply=process.argv.includes('--apply');console.log(apply?'Đồng bộ nội dung khảo sát thật vào DB:':'Kiểm tra khảo sát trong DB (chỉ đọc):');console.log(JSON.stringify(await synchronize(connection,apply),null,2))}finally{await connection.end()}}
if(require.main===module)main().catch(e=>{console.error(e.code||e.message);process.exitCode=1});
module.exports={synchronize};
