const mysql=require('mysql2/promise'),assert=require('node:assert/strict'),fs=require('node:fs');
const {connectionOptions,databaseName}=require('../../scripts/setup-database');
const {counts}=require('../../scripts/database-backup');
(async()=>{
 // This exact database was created by the initial restore command in this session.
 const target='crm_restore_acceptance_20261101';assert.notEqual(target,databaseName());
 const meta=JSON.parse(fs.readFileSync('data/backups/backline_crm-2026-11-01T05-00-18-129Z.sql.json','utf8'));
 assert.deepEqual(await counts(target),meta.counts,'Leave database intact if it changed after our restore');
 const c=await mysql.createConnection({...connectionOptions(),multipleStatements:false});
 try{await c.query('DROP DATABASE `crm_restore_acceptance_20261101`');console.log('Đã dọn database phục hồi ban đầu do phiên kiểm thử này tạo.');}finally{await c.end();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
