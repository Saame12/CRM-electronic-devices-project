// One-time execution authorized by the request to discard the old data and use the new set.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),mysql=require('mysql2/promise');
const {backup,restore}=require('../../scripts/database-backup'),{databaseName,connectionOptions}=require('../../scripts/setup-database');
(async()=>{
 const file=path.resolve(__dirname,'../demo-v2-manifest.json'),manifest=JSON.parse(fs.readFileSync(file,'utf8'));
 const source=databaseName(manifest.previousDatabase);assert.equal(databaseName(),manifest.database);assert.notEqual(source,manifest.database);assert.match(source,/^backline_crm(?:_[a-zA-Z0-9_]+)?$/);
 const previous=JSON.parse(fs.readFileSync(manifest.previousBackup+'.json','utf8'));assert.equal(previous.source,source);
 const allowed=new Set(['users','products','feedback','surveys','survey_questions','question_options','survey_recipients','survey_responses','response_details','interests','customer_interests','password_recovery_requests','customer_recovery_codes','demo_datasets']);
 assert.ok(Object.keys(previous.counts).every(t=>allowed.has(t)),'Unexpected tables: leave old DB intact');
 const tag=crypto.randomBytes(8).toString('hex'),latest=await backup(path.resolve('data/backups/retired-dataset-'+tag+'.sql'),source);
 assert.ok(Object.keys(latest.metadata.counts).every(t=>allowed.has(t)));manifest.previousBackup=latest.file;
 // Verify actual restoration before permanently dropping the explicitly named old dataset.
 const target='crm_retire_verify_'+tag;const verified=await restore(latest.file,target);
 const c=await mysql.createConnection({...connectionOptions(),multipleStatements:false});
 try{
  await c.query('SET SESSION lock_wait_timeout=10');
  await c.query('DROP DATABASE `'+target+'`');
  await c.query('DROP DATABASE `'+source+'`');
  manifest.previousDatabaseRemoved=true;manifest.previousBackupRestoredAndVerified=true;manifest.retiredAt=new Date().toISOString();
  fs.writeFileSync(file,JSON.stringify(manifest,null,2));console.log(JSON.stringify({databaseInUse:manifest.database,removedDatabase:source,backup:latest.file,restoreVerified:true,counts:verified.counts},null,2));
 }finally{await c.end();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
