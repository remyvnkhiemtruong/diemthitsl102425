// Biến toàn cục
let students = [];

// Hàm khởi tạo khi trang web load xong
document.addEventListener('DOMContentLoaded', () => {
    // Load dữ liệu học sinh
    loadStudentData();
    
    // Xử lý form tìm kiếm
    document.getElementById('searchForm').addEventListener('submit', handleSearch);

    // Validation cho input số báo danh
    document.getElementById('sbd').addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
        if(this.value.length > 6) {
            this.value = this.value.slice(0, 6);
        }
    });

    // Validation cho input họ tên
    document.getElementById('fullname').addEventListener('input', function(e) {
        this.value = this.value.toUpperCase();
    });
});

// Load dữ liệu học sinh từ file JSON
async function loadStudentData() {
    try {
        const response = await fetch('data.json');
        students = await response.json();
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        showError('Không thể tải dữ liệu. Vui lòng thử lại sau!');
    }
}

// Xử lý tìm kiếm
async function handleSearch(e) {
    e.preventDefault();
    
    const sbd = document.getElementById('sbd').value;
    const fullname = document.getElementById('fullname').value.toUpperCase();
    
    // Hiển thị loading
    showLoading(true);
    
    // Giả lập delay của server
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Tìm học sinh
    const student = findStudent(sbd, fullname);
    
    // Ẩn loading
    showLoading(false);
    
    if (student) {
        displayResult(student);
        hideNoResult();
    } else {
        hideResult();
        showNoResult();
    }
}

// Tìm học sinh theo SBD và họ tên
function findStudent(sbd, fullname) {
    return students.find(s => 
        s.sbd === sbd && 
        normalizeString(s.fullname) === normalizeString(fullname)
    );
}

// Hiển thị kết quả
function displayResult(student) {
    document.getElementById('resultSBD').textContent = student.sbd;
    document.getElementById('resultName').textContent = student.fullname;
    document.getElementById('resultDOB').textContent = student.dob;
    document.getElementById('resultPOB').textContent = student.pob;
    document.getElementById('resultMath').textContent = student.math;
    document.getElementById('resultLiterature').textContent = student.literature;
    document.getElementById('resultEnglish').textContent = student.english;
    document.getElementById('resultBonus').textContent = student.bonus;
    document.getElementById('resultTotal').textContent = student.total;
    
    document.getElementById('resultContainer').style.display = 'block';
}

// In kết quả
function printResult() {
    window.print();
}

// Xuất PDF
function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Thêm logo và header
    doc.setFontSize(16);
    doc.text('TRƯỜNG THPT VÕ VĂN KIỆT', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('PHIẾU BÁO ĐIỂM TUYỂN SINH LỚP 10', 105, 30, { align: 'center' });
    
    // Thông tin học sinh
    doc.setFontSize(12);
    const student = {
        sbd: document.getElementById('resultSBD').textContent,
        name: document.getElementById('resultName').textContent,
        dob: document.getElementById('resultDOB').textContent,
        pob: document.getElementById('resultPOB').textContent,
        math: document.getElementById('resultMath').textContent,
        literature: document.getElementById('resultLiterature').textContent,
        english: document.getElementById('resultEnglish').textContent,
        bonus: document.getElementById('resultBonus').textContent,
        total: document.getElementById('resultTotal').textContent
    };
    
    let y = 50;
    doc.text(`Số báo danh: ${student.sbd}`, 20, y);
    doc.text(`Họ và tên: ${student.name}`, 20, y + 10);
    doc.text(`Ngày sinh: ${student.dob}`, 20, y + 20);
    doc.text(`Nơi sinh: ${student.pob}`, 20, y + 30);
    
    // Bảng điểm
    doc.text('KẾT QUẢ THI', 105, y + 45, { align: 'center' });
    doc.text(`Điểm Toán: ${student.math}`, 20, y + 55);
    doc.text(`Điểm Ngữ văn: ${student.literature}`, 20, y + 65);
    doc.text(`Điểm tiếng Anh: ${student.english}`, 20, y + 75);
    doc.text(`Điểm ưu tiên: ${student.bonus}`, 20, y + 85);
    doc.text(`Tổng điểm: ${student.total}`, 20, y + 95);
    
    // Footer
    doc.setFontSize(10);
    doc.text('© 2025 - Hệ thống tra cứu điểm tuyển sinh trực tuyến', 105, 280, { align: 'center' });
    
    // Lưu file
    doc.save(`KetQuaTuyenSinh_${student.sbd}.pdf`);
}

// Các hàm tiện ích
function showLoading(show) {
    document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
}

function hideResult() {
    document.getElementById('resultContainer').style.display = 'none';
}

function showNoResult() {
    document.getElementById('noResult').style.display = 'block';
}

function hideNoResult() {
    document.getElementById('noResult').style.display = 'none';
}

function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: message,
        confirmButtonColor: '#004d9e'
    });
}

function normalizeString(str) {
    return str.normalize('NFD')
             .replace(/[\u0300-\u036f]/g, '')
             .replace(/[^a-zA-Z0-9\s]/g, '')
             .toUpperCase()
             .trim();
}
