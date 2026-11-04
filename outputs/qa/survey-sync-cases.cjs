module.exports=async({check,GET,POST,req,SQL,manager,admin,fresh})=>{
 const assert=require('node:assert/strict');const body={title:'Đồng bộ khách mới',description:'Nghiệm thu phạm vi gửi',status:'OPEN',questions:[{text:'Ý kiến',type:'TEXT',required:false}]};
 let all,selected,filtered,closed,expired,newCustomer;
 await check('Đồng bộ khách mới','SYNC01','Lưu phân biệt gửi tất cả và phiếu chọn nhóm/từng khách',async()=>{
  all=(await POST('/api/admin/surveys',{...body,audience:{mode:'ALL'}},manager,201)).data.id;
  selected=(await POST('/api/admin/surveys',{...body,audience:{mode:'SELECTED',customerIds:[fresh.user.id]}},manager,201)).data.id;
  filtered=(await POST('/api/admin/surveys',{...body,audience:{mode:'FILTER',filters:{minAge:0,maxAge:120}}},manager,201)).data.id;
  closed=(await POST('/api/admin/surveys',{...body,audience:{mode:'ALL'}},manager,201)).data.id;await POST('/api/admin/surveys/'+closed+'/close',{},manager);
  expired=(await POST('/api/admin/surveys',{...body,dueDate:'2000-01-01',audience:{mode:'ALL'}},manager,201)).data.id;
  const [rows]=await SQL('SELECT id,accept_new_customers FROM surveys WHERE id IN (?,?,?)',[all,selected,filtered]);assert.equal(Number(rows.find(x=>x.id===all).accept_new_customers),1);assert.ok(rows.filter(x=>x.id!==all).every(x=>!x.accept_new_customers));
 });
 await check('Đồng bộ khách mới','SYNC02','Đăng ký sau thời điểm gửi tự thấy phiếu tất cả; không lọt vào nhóm riêng, phiếu đóng/hết hạn',async()=>{
  const r=await POST('/api/auth/register',{name:'Khách đăng ký sau',email:'syncnew@example.invalid',phone:'0908899771',password:'SyncTest@123',birthDate:'2000-01-02',gender:'Khác'},null,201);newCustomer={token:r.data.token,user:r.data.user};
  const ids=(await GET('/api/surveys',newCustomer)).data.surveys.map(s=>s.id);assert.ok(ids.includes(all));for(const id of [selected,filtered,closed,expired])assert.ok(!ids.includes(id));
  await POST('/api/surveys/'+selected+'/responses',{answers:{}},newCustomer,403);
 });
 await check('Đồng bộ khách mới','SYNC03','Hoàn thiện hồ sơ và đồng bộ lặp không tạo trùng; có thể nộp phiếu đã nhận',async()=>{
  await req('/api/me','PUT',{name:'Khách đăng ký sau',phone:'0908899771',birthDate:'2000-01-02',gender:'Khác',addr:'Dữ liệu thử',need:'Gaming'},newCustomer);
  for(let i=0;i<2;i++)await POST('/api/surveys/sync',{},newCustomer);
  const [[n]]=await SQL('SELECT COUNT(*) n FROM survey_recipients WHERE survey_id=? AND customer_id=?',[all,newCustomer.user.id]);assert.equal(n.n,1);
  await POST('/api/surveys/'+all+'/responses',{answers:{}},newCustomer,201);
  const r=(await GET('/api/admin/reports/overview',manager)).data.surveys.items.find(s=>s.id===all);const [[actual]]=await SQL('SELECT COUNT(*) n FROM survey_recipients WHERE survey_id=?',[all]);assert.equal(r.recipients,actual.n);
 });
 await check('Đồng bộ khách mới','SYNC04','Khách bị bỏ sót được đồng bộ khi tải trang; từ chối tài khoản sai vai trò',async()=>{
  await SQL('DELETE FROM survey_recipients WHERE survey_id=? AND customer_id=?',[all,newCustomer.user.id]);
  const r=await POST('/api/surveys/sync',{customerId:fresh.user.id},newCustomer);assert.ok(r.data.added>=1);
  const [[n]]=await SQL('SELECT COUNT(*) n FROM survey_recipients WHERE survey_id=? AND customer_id=?',[all,newCustomer.user.id]);assert.equal(n.n,1);
  await POST('/api/surveys/sync',{},null,401);for(const actor of [admin,manager])await POST('/api/surveys/sync',{},actor,403);
 });
 await check('Đồng bộ khách mới','SYNC05','Phiếu mới đã mở không được thay phạm vi hoặc tắt nhận khách mới bằng gửi lại',async()=>{
  await POST('/api/admin/surveys/'+all+'/send',{audience:{mode:'SELECTED',customerIds:[fresh.user.id]}},manager,409);
  const [[s]]=await SQL('SELECT accept_new_customers FROM surveys WHERE id=?',[all]);assert.equal(Number(s.accept_new_customers),1);
  const [[n]]=await SQL('SELECT COUNT(*) n FROM survey_recipients WHERE survey_id=? AND customer_id=?',[all,newCustomer.user.id]);assert.equal(n.n,1);
 });
};
