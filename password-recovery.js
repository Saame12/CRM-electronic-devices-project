const crypto=require('node:crypto');
const bcrypt=require('bcryptjs');
const digest=token=>crypto.createHash('sha256').update(token).digest('hex');
const schema=`CREATE TABLE IF NOT EXISTS password_recovery_requests (
 id CHAR(36) PRIMARY KEY, customer_id CHAR(36) NULL, email VARCHAR(254) NOT NULL,
 token_hash CHAR(64) NOT NULL UNIQUE, status ENUM('PENDING','APPROVED','COMPLETED','REJECTED','EXPIRED','CANCELLED') NOT NULL DEFAULT 'PENDING',
 reason VARCHAR(500) NOT NULL, verification_note VARCHAR(500) NULL, reviewed_by CHAR(36) NULL, reviewer_name VARCHAR(120) NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, expires_at DATETIME NOT NULL,
 reviewed_at DATETIME NULL, completed_at DATETIME NULL, completion_seen BOOLEAN NOT NULL DEFAULT FALSE,
 INDEX idx_recovery_customer(customer_id), INDEX idx_recovery_status(status,created_at),
 CONSTRAINT fk_recovery_customer FOREIGN KEY(customer_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB`;
async function ensureSchema(db){
 const [columns]=await db.query("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='users' AND COLUMN_NAME='auth_version'");
 if(!columns.length)await db.query('ALTER TABLE users ADD COLUMN auth_version INT NOT NULL DEFAULT 0');
 await db.query(schema);
}
function register(app,db,auth,admin,wrap){
 const attempts=new Map();
 function limited(req,res,next){const key=req.ip||'local',now=Date.now();for(const [ip,a]of attempts)if(a.until<=now)attempts.delete(ip);const a=attempts.get(key)||{count:0,until:now+15*60*1000};a.count++;attempts.set(key,a);if(a.count>5)return res.status(429).json({error:'Bạn đã gửi nhiều yêu cầu. Vui lòng thử lại sau 15 phút.'});next()}
 const expire=()=>db.query("UPDATE password_recovery_requests SET status='EXPIRED' WHERE status IN ('PENDING','APPROVED') AND expires_at<=NOW()");
 async function findRequest(req){const token=String(req.headers['x-recovery-token']||'');if(!/^[a-f0-9]{64}$/.test(token))return null;const [[row]]=await db.execute('SELECT * FROM password_recovery_requests WHERE token_hash=?',[digest(token)]);return row}
 const state=row=>({status:row.status,reference:row.id.slice(0,8).toUpperCase(),expiresAt:row.expires_at,completedAt:row.completed_at});
 app.post('/api/password-recovery/requests',limited,wrap(async(req,res)=>{
  const email=String(req.body.email||'').trim().toLowerCase(),phone=String(req.body.phone||'').trim(),reason=String(req.body.reason||'').trim();
  if(!/^\S+@\S+\.\S+$/.test(email)||email.length>254||!/^0\d{9,10}$/.test(phone)||reason.length<5||reason.length>500)return res.status(400).json({error:'Nhập email, số điện thoại đã đăng ký và nội dung yêu cầu từ 5–500 ký tự.'});
  const [[customer]]=await db.execute("SELECT id FROM users WHERE email=? AND phone=? AND role='CUSTOMER' AND account_status='ACTIVE'",[email,phone]);
  const token=crypto.randomBytes(32).toString('hex'),id=crypto.randomUUID();
  await db.execute('INSERT INTO password_recovery_requests (id,customer_id,email,token_hash,reason,expires_at) VALUES (?,?,?,?,?,DATE_ADD(NOW(),INTERVAL 30 MINUTE))',[id,customer?.id||null,email,digest(token),reason]);
  res.status(201).json({token,reference:id.slice(0,8).toUpperCase(),status:'PENDING',message:'Đã tiếp nhận yêu cầu. Nếu thông tin phù hợp, Admin sẽ xác minh và xử lý. Giữ trình duyệt này để theo dõi.'});
 }));
 app.get('/api/password-recovery/status',wrap(async(req,res)=>{await expire();const row=await findRequest(req);if(!row)return res.status(401).json({error:'Phiên yêu cầu không hợp lệ. Vui lòng gửi yêu cầu mới.'});res.json(state(row))}));
 app.post('/api/password-recovery/complete',wrap(async(req,res)=>{
  const password=String(req.body.password||''),confirmation=String(req.body.confirmation||'');
  if(password.length<6||Buffer.byteLength(password,'utf8')>72||password!==confirmation)return res.status(400).json({error:'Hai mật khẩu phải trùng nhau, ít nhất 6 ký tự và tối đa 72 byte.'});
  await expire();const request=await findRequest(req);if(!request)return res.status(401).json({error:'Phiên yêu cầu không hợp lệ.'});
  if(request.status!=='APPROVED'||!request.customer_id)return res.status(409).json({error:'Yêu cầu chưa được duyệt, đã hết hạn hoặc đã sử dụng.'});
  const hash=await bcrypt.hash(password,12),connection=await db.getConnection();
  try{await connection.beginTransaction();
   const [[user]]=await connection.execute('SELECT id,role,account_status FROM users WHERE id=? FOR UPDATE',[request.customer_id]);
   const [[current]]=await connection.execute('SELECT *,expires_at>NOW() valid FROM password_recovery_requests WHERE id=? FOR UPDATE',[request.id]);
   if(!user||user.role!=='CUSTOMER'||user.account_status!=='ACTIVE'||current.status!=='APPROVED'||!current.valid){await connection.rollback();return res.status(409).json({error:'Quyền đổi mật khẩu không còn hiệu lực.'})}
   await connection.execute('UPDATE users SET password_hash=?,auth_version=auth_version+1 WHERE id=?',[hash,user.id]);
   await connection.execute("UPDATE password_recovery_requests SET status='COMPLETED',completed_at=NOW(),completion_seen=FALSE WHERE id=?",[request.id]);
   await connection.execute("UPDATE password_recovery_requests SET status='CANCELLED' WHERE customer_id=? AND id<>? AND status IN ('PENDING','APPROVED')",[user.id,request.id]);
   await connection.commit();res.json({status:'COMPLETED',message:'Đổi mật khẩu thành công. Admin đã được thông báo. Hãy đăng nhập bằng mật khẩu mới.'});
  }catch(e){await connection.rollback();throw e}finally{connection.release()}
 }));
 app.get('/api/admin/password-recovery',auth,admin,wrap(async(_req,res)=>{
  await expire();const [rows]=await db.query("SELECT r.id,r.email,r.reason,r.status,r.created_at,r.expires_at,r.reviewed_at,r.completed_at,r.verification_note,r.reviewer_name,r.completion_seen,u.full_name customer_name,u.phone registered_phone,u.role,u.account_status FROM password_recovery_requests r LEFT JOIN users u ON u.id=r.customer_id ORDER BY r.created_at DESC LIMIT 200");
  const [[counts]]=await db.query("SELECT SUM(status='PENDING') pending,SUM(status='COMPLETED' AND completion_seen=FALSE) unread FROM password_recovery_requests");
  res.json({requests:rows,pending:Number(counts.pending||0),unread:Number(counts.unread||0)});
 }));
 app.patch('/api/admin/password-recovery/:id',auth,admin,wrap(async(req,res)=>{
  const action=req.body.action,note=String(req.body.note||'').trim();if(!['approve','reject'].includes(action)||note.length<5||note.length>500||(action==='approve'&&req.body.verified!==true))return res.status(400).json({error:'Cần xác nhận đã xác minh khách và ghi chú xử lý từ 5–500 ký tự.'});
  await expire();const [result]=await db.execute(`UPDATE password_recovery_requests r LEFT JOIN users u ON u.id=r.customer_id SET r.status=?,r.verification_note=?,r.reviewed_by=?,r.reviewer_name=?,r.reviewed_at=NOW(),r.expires_at=CASE WHEN ?='APPROVED' THEN DATE_ADD(NOW(),INTERVAL 15 MINUTE) ELSE r.expires_at END WHERE r.id=? AND r.status='PENDING' AND r.expires_at>NOW() ${action==='approve'?"AND u.role='CUSTOMER' AND u.account_status='ACTIVE'":''}`,[action==='approve'?'APPROVED':'REJECTED',note,req.user.id,req.user.full_name,action==='approve'?'APPROVED':'REJECTED',req.params.id]);
  if(!result.affectedRows)return res.status(409).json({error:'Yêu cầu không còn chờ xử lý hoặc thông tin khách hàng không phù hợp.'});res.json({message:action==='approve'?'Đã cho phép khách tự đặt mật khẩu trong 15 phút.':'Đã từ chối yêu cầu.'});
 }));
 app.post('/api/admin/password-recovery/:id/seen',auth,admin,wrap(async(req,res)=>{await db.execute("UPDATE password_recovery_requests SET completion_seen=TRUE WHERE id=? AND status='COMPLETED'",[req.params.id]);res.json({message:'Đã đọc thông báo hoàn tất.'})}));
}
module.exports={register,ensureSchema,digest,schema};
