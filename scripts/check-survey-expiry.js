// Real MySQL boundary checks use a temporary table on one private connection.
require('dotenv').config({quiet:true});
const assert=require('node:assert/strict');
const mysql=require('mysql2/promise');
const Expiry=require('../survey-expiry');
async function main(){
 const c=await mysql.createConnection({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD,database:process.env.DB_NAME});
 try{
  await c.query("SET time_zone='-05:00'");
  await c.query('CREATE TEMPORARY TABLE surveys (id VARCHAR(30) PRIMARY KEY,status VARCHAR(10),due_date DATE NULL,auto_closed_at DATETIME NULL)');
  await c.query("INSERT INTO surveys(id,status,due_date) VALUES ('yesterday','OPEN','2026-11-02'),('deadline','OPEN','2026-11-03'),('future','OPEN','2026-11-04'),('unlimited','OPEN',NULL),('draft','DRAFT','2026-11-02'),('closed','CLOSED','2026-11-02')");
  await c.query('SET timestamp=?',[Date.parse('2026-11-03T16:59:59Z')/1000]);
  assert.equal(await Expiry.closeExpired(c),1);
  let [rows]=await c.query("SELECT status FROM surveys WHERE id='deadline'");assert.equal(rows[0].status,'OPEN');
  await c.query('SET timestamp=?',[Date.parse('2026-11-03T17:00:00Z')/1000]);
  assert.equal(await Expiry.closeExpired(c),1);
  [rows]=await c.query('SELECT id,status,auto_closed_at FROM surveys');
  const byId=Object.fromEntries(rows.map(r=>[r.id,r]));
  assert.equal(byId.deadline.status,'CLOSED');assert.ok(byId.deadline.auto_closed_at);
  for(const id of ['future','unlimited'])assert.equal(byId[id].status,'OPEN');
  assert.equal(byId.draft.status,'DRAFT');assert.equal(byId.closed.auto_closed_at,null);
  assert.equal(rows.length,6);assert.equal(await Expiry.closeExpired(c),0);
  console.log('PASS MySQL: 23:59:59/00:00 Vietnam, independent DB timezone, no-deadline, DRAFT, manual CLOSED, idempotence; temporary fixtures only.');
 }finally{await c.end();}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
