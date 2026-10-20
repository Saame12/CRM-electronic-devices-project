const percent = (n, total) => total ? Math.round(n * 1000 / total) / 10 : null;
const average = values => values.length ? Math.round(values.reduce((a,b)=>a+b,0) / values.length * 10) / 10 : null;
const day = value => value instanceof Date ? new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(value) : String(value || '').slice(0,10);
function range(query) {
  const from=String(query.from||''),to=String(query.to||'');
  const valid=s=> /^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
  if ((from&&!valid(from))||(to&&!valid(to))||(from&&to&&from>to)) throw new Error('Khoảng ngày không hợp lệ. Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.');
  return {from,to};
}
function distribution(rows, getLabel, labels=[]) {
  const counts=new Map(labels.map(x=>[x,0]));
  for(const row of rows){const label=getLabel(row);counts.set(label,(counts.get(label)||0)+1)}
  return [...counts].map(([label,total])=>({label,total,percentage:percent(total,rows.length)}));
}
function buildOverview(customers, feedback, surveys, now=new Date()) {
  const year=Number(day(now).slice(0,4));
  const validBirth=u=>Number.isInteger(Number(u.birth_year))&&u.birth_year!==null&&Number(u.birth_year)>=year-120&&Number(u.birth_year)<=year;
  const complete=u=>Boolean(String(u.address||'').trim()&&validBirth(u)&&u.gender&&u.need&&u.need!=='Chưa xác định');
  const customer={total:customers.length,active:customers.filter(x=>x.account_status==='ACTIVE').length,locked:customers.filter(x=>x.account_status==='LOCKED').length,complete:customers.filter(complete).length};
  customer.completionRate=percent(customer.complete,customer.total);
  customer.byAge=distribution(customers,u=>!validBirth(u)?'Chưa có năm sinh hợp lệ':year-u.birth_year<18?'Dưới 18':year-u.birth_year<25?'18–24':year-u.birth_year<35?'25–34':year-u.birth_year<45?'35–44':'Từ 45 trở lên',['Dưới 18','18–24','25–34','35–44','Từ 45 trở lên','Chưa có năm sinh hợp lệ']);
  customer.byGender=distribution(customers,u=>u.gender||'Chưa khai báo',['Nam','Nữ','Khác','Chưa khai báo']);
  customer.byNeed=distribution(customers,u=>u.need||'Chưa xác định').sort((a,b)=>b.total-a.total);
  const ratings=feedback.map(x=>Number(x.rating)).filter(x=>Number.isInteger(x)&&x>=1&&x<=5);
  const f={total:feedback.length,respondents:new Set(feedback.map(x=>x.customer_id)).size,resolved:feedback.filter(x=>x.status==='RESOLVED').length,hidden:feedback.filter(x=>Boolean(x.is_hidden)).length,complaints:feedback.filter(x=>x.feedback_type==='Báo lỗi / Khiếu nại').length,averageRating:average(ratings),rated:ratings.length};
  f.pending=f.total-f.resolved;f.resolutionRate=percent(f.resolved,f.total);f.satisfactionRate=percent(ratings.filter(x=>x>=4).length,ratings.length);f.complaintRate=percent(f.complaints,f.total);
  f.byStatus=distribution(feedback,x=>x.status,['NEW','IN_PROGRESS','RESOLVED']);f.byType=distribution(feedback,x=>x.feedback_type);f.byRating=distribution(ratings,x=>String(x),['5','4','3','2','1']);
  const productGroups=new Map();for(const item of feedback){if(!productGroups.has(item.product_id))productGroups.set(item.product_id,[]);productGroups.get(item.product_id).push(item)}
  f.byProduct=[...productGroups].map(([id,items])=>({id,name:items[0].product_name,total:items.length,share:percent(items.length,f.total),averageRating:average(items.map(x=>Number(x.rating)).filter(x=>x>=1&&x<=5)),complaints:items.filter(x=>x.feedback_type==='Báo lỗi / Khiếu nại').length,pending:items.filter(x=>x.status!=='RESOLVED').length})).sort((a,b)=>b.total-a.total);
  const months=new Map();for(const item of customers){const m=day(item.created_at).slice(0,7);if(!months.has(m))months.set(m,{month:m,customers:0,feedback:0});months.get(m).customers++}for(const item of feedback){const m=day(item.created_at).slice(0,7);if(!months.has(m))months.set(m,{month:m,customers:0,feedback:0});months.get(m).feedback++}
  const surveyItems=surveys.map(s=>{const recipients=Number(s.recipients),responses=Number(s.responses),matched=Number(s.matched_responses);return {...s,recipients,responses,matchedResponses:matched,outsideResponses:responses-matched,notAnswered:recipients-matched,completionRate:percent(matched,recipients),effectiveStatus:s.status==='OPEN'&&s.due_day&&s.due_day<day(now)?'EXPIRED':s.status}});
  return {customers:customer,feedback:f,trend:[...months.values()].sort((a,b)=>a.month.localeCompare(b.month)),surveys:{total:surveyItems.length,responses:surveyItems.reduce((n,s)=>n+s.responses,0),byStatus:distribution(surveyItems,s=>s.effectiveStatus,['DRAFT','OPEN','EXPIRED','CLOSED']),items:surveyItems}};
}
function aggregateQuestion(question, options, details, responseTotal) {
  details=details.filter(d=>question.question_type==='TEXT'?Boolean(String(d.text_answer||'').trim()):question.question_type==='RATING'?Number.isInteger(Number(d.rating_value))&&Number(d.rating_value)>=1&&Number(d.rating_value)<=5:options.some(o=>o.id===d.option_id));
  const answered=new Set(details.map(x=>x.response_id)).size;
  const result={id:question.id,text:question.question_text,type:question.question_type,required:Boolean(question.is_required),answered,skipped:responseTotal-answered,options:[]};
  if(['ONE','MULTI'].includes(result.type))result.options=options.map(o=>{const count=new Set(details.filter(d=>d.option_id===o.id).map(d=>d.response_id)).size;return {label:o.option_text,total:count,percentage:percent(count,answered)}});
  if(result.type==='RATING'){const values=details.map(d=>Number(d.rating_value)).filter(x=>x>=1&&x<=5);result.averageRating=average(values);result.options=distribution(values,x=>String(x),['5','4','3','2','1']);}
  if(result.type==='TEXT'){result.textCount=details.length;result.texts=details.slice(0,100).map(d=>({text:d.text_answer,at:d.submitted_at}));}
  return result;
}
function registerReports(app,db,auth,staff,wrap) {
  app.get('/api/admin/reports/overview',auth,staff,wrap(async(req,res)=>{
    let filter;try{filter=range(req.query)}catch(e){return res.status(400).json({error:e.message})}
    const where=(column)=>`${filter.from?` AND ${column} >= ?`:''}${filter.to?` AND ${column} < DATE_ADD(?, INTERVAL 1 DAY)`:''}`;
    const params=[...(filter.from?[filter.from]:[]),...(filter.to?[filter.to]:[])];
    const connection=await db.getConnection();
    try{
      await connection.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');await connection.beginTransaction();
      const [[clock]]=await connection.query("SELECT DATE_FORMAT(CURDATE(),'%Y-%m-%d') today");
      const [customers]=await connection.execute("SELECT id,address,birth_year,gender,need,account_status,created_at FROM users WHERE role='CUSTOMER'"+where('created_at'),params);
      const [feedback]=await connection.execute('SELECT f.id,f.customer_id,f.product_id,f.rating,f.status,f.feedback_type,f.is_hidden,f.created_at,p.name product_name FROM feedback f JOIN products p ON p.id=f.product_id WHERE 1=1'+where('f.created_at'),params);
      const [surveys]=await connection.execute(`SELECT s.id,s.title,s.status,DATE_FORMAT(s.due_date,'%Y-%m-%d') due_day,s.created_at,(SELECT COUNT(*) FROM survey_recipients r WHERE r.survey_id=s.id) recipients,(SELECT COUNT(*) FROM survey_responses r WHERE r.survey_id=s.id) responses,(SELECT COUNT(*) FROM survey_responses r JOIN survey_recipients t ON t.survey_id=r.survey_id AND t.customer_id=r.customer_id WHERE r.survey_id=s.id) matched_responses FROM surveys s WHERE 1=1${where('s.created_at')} ORDER BY s.created_at DESC`,params);
      await connection.commit();res.json({...buildOverview(customers,feedback,surveys,new Date(clock.today+'T12:00:00+07:00')),filter,generatedAt:new Date().toISOString(),asOf:clock.today});
    }catch(e){await connection.rollback();throw e}finally{connection.release()}
  }));
  app.get('/api/admin/reports/survey-detail/:id',auth,staff,wrap(async(req,res)=>{
    const connection=await db.getConnection();try{
      await connection.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');await connection.beginTransaction();
      const [[survey]]=await connection.execute('SELECT id,title,status FROM surveys WHERE id=?',[req.params.id]);if(!survey){await connection.rollback();return res.status(404).json({error:'Không tìm thấy khảo sát.'})}
      const [responses]=await connection.execute('SELECT r.id,r.submitted_at,u.full_name,u.email FROM survey_responses r JOIN users u ON u.id=r.customer_id WHERE r.survey_id=? ORDER BY r.submitted_at DESC',[survey.id]);
      const [questions]=await connection.execute('SELECT * FROM survey_questions WHERE survey_id=? ORDER BY display_order',[survey.id]);
      const [options]=await connection.execute('SELECT o.* FROM question_options o JOIN survey_questions q ON q.id=o.question_id WHERE q.survey_id=? ORDER BY o.display_order',[survey.id]);
      const [details]=await connection.execute('SELECT d.*,r.submitted_at FROM response_details d JOIN survey_responses r ON r.id=d.response_id WHERE r.survey_id=? ORDER BY r.submitted_at DESC',[survey.id]);
      const respondents=responses.map(r=>({...r,answers:questions.map(q=>{const values=details.filter(d=>d.response_id===r.id&&d.question_id===q.id);return {question:q.question_text,answer:values.length?values.map(d=>q.question_type==='TEXT'?d.text_answer:q.question_type==='RATING'?`${d.rating_value} sao`:options.find(o=>o.id===d.option_id)?.option_text||'Lựa chọn không còn tồn tại').join('; '):'Không có câu trả lời được ghi nhận'}})}));
      await connection.commit();res.json({survey,responses:respondents,questions:questions.map(q=>aggregateQuestion(q,options.filter(o=>o.question_id===q.id),details.filter(d=>d.question_id===q.id),responses.length))});
    }catch(e){await connection.rollback();throw e}finally{connection.release()}
  }));
}
module.exports={registerReports,buildOverview,aggregateQuestion,range,percent};
