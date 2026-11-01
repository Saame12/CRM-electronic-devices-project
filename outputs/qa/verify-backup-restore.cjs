const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const ROOT=path.resolve(__dirname,'../..');
const {restore}=require('../../scripts/database-backup');
const {connectionOptions}=require('../../scripts/setup-database');
const mysql=require('mysql2/promise');
async function main(){
 const target='crm_restore_'+crypto.randomBytes(8).toString('hex'),file=path.resolve(ROOT,process.argv[2]||'data/backups/backline_crm-2026-11-01T05-00-18-129Z.sql');
 let owned=false,child,c;
 const report={startedAt:new Date().toISOString(),backup:file,checks:[]};
 try{
  const restored=await restore(file,target);owned=true;report.counts=restored.counts;report.checks.push('Checksum và số bản ghi '+Object.keys(restored.counts).length+' bảng khớp bản sao lưu');
  c=await mysql.createConnection({...connectionOptions(),database:target,multipleStatements:false});
  const [[orphans]]=await c.query(`SELECT (SELECT COUNT(*) FROM feedback f LEFT JOIN users u ON u.id=f.customer_id WHERE u.id IS NULL)+(SELECT COUNT(*) FROM survey_responses r LEFT JOIN users u ON u.id=r.customer_id WHERE u.id IS NULL)+(SELECT COUNT(*) FROM response_details d LEFT JOIN survey_responses r ON r.id=d.response_id WHERE r.id IS NULL) total`);assert.equal(orphans.total,0);report.checks.push('Không có bản ghi mồ côi phản hồi, câu trả lời và chi tiết');
  const net=require('node:net'),probe=net.createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));const base='http://127.0.0.1:'+port;
  child=spawn(process.execPath,['server.mysql.js'],{cwd:ROOT,env:{...process.env,PORT:String(port),DB_NAME:target,JWT_SECRET:crypto.randomBytes(48).toString('hex')},windowsHide:true,stdio:'ignore'});
  let ready=false;for(let i=0;i<100;i++){try{ready=(await fetch(base+'/api/health')).ok;if(ready)break;}catch{}await new Promise(r=>setTimeout(r,100));}assert.ok(ready);
  async function request(url,token,body){const r=await fetch(base+url,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});assert.equal(r.status,200,url);return r.json();}
  const manager=await request('/api/auth/login',null,{email:'manager@demo.vn',password:'Manager@123'}),customer=await request('/api/auth/login',null,{email:'khach@demo.vn',password:'123456'});
  report.checks.push('Đăng nhập Quản lý và khách bằng mật khẩu đã phục hồi');
  const dashboard=await request('/api/admin/dashboard',manager.token),overview=await request('/api/admin/reports/overview',manager.token);
  assert.equal(dashboard.customers,12);assert.equal(overview.feedback.total,36);assert.equal(overview.surveys.total,6);
  const surveys=await request('/api/surveys',customer.token),feedback=await request('/api/feedback',customer.token);assert.ok(surveys.surveys.length);assert.ok(feedback.feedback.length);
  report.checks.push('Dashboard/báo cáo khớp 12 khách, 36 phản hồi, 6 khảo sát; khách đọc được khảo sát và phản hồi');
  const [questions]=await c.query('SELECT q.id FROM survey_questions q JOIN surveys s ON s.id=q.survey_id');assert.equal(questions.length,15);
  report.status='PASS';
 }finally{
  if(child&&!child.killed){child.kill();await new Promise(r=>child.once('exit',r));}
  if(c)await c.end();if(owned){const admin=await mysql.createConnection({...connectionOptions(),multipleStatements:false});try{assert.match(target,/^crm_restore_[a-f0-9]{16}$/);await admin.query('DROP DATABASE `'+target+'`');}finally{await admin.end();}}
  report.cleaned=owned;report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(__dirname,'backup-restore-results.json'),JSON.stringify(report,null,2));
 }
 console.log(JSON.stringify(report,null,2));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
