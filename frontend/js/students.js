// Students Module
class Students {
    constructor() {
        this.students = [];
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Student form submission
        document.getElementById('studentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveStudent();
        });

        // Delete confirmation
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            this.deleteStudent();
        });
    }

    async loadStudents() {
        try {
            const data = await window.auth.apiCall('/api/students');
            
            if (data.success) {
                this.students = data.data;
                this.renderStudents();
            } else {
                window.auth.showMessage('Failed to load students', 'error');
            }
        } catch (error) {
            console.error('Error loading students:', error);
            window.auth.showMessage('Error loading students', 'error');
        }
    }

    renderStudents() {
        const tableBody = document.getElementById('studentsTable');
        
        if (!this.students || this.students.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        No students found
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.students.map(student => `
            <tr>
                <td>${student.id}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="avatar">
                            ${student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style="font-weight: 500; color: #2c3e50;">
                                ${student.name}
                            </div>
                            <div style="font-size: 12px; color: #7f8c8d;">
                                ${student.email || 'No email'}
                            </div>
                        </div>
                    </div>
                </td>
                <td>${student.age}</td>
                <td>${student.class}</td>
                <td>${student.email || '-'}</td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <a href="#" class="action-link" onclick="window.studentsModule.editStudent(${student.id})">
                            Edit
                        </a>
                        <a href="#" class="action-link" style="color: #e74c3c;" onclick="window.studentsModule.showDeleteConfirmation(${student.id})">
                            Delete
                        </a>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    showAddStudentModal() {
        document.getElementById('studentModalTitle').textContent = 'Add Student';
        document.getElementById('studentForm').reset();
        document.getElementById('studentId').value = '';
        document.getElementById('studentModal').classList.add('show');
    }

    async editStudent(studentId) {
        try {
            const data = await window.auth.apiCall(`/api/students/${studentId}`);
            
            if (data.success) {
                const student = data.data;
                document.getElementById('studentModalTitle').textContent = 'Edit Student';
                document.getElementById('studentId').value = student.id;
                document.getElementById('studentName').value = student.name;
                document.getElementById('studentAge').value = student.age;
                document.getElementById('studentClass').value = student.class;
                document.getElementById('studentEmail').value = student.email || '';
                document.getElementById('studentModal').classList.add('show');
            } else {
                window.auth.showMessage('Failed to load student data', 'error');
            }
        } catch (error) {
            console.error('Error loading student:', error);
            window.auth.showMessage('Error loading student data', 'error');
        }
    }

    async saveStudent() {
        const studentId = document.getElementById('studentId').value;
        const studentData = {
            name: document.getElementById('studentName').value,
            age: parseInt(document.getElementById('studentAge').value),
            class: document.getElementById('studentClass').value,
            email: document.getElementById('studentEmail').value || null
        };

        try {
            let data;
            if (studentId) {
                // Update existing student
                data = await window.auth.apiCall(`/api/students/${studentId}`, {
                    method: 'PUT',
                    body: JSON.stringify(studentData)
                });
            } else {
                // Create new student
                data = await window.auth.apiCall('/api/students', {
                    method: 'POST',
                    body: JSON.stringify(studentData)
                });
            }

            if (data.success) {
                window.auth.showMessage(
                    studentId ? 'Student updated successfully!' : 'Student created successfully!',
                    'success'
                );
                closeModal('studentModal');
                this.loadStudents();
                
                // Refresh dashboard if it's visible
                if (window.dashboardModule) {
                    window.dashboardModule.refresh();
                }
            } else {
                window.auth.showMessage(data.message || 'Failed to save student', 'error');
            }
        } catch (error) {
            console.error('Error saving student:', error);
            window.auth.showMessage('Error saving student', 'error');
        }
    }

    showDeleteConfirmation(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (student) {
            document.getElementById('deleteMessage').textContent = 
                `Are you sure you want to delete student "${student.name}"? This action cannot be undone.`;
            document.getElementById('confirmDeleteBtn').setAttribute('data-student-id', studentId);
            document.getElementById('deleteModal').classList.add('show');
        }
    }

    async deleteStudent() {
        const studentId = document.getElementById('confirmDeleteBtn').getAttribute('data-student-id');
        
        try {
            const data = await window.auth.apiCall(`/api/students/${studentId}`, {
                method: 'DELETE'
            });

            if (data.success) {
                window.auth.showMessage('Student deleted successfully!', 'success');
                closeModal('deleteModal');
                this.loadStudents();
                
                // Refresh dashboard if it's visible
                if (window.dashboardModule) {
                    window.dashboardModule.refresh();
                }
            } else {
                window.auth.showMessage(data.message || 'Failed to delete student', 'error');
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            window.auth.showMessage('Error deleting student', 'error');
        }
    }
}

// Global functions for HTML onclick handlers
function showAddStudentModal() {
    if (window.studentsModule) {
        window.studentsModule.showAddStudentModal();
    }
}

// Initialize students module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.studentsModule = new Students();
});
