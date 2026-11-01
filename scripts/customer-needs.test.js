const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const {buildOverview}=require('../reports-service');
test('Profile validation accepts undetermined need explicitly and rejects empty/missing/invalid selections',()=>{
 const V=require('../crm-validation');
 for(const need of ['Chưa xác định','Gaming'])assert.equal(V.profile({name:'Khách',phone:'0901234567',addr:'Hà Nội',birthDate:'1998-10-21',gender:'Nữ',need}).need,need);
 for(const need of ['',undefined,'Không hợp lệ'])assert.throws(()=>V.profile({name:'Khách',phone:'0901234567',addr:'Hà Nội',birthDate:'1998-10-21',gender:'Nữ',need}),V.InputError);
});
test('Reports count undetermined as a valid completed profile and distinguish missing need',()=>{
 const user={id:'a',address:'Hà Nội',birth_year:1998,birth_date:'1998-10-21',gender:'Nữ',need:'Chưa xác định',account_status:'ACTIVE',created_at:'2026-01-01'};
 const report=buildOverview([user,{...user,id:'b',need:''}],[],[],new Date('2026-10-24T00:00:00Z')).customers;
 assert.equal(report.complete,1);assert.equal(report.completionRate,50);
 assert.equal(report.byNeed.find(x=>x.label==='Chưa xác định').total,1);
 assert.equal(report.byNeed.find(x=>x.label==='Chưa chọn / chưa khai báo').total,1);
});

