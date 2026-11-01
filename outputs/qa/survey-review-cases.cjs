module.exports=async({check,GET,POST,PATCH,req,SQL,manager,admin,fresh,customer})=>{
 const assert=require('node:assert/strict');let id;
 const body={title:'Xem bài đã gửi',description:'Nghiệm thu chỉ đọc',status:'OPEN',audience:{mode:'SELECTED',customerIds:[fresh.user.id]},questions:[
  {text:'Chọn một',type:'ONE',required:true,options:'A\nB'},
  {text:'Chọn nhiều',type:'MULTI',required:true,options:'X\nY'},
  {text:'Văn bản',type:'TEXT',required:true},{text:'Số sao',type:'RATING',required:true},{text:'Tùy chọn',type:'TEXT',required:false}
 ]};
 await check('Xem bài đã gửi','KH01','Khách đọc đúng bốn loại đáp án và câu bỏ trống khi phiếu đang OPEN',async()=>{
  id=(await POST('/api/admin/surveys',body,manager,201)).data.id;
  await POST('/api/surveys/'+id+'/responses',{answers:{q0:'A',q1:['X','Y'],q2:'Nội dung riêng <script>',q3:4}},fresh,201);
  const r=await GET('/api/surveys/'+id+'/my-response',fresh);assert.equal(r.headers.get('cache-control'),'no-store');assert.deepEqual(r.data.questions.map(q=>q.answers),[['A'],['X','Y'],['Nội dung riêng <script>'],[4],[]]);
  assert.ok(!/customer_id|password|token|email/.test(JSON.stringify(r.data)));
 });
 await check('Xem bài đã gửi','KH02','Sau khi CLOSED và ẩn phía Quản lý, chủ bài vẫn thấy và đọc được bài',async()=>{
  await POST('/api/admin/surveys/'+id+'/close',{},manager);await PATCH('/api/admin/surveys/'+id+'/visibility',{hidden:true},manager);
  assert.ok((await GET('/api/surveys',fresh)).data.surveys.some(s=>s.id===id&&s.status==='CLOSED'));
  const r=await GET('/api/surveys/'+id+'/my-response',fresh);assert.equal(r.data.survey.status,'CLOSED');assert.equal(r.data.questions[2].answers[0],'Nội dung riêng <script>');
  await SQL('DELETE FROM survey_recipients WHERE survey_id=? AND customer_id=?',[id,fresh.user.id]);
  assert.ok((await GET('/api/surveys',fresh)).data.surveys.some(s=>s.id===id));await GET('/api/surveys/'+id+'/my-response',fresh);
 });
 await check('Xem bài đã gửi','KH03','Chặn xem bài người khác, giả mạo ID và truy cập bằng tài khoản nhân viên',async()=>{
  await GET('/api/surveys/'+id+'/my-response',undefined,401);for(const actor of [admin,manager])await GET('/api/surveys/'+id+'/my-response',actor,403);
  await GET('/api/surveys/'+id+'/my-response?customerId='+fresh.user.id,customer,404);await GET('/api/surveys/missing/my-response',fresh,404);
  assert.ok(!(await GET('/api/surveys',customer)).data.surveys.some(s=>s.id===id));
 });
 await check('Xem bài đã gửi','KH04','Xem chỉ đọc không ghi DB; không có API sửa bài hoặc cho nộp lại',async()=>{
  const [[before]]=await SQL('SELECT COUNT(*) n FROM response_details d JOIN survey_responses r ON r.id=d.response_id WHERE r.survey_id=?',[id]);
  for(let i=0;i<2;i++)await GET('/api/surveys/'+id+'/my-response',fresh);
  await req('/api/surveys/'+id+'/my-response','PATCH',{answers:{q0:'B'}},fresh,404);await POST('/api/surveys/'+id+'/responses',{answers:{q0:'B'}},fresh,404);
  const [[after]]=await SQL('SELECT COUNT(*) n FROM response_details d JOIN survey_responses r ON r.id=d.response_id WHERE r.survey_id=?',[id]);assert.equal(after.n,before.n);
 });
};
