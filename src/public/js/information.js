const studentData = window.studentData || {};
let originalStudentData = {};

document.addEventListener('DOMContentLoaded', function () {
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('editForm');
    const editStudentCourse = document.getElementById('editStudentCourse');
    const editStudentClass = document.getElementById('editStudentClass');
    const editStudentSubjects = document.getElementById('editStudentSubjects');
    const editStudentDepartment = document.getElementById('editStudentDepartment');
    const editStudentInstructors = document.getElementById('editStudentInstructors');
    const editStudentAverageScore = document.getElementById('editStudentAverageScore');
    const tuitionInput = editForm.querySelector('input[name="tuition"]');
    const subjectScoresContainer = document.getElementById('subject-scores-container');
    const editStudentDateOfBirthDisplay = document.getElementById('editStudentDateOfBirthDisplay');
    const editStudentDateOfBirthHidden = document.getElementById('editStudentDateOfBirthHidden');


    $(editStudentSubjects).select2({
        placeholder: 'Chọn môn học',
        allowClear: true,
        multiple: true,
        width: '100%',
        dropdownParent: $('#editModal')
    });

    function resetDependentFields(level) {
        if (level === 'course') {
            editStudentClass.innerHTML = '<option value="">Chọn lớp</option>';
            editStudentClass.disabled = true;
            editStudentDepartment.value = '';
            editStudentInstructors.value = '';
            $(editStudentSubjects).empty().val(null).trigger('change');
            editStudentSubjects.disabled = true;
            subjectScoresContainer.innerHTML = `<p class="text-gray-500 italic text-sm text-center">Không có môn học nào để nhập điểm.</p>`;
            editStudentAverageScore.value = '';
        }
        if (level === 'class') {
            $(editStudentSubjects).empty().val(null).trigger('change');
            editStudentSubjects.disabled = true;
            subjectScoresContainer.innerHTML = `<p class="text-gray-500 italic text-sm text-center">Không có môn học nào để nhập điểm.</p>`;
            editStudentAverageScore.value = '';
        }
    }

    async function loadCoursesAndPopulate() {
        try {
            editStudentCourse.disabled = true;
            const response = await fetch('/api/courses');
            if (!response.ok) throw new Error('Failed to fetch courses');
            const courses = await response.json();

            editStudentCourse.innerHTML = '<option value="">Chọn khóa học</option>';
            let selectedCourseId = '';
            courses.forEach(course => {
                const option = new Option(`Khóa ${course.name}`, course.id);
                editStudentCourse.add(option);
                if (studentData.courses && studentData.courses.includes(course.name)) {
                    selectedCourseId = course.id;
                }
            });
            editStudentCourse.disabled = false;

            if (selectedCourseId) {
                editStudentCourse.value = selectedCourseId;
                await loadClassesAndPopulate(selectedCourseId);
            } else {
                resetDependentFields('course');
            }
        } catch (error) {
            console.error('Error loading courses:', error);
            window.showNotification('Không thể tải danh sách khóa học', 'error');
        } finally {
            editStudentCourse.disabled = false;
        }
    }

    async function loadClassesAndPopulate(courseId) {
        resetDependentFields('class');
        if (!courseId) {
            editStudentClass.disabled = true;
            return;
        }
        try {
            editStudentClass.disabled = true;
            const response = await fetch(`/api/classes?courseId=${courseId}`);
            if (!response.ok) throw new Error('Failed to fetch classes');
            const classes = await response.json();

            editStudentClass.innerHTML = '<option value="">Chọn lớp</option>';
            let selectedClassId = '';
            classes.forEach(cls => {
                const option = new Option(cls.name, cls.id);
                editStudentClass.add(option);
                if (studentData.classes && studentData.classes.includes(cls.name)) {
                    selectedClassId = cls.id;
                }
            });
            editStudentClass.disabled = false;

            if (selectedClassId) {
                editStudentClass.value = selectedClassId;
                await loadSubjectsAndPopulate(selectedClassId);
            } else {
                editStudentDepartment.value = 'N/A';
                editStudentInstructors.value = 'N/A';
            }
        } catch (error) {
            console.error('Error loading classes:', error);
            window.showNotification('Không thể tải danh sách lớp', 'error');
        } finally {
            editStudentClass.disabled = false;
        }
    }

    async function loadSubjectsAndPopulate(classId) {
        $(editStudentSubjects).empty();
        editStudentSubjects.disabled = true;
        if (!classId) {
            $(editStudentSubjects).val(null).trigger('change');
            editStudentDepartment.value = 'N/A';
            editStudentInstructors.value = 'N/A';
            return;
        }
        try {
            const response = await fetch(`/api/subjects?classId=${classId}`);
            if (!response.ok) throw new Error('Failed to fetch subjects');
            const subjects = await response.json();

            const selectedSubjectIds = [];
            subjects.forEach(subject => {
                const option = new Option(subject.name, subject.id);
                $(editStudentSubjects).append(option);
                if (studentData.subjects && studentData.subjects.includes(subject.name)) {
                    selectedSubjectIds.push(subject.id);
                }
            });
            editStudentSubjects.disabled = false;

            if (selectedSubjectIds.length > 0) {
                $(editStudentSubjects).val(selectedSubjectIds).trigger('change');
                await loadSubjectDetailsAndPopulate(selectedSubjectIds);
            } else {
                $(editStudentSubjects).val(null).trigger('change');
                editStudentDepartment.value = 'N/A';
                editStudentInstructors.value = 'N/A';
            }
            renderSubjectScoreInputs();
        }
        catch (error) {
            console.error('Error loading subjects:', error);
            window.showNotification('Không thể tải danh sách môn học', 'error');
        } finally {
            editStudentSubjects.disabled = false;
        }
    }

    async function loadSubjectDetailsAndPopulate(subjectIds) {
        try {
            const promises = subjectIds.map(id =>
                fetch(`/api/subjects/${id}/details`)
                    .then(response => {
                        if (!response.ok) throw new Error('Failed to fetch subject details');
                        return response.json();
                    })
            );

            const details = await Promise.all(promises);

            const departments = new Set();
            const instructors = new Set();

            details.forEach(detail => {
                if (detail.department) departments.add(detail.department);
                if (detail.instructors) detail.instructors.forEach(i => instructors.add(i));
            });

            editStudentDepartment.value = Array.from(departments).join(', ');
            editStudentInstructors.value = Array.from(instructors).join(', ');

        } catch (error) {
            console.error('Error loading subject details:', error);
            window.showNotification('Không thể tải thông tin chi tiết môn học', 'error');
        }
    }

    let cachedGrades = null;
    async function fetchGradesFromApiOnce(studentId, classId) {
        if (cachedGrades) {
            console.log('Using cached grades data.');
            return cachedGrades;
        }

        try {
            const url = `/api/grades?studentId=${studentId}${classId ? `&classId=${classId}` : ''}`;
            
            console.log(`Fetching grades from API: ${url}`);
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch grades from API');
            }

            const result = await response.json();
            if (result.success && result.data) {
                cachedGrades = result.data;
                console.log('Grades fetched and cached successfully.');
                return cachedGrades;
            } else {
                console.warn('API response for grades was not successful or data was missing:', result);
                return [];
            }
        } catch (error) {
            console.error('Error fetching grades from API:', error);
            window.showNotification(`Lỗi khi tải điểm số: ${error.message}`, 'error');
            return [];
        }
    }

    async function renderSubjectScoreInputs() {
        const selectedClassId = editStudentClass.value;
        const selectedSubjectNames = $(editStudentSubjects).select2('data').map(s => s.text);
        subjectScoresContainer.innerHTML = '';

        if (!selectedClassId || selectedSubjectNames.length === 0) {
            subjectScoresContainer.innerHTML = `<p class="text-gray-500 italic text-sm text-center">Không có môn học nào để nhập điểm.</p>`;
            editStudentAverageScore.value = '';
            return;
        }

        try {
            const gradesData = await fetchGradesFromApiOnce(studentData.id, selectedClassId);

            selectedSubjectNames.forEach(subjectName => {
                const grade = gradesData.find(g => g.subjectName === subjectName) || {};
                const div = document.createElement('div');
                div.className = 'flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg';
                div.innerHTML = `
                    <span class="flex-1 text-base text-gray-700 font-medium">${subjectName}</span>
                    <div class="flex gap-4">
                        <div class="relative">
                            <input type="number" 
                                name="grades[${subjectName}][process_score]" 
                                value="${grade.processScore || ''}"
                                class="w-20 p-2 border border-gray-300 rounded-md text-sm text-center form-input-focus subject-score-input"
                                step="0.1" 
                                min="0" 
                                max="10"
                                placeholder="QT"
                                oninput="window.validateScore(this)"
                                onchange="window.calculateAverageScore()"
                                onblur="window.formatScore(this)">
                            <span class="absolute -top-5 left-0 text-xs text-gray-500">Quá trình</span>
                        </div>

                        <div class="relative">
                            <input type="number" 
                                name="grades[${subjectName}][midterm_score]" 
                                value="${grade.midtermScore || ''}"
                                class="w-20 p-2 border border-gray-300 rounded-md text-sm text-center form-input-focus subject-score-input"
                                step="0.1" 
                                min="0" 
                                max="10"
                                placeholder="GK"
                                oninput="window.validateScore(this)"
                                onchange="window.calculateAverageScore()"
                                onblur="window.formatScore(this)">
                            <span class="absolute -top-5 left-0 text-xs text-gray-500">Giữa kỳ</span>
                        </div>

                        <div class="relative">
                            <input type="number" 
                                name="grades[${subjectName}][final_score]" 
                                value="${grade.finalScore || ''}"
                                class="w-20 p-2 border border-gray-300 rounded-md text-sm text-center form-input-focus subject-score-input"
                                step="0.1" 
                                min="0" 
                                max="10"
                                placeholder="CK"
                                oninput="window.validateScore(this)"
                                onchange="window.calculateAverageScore()"
                                onblur="window.formatScore(this)">
                            <span class="absolute -top-5 left-0 text-xs text-gray-500">Cuối kỳ</span>
                        </div>
                    </div>
                `;
                subjectScoresContainer.appendChild(div);
            });

            window.calculateAverageScore();
        } catch (error) {
            console.error('Error rendering subject scores:', error);
            window.showNotification('Có lỗi xảy ra khi hiển thị điểm', 'error');
        }
    }

    window.validateScore = (inputElement) => {
        let value = parseFloat(inputElement.value);
        if (isNaN(value)) return;
        
        if (value < 0) value = 0;
        if (value > 10) value = 10;
        
        inputElement.value = value;
    };

    window.formatScore = (inputElement) => {
        let value = parseFloat(inputElement.value);
        if (!isNaN(value)) {
            value = Math.max(0, Math.min(10, value));
            inputElement.value = value.toFixed(1);
        }
        window.calculateAverageScore();
    };

    window.calculateAverageScore = () => {
        const subjects = document.querySelectorAll('#subject-scores-container > div');
        let totalWeightedScore = 0;
        let validSubjects = 0;

        subjects.forEach(subject => {
            const finalScoreInput = subject.querySelector('input[name$="[final_score]"]');
            const processScoreInput = subject.querySelector('input[name$="[process_score]"]');
            const midtermScoreInput = subject.querySelector('input[name$="[midterm_score]"]');

            if (finalScoreInput && finalScoreInput.value) {
                const finalScore = parseFloat(finalScoreInput.value);
                const processScore = processScoreInput?.value ? parseFloat(processScoreInput.value) : 0;
                const midtermScore = midtermScoreInput?.value ? parseFloat(midtermScoreInput.value) : 0;

                if (!isNaN(finalScore) && finalScore >= 0 && finalScore <= 10) {
                    const weightedScore = (processScore * 0.3) + (midtermScore * 0.2) + (finalScore * 0.5);
                    totalWeightedScore += weightedScore;
                    validSubjects++;
                }
            }
        });

        const averageScoreInput = document.getElementById('editStudentAverageScore');
        if (validSubjects > 0) {
            const average = totalWeightedScore / validSubjects;
            averageScoreInput.value = average.toFixed(1);
        } else {
            averageScoreInput.value = '-';
        }
    };

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

    function formatDateForDisplay(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            
            return `${day}-${month}-${year}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    }

    $(editStudentDateOfBirthDisplay).datepicker({
        dateFormat: 'dd-mm-yy',
        altField: '#editStudentDateOfBirthHidden',
        altFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true,
        yearRange: '1900:c+0',
        showButtonPanel: true,
        currentText: 'Hôm nay', 
        closeText: 'Đóng',
        monthNames: ['Tháng Một', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu', 'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Mười Hai'],
        monthNamesShort: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'],
        dayNames: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
        dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
        dayNamesMin: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
        weekHeader: 'Tuần',
        firstDay: 1
    });

    function validateForm(formData) {
        const errors = [];
        const MAX_URL_LENGTH = 255; 
        
        if (!formData.get('name')?.trim()) {
            errors.push('Họ tên không được để trống');
        }
        
        if (!formData.get('email')?.trim()) {
            errors.push('Email không được để trống');
        }

        const avatarUrl = formData.get('avatar')?.trim();
        if (avatarUrl) {
            if (avatarUrl.length > MAX_URL_LENGTH) {
                errors.push(`URL ảnh đại diện không được vượt quá ${MAX_URL_LENGTH} ký tự`);
            }
            
            try {
                new URL(avatarUrl);
            } catch (e) {
                errors.push('URL ảnh đại diện không hợp lệ');
            }
        }

        const dobHiddenValue = editStudentDateOfBirthHidden.value;
        if (dobHiddenValue && !/^\d{4}-\d{2}-\d{2}$/.test(dobHiddenValue)) {
            errors.push('Ngày sinh không hợp lệ. Vui lòng chọn ngày từ lịch.');
        }


        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }

        return true;
    }

    function getChangedData(currentData, originalData) {
        const changedFields = {};

        const compareValue = (val1, val2) => {
            if (val1 === null || val1 === undefined) val1 = '';
            if (val2 === null || val2 === undefined) val2 = '';
            return String(val1) !== String(val2);
        };

        const formatDate = (dateString) => {
            if (!dateString) return '';
            try {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return '';
                return date.toISOString().split('T')[0];
            } catch (error) {
                console.error('Error formatting date for comparison:', error);
                return '';
            }
        };

        const personalInfoChanges = {};
        if (compareValue(currentData.personalInfo.name, originalData.name)) {
            personalInfoChanges.name = currentData.personalInfo.name;
        }
        if (compareValue(currentData.personalInfo.email, originalData.email)) {
            personalInfoChanges.email = currentData.personalInfo.email;
        }
        const currentDob = formatDate(currentData.personalInfo.dateOfBirth);
        const originalDob = formatDate(originalData.dateOfBirth);
        if (compareValue(currentDob, originalDob)) {
            personalInfoChanges.dateOfBirth = currentData.personalInfo.dateOfBirth;
        }
        if (compareValue(currentData.personalInfo.gender, originalData.gender)) {
            personalInfoChanges.gender = currentData.personalInfo.gender;
        }
        if (compareValue(currentData.personalInfo.address, originalData.address)) {
            personalInfoChanges.address = currentData.personalInfo.address;
        }
        if (compareValue(currentData.personalInfo.avatar, originalData.avatar)) {
            personalInfoChanges.avatar = currentData.personalInfo.avatar;
        }
        if (Object.keys(personalInfoChanges).length > 0) {
            changedFields.personalInfo = personalInfoChanges;
        }

        const academicInfoChanges = {};
        originalData.academicInfo = originalData.academicInfo || {};
        if (compareValue(currentData.academicInfo.courseId, originalData.academicInfo.courseId)) {
            academicInfoChanges.courseId = currentData.academicInfo.courseId;
        }
        if (compareValue(currentData.academicInfo.classId, originalData.academicInfo.classId)) {
            academicInfoChanges.classId = currentData.academicInfo.classId;
        }

        const currentSubjectsSorted = [...(currentData.academicInfo.subjects || [])].sort().join(',');
        const originalSubjectsSorted = [...(originalData.academicInfo.subjects || [])].sort().join(',');
        if (currentSubjectsSorted !== originalSubjectsSorted) {
            academicInfoChanges.subjects = currentData.academicInfo.subjects;
        }
        if (Object.keys(academicInfoChanges).length > 0) {
            changedFields.academicInfo = academicInfoChanges;
        }

        const scoresChanges = {};
        originalData.scores = originalData.scores || {};
        originalData.scores.average = typeof originalData.scores.average !== 'undefined' ? originalData.scores.average : null;

        const currentAvg = parseFloat(currentData.scores.average);
        const originalAvg = parseFloat(originalData.scores.average);
        if (isNaN(currentAvg) !== isNaN(originalAvg) || (!isNaN(currentAvg) && currentAvg.toFixed(1) !== originalAvg.toFixed(1))) {
            scoresChanges.average = currentData.scores.average;
        }

        const currentSubjectScores = currentData.scores.grades || {}; 
        const originalSubjectScores = originalData.scores.grades || {}; 
        let subjectScoresChanged = false;
        const allSubjectKeys = new Set([...Object.keys(currentSubjectScores), ...Object.keys(originalSubjectScores)]);

        for (const key of allSubjectKeys) {
            const currentScore = parseFloat(currentSubjectScores[key]);
            const originalScore = parseFloat(originalSubjectScores[key]);

            if (isNaN(currentScore) !== isNaN(originalScore) || (!isNaN(currentScore) && currentScore.toFixed(1) !== originalScore.toFixed(1))) {
                subjectScoresChanged = true;
                break;
            }
        }

        if (subjectScoresChanged) {
            scoresChanges.grades = currentData.scores.grades;
        }
        if (Object.keys(scoresChanges).length > 0) {
            changedFields.scores = scoresChanges;
        }

        const financialChanges = {};
        originalData.financial = originalData.financial || {};
        originalData.financial.tuition = typeof originalData.financial.tuition !== 'undefined' ? originalData.financial.tuition : 0;

        if (parseFloat(currentData.financial.tuition) !== parseFloat(originalData.financial.tuition)) {
            financialChanges.tuition = currentData.financial.tuition;
        }
        if (compareValue(currentData.financial.paymentStatus, originalData.financial.paymentStatus)) {
            financialChanges.paymentStatus = currentData.financial.paymentStatus;
        }
        if (Object.keys(financialChanges).length > 0) {
            changedFields.financial = financialChanges;
        }

        return changedFields;
    }

    editForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        
        const submitButton = this.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Đang lưu...';

        try {
            const formData = new FormData(this);

            validateForm(formData);

            const updatedData = {
                personalInfo: {
                    name: formData.get('name')?.trim() || studentData.name,
                    email: formData.get('email')?.trim() || studentData.email,
                    dateOfBirth: document.getElementById('editStudentDateOfBirthHidden').value || null,
                    gender: formData.get('gender') || studentData.gender,
                    address: formData.get('address')?.trim() || null,
                    avatar: formData.get('avatar')?.trim() || null
                },
                academicInfo: {
                    courseId: formData.get('course') || null,
                    classId: formData.get('class') || null,
                    subjects: Array.from($(editStudentSubjects).select2('data')).map(s => s.text)
                },
                scores: {
                    average: parseFloat(editStudentAverageScore.value) || null,
                    grades: {}
                },
                financial: {
                    tuition: parseFloat(tuitionInput.dataset.originalValue) || 0,
                    paymentStatus: formData.get('payment_status') || 'Chưa thanh toán'
                }
            };

            const subjects = document.querySelectorAll('#subject-scores-container > div');
            subjects.forEach(subject => {
                const subjectName = subject.querySelector('.text-base').textContent;
                const processScore = subject.querySelector('input[name$="[process_score]"]')?.value;
                const midtermScore = subject.querySelector('input[name$="[midterm_score]"]')?.value;
                const finalScore = subject.querySelector('input[name$="[final_score]"]')?.value;

                if (subjectName) {
                    updatedData.scores.grades[subjectName] = {
                        process_score: processScore ? parseFloat(processScore) : null,
                        midterm_score: midtermScore ? parseFloat(midtermScore) : null,
                        final_score: finalScore ? parseFloat(finalScore) : null
                    };
                }
            });

            const response = await fetch(`/auth/update-information/${studentData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            const responseText = await response.text();
            
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.error('Server response:', responseText);
                throw new Error('Server returned invalid JSON');
            }

            if (!response.ok) {
                throw new Error(result.message || 'Cập nhật thất bại');
            }

            window.showNotification('Cập nhật thông tin sinh viên thành công', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1500);

        } catch (error) {
            console.error('Error submitting edit form:', error);
            window.showNotification(error.message || 'Có lỗi xảy ra khi cập nhật sinh viên', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-save mr-2"></i>Lưu thay đổi';
        }
    });

    window.showEditModal = async () => {
        try {
            editModal.classList.remove('hidden');
            editModal.classList.add('show');
            document.body.style.overflow = 'hidden';

            editForm.querySelector('input[name="name"]').value = studentData.name || '';
            editForm.querySelector('input[name="email"]').value = studentData.email || '';
            
            if (studentData.dateOfBirth) {
                const date = new Date(studentData.dateOfBirth);
                if (!isNaN(date.getTime())) {
                    $(editStudentDateOfBirthDisplay).datepicker('setDate', date);
                    editStudentDateOfBirthHidden.value = date.toISOString().split('T')[0];
                } else {
                    $(editStudentDateOfBirthDisplay).datepicker('setDate', null);
                    editStudentDateOfBirthHidden.value = '';
                }
            } else {
                $(editStudentDateOfBirthDisplay).datepicker('setDate', null);
                editStudentDateOfBirthHidden.value = '';
            }

            editForm.querySelector('select[name="gender"]').value = studentData.gender || '';
            editForm.querySelector('textarea[name="address"]').value = studentData.address || '';
            
            const avatarInput = editForm.querySelector('input[name="avatar"]');
            avatarInput.value = studentData.avatar || '';
            avatarInput.maxLength = 255;
            avatarInput.addEventListener('input', function() {
                if (this.value.length > 255) {
                    window.showNotification('URL ảnh đại diện không được vượt quá 255 ký tự', 'warning');
                    this.value = this.value.substring(0, 255);
                }
            });

            tuitionInput.value = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(studentData.tuition || 0);
            tuitionInput.dataset.originalValue = studentData.tuition || 0;

            editForm.querySelector('select[name="payment_status"]').value = studentData.payment_status || '';

            originalStudentData = JSON.parse(JSON.stringify(studentData));
            originalStudentData.academicInfo = originalStudentData.academicInfo || {};
            originalStudentData.scores = originalStudentData.scores || {};
            originalStudentData.scores.average = typeof originalStudentData.scores.average !== 'undefined' ? 
            originalStudentData.scores.average : null;
            originalStudentData.scores.grades = originalStudentData.scores.grades || {};
            originalStudentData.financial = originalStudentData.financial || {};
            originalStudentData.financial.tuition = typeof originalStudentData.financial.tuition !== 'undefined' ? 
            originalData.financial.tuition : 0;


            await loadCoursesAndPopulate();
            await renderSubjectScoreInputs(); 
        } catch (error) {
            console.error('Error showing edit modal:', error);
            window.showNotification('Có lỗi xảy ra khi mở form chỉnh sửa', 'error');
        }
    };

    window.closeEditModal = () => {
        editModal.classList.remove('show');
        editModal.classList.add('hidden');
        document.body.style.overflow = '';
        cachedGrades = null;
    };

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && editModal && editModal.classList.contains('show')) {
            closeEditModal();
        }
    });

    editModal.addEventListener('click', (event) => {
        if (event.target === editModal) {
            closeEditModal();
        }
    });

    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    if (!deleteConfirmModal) {
        console.error('Delete confirmation modal not found in DOM');
        return;
    }

    let studentIdToDelete = null;

    window.showDeleteConfirmModal = (id) => {
        studentIdToDelete = id;
        deleteConfirmModal.classList.remove('hidden');
        deleteConfirmModal.classList.add('show');
    };

    window.closeDeleteConfirmModal = () => {
        deleteConfirmModal.classList.remove('show');
        setTimeout(() => {
            deleteConfirmModal.classList.add('hidden');
            studentIdToDelete = null;
        }, 300);
    };

    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            if (studentIdToDelete) {
                try {
                    confirmDeleteBtn.disabled = true;
                    confirmDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Đang xóa...';

                    const response = await fetch(`/api/students/${studentIdToDelete}`, {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        window.showNotification('Xóa sinh viên thành công!', 'success');
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 2000);
                    } else {
                        const result = await response.json();
                        window.showNotification(result.message || 'Xóa sinh viên thất bại.', 'error');
                        console.error('Delete failed:', result);
                    }
                } catch (error) {
                    console.error('Error deleting student:', error);
                    window.showNotification('Đã xảy ra lỗi khi xóa sinh viên.', 'error');
                } finally {
                    confirmDeleteBtn.disabled = false;
                    confirmDeleteBtn.innerHTML = '<i class="fas fa-trash-alt mr-2"></i>Xóa';
                    closeDeleteConfirmModal();
                }
            }
        });
    }

    deleteConfirmModal.addEventListener('click', (event) => {
        if (event.target === deleteConfirmModal) {
            closeDeleteConfirmModal();
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const shouldEdit = urlParams.get('edit') === 'true';
    
    if (shouldEdit) {
        showEditModal();
    }

    $(editStudentSubjects).on('change', async function() {
        await renderSubjectScoreInputs();
    });

    editStudentClass.addEventListener('change', async function() {
        const classId = this.value;
        await loadSubjectsAndPopulate(classId);
    });
});
