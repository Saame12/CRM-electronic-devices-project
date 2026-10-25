const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const {buildOverview}=require('../reports-service');
test('Profile API accepts undetermined need explicitly and rejects empty/missing/invalid selections',async()=>{
 const source=fs.readFileSync(path.join(__dirname,'..','server.mysql.js'),'utf8');
 const start=source.indexOf("app.put('/api/me'"),end=source.indexOf("app.get('/api/admin/accounts'",start);
 for(const [need,expected]of [['Chưa xác định',200],['Gaming',200],['',400],[undefined,400],['Không hợp lệ',400]]){
  let handler,stored,status=200,data;
  const context=vm.createContext({app:{put:(_path,...handlers)=>handler=handlers.at(-1)},auth(){},wrap:f=>f,
   BirthDate:require('../birth-date'),phoneOk:v=>/^0\d{9,10}$/.test(v),needs:['Gaming','Đồ họa','Văn phòng','Chưa xác định'],
   db:{execute:async(sql,values)=>{if(sql.startsWith('UPDATE')){stored=values[6];return [{affectedRows:1}]}return [[{need:stored}]]}},publicUser:u=>u});
  vm.runInContext(source.slice(start,end),context);
  await handler({user:{id:'customer'},body:{name:'Khách',phone:'0901234567',addr:'Hà Nội',birthDate:'1998-10-21',gender:'Nữ',need}},
   {status(n){status=n;return this},json(d){data=d}});
  assert.equal(status,expected,String(need));if(expected===200){assert.equal(stored,need);assert.equal(data.user.need,need)}else assert.equal(stored,undefined);
 }
});
test('Reports count undetermined as a valid completed profile and distinguish missing need',()=>{
 const user={id:'a',address:'Hà Nội',birth_year:1998,gender:'Nữ',need:'Chưa xác định',account_status:'ACTIVE',created_at:'2026-01-01'};
 const report=buildOverview([user,{...user,id:'b',need:''}],[],[],new Date('2026-10-24T00:00:00Z')).customers;
 assert.equal(report.complete,1);assert.equal(report.completionRate,50);
 assert.equal(report.byNeed.find(x=>x.label==='Chưa xác định').total,1);
 assert.equal(report.byNeed.find(x=>x.label==='Chưa chọn / chưa khai báo').total,1);
});

