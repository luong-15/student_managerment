document.addEventListener('DOMContentLoaded', function () {

    const formElements = {
        form: document.getElementById('addStudentForm'),
        courseSelect: document.getElementById('addStudentCourse'),
        classSelect: document.getElementById('addStudentClass'),
        subjectSelect: document.getElementById('addStudentSubject'),
        departmentInput: document.getElementById('addStudentDepartment'),
        instructorsInput: document.getElementById('addStudentInstructors'),
        subjectScoresList: document.getElementById('subjectScoresList'),
        averageScoreInput: document.getElementById('addStudentAverageScore'),
        tuitionInput: document.getElementById('addStudentTuition')
    };

    const criticalElements = [
        'courseSelect',
        'classSelect',
        'subjectSelect'
    ];

    const nonCriticalElements = [
        'departmentInput',
        'instructorsInput',
        'subjectScoresList',
        'averageScoreInput',
        'tuitionInput'
    ];

    const missingCritical = criticalElements.filter(elem => !formElements[elem]);
    if (missingCritical.length > 0) {
        console.error('Missing critical form elements:', missingCritical);
        return;
    }

    const missingNonCritical = nonCriticalElements.filter(elem => !formElements[elem]);
    if (missingNonCritical.length > 0) {
        console.warn('Missing non-critical form elements:', missingNonCritical);
    }

    if (formElements.subjectSelect) {
        $(formElements.subjectSelect).select2({
            placeholder: 'Chọn môn học',
            allowClear: true,
            multiple: true,
            width: '100%',
            dropdownParent: $('#addStudentModalContainer'),
            selectOnClose: true,
            closeOnSelect: false
        });
    }

    async function loadCourses() {
        try {
            showLoading(formElements.courseSelect);
            const response = await fetch('/api/courses');
            if (!response.ok) throw new Error('Failed to fetch courses');

            const courses = await response.json();
            populateCourseSelect(courses);
            hideLoading(formElements.courseSelect);
        } catch (error) {
            console.error('Error loading courses:', error);
            showNotification('Không thể tải danh sách khóa học', 'error');
            hideLoading(formElements.courseSelect);
        }
    }

    async function loadClasses(courseId) {
        try {
            showLoading(formElements.classSelect);
            const response = await fetch(`/api/classes?courseId=${courseId}`);
            if (!response.ok) throw new Error('Failed to fetch classes');

            const classes = await response.json();
            populateClassSelect(classes);
            hideLoading(formElements.classSelect);
        } catch (error) {
            console.error('Error loading classes:', error);
            showNotification('Không thể tải danh sách lớp', 'error');
            hideLoading(formElements.classSelect);
        }
    }

    async function loadSubjects(classId) {
        try {
            showLoading(formElements.subjectSelect);
            const response = await fetch(`/api/subjects?classId=${classId}`);
            if (!response.ok) throw new Error('Failed to fetch subjects');

            const subjects = await response.json();
            populateSubjectSelect(subjects);
            hideLoading(formElements.subjectSelect);
        } catch (error) {
            console.error('Error loading subjects:', error);
            showNotification('Không thể tải danh sách môn học', 'error');
            hideLoading(formElements.subjectSelect);
        }
    }

    async function loadSubjectDetails(subjectIds) {
        try {
            if (!formElements.subjectSelect || !formElements.departmentInput || !formElements.instructorsInput) {
                console.error('Required form elements for subject details not found');
                return;
            }

            showLoading(formElements.subjectSelect);
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

            if (formElements.departmentInput) {
                formElements.departmentInput.value = Array.from(departments).join(', ');
            }
            if (formElements.instructorsInput) {
                formElements.instructorsInput.value = Array.from(instructors).join(', ');
            }

            hideLoading(formElements.subjectSelect);
        } catch (error) {
            console.error('Error loading subject details:', error);
            showNotification('Không thể tải thông tin chi tiết môn học', 'error');
            if (formElements.subjectSelect) hideLoading(formElements.subjectSelect);
        }
    }

    function populateCourseSelect(courses) {
        formElements.courseSelect.innerHTML = '<option value="">Chọn khóa học</option>';
        courses.forEach(course => {
            const option = new Option(`Khóa ${course.name}`, course.id);
            formElements.courseSelect.add(option);
        });
        formElements.courseSelect.disabled = false;
    }

    function populateClassSelect(classes) {
        formElements.classSelect.innerHTML = '<option value="">Chọn lớp</option>';
        classes.forEach(cls => {
            const option = new Option(cls.name, cls.id);
            formElements.classSelect.add(option);
        });
        formElements.classSelect.disabled = false;
    }

    function populateSubjectSelect(subjects) {
        $(formElements.subjectSelect).empty();

        subjects.forEach(subject => {
            const option = new Option(subject.name, subject.id, true, true);
            formElements.subjectSelect.add(option);
        });

        formElements.subjectSelect.disabled = false;
        $(formElements.subjectSelect).trigger('change');
    }

    formElements.courseSelect.addEventListener('change', async function () {
        const courseId = this.value;
        resetDependentFields('course');

        if (courseId) {
            await loadClasses(courseId);
        }
    });

    formElements.classSelect.addEventListener('change', async function () {
        const classId = this.value;
        resetDependentFields('class');

        if (classId) {
            await loadSubjects(classId);
            if (formElements.subjectSelect) {
                const options = $(formElements.subjectSelect).find('option');
                options.prop('selected', true);
                $(formElements.subjectSelect).trigger('change');
            }
        }
    });

    $(formElements.subjectSelect).on('change', function () {
        const selectedSubjects = $(this).val();
        updateSubjectScoresList();
        if (selectedSubjects?.length > 0) {
            loadSubjectDetails(selectedSubjects);
        } else {
            formElements.departmentInput.value = '';
            formElements.instructorsInput.value = '';
            formElements.averageScoreInput.value = '';
        }
    });

    function resetDependentFields(level) {
        if (level === 'course') {
            if (formElements.classSelect) {
                formElements.classSelect.innerHTML = '<option value="">Chọn lớp</option>';
                formElements.classSelect.disabled = true;
            }

            if (formElements.subjectSelect) {
                $(formElements.subjectSelect).empty();
                $(formElements.subjectSelect).val(null).trigger('change');
                formElements.subjectSelect.disabled = true;
            }

            if (formElements.departmentInput) formElements.departmentInput.value = '';
            if (formElements.instructorsInput) formElements.instructorsInput.value = '';
            if (formElements.averageScoreInput) formElements.averageScoreInput.value = '';
            updateSubjectScoresUI([]);
        } else if (level === 'class') {
            if (formElements.subjectSelect) {
                $(formElements.subjectSelect).empty();
                $(formElements.subjectSelect).val(null).trigger('change');
                formElements.subjectSelect.disabled = true;
            }

            if (formElements.departmentInput) formElements.departmentInput.value = '';
            if (formElements.instructorsInput) formElements.instructorsInput.value = '';
            if (formElements.averageScoreInput) formElements.averageScoreInput.value = '';
            updateSubjectScoresUI([]);
        }
    }

    function updateSubjectScoresUI(selectedSubjects) {
        if (!formElements.subjectScoresList) return;

        formElements.subjectScoresList.innerHTML = '';

        if (!selectedSubjects || selectedSubjects.length === 0) {
            formElements.subjectScoresList.innerHTML = `
            <p class="text-gray-500 italic text-sm text-center" id="noSubjectsMessage">
                Chưa có môn học nào được chọn
            </p>`;
            return;
        }

        selectedSubjects.forEach(subject => {
            const scoreItem = createScoreItem(subject.id, subject.text);
            formElements.subjectScoresList.appendChild(scoreItem);
        });

        calculateAverageScore();
    }

    function createScoreItem(subjectId, subjectName) {
        const div = document.createElement('div');
        div.className = 'bg-gray-50 p-4 rounded-lg border border-gray-200';
        div.innerHTML = `
            <div class="flex flex-col gap-3">
                <div class="font-medium text-gray-700">${subjectName}</div>
                <div class="grid grid-cols-3 gap-4">
                    <div class="relative">
                        <input type="number" 
                            name="scores[${subjectId}][process_score]"
                            class="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            step="0.1" 
                            min="0" 
                            max="10"
                            placeholder="Điểm QT"
                            oninput="validateScore(this)"
                            onblur="formatScore(this)">
                        <span class="absolute -top-5 left-0 text-xs text-gray-500">Quá trình</span>
                    </div>
                    <div class="relative">
                        <input type="number" 
                            name="scores[${subjectId}][midterm_score]"
                            class="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            step="0.1" 
                            min="0" 
                            max="10"
                            placeholder="Điểm GK"
                            oninput="validateScore(this)"
                            onblur="formatScore(this)">
                        <span class="absolute -top-5 left-0 text-xs text-gray-500">Giữa kỳ</span>
                    </div>
                    <div class="relative">
                        <input type="number" 
                            name="scores[${subjectId}][final_score]"
                            class="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            step="0.1" 
                            min="0" 
                            max="10"
                            placeholder="Điểm CK"
                            oninput="validateScore(this)"
                            onblur="formatScore(this)">
                        <span class="absolute -top-5 left-0 text-xs text-gray-500">Cuối kỳ</span>
                    </div>
                </div>
            </div>
        `;
        return div;
    }

    async function showAddModal() {
        const addStudentModalContainer = document.getElementById('addStudentModalContainer');
        if (addStudentModalContainer) {
            addStudentModalContainer.classList.remove('hidden');
            document.body.style.overflow = 'hidden';

            const addStudentForm = document.getElementById('addStudentForm');
            if (addStudentForm) {
                addStudentForm.reset();
            }
            resetDependentFields('course');

            await loadCourses();
            updateSubjectScoresList();

            if (formElements.subjectSelect) $(formElements.subjectSelect).val(null).trigger('change');
        }
    }

    function closeAddModal() {
        const addStudentModalContainer = document.getElementById('addStudentModalContainer');
        if (addStudentModalContainer) {
            addStudentModalContainer.classList.add('hidden');
            document.body.style.overflow = '';

            if (formElements.courseSelect) formElements.courseSelect.innerHTML = '<option value="">Chọn khóa học</option>';
            if (formElements.classSelect) {
                formElements.classSelect.innerHTML = '<option value="">Chọn lớp</option>';
                formElements.classSelect.disabled = true;
            }
            if (formElements.subjectSelect) {
                $(formElements.subjectSelect).empty().val(null).trigger('change');
                formElements.subjectSelect.disabled = true;
            }
            if (formElements.departmentInput) formElements.departmentInput.value = '';
            if (formElements.instructorsInput) formElements.instructorsInput.value = '';
            if (formElements.averageScoreInput) formElements.averageScoreInput.value = '';
            if (formElements.tuitionInput) {
                formElements.tuitionInput.value = '';
                formElements.tuitionInput.dataset.originalValue = '';
            }
            if (formElements.subjectScoresList) formElements.subjectScoresList.innerHTML = `<p class="text-gray-500 italic text-sm text-center">Chưa có môn học nào được chọn</p>`;
        }
    }

    window.showAddModal = showAddModal;
    window.closeAddModal = closeAddModal;

    function updateSubjectScoresList() {
        const subjectScoresList = formElements.subjectScoresList;
        const selectedSubjects = $(formElements.subjectSelect).select2('data');

        if (!subjectScoresList) return;

        subjectScoresList.innerHTML = '';

        if (selectedSubjects.length === 0) {
            subjectScoresList.innerHTML = `
            <p class="text-gray-500 italic text-sm text-center" id="noSubjectsMessage">
                Chưa có môn học nào được chọn
            </p>`;
            calculateAverageScore();
            return;
        }

        selectedSubjects.forEach(subject => {
            const scoreRow = document.createElement('div');
            scoreRow.className = 'bg-gray-50 p-4 rounded-lg border border-gray-200';
            scoreRow.innerHTML = `
            <div class="flex flex-col gap-3">
                <div class="font-medium text-gray-700">${subject.text}</div>
                <div class="grid grid-cols-3 gap-4">
                    <div class="relative">
                        <input type="number" 
                            name="scores[${subject.id}][process_score]"
                            class="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            step="0.1" 
                            min="0" 
                            max="10"
                            placeholder="Điểm QT"
                            oninput="validateScore(this)"
                            onblur="formatScore(this)">
                        <span class="absolute -top-5 left-0 text-xs text-gray-500">Quá trình</span>
                    </div>
                    <div class="relative">
                        <input type="number" 
                            name="scores[${subject.id}][midterm_score]"
                            class="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            step="0.1" 
                            min="0" 
                            max="10"
                            placeholder="Điểm GK"
                            oninput="validateScore(this)"
                            onblur="formatScore(this)">
                        <span class="absolute -top-5 left-0 text-xs text-gray-500">Giữa kỳ</span>
                    </div>
                    <div class="relative">
                        <input type="number" 
                            name="scores[${subject.id}][final_score]"
                            class="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            step="0.1" 
                            min="0" 
                            max="10"
                            placeholder="Điểm CK"
                            oninput="validateScore(this)"
                            onblur="formatScore(this)">
                        <span class="absolute -top-5 left-0 text-xs text-gray-500">Cuối kỳ</span>
                    </div>
                </div>
            </div>
            `;
            subjectScoresList.appendChild(scoreRow);
        });
        initializeScoreInputs();
        calculateAverageScore();
    }

    function calculateAverageScore() {
        if (!formElements.averageScoreInput) {
            console.warn('Average score input not found');
            return;
        }

        const subjectRows = document.querySelectorAll('#subjectScoresList > div');
        let totalWeightedScore = 0;
        let validSubjects = 0;

        subjectRows.forEach(row => {
            const inputs = {
                process: row.querySelector('input[name$="[process_score]"]'),
                midterm: row.querySelector('input[name$="[midterm_score]"]'),
                final: row.querySelector('input[name$="[final_score]"]')
            };

            const scores = {
                process: parseFloat(inputs.process?.value || '0'),
                midterm: parseFloat(inputs.midterm?.value || '0'),
                final: parseFloat(inputs.final?.value || '0')
            };

            if (!isNaN(scores.process) || !isNaN(scores.midterm) || !isNaN(scores.final)) {
                const weightedScore = (scores.process * 0.3) + (scores.midterm * 0.2) + (scores.final * 0.5);
                totalWeightedScore += weightedScore;
                validSubjects++;
            }
        });

        if (validSubjects > 0) {
            const averageScore = totalWeightedScore / validSubjects;

            formElements.averageScoreInput.value = averageScore.toFixed(1);

            const baseClasses = 'mt-1 block w-full p-2 border rounded-md shadow-sm font-medium';
            const colorClass = getScoreColorClass(averageScore);
            formElements.averageScoreInput.className = `${baseClasses} ${colorClass}`;

            formElements.averageScoreInput.title = `Điểm trung bình = (QTx0.3 + GKx0.2 + CKx0.5)\nTổng điểm: ${totalWeightedScore.toFixed(1)}\nSố môn học: ${validSubjects}`;

        } else {
            formElements.averageScoreInput.value = '';
            formElements.averageScoreInput.className = 'mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-50';
            formElements.averageScoreInput.title = 'Chưa có điểm để tính trung bình';
        }
    }

    function getScoreColorClass(score) {
        if (score >= 8.0) return 'text-green-600 border-green-200';
        if (score >= 6.5) return 'text-blue-600 border-blue-200';
        if (score >= 5.0) return 'text-yellow-600 border-yellow-200';
        return 'text-red-600 border-red-200';
    }

    function validateScore(input) {
        let value = parseFloat(input.value);
        if (isNaN(value)) {
            input.value = '';
            input.classList.remove('text-green-600', 'text-blue-600', 'text-yellow-600', 'text-red-600');
            calculateAverageScore();
            return;
        }

        value = Math.max(0, Math.min(10, value));
        input.value = value.toFixed(1);

        const colorClass = getScoreColorClass(value).split(' ')[0];
        input.classList.remove('text-green-600', 'text-blue-600', 'text-yellow-600', 'text-red-600');
        input.classList.add(colorClass);

        calculateAverageScore();
    }

    function initializeScoreInputs() {
        const scoreInputs = document.querySelectorAll('#subjectScoresList input[name^="scores["][name$="_score]"]');
        scoreInputs.forEach(input => {
            input.addEventListener('input', () => {
                validateScore(input);
            });
            input.addEventListener('blur', () => {
                const value = parseFloat(input.value);
                if (!isNaN(value)) {
                    input.value = value.toFixed(1);
                }
                calculateAverageScore();
            });
        });
    }

    function showLoading(element) {
        if (!element) return;
        element.disabled = true;
        element.classList.add('opacity-50', 'cursor-not-allowed');

        if (!element.parentElement.querySelector('.loading-spinner')) {
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner absolute right-2 top-1/2 -translate-y-1/2';
            spinner.innerHTML = `
                <svg class="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            `;
            element.parentElement.classList.add('relative');
            element.parentElement.appendChild(spinner);
        }
    }

    function hideLoading(element) {
        if (!element) return;
        element.disabled = false;
        element.classList.remove('opacity-50', 'cursor-not-allowed');

        const spinner = element.parentElement.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }
    }

    const style = document.createElement('style');
    style.textContent = `
        .loading-spinner {
            pointer-events: none; /* Prevent interaction with spinner */
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .animate-spin {
            animation: spin 1s linear infinite;
        }
    `;
    document.head.appendChild(style);

    async function submitForm(formData) {
        try {
            const studentData = {
                personalInfo: {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    dateOfBirth: formData.get('dateOfBirth'),
                    gender: formData.get('gender'),
                    address: formData.get('address'),
                    avatar: formData.get('avatar') || 'https://placehold.co/100x100'
                },
                academicInfo: {
                    courseId: formData.get('course'),
                    classId: formData.get('class'),
                    subjects: $(formElements.subjectSelect).val() || [],
                    department: formData.get('department')
                },
                scores: {
                    average: parseFloat(formElements.averageScoreInput.value) || null,
                    subjectScores: {}
                },
                financial: {
                    tuition: parseFloat(formElements.tuitionInput?.dataset.originalValue || String(formData.get('tuition')).replace(/[^0-9.]/g, '')) || 0,
                    paymentStatus: formData.get('paymentStatus')
                }
            };

            const maxTuitionAmount = 2000000000;
            if (studentData.financial.tuition > maxTuitionAmount) {
                throw new Error(`Học phí không được vượt quá ${new Intl.NumberFormat('vi-VN').format(maxTuitionAmount)} VND.`);
            }

            formElements.subjectScoresList.querySelectorAll('input[name^="scores["]').forEach(input => {
                const nameParts = input.name.match(/\[(.*?)\]\[(.*?)\]/);
                if (nameParts && nameParts.length === 3) {
                    const subjectId = nameParts[1];
                    const scoreType = nameParts[2];
                    const score = parseFloat(input.value);

                    if (!studentData.scores.subjectScores[subjectId]) {
                        studentData.scores.subjectScores[subjectId] = {};
                    }
                    if (!isNaN(score)) {
                        studentData.scores.subjectScores[subjectId][scoreType] = score;
                    }
                }
            });

            const response = await fetch('/auth/create-students', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(studentData)
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server responded with non-JSON content');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error submitting form');
            }

            return data;
        } catch (error) {
            console.error('Form submission error:', error);
            throw error;
        }
    }

    if (formElements.form) {
        formElements.form.addEventListener('submit', async (e) => {
            e.preventDefault();

            try {
                const formData = new FormData(formElements.form);
                const data = await submitForm(formData);

                if (data.success) {
                    showNotification('Thêm sinh viên thành công', 'success');
                    closeAddModal();
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    throw new Error(data.message || 'Failed to add student');
                }
            } catch (error) {
                showNotification(`Lỗi: ${error.message}`, 'error');
            }
        });
    } else {
        console.error('Form element not found');
    }
});
