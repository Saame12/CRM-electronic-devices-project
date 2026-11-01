const fs=require('node:fs'),assert=require('node:assert/strict');
const mysql=require('mysql2/promise'),{connectionOptions,databaseName}=require('../../scripts/setup-database'),{counts}=require('../../scripts/database-backup');
(async()=>{
 const verification=JSON.parse(fs.readFileSync('outputs/qa/backup-restore-results.json','utf8'));assert.equal(verification.status,'PASS');
 const name=databaseName(),before=await counts(name);
 const c=await mysql.createConnection({...connectionOptions(),database:name,multipleStatements:false});
 try{await require('../../customer-interests').ensureSchema(c);}finally{await c.end();}
 const after=await counts(name);for(const key of Object.keys(before))assert.equal(after[key],before[key],key);
 const result={checkedAt:new Date().toISOString(),database:name,backup:verification.backup,before,after,oldTablesUnchanged:true};fs.writeFileSync('outputs/qa/migration-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
