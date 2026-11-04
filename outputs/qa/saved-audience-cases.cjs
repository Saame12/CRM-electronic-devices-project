module.exports=async({check,GET,POST,PATCH,SQL,manager,fresh,customer})=>{
 const assert=require('node:assert/strict');const body={title:'Phạm vi lưu trước khi mở',description:'Nghiệm thu',status:'DRAFT',questions:[{text:'Ý kiến',type:'TEXT',required:false}]};let draft;
 const scope={mode:'SELECTED',filters:{},customerIds:[fresh.user.id]};
 await check('Phạm vi bắt buộc','SCOPE01','Tạo OPEN thiếu/sai phạm vi bị chặn trước khi lưu phiếu',async()=>{
  const [[before]]=await SQL('SELECT COUNT(*) n FROM surveys');
  for(const audience of [undefined,null,{mode:''},{mode:'FILTER'},{mode:'SELECTED',customerIds:[]}])await POST('/api/admin/surveys',{...body,status:'OPEN',audience},manager,400);
  const [[after]]=await SQL('SELECT COUNT(*) n FROM surveys');assert.equal(after.n,before.n);
 });
 await check('Phạm vi bắt buộc','SCOPE02','Bản nháp lưu và đọc lại phạm vi; chỉ mở bằng cấu hình đã lưu',async()=>{
  draft=(await POST('/api/admin/surveys',{...body,audience:scope},manager,201)).data.id;
  assert.deepEqual((await GET('/api/admin/surveys/'+draft,manager)).data.survey.audience_config,scope);
  await POST('/api/admin/surveys/'+draft+'/send',{audience:{mode:'ALL'}},manager,409);
  await POST('/api/admin/surveys/'+draft+'/send',{},manager);
  const [rows]=await SQL('SELECT customer_id FROM survey_recipients WHERE survey_id=?',[draft]);assert.deepEqual(rows.map(x=>x.customer_id),[fresh.user.id]);
  await POST('/api/admin/surveys/'+draft+'/send',{},manager,409);
  await POST('/api/admin/surveys/'+draft+'/send',{audience:{mode:'ALL'}},manager,409);
 });
 await check('Phạm vi bắt buộc','SCOPE03','Nháp chưa chọn phạm vi không mở được qua send hoặc PATCH; sửa nháp rồi mới mở',async()=>{
  const id=(await POST('/api/admin/surveys',body,manager,201)).data.id;
  await POST('/api/admin/surveys/'+id+'/send',{},manager,400);
  await PATCH('/api/admin/surveys/'+id,{...body,status:'OPEN'},manager,400);
  assert.equal((await GET('/api/admin/surveys/'+id,manager)).data.survey.status,'DRAFT');
  await PATCH('/api/admin/surveys/'+id,{...body,audience:scope},manager);
  await POST('/api/admin/surveys/'+id+'/send',{},manager);
 });
 await check('Phạm vi bắt buộc','SCOPE04','OPEN cũ thiếu phạm vi được thiết lập một lần; giữ người nhận trước đây',async()=>{
  const id=(await POST('/api/admin/surveys',body,manager,201)).data.id;
  await SQL("UPDATE surveys SET status='OPEN' WHERE id=?",[id]);
  await SQL('INSERT INTO survey_recipients(survey_id,customer_id) VALUES (?,?)',[id,fresh.user.id]);
  await POST('/api/admin/surveys/'+id+'/send',{},manager,400);
  const legacyScope={mode:'SELECTED',filters:{},customerIds:[customer.user.id]};
  await POST('/api/admin/surveys/'+id+'/send',{audience:legacyScope},manager);
  await POST('/api/admin/surveys/'+id+'/send',{audience:{mode:'ALL'}},manager,409);
  assert.deepEqual((await GET('/api/admin/surveys/'+id,manager)).data.survey.audience_config,{...legacyScope,preserveLegacyRecipients:true});
  const [rows]=await SQL('SELECT customer_id FROM survey_recipients WHERE survey_id=?',[id]);assert.deepEqual(rows.map(x=>x.customer_id).sort(),[fresh.user.id,customer.user.id].sort());
 });
 await check('Phạm vi bắt buộc','SCOPE05','Về DRAFT sửa phạm vi rồi mở lại thay đúng snapshot khi chưa có câu trả lời',async()=>{
  await PATCH('/api/admin/surveys/'+draft,{status:'DRAFT'},manager);
  const changed={mode:'SELECTED',filters:{},customerIds:[customer.user.id]};
  await PATCH('/api/admin/surveys/'+draft,{...body,status:'OPEN',audience:changed},manager);
  const [rows]=await SQL('SELECT customer_id FROM survey_recipients WHERE survey_id=?',[draft]);assert.deepEqual(rows.map(x=>x.customer_id),[customer.user.id]);
  assert.ok(!(await GET('/api/surveys',fresh)).data.surveys.some(x=>x.id===draft));
 });
 await check('Phạm vi bắt buộc','SCOPE06','Sao chép không giữ phạm vi và không tự mở; hai lần mở đồng thời chỉ một lần thành công',async()=>{
  const copy=(await POST('/api/admin/surveys/'+draft+'/copy',{},manager,201)).data.id;
  assert.equal((await GET('/api/admin/surveys/'+copy,manager)).data.survey.audience_config,null);
  await POST('/api/admin/surveys/'+copy+'/send',{},manager,400);
  const id=(await POST('/api/admin/surveys',{...body,audience:scope},manager,201)).data.id;
  const results=await Promise.all([POST('/api/admin/surveys/'+id+'/send',{},manager,null),POST('/api/admin/surveys/'+id+'/send',{},manager,null)]);
  assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);const [[n]]=await SQL('SELECT COUNT(*) n FROM survey_recipients WHERE survey_id=?',[id]);assert.equal(n.n,1);
 });
};
