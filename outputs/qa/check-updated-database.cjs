// Chỉ SELECT dữ liệu tổng hợp; không cập nhật schema hoặc dữ liệu nghiệp vụ.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
require(path.join(root,'node_modules/dotenv')).config({path:path.join(root,'.env'),quiet:true});
const mysql=require(path.join(root,'node_modules/mysql2/promise'));
async function main(){
 const report={checkedAt:new Date().toISOString(),configurationTemplatePresent:fs.existsSync(path.join(root,'.env.example'))};
 const db=await mysql.createConnection({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD,database:process.env.DB_NAME||'backline_crm',connectTimeout:5000});
 try{
  const [[current]]=await db.query('SELECT DATABASE() name');report.database=current.name;
  [report.roles]=await db.query('SELECT role,COUNT(*) total FROM users GROUP BY role');
  [[report.totals]]=await db.query('SELECT (SELECT COUNT(*) FROM users) accounts,(SELECT COUNT(*) FROM products) products,(SELECT COUNT(*) FROM surveys) surveys,(SELECT COUNT(*) FROM feedback) feedback,(SELECT COUNT(*) FROM survey_responses) responses');
  [[report.customerProfile]]=await db.query("SELECT COUNT(*) total,SUM(birth_date IS NULL) missingBirthDate,SUM(TRIM(address)='') missingAddress,SUM(gender='') missingGender FROM users WHERE role='CUSTOMER'");
  [report.needs]=await db.query("SELECT need,COUNT(*) total FROM users WHERE role='CUSTOMER' GROUP BY need");
  [report.tables]=await db.query('SELECT TABLE_NAME name FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() ORDER BY TABLE_NAME');
  [report.profileColumns]=await db.query("SELECT COLUMN_NAME name,COLUMN_TYPE type FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='users' AND COLUMN_NAME IN ('need','birth_date','birth_year','gender')");
 }finally{await db.end()}
 const base='http://127.0.0.1:'+(process.env.PORT||3000);report.server={base};
 try{
  const health=await fetch(base+'/api/health',{signal:AbortSignal.timeout(5000)});report.server.health={status:health.status,data:await health.json()};
  const response=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'manager@demo.vn',password:'Manager@123',staffPortal:'MANAGER'}),signal:AbortSignal.timeout(5000)});
  report.server.demoManagerLoginStatus=response.status;
  if(response.ok){const login=await response.json();const overview=await fetch(base+'/api/admin/reports/overview',{headers:{Authorization:'Bearer '+login.token},signal:AbortSignal.timeout(5000)});const data=await overview.json();report.server.reportTotals={status:overview.status,customers:data.customers?.total,feedback:data.feedback?.total,surveys:data.surveys?.total,responses:data.surveys?.responses};}
 }catch(e){report.server.error=e.cause?.code||e.code||e.message}
 fs.writeFileSync(path.join(__dirname,'database-after-update.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}
main().catch(e=>{console.error(e.code||e.message);process.exitCode=1});
