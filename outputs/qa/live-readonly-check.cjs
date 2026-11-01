const path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'../..');
require(path.join(root,'node_modules/dotenv')).config({path:path.join(root,'.env'),quiet:true});
const mysql=require(path.join(root,'node_modules/mysql2/promise'));
async function main(){
 const results=[],base='http://127.0.0.1:'+(process.env.PORT||3000);
 async function request(url,body,token){const r=await fetch(base+url,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});let d;try{d=await r.json()}catch{d={}}return {status:r.status,data:d}}
 const c=await mysql.createConnection({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD,database:process.env.DB_NAME||'backline_crm'});
 try{
 const [roles]=await c.query('SELECT role,COUNT(*) total FROM users GROUP BY role');
 const [[totals]]=await c.query('SELECT (SELECT COUNT(*) FROM users) accounts,(SELECT COUNT(*) FROM products) products,(SELECT COUNT(*) FROM surveys) surveys,(SELECT COUNT(*) FROM feedback) feedback,(SELECT COUNT(*) FROM survey_responses) responses');
 const health=await request('/api/health');results.push({name:'Kết nối máy chủ và MySQL',status:health.status,ok:health.data.ok});
 for(const [role,email,password,extra]of [['ADMIN','admin@backline.vn','Admin@123',{staffPortal:'ADMIN'}],['MANAGER','manager@demo.vn','Manager@123',{staffPortal:'MANAGER'}],['CUSTOMER','khach@demo.vn','123456',{customerSession:true}]]){
  const r=await request('/api/auth/login',{email,password,...extra});results.push({name:'Đăng nhập tài khoản mẫu '+role,status:r.status,role:r.data.user?.role,error:r.data.error});
  if(r.status===200){if(role==='CUSTOMER'){const u=r.data.user;results.push({name:'Mức hoàn thiện hồ sơ khách mẫu',missing:['name','phone','addr','birthDate','gender','need'].filter(k=>!u[k])});results.push({name:'Khảo sát hiển thị cho khách',count:(await request('/api/surveys',null,r.data.token)).data.surveys?.length})}
  if(role==='MANAGER'){const a=(await request('/api/admin/reports/overview',null,r.data.token)).data;results.push({name:'Tổng số báo cáo hiện tại',customers:a.customers?.total,feedback:a.feedback?.total,surveys:a.surveys?.total})}}
 }
 fs.writeFileSync(path.join(__dirname,'live-results.json'),JSON.stringify({checkedAt:new Date().toISOString(),base,roles,totals,configurationTemplatePresent:fs.existsSync(path.join(root,'.env.example')),results},null,2));
 console.log(JSON.stringify({roles,totals,results},null,2));
 }finally{await c.end()}
}
main().catch(e=>{console.error(e.code||e.message);process.exitCode=1});
