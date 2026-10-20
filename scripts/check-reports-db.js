// Kiểm tra chỉ đọc: không khởi động server, tạo dữ liệu mẫu hoặc thay đổi dữ liệu.
require('dotenv').config({quiet:true});
const mysql=require('mysql2/promise');
const assert=require('node:assert/strict');
const {registerReports}=require('../reports-service');
async function main(){
 const pool=mysql.createPool({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD,database:process.env.DB_NAME||'backline_crm',connectTimeout:3000});
 try{
  const routes=new Map();registerReports({get:(url,...handlers)=>routes.set(url,handlers.at(-1))},pool,()=>{},()=>{},x=>x);
  async function request(url,query={},params={}){let output,status=200;await routes.get(url)({query,params},{status(code){status=code;return this},json(data){output=data}});assert.equal(status,200);return output}
  const data=await request('/api/admin/reports/overview');
  for(const rows of [data.customers.byAge,data.customers.byGender,data.customers.byNeed])assert.equal(rows.reduce((n,x)=>n+x.total,0),data.customers.total);
  assert.equal(data.feedback.byStatus.reduce((n,x)=>n+x.total,0),data.feedback.total);
  for(const survey of data.surveys.items){assert.ok(survey.matchedResponses<=survey.recipients);assert.ok(survey.matchedResponses<=survey.responses);assert.ok(survey.completionRate===null||survey.completionRate<=100)}
  await request('/api/admin/reports/overview',{from:data.asOf,to:data.asOf});
  await request('/api/admin/reports/overview',{from:'2099-01-01',to:'2099-01-02'});
  for(const survey of data.surveys.items.slice(0,3)){const detail=await request('/api/admin/reports/survey-detail/:id',{}, {id:survey.id});for(const q of detail.questions){assert.equal(q.answered+q.skipped,detail.responses.length)}assert.ok(detail.responses.every(r=>Array.isArray(r.answers)))}
  console.log('Read-only MySQL verification passed: overview, date filters, empty range, and available survey details.');
 }finally{await pool.end()}
}
main().catch(e=>{console.error('Report verification failed:',e.code||e.message);process.exitCode=1});
