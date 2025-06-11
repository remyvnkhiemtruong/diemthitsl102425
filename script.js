
function removeAccents(str) {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function traCuu() {
  const input = document.getElementById("sbdInput").value.trim();
  const ketQuaDiv = document.getElementById("ketQua");
  ketQuaDiv.innerHTML = "<span class='text-blue-500'>🔄 Đang tìm...</span>";

  if (!input) {
    ketQuaDiv.innerHTML = "<span class='text-red-500'>⚠️ Vui lòng nhập số báo danh hoặc họ tên.</span>";
    return;
  }

  setTimeout(() => {
    const term = removeAccents(input);
    let hs = data.find(item => item["SBD"] === input);
    let results = [];

    if (!hs) {
      results = data.filter(item => removeAccents(item["Họ và tên"]).includes(term));
      if (results.length === 1) hs = results[0];
    }

    if (!hs) {
      if (results.length > 1) {
        let list = '<p class="text-yellow-600">🔎 Tìm thấy nhiều kết quả:</p><ul class="list-disc ml-6">';
        results.forEach(r => {
          list += `<li>${r["Họ và tên"]} - SBD: <strong>${r["SBD"]}</strong> - Tổng điểm: <strong>${r["Tổng điểm"]}</strong></li>`;
        });
        list += "</ul>";
        ketQuaDiv.innerHTML = list;
      } else {
        ketQuaDiv.innerHTML = "<span class='text-red-500'>❌ Không tìm thấy thí sinh phù hợp.</span>";
      }
      return;
    }

    // Normalize missing fields
    const ut = hs["UT"] && hs["UT"] !== "nan" ? hs["UT"] : "Không";
    const kk = hs["KK"] && hs["KK"] !== "nan" ? hs["KK"] : "Không";

    const ketQua = `
      <div class="bg-green-50 border border-green-200 p-4 rounded-md shadow space-y-2">
        <h2 class="text-lg font-semibold text-green-700 mb-2">✅ Kết quả tra cứu</h2>
        <p><strong>👤 Họ tên:</strong> ${hs["Họ và tên"]}</p>
        <p><strong>🆔 Số báo danh:</strong> ${hs["SBD"]}</p>
        <p><strong>🎂 Ngày sinh:</strong> ${hs["Ngày sinh"] || "Không rõ"}</p>
        <p><strong🏫> Trường:</strong> ${hs["Trường"] || "Không rõ"}</p>
        <p><strong>📘 Ngữ văn:</strong> ${hs["Ngữ văn"]}</p>
        <p><strong>📐 Toán:</strong> ${hs["Toán"]}</p>
        <p><strong>🌐 Tiếng Anh:</strong> ${hs["Tiếng Anh"]}</p>
        <p><strong>🎖️ Ưu tiên:</strong> ${ut}</p>
        <p><strong>🏅 Khuyến khích:</strong> ${kk}</p>
        <p class="mt-2 text-xl text-green-800 font-bold">🎯 Tổng điểm: ${hs["Tổng điểm"]}</p>
      </div>`;
    ketQuaDiv.innerHTML = ketQua;
  }, 300);
}
