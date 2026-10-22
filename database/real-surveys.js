// Nội dung dùng cho lần chuyển dữ liệu vào DB, không dùng làm dữ liệu dự phòng của giao diện.
module.exports=[
 {legacyId:'s1',title:'Mức độ hài lòng về dịch vụ',description:'Giúp chúng tôi cải thiện chất lượng tư vấn và chăm sóc khách hàng.',questions:[
  {type:'RATING',text:'Bạn đánh giá chung về dịch vụ của cửa hàng như thế nào?',required:true},
  {type:'ONE',text:'Bạn biết đến cửa hàng qua kênh nào?',required:true,options:['Bạn bè giới thiệu','Facebook / TikTok','Tìm kiếm Google','Đi ngang qua cửa hàng','Khác']},
  {type:'ONE',text:'Nhân viên tư vấn có nhiệt tình và hiểu sản phẩm không?',required:true,options:['Rất tốt','Tốt','Bình thường','Chưa tốt']},
  {type:'TEXT',text:'Bạn có góp ý gì thêm cho chúng tôi?',required:false}
 ]},
 {legacyId:'s2',title:'Nhu cầu mua sắm PC và laptop',description:'Cho chúng tôi biết dự định của bạn để gợi ý sản phẩm và ưu đãi phù hợp.',questions:[
  {type:'ONE',text:'Bạn dự định mua gì trong 6 tháng tới?',required:true,options:['Laptop','PC lắp sẵn','Linh kiện nâng cấp','Chưa có dự định']},
  {type:'MULTI',text:'Mục đích sử dụng chính (chọn nhiều đáp án)',required:true,options:['Gaming','Đồ họa / Thiết kế','Văn phòng / Học tập','Lập trình']},
  {type:'ONE',text:'Ngân sách dự kiến của bạn?',required:true,options:['Dưới 10 triệu','10 - 20 triệu','20 - 35 triệu','Trên 35 triệu']},
  {type:'TEXT',text:'Bạn quan tâm đến dòng máy hoặc cấu hình cụ thể nào?',required:false}
 ]},
 {legacyId:'s3',title:'Trải nghiệm bảo hành và hỗ trợ',description:'Đánh giá về quá trình bảo hành, sửa chữa tại cửa hàng.',questions:[
  {type:'RATING',text:'Bạn hài lòng thế nào về thời gian xử lý bảo hành?',required:true},
  {type:'TEXT',text:'Ý kiến khác',required:false}
 ]}
];
