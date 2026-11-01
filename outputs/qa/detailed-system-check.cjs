// Kiểm thử HTTP và MySQL trên database riêng do chính phiên này tạo.
const path=require('node:path'),fs=require('node:fs'),crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'../..');
require(path.join(ROOT,'node_modules/dotenv')).config({path:path.join(ROOT,'.env'),quiet:true});
const mysql=require(path.join(ROOT,'node_modules/mysql2/promise'));
const bcrypt=require(path.join(ROOT,'node_modules/bcryptjs'));
const jwt=require(path.join(ROOT,'node_modules/jsonwebtoken'));
const {setupDatabase,connectionOptions}=require(path.join(ROOT,'scripts/setup-database'));
const {seedDemo}=require(path.join(ROOT,'scripts/seed-demo'));
const results=[];let c,owner,child,owned=false,base,qaDB;
const stamp=new Date().toISOString();
const secrets=[];
function clean(msg){let value=String(msg);for(const secret of secrets)if(secret)value=value.split(secret).join('[REDACTED]');return value.slice(0,1400)}
async function check(group,cn,name,fn,kind='functional'){
 const began=Date.now();try{const evidence=await fn();results.push({group,cn,name,kind,status:'PASS',evidence:evidence||'Đúng kết quả mong đợi',ms:Date.now()-began});}
 catch(e){results.push({group,cn,name,kind,status:'FAIL',evidence:clean(e.message),ms:Date.now()-began});}
}
async function req(url,method='GET',body,session,expected=200){
 const headers={'Content-Type':'application/json'};
 if(session?.token)headers.Authorization='Bearer '+session.token;
 if(session?.cookie)headers.Cookie=session.cookie;
 if(session?.recovery)headers['x-recovery-token']=session.recovery;
 const response=await fetch(new URL(url,base),{method,headers,body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(12000)});
 const text=await response.text();let data;try{data=JSON.parse(text)}catch{data={text:text.slice(0,160)}}
 if(expected!==null)assert.equal(response.status,expected,method+' '+url+': '+(data.error||''));
 return {status:response.status,data,headers:response.headers};
}
async function login(email,password,extra={}){const r=await req('/api/auth/login','POST',{email,password,...extra});secrets.push(r.data.token);return {token:r.data.token,cookie:r.headers.get('set-cookie')?.split(';')[0],user:r.data.user,headers:r.headers};}
const POST=(url,body,session,status=200)=>req(url,'POST',body,session,status);
const PATCH=(url,body,session,status=200)=>req(url,'PATCH',body,session,status);
const GET=(url,session,status=200)=>req(url,'GET',undefined,session,status);
const SQL=(sql,values=[])=>c.execute(sql,values);
let admin,manager,customer,fresh,reg,sv,closed,copy,feedbackId;
const validUser={name:'Khách kiểm thử cách ly',email:'qa.customer@example.invalid',phone:'0909988111',password:'QaOnly@123',birthDate:'1999-02-28',gender:'Khác',customerSession:true};
const questions=[{text:'Một lựa chọn',type:'ONE',required:true,options:'A\nB'},{text:'Nhiều lựa chọn',type:'MULTI',required:true,options:'X\nY\nZ'},{text:'Ý kiến',type:'TEXT',required:true},{text:'Mức hài lòng',type:'RATING',required:true}];
async function main(){
 owner=await mysql.createConnection({...connectionOptions(),multipleStatements:false});
 qaDB='crm_qa_'+crypto.randomBytes(8).toString('hex');assert.match(qaDB,/^crm_qa_[a-f0-9]{16}$/);
 await owner.query('CREATE DATABASE `'+qaDB+'` CHARACTER SET utf8mb4');owned=true;
 c=await setupDatabase(qaDB);await seedDemo(c,{hash:p=>bcrypt.hash(p,4)});
 const secret=crypto.randomBytes(48).toString('hex');secrets.push(secret);
 const net=require('node:net');const probe=net.createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));
 base='http://127.0.0.1:'+port;
 child=spawn(process.execPath,[path.join(ROOT,'server.mysql.js')],{cwd:ROOT,env:{...process.env,DB_NAME:qaDB,PORT:String(port),JWT_SECRET:secret},windowsHide:true,stdio:['ignore','pipe','pipe']});
 let startup='';child.stdout.on('data',b=>startup+=b);child.stderr.on('data',b=>startup+=b);
 let ready=false;for(let i=0;i<80;i++){try{const r=await fetch(base+'/api/health');if(r.ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,250));}
 assert.ok(ready,'Không khởi động được máy chủ kiểm thử: '+clean(startup));
 await check('Hạ tầng','','Kết nối Node và MySQL',async()=>{assert.equal((await GET('/api/health')).data.ok,true);return 'HTTP 200 và ok=true'});
 for(const url of ['/','/admin.html','/manager.html','/app.js','/reports.js'])await check('Hạ tầng','',`Tải tài nguyên ${url}`,async()=>{await GET(url)});
 for(const url of ['/.env','/server.mysql.js','/database/schema.sql','/node_modules/dotenv/package.json','/outputs/qa/detailed-system-check.cjs'])await check('Bảo vệ dữ liệu','',`Không công khai ${url}`,async()=>{await GET(url,null,404)});
 await check('Xác thực','CN02','Từ chối truy cập khi chưa đăng nhập',async()=>{await GET('/api/me',null,401)});
 await check('Xác thực','CN02','Từ chối JWT sai',async()=>{await GET('/api/me',{token:'invalid'},401)});
 await check('Xác thực','CN02','Từ chối JWT hết hạn',async()=>{await GET('/api/me',{token:jwt.sign({sub:'x'},secret,{expiresIn:-1})},401)});
 await check('Xác thực','CN02','Đăng nhập Admin',async()=>{admin=await login('admin@backline.vn','Admin@123',{staffPortal:'ADMIN'});assert.equal(admin.user.role,'ADMIN')});
 await check('Xác thực','CN02','Đăng nhập Quản lý',async()=>{manager=await login('manager@demo.vn','Manager@123',{staffPortal:'MANAGER'});assert.equal(manager.user.role,'MANAGER')});
 await check('Xác thực','CN02','Đăng nhập Khách',async()=>{customer=await login('khach@demo.vn','123456',{customerSession:true});assert.equal(customer.user.role,'CUSTOMER')});
 await check('Xác thực','CN02','Sai mật khẩu',async()=>{await POST('/api/auth/login',{email:'khach@demo.vn',password:'sai'},null,401)});
 for(const [label,body] of [['Khách vào Admin',{email:'khach@demo.vn',password:'123456',staffPortal:'ADMIN'}],['Admin vào Quản lý',{email:'admin@backline.vn',password:'Admin@123',staffPortal:'MANAGER'}],['Quản lý vào Khách',{email:'manager@demo.vn',password:'Manager@123',customerSession:true}]])await check('Phân quyền','CN02',label,async()=>{await POST('/api/auth/login',body,null,403)});
 const permission=[['/api/admin/accounts','ADMIN','CN42'],['/api/admin/password-recovery','ADMIN','CN45'],['/api/admin/dashboard','MANAGER','CN36'],['/api/admin/customers','MANAGER','CN19'],['/api/admin/feedback','MANAGER','CN24'],['/api/admin/surveys','MANAGER','CN28'],['/api/admin/reports/overview','MANAGER','CN37']];
 for(const [url,role,cn]of permission)for(const [who,session]of [['ADMIN',admin],['MANAGER',manager],['CUSTOMER',customer]])await check('Phân quyền',cn,`${who} ${role===who?'được phép':'bị chặn'} tại ${url}`,async()=>{await GET(url,session,role===who?200:403)});
 await check('Tài khoản','CN01','Đăng ký hợp lệ',async()=>{reg=await POST('/api/auth/register',validUser,null,201);fresh={token:reg.data.token,cookie:reg.headers.get('set-cookie')?.split(';')[0],user:reg.data.user};secrets.push(reg.data.recoveryCode,reg.data.token);assert.equal(fresh.user.role,'CUSTOMER');assert.ok(reg.data.recoveryCode)});
 for(const [name,body]of [['Thiếu họ tên',{name:''}],['Sai email',{email:'sai'}],['Sai điện thoại',{phone:'123'}],['Ngày sinh không tồn tại',{birthDate:'2025-02-30'}],['Ngày sinh tương lai',{birthDate:'2099-01-01'}],['Thiếu giới tính',{gender:''}],['Mật khẩu quá ngắn',{password:'123'}]])await check('Tài khoản','CN01',name,async()=>{await POST('/api/auth/register',{...validUser,...body},null,400)});
 await check('Tài khoản','CN01','Không đăng ký trùng email hoặc điện thoại',async()=>{await POST('/api/auth/register',validUser,null,409)});
 await check('Tài khoản','CN01','Mật khẩu lưu dạng băm và không lộ qua API',async()=>{const [[u]]=await SQL('SELECT password_hash FROM users WHERE id=?',[fresh.user.id]);assert.notEqual(u.password_hash,validUser.password);assert.ok(await bcrypt.compare(validUser.password,u.password_hash));assert.ok(!JSON.stringify(reg.data).includes('password_hash'))});
 await check('Phiên đăng nhập','CN03','Ghi nhớ 7 ngày có cookie HttpOnly và thời hạn đúng',async()=>{const s=await login(validUser.email,validUser.password,{customerSession:true,remember:true});const cookie=s.headers.get('set-cookie');assert.match(cookie,/HttpOnly/i);assert.match(cookie,/SameSite=Lax/i);assert.match(cookie,/Max-Age=604800/);const payload=jwt.decode(s.token);assert.equal(payload.exp-payload.iat,604800)});
 await check('Phiên đăng nhập','CN03','Không ghi nhớ dùng token 8 giờ và cookie phiên',async()=>{const cookie=reg.headers.get('set-cookie');assert.ok(cookie&&!cookie.includes('Max-Age'));const payload=jwt.decode(fresh.token);assert.equal(payload.exp-payload.iat,28800)});
 await check('Phiên đăng nhập','CN05','Cookie khách đọc được hồ sơ',async()=>{assert.equal((await GET('/api/me',{cookie:fresh.cookie})).data.user.id,fresh.user.id)});
 const profile={name:'Khách kiểm thử đã cập nhật',phone:validUser.phone,addr:'Địa chỉ dữ liệu thử',birthDate:'1999-02-28',gender:'Khác',need:'Chưa xác định'};
 await check('Hồ sơ','CN06','Cập nhật đủ hồ sơ và đọc lại từ MySQL',async()=>{await req('/api/me','PUT',profile,fresh);const r=await GET('/api/me',fresh);assert.equal(r.data.user.name,profile.name);assert.equal(r.data.user.addr,profile.addr)});
 await check('Hồ sơ','CN06','Từ chối nhu cầu ngoài danh mục',async()=>{await req('/api/me','PUT',{...profile,need:'Không hợp lệ'},fresh,400)});
 await check('Hồ sơ','CN06','Từ chối điện thoại bị trùng',async()=>{await req('/api/me','PUT',{...profile,phone:'0901234567'},fresh,409)});
 await check('Gia cố API','CN07','API phải từ chối hồ sơ thiếu địa chỉ và giới tính',async()=>{const r=await req('/api/me','PUT',{...profile,addr:'',gender:''},fresh,null);assert.ok(r.status>=400,'API chấp nhận hồ sơ thiếu địa chỉ và giới tính với HTTP '+r.status)},'boundary');
 await req('/api/me','PUT',profile,fresh);
 await check('Khách hàng','CN20','Quản lý thêm khách',async()=>{await POST('/api/admin/customers',{name:'Khách mới từ Quản lý',email:'qa.manager-created@example.invalid',phone:'0909988222',password:'QaOnly@123',need:'Gaming'},manager,201)});
 let managed=(await GET('/api/admin/customers?q=qa.manager-created',manager)).data.customers[0];
 await check('Khách hàng','CN19','Tìm theo tên email điện thoại',async()=>{for(const q of ['Khách mới từ Quản lý','qa.manager-created@example.invalid','0909988222'])assert.ok((await GET('/api/admin/customers?q='+encodeURIComponent(q),manager)).data.customers.some(x=>x.id===managed.id))});
 await check('Khách hàng','CN19','Lọc nhu cầu Gaming',async()=>{const a=(await GET('/api/admin/customers?need=Gaming',manager)).data.customers;assert.ok(a.length);assert.ok(a.every(x=>x.need==='Gaming'))});
 await check('Khách hàng','CN21','Xem chi tiết khách',async()=>{assert.equal((await GET('/api/admin/customers/'+managed.id,manager)).data.customer.email,managed.email)});
 await check('Khách hàng','CN22','Khóa khách và chặn đăng nhập',async()=>{await PATCH('/api/admin/customers/'+managed.id+'/status',{status:'LOCKED'},manager);await POST('/api/auth/login',{email:managed.email,password:'QaOnly@123'},null,403)});
 await check('Khách hàng','CN22','Lọc danh sách bị khóa',async()=>{const a=(await GET('/api/admin/customers?status=LOCKED',manager)).data.customers;assert.ok(a.some(x=>x.id===managed.id));assert.ok(a.every(x=>x.status==='LOCKED'))});
 await check('Khách hàng','CN22','Mở khóa khách',async()=>{await PATCH('/api/admin/customers/'+managed.id+'/status',{status:'ACTIVE'},manager);await login(managed.email,'QaOnly@123',{customerSession:true})});
 await check('Khách hàng','CN22','Từ chối trạng thái không hợp lệ',async()=>{await PATCH('/api/admin/customers/'+managed.id+'/status',{status:'INVALID'},manager,400)});
 await check('Khách hàng','CN23','Xóa khách chưa có lịch sử',async()=>{await req('/api/admin/customers/'+managed.id,'DELETE',undefined,manager);await GET('/api/admin/customers/'+managed.id,manager,404)});
 await check('Admin','CN43','Admin tạo Quản lý mới',async()=>{await POST('/api/admin/accounts',{name:'Quản lý kiểm thử',email:'qa.staff@example.invalid',phone:'0909988333',password:'QaOnly@123',role:'MANAGER'},admin,201)});
 let staff=(await GET('/api/admin/accounts',admin)).data.accounts.find(x=>x.email==='qa.staff@example.invalid');
 await check('Admin','CN43','Quản lý mới đăng nhập đúng cổng',async()=>{assert.equal((await login(staff.email,'QaOnly@123',{staffPortal:'MANAGER'})).user.role,'MANAGER')});
 await check('Admin','CN42','Danh sách tài khoản không lộ mật khẩu',async()=>{const a=(await GET('/api/admin/accounts',admin)).data.accounts;assert.ok(a.length>=15);assert.ok(a.every(x=>!Object.hasOwn(x,'password_hash')))});
 await check('Admin','CN43','Không đổi vai trò tài khoản đã có',async()=>{await PATCH('/api/admin/accounts/'+staff.id+'/role',{role:'CUSTOMER'},admin,405)});
 await check('Admin','CN44','Không được tự xóa Admin đang đăng nhập',async()=>{await req('/api/admin/accounts/'+admin.user.id,'DELETE',undefined,admin,400)});
 await check('Admin','CN44','Xóa tài khoản Quản lý chưa có nghiệp vụ',async()=>{await req('/api/admin/accounts/'+staff.id,'DELETE',undefined,admin);assert.ok(!(await GET('/api/admin/accounts',admin)).data.accounts.some(x=>x.id===staff.id))});
 const surveyBody={title:'Khảo sát kiểm thử cách ly',description:'Kiểm tra đầy đủ bốn loại câu hỏi',status:'DRAFT',dueDate:'2099-12-31',questions};
 await check('Khảo sát','CN29','Tạo DRAFT đủ bốn loại câu hỏi',async()=>{sv=(await POST('/api/admin/surveys',surveyBody,manager,201)).data.id;const r=await GET('/api/admin/surveys/'+sv,manager);assert.equal(r.data.questions.length,4);assert.equal(r.data.survey.status,'DRAFT')});
 await check('Khảo sát','CN28','Tìm và lọc phiếu DRAFT',async()=>{const a=(await GET('/api/admin/surveys?q='+encodeURIComponent(surveyBody.title)+'&status=DRAFT',manager)).data.surveys;assert.ok(a.some(x=>x.id===sv));assert.ok(a.every(x=>x.status==='DRAFT'))});
 for(const [name,body,code]of [['Thiếu tiêu đề',{title:''},400],['Không có câu hỏi',{questions:[]},400],['Câu chọn một thiếu lựa chọn',{questions:[{text:'A',type:'ONE',options:'Chỉ một'}]},400]])await check('Khảo sát','CN29',name,async()=>{await POST('/api/admin/surveys',{...surveyBody,...body},manager,code)});
 await check('Khảo sát','CN29','Rollback phiếu khi câu hỏi không hợp lệ',async()=>{const [[r]]=await SQL('SELECT COUNT(*) n FROM surveys WHERE title=?',[surveyBody.title]);assert.equal(Number(r.n),1)});
 await check('Khảo sát','CN30','Sửa nội dung DRAFT',async()=>{await PATCH('/api/admin/surveys/'+sv,{...surveyBody,title:'Khảo sát kiểm thử đã sửa'},manager);assert.equal((await GET('/api/admin/surveys/'+sv,manager)).data.survey.title,'Khảo sát kiểm thử đã sửa')});
 await check('Khảo sát','CN32','Gửi phiếu tới khách ACTIVE và không nhân đôi người nhận',async()=>{await POST('/api/admin/surveys/'+sv+'/send',{},manager);const [[a]]=await SQL('SELECT COUNT(*) n FROM survey_recipients WHERE survey_id=?',[sv]);await POST('/api/admin/surveys/'+sv+'/send',{},manager);const [[b]]=await SQL('SELECT COUNT(*) n FROM survey_recipients WHERE survey_id=?',[sv]);assert.ok(a.n>0);assert.equal(a.n,b.n)});
 await check('Khảo sát','CN08','Khách thấy phiếu đang OPEN',async()=>{assert.ok((await GET('/api/surveys',fresh)).data.surveys.some(x=>x.id===sv))});
 await check('Khảo sát','CN30','OPEN chưa có bài có thể về DRAFT và mở lại',async()=>{await PATCH('/api/admin/surveys/'+sv,{status:'DRAFT'},manager);assert.equal((await GET('/api/admin/surveys/'+sv,manager)).data.survey.status,'DRAFT');await POST('/api/admin/surveys/'+sv+'/send',{},manager)});
 await check('Khảo sát','CN34','Ẩn OPEN không đóng phiếu và khách vẫn thấy',async()=>{await PATCH('/api/admin/surveys/'+sv+'/visibility',{hidden:true},manager);assert.ok(!(await GET('/api/admin/surveys',manager)).data.surveys.some(x=>x.id===sv));assert.ok((await GET('/api/admin/surveys?hidden=true',manager)).data.surveys.some(x=>x.id===sv));assert.ok((await GET('/api/surveys',fresh)).data.surveys.some(x=>x.id===sv))});
 await check('Khảo sát','CN35','Khôi phục phiếu ẩn giữ trạng thái OPEN',async()=>{await PATCH('/api/admin/surveys/'+sv+'/visibility',{hidden:false},manager);assert.equal((await GET('/api/admin/surveys/'+sv,manager)).data.survey.status,'OPEN')});
 await check('Khảo sát','CN34','Từ chối giá trị ẩn không phải boolean',async()=>{await PATCH('/api/admin/surveys/'+sv+'/visibility',{hidden:'false'},manager,400)});
 await check('Khảo sát','CN10','Từ chối câu TEXT chỉ có khoảng trắng',async()=>{await POST('/api/surveys/'+sv+'/responses',{answers:{q0:'A',q1:['X'],q2:'   ',q3:4}},fresh,400)});
 await check('Khảo sát','CN10','Nộp đủ ONE MULTI TEXT RATING',async()=>{const r=await POST('/api/surveys/'+sv+'/responses',{answers:{q0:'A',q1:['X','Y'],q2:'Ý kiến kiểm thử',q3:5}},fresh,201);assert.ok(r.data.completedAt);const [[n]]=await SQL('SELECT COUNT(*) n FROM response_details d JOIN survey_responses r ON r.id=d.response_id WHERE r.survey_id=?',[sv]);assert.equal(Number(n.n),5)});
 await check('Khảo sát','CN10','Không nộp hai lần cùng phiếu',async()=>{await POST('/api/surveys/'+sv+'/responses',{answers:{q0:'A',q1:['X'],q2:'Lần hai',q3:3}},fresh,409)});
 await check('Khảo sát','CN08','Đọc ngày hoàn thành đã lưu',async()=>{assert.ok((await GET('/api/survey-status',fresh)).data.completed[sv])});
 await check('Khảo sát','CN30','OPEN có bài không cho sửa về DRAFT',async()=>{await PATCH('/api/admin/surveys/'+sv,{status:'DRAFT'},manager,409)});
 await check('Khảo sát','CN40','Xem câu trả lời và nội dung chi tiết',async()=>{const r=(await GET('/api/admin/surveys/'+sv+'/responses',manager)).data;assert.ok(r.responses.some(x=>x.email===validUser.email));assert.ok(JSON.stringify(r).includes('Ý kiến kiểm thử'))});
 await check('Khảo sát','CN33','Đóng ngay ngừng nhận bài và giữ bài cũ',async()=>{await POST('/api/admin/surveys/'+sv+'/close',{},manager);await POST('/api/surveys/'+sv+'/responses',{answers:{}},customer,404);assert.equal((await GET('/api/admin/surveys/'+sv,manager)).data.survey.response_count,1);assert.ok((await GET('/api/surveys',fresh)).data.surveys.some(x=>x.id===sv))});
 await check('Khảo sát','CN33','Không đóng lại hoặc gửi phiếu đã CLOSED',async()=>{await POST('/api/admin/surveys/'+sv+'/close',{},manager,409);await POST('/api/admin/surveys/'+sv+'/send',{},manager,409)});
 await check('Khảo sát','CN30','Không mở lại CLOSED',async()=>{await PATCH('/api/admin/surveys/'+sv,{...surveyBody,status:'OPEN'},manager,409)});
 await check('Khảo sát','CN31','Sao chép phiếu tạo DRAFT độc lập',async()=>{const a=(await POST('/api/admin/surveys/'+sv+'/copy',{},manager,201)).data;copy=a.id;const old=(await GET('/api/admin/surveys/'+sv,manager)).data;assert.notEqual(copy,sv);assert.equal(a.survey.status,'DRAFT');assert.equal(a.survey.due_date,null);assert.equal(a.questions.length,old.questions.length);assert.ok(a.questions.every((q,i)=>q.id!==old.questions[i].id));const [[r]]=await SQL('SELECT COUNT(*) n FROM survey_responses WHERE survey_id=?',[copy]);assert.equal(Number(r.n),0)});
 await check('Khảo sát','CN34','Ẩn CLOSED vẫn được tính báo cáo',async()=>{await PATCH('/api/admin/surveys/'+sv+'/visibility',{hidden:true},manager);assert.ok((await GET('/api/admin/reports/overview',manager)).data.surveys.items.some(x=>x.id===sv))});
 await check('Khảo sát','CN35','Bỏ ẩn CLOSED không mở lại',async()=>{await PATCH('/api/admin/surveys/'+sv+'/visibility',{hidden:false},manager);assert.equal((await GET('/api/admin/surveys/'+sv,manager)).data.survey.status,'CLOSED')});
 const expired=(await POST('/api/admin/surveys',{...surveyBody,title:'Phiếu quá hạn kiểm thử',dueDate:'2020-01-01'},manager,201)).data.id;await POST('/api/admin/surveys/'+expired+'/send',{},manager);
 await check('Khảo sát','CN10','Từ chối nộp khảo sát quá hạn',async()=>{await POST('/api/surveys/'+expired+'/responses',{answers:{q2:'x'}},fresh,410)});
 await check('Khảo sát','CN39','Báo cáo nhận biết EXPIRED dù dữ liệu vẫn OPEN',async()=>{const r=(await GET('/api/admin/reports/overview',manager)).data;assert.equal(r.surveys.items.find(x=>x.id===expired).effectiveStatus,'EXPIRED');assert.equal((await GET('/api/admin/surveys/'+expired,manager)).data.survey.status,'OPEN')});
 for(const [label,answers]of [['ONE bị bỏ trống',{q1:['X'],q2:'text',q3:3}],['MULTI bị bỏ trống',{q0:'A',q2:'text',q3:3}],['RATING bị bỏ trống',{q0:'A',q1:['X'],q2:'text'}],['RATING ngoài khoảng 1 đến 5',{q0:'A',q1:['X'],q2:'text',q3:9}],['ONE chứa lựa chọn không có',{q0:'Không có',q1:['X'],q2:'text',q3:3}],['ONE nhận hai lựa chọn',{q0:['A','B'],q1:['X'],q2:'text',q3:3}]]){
  const id=(await POST('/api/admin/surveys',{...surveyBody,title:'Biên dữ liệu '+label},manager,201)).data.id;await POST('/api/admin/surveys/'+id+'/send',{},manager);
  await check('Gia cố API','CN10',label,async()=>{const r=await POST('/api/surveys/'+id+'/responses',{answers},fresh,null);assert.ok(r.status>=400,'API chấp nhận dữ liệu không hợp lệ với HTTP '+r.status)},'boundary');
 }
 const fbody={prod:require(path.join(ROOT,'database/catalog'))[0],type:'Góp ý',rate:5,title:'Phản hồi kiểm thử',body:'Nội dung phản hồi trên database cách ly'};
 await check('Phản hồi','CN13','Gửi phản hồi hợp lệ',async()=>{const r=await POST('/api/feedback',fbody,fresh,201);feedbackId=r.data.feedback?.id||r.data.id;const a=(await GET('/api/feedback',fresh)).data.feedback;feedbackId=a.find(x=>x.title===fbody.title)?.id;assert.ok(feedbackId)});
 for(const [label,body]of [['Sai sản phẩm',{prod:'Không tồn tại'}],['Sai loại phản hồi',{type:'INVALID'}],['Sao bằng 0',{rate:0}],['Sao bằng 6',{rate:6}],['Sao không nguyên',{rate:2.5}],['Nội dung chỉ khoảng trắng',{body:'  '}]])await check('Phản hồi','CN13',label,async()=>{await POST('/api/feedback',{...fbody,...body},fresh,400)});
 await check('Phản hồi','CN14','Khách chỉ đọc phản hồi chính mình',async()=>{assert.ok(!(await GET('/api/feedback',customer)).data.feedback.some(x=>x.id===feedbackId));assert.ok((await GET('/api/feedback',fresh)).data.feedback.some(x=>x.id===feedbackId))});
 await check('Phản hồi','CN24','Quản lý lọc phản hồi NEW',async()=>{const a=(await GET('/api/admin/feedback?status=NEW',manager)).data.feedback;assert.ok(a.some(x=>x.id===feedbackId));assert.ok(a.every(x=>x.status==='NEW'))});
 await check('Phản hồi','CN26','Không ẩn phản hồi chưa xử lý',async()=>{await PATCH('/api/admin/feedback/'+feedbackId+'/visibility',{hidden:true},manager,400)});
 await check('Phản hồi','CN25','Không RESOLVED khi chưa có câu trả lời',async()=>{await PATCH('/api/admin/feedback/'+feedbackId,{status:'RESOLVED',reply:''},manager,400)});
 await check('Phản hồi','CN25','Lưu IN_PROGRESS và nội dung trả lời',async()=>{await PATCH('/api/admin/feedback/'+feedbackId,{status:'IN_PROGRESS',reply:'Đang kiểm tra dữ liệu thử'},manager);assert.equal((await GET('/api/feedback',fresh)).data.feedback.find(x=>x.id===feedbackId).reply,'Đang kiểm tra dữ liệu thử')});
 await check('Phản hồi','CN25','Không lùi IN_PROGRESS về NEW',async()=>{await PATCH('/api/admin/feedback/'+feedbackId,{status:'NEW',reply:'x'},manager,400)});
 await check('Phản hồi','CN25','Lưu RESOLVED có trả lời',async()=>{await PATCH('/api/admin/feedback/'+feedbackId,{status:'RESOLVED',reply:'Đã xử lý kiểm thử'},manager)});
 await check('Phản hồi','CN26','Ẩn phản hồi giữ câu trả lời của khách và báo cáo',async()=>{const before=(await GET('/api/admin/reports/overview',manager)).data.feedback.total;await PATCH('/api/admin/feedback/'+feedbackId+'/visibility',{hidden:true},manager);assert.ok((await GET('/api/admin/feedback?hidden=true',manager)).data.feedback.some(x=>x.id===feedbackId));assert.equal((await GET('/api/feedback',fresh)).data.feedback.find(x=>x.id===feedbackId).reply,'Đã xử lý kiểm thử');assert.equal((await GET('/api/admin/reports/overview',manager)).data.feedback.total,before)});
 await check('Phản hồi','CN27','Khôi phục phản hồi về danh sách chính',async()=>{await PATCH('/api/admin/feedback/'+feedbackId+'/visibility',{hidden:false},manager);assert.ok((await GET('/api/admin/feedback',manager)).data.feedback.some(x=>x.id===feedbackId))});
 await check('Khách hàng','CN23','Không xóa khách đã có lịch sử',async()=>{await req('/api/admin/customers/'+fresh.user.id,'DELETE',undefined,manager,409)});
 await check('Admin','CN44','Không xóa khách đã có lịch sử',async()=>{await req('/api/admin/accounts/'+fresh.user.id,'DELETE',undefined,admin,409)});
 await check('Admin','CN44','Không xóa Quản lý đã tạo khảo sát',async()=>{await req('/api/admin/accounts/'+manager.user.id,'DELETE',undefined,admin,409)});
 await check('Báo cáo','CN36','Tổng quan khớp SQL',async()=>{const a=(await GET('/api/admin/dashboard',manager)).data;const [[r]]=await SQL("SELECT (SELECT COUNT(*) FROM users WHERE role='CUSTOMER') customers,(SELECT COUNT(*) FROM feedback WHERE status!='RESOLVED') openFeedback,(SELECT COUNT(*) FROM surveys WHERE status='OPEN') openSurveys");assert.deepEqual(a,r)});
 await check('Báo cáo','CN37','Phân bố khách cộng đúng tổng',async()=>{const a=(await GET('/api/admin/reports/overview',manager)).data;for(const rows of [a.customers.byAge,a.customers.byGender,a.customers.byNeed])assert.equal(rows.reduce((n,x)=>n+x.total,0),a.customers.total)});
 await check('Báo cáo','CN38','Tổng và tỷ lệ phản hồi khớp SQL',async()=>{const a=(await GET('/api/admin/reports/overview',manager)).data.feedback;const [[b]]=await SQL("SELECT COUNT(*) n,SUM(status='RESOLVED') resolved,ROUND(AVG(rating),1) avg FROM feedback");assert.equal(a.total,Number(b.n));assert.equal(a.resolved,Number(b.resolved));assert.equal(a.averageRating,Number(b.avg));assert.equal(a.byStatus.reduce((n,x)=>n+x.total,0),a.total)});
 await check('Báo cáo','CN39','Người nhận và tỷ lệ hoàn thành không vượt 100',async()=>{const a=(await GET('/api/admin/reports/overview',manager)).data.surveys;assert.ok(a.items.every(x=>x.matchedResponses<=x.recipients&&x.matchedResponses<=x.responses&&(x.completionRate===null||x.completionRate<=100)))});
 await check('Báo cáo','CN40','Câu chi tiết tổng trả lời và bỏ qua đúng tổng bài',async()=>{const a=(await GET('/api/admin/reports/survey-detail/'+sv,manager)).data;assert.equal(a.responses.length,1);assert.ok(a.questions.every(x=>x.answered+x.skipped===1));assert.equal(a.questions.find(x=>x.type==='MULTI').options.reduce((n,x)=>n+x.percentage,0),200)});
 await check('Báo cáo','CN37','Khoảng ngày không có dữ liệu trả null cho tỷ lệ',async()=>{const a=(await GET('/api/admin/reports/overview?from=2099-01-01&to=2099-01-02',manager)).data;assert.equal(a.customers.total,0);assert.equal(a.feedback.total,0);assert.equal(a.feedback.resolutionRate,null)});
 for(const query of ['from=2026-02-30','from=2026-12-01&to=2026-01-01','from=sai'])await check('Báo cáo','CN37','Từ chối ngày lọc sai '+query,async()=>{await GET('/api/admin/reports/overview?'+query,manager,400)});
 // Yêu cầu hỗ trợ dùng các khách riêng để không vướng giới hạn 5 lượt theo IP.
 const recoveryUser={...validUser,name:'Khách khôi phục',email:'qa.recovery@example.invalid',phone:'0909988444'};
 const rr=await POST('/api/auth/register',recoveryUser,null,201);const recoverySession={token:rr.data.token};secrets.push(rr.data.token,rr.data.recoveryCode);let issuedCode,requestId,recoveryToken;
 await check('Khôi phục','CN15','Tạo mã mới yêu cầu đúng mật khẩu hiện tại',async()=>{await POST('/api/me/recovery-code',{currentPassword:'wrong'},recoverySession,403);const a=await POST('/api/me/recovery-code',{currentPassword:recoveryUser.password},recoverySession);issuedCode=a.data.code;secrets.push(issuedCode);assert.ok(issuedCode)});
 await check('Khôi phục','CN15','Trạng thái mã không trả mã gốc',async()=>{const a=(await GET('/api/me/recovery-code',recoverySession)).data;assert.equal(a.configured,true);assert.ok(!JSON.stringify(a).includes(issuedCode))});
 await check('Khôi phục','CN16','Mã cũ hết hiệu lực sau tạo mã mới',async()=>{await POST('/api/password-recovery/code',{email:recoveryUser.email,recoveryCode:rr.data.recoveryCode},null,401)});
 await check('Khôi phục','CN16','Mã mới cấp quyền APPROVED',async()=>{const a=await POST('/api/password-recovery/code',{email:recoveryUser.email,recoveryCode:issuedCode},null,201);recoveryToken=a.data.token;secrets.push(recoveryToken);assert.equal(a.data.status,'APPROVED')});
 await check('Khôi phục','CN18','Từ chối xác nhận mật khẩu khác nhau',async()=>{await POST('/api/password-recovery/complete',{password:'NewQa@123',confirmation:'Different@123'},{recovery:recoveryToken},400)});
 await check('Khôi phục','CN18','Đổi thành công vô hiệu token cũ và cấp mã mới',async()=>{const a=await POST('/api/password-recovery/complete',{password:'NewQa@123',confirmation:'NewQa@123'},{recovery:recoveryToken});assert.equal(a.data.status,'COMPLETED');secrets.push(a.data.recoveryCode);assert.ok(a.data.recoveryCode);await GET('/api/me',recoverySession,401);await login(recoveryUser.email,'NewQa@123',{customerSession:true});await POST('/api/auth/login',{email:recoveryUser.email,password:recoveryUser.password},null,401)});
 await check('Khôi phục','CN18','Không dùng lại phiên hoàn tất',async()=>{await POST('/api/password-recovery/complete',{password:'NewQa@123',confirmation:'NewQa@123'},{recovery:recoveryToken},409)});
 await check('Admin','CN45','Admin thấy hoàn tất nhưng không thấy mật khẩu mã và token',async()=>{const a=(await GET('/api/admin/password-recovery',admin)).data;const r=a.requests.find(x=>x.email===recoveryUser.email);assert.equal(r.status,'COMPLETED');assert.ok(a.unread>=1);assert.ok(!JSON.stringify(a).includes(recoveryToken));assert.ok(!JSON.stringify(a).includes(issuedCode));requestId=r.id});
 await check('Admin','CN48','Đánh dấu thông báo hoàn tất đã đọc',async()=>{await POST('/api/admin/password-recovery/'+requestId+'/seen',{},admin);const a=(await GET('/api/admin/password-recovery',admin)).data.requests.find(x=>x.id===requestId);assert.equal(Boolean(a.completion_seen),true)});
 let manualToken,manualId;
 await check('Khôi phục','CN17','Tạo yêu cầu hỗ trợ PENDING',async()=>{const a=await POST('/api/password-recovery/requests',{email:validUser.email,phone:validUser.phone,reason:'Quên mật khẩu kiểm thử cách ly'},null,201);manualToken=a.data.token;secrets.push(manualToken);assert.equal(a.data.status,'PENDING');manualId=(await GET('/api/admin/password-recovery',admin)).data.requests.find(x=>x.email===validUser.email&&x.status==='PENDING').id});
 await check('Khôi phục','CN17','Theo dõi yêu cầu và không đổi trước khi duyệt',async()=>{assert.equal((await GET('/api/password-recovery/status',{recovery:manualToken})).data.status,'PENDING');await POST('/api/password-recovery/complete',{password:'ManualQa@123',confirmation:'ManualQa@123'},{recovery:manualToken},409)});
 await check('Admin','CN46','Không duyệt nếu thiếu xác nhận xác minh',async()=>{await PATCH('/api/admin/password-recovery/'+manualId,{action:'approve',verified:false,note:'Ghi chú kiểm thử'},admin,400)});
 await check('Admin','CN46','Duyệt sau xác minh và cấp hạn 15 phút',async()=>{await PATCH('/api/admin/password-recovery/'+manualId,{action:'approve',verified:true,note:'Đã xác minh dữ liệu thử'},admin);const a=(await GET('/api/password-recovery/status',{recovery:manualToken})).data;assert.equal(a.status,'APPROVED');assert.ok(new Date(a.expiresAt)-Date.now()<=15*60*1000+2000)});
 await check('Khôi phục','CN18','Hoàn tất bằng hỗ trợ thủ công',async()=>{const a=await POST('/api/password-recovery/complete',{password:'ManualQa@123',confirmation:'ManualQa@123'},{recovery:manualToken});assert.equal(a.data.status,'COMPLETED');secrets.push(a.data.recoveryCode)});
 let rejection;
 await check('Admin','CN47','Từ chối yêu cầu không khớp tài khoản',async()=>{const a=await POST('/api/password-recovery/requests',{email:'unknown@example.invalid',phone:'0909988555',reason:'Yêu cầu không khớp kiểm thử'},null,201);rejection=a.data.token;secrets.push(rejection);const r=(await GET('/api/admin/password-recovery',admin)).data.requests.find(x=>x.email==='unknown@example.invalid');await PATCH('/api/admin/password-recovery/'+r.id,{action:'approve',verified:true,note:'Không khớp dữ liệu thử'},admin,409);await PATCH('/api/admin/password-recovery/'+r.id,{action:'reject',note:'Không khớp dữ liệu thử'},admin);assert.equal((await GET('/api/password-recovery/status',{recovery:rejection})).data.status,'REJECTED')});
 await check('Khôi phục','CN17','Yêu cầu quá hạn chuyển EXPIRED',async()=>{const a=await POST('/api/password-recovery/requests',{email:validUser.email,phone:validUser.phone,reason:'Thử hết hạn yêu cầu'},null,201);secrets.push(a.data.token);await SQL("UPDATE password_recovery_requests SET expires_at=DATE_SUB(NOW(),INTERVAL 1 SECOND) WHERE token_hash=?",[crypto.createHash('sha256').update(a.data.token).digest('hex')]);assert.equal((await GET('/api/password-recovery/status',{recovery:a.data.token})).data.status,'EXPIRED')});
 await check('Phiên đăng nhập','CN04','Đăng xuất xóa cookie trình duyệt',async()=>{const a=await POST('/api/auth/logout',{},customer);assert.match(a.headers.get('set-cookie'),/Expires=Thu, 01 Jan 1970/)});
 await check('Khách hàng','CN22','Khóa tài khoản vô hiệu ngay token đang có',async()=>{const s=await login(validUser.email,'ManualQa@123',{customerSession:true});await PATCH('/api/admin/customers/'+fresh.user.id+'/status',{status:'LOCKED'},manager);await GET('/api/me',s,401);await PATCH('/api/admin/customers/'+fresh.user.id+'/status',{status:'ACTIVE'},manager)});
 fresh=await login(validUser.email,'ManualQa@123',{customerSession:true});
 await require('./acceptance-cases.cjs')({check,req,GET,POST,PATCH,SQL,manager,admin,fresh,customer,profile,ROOT});
 await require('./survey-review-cases.cjs')({check,req,GET,POST,PATCH,SQL,manager,admin,fresh,customer});
}
async function cleanup(){if(child&&!child.killed){child.kill();await new Promise(r=>child.once('exit',r));}if(c)await c.end();if(owner){if(owned){assert.match(qaDB,/^crm_qa_[a-f0-9]{16}$/);await owner.query('DROP DATABASE `'+qaDB+'`');}await owner.end();}}
(async()=>{let fatal;try{await main()}catch(e){fatal=clean(e.stack||e.message)}finally{try{await cleanup()}catch(e){fatal=(fatal||'')+' Cleanup: '+clean(e.message)}}const report={startedAt:stamp,finishedAt:new Date().toISOString(),environment:'Isolated MySQL database and isolated Node HTTP server using current source',databaseCleaned:owned&&!fatal,summary:{total:results.length,passed:results.filter(x=>x.status==='PASS').length,failed:results.filter(x=>x.status==='FAIL').length},fatal,results};fs.writeFileSync(path.join(__dirname,'detailed-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({summary:report.summary,fatal,failures:results.filter(x=>x.status==='FAIL')},null,2));process.exitCode=fatal||report.summary.failed?1:0})();


