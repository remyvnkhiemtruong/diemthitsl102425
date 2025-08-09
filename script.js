/*
 * Main script for the entrance exam lookup application.
 * Features:
 * - Fuzzy search by student ID or name (accent-insensitive)
 * - Advanced filters: school, class, result, minimum total score
 * - Sorting and pagination
 * - Chart showing total score distribution
 * - Export results to CSV or print-friendly PDF
 * - Dark mode toggle and i18n support
 * - Shareable links via query parameters
 */

let students = [];
let currentResults = [];
let currentPage = 1;
const perPage = 5; // results per page
let translations = {};
let currentLang = 'vi';
let debounceTimer;

// Built-in translations for offline usage (vi and en)
const languageData = {
  vi: {
    appTitle: 'Tra cứu điểm tuyển sinh lớp 10',
    search: 'Tìm kiếm',
    reset: 'Nhập lại',
    sbdPlaceholder: 'Số báo danh',
    namePlaceholder: 'Họ và tên',
    schoolFilter: 'Trường',
    classFilter: 'Lớp',
    resultFilter: 'Kết quả',
    minScore: 'Điểm tối thiểu',
    sortBy: 'Sắp xếp theo',
    sortAsc: 'Tăng dần',
    sortDesc: 'Giảm dần',
    results: 'Kết quả',
    noResults: 'Không tìm thấy thí sinh nào',
    loading: 'Đang tải dữ liệu...',
    exportCSV: 'Xuất CSV',
    exportPDF: 'Xuất PDF',
    darkMode: 'Chế độ tối',
    chartTitle: 'Phân phối tổng điểm',
    shareLink: 'Sao chép liên kết',
    linkCopied: 'Đã sao chép liên kết!',
    studentInfo: 'Thông tin thí sinh',
    sbdLabel: 'SBD',
    nameLabel: 'Họ và tên',
    dobLabel: 'Ngày sinh',
    pobLabel: 'Nơi sinh',
    schoolLabel: 'Trường',
    classLabel: 'Lớp',
    mathLabel: 'Toán',
    literatureLabel: 'Ngữ văn',
    englishLabel: 'Tiếng Anh',
    bonusLabel: 'Điểm cộng',
    totalLabel: 'Tổng điểm',
    resultLabel: 'Kết quả',
    exportSheet: 'Xuất phiếu điểm'
  },
  en: {
    appTitle: 'High school entrance exam scores lookup',
    search: 'Search',
    reset: 'Reset',
    sbdPlaceholder: 'Student ID',
    namePlaceholder: 'Full name',
    schoolFilter: 'School',
    classFilter: 'Class',
    resultFilter: 'Result',
    minScore: 'Minimum score',
    sortBy: 'Sort by',
    sortAsc: 'Ascending',
    sortDesc: 'Descending',
    results: 'Results',
    noResults: 'No students found',
    loading: 'Loading data...',
    exportCSV: 'Export CSV',
    exportPDF: 'Export PDF',
    darkMode: 'Dark mode',
    chartTitle: 'Score distribution',
    shareLink: 'Copy link',
    linkCopied: 'Link copied!',
    studentInfo: 'Student information',
    sbdLabel: 'Student ID',
    nameLabel: 'Full name',
    dobLabel: 'Date of birth',
    pobLabel: 'Place of birth',
    schoolLabel: 'School',
    classLabel: 'Class',
    mathLabel: 'Math',
    literatureLabel: 'Literature',
    englishLabel: 'English',
    bonusLabel: 'Bonus',
    totalLabel: 'Total score',
    resultLabel: 'Result',
    exportSheet: 'Export score sheet'
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  // Determine language and load translations
  await initLang();
  // Register dark mode toggle
  registerDarkModeToggle();
  // Load data shards
  await loadData();
  // Initialise filter options
  initFilters();
  // Populate query parameters if present
  parseQueryParams();
  // Attach events for UI elements
  attachEvents();
  // Initial search to display all results
  search();
});

async function initLang() {
  const params = new URLSearchParams(window.location.search);
  currentLang = params.get('lang') || 'vi';
  try {
    // Try loading translation from built-in data first
    if (languageData[currentLang]) {
      translations = languageData[currentLang];
    } else {
      translations = {};
    }
    // Attempt to fetch external translation file to allow overrides
    try {
      const response = await fetch(`i18n/${currentLang}.json`);
      if (response.ok) {
        const remote = await response.json();
        translations = { ...translations, ...remote };
      }
    } catch (e) {
      // ignore fetch errors when offline
    }
  } catch (e) {
    translations = languageData['vi'] || {};
  }
  applyTranslations();
}

function applyTranslations() {
  const t = (key, fallback = '') => translations[key] || fallback;
  document.getElementById('appTitle').textContent = t('appTitle', 'Tra cứu điểm');
  document.getElementById('darkLabel').textContent = t('darkMode', 'Chế độ tối');
  document.getElementById('sbdInput').placeholder = t('sbdPlaceholder', 'Số báo danh');
  document.getElementById('nameInput').placeholder = t('namePlaceholder', 'Họ và tên');
  // Option labels will be updated after filter initialisation
  document.getElementById('minScore').placeholder = t('minScore', 'Điểm tối thiểu');
  document.getElementById('searchBtn').textContent = t('search', 'Tìm kiếm');
  document.getElementById('resetBtn').textContent = t('reset', 'Nhập lại');
  document.getElementById('chartTitle').textContent = t('chartTitle', 'Phân phối tổng điểm');
  document.getElementById('exportCsv').textContent = t('exportCSV', 'Xuất CSV');
  document.getElementById('exportPdf').textContent = t('exportPDF', 'Xuất PDF');
  document.getElementById('shareLink').textContent = t('shareLink', 'Sao chép liên kết') || 'Sao chép liên kết';

  // Modal translations
  const modalTitleEl = document.getElementById('modalTitle');
  if (modalTitleEl) modalTitleEl.textContent = t('studentInfo', 'Thông tin thí sinh');
  const setLabel = (id, key, fallback) => {
    const el = document.getElementById(id);
    if (el) el.textContent = `${t(key, fallback)}:`;
  };
  setLabel('labelSBD', 'sbdLabel', 'SBD');
  setLabel('labelName', 'nameLabel', 'Họ và tên');
  setLabel('labelDOB', 'dobLabel', 'Ngày sinh');
  setLabel('labelPOB', 'pobLabel', 'Nơi sinh');
  setLabel('labelSchool', 'schoolLabel', 'Trường');
  setLabel('labelClass', 'classLabel', 'Lớp');
  setLabel('labelMath', 'mathLabel', 'Toán');
  setLabel('labelLiterature', 'literatureLabel', 'Ngữ văn');
  setLabel('labelEnglish', 'englishLabel', 'Tiếng Anh');
  setLabel('labelBonus', 'bonusLabel', 'Điểm cộng');
  setLabel('labelTotal', 'totalLabel', 'Tổng điểm');
  setLabel('labelResult', 'resultLabel', 'Kết quả');
  const exportBtn = document.getElementById('exportStudentPdf');
  if (exportBtn) exportBtn.textContent = t('exportSheet', 'Xuất phiếu điểm');
}

function registerDarkModeToggle() {
  const toggle = document.getElementById('darkToggle');
  // Load preference from localStorage
  if (localStorage.getItem('darkMode') === 'true') {
    toggle.checked = true;
    document.body.classList.add('dark');
  }
  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      document.body.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  });
}

async function loadData() {
  try {
    showLoading(true);
    // If a preloaded dataset is provided (e.g. via file:// loading), use it directly
    if (Array.isArray(window.studentsSeed) && window.studentsSeed.length > 0) {
      students = window.studentsSeed;
      return;
    }
    // Otherwise load shards via fetch
    let shardNames = [];
    try {
      const indexRes = await fetch('data/index.json');
      if (indexRes.ok) {
        shardNames = await indexRes.json();
      }
    } catch (err) {
      // index.json không tồn tại hoặc lỗi, fallback
    }
    // Nếu không tìm thấy index.json, dùng tên shards mặc định
    if (!Array.isArray(shardNames) || shardNames.length === 0) {
      shardNames = ['shard1.json', 'shard2.json'];
    }
    const data = await Promise.all(
      shardNames.map(name => fetch(`data/${name}`).then(r => r.json()))
    );
    students = data.flat();
  } catch (e) {
    console.error('Error loading data', e);
    showError(translations.loading || 'Lỗi tải dữ liệu');
  } finally {
    showLoading(false);
  }
}

function initFilters() {
  const schoolSelect = document.getElementById('schoolFilter');
  const classSelect = document.getElementById('classFilter');
  // Unique schools and classes
  const schools = Array.from(new Set(students.map(s => s.school))).sort();
  const classes = Array.from(new Set(students.map(s => s.class))).sort();
  // Populate school select
  schools.forEach(school => {
    const opt = document.createElement('option');
    opt.value = school;
    opt.textContent = school;
    schoolSelect.appendChild(opt);
  });
  // Populate class select
  classes.forEach(cls => {
    const opt = document.createElement('option');
    opt.value = cls;
    opt.textContent = cls;
    classSelect.appendChild(opt);
  });
  // Translate filter placeholders
  document.getElementById('schoolFilter').options[0].textContent = translations.schoolFilter || 'Trường';
  document.getElementById('classFilter').options[0].textContent = translations.classFilter || 'Lớp';
  document.getElementById('resultFilter').options[0].textContent = translations.resultFilter || 'Kết quả';
  document.getElementById('sortField').options[0].textContent = translations.sortBy || 'Sắp xếp theo';
  document.getElementById('sortOrder').options[0].textContent = translations.sortAsc || 'Tăng dần';
  // Sort field option labels translation
  const sortField = document.getElementById('sortField');
  sortField.options[1].textContent = translations.total || 'Tổng điểm';
  sortField.options[2].textContent = translations.namePlaceholder || 'Tên';
  sortField.options[3].textContent = translations.sbdPlaceholder || 'SBD';
  const sortOrder = document.getElementById('sortOrder');
  sortOrder.options[0].textContent = translations.sortAsc || 'Tăng dần';
  sortOrder.options[1].textContent = translations.sortDesc || 'Giảm dần';
}

function parseQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const sbd = params.get('sbd');
  const name = params.get('name');
  const school = params.get('school');
  const cls = params.get('class');
  const result = params.get('result');
  const min = params.get('min');
  const sort = params.get('sort');
  const order = params.get('order');
  if (sbd) document.getElementById('sbdInput').value = sbd;
  if (name) document.getElementById('nameInput').value = name;
  if (school) document.getElementById('schoolFilter').value = school;
  if (cls) document.getElementById('classFilter').value = cls;
  if (result) document.getElementById('resultFilter').value = result;
  if (min) document.getElementById('minScore').value = min;
  if (sort) document.getElementById('sortField').value = sort;
  if (order) document.getElementById('sortOrder').value = order;
}

function attachEvents() {
  const form = document.getElementById('searchForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    search();
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    form.reset();
    search();
  });
  document.getElementById('exportCsv').addEventListener('click', exportCSV);
  document.getElementById('exportPdf').addEventListener('click', exportPDF);
  document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderResults();
    }
  });
  document.getElementById('nextPage').addEventListener('click', () => {
    const totalPages = Math.ceil(currentResults.length / perPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderResults();
    }
  });
  // Debounced search on input/change
  const inputs = ['sbdInput','nameInput','schoolFilter','classFilter','resultFilter','minScore','sortField','sortOrder'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    const eventType = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(eventType, () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => search(), 300);
    });
  });
  document.getElementById('shareLink').addEventListener('click', copyLink);

  // Attach modal events if modal exists
  const modal = document.getElementById('studentModal');
  const closeBtn = document.getElementById('closeModal');
  const exportBtn = document.getElementById('exportStudentPdf');
  if (modal && closeBtn && exportBtn) {
    closeBtn.addEventListener('click', closeStudentModal);
    exportBtn.addEventListener('click', exportStudentPdf);
    // Close modal when clicking outside content
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeStudentModal();
    });
    // Close modal on Esc key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        closeStudentModal();
      }
    });
  }
}

function normalizeString(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .toUpperCase()
    .trim();
}

function search() {
  showLoading(true);
  // Read form values
  const sbd = document.getElementById('sbdInput').value.trim();
  const name = document.getElementById('nameInput').value.trim();
  const school = document.getElementById('schoolFilter').value;
  const cls = document.getElementById('classFilter').value;
  const result = document.getElementById('resultFilter').value;
  const min = parseFloat(document.getElementById('minScore').value) || 0;
  const sortField = document.getElementById('sortField').value;
  const sortOrder = document.getElementById('sortOrder').value;
  // Filter
  currentResults = students.filter(s => {
    if (sbd && !s.sbd.startsWith(sbd)) return false;
    if (name && !normalizeString(s.fullname).includes(normalizeString(name))) return false;
    if (school && school !== '') {
      if (s.school !== school) return false;
    }
    if (cls && cls !== '') {
      if (s.class !== cls) return false;
    }
    if (result && result !== '') {
      if (s.result !== result) return false;
    }
    if (s.total < min) return false;
    return true;
  });
  // Sort
  if (sortField) {
    currentResults.sort((a,b) => {
      const va = a[sortField];
      const vb = b[sortField];
      if (va < vb) return sortOrder === 'asc' ? -1 : 1;
      if (va > vb) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }
  // Reset to first page
  currentPage = 1;
  renderResults();
  updateChart();
  showLoading(false);
}

function renderResults() {
  const tbody = document.querySelector('#resultsTable tbody');
  tbody.innerHTML = '';
  const totalPages = Math.max(1, Math.ceil(currentResults.length / perPage));
  // Clamp currentPage
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pageItems = currentResults.slice(start, end);
  pageItems.forEach(item => {
    const tr = document.createElement('tr');
    // Helper to create cell with label for mobile
    function cell(label, value) {
      const td = document.createElement('td');
      td.setAttribute('data-label', label);
      td.textContent = value;
      return td;
    }
    tr.appendChild(cell('SBD', item.sbd));
    tr.appendChild(cell('Họ và tên', item.fullname));
    tr.appendChild(cell('Trường', item.school));
    tr.appendChild(cell('Lớp', item.class));
    tr.appendChild(cell('Toán', item.math));
    tr.appendChild(cell('Ngữ văn', item.literature));
    tr.appendChild(cell('Tiếng Anh', item.english));
    tr.appendChild(cell('Tổng điểm', item.total));
    tr.appendChild(cell('Kết quả', item.result));
    // Attach click handler to show detail modal
    tr.addEventListener('click', () => showStudentModal(item));
    tbody.appendChild(tr);
  });
  // Update pagination info
  document.getElementById('pageInfo').textContent = `${currentPage}/${totalPages}`;
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage === totalPages;
}

function updateChart() {
  const chartDiv = document.getElementById('chart');
  chartDiv.innerHTML = '';
  if (currentResults.length === 0) {
    chartDiv.textContent = translations.noResults || 'Không có dữ liệu';
    return;
  }
  // Group totals by integer (rounded down) for distribution
  const counts = {};
  currentResults.forEach(item => {
    const key = Math.floor(item.total);
    counts[key] = (counts[key] || 0) + 1;
  });
  const keys = Object.keys(counts).sort((a,b) => a - b);
  const maxVal = Math.max(...Object.values(counts));
  keys.forEach(key => {
    const barWrapper = document.createElement('div');
    barWrapper.className = 'bar';
    const label = document.createElement('span');
    label.className = 'bar-label';
    label.textContent = `${key}`;
    const value = document.createElement('div');
    value.className = 'bar-value';
    const percent = (counts[key] / maxVal) * 100;
    value.style.width = `${percent}%`;
    value.title = `${counts[key]} thí sinh`;
    barWrapper.appendChild(label);
    barWrapper.appendChild(value);
    chartDiv.appendChild(barWrapper);
  });
}

/**
 * Show modal with detailed information for a single student.
 * @param {Object} student
 */
function showStudentModal(student) {
  const modal = document.getElementById('studentModal');
  if (!modal) return;
  // Temporary debug: alert student ID to verify click triggers; remove later
  // alert('show student ' + (student && student.sbd));
  // Populate fields
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value || '';
  };
  setText('modalSBD', student.sbd);
  setText('modalName', student.fullname);
  setText('modalDOB', student.dob || '');
  setText('modalPOB', student.pob || '');
  setText('modalSchool', student.school);
  setText('modalClass', student.class);
  setText('modalMath', student.math);
  setText('modalLiterature', student.literature);
  setText('modalEnglish', student.english);
  // Bonus is sum of UT and KK if defined
  const bonus = (parseFloat(student.ut || 0) + parseFloat(student.kk || 0)).toString();
  setText('modalBonus', bonus);
  setText('modalTotal', student.total);
  setText('modalResult', student.result);
  // Show modal
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  // Explicitly override display to ensure visibility
  modal.style.display = 'flex';
}

/**
 * Hide the student modal
 */
function closeStudentModal() {
  const modal = document.getElementById('studentModal');
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  modal.style.display = 'none';
}

/**
 * Export detailed score sheet for a single student. Creates a new window with formatted
 * information and triggers the browser print dialog. This approach ensures the
 * functionality works offline without external PDF libraries.
 */
function exportStudentPdf() {
  const modal = document.getElementById('studentModal');
  if (!modal || !modal.classList.contains('show')) return;
  // Gather information from modal
  const fields = ['SBD','Name','DOB','POB','School','Class','Math','Literature','English','Bonus','Total','Result'];
  const ids = ['modalSBD','modalName','modalDOB','modalPOB','modalSchool','modalClass','modalMath','modalLiterature','modalEnglish','modalBonus','modalTotal','modalResult'];
  const labels = [translations.sbdLabel || 'SBD', translations.nameLabel || 'Họ và tên', translations.dobLabel || 'Ngày sinh', translations.pobLabel || 'Nơi sinh', translations.schoolLabel || 'Trường', translations.classLabel || 'Lớp', translations.mathLabel || 'Toán', translations.literatureLabel || 'Ngữ văn', translations.englishLabel || 'Tiếng Anh', translations.bonusLabel || 'Điểm cộng', translations.totalLabel || 'Tổng điểm', translations.resultLabel || 'Kết quả'];
  const values = ids.map(id => {
    const el = document.getElementById(id);
    return el ? el.textContent : '';
  });
  // Build printable HTML
  let html = `<html><head><meta charset="UTF-8"><title>${translations.exportSheet || 'Phiếu điểm'}</title>`;
  // Basic styles for print
  html += `<style>body{font-family:system-ui,sans-serif;padding:1rem;}table{width:100%;border-collapse:collapse;}td,th{border:1px solid #ccc;padding:0.5rem;}th{text-align:left;background:#f0f0f0;}h2{text-align:center;margin-bottom:1rem;}</style></head><body>`;
  html += `<h2>${translations.studentInfo || 'Thông tin thí sinh'}</h2>`;
  html += '<table>';
  for (let i = 0; i < fields.length; i++) {
    html += `<tr><th>${labels[i]}</th><td>${values[i]}</td></tr>`;
  }
  html += '</table>';
  html += `<p style="text-align:center;margin-top:1rem;">${document.getElementById('footer')?.textContent || ''}</p>`;
  html += '</body></html>';
  // Open new window and print
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    // Trigger print after short delay to ensure content loads
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  }
}

function exportCSV() {
  if (currentResults.length === 0) return;
  const header = ['SBD','Họ và tên','Trường','Lớp','Toán','Ngữ văn','Tiếng Anh','UT','KK','Tổng điểm','Kết quả'];
  const rows = currentResults.map(item => [
    item.sbd,
    item.fullname,
    item.school,
    item.class,
    item.math,
    item.literature,
    item.english,
    item.ut,
    item.kk,
    item.total,
    item.result
  ]);
  const csvContent = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'results.csv';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportPDF() {
  // Use browser print as fallback; jsPDF may not be available in offline context
  window.print();
}

function copyLink() {
  const params = new URLSearchParams();
  const sbd = document.getElementById('sbdInput').value.trim();
  const name = document.getElementById('nameInput').value.trim();
  const school = document.getElementById('schoolFilter').value;
  const cls = document.getElementById('classFilter').value;
  const result = document.getElementById('resultFilter').value;
  const min = document.getElementById('minScore').value;
  const sortField = document.getElementById('sortField').value;
  const sortOrder = document.getElementById('sortOrder').value;
  if (sbd) params.set('sbd', sbd);
  if (name) params.set('name', name);
  if (school) params.set('school', school);
  if (cls) params.set('class', cls);
  if (result) params.set('result', result);
  if (min) params.set('min', min);
  if (sortField) params.set('sort', sortField);
  if (sortOrder) params.set('order', sortOrder);
  if (currentLang && currentLang !== 'vi') params.set('lang', currentLang);
  const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  navigator.clipboard.writeText(url).then(() => {
    alert(translations.linkCopied || 'Đã sao chép liên kết');
  }).catch(() => {
    alert(url);
  });
}

function showLoading(show) {
  const overlay = document.getElementById('loadingOverlay');
  if (show) {
    overlay.style.display = 'flex';
  } else {
    overlay.style.display = 'none';
  }
}

function showError(message) {
  alert(message);
}