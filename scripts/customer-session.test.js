const test=require('node:test'),assert=require('node:assert/strict');
const session=require('../customer-session');
function response(){return {cookies:[],cleared:[],set(){},cookie(...args){this.cookies.push(args)},clearCookie(...args){this.cleared.push(args)}}}
test('Remember me uses a persistent HttpOnly cookie and a matching seven-day token',()=>{
 const res=response();let duration;session.issue({body:{customerSession:true,remember:true},secure:false},res,{role:'CUSTOMER'},(_,expires)=>{duration=expires;return 'signed-token'});
 assert.equal(duration,'7d');const [name,value,options]=res.cookies[0];assert.equal(name,session.COOKIE);assert.equal(value,'signed-token');assert.equal(options.maxAge,604800000);assert.equal(options.httpOnly,true);assert.equal(options.sameSite,'lax');assert.equal(options.path,'/');
});
test('Unchecked remember me sets a session cookie, not seven-day persistence',()=>{
 const res=response();let duration;session.issue({body:{customerSession:true},secure:true},res,{role:'CUSTOMER'},(_,expires)=>{duration=expires;return 'session-token'});
 assert.equal(duration,'8h');assert.equal(res.cookies[0][2].maxAge,undefined);assert.equal(res.cookies[0][2].secure,true);
});
test('Admin and manager login do not create a customer cookie',()=>{
 for(const role of ['ADMIN','MANAGER']){const res=response();session.issue({body:{customerSession:true,remember:true}},res,{role},()=> 'staff-token');assert.equal(res.cookies.length,0)}
});
test('Cookie parsing matches the exact name and handles invalid input safely',()=>{
 assert.equal(session.cookieToken({headers:{cookie:'unrelated=x; '+session.COOKIE+'=token.value; other=y'}}),'token.value');
 assert.equal(session.cookieToken({headers:{cookie:'other_'+session.COOKIE+'=fake'}}),'');assert.equal(session.cookieToken({headers:{cookie:session.COOKIE+'=%invalid'}}),'');
});
test('Logout clears the same cookie path and security options',()=>{
 const res=response();session.clear({secure:true},res);assert.equal(res.cleared[0][0],session.COOKIE);assert.equal(res.cleared[0][1].path,'/');assert.equal(res.cleared[0][1].httpOnly,true);assert.equal(res.cleared[0][1].secure,true);
});
