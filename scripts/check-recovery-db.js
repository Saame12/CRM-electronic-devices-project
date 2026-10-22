// Tạo cấu trúc còn thiếu; kiểm tra luồng trên bảng TEMPORARY, không đổi mật khẩu tài khoản thật.
require('dotenv').config({quiet:true});
const mysql=require('mysql2/promise'),assert=require('node:assert/strict'),crypto=require('node:crypto'),bcrypt=require('bcryptjs');
const recovery=require('../password-recovery');
async function main(){
 const connection=await mysql.createConnection({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD,database:process.env.DB_NAME||'backline_crm'});
 try{
  await recovery.ensureSchema(connection);
  await connection.query('CREATE TEMPORARY TABLE recovery_test_users LIKE users');
  await connection.query('CREATE TEMPORARY TABLE recovery_test_requests LIKE password_recovery_requests');
  const rewrite=sql=>sql.replace(/\bpassword_recovery_requests\b/g,'recovery_test_requests').replace(/\busers\b/g,'recovery_test_users');
  const execute=(sql,values)=>connection.execute(rewrite(sql),values);
  const id=crypto.randomUUID(),oldHash=await bcrypt.hash('before-testing',4);
  await execute("INSERT INTO users (id,email,password_hash,role,full_name,phone) VALUES (?,?,?,'CUSTOMER',?,?)",[id,'test@example.invalid',oldHash,'Khách kiểm thử cách ly','0909999988']);
  const db={query:(sql,values)=>connection.query(rewrite(sql),values),execute,getConnection:async()=>({beginTransaction:()=>connection.beginTransaction(),commit:()=>connection.commit(),rollback:()=>connection.rollback(),execute,release(){}})},routes=new Map();
  const app={get:(p,...h)=>routes.set('GET '+p,h.at(-1)),post:(p,...h)=>routes.set('POST '+p,h.at(-1)),patch:(p,...h)=>routes.set('PATCH '+p,h.at(-1))};recovery.register(app,db,()=>{},()=>{},x=>x);
  async function call(method,path,{body={},token='',params={}}={}){let data,status=200;await routes.get(method+' '+path)({body,params,headers:{'x-recovery-token':token},user:{id:'test-admin',full_name:'Admin kiểm thử'}},{status(s){status=s;return this},json(d){data=d}});return {status,data}}
  const created=await call('POST','/api/password-recovery/requests',{body:{email:'test@example.invalid',phone:'0909999988',reason:'Quên mật khẩu kiểm thử'}});assert.equal(created.status,201);
  const token=created.data.token;
  const [[row]]=await execute('SELECT id FROM password_recovery_requests WHERE token_hash=?',[recovery.digest(token)]);
  const payload={token,body:{password:'after-testing',confirmation:'after-testing'}};
  assert.equal((await call('POST','/api/password-recovery/complete',payload)).status,409);
  assert.equal((await call('PATCH','/api/admin/password-recovery/:id',{params:{id:row.id},body:{action:'approve',verified:true,note:'Đã đối chiếu mã yêu cầu qua số điện thoại đăng ký'}})).status,200);
  assert.equal((await call('GET','/api/password-recovery/status',{token})).data.status,'APPROVED');
  assert.equal((await call('POST','/api/password-recovery/complete',payload)).status,200);
  assert.equal((await call('POST','/api/password-recovery/complete',payload)).status,409);
  const [[user]]=await execute('SELECT password_hash,auth_version FROM users WHERE id=?',[id]);assert.ok(await bcrypt.compare('after-testing',user.password_hash));assert.equal(user.auth_version,1);
  const list=await call('GET','/api/admin/password-recovery');assert.equal(list.data.unread,1);assert.equal(list.data.requests[0].status,'COMPLETED');assert.ok(list.data.requests[0].completed_at);assert.ok(!JSON.stringify(list.data).includes(token));
  await call('POST','/api/admin/password-recovery/:id/seen',{params:{id:row.id}});assert.equal((await call('GET','/api/admin/password-recovery')).data.unread,0);
  const unknown=await call('POST','/api/password-recovery/requests',{body:{email:'unknown@example.invalid',phone:'0909999988',reason:'Thông tin chưa khớp'}});const [[bad]]=await execute('SELECT id FROM password_recovery_requests WHERE token_hash=?',[recovery.digest(unknown.data.token)]);
  assert.equal((await call('PATCH','/api/admin/password-recovery/:id',{params:{id:bad.id},body:{action:'approve',verified:true,note:'Đã đối chiếu mã yêu cầu'}})).status,409);
  assert.equal((await call('PATCH','/api/admin/password-recovery/:id',{params:{id:bad.id},body:{action:'reject',note:'Không tìm thấy thông tin phù hợp'}})).status,200);
  console.log('MySQL recovery flow passed on isolated temporary tables: approval, password reset, one-time use, session version, admin notification, rejection.');
 }finally{await connection.end()}
}
main().catch(e=>{console.error('Recovery verification failed:',e.code||e.message,e.sqlMessage||'');process.exitCode=1});
