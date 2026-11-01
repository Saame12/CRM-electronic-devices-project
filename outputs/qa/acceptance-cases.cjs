module.exports=async function({check,req,GET,POST,PATCH,SQL,manager,admin,fresh,customer,profile,ROOT}){
 const assert=require('node:assert/strict');
 const base={title:'Nghiệm thu đối tượng',description:'Cách ly',status:'OPEN',questions:[{text:'Một',type:'ONE',options:'A\nB',required:true}]};
 let selected,createdId;
 await check('Nghiệm thu','BB01','Lưu hai sở thích, chống trùng, đọc lại đúng',async()=>{
  await req('/api/me','PUT',{...profile,interests:['gaming','design','gaming']},fresh);
  const u=(await GET('/api/me',fresh)).data.user;assert.deepEqual(u.interests,['design','gaming']);
  const [[n]]=await SQL('SELECT COUNT(*) total FROM customer_interests WHERE customer_id=?',[fresh.user.id]);assert.equal(n.total,2);
  await req('/api/me','PUT',{...profile,interests:['invalid']},fresh,400);assert.deepEqual((await GET('/api/me',fresh)).data.user.interests,u.interests);
 });
 await check('Nghiệm thu','BB01','Bộ lọc và báo cáo sở thích khớp SQL',async()=>{
  const users=(await GET('/api/admin/customers?interest=gaming',manager)).data.customers;assert.ok(users.some(x=>x.id===fresh.user.id));assert.ok(users.every(x=>x.interests.includes('gaming')));
  const r=(await GET('/api/admin/reports/overview',manager)).data;
  const [[n]]=await SQL("SELECT COUNT(DISTINCT customer_id) total FROM customer_interests WHERE interest_id='gaming'");assert.equal(r.customers.byInterest.find(x=>x.label==='Gaming').total,n.total);
 });
 await check('Nghiệm thu','CL03','Quản lý tạo khách với ngày sinh và giới tính; đăng nhập đọc đúng',async()=>{
  const b={name:'Khách nghiệm thu',phone:'0908811223',email:'acceptance@example.invalid',password:'Accept@123',birthDate:'2001-11-02',gender:'Nữ',need:'Gaming',interests:['learning','programming']};
  createdId=(await POST('/api/admin/customers',b,manager,201)).data.id;
  const detail=(await GET('/api/admin/customers/'+createdId,manager)).data.customer;assert.equal(detail.birthDate,b.birthDate);assert.equal(detail.year,2001);assert.equal(detail.gender,b.gender);assert.deepEqual(detail.interests,['learning','programming']);
  const login=(await POST('/api/auth/login',{email:b.email,password:b.password})).data.user;assert.equal(login.birthDate,b.birthDate);assert.deepEqual(login.interests,detail.interests);
  await POST('/api/admin/customers',{...b,email:'invalid-date@example.invalid',phone:'0908811224',birthDate:'2999-01-01'},manager,400);
 });
 await check('Nghiệm thu','BB02','Tạo OPEN chọn từng khách chốt người nhận trong cùng transaction',async()=>{
  selected=(await POST('/api/admin/surveys',{...base,audience:{mode:'SELECTED',customerIds:[fresh.user.id]}},manager,201)).data.id;
  const [rows]=await SQL('SELECT customer_id FROM survey_recipients WHERE survey_id=?',[selected]);assert.deepEqual(rows.map(x=>x.customer_id),[fresh.user.id]);
  assert.ok((await GET('/api/surveys',fresh)).data.surveys.some(x=>x.id===selected));assert.ok(!(await GET('/api/surveys',customer)).data.surveys.some(x=>x.id===selected));
  await POST('/api/surveys/'+selected+'/responses',{answers:{q0:'A'}},customer,403);
 });
 await check('Nghiệm thu','CL01','Đáp án lỗi không để lại response hoặc detail',async()=>{
  await POST('/api/surveys/'+selected+'/responses',{answers:{q0:['A','B']}},fresh,400);
  const [[n]]=await SQL('SELECT COUNT(*) total FROM survey_responses WHERE survey_id=?',[selected]);assert.equal(n.total,0);
  await POST('/api/surveys/'+selected+'/responses',{answers:{q0:'A'}},fresh,201);
 });
 await check('Nghiệm thu','BB02','Gửi lại cộng dồn không trùng; báo cáo mẫu số đúng snapshot',async()=>{
  const audience={mode:'SELECTED',customerIds:[fresh.user.id,customer.user.id]};
  for(let i=0;i<2;i++)await POST('/api/admin/surveys/'+selected+'/send',{audience},manager);
  const [[n]]=await SQL('SELECT COUNT(*) total FROM survey_recipients WHERE survey_id=?',[selected]);assert.equal(n.total,2);
  const r=(await GET('/api/admin/reports/overview',manager)).data.surveys.items.find(x=>x.id===selected);assert.equal(r.recipients,2);assert.equal(r.completionRate,50);
 });
 await check('Nghiệm thu','BB02','Từ chối khách sai vai trò, khóa, trùng hoặc không tồn tại; rollback phiếu',async()=>{
  await PATCH('/api/admin/customers/'+createdId+'/status',{status:'LOCKED'},manager);
  for(const ids of [[createdId],[admin.user.id],['missing'],[fresh.user.id,fresh.user.id]]){
   const [[before]]=await SQL('SELECT COUNT(*) n FROM surveys');
   await POST('/api/admin/surveys',{...base,audience:{mode:'SELECTED',customerIds:ids}},manager,400);
   const [[after]]=await SQL('SELECT COUNT(*) n FROM surveys');assert.equal(after.n,before.n);
  }
  await PATCH('/api/admin/customers/'+createdId+'/status',{status:'ACTIVE'},manager);
 });
 await check('Nghiệm thu','BB02','Xem trước bộ lọc nhu cầu, tuổi, sở thích; mở qua PATCH cùng publisher',async()=>{
  const audience={mode:'FILTER',filters:{interest:'gaming',need:profile.need,minAge:18,maxAge:100}};
  const preview=(await POST('/api/admin/surveys/recipients-preview',{audience},manager)).data;assert.ok(preview.customers.some(x=>x.id===fresh.user.id));
  const id=(await POST('/api/admin/surveys',{...base,status:'DRAFT'},manager,201)).data.id;
  await PATCH('/api/admin/surveys/'+id,{...base,audience},manager);
  const [rows]=await SQL('SELECT customer_id FROM survey_recipients WHERE survey_id=?',[id]);assert.deepEqual(rows.map(x=>x.customer_id).sort(),preview.customers.map(x=>x.id).sort());
  await req('/api/me','PUT',{...profile,interests:['office']},fresh);assert.ok((await GET('/api/surveys',fresh)).data.surveys.some(x=>x.id===id));
 });
 await check('Nghiệm thu','CL01','Đóng và nộp đồng thời: chỉ chấp nhận thứ tự giao dịch hợp lệ',async()=>{
  for(let i=0;i<5;i++){
   const id=(await POST('/api/admin/surveys',{...base,audience:{mode:'SELECTED',customerIds:[fresh.user.id]}},manager,201)).data.id;
   const responses=await Promise.all([POST('/api/admin/surveys/'+id+'/close',{},manager),POST('/api/surveys/'+id+'/responses',{answers:{q0:'A'}},fresh,null)]);
   assert.ok([201,404].includes(responses[1].status));
   const [[n]]=await SQL('SELECT COUNT(*) n FROM survey_responses WHERE survey_id=?',[id]);assert.equal(n.n,responses[1].status===201?1:0);
   await POST('/api/surveys/'+id+'/responses',{answers:{q0:'A'}},fresh,404);
  }
 });
 await check('Nghiệm thu','TC01','Lịch sử phân trang đủ sự kiện, đúng quyền, không lộ dữ liệu khôi phục',async()=>{
  const id=fresh.user.id,a=(await GET('/api/admin/customers/'+id+'/history?pageSize=2',manager)).data;
  assert.equal(a.events.length,2);assert.ok(a.total>2);
  const all=[];for(let p=1;p<=Math.ceil(a.total/2);p++)all.push(...(await GET('/api/admin/customers/'+id+'/history?pageSize=2&page='+p,manager)).data.events);
  for(const kind of ['PROFILE_CREATED','FEEDBACK_SENT','FEEDBACK_REPLIED','SURVEY_SUBMITTED'])assert.ok(all.some(x=>x.kind===kind));
  assert.equal(new Set(all.map(x=>x.id+x.kind)).size,a.total);assert.ok(!/token|password|recovery|verification/i.test(JSON.stringify(all)));
  for(const actor of [admin,customer])await GET('/api/admin/customers/'+id+'/history',actor,403);
  await GET('/api/admin/customers/'+id+'/history?pageSize=51',manager,400);await GET('/api/admin/customers/missing/history',manager,404);
 });
};
