let students = [];
let lang = "vi";
const i18n = {
  vi: {
    start: "🚀 Bắt đầu tra cứu",
    landingTitle: "Trường THPT Võ Văn Kiệt",
    landingSubtitle: "Hệ thống tra cứu điểm tuyển sinh lớp 10 (2025 - 2026)",
    landingNote: "Dữ liệu mang tính tham khảo. Mọi sai sót vui lòng liên hệ nhà trường.",
    mainTitle: "🎓 Tra cứu kết quả tuyển sinh lớp 10",
    searchPlaceholder: "Tìm theo tên hoặc SBD",
    school: "🏫 Trường",
    class: "📘 Lớp",
    result: "🎯 Kết quả",
    pass: "Đạt",
    fail: "Trượt",
    min: "Điểm từ",
    filter: "Lọc",
    showCards: "Hiển thị dạng thẻ học sinh",
    exportCsv: "Xuất CSV",
    showTop: "Xem Top 10",
    hideTop: "Ẩn Top 10",
    topTitle: "🏆 Top 10 thí sinh",
    noResult: "Không tìm thấy kết quả phù hợp.",
    detailBtn: "Chi tiết",
    nameLabel: "Họ tên",
    idLabel: "SBD",
    schoolLabel: "Trường",
    classLabel: "Lớp",
    scoreLabel: "Điểm",
    priorityLabel: "UT",
    bonusLabel: "KK",
    totalLabel: "Tổng điểm",
    pdfTitle: "PHIẾU TRA CỨU KẾT QUẢ TUYỂN SINH",
    detailTitle: "Thông tin học sinh",
    export: "Xuất PDF",
    close: "Đóng",
    chartSchool: "Điểm TB theo trường",
    chartHocLuc: "Phân loại học lực",
    chartLop: "Điểm TB theo lớp",
    chartMon: "Điểm TB theo môn",
    footer: "© 2025 – Hệ thống tra cứu tuyển sinh. Thiết kế và phát triển bởi <strong>Truong Minh Khiem</strong> (A6 – Khóa 2023–2026)."
  },
  en: {
    start: "🚀 Start lookup",
    landingTitle: "Vo Van Kiet High School",
    landingSubtitle: "Entrance exam results lookup (2025 - 2026)",
    landingNote: "Data is for reference only. Please contact the school for corrections.",
    mainTitle: "🎓 Search entrance exam results",
    searchPlaceholder: "Search by name or ID",
    school: "🏫 School",
    class: "📘 Class",
    result: "🎯 Result",
    pass: "Pass",
    fail: "Fail",
    min: "Min score",
    filter: "Filter",
    showCards: "Show student cards",
    exportCsv: "Export CSV",
    showTop: "Show Top 10",
    hideTop: "Hide Top 10",
    topTitle: "🏆 Top 10 students",
    noResult: "No matching results found.",
    detailBtn: "Details",
    nameLabel: "Name",
    idLabel: "ID",
    schoolLabel: "School",
    classLabel: "Class",
    scoreLabel: "Score",
    priorityLabel: "Priority",
    bonusLabel: "Bonus",
    totalLabel: "Total",
    pdfTitle: "ENTRANCE EXAM RESULTS",
    detailTitle: "Student Information",
    export: "Export PDF",
    close: "Close",
    chartSchool: "Average score by school",
    chartHocLuc: "Academic classification",
    chartLop: "Average score by class",    
    chartMon: "Average score by subject",
    footer: "© 2025 – Lookup system. Designed by <strong>Truong Minh Khiem</strong>."
  }
};

function setLang(l) {
  lang = l;
  localStorage.setItem("lang", lang);
  const t = i18n[lang];

  document.getElementById("langSelect").value = lang;
  document.getElementById("startBtn").innerText = t.start;
  document.getElementById("landingTitle").innerText = t.landingTitle;
  document.getElementById("landingSubtitle").innerText = t.landingSubtitle;
  document.getElementById("landingNote").innerText = t.landingNote;
  document.getElementById("mainTitle").innerText = t.mainTitle;
  document.getElementById("searchInput").placeholder = t.searchPlaceholder;
  document.querySelector("#filterSchool option").textContent = t.school;
  document.querySelector("#filterClass option").textContent = t.class;
  const opts = document.querySelectorAll("#filterResult option");
  opts[0].textContent = t.result;
  opts[1].textContent = `✅ ${t.pass}`;
  opts[2].textContent = `⚠️ ${t.fail}`;
  document.getElementById("filterMin").placeholder = t.min;
  document.getElementById("filterBtn").innerText = t.filter;
  document.getElementById("labelShowCard").innerText = t.showCards;
  document.getElementById("noResult").innerText = t.noResult;
  const csvBtn = document.getElementById("csvBtn");
  if (csvBtn) csvBtn.innerText = `⬇️ ${t.exportCsv}`;
  const topBtn = document.getElementById("topBtn");
  if (topBtn) {
    const showing = !document.getElementById("topContainer").classList.contains("d-none");
    topBtn.innerText = showing ? t.hideTop : t.showTop;
  }
  const topTitle = document.querySelector("#topContainer h5");
  if (topTitle) topTitle.innerText = t.topTitle;

  document.querySelector(".modal-title").innerText = t.detailTitle;
  const exportBtn = document.querySelector("#detailModal .btn-outline-primary");
  if (exportBtn) exportBtn.innerText = "📄 " + t.export;
  document.querySelector("#detailModal .btn-secondary").innerText = t.close;
  document.querySelector("h5.text-center.mb-3").innerText = "📊 " + t.chartSchool;
  document.querySelectorAll("h5.text-center.mb-3")[1].innerText = "📊 " + t.chartHocLuc;
  document.querySelectorAll("h5.text-center.mb-3")[2].innerText = "📘 " + t.chartLop;
  document.querySelectorAll("h5.text-center.mb-3")[3].innerText = "📚 " + t.chartMon;
  document.getElementById("footerText").innerHTML = t.footer;
  document.title = `${t.landingSubtitle} - ${t.landingTitle}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const script = document.createElement("script");
  script.src = "data.js";
  script.onload = () => {
    students = studentsData;
    populateFilters();
    renderTable();
    updateTopList();
  };
  document.head.appendChild(script);
    if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }
  const savedLang = localStorage.getItem("lang") || lang;
  setLang(savedLang);
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
@@ -172,50 +190,52 @@ function renderTable() {
      div.className = "col-md-4";
      const t = i18n[lang];
      div.innerHTML = `
        <div class="card-student ${s["Kết quả"] === "Trượt" ? "highlight-fail" : ""}">
          <h5>${s["Họ và tên"]} (${s["SBD"]})</h5>
          <p><strong>${t.schoolLabel}:</strong> ${s["Trường"]}</p>
          <p><strong>${t.classLabel}:</strong> ${s["Lớp"]}</p>
          <p><strong>${t.scoreLabel}:</strong> ${s["Tổng điểm"]} – ${s["Kết quả"]}</p>
          <button class="btn btn-sm btn-outline-primary" onclick='showDetail(${JSON.stringify(s)})'>${t.detailBtn}</button>
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
  window.filteredData = filtered;
  updateTopList();
}

function startApp() {
  document.getElementById("landingPage").classList.add("d-none");
  document.getElementById("mainApp").classList.remove("d-none");
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
}

function showDetail(s) {
  const b = document.getElementById("modalBody");
  const t = i18n[lang];
  b.innerHTML = `
    <p><strong>Lớp:</strong> ${s["Lớp"]}</p>
    <p><strong>${t.nameLabel}:</strong> ${s["Họ và tên"]}</p>
    <p><strong>${t.idLabel}:</strong> ${s["SBD"]}</p>
    <p><strong>${t.schoolLabel}:</strong> ${s["Trường"]}</p>
    <p><strong>${t.classLabel}:</strong> ${s["Lớp"]}</p>
    <p><strong>Văn:</strong> ${s["Ngữ văn"]}, <strong>Toán:</strong> ${s["Toán"]}, <strong>Anh:</strong> ${s["Tiếng Anh"]}</p>
    <p><strong>${t.priorityLabel}:</strong> ${s["UT"]}, <strong>${t.bonusLabel}:</strong> ${s["KK"]}</p>
    <p><strong>${t.totalLabel}:</strong> ${s["Tổng điểm"]} – <strong>${s["Kết quả"]}</strong></p>`;
  window.selectedStudent = s;
@@ -281,25 +301,65 @@ function drawCharts(data) {
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

function updateTopList() {
  const container = document.getElementById("topContainer");
  if (!container) return;
  const body = document.getElementById("topBody");
  body.innerHTML = "";
  const data = (window.filteredData || students)
    .slice()
    .sort((a, b) => b["Tổng điểm"] - a["Tổng điểm"])
    .slice(0, 10);
  data.forEach((s, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${i + 1}</td><td>${s["SBD"]}</td><td>${s["Họ và tên"]}</td><td>${s["Tổng điểm"]}</td>`;
    body.appendChild(row);
  });
}

function toggleTop() {
  const container = document.getElementById("topContainer");
  container.classList.toggle("d-none");
  const t = i18n[lang];
  const btn = document.getElementById("topBtn");
  btn.innerText = container.classList.contains("d-none") ? t.showTop : t.hideTop;
  if (!container.classList.contains("d-none")) updateTopList();
}

function exportCSV() {
  const data = window.filteredData || students;
  let csv = Object.keys(data[0]).join(",") + "\n";
  data.forEach(s => {
    csv += Object.values(s).join(",") + "\n";
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "students.csv";
  a.click();
  URL.revokeObjectURL(url);
}
