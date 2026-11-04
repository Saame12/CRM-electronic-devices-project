const fs=require('node:fs'),assert=require('node:assert/strict'),mysql=require('mysql2/promise');
const {connectionOptions,databaseName}=require('../../scripts/setup-database'),{counts}=require('../../scripts/database-backup');
(async()=>{
 const backup='data/backups/truoc-bat-buoc-pham-vi-20261103.sql',name=databaseName();
 const before=JSON.parse(fs.readFileSync(backup+'.json','utf8')).counts;
 const c=await mysql.createConnection({...connectionOptions(),database:name,multipleStatements:false});
 try{
  await require('../../survey-audience').ensureSchema(c);
  const after=await counts(name);assert.deepEqual(after,before,'Migration must preserve every table count');
  const [surveys]=await c.query('SELECT id,title,status,audience_config,accept_new_customers FROM surveys ORDER BY created_at');
  for(const s of surveys)if(s.accept_new_customers)assert.equal(require('../../survey-audience').parse(s.audience_config)?.mode,'ALL');
  const result={checkedAt:new Date().toISOString(),database:name,backup,countsUnchanged:true,counts:after,surveys:surveys.map(s=>({id:s.id,title:s.title,status:s.status,scope:require('../../survey-audience').parse(s.audience_config)?.mode||null}))};
  fs.writeFileSync('outputs/qa/saved-audience-live-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 }finally{await c.end();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
