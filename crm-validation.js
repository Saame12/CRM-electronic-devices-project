const BirthDate = require('./birth-date');
const Domain = require('./crm-domain');
class InputError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}
const fail = (message, status) => {
  throw new InputError(message, status);
};
function profile(body, { complete = true } = {}) {
  const name = String(body.name || '').trim(),
    phone = String(body.phone || '').trim();
  const addr = String(body.addr || '').trim(),
    gender = String(body.gender || '');
  const birthDate = String(body.birthDate || '').trim();
  const need = String(body.need || (complete ? '' : 'Chưa xác định'));
  if (!name || name.length > 120) fail('Họ và tên cần từ 1 đến 120 ký tự.');
  if (!/^0\d{9,10}$/.test(phone)) fail('Số điện thoại cần 10-11 chữ số và bắt đầu bằng 0.');
  if ((complete && !addr) || addr.length > 255) fail('Địa chỉ cần từ 1 đến 255 ký tự.');
  if ((complete || birthDate) && !BirthDate.validISO(birthDate))
    fail('Ngày sinh không hợp lệ hoặc nằm trong tương lai.');
  if ((complete || gender) && !['Nam', 'Nữ', 'Khác'].includes(gender))
    fail('Vui lòng chọn giới tính hợp lệ.');
  if (!Domain.needs.includes(need)) fail('Vui lòng chọn nhu cầu sử dụng hợp lệ.');
  let interests;
  if (body.interests !== undefined) {
    try {
      interests = Domain.interestIds(body.interests);
    } catch (e) {
      fail(e.message);
    }
  }
  return {
    name,
    phone,
    addr,
    gender,
    birthDate,
    year: birthDate ? Number(birthDate.slice(0, 4)) : null,
    need,
    interests
  };
}
function filters(value = {}) {
  const out = {};
  if (value.need) {
    if (!Domain.needs.includes(value.need)) fail('Bộ lọc nhu cầu không hợp lệ.');
    out.need = value.need;
  }
  if (value.interest) {
    if (!Domain.interests.some((x) => x.id === value.interest))
      fail('Bộ lọc sở thích không hợp lệ.');
    out.interest = value.interest;
  }
  for (const key of ['minAge', 'maxAge'])
    if (value[key] !== undefined && value[key] !== '') {
      const text = String(value[key]);
      if (!/^\d{1,3}$/.test(text) || Number(text) > 120)
        fail('Tuổi lọc phải là số nguyên từ 0 đến 120.');
      out[key] = Number(text);
    }
  if (out.minAge !== undefined && out.maxAge !== undefined && out.minAge > out.maxAge)
    fail('Tuổi tối thiểu phải nhỏ hơn hoặc bằng tuổi tối đa.');
  return out;
}
function survey(body, creating = false) {
  const title = String(body.title || '').trim(),
    description = String(body.description || '').trim();
  if (!title || title.length > 180 || !description)
    fail('Cần tiêu đề tối đa 180 ký tự và mô tả khảo sát.');
  if (!['DRAFT', 'OPEN', ...(creating ? [] : ['CLOSED'])].includes(body.status || 'DRAFT'))
    fail('Trạng thái khảo sát không hợp lệ.');
  const dueDate = body.dueDate || '';
  if (dueDate && !BirthDate.validISO(dueDate, '9999-12-31')) fail('Hạn khảo sát không hợp lệ.');
  if (!Array.isArray(body.questions) || !body.questions.length || body.questions.length > 100)
    fail('Khảo sát cần từ 1 đến 100 câu hỏi.');
  const questions = body.questions.map((q, i) => {
    if (!q || typeof q !== 'object') fail(`Câu ${i + 1} không hợp lệ.`);
    const text = String(q.text || '').trim(),
      type = q.type;
    if (!text || !['ONE', 'MULTI', 'TEXT', 'RATING'].includes(type))
      fail(`Nội dung hoặc loại câu ${i + 1} không hợp lệ.`);
    let options = [];
    if (['ONE', 'MULTI'].includes(type)) {
      options = (Array.isArray(q.options) ? q.options : String(q.options || '').split('\n'))
        .map((x) => String(x).trim())
        .filter(Boolean);
      if (
        options.length < 2 ||
        options.length > 100 ||
        options.some((x) => x.length > 255) ||
        new Set(options).size !== options.length
      )
        fail(`Câu ${i + 1} cần 2-100 lựa chọn khác nhau, mỗi lựa chọn tối đa 255 ký tự.`);
    }
    return { text, type, required: Boolean(q.required), options };
  });
  return {
    title,
    description,
    dueDate: dueDate || null,
    status: body.status || 'DRAFT',
    questions
  };
}
function answers(questions, options, values) {
  if (!values || typeof values !== 'object' || Array.isArray(values))
    fail('Câu trả lời phải là một đối tượng hợp lệ.');
  const known = new Set(questions.map((q) => 'q' + (q.display_order - 1)));
  if (Object.keys(values).some((key) => !known.has(key)))
    fail('Câu trả lời chứa câu hỏi không thuộc khảo sát.');
  const details = [];
  for (const q of questions) {
    const v = values['q' + (q.display_order - 1)],
      type = q.question_type;
    const empty =
      v === undefined ||
      v === null ||
      v === '' ||
      (Array.isArray(v) && v.length === 0) ||
      (type === 'TEXT' && typeof v === 'string' && !v.trim());
    if (empty) {
      if (q.is_required) fail(`Câu ${q.display_order} là bắt buộc.`);
      continue;
    }
    if (type === 'TEXT') {
      if (typeof v !== 'string' || v.trim().length > 5000)
        fail(`Câu ${q.display_order} cần văn bản tối đa 5000 ký tự.`);
      details.push({ questionId: q.id, text: v.trim() });
    } else if (type === 'RATING') {
      if (!Number.isInteger(v) || v < 1 || v > 5)
        fail(`Câu ${q.display_order} cần số sao nguyên từ 1 đến 5.`);
      details.push({ questionId: q.id, rating: v });
    } else {
      if (type === 'ONE' && typeof v !== 'string')
        fail(`Câu ${q.display_order} chỉ nhận một đáp án.`);
      if (
        type === 'MULTI' &&
        (!Array.isArray(v) || v.some((x) => typeof x !== 'string') || new Set(v).size !== v.length)
      )
        fail(`Câu ${q.display_order} cần danh sách đáp án không trùng.`);
      const selected = new Set();
      for (const item of type === 'ONE' ? [v] : v) {
        const option = options.find(
          (o) => o.question_id === q.id && (o.id === item || o.option_text === item)
        );
        if (!option) fail(`Đáp án câu ${q.display_order} không hợp lệ.`);
        if (selected.has(option.id)) fail(`Đáp án câu ${q.display_order} bị trùng.`);
        selected.add(option.id);
        details.push({ questionId: q.id, optionId: option.id });
      }
    }
  }
  return details;
}
module.exports = { InputError, fail, profile, filters, survey, answers };
