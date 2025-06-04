const userMenuButton = document.getElementById('userMenuButton');
const userMenu = document.getElementById('userMenu');
const addStudentModalContainer = document.getElementById('addStudentModalContainer');
const addStudentForm = document.getElementById('addStudentForm');
const courseSelect = document.getElementById('addStudentCourse');
const classSelect = document.getElementById('addStudentClass');
const subjectSelect = document.getElementById('addStudentSubject');
const departmentInput = document.getElementById('addStudentDepartment');
const instructorsInput = document.getElementById('addStudentInstructors');
const subjectScoresList = document.getElementById('subjectScoresList');
const averageScoreInput = document.getElementById('addStudentAverageScore');
const tuitionInput = document.getElementById('addStudentTuition');
const searchInput = document.querySelector('input[placeholder="Tìm kiếm sinh viên theo tên, lớp, môn học..."]');
const studentTableBody = document.querySelector('table tbody');
const noResultsRow = studentTableBody.querySelector('td[colspan="10"]');
const deleteConfirmationModal = document.getElementById('deleteConfirmationModal');
const studentIdToDeleteSpan = document.getElementById('studentIdToDelete');
const studentNameToDeleteSpan = document.getElementById('addStudentName');
const confirmDeleteButton = document.getElementById('confirmDeleteButton');

const paginationContainer = document.getElementById('paginationContainer');
const prevPageButton = document.getElementById('prevPageButton');
const nextPageButton = document.getElementById('nextPageButton');
const pageInfoSpan = document.getElementById('pageInfo');
const studentCountInfoSpan = document.getElementById('studentCountInfo');

let currentStudentIdToDelete = null;
let currentPage = 1;
const rowsPerPage = 30;
let allStudents = [];

if (userMenuButton && userMenu) {
    userMenuButton.addEventListener('click', () => userMenu.classList.toggle('hidden'));
    document.addEventListener('click', (event) => {
        if (!userMenuButton.contains(event.target) && !userMenu.contains(event.target)) {
            userMenu.classList.add('hidden');
        }
    });
}

async function loadInitialData() {
    try {
        courseSelect.disabled = true;
        const response = await fetch('/api/courses');
        if (!response.ok) throw new Error('Failed to fetch courses');

        const courses = await response.json();
        courseSelect.innerHTML = '<option value="">Chọn khóa học</option>';
        courses.forEach(course => courseSelect.add(new Option(`Khóa ${course.name}`, course.id)));
        courseSelect.disabled = false;
        resetDependentFields('course');
        if (subjectSelect) $(subjectSelect).val(null).trigger('change');
    } catch (error) {
        console.error('Error loading initial data:', error);
        showNotification('Không thể tải dữ liệu khóa học', 'error');
        courseSelect.innerHTML = '<option value="">Lỗi tải dữ liệu</option>';
    } finally {
        courseSelect.disabled = false;
    }
}

window.resetDependentFields = (level) => {
    if (level === 'course') {
        classSelect.innerHTML = '<option value="">Chọn lớp</option>';
        classSelect.disabled = true;
        $(subjectSelect).empty().val(null).trigger('change');
        subjectSelect.disabled = true;
        departmentInput.value = '';
        instructorsInput.value = '';
        averageScoreInput.value = '';
        if (subjectScoresList) subjectScoresList.innerHTML = `<p class="text-gray-500 italic text-sm text-center">Chưa có môn học nào được chọn</p>`;
    } else if (level === 'class') {
        $(subjectSelect).empty().val(null).trigger('change');
        subjectSelect.disabled = true;
        departmentInput.value = '';
        instructorsInput.value = '';
        if (subjectScoresList) subjectScoresList.innerHTML = `<p class="text-gray-500 italic text-sm text-center">Chưa có môn học nào được chọn</p>`;
    }
};

window.showAddModal = () => {
    if (addStudentModalContainer) {
        addStudentModalContainer.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        if (addStudentForm) addStudentForm.reset();
        resetDependentFields('course');
        loadInitialData();
        if (subjectScoresList) subjectScoresList.innerHTML = `<p class="text-gray-500 italic text-sm text-center">Chưa có môn học nào được chọn</p>`;
        if (subjectSelect) $(subjectSelect).val(null).trigger('change');
    }
};

window.closeAddModal = () => {
    if (addStudentModalContainer) {
        addStudentModalContainer.classList.add('hidden');
        document.body.style.overflow = '';
    }
};

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !addStudentModalContainer.classList.contains('hidden')) {
        closeAddModal();
    }
});

if (addStudentModalContainer) {
    addStudentModalContainer.addEventListener('click', (event) => {
        if (event.target === addStudentModalContainer) closeAddModal();
    });
}

window.validateScore = (inputElement) => {
    let value = parseFloat(inputElement.value);
    if (isNaN(value)) return;
    if (value < 0) inputElement.value = '0';
    if (value > 10) inputElement.value = '10';
};

window.formatScore = (inputElement) => {
    let value = parseFloat(inputElement.value);
    if (!isNaN(value)) inputElement.value = value.toFixed(1);
};

function calculateAverageScore() {
    if (!averageScoreInput) return;
    const scoreInputs = subjectScoresList.querySelectorAll('.subject-score-input');
    let totalScore = 0;
    let count = 0;
    scoreInputs.forEach(input => {
        const score = parseFloat(input.value);
        if (!isNaN(score)) {
            totalScore += score;
            count++;
        }
    });
    averageScoreInput.value = count > 0 ? (totalScore / count).toFixed(1) : '';
}

if (averageScoreInput) {
    averageScoreInput.addEventListener('input', function () {
        validateScore(this);
    });
    averageScoreInput.addEventListener('blur', function () {
        formatScore(this);
    });
}

window.formatCurrency = (inputElement) => {
    let value = inputElement.value.replace(/[^0-9]/g, '');
    inputElement.dataset.originalValue = value;
    inputElement.value = value ? new Intl.NumberFormat('vi-VN').format(value) : '';
};

window.handleCurrencyFocus = (inputElement) => {
    inputElement.value = inputElement.dataset.originalValue || '';
};

window.handleCurrencyBlur = (inputElement) => {
    let value = inputElement.value.replace(/[^0-9]/g, '');
    inputElement.dataset.originalValue = value;
    inputElement.value = value ? new Intl.NumberFormat('vi-VN').format(value) : '';
};

if (tuitionInput) {
    tuitionInput.addEventListener('input', function () {
        formatCurrency(this);
    });
    tuitionInput.addEventListener('blur', function () {
        handleCurrencyBlur(this);
    });
    tuitionInput.addEventListener('focus', function () {
        handleCurrencyFocus(this);
    });
}

function showNotification(message, type = 'info', duration = 3000) {
    const notificationContainer = document.getElementById('notificationContainer') || (() => {
        const area = document.createElement('div');
        area.id = 'notificationContainer';
        area.className = 'fixed top-0 right-0 p-4 space-y-2 z-[99]';
        document.body.appendChild(area);
        return area;
    })();

    const notification = document.createElement('div');
    notification.className = `p-4 rounded-lg shadow-md mb-3 flex items-center gap-2 transition-all duration-300 ease-out transform translate-x-full opacity-0`;
    notification.style.fontFamily = 'Inter, sans-serif';

    let iconClass = '';
    let bgColorClass = '';
    let textColorClass = '';
    let borderColorClass = '';

    switch (type) {
        case 'success':
            iconClass = 'fa-solid fa-check-circle';
            bgColorClass = 'bg-green-100';
            textColorClass = 'text-green-800';
            borderColorClass = 'border-green-400';
            break;
        case 'error':
            iconClass = 'fa-solid fa-times-circle';
            bgColorClass = 'bg-red-100';
            textColorClass = 'text-red-800';
            borderColorClass = 'border-red-400';
            break;
        case 'warning':
            iconClass = 'fa-solid fa-exclamation-triangle';
            bgColorClass = 'bg-yellow-100';
            textColorClass = 'text-yellow-800';
            borderColorClass = 'border-yellow-400';
            break;
        case 'info':
        default:
            iconClass = 'fa-solid fa-info-circle';
            bgColorClass = 'bg-blue-100';
            textColorClass = 'text-blue-800';
            borderColorClass = 'border-blue-400';
            break;
    }

    notification.classList.add(bgColorClass, textColorClass, `border-l-4`, borderColorClass);
    notification.innerHTML = `
        <i class="${iconClass} text-lg"></i>
        <span class="text-sm flex-grow">${message}</span>
        <button class="ml-auto text-current opacity-75 hover:opacity-100 focus:outline-none" onclick="this.closest('div').remove()">
            <i class="fa-solid fa-times text-xs"></i>
        </button>
    `;

    notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.classList.remove('translate-x-full', 'opacity-0');
        notification.classList.add('translate-x-0', 'opacity-100');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('translate-x-0', 'opacity-100');
        notification.classList.add('translate-x-full', 'opacity-0');
        notification.addEventListener('transitionend', () => notification.remove());
    }, duration);
}
window.showNotification = showNotification;

function filterAndDisplayStudents() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    let filteredStudents = [];

    allStudents.forEach(studentRow => {
        const studentId = studentRow.cells[0]?.textContent.toLowerCase() || '';
        const studentName = studentRow.cells[2]?.textContent.toLowerCase() || '';
        const studentClass = studentRow.cells[3]?.textContent.toLowerCase() || '';
        const studentCourses = studentRow.cells[4]?.textContent.toLowerCase() || '';
        const studentSubjects = studentRow.cells[5]?.textContent.toLowerCase() || '';

        const isMatch = studentId.includes(searchTerm) ||
            studentName.includes(searchTerm) ||
            studentClass.includes(searchTerm) ||
            studentCourses.includes(searchTerm) ||
            studentSubjects.includes(searchTerm);

        if (isMatch) {
            filteredStudents.push(studentRow);
        }
    });

    const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
    currentPage = Math.min(Math.max(1, currentPage), totalPages || 1);

    allStudents.forEach(row => row.style.display = 'none');

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const rowsToDisplay = filteredStudents.slice(startIndex, endIndex);

    rowsToDisplay.forEach(row => row.style.display = '');

    pageInfoSpan.textContent = `Trang ${currentPage} / ${totalPages || 1}`;
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages || totalPages === 0;

    studentCountInfoSpan.textContent = `Hiển thị ${filteredStudents.length} sinh viên`;

    if (filteredStudents.length === 0 && searchTerm !== '') {
        if (noResultsRow) {
            noResultsRow.style.display = '';
            noResultsRow.innerHTML = `
                <td colspan="10" class="p-8 text-center text-gray-500">
                    <div class="flex flex-col items-center py-4">
                        <i class="fas fa-search text-4xl mb-3 text-gray-400"></i>
                        <p class="text-lg">Không tìm thấy sinh viên nào khớp với "${searchInput.value}"</p>
                    </div>
                </td>`;
        }
    } else if (filteredStudents.length === 0 && searchTerm === '') {
        if (noResultsRow) {
            noResultsRow.style.display = '';
            noResultsRow.innerHTML = `
                <tr>
                    <td colspan="10" class="p-8 text-center text-gray-500">
                        <div class="flex flex-col items-center py-4">
                            <i class="fas fa-user-graduate text-4xl mb-3 text-gray-400"></i>
                            <p class="text-lg">Không tìm thấy sinh viên nào</p>
                        </div>
                    </td>
                </tr>`;
        }
    } else {
        if (noResultsRow) {
            noResultsRow.style.display = 'none';
        }
    }

    if (filteredStudents.length > rowsPerPage) {
        paginationContainer.classList.remove('hidden');
    } else {
        paginationContainer.classList.add('hidden');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    allStudents = Array.from(studentTableBody.querySelectorAll('tr[data-student-id]'));
    filterAndDisplayStudents();
});


if (searchInput) {
    searchInput.addEventListener('input', function () {
        currentPage = 1;
        filterAndDisplayStudents();
    });
}

if (prevPageButton) {
    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            filterAndDisplayStudents();
        }
    });
}

if (nextPageButton) {
    nextPageButton.addEventListener('click', () => {s
        const searchTerm = searchInput.value.toLowerCase().trim();
        let filteredStudents = [];
        allStudents.forEach(studentRow => {
            const studentId = studentRow.cells[0]?.textContent.toLowerCase() || '';
            const studentName = studentRow.cells[2]?.textContent.toLowerCase() || '';
            const studentClass = studentRow.cells[3]?.textContent.toLowerCase() || '';
            const studentCourses = studentRow.cells[4]?.textContent.toLowerCase() || '';
            const studentSubjects = studentRow.cells[5]?.textContent.toLowerCase() || '';

            const isMatch = studentId.includes(searchTerm) ||
                studentName.includes(searchTerm) ||
                studentClass.includes(searchTerm) ||
                studentCourses.includes(searchTerm) ||
                studentSubjects.includes(searchTerm);

            if (isMatch) {
                filteredStudents.push(studentRow);
            }
        });
        const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);

        if (currentPage < totalPages) {
            currentPage++;
            filterAndDisplayStudents();
        }
    });
}

window.deleteStudent = (studentId, studentName) => {
    currentStudentIdToDelete = studentId;
    studentIdToDeleteSpan.textContent = studentId;
    studentNameToDeleteSpan.textContent = studentName;

    deleteConfirmationModal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    deleteConfirmationModal.classList.add('opacity-100');
    deleteConfirmationModal.querySelector('div:nth-child(1)').classList.remove('scale-95', 'opacity-0');
    deleteConfirmationModal.querySelector('div:nth-child(1)').classList.add('scale-100', 'opacity-100');
};

function closeDeleteModal() {
    deleteConfirmationModal.classList.remove('opacity-100');
    deleteConfirmationModal.classList.add('opacity-0');
    deleteConfirmationModal.querySelector('div:nth-child(1)').classList.remove('scale-100', 'opacity-100');
    deleteConfirmationModal.querySelector('div:nth-child(1)').classList.add('scale-95', 'opacity-0');

    deleteConfirmationModal.addEventListener('transitionend', function handler() {
        deleteConfirmationModal.classList.add('hidden', 'pointer-events-none');
        deleteConfirmationModal.removeEventListener('transitionend', handler);
    });
    currentStudentIdToDelete = null;
}
window.closeDeleteModal = closeDeleteModal;

confirmDeleteButton.addEventListener('click', async () => {
    if (!currentStudentIdToDelete) return;

    try {
        const response = await fetch(`/api/students/${currentStudentIdToDelete}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (response.ok) {
            const studentRow = document.querySelector(`tr[data-student-id="${currentStudentIdToDelete}"]`);
            if (studentRow) {
                allStudents = allStudents.filter(row => row.dataset.studentId !== currentStudentIdToDelete);
                showNotification('Xóa sinh viên thành công', 'success');
                filterAndDisplayStudents();
            }
        } else {
            const errorMessages = {
                404: 'Không tìm thấy sinh viên',
                403: 'Bạn không có quyền xóa sinh viên này'
            };
            showNotification(errorMessages[response.status] || 'Không thể xóa sinh viên', 'error');
        }
    } catch (error) {
        console.error('Lỗi khi xóa sinh viên:', error);
        showNotification('Đã xảy ra lỗi khi xóa sinh viên', 'error');
    } finally {
        closeDeleteModal();
    }
});

deleteConfirmationModal.addEventListener('click', (event) => {
    if (event.target === deleteConfirmationModal) closeDeleteModal();
});
