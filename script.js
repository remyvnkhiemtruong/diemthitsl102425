let students = [];
let lang = "vi";
const i18n = {
  vi: {
    detailTitle: "Thông tin học sinh",
    export: "Xuất PDF",
    close: "Đóng",
    chartSchool: "Điểm TB theo trường",
    chartHocLuc: "Phân loại học lực",
    chartLop: "Điểm TB theo lớp",
    chartMon: "Điểm TB theo môn"
  },
  en: {
    detailTitle: "Student Information",
    export: "Export PDF",
    close: "Close",
    chartSchool: "Average score by school",
    chartHocLuc: "Academic classification",
    chartLop: "Average score by class",
    chartMon: "Average score by subject"
  }
};

function setLang(l) {
  lang = l;
  document.querySelector(".modal-title").innerText = i18n[lang].detailTitle;
  document.querySelector("#detailModal .btn-outline-primary").innerText = "📄 " + i18n[lang].export;
  document.querySelector("#detailModal .btn-secondary").innerText = i18n[lang].close;
  document.querySelector("h5.text-center.mb-3").innerText = "📊 " + i18n[lang].chartSchool;
  document.querySelectorAll("h5.text-center.mb-3")[1].innerText = "📊 " + i18n[lang].chartHocLuc;
  document.querySelectorAll("h5.text-center.mb-3")[2].innerText = "📘 " + i18n[lang].chartLop;
  document.querySelectorAll("h5.text-center.mb-3")[3].innerText = "📚 " + i18n[lang].chartMon;
}

document.addEventListener("DOMContentLoaded", () => {
  const script = document.createElement("script");
  script.src = "data.js";
  script.onload = () => {
    students = studentsData;
    populateFilters();
    renderTable();
  };
  document.head.appendChild(script);
});

function populateFilters() {
  const schools = [...new Set(students.map(s => s["Trường"]))];
  const classes = [...new Set(students.map(s => s["Lớp"]))];
  const selSchool = document.getElementById("filterSchool");
  const selClass = document.getElementById("filterClass");
  schools.forEach(s => selSchool.innerHTML += `<option value="${s}">${s}</option>`);
  classes.forEach(c => selClass.innerHTML += `<option value="${c}">${c}</option>`);
}

function normalize(str) {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function renderTable() {
  const kw = normalize(document.getElementById("searchInput").value.trim());
  const school = document.getElementById("filterSchool").value;
  const lop = document.getElementById("filterClass").value;
  const result = document.getElementById("filterResult").value;
  const min = parseFloat(document.getElementById("filterMin").value) || 0;
  const useCard = document.getElementById("toggleCard").checked;
  const table = document.getElementById("tableContainer");
  const card = document.getElementById("cardContainer");
  const body = document.getElementById("tableBody");
  body.innerHTML = "";
  card.innerHTML = "";

  const filtered = students.filter(s =>
    (normalize(s["Họ và tên"]).includes(kw) || s["SBD"].toString().includes(kw)) &&
    (school === "" || s["Trường"] === school) &&
    (lop === "" || s["Lớp"] === lop) &&
    (result === "" || s["Kết quả"] === result) &&
    s["Tổng điểm"] >= min
  );

  table.classList.toggle("d-none", useCard);
  card.classList.toggle("d-none", !useCard);

  if (filtered.length === 0) {
    document.getElementById("noResult").classList.remove("d-none");
    return;
  } else document.getElementById("noResult").classList.add("d-none");

  filtered.forEach(s => {
    if (useCard) {
      const div = document.createElement("div");
      div.className = "col-md-4";
      div.innerHTML = `
        <div class="card-student ${s["Kết quả"] === "Trượt" ? "highlight-fail" : ""}">
          <h5>${s["Họ và tên"]} (${s["SBD"]})</h5>
          <p><strong>Trường:</strong> ${s["Trường"]}</p>
          <p><strong>Lớp:</strong> ${s["Lớp"]}</p>
          <p><strong>Điểm:</strong> ${s["Tổng điểm"]} – ${s["Kết quả"]}</p>
          <button class="btn btn-sm btn-outline-primary" onclick='showDetail(${JSON.stringify(s)})'>Chi tiết</button>
        </div>`;
      card.appendChild(div);
    } else {
      const row = document.createElement("tr");
      if (s["Kết quả"] === "Trượt") row.classList.add("highlight-fail");
      row.innerHTML = `
        <td>${s["SBD"]}</td><td>${s["Họ và tên"]}</td><td>${s["Trường"]}</td><td>${s["Lớp"]}</td>
        <td>${s["Ngữ văn"]}</td><td>${s["Toán"]}</td><td>${s["Tiếng Anh"]}</td>
        <td>${s["UT"]}</td><td>${s["KK"]}</td><td>${s["Tổng điểm"]}</td>
        <td>${s["Kết quả"] === "Đạt" ? "✅" : "⚠️"}</td>`;
      row.onclick = () => showDetail(s);
      body.appendChild(row);
    }
  });

  drawCharts(filtered);
}

function startApp() {
  document.getElementById("landingPage").classList.add("d-none");
  document.getElementById("mainApp").classList.remove("d-none");
}

function showDetail(s) {
  const b = document.getElementById("modalBody");
  b.innerHTML = `
    <p><strong>Họ tên:</strong> ${s["Họ và tên"]}</p>
    <p><strong>SBD:</strong> ${s["SBD"]}</p>
    <p><strong>Trường:</strong> ${s["Trường"]}</p>
    <p><strong>Lớp:</strong> ${s["Lớp"]}</p>
    <p><strong>Văn:</strong> ${s["Ngữ văn"]}, <strong>Toán:</strong> ${s["Toán"]}, <strong>Anh:</strong> ${s["Tiếng Anh"]}</p>
    <p><strong>UT:</strong> ${s["UT"]}, <strong>KK:</strong> ${s["KK"]}</p>
    <p><strong>Tổng điểm:</strong> ${s["Tổng điểm"]} – <strong>${s["Kết quả"]}</strong></p>`;
  window.selectedStudent = s;
  new bootstrap.Modal(document.getElementById("detailModal")).show();
}

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const s = window.selectedStudent;
  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text("PHIẾU TRA CỨU KẾT QUẢ TUYỂN SINH", 20, 20);
  doc.text(`Họ tên: ${s["Họ và tên"]}`, 20, 30);
  doc.text(`SBD: ${s["SBD"]} | Trường: ${s["Trường"]} | Lớp: ${s["Lớp"]}`, 20, 38);
  doc.text(`Ngữ văn: ${s["Ngữ văn"]} | Toán: ${s["Toán"]} | Anh: ${s["Tiếng Anh"]}`, 20, 46);
  doc.text(`Ưu tiên: ${s["UT"]} | KK: ${s["KK"]}`, 20, 54);
  doc.text(`Tổng điểm: ${s["Tổng điểm"]} – ${s["Kết quả"]}`, 20, 62);
  doc.save(`${s["SBD"]}_${s["Họ và tên"]}.pdf`);
}

function drawCharts(data) {
  const groupAvg = (byKey, field) => {
    const map = {};
    data.forEach(s => {
      const k = s[byKey];
      if (!map[k]) map[k] = { sum: 0, count: 0 };
      map[k].sum += s[field];
      map[k].count++;
    });
    return Object.keys(map).map(k => ({ key: k, avg: (map[k].sum / map[k].count).toFixed(2) }));
  };

  const hocLuc = { "Đạt": 0, "Trượt": 0 };
  data.forEach(s => {
    hocLuc[s["Kết quả"]]++;
  });

  const ctxHL = document.getElementById("chartHocLuc").getContext("2d");
  const ctxLop = document.getElementById("chartLop").getContext("2d");
  const ctxMon = document.getElementById("chartMon").getContext("2d");

  if (window.hlChart) window.hlChart.destroy();
  if (window.lopChart) window.lopChart.destroy();
  if (window.monChart) window.monChart.destroy();

  window.hlChart = new Chart(ctxHL, {
    type: "pie",
    data: {
      labels: Object.keys(hocLuc),
      datasets: [{ data: Object.values(hocLuc), backgroundColor: ["#0d6efd", "#198754", "#ffc107", "#dc3545"] }]
    }
  });

  const lopStats = groupAvg("Lớp", "Tổng điểm");
  window.lopChart = new Chart(ctxLop, {
    type: "bar",
    data: {
      labels: lopStats.map(i => i.key),
      datasets: [{ label: "TB điểm", data: lopStats.map(i => i.avg), backgroundColor: "#0dcaf0" }]
    }
  });

  const monAvg = ["Ngữ văn", "Toán", "Tiếng Anh"].map(mon => {
    const sum = data.reduce((acc, s) => acc + s[mon], 0);
    return (sum / data.length).toFixed(2);
  });

  window.monChart = new Chart(ctxMon, {
    type: "bar",
    data: {
      labels: ["Ngữ văn", "Toán", "Tiếng Anh"],
      datasets: [{ label: "TB môn", data: monAvg, backgroundColor: "#20c997" }]
    }
  });
}