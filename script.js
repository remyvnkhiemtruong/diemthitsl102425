let students = [];
let accentMap = {
  'a': '[aáàảãạăắằẳẵặâấầẩẫậ]',
  'e': '[eéèẻẽẹêếềểễệ]',
  'i': '[iíìỉĩị]',
  'o': '[oóòỏõọôốồổỗộơớờởỡợ]',
  'u': '[uúùủũụưứừửữự]',
  'y': '[yýỳỷỹỵ]',
  'd': '[dđ]'
};

function normalize(str) {
  return str.toLowerCase().replace(/./g, c => accentMap[c] || c);
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
  const schools = [...new Set(students.map(s => s["Trường"]))].sort();
  const classes = [...new Set(students.map(s => s["Lớp"]))].sort();
  const schoolSel = document.getElementById("filterSchool");
  const classSel = document.getElementById("filterClass");

  schools.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    schoolSel.appendChild(opt);
  });

  classes.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    classSel.appendChild(opt);
  });
}

function renderTable() {
  const keyword = normalize(document.getElementById("searchInput").value.trim());
  const school = document.getElementById("filterSchool").value;
  const lop = document.getElementById("filterClass").value;
  const result = document.getElementById("filterResult").value;
  const minScore = parseFloat(document.getElementById("filterMin").value) || 0;
  const useCard = document.getElementById("toggleCard").checked;
  const tableBody = document.getElementById("tableBody");
  const tableContainer = document.getElementById("tableContainer");
  const cardContainer = document.getElementById("cardContainer");
  const noResult = document.getElementById("noResult");
  tableBody.innerHTML = "";
  cardContainer.innerHTML = "";

  const filtered = students.filter(s => {
    const name = normalize(s["Họ và tên"]);
    const sbd = s["SBD"].toString();
    return (
      (name.includes(keyword) || sbd.includes(keyword)) &&
      (school === "" || s["Trường"] === school) &&
      (lop === "" || s["Lớp"] === lop) &&
      (result === "" || s["Kết quả"] === result) &&
      s["Tổng điểm"] >= minScore
    );
  });

  tableContainer.classList.toggle("d-none", useCard);
  cardContainer.classList.toggle("d-none", !useCard);

  if (filtered.length === 0) {
    noResult.classList.remove("d-none");
    return;
  } else {
    noResult.classList.add("d-none");
  }

  if (useCard) {
    filtered.forEach(s => {
      const div = document.createElement("div");
      div.className = "col-md-4";
      div.innerHTML = `
        <div class="card-student ${s["Kết quả"] === "Trượt" ? "highlight-fail" : ""}">
          <h5>${s["Họ và tên"]} (${s["SBD"]})</h5>
          <p><strong>Trường:</strong> ${s["Trường"]}</p>
          <p><strong>Lớp:</strong> ${s["Lớp"]}</p>
          <p><strong>Điểm:</strong> ${s["Tổng điểm"]} - ${s["Kết quả"]}</p>
        </div>
      `;
      cardContainer.appendChild(div);
    });
  } else {
    filtered.forEach(s => {
      const row = document.createElement("tr");
      if (s["Kết quả"] === "Trượt") row.classList.add("highlight-fail");
      row.innerHTML = `
        <td>${s["SBD"]}</td>
        <td class="text-start">${s["Họ và tên"]}</td>
        <td>${s["Trường"]}</td>
        <td>${s["Lớp"]}</td>
        <td>${s["Ngữ văn"]}</td>
        <td>${s["Toán"]}</td>
        <td>${s["Tiếng Anh"]}</td>
        <td>${s["UT"]}</td>
        <td>${s["KK"]}</td>
        <td class="fw-bold">${s["Tổng điểm"]}</td>
        <td>${s["Kết quả"] === "Đạt" ? "✅" : "⚠️"}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  drawChartBySchool(filtered);
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("dark-mode", document.body.classList.contains("dark-mode"));
}

function startApp() {
  document.getElementById("landingPage").classList.add("d-none");
  document.getElementById("mainApp").classList.remove("d-none");
  if (localStorage.getItem("dark-mode") === "true") {
    document.body.classList.add("dark-mode");
  }
}

function drawChartBySchool(data) {
  const ctx = document.getElementById("chartSchool").getContext("2d");
  if (window.schoolChart) window.schoolChart.destroy();

  const stats = {};
  data.forEach(s => {
    const key = s["Trường"];
    stats[key] = stats[key] || { count: 0, total: 0 };
    stats[key].count++;
    stats[key].total += s["Tổng điểm"];
  });

  const labels = Object.keys(stats);
  const values = labels.map(k => (stats[k].total / stats[k].count).toFixed(2));

  window.schoolChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Điểm trung bình theo trường",
        data: values,
        backgroundColor: "rgba(54, 162, 235, 0.6)"
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
}