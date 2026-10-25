const COOKIE='backline_customer_session';
function cookieToken(req){const item=String(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='));if(!item)return '';try{return decodeURIComponent(item.slice(COOKIE.length+1))}catch(_){return ''}}
const options=req=>({httpOnly:true,sameSite:'lax',secure:Boolean(req.secure)||process.env.NODE_ENV==='production',path:'/'});
// LOGIC PHIÊN: Chỉ CUSTOMER từ trang khách nhận cookie HttpOnly; nhớ đăng nhập: token/cookie 7 ngày.
// Không tích nhớ: token 8 giờ, cookie phiên. Admin/Manager dùng Bearer token trong sessionStorage.
function issue(req,res,user,sign){const customer=req.body.customerSession===true&&user.role==='CUSTOMER',remember=customer&&req.body.remember===true;const token=sign(user,remember?'7d':'8h');if(customer)res.cookie(COOKIE,token,{...options(req),...(remember?{maxAge:7*24*60*60*1000}:{})});res.set('Cache-Control','no-store');return token}
// LOGIC: Xóa cookie trên trình duyệt; không xóa user, feedback hoặc kết quả khảo sát trong DB.
function clear(req,res){res.clearCookie(COOKIE,options(req));res.set('Cache-Control','no-store')}
module.exports={cookieToken,issue,clear,COOKIE};
