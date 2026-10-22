// Dùng chung ở giao diện và backend để kiểm tra ngày sinh thống nhất.
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.BirthDate=factory()})(typeof globalThis!=='undefined'?globalThis:this,function(){
 function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
 function validISO(value,limit=today()){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const [y,m,d]=value.split('-').map(Number),date=new Date(Date.UTC(y,m-1,d));
  return y>=1000&&date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d&&value<=limit;
 }
 function parse(value,limit=today()){
  const match=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(value||'').trim());
  if(!match)return null;const iso=`${match[3]}-${match[2]}-${match[1]}`;
  return validISO(iso,limit)?iso:null;
 }
 function fromDatabase(value){
  if(!value)return '';
  if(value instanceof Date)return `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,'0')}-${String(value.getDate()).padStart(2,'0')}`;
  return String(value).slice(0,10);
 }
 function display(value){const iso=fromDatabase(value);return /^\d{4}-\d{2}-\d{2}$/.test(iso)?`${iso.slice(8,10)}/${iso.slice(5,7)}/${iso.slice(0,4)}`:''}
 return {parse,validISO,display,fromDatabase};
});
