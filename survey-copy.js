const crypto=require('node:crypto');
async function copySurvey(db,sourceId,creatorId){
 const connection=await db.getConnection();
 try{
  await connection.beginTransaction();
  const [[source]]=await connection.execute('SELECT id,title,description FROM surveys WHERE id=? FOR UPDATE',[sourceId]);
  if(!source){const error=Error('Không tìm thấy khảo sát cần sao chép.');error.status=404;throw error}
  const [questions]=await connection.execute('SELECT id,question_text,question_type,is_required,display_order FROM survey_questions WHERE survey_id=? ORDER BY display_order',[sourceId]);
  if(!questions.length){const error=Error('Khảo sát gốc chưa có câu hỏi, không thể lập khảo sát từ nội dung trống.');error.status=409;throw error}
  const id=crypto.randomUUID(),survey={id,title:Array.from(source.title).slice(0,168).join('')+' (bản sao)',description:source.description,status:'DRAFT',due_date:null,created_by:creatorId,response_count:0},copied=[];
  await connection.execute("INSERT INTO surveys (id,title,description,due_date,status,created_by) VALUES (?,?,?,NULL,'DRAFT',?)",[id,survey.title,survey.description,creatorId]);
  for(const [index,question] of questions.entries()){
   const qid=crypto.randomUUID();
   await connection.execute('INSERT INTO survey_questions (id,survey_id,question_text,question_type,is_required,display_order) VALUES (?,?,?,?,?,?)',[qid,id,question.question_text,question.question_type,Boolean(question.is_required),index+1]);
   const [options]=await connection.execute('SELECT option_text,display_order FROM question_options WHERE question_id=? ORDER BY display_order',[question.id]);
   for(const [optionIndex,option] of options.entries())await connection.execute('INSERT INTO question_options (id,question_id,option_text,display_order) VALUES (?,?,?,?)',[crypto.randomUUID(),qid,option.option_text,optionIndex+1]);
   copied.push({...question,id:qid,survey_id:id,display_order:index+1,options:options.map(o=>o.option_text)});
  }
  await connection.commit();return {id,survey,questions:copied};
 }catch(error){await connection.rollback();throw error}finally{connection.release()}
}
function register(app,db,auth,staff,wrap){
 app.post('/api/admin/surveys/:id/copy',auth,staff,wrap(async(req,res)=>{
  try{const result=await copySurvey(db,req.params.id,req.user.id);res.status(201).json({...result,message:'Đã lập khảo sát mới ở trạng thái DRAFT. Vui lòng kiểm tra nội dung và đặt hạn trước khi mở.'})}
  catch(error){if(error.status)return res.status(error.status).json({error:error.message});throw error}
 }));
}
module.exports={copySurvey,register};
