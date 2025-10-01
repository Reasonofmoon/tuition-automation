// ==================== 데이터 모델 및 스토리지 ====================

class DataStore {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem('academyName')) {
            localStorage.setItem('academyName', '');
        }
        if (!localStorage.getItem('students')) {
            localStorage.setItem('students', JSON.stringify([]));
        }
        if (!localStorage.getItem('classes')) {
            localStorage.setItem('classes', JSON.stringify([]));
        }
        if (!localStorage.getItem('payments')) {
            localStorage.setItem('payments', JSON.stringify({}));
        }
    }

    // 학원명 관리
    getAcademyName() {
        return localStorage.getItem('academyName') || '';
    }

    setAcademyName(name) {
        localStorage.setItem('academyName', name);
    }

    // 학생 관리
    getStudents() {
        return JSON.parse(localStorage.getItem('students') || '[]');
    }

    saveStudents(students) {
        localStorage.setItem('students', JSON.stringify(students));
    }

    addStudent(student) {
        const students = this.getStudents();
        student.id = Date.now().toString();
        students.push(student);
        this.saveStudents(students);
        return student;
    }

    updateStudent(id, updatedData) {
        const students = this.getStudents();
        const index = students.findIndex(s => s.id === id);
        if (index !== -1) {
            students[index] = { ...students[index], ...updatedData };
            this.saveStudents(students);
            return students[index];
        }
        return null;
    }

    deleteStudent(id) {
        const students = this.getStudents().filter(s => s.id !== id);
        this.saveStudents(students);
    }

    // 반 관리
    getClasses() {
        return JSON.parse(localStorage.getItem('classes') || '[]');
    }

    saveClasses(classes) {
        localStorage.setItem('classes', JSON.stringify(classes));
    }

    addClass(classData) {
        const classes = this.getClasses();
        classData.id = Date.now().toString();
        classes.push(classData);
        this.saveClasses(classes);
        return classData;
    }

    updateClass(id, updatedData) {
        const classes = this.getClasses();
        const index = classes.findIndex(c => c.id === id);
        if (index !== -1) {
            classes[index] = { ...classes[index], ...updatedData };
            this.saveClasses(classes);
            return classes[index];
        }
        return null;
    }

    deleteClass(id) {
        const classes = this.getClasses().filter(c => c.id !== id);
        this.saveClasses(classes);
    }

    // 납부 관리
    getPayments() {
        return JSON.parse(localStorage.getItem('payments') || '{}');
    }

    savePayments(payments) {
        localStorage.setItem('payments', JSON.stringify(payments));
    }

    getMonthPayments(yearMonth) {
        const payments = this.getPayments();
        return payments[yearMonth] || [];
    }

    saveMonthPayments(yearMonth, monthPayments) {
        const payments = this.getPayments();
        payments[yearMonth] = monthPayments;
        this.savePayments(payments);
    }

    updatePayment(yearMonth, studentId, paymentData) {
        const monthPayments = this.getMonthPayments(yearMonth);
        const index = monthPayments.findIndex(p => p.studentId === studentId);
        if (index !== -1) {
            monthPayments[index] = { ...monthPayments[index], ...paymentData };
        } else {
            monthPayments.push({ studentId, ...paymentData });
        }
        this.saveMonthPayments(yearMonth, monthPayments);
    }
}

const store = new DataStore();

// ==================== 유틸리티 함수 ====================

function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function getCurrentYearMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

// ==================== 탭 관리 ====================

function showTab(tabName) {
    // 모든 탭 컨텐츠 숨기기
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 선택된 탭 표시
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    // 탭별 데이터 로드
    switch(tabName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'students':
            loadStudents();
            break;
        case 'classes':
            loadClasses();
            break;
        case 'payments':
            initPaymentMonth();
            loadPayments();
            break;
        case 'reports':
            initReportDates();
            break;
    }
}

// ==================== 학원명 관리 ====================

function saveAcademyName() {
    const name = document.getElementById('academyName').value.trim();
    if (name) {
        store.setAcademyName(name);
        showNotification('학원명이 저장되었습니다.');
    } else {
        showNotification('학원명을 입력해주세요.', 'error');
    }
}

function loadAcademyName() {
    const name = store.getAcademyName();
    document.getElementById('academyName').value = name;
}

// ==================== 대시보드 ====================

function loadDashboard() {
    const students = store.getStudents();
    const currentMonth = getCurrentYearMonth();
    const monthPayments = store.getMonthPayments(currentMonth);
    
    // 총 학생 수
    document.getElementById('totalStudents').textContent = students.length;
    
    // 예상 수입 계산
    let expectedRevenue = 0;
    students.forEach(student => {
        expectedRevenue += parseFloat(student.baseFee || 0);
    });
    document.getElementById('expectedRevenue').textContent = formatCurrency(expectedRevenue);
    
    // 납부 완료/미납 학생 수
    const paidCount = monthPayments.filter(p => p.status === '완납').length;
    const unpaidCount = students.length - paidCount;
    document.getElementById('paidStudents').textContent = paidCount + '명';
    document.getElementById('unpaidStudents').textContent = unpaidCount + '명';
    
    // 최근 납부 내역
    loadRecentPayments();
    
    // 월별 차트
    loadMonthlyChart();
}

function loadRecentPayments() {
    const currentMonth = getCurrentYearMonth();
    const monthPayments = store.getMonthPayments(currentMonth);
    const students = store.getStudents();
    
    const recentPaymentsDiv = document.getElementById('recentPayments');
    
    if (monthPayments.length === 0) {
        recentPaymentsDiv.innerHTML = '<p>최근 납부 내역이 없습니다.</p>';
        return;
    }
    
    // 납부일 기준 정렬 (최근순)
    const sortedPayments = monthPayments
        .filter(p => p.paymentDate)
        .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
        .slice(0, 5);
    
    let html = '<ul style="list-style: none; padding: 0;">';
    sortedPayments.forEach(payment => {
        const student = students.find(s => s.id === payment.studentId);
        if (student) {
            html += `
                <li style="padding: 10px; border-bottom: 1px solid #E5E7EB;">
                    <strong>${student.name}</strong> - ${formatCurrency(payment.totalAmount || 0)}
                    <span style="float: right; color: #6B7280;">${formatDate(payment.paymentDate)}</span>
                </li>
            `;
        }
    });
    html += '</ul>';
    
    recentPaymentsDiv.innerHTML = html;
}

function loadMonthlyChart() {
    const payments = store.getPayments();
    const months = Object.keys(payments).sort().slice(-6); // 최근 6개월
    
    const labels = months.map(m => {
        const [year, month] = m.split('-');
        return `${year}년 ${parseInt(month)}월`;
    });
    
    const data = months.map(month => {
        const monthPayments = payments[month];
        return monthPayments
            .filter(p => p.status === '완납')
            .reduce((sum, p) => sum + (parseFloat(p.totalAmount) || 0), 0);
    });
    
    const ctx = document.getElementById('monthlyChart');
    if (window.monthlyChart) {
        window.monthlyChart.destroy();
    }
    
    window.monthlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '수강료 수입',
                data: data,
                borderColor: '#4F46E5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

// ==================== 학생 관리 ====================

function loadStudents() {
    const students = store.getStudents();
    const tbody = document.getElementById('studentsTableBody');
    
    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">등록된 학생이 없습니다.</td></tr>';
        return;
    }
    
    tbody.innerHTML = students.map(student => `
        <tr>
            <td>${student.name}</td>
            <td>${student.className}</td>
            <td>${formatCurrency(student.baseFee)}</td>
            <td>${student.siblingGroup || '-'}</td>
            <td>${student.phone || '-'}</td>
            <td>${formatDate(student.registrationDate)}</td>
            <td>
                <button class="btn-edit" onclick="editStudent('${student.id}')">수정</button>
                <button class="btn-delete" onclick="deleteStudent('${student.id}')">삭제</button>
            </td>
        </tr>
    `).join('');
}

function filterStudents() {
    const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
    const students = store.getStudents();
    const filtered = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm) ||
        (s.className && s.className.toLowerCase().includes(searchTerm))
    );
    
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = filtered.map(student => `
        <tr>
            <td>${student.name}</td>
            <td>${student.className}</td>
            <td>${formatCurrency(student.baseFee)}</td>
            <td>${student.siblingGroup || '-'}</td>
            <td>${student.phone || '-'}</td>
            <td>${formatDate(student.registrationDate)}</td>
            <td>
                <button class="btn-edit" onclick="editStudent('${student.id}')">수정</button>
                <button class="btn-delete" onclick="deleteStudent('${student.id}')">삭제</button>
            </td>
        </tr>
    `).join('');
}

function showStudentModal(studentId = null) {
    const modal = document.getElementById('studentModal');
    const form = document.getElementById('studentForm');
    const title = document.getElementById('studentModalTitle');
    
    // 반 목록 로드
    loadClassOptions();
    
    if (studentId) {
        // 수정 모드
        const student = store.getStudents().find(s => s.id === studentId);
        title.textContent = '학생 수정';
        document.getElementById('studentId').value = student.id;
        document.getElementById('studentName').value = student.name;
        document.getElementById('studentClass').value = student.className;
        document.getElementById('studentFee').value = student.baseFee;
        document.getElementById('siblingGroup').value = student.siblingGroup || '';
        document.getElementById('studentPhone').value = student.phone || '';
        document.getElementById('registrationDate').value = student.registrationDate || '';
        document.getElementById('studentNotes').value = student.notes || '';
    } else {
        // 추가 모드
        title.textContent = '학생 추가';
        form.reset();
        document.getElementById('registrationDate').value = new Date().toISOString().split('T')[0];
    }
    
    modal.style.display = 'block';
}

function loadClassOptions() {
    const classes = store.getClasses();
    const select = document.getElementById('studentClass');
    
    select.innerHTML = '<option value="">반 선택</option>' + 
        classes.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
}

function saveStudent(event) {
    event.preventDefault();
    
    const studentData = {
        name: document.getElementById('studentName').value.trim(),
        className: document.getElementById('studentClass').value,
        baseFee: parseFloat(document.getElementById('studentFee').value),
        siblingGroup: document.getElementById('siblingGroup').value.trim(),
        phone: document.getElementById('studentPhone').value.trim(),
        registrationDate: document.getElementById('registrationDate').value,
        notes: document.getElementById('studentNotes').value.trim()
    };
    
    const studentId = document.getElementById('studentId').value;
    
    if (studentId) {
        store.updateStudent(studentId, studentData);
        showNotification('학생 정보가 수정되었습니다.');
    } else {
        store.addStudent(studentData);
        showNotification('새 학생이 추가되었습니다.');
    }
    
    closeModal('studentModal');
    loadStudents();
    loadDashboard();
}

function editStudent(id) {
    showStudentModal(id);
}

function deleteStudent(id) {
    if (confirm('정말 이 학생을 삭제하시겠습니까?')) {
        store.deleteStudent(id);
        showNotification('학생이 삭제되었습니다.', 'info');
        loadStudents();
        loadDashboard();
    }
}

// ==================== 반 관리 ====================

function loadClasses() {
    const classes = store.getClasses();
    const grid = document.getElementById('classesGrid');
    
    if (classes.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 40px; grid-column: 1/-1;">등록된 반이 없습니다.</p>';
        return;
    }
    
    const students = store.getStudents();
    
    grid.innerHTML = classes.map(cls => {
        const studentCount = students.filter(s => s.className === cls.name).length;
        
        return `
            <div class="class-card">
                <h3>${cls.name}</h3>
                <div class="class-info">
                    <p><strong>기본 수강료:</strong> ${formatCurrency(cls.defaultFee)}</p>
                    <p><strong>요일:</strong> ${cls.schedule || '-'}</p>
                    <p><strong>시간:</strong> ${cls.time || '-'}</p>
                    <p><strong>정원:</strong> ${cls.capacity || '-'}</p>
                    <p><strong>현재 인원:</strong> ${studentCount}명</p>
                    ${cls.notes ? `<p><strong>비고:</strong> ${cls.notes}</p>` : ''}
                </div>
                <div class="class-actions">
                    <button class="btn-edit" onclick="editClass('${cls.id}')">수정</button>
                    <button class="btn-delete" onclick="deleteClass('${cls.id}')">삭제</button>
                </div>
            </div>
        `;
    }).join('');
}

function showClassModal(classId = null) {
    const modal = document.getElementById('classModal');
    const form = document.getElementById('classForm');
    const title = document.getElementById('classModalTitle');
    
    if (classId) {
        // 수정 모드
        const cls = store.getClasses().find(c => c.id === classId);
        title.textContent = '반 수정';
        document.getElementById('classId').value = cls.id;
        document.getElementById('className').value = cls.name;
        document.getElementById('classDefaultFee').value = cls.defaultFee;
        document.getElementById('classSchedule').value = cls.schedule || '';
        document.getElementById('classTime').value = cls.time || '';
        document.getElementById('classCapacity').value = cls.capacity || '';
        document.getElementById('classNotes').value = cls.notes || '';
    } else {
        // 추가 모드
        title.textContent = '반 추가';
        form.reset();
    }
    
    modal.style.display = 'block';
}

function saveClass(event) {
    event.preventDefault();
    
    const classData = {
        name: document.getElementById('className').value.trim(),
        defaultFee: parseFloat(document.getElementById('classDefaultFee').value),
        schedule: document.getElementById('classSchedule').value.trim(),
        time: document.getElementById('classTime').value.trim(),
        capacity: document.getElementById('classCapacity').value,
        notes: document.getElementById('classNotes').value.trim()
    };
    
    const classId = document.getElementById('classId').value;
    
    if (classId) {
        store.updateClass(classId, classData);
        showNotification('반 정보가 수정되었습니다.');
    } else {
        store.addClass(classData);
        showNotification('새 반이 추가되었습니다.');
    }
    
    closeModal('classModal');
    loadClasses();
}

function editClass(id) {
    showClassModal(id);
}

function deleteClass(id) {
    if (confirm('정말 이 반을 삭제하시겠습니까?')) {
        store.deleteClass(id);
        showNotification('반이 삭제되었습니다.', 'info');
        loadClasses();
    }
}

// ==================== 납부 관리 ====================

function initPaymentMonth() {
    const select = document.getElementById('paymentMonth');
    const currentMonth = getCurrentYearMonth();
    
    // 최근 12개월 옵션 생성
    const months = [];
    for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.push(yearMonth);
    }
    
    select.innerHTML = '<option value="">월 선택</option>' +
        months.map(m => {
            const [year, month] = m.split('-');
            const label = `${year}년 ${parseInt(month)}월`;
            const selected = m === currentMonth ? 'selected' : '';
            return `<option value="${m}" ${selected}>${label}</option>`;
        }).join('');
}

function loadPayments() {
    const selectedMonth = document.getElementById('paymentMonth').value;
    
    if (!selectedMonth) {
        document.getElementById('paymentsTableBody').innerHTML = 
            '<tr><td colspan="11" style="text-align: center; padding: 40px;">월을 선택해주세요.</td></tr>';
        return;
    }
    
    const students = store.getStudents();
    const monthPayments = store.getMonthPayments(selectedMonth);
    const tbody = document.getElementById('paymentsTableBody');
    
    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" style="text-align: center; padding: 40px;">등록된 학생이 없습니다.</td></tr>';
        return;
    }
    
    // 형제 그룹별로 처리
    const siblingGroups = {};
    students.forEach(student => {
        if (student.siblingGroup) {
            if (!siblingGroups[student.siblingGroup]) {
                siblingGroups[student.siblingGroup] = [];
            }
            siblingGroups[student.siblingGroup].push(student);
        }
    });
    
    tbody.innerHTML = students.map(student => {
        const payment = monthPayments.find(p => p.studentId === student.id) || {};
        
        const siblingDiscount = parseFloat(payment.siblingDiscount || 0);
        const individualDiscount = parseFloat(payment.individualDiscount || 0);
        const bookFee = parseFloat(payment.bookFee || 0);
        const totalAmount = student.baseFee - siblingDiscount - individualDiscount + bookFee;
        
        const statusClass = payment.status === '완납' ? 'status-paid' : 
                           payment.status === '부분납' ? 'status-partial' : 'status-unpaid';
        
        // 형제 그룹의 첫 번째 학생인 경우에만 납부 관련 필드 표시
        const siblings = siblingGroups[student.siblingGroup] || [];
        const isFirstInGroup = siblings.length > 1 && siblings[0].id === student.id;
        const isInGroup = siblings.length > 1;
        
        let displayTotal = totalAmount;
        if (isFirstInGroup) {
            // 형제 그룹 전체 합계
            displayTotal = siblings.reduce((sum, s) => {
                const sp = monthPayments.find(p => p.studentId === s.id) || {};
                return sum + (s.baseFee - parseFloat(sp.siblingDiscount || 0) - 
                        parseFloat(sp.individualDiscount || 0) + parseFloat(sp.bookFee || 0));
            }, 0);
        }
        
        const showPaymentFields = !isInGroup || isFirstInGroup;
        
        return `
            <tr style="${isInGroup ? 'border-left: 3px solid #4F46E5;' : ''}">
                <td>${student.name}</td>
                <td>${student.className}</td>
                <td>${formatCurrency(student.baseFee)}</td>
                <td>
                    <input type="number" class="table-input" value="${siblingDiscount}" 
                           onchange="updatePaymentField('${selectedMonth}', '${student.id}', 'siblingDiscount', this.value)">
                </td>
                <td>
                    <input type="number" class="table-input" value="${individualDiscount}" 
                           onchange="updatePaymentField('${selectedMonth}', '${student.id}', 'individualDiscount', this.value)">
                </td>
                <td>
                    <input type="number" class="table-input" value="${bookFee}" 
                           onchange="updatePaymentField('${selectedMonth}', '${student.id}', 'bookFee', this.value)">
                </td>
                <td><strong>${formatCurrency(displayTotal)}</strong></td>
                <td>
                    ${showPaymentFields ? `
                        <select class="table-select ${statusClass}" 
                                onchange="updatePaymentField('${selectedMonth}', '${student.id}', 'status', this.value)">
                            <option value="미납" ${payment.status === '미납' || !payment.status ? 'selected' : ''}>미납</option>
                            <option value="완납" ${payment.status === '완납' ? 'selected' : ''}>완납</option>
                            <option value="부분납" ${payment.status === '부분납' ? 'selected' : ''}>부분납</option>
                        </select>
                    ` : '-'}
                </td>
                <td>
                    ${showPaymentFields ? `
                        <input type="date" class="table-input" value="${payment.paymentDate || ''}" 
                               onchange="updatePaymentField('${selectedMonth}', '${student.id}', 'paymentDate', this.value)">
                    ` : '-'}
                </td>
                <td>
                    <input type="text" class="table-input" value="${payment.notes || ''}" 
                           onchange="updatePaymentField('${selectedMonth}', '${student.id}', 'notes', this.value)">
                </td>
                <td>
                    ${showPaymentFields ? `
                        <button class="btn-edit" onclick="quickPayment('${selectedMonth}', '${student.id}')">완납처리</button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

function updatePaymentField(yearMonth, studentId, field, value) {
    const monthPayments = store.getMonthPayments(yearMonth);
    let payment = monthPayments.find(p => p.studentId === studentId);
    
    if (!payment) {
        payment = { studentId };
        monthPayments.push(payment);
    }
    
    payment[field] = value;
    
    // 총액 재계산
    const student = store.getStudents().find(s => s.id === studentId);
    if (student) {
        const siblingDiscount = parseFloat(payment.siblingDiscount || 0);
        const individualDiscount = parseFloat(payment.individualDiscount || 0);
        const bookFee = parseFloat(payment.bookFee || 0);
        payment.totalAmount = student.baseFee - siblingDiscount - individualDiscount + bookFee;
    }
    
    store.saveMonthPayments(yearMonth, monthPayments);
    
    if (field === 'status' || field === 'paymentDate') {
        loadPayments(); // 상태 변경시 색상 업데이트
        loadDashboard(); // 대시보드 통계 업데이트
    }
}

function quickPayment(yearMonth, studentId) {
    updatePaymentField(yearMonth, studentId, 'status', '완납');
    updatePaymentField(yearMonth, studentId, 'paymentDate', new Date().toISOString().split('T')[0]);
    showNotification('완납 처리되었습니다.');
    loadPayments();
    loadDashboard();
}

function generateMonthlyBill() {
    const selectedMonth = document.getElementById('paymentMonth').value;
    
    if (!selectedMonth) {
        showNotification('월을 선택해주세요.', 'error');
        return;
    }
    
    const students = store.getStudents();
    const existingPayments = store.getMonthPayments(selectedMonth);
    
    if (existingPayments.length > 0) {
        if (!confirm('이미 해당 월의 납부 데이터가 존재합니다. 초기화하시겠습니까?')) {
            return;
        }
    }
    
    // 새로운 월별 납부 내역 생성
    const newPayments = students.map(student => ({
        studentId: student.id,
        siblingDiscount: 0,
        individualDiscount: 0,
        bookFee: 0,
        totalAmount: student.baseFee,
        status: '미납',
        paymentDate: '',
        notes: ''
    }));
    
    store.saveMonthPayments(selectedMonth, newPayments);
    showNotification('월별 내역이 생성되었습니다.');
    loadPayments();
}

// ==================== CSV/Excel 내보내기 ====================

function exportStudentsCSV() {
    const students = store.getStudents();
    
    if (students.length === 0) {
        showNotification('내보낼 데이터가 없습니다.', 'error');
        return;
    }
    
    // CSV 헤더
    let csv = '학생명,반,기본수강료,형제그룹,연락처,등록일,비고\n';
    
    // 데이터 추가
    students.forEach(student => {
        csv += `${student.name},${student.className},${student.baseFee},${student.siblingGroup || ''},${student.phone || ''},${student.registrationDate || ''},${student.notes || ''}\n`;
    });
    
    // 파일 다운로드
    downloadFile(csv, 'students.csv', 'text/csv;charset=utf-8;');
}

function exportPaymentsExcel() {
    const selectedMonth = document.getElementById('paymentMonth').value;
    
    if (!selectedMonth) {
        showNotification('월을 선택해주세요.', 'error');
        return;
    }
    
    const students = store.getStudents();
    const monthPayments = store.getMonthPayments(selectedMonth);
    
    // Excel 데이터 준비
    const data = [
        ['학생명', '반', '기본수강료', '형제할인', '개별할인', '교재비', '납부총액', '납부여부', '납부일', '비고']
    ];
    
    students.forEach(student => {
        const payment = monthPayments.find(p => p.studentId === student.id) || {};
        
        const siblingDiscount = parseFloat(payment.siblingDiscount || 0);
        const individualDiscount = parseFloat(payment.individualDiscount || 0);
        const bookFee = parseFloat(payment.bookFee || 0);
        const totalAmount = student.baseFee - siblingDiscount - individualDiscount + bookFee;
        
        data.push([
            student.name,
            student.className,
            student.baseFee,
            siblingDiscount,
            individualDiscount,
            bookFee,
            totalAmount,
            payment.status || '미납',
            payment.paymentDate || '',
            payment.notes || ''
        ]);
    });
    
    // Excel 파일 생성
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '납부내역');
    
    // 파일명
    const [year, month] = selectedMonth.split('-');
    const filename = `${store.getAcademyName()}_${year}년${month}월_수강료.xlsx`;
    
    XLSX.writeFile(wb, filename);
    showNotification('엑셀 파일이 다운로드되었습니다.');
}

function importStudentsCSV() {
    document.getElementById('csvFileInput').click();
}

function handleCSVImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const buffer = e.target.result;
        const uint8 = new Uint8Array(buffer);
        
        let text;
        // UTF-8 BOM Check
        if (uint8[0] === 0xEF && uint8[1] === 0xBB && uint8[2] === 0xBF) {
            text = new TextDecoder('utf-8').decode(uint8.slice(3));
        } else {
            // EUC-KR (CP949)로 디코딩 시도
            try {
                text = cptable.utils.decode(949, uint8);
            } catch (err) {
                // 실패 시 UTF-8로 가정
                text = new TextDecoder('utf-8').decode(uint8);
            }
        }

        const lines = text.split(/\r?\n/);
        
        // 헤더 제거
        lines.shift();
        
        const students = [];
        lines.forEach(line => {
            const parts = line.split(',');
            if (parts.length >= 3 && parts[0].trim()) {
                students.push({
                    name: parts[0].trim(),
                    className: parts[1].trim(),
                    baseFee: parseFloat(parts[2]) || 0,
                    siblingGroup: parts[3] ? parts[3].trim() : '',
                    phone: parts[4] ? parts[4].trim() : '',
                    registrationDate: parts[5] ? parts[5].trim() : '',
                    notes: parts[6] ? parts[6].trim() : ''
                });
            }
        });
        
        if (students.length > 0) {
            students.forEach(student => store.addStudent(student));
            showNotification(`${students.length}명의 학생이 추가되었습니다.`);
            loadStudents();
            loadDashboard();
        }
    };
    
    reader.readAsArrayBuffer(file);
    event.target.value = ''; // 리셋
}

function downloadFile(content, filename, type) {
    const blob = new Blob(['\ufeff' + content], { type: type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ==================== 리포트 ====================

function initReportDates() {
    const currentDate = new Date();
    const endMonth = getCurrentYearMonth();
    
    const startDate = new Date(currentDate);
    startDate.setMonth(startDate.getMonth() - 5);
    const startMonth = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
    
    document.getElementById('reportStartMonth').value = startMonth;
    document.getElementById('reportEndMonth').value = endMonth;
}

function generateReport() {
    const startMonth = document.getElementById('reportStartMonth').value;
    const endMonth = document.getElementById('reportEndMonth').value;
    
    if (!startMonth || !endMonth) {
        showNotification('기간을 선택해주세요.', 'error');
        return;
    }
    
    const payments = store.getPayments();
    const students = store.getStudents();
    
    // 기간 내 월 목록 생성
    const months = [];
    let current = new Date(startMonth + '-01');
    const end = new Date(endMonth + '-01');
    
    while (current <= end) {
        const yearMonth = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        months.push(yearMonth);
        current.setMonth(current.getMonth() + 1);
    }
    
    // 월별 통계 계산
    const reportData = months.map(month => {
        const monthPayments = payments[month] || [];
        
        const totalFee = students.reduce((sum, s) => sum + parseFloat(s.baseFee || 0), 0);
        const totalDiscount = monthPayments.reduce((sum, p) => 
            sum + parseFloat(p.siblingDiscount || 0) + parseFloat(p.individualDiscount || 0), 0);
        const actualRevenue = monthPayments
            .filter(p => p.status === '완납')
            .reduce((sum, p) => sum + parseFloat(p.totalAmount || 0), 0);
        const paidCount = monthPayments.filter(p => p.status === '완납').length;
        const paymentRate = students.length > 0 ? (paidCount / students.length * 100).toFixed(1) : 0;
        
        return {
            month,
            totalFee,
            totalDiscount,
            actualRevenue,
            paymentRate
        };
    });
    
    // 요약 정보
    const totalRevenue = reportData.reduce((sum, d) => sum + d.actualRevenue, 0);
    const avgPaymentRate = reportData.reduce((sum, d) => sum + parseFloat(d.paymentRate), 0) / reportData.length;
    
    const summaryDiv = document.getElementById('reportSummary');
    summaryDiv.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <div class="stat-card">
                <h3>총 수입</h3>
                <p class="stat-number">${formatCurrency(totalRevenue)}</p>
            </div>
            <div class="stat-card">
                <h3>평균 납부율</h3>
                <p class="stat-number">${avgPaymentRate.toFixed(1)}%</p>
            </div>
            <div class="stat-card">
                <h3>분석 기간</h3>
                <p class="stat-number">${months.length}개월</p>
            </div>
        </div>
    `;
    
    // 상세 테이블
    const tbody = document.getElementById('reportTableBody');
    tbody.innerHTML = reportData.map(data => {
        const [year, month] = data.month.split('-');
        return `
            <tr>
                <td>${year}년 ${parseInt(month)}월</td>
                <td>${formatCurrency(data.totalFee)}</td>
                <td>${formatCurrency(data.totalDiscount)}</td>
                <td>${formatCurrency(data.actualRevenue)}</td>
                <td>${data.paymentRate}%</td>
            </tr>
        `;
    }).join('');
    
    // 차트
    loadReportChart(reportData);
    
    showNotification('리포트가 생성되었습니다.');
}

function loadReportChart(reportData) {
    const labels = reportData.map(d => {
        const [year, month] = d.month.split('-');
        return `${year}년 ${parseInt(month)}월`;
    });
    
    const revenueData = reportData.map(d => d.actualRevenue);
    const rateData = reportData.map(d => parseFloat(d.paymentRate));
    
    const ctx = document.getElementById('reportChart');
    if (window.reportChart) {
        window.reportChart.destroy();
    }
    
    window.reportChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '실제 수입',
                data: revenueData,
                backgroundColor: 'rgba(79, 70, 229, 0.8)',
                yAxisID: 'y'
            }, {
                label: '납부율 (%)',
                data: rateData,
                type: 'line',
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                yAxisID: 'y1',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: 0,
                    max: 100,
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function exportReportPDF() {
    showNotification('PDF 내보내기 기능은 추후 업데이트 예정입니다.', 'info');
}

// ==================== 모달 관리 ====================

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 모달 외부 클릭시 닫기
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// ==================== 초기화 ====================

document.addEventListener('DOMContentLoaded', function() {
    loadAcademyName();
    loadDashboard();
    
    // 테이블 입력 스타일
    const style = document.createElement('style');
    style.textContent = `
        .table-input, .table-select {
            padding: 5px 8px;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            width: 100%;
            font-size: 0.9rem;
        }
        .table-input:focus, .table-select:focus {
            outline: none;
            border-color: var(--primary-color);
        }
    `;
    document.head.appendChild(style);
});
