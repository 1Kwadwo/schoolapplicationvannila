// Enrollments Module
class Enrollments {
    constructor() {
        this.enrollments = [];
        this.students = [];
        this.courses = [];
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Enrollment form submission
        document.getElementById('enrollmentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEnrollment();
        });
    }

    async loadEnrollments() {
        try {
            const data = await window.auth.apiCall('/api/enrollments');
            
            if (data.success) {
                this.enrollments = data.data;
                this.renderEnrollments();
            } else {
                window.auth.showMessage('Failed to load enrollments', 'error');
            }
        } catch (error) {
            console.error('Error loading enrollments:', error);
            window.auth.showMessage('Error loading enrollments', 'error');
        }
    }

    renderEnrollments() {
        const tableBody = document.getElementById('enrollmentsTable');
        
        if (!this.enrollments || this.enrollments.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        No enrollments found
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.enrollments.map(enrollment => {
            const enrollmentDate = new Date(enrollment.enrollment_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            return `
                <tr>
                    <td>${enrollment.id}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div class="avatar">
                                ${enrollment.student_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style="font-weight: 500; color: #2c3e50;">
                                    ${enrollment.student_name}
                                </div>
                                <div style="font-size: 12px; color: #7f8c8d;">
                                    ${enrollment.student_email}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div>
                            <div style="font-weight: 600; color: #3498db;">
                                ${enrollment.course_code}
                            </div>
                            <div style="font-size: 12px; color: #7f8c8d;">
                                ${enrollment.course_title}
                            </div>
                        </div>
                    </td>
                    <td>${enrollmentDate}</td>
                    <td>
                        <div style="display: flex; gap: 8px;">
                            <a href="#" class="action-link" onclick="window.enrollmentsModule.editEnrollment(${enrollment.id})">
                                Edit
                            </a>
                            <a href="#" class="action-link" style="color: #e74c3c;" onclick="window.enrollmentsModule.showDeleteConfirmation(${enrollment.id})">
                                Delete
                            </a>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async showAddEnrollmentModal() {
        try {
            // Load students and courses for the form
            const [studentsData, coursesData] = await Promise.all([
                window.auth.apiCall('/api/students'),
                window.auth.apiCall('/api/courses')
            ]);

            if (studentsData.success && coursesData.success) {
                this.students = studentsData.data;
                this.courses = coursesData.data;
                
                this.populateEnrollmentForm();
                document.getElementById('enrollmentModalTitle').textContent = 'Add Enrollment';
                document.getElementById('enrollmentForm').reset();
                document.getElementById('enrollmentId').value = '';
                document.getElementById('enrollmentModal').classList.add('show');
            } else {
                window.auth.showMessage('Failed to load form data', 'error');
            }
        } catch (error) {
            console.error('Error loading enrollment form data:', error);
            window.auth.showMessage('Error loading form data', 'error');
        }
    }

    populateEnrollmentForm() {
        // Populate student dropdown
        const studentSelect = document.getElementById('enrollmentStudent');
        studentSelect.innerHTML = '<option value="">Select Student</option>';
        this.students.forEach(student => {
            studentSelect.innerHTML += `<option value="${student.id}">${student.name} (${student.email || 'No email'})</option>`;
        });

        // Populate course dropdown
        const courseSelect = document.getElementById('enrollmentCourse');
        courseSelect.innerHTML = '<option value="">Select Course</option>';
        this.courses.forEach(course => {
            courseSelect.innerHTML += `<option value="${course.id}">${course.code} - ${course.title}</option>`;
        });
    }

    async editEnrollment(enrollmentId) {
        try {
            const data = await window.auth.apiCall(`/api/enrollments/${enrollmentId}`);
            
            if (data.success) {
                const enrollment = data.data;
                
                // Load students and courses for the form
                const [studentsData, coursesData] = await Promise.all([
                    window.auth.apiCall('/api/students'),
                    window.auth.apiCall('/api/courses')
                ]);

                if (studentsData.success && coursesData.success) {
                    this.students = studentsData.data;
                    this.courses = coursesData.data;
                    
                    this.populateEnrollmentForm();
                    
                    document.getElementById('enrollmentModalTitle').textContent = 'Edit Enrollment';
                    document.getElementById('enrollmentId').value = enrollment.id;
                    document.getElementById('enrollmentStudent').value = enrollment.student_id;
                    document.getElementById('enrollmentCourse').value = enrollment.course_id;
                    document.getElementById('enrollmentModal').classList.add('show');
                } else {
                    window.auth.showMessage('Failed to load form data', 'error');
                }
            } else {
                window.auth.showMessage('Failed to load enrollment data', 'error');
            }
        } catch (error) {
            console.error('Error loading enrollment:', error);
            window.auth.showMessage('Error loading enrollment data', 'error');
        }
    }

    async saveEnrollment() {
        const enrollmentId = document.getElementById('enrollmentId').value;
        const enrollmentData = {
            student_id: parseInt(document.getElementById('enrollmentStudent').value),
            course_id: parseInt(document.getElementById('enrollmentCourse').value)
        };

        try {
            let data;
            if (enrollmentId) {
                // Update existing enrollment
                data = await window.auth.apiCall(`/api/enrollments/${enrollmentId}`, {
                    method: 'PUT',
                    body: JSON.stringify(enrollmentData)
                });
            } else {
                // Create new enrollment
                data = await window.auth.apiCall('/api/enrollments', {
                    method: 'POST',
                    body: JSON.stringify(enrollmentData)
                });
            }

            if (data.success) {
                window.auth.showMessage(
                    enrollmentId ? 'Enrollment updated successfully!' : 'Enrollment created successfully!',
                    'success'
                );
                closeModal('enrollmentModal');
                this.loadEnrollments();
                
                // Refresh dashboard if it's visible
                if (window.dashboardModule) {
                    window.dashboardModule.refresh();
                }
            } else {
                window.auth.showMessage(data.message || 'Failed to save enrollment', 'error');
            }
        } catch (error) {
            console.error('Error saving enrollment:', error);
            window.auth.showMessage('Error saving enrollment', 'error');
        }
    }

    showDeleteConfirmation(enrollmentId) {
        const enrollment = this.enrollments.find(e => e.id === enrollmentId);
        if (enrollment) {
            document.getElementById('deleteMessage').textContent = 
                `Are you sure you want to delete the enrollment for "${enrollment.student_name}" in "${enrollment.course_code}"? This action cannot be undone.`;
            document.getElementById('confirmDeleteBtn').setAttribute('data-enrollment-id', enrollmentId);
            document.getElementById('deleteModal').classList.add('show');
        }
    }

    async deleteEnrollment() {
        const enrollmentId = document.getElementById('confirmDeleteBtn').getAttribute('data-enrollment-id');
        
        try {
            const data = await window.auth.apiCall(`/api/enrollments/${enrollmentId}`, {
                method: 'DELETE'
            });

            if (data.success) {
                window.auth.showMessage('Enrollment deleted successfully!', 'success');
                closeModal('deleteModal');
                this.loadEnrollments();
                
                // Refresh dashboard if it's visible
                if (window.dashboardModule) {
                    window.dashboardModule.refresh();
                }
            } else {
                window.auth.showMessage(data.message || 'Failed to delete enrollment', 'error');
            }
        } catch (error) {
            console.error('Error deleting enrollment:', error);
            window.auth.showMessage('Error deleting enrollment', 'error');
        }
    }
}

// Global functions for HTML onclick handlers
function showAddEnrollmentModal() {
    if (window.enrollmentsModule) {
        window.enrollmentsModule.showAddEnrollmentModal();
    }
}

// Initialize enrollments module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.enrollmentsModule = new Enrollments();
});
