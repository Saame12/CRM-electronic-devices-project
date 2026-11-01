const path=require('node:path'),fs=require('node:fs'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
require(path.join(root,'node_modules/dotenv')).config({path:path.join(root,'.env'),quiet:true});
const mysql=require(path.join(root,'node_modules/mysql2/promise'));
const {setupDatabase,connectionOptions}=require(path.join(root,'scripts/setup-database'));
const {seedDemo}=require(path.join(root,'scripts/seed-demo'));
let child,c,owner,owned=false;const name='crm_ui_qa_'+crypto.randomBytes(8).toString('hex');
async function main(){
 owner=await mysql.createConnection({...connectionOptions(),multipleStatements:false});
 await owner.query('CREATE DATABASE `'+name+'` CHARACTER SET utf8mb4');owned=true;
 c=await setupDatabase(name);await seedDemo(c);await c.end();c=null;
 const net=require('node:net'),probe=net.createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));
 child=spawn(process.execPath,[path.join(root,'server.mysql.js')],{cwd:root,env:{...process.env,DB_NAME:name,PORT:String(port),JWT_SECRET:crypto.randomBytes(48).toString('hex')},windowsHide:true,stdio:'ignore'});
 const base='http://127.0.0.1:'+port;let ready=false;for(let i=0;i<80;i++){try{if((await fetch(base+'/api/health')).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,250))}if(!ready)throw Error('Preview server not ready');
 fs.writeFileSync(path.join(__dirname,'preview-runtime.json'),JSON.stringify({base,database:name,startedAt:new Date().toISOString()}));console.log('Preview ready: '+base);
 await new Promise(resolve=>{const timer=setInterval(()=>{if(fs.existsSync(path.join(__dirname,'stop-preview'))){clearInterval(timer);resolve()}},1000)});
}
(async()=>{try{await main()}catch(e){console.error(e.code||e.message)}finally{if(child&&!child.killed){child.kill();await new Promise(r=>child.once('exit',r))}if(c)await c.end();if(owner){if(owned&&/^crm_ui_qa_[a-f0-9]{16}$/.test(name)){await owner.query('DROP DATABASE `'+name+'`');console.log('Preview database cleaned')}await owner.end()}}})();
