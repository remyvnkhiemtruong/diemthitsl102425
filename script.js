
function traCuu() {
  const sbd = document.getElementById("sbdInput").value.trim();
  const ketQuaDiv = document.getElementById("ketQua");
  const hs = data.find(item => item["SBD"] === sbd);

  if (!hs) {
    ketQuaDiv.innerHTML = "<span style='color:red'>❌ Không tìm thấy số báo danh này.</span>";
  } else {
    const tongDiem = parseFloat(hs["Tổng điểm"]);
    let ketQua = "";

    if (!isNaN(tongDiem)) {
      ketQua = tongDiem >= 11.25 ? "✅ Đạt" : "❌ Trượt";
    }

    const ut = isNaN(parseFloat(hs["UT"])) ? "0" : hs["UT"];
    const kk = isNaN(parseFloat(hs["KK"])) ? "0" : hs["KK"];

    ketQuaDiv.innerHTML = `
      <table class="result-table">
        <tr><th>Họ và tên</th><td>${hs["Họ và tên"]}</td></tr>
        <tr><th>Trường</th><td>${hs["Trường"]}</td></tr>
        <tr><th>Ngữ văn</th><td>${hs["Ngữ văn"]}</td></tr>
        <tr><th>Tiếng Anh</th><td>${hs["Tiếng Anh"]}</td></tr>
        <tr><th>Toán</th><td>${hs["Toán"]}</td></tr>
        <tr><th>Điểm ưu tiên</th><td>${ut}</td></tr>
        <tr><th>Điểm khuyến khích</th><td>${kk}</td></tr>
        <tr><th style="font-size: 1.1em;">Tổng điểm</th><td style="font-size: 1.4em; font-weight: bold;">${hs["Tổng điểm"]}</td></tr>
        <tr><th>Kết quả</th><td>${ketQua}</td></tr>
      </table>
    `;
  }
}

function hienThiThongKe() {
  const thongKeDiv = document.getElementById("thongKe");
  let tongDiemSum = 0;
  let diemCaoNhat = -Infinity;
  let diemThapNhat = Infinity;
  let soThiSinhDat = 0;
  const students = [];

  data.forEach(hs => {
    const diem = parseFloat(hs["Tổng điểm"]);
    if (!isNaN(diem)) {
      tongDiemSum += diem;
      if (diem > diemCaoNhat) diemCaoNhat = diem;
      if (diem < diemThapNhat) diemThapNhat = diem;
      if (diem >= 11.25) soThiSinhDat++;
      students.push({ ten: hs["Họ và tên"], sbd: hs["SBD"], diem });
    }
  });

  if (students.length === 0) {
    thongKeDiv.innerHTML = "Không có dữ liệu thống kê.";
    return;
  }

  const diemTrungBinh = (tongDiemSum / students.length).toFixed(2);
  const tiLeDat = ((soThiSinhDat / students.length) * 100).toFixed(2);

  students.sort((a, b) => b.diem - a.diem);
  const top10 = students.slice(0, 10);
  let top10Html = "<ol>";
  top10.forEach(s => {
    top10Html += `<li>${s.ten} (${s.sbd}) - ${s.diem}</li>`;
  });
  top10Html += "</ol>";

  thongKeDiv.innerHTML = `
    <h3>Thống kê</h3>
    <p>Số lượng thí sinh: ${students.length}</p>
    <p>Điểm trung bình: ${diemTrungBinh}</p>
    <p>Điểm cao nhất: ${diemCaoNhat}</p>
    <p>Điểm thấp nhất: ${diemThapNhat}</p>
    <p>Số thí sinh đạt: ${soThiSinhDat} (${tiLeDat}%)</p>
    <h4>Top 10 thí sinh có điểm cao nhất:</h4>
    ${top10Html}
  `;
}
