// Biến toàn cục để lưu kết quả tìm kiếm
let searchResult = null;

// Hàm khởi tạo khi trang web load xong
document.addEventListener('DOMContentLoaded', () => {
    // Debug: kiểm tra dữ liệu học sinh
    console.log('Checking studentsData:', window.studentsData);

    // Kiểm tra xem có dữ liệu học sinh không
    if (typeof window.studentsData === 'undefined' || !Array.isArray(window.studentsData)) {
        showError('Không thể tải dữ liệu điểm thi. Vui lòng thử lại sau.');
        console.error('studentsData is not properly loaded:', window.studentsData);
        return;
    }

    // Xử lý form tìm kiếm
    const searchForm = document.getElementById('searchForm');
    if (!searchForm) {
        console.error('Search form not found');
        return;
    }
    searchForm.addEventListener('submit', handleSearch);

    // Thêm sự kiện cho nút in và xuất PDF
    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', printResult);
    }

    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportPDF);
    }

    // Ẩn kết quả khi load trang
    hideResult();
});

// Xử lý tìm kiếm
async function handleSearch(e) {
    e.preventDefault();
    
    const sbd = document.getElementById('sbd').value.trim();
    
    // Debug
    console.log('Handling search for SBD:', sbd);
    console.log('Available data:', window.studentsData);
    
    // Validate SBD
    if (!sbd) {
        showError('Vui lòng nhập số báo danh');
        return;
    }

    // Convert sang số và kiểm tra
    const sbdNumber = parseInt(sbd);
    if (isNaN(sbdNumber)) {
        showError('Số báo danh không hợp lệ');
        return;
    }
    
    // Hiển thị loading
    showLoading(true);
    
    try {
        // Tìm kiếm học sinh
        searchResult = window.studentsData.find(student => student.SBD === sbdNumber);
        
        if (searchResult) {
            displayResult(searchResult);
            hideNoResult();
        } else {
            hideResult();
            showNoResult();
        }
    } catch (error) {
        console.error('Lỗi khi tìm kiếm:', error);
        showError('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.');
    } finally {
        showLoading(false);
    }
}

// Hiển thị kết quả
function displayResult(data) {
    console.log('Displaying result:', data); // Debug

    // Hiển thị container kết quả
    const resultContainer = document.getElementById('resultContainer');
    if (!resultContainer) {
        console.error('Result container not found');
        return;
    }
    resultContainer.style.display = 'block';

    // Hiển thị thông tin học sinh
    const fields = {
        'resultSBD': data.SBD,
        'resultName': data['Họ và tên'],
        'resultSchool': data['Trường'],
        'resultClass': data['Lớp'],
        'resultLiterature': typeof data['Ngữ văn'] === 'number' ? data['Ngữ văn'].toFixed(2) : 'N/A',
        'resultMath': typeof data['Toán'] === 'number' ? data['Toán'].toFixed(2) : 'N/A',
        'resultEnglish': typeof data['Tiếng Anh'] === 'number' ? data['Tiếng Anh'].toFixed(2) : 'N/A',
        'resultUT': typeof data.UT === 'number' ? data.UT.toFixed(2) : '0.00',
        'resultKK': typeof data.KK === 'number' ? data.KK.toFixed(2) : '0.00',
        'resultTotal': typeof data['Tổng điểm'] === 'number' ? data['Tổng điểm'].toFixed(2) : 'N/A'
    };

    // Cập nhật từng trường thông tin
    for (const [id, value] of Object.entries(fields)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    // Hiển thị kết quả với màu sắc tương ứng
    const resultStatus = document.getElementById('resultStatus');
    if (resultStatus) {
        resultStatus.textContent = data['Kết quả'];
        resultStatus.classList.remove('text-success', 'text-danger');
        resultStatus.classList.add(data['Kết quả'] === 'Đạt' ? 'text-success' : 'text-danger');
    }
}

// In kết quả
function printResult() {
    if (!searchResult) {
        showError('Vui lòng tra cứu điểm trước khi in');
        return;
    }
    window.print();
}

// Xuất PDF
function exportPDF() {
    if (!searchResult) {
        showError('Vui lòng tra cứu điểm trước khi xuất PDF');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Thêm logo và header
    doc.setFontSize(16);
    doc.text('TRƯỜNG THPT VÕ VĂN KIỆT', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('KẾT QUẢ THI TUYỂN SINH LỚP 10', 105, 30, { align: 'center' });
    doc.text('NĂM HỌC 2025-2026', 105, 40, { align: 'center' });

    // Thông tin học sinh
    doc.setFontSize(12);
    let yPos = 60;
    
    doc.text('Số báo danh:', 20, yPos);
    doc.text(searchResult.SBD.toString(), 80, yPos);
    
    doc.text('Họ và tên:', 20, yPos + 10);
    doc.text(searchResult['Họ và tên'], 80, yPos + 10);
    
    doc.text('Trường:', 20, yPos + 20);
    doc.text(searchResult['Trường'], 80, yPos + 20);
    
    doc.text('Lớp:', 20, yPos + 30);
    doc.text(searchResult['Lớp'], 80, yPos + 30);

    // Bảng điểm
    yPos += 50;
    doc.text('ĐIỂM CÁC MÔN THI', 105, yPos, { align: 'center' });
    
    yPos += 10;
    doc.text('Ngữ văn:', 40, yPos);
    doc.text(searchResult['Ngữ văn'].toFixed(2), 90, yPos);
    
    doc.text('Toán:', 40, yPos + 10);
    doc.text(searchResult['Toán'].toFixed(2), 90, yPos + 10);
    
    doc.text('Tiếng Anh:', 40, yPos + 20);
    doc.text(searchResult['Tiếng Anh'].toFixed(2), 90, yPos + 20);
    
    yPos += 30;
    doc.text('Điểm ưu tiên:', 40, yPos);
    doc.text(searchResult.UT.toFixed(2), 90, yPos);
    
    doc.text('Điểm khuyến khích:', 40, yPos + 10);
    doc.text(searchResult.KK.toFixed(2), 90, yPos + 10);
    
    // Tổng điểm và kết quả
    yPos += 20;
    doc.setFontSize(13);
    doc.text('TỔNG ĐIỂM:', 40, yPos);
    doc.text(searchResult['Tổng điểm'].toFixed(2), 90, yPos);
    
    doc.text('KẾT QUẢ:', 40, yPos + 10);
    doc.text(searchResult['Kết quả'], 90, yPos + 10);

    // Thời gian in
    const today = new Date();
    doc.setFontSize(10);
    doc.text(
        `Bạc Liêu, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`,
        105, yPos + 30,
        { align: 'center' }
    );

    // Footer
    doc.setFontSize(10);
    doc.text('© 2025 Trường THPT Võ Văn Kiệt - Tỉnh Bạc Liêu', 105, 280, { align: 'center' });
    
    // Lưu file
    doc.save(`KetQuaTuyenSinh_${searchResult.SBD}.pdf`);
}

// Các hàm tiện ích
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

function hideResult() {
    const container = document.getElementById('resultContainer');
    if (container) {
        container.style.display = 'none';
    }
}

function showNoResult() {
    Swal.fire({
        icon: 'info',
        title: 'Không tìm thấy kết quả',
        text: 'Không tìm thấy học sinh với số báo danh này.',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#3085d6'
    });
}

function hideNoResult() {
    // Chỉ cần ẩn SweetAlert nếu đang hiển thị
    Swal.close();
}

function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: message,
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#3085d6'
    });
}