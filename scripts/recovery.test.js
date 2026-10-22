const test=require('node:test'),assert=require('node:assert/strict'),bcrypt=require('bcryptjs');
const {register,digest}=require('../password-recovery');
function setup(row={status:'PENDING',customer_id:'customer'}){
 const routes=new Map(),calls=[],state={row,version:0,hash:null};
 const db={query:async(sql)=>{calls.push([sql]);return [[]]},execute:async(sql,values)=>{calls.push([sql,values]);if(sql.includes('WHERE token_hash='))return [[state.row]];if(sql.includes("SELECT id FROM users WHERE email"))return [[{id:'customer'}]];return [{affectedRows:1}]},getConnection:async()=>({beginTransaction:async()=>{},rollback:async()=>calls.push(['rollback']),commit:async()=>calls.push(['commit']),release(){},execute:async(sql,values)=>{calls.push([sql,values]);if(sql.includes('FROM users WHERE id='))return [[{id:'customer',role:'CUSTOMER',account_status:'ACTIVE'}]];if(sql.includes('FOR UPDATE'))return [[{...state.row,valid:state.row.valid??1}]];if(sql.startsWith('UPDATE users')){state.hash=values[0];state.version++}if(sql.includes("status='COMPLETED'"))state.row.status='COMPLETED';return [{affectedRows:1}]}})};
 const auth=()=>{},admin=()=>{};const app={get:(url,...handlers)=>routes.set('GET '+url,handlers),post:(url,...handlers)=>routes.set('POST '+url,handlers),patch:(url,...handlers)=>routes.set('PATCH '+url,handlers)};register(app,db,auth,admin,x=>x);
 async function request(method,url,body={},extra={}){let result;const res={statusCode:200,status(code){this.statusCode=code;return this},json(data){result={code:this.statusCode,data};return this}};await routes.get(method+' '+url).at(-1)({body,headers:{'x-recovery-token':'a'.repeat(64)},params:{id:'request'},user:{id:'admin',full_name:'Admin'},...extra},res);return result}
 return {request,state,calls,routes,auth,admin};
}
test('A request receives an unguessable browser token; database stores only its hash',async()=>{
 const s=setup(),r=await s.request('POST','/api/password-recovery/requests',{email:'test@example.com',phone:'0901234567',reason:'Quên mật khẩu'});assert.equal(r.code,201);assert.match(r.data.token,/^[a-f0-9]{64}$/);const insert=s.calls.find(x=>x[0].startsWith('INSERT'));assert.equal(insert[1][3],digest(r.data.token));assert.ok(!JSON.stringify(insert).includes(r.data.token));
});
test('No password change before approval, after expiry, rejection or previous use',async()=>{
 for(const status of ['PENDING','EXPIRED','REJECTED','COMPLETED','CANCELLED']){const s=setup({id:'r',status,customer_id:'customer'}),r=await s.request('POST','/api/password-recovery/complete',{password:'example-pass',confirmation:'example-pass'});assert.equal(r.code,409);assert.equal(s.state.hash,null)}
});
test('Approved request updates hash, revokes sessions, then notifies completion atomically',async()=>{
 const s=setup({id:'r',status:'APPROVED',customer_id:'customer'});const r=await s.request('POST','/api/password-recovery/complete',{password:'example-pass',confirmation:'example-pass'});assert.equal(r.code,200);assert.equal(s.state.version,1);assert.ok(await bcrypt.compare('example-pass',s.state.hash));assert.equal(s.state.row.status,'COMPLETED');assert.ok(s.calls.some(x=>x[0].includes('completion_seen=FALSE')));assert.ok(s.calls.some(x=>x[0]==='commit'));
 const replay=await s.request('POST','/api/password-recovery/complete',{password:'different-pass',confirmation:'different-pass'});assert.equal(replay.code,409);assert.equal(s.state.version,1);
});
test('Expiry is checked again under lock, and mismatched passwords do not write',async()=>{
 const s=setup({id:'r',status:'APPROVED',customer_id:'customer',valid:0});assert.equal((await s.request('POST','/api/password-recovery/complete',{password:'example-pass',confirmation:'example-pass'})).code,409);assert.equal(s.state.hash,null);
 assert.equal((await s.request('POST','/api/password-recovery/complete',{password:'example-pass',confirmation:'other-pass'})).code,400);
});
test('Administrator must explicitly verify owner and record an explanation',async()=>{
 const s=setup();assert.equal((await s.request('PATCH','/api/admin/password-recovery/:id',{action:'approve',note:'Đã liên hệ'})).code,400);assert.equal((await s.request('PATCH','/api/admin/password-recovery/:id',{action:'approve',verified:true,note:'Đã xác minh qua số điện thoại đăng ký'})).code,200);
 for(const [url,handlers]of s.routes){if(url.includes('/api/admin/')){assert.equal(handlers[0],s.auth);assert.equal(handlers[1],s.admin)}}
});
test('Unknown or malformed browser token cannot change password',async()=>{
 const s=setup(null);assert.equal((await s.request('GET','/api/password-recovery/status',{}, {headers:{'x-recovery-token':'guess'}})).code,401);assert.equal((await s.request('POST','/api/password-recovery/complete',{password:'example-pass',confirmation:'example-pass'})).code,401);
});
