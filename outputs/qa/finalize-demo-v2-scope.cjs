// Finalizes our freshly created synthetic fixture so every OPEN survey follows the new workflow.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),mysql=require('mysql2/promise');
const {databaseName,connectionOptions}=require('../../scripts/setup-database'),{counts,backup}=require('../../scripts/database-backup');
const Domain=require('../../crm-domain'),{dateAt}=require('../../database/demo-data');
(async()=>{
 const file='outputs/demo-v2-manifest.json',m=JSON.parse(fs.readFileSync(file,'utf8'));assert.equal(databaseName(),m.database);
 const oldTitle='[Dữ liệu cũ] Khảo sát thiếu phạm vi',scenario=m.summary.scenarios.find(s=>s.title===oldTitle);assert.ok(scenario);
 const c=await mysql.createConnection({...connectionOptions(),database:m.database,multipleStatements:false});
 try{
  await c.beginTransaction();
  const [[survey]]=await c.execute('SELECT title,audience_config FROM surveys WHERE id=? FOR UPDATE',[scenario.id]);assert.equal(survey.title,oldTitle);assert.equal(survey.audience_config,null);
  const [[r]]=await c.execute('SELECT COUNT(*) n FROM survey_responses WHERE survey_id=?',[scenario.id]);assert.equal(r.n,0,'Preserve any user submissions');
  const [[n]]=await c.execute('SELECT COUNT(*) n FROM survey_recipients WHERE survey_id=?',[scenario.id]);assert.equal(n.n,2,'Leave user-edited fixtures intact');
  const config={mode:'FILTER',filters:{minAge:25,maxAge:45},customerIds:[]};
  const [[clock]]=await c.query("SELECT DATE_FORMAT(CURDATE(),'%Y-%m-%d') today");
  const [users]=await c.query("SELECT id,DATE_FORMAT(birth_date,'%Y-%m-%d') birth_date FROM users WHERE role='CUSTOMER' AND account_status='ACTIVE'");
  const eligible=users.filter(u=>Domain.matches(u,config.filters,clock.today));assert.equal(eligible.length,4);
  await c.execute('DELETE FROM survey_recipients WHERE survey_id=?',[scenario.id]);
  for(const u of eligible)await c.execute('INSERT INTO survey_recipients(survey_id,customer_id,sent_at) VALUES (?,?,?)',[scenario.id,u.id,dateAt(new Date(m.createdAt),0)]);
  const title='Khảo sát khách hàng 25–45 tuổi';
  await c.execute('UPDATE surveys SET title=?,description=?,audience_config=?,created_at=? WHERE id=?',[title,'Phiếu mới có phạm vi từ lúc tạo, chỉ gửi người đủ 25 đến hết 45 tuổi.',JSON.stringify(config),dateAt(new Date(m.createdAt),-1),scenario.id]);
  scenario.title=title;scenario.scope='FILTER';m.summary.recipients=83;
  await c.execute('UPDATE demo_datasets SET summary_json=? WHERE name=?',[JSON.stringify(m.summary),'backline-demo-v2']);
  await c.commit();
 }catch(e){await c.rollback();throw e;}finally{await c.end();}
 m.counts=await counts(m.database);const previousSQL=m.sqlFile;
 const result=await backup(path.resolve('outputs/Du_lieu_demo_CRM_v2_20261104.sql'),m.database);m.sqlFile=result.file;
 fs.writeFileSync(file,JSON.stringify(m,null,2));
 const outputRoot=path.resolve('outputs')+path.sep;assert.ok(path.resolve(previousSQL).startsWith(outputRoot));
 fs.unlinkSync(previousSQL);fs.unlinkSync(previousSQL+'.json');
 console.log(JSON.stringify({database:m.database,counts:m.counts,sqlFile:m.sqlFile,allOpenHaveScope:true},null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
