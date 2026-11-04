const fs=require('node:fs'),mysql=require('mysql2/promise'),assert=require('node:assert/strict');
const {counts}=require('../../scripts/database-backup'),{connectionOptions,databaseName}=require('../../scripts/setup-database');
(async()=>{
 const name=databaseName(),backup='data/backups/truoc-sua-dong-bo-khao-sat-20261103.sql';
 const before=JSON.parse(fs.readFileSync(backup+'.json','utf8')).counts,after=await counts(name);assert.deepEqual(after,before);
 const c=await mysql.createConnection({...connectionOptions(),database:name,multipleStatements:false});
 try{
  const [surveys]=await c.query("SELECT id,title,status,DATE_FORMAT(due_date,'%Y-%m-%d') dueDate,accept_new_customers FROM surveys WHERE status='OPEN' ORDER BY id");
  const result={checkedAt:new Date().toISOString(),database:name,backup,countsUnchanged:true,counts:after,openSurveys:surveys};
  fs.writeFileSync('outputs/qa/survey-sync-live-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 }finally{await c.end();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
