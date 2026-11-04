module.exports=async({check,GET,POST,SQL,manager})=>{
 const assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');let eligible,otherAge,otherInterest;
 const [[clock]]=await SQL("SELECT DATE_FORMAT(CURDATE(),'%Y-%m-%d') today");
 const birth=(years,delta=0)=>{const d=new Date(clock.today+'T12:00:00Z');d.setUTCFullYear(d.getUTCFullYear()-years);d.setUTCDate(d.getUTCDate()+delta);return d.toISOString().slice(0,10)};
 const prefix='recipient-filter-'+randomUUID(),fixtures=[
  {birth:birth(15),interests:['gaming','office'],yes:true},
  {birth:birth(15,1),interests:['gaming'],yes:false},
  {birth:birth(20),interests:['design','learning'],yes:true},
  {birth:birth(21,1),interests:['office','gaming'],yes:true},
  {birth:birth(21),interests:['design'],yes:false},
  {birth:birth(17),interests:['office','learning'],yes:false},
  {birth:null,interests:['gaming'],yes:false}
 ];
 const audience={mode:'FILTER',filters:{need:'Gaming',interests:['gaming','design'],minAge:15,maxAge:20}};
 const body={title:'Nghiệm thu lọc sở thích tuổi',description:'Cách ly',status:'OPEN',questions:[{text:'Ý kiến',type:'TEXT',required:false}]};
 await check('Lọc người nhận','FILTER01','Tạo dữ liệu mốc sinh nhật và sở thích nhiều giá trị độc lập',async()=>{
  for(const [i,f]of fixtures.entries()){
   f.id=randomUUID();await SQL("INSERT INTO users(id,email,password_hash,full_name,phone,need,birth_date) VALUES (?,?,'unused',?,?,'Gaming',?)",[f.id,prefix+i+'@example.invalid','Recipient boundary '+i,'0907766'+String(i).padStart(3,'0'),f.birth]);
   for(const interest of f.interests)await SQL('INSERT INTO customer_interests(customer_id,interest_id) VALUES (?,?)',[f.id,interest]);
  }
  eligible=fixtures.filter(f=>f.yes).map(f=>f.id);otherAge=fixtures[1].id;otherInterest=fixtures[5].id;
 });
 await check('Lọc người nhận','FILTER02','Danh sách tuổi 15–20 khớp các mốc 15/20/21 và khách có ít nhất một sở thích',async()=>{
  const data=(await POST('/api/admin/surveys/recipients-preview',{audience},manager)).data;
  assert.deepEqual(data.customers.filter(u=>fixtures.some(f=>f.id===u.id)).map(u=>u.id).sort(),eligible.slice().sort());
  assert.ok(data.customers.every(u=>u.age>=15&&u.age<=20&&u.interests.some(id=>['gaming','design'].includes(id))));
  assert.equal(data.asOf,clock.today);
 });
 await check('Lọc người nhận','FILTER03','Phiếu gửi theo bộ lọc ghi đúng tập người nhận đã xem',async()=>{
  const expected=(await POST('/api/admin/surveys/recipients-preview',{audience},manager)).data.customers.map(u=>u.id).sort();
  const id=(await POST('/api/admin/surveys',{...body,audience},manager,201)).data.id;
  const [rows]=await SQL('SELECT customer_id FROM survey_recipients WHERE survey_id=?',[id]);assert.deepEqual(rows.map(u=>u.customer_id).sort(),expected);
 });
 await check('Lọc người nhận','FILTER04','Chọn từng khách vẫn chặn người ngoài tuổi/sở thích; ALL không âm thầm bỏ bộ lọc',async()=>{
  for(const invalid of [otherAge,otherInterest])await POST('/api/admin/surveys',{...body,audience:{...audience,mode:'SELECTED',customerIds:[eligible[0],invalid]}},manager,400);
  await POST('/api/admin/surveys',{...body,audience:{...audience,mode:'ALL'}},manager,400);
  const id=(await POST('/api/admin/surveys',{...body,audience:{...audience,mode:'SELECTED',customerIds:[eligible[0]]}},manager,201)).data.id;
  const [rows]=await SQL('SELECT customer_id FROM survey_recipients WHERE survey_id=?',[id]);assert.deepEqual(rows.map(u=>u.customer_id),[eligible[0]]);
  await POST('/api/admin/surveys/recipients-preview',{audience:{mode:'FILTER',filters:{minAge:20,maxAge:15}}},manager,400);
 });
};
