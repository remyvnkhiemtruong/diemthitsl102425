function traCuu() {
  const input = document.getElementById('sbdInput').value.trim();
  const ketQuaDiv = document.getElementById('ketQua');
  if (!input) {
    ketQuaDiv.innerHTML = "<span style='color:red'>Vui lòng nhập số báo danh hoặc tên.</span>";
    return;
  }

  let hs = data.find(item => item['SBD'] === input);
  let results = [];
  if (!hs) {
    const term = input.toLowerCase();
    results = data.filter(item => item['Họ và tên'].toLowerCase().includes(term));
    if (results.length === 1) {
      hs = results[0];
    }
  }

  if (!hs) {
    if (results.length > 1) {
      let list = '<p>Tìm thấy nhiều kết quả:</p><ul>';
      results.forEach(r => {
        list += `<li>${r['Họ và tên']} - SBD: ${r['SBD']} - Tổng điểm: ${r['Tổng điểm']}</li>`;
      });
      list += '</ul>';
      ketQuaDiv.innerHTML = list;
    } else {
      ketQuaDiv.innerHTML = "<span style='color:red'>❌ Không tìm thấy thí sinh.</span>";
    }
    return;
  }

  const tongDiem = parseFloat(hs['Tổng điểm']);
  let ketQua = '';
  if (!isNaN(tongDiem)) {
    ketQua = tongDiem >= 11.25 ? '✅ Đạt' : '❌ Trượt';
  }
  const ut = isNaN(parseFloat(hs['UT'])) ? '0' : hs['UT'];
  const kk = isNaN(parseFloat(hs['KK'])) ? '0' : hs['KK'];

  ketQuaDiv.innerHTML = `
    <table class="result-table">
      <tr><th>Họ và tên</th><td>${hs['Họ và tên']}</td></tr>
      <tr><th>Trường</th><td>${hs['Trường']}</td></tr>
      <tr><th>Ngữ văn</th><td>${hs['Ngữ văn']}</td></tr>
      <tr><th>Tiếng Anh</th><td>${hs['Tiếng Anh']}</td></tr>
      <tr><th>Toán</th><td>${hs['Toán']}</td></tr>
      <tr><th>Điểm ưu tiên</th><td>${ut}</td></tr>
      <tr><th>Điểm khuyến khích</th><td>${kk}</td></tr>
      <tr><th style="font-size: 1.1em;">Tổng điểm</th><td style="font-size: 1.4em; font-weight: bold;">${hs['Tổng điểm']}</td></tr>
      <tr><th>Kết quả</th><td>${ketQua}</td></tr>
    </table>
  `;
}

function hienThiThongKe() {
  const thongKeDiv = document.getElementById('thongKe');
  let tongDiemSum = 0;
  let diemCaoNhat = -Infinity;
  let diemThapNhat = Infinity;
  let soThiSinhDat = 0;
  let sumVan = 0, sumAnh = 0, sumToan = 0;
  const ranges = {
    '<10': 0,
    '10-15': 0,
    '15-20': 0,
    '20-25': 0,
    '>=25': 0,
  };
  const students = [];

  data.forEach(hs => {
    const diem = parseFloat(hs['Tổng điểm']);
    const van = parseFloat(hs['Ngữ văn']);
    const anh = parseFloat(hs['Tiếng Anh']);
    const toan = parseFloat(hs['Toán']);
    if (!isNaN(van)) sumVan += van;
    if (!isNaN(anh)) sumAnh += anh;
    if (!isNaN(toan)) sumToan += toan;

    if (!isNaN(diem)) {
      tongDiemSum += diem;
      if (diem > diemCaoNhat) diemCaoNhat = diem;
      if (diem < diemThapNhat) diemThapNhat = diem;
      if (diem >= 11.25) soThiSinhDat++;
      if (diem < 10) ranges['<10']++;
      else if (diem < 15) ranges['10-15']++;
      else if (diem < 20) ranges['15-20']++;
      else if (diem < 25) ranges['20-25']++;
      else ranges['>=25']++;
      students.push({ ten: hs['Họ và tên'], sbd: hs['SBD'], diem });
    }
  });

  if (students.length === 0) {
    thongKeDiv.innerHTML = 'Không có dữ liệu thống kê.';
    return;
  }

  const diemTrungBinh = (tongDiemSum / students.length).toFixed(2);
  const diemTBVan = (sumVan / students.length).toFixed(2);
  const diemTBAnh = (sumAnh / students.length).toFixed(2);
  const diemTBToan = (sumToan / students.length).toFixed(2);
  const tiLeDat = ((soThiSinhDat / students.length) * 100).toFixed(2);

  students.sort((a, b) => b.diem - a.diem);
  const top10 = students.slice(0, 10);
  let top10Html = '<ol>';
  top10.forEach(s => {
    top10Html += `<li>${s.ten} (${s.sbd}) - ${s.diem}</li>`;
  });
  top10Html += '</ol>';

  const bottom10 = [...students].sort((a, b) => a.diem - b.diem).slice(0, 10);
  let bottom10Html = '<ol>';
  bottom10.forEach(s => {
    bottom10Html += `<li>${s.ten} (${s.sbd}) - ${s.diem}</li>`;
  });
  bottom10Html += '</ol>';

  let rangeHtml = '<ul>';
  for (const [r, c] of Object.entries(ranges)) {
    rangeHtml += `<li>${r}: ${c}</li>`;
  }
  rangeHtml += '</ul>';

  thongKeDiv.innerHTML = `
    <h3>Thống kê</h3>
    <p>Số lượng thí sinh: ${students.length}</p>
    <p>Điểm trung bình: ${diemTrungBinh}</p>
    <p>Điểm TB Ngữ văn: ${diemTBVan}</p>
    <p>Điểm TB Tiếng Anh: ${diemTBAnh}</p>
    <p>Điểm TB Toán: ${diemTBToan}</p>
    <p>Điểm cao nhất: ${diemCaoNhat}</p>
    <p>Điểm thấp nhất: ${diemThapNhat}</p>
    <p>Số thí sinh đạt: ${soThiSinhDat} (${tiLeDat}%)</p>
    <h4>Top 10 thí sinh có điểm cao nhất:</h4>
    ${top10Html}
    <h4>Top 10 thí sinh có điểm thấp nhất:</h4>
    ${bottom10Html}
    <h4>Phân bố điểm:</h4>
    ${rangeHtml}
  `;
}

document.getElementById('sbdInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    traCuu();
  }
});
