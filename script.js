
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
        <tr><th>Kết quả(dự kiến): </th><td>${ketQua}</td></tr>
      </table>
    `;
  }
}
