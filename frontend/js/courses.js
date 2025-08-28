// Courses Module
class Courses {
    constructor() {
        this.courses = [];
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Course form submission
        document.getElementById('courseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCourse();
        });
    }

    async loadCourses() {
        try {
            const data = await window.auth.apiCall('/api/courses');
            
            if (data.success) {
                this.courses = data.data;
                this.renderCourses();
            } else {
                window.auth.showMessage('Failed to load courses', 'error');
            }
        } catch (error) {
            console.error('Error loading courses:', error);
            window.auth.showMessage('Error loading courses', 'error');
        }
    }

    renderCourses() {
        const tableBody = document.getElementById('coursesTable');
        
        if (!this.courses || this.courses.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        No courses found
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.courses.map(course => `
            <tr>
                <td>${course.id}</td>
                <td>
                    <div style="font-weight: 600; color: #3498db;">
                        ${course.code}
                    </div>
                </td>
                <td>${course.title}</td>
                <td>
                    <span style="background-color: #e8f5e8; color: #27ae60; padding: 4px 8px; border-radius: 4px; font-weight: 500;">
                        ${course.credits} credits
                    </span>
                </td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <a href="#" class="action-link" onclick="window.coursesModule.editCourse(${course.id})">
                            Edit
                        </a>
                        <a href="#" class="action-link" style="color: #e74c3c;" onclick="window.coursesModule.showDeleteConfirmation(${course.id})">
                            Delete
                        </a>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    showAddCourseModal() {
        document.getElementById('courseModalTitle').textContent = 'Add Course';
        document.getElementById('courseForm').reset();
        document.getElementById('courseId').value = '';
        document.getElementById('courseModal').classList.add('show');
    }

    async editCourse(courseId) {
        try {
            const data = await window.auth.apiCall(`/api/courses/${courseId}`);
            
            if (data.success) {
                const course = data.data;
                document.getElementById('courseModalTitle').textContent = 'Edit Course';
                document.getElementById('courseId').value = course.id;
                document.getElementById('courseCode').value = course.code;
                document.getElementById('courseTitle').value = course.title;
                document.getElementById('courseCredits').value = course.credits;
                document.getElementById('courseModal').classList.add('show');
            } else {
                window.auth.showMessage('Failed to load course data', 'error');
            }
        } catch (error) {
            console.error('Error loading course:', error);
            window.auth.showMessage('Error loading course data', 'error');
        }
    }

    async saveCourse() {
        const courseId = document.getElementById('courseId').value;
        const courseData = {
            code: document.getElementById('courseCode').value,
            title: document.getElementById('courseTitle').value,
            credits: parseInt(document.getElementById('courseCredits').value)
        };

        try {
            let data;
            if (courseId) {
                // Update existing course
                data = await window.auth.apiCall(`/api/courses/${courseId}`, {
                    method: 'PUT',
                    body: JSON.stringify(courseData)
                });
            } else {
                // Create new course
                data = await window.auth.apiCall('/api/courses', {
                    method: 'POST',
                    body: JSON.stringify(courseData)
                });
            }

            if (data.success) {
                window.auth.showMessage(
                    courseId ? 'Course updated successfully!' : 'Course created successfully!',
                    'success'
                );
                closeModal('courseModal');
                this.loadCourses();
                
                // Refresh dashboard if it's visible
                if (window.dashboardModule) {
                    window.dashboardModule.refresh();
                }
            } else {
                window.auth.showMessage(data.message || 'Failed to save course', 'error');
            }
        } catch (error) {
            console.error('Error saving course:', error);
            window.auth.showMessage('Error saving course', 'error');
        }
    }

    showDeleteConfirmation(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (course) {
            document.getElementById('deleteMessage').textContent = 
                `Are you sure you want to delete course "${course.code} - ${course.title}"? This action cannot be undone.`;
            document.getElementById('confirmDeleteBtn').setAttribute('data-course-id', courseId);
            document.getElementById('deleteModal').classList.add('show');
        }
    }

    async deleteCourse() {
        const courseId = document.getElementById('confirmDeleteBtn').getAttribute('data-course-id');
        
        try {
            const data = await window.auth.apiCall(`/api/courses/${courseId}`, {
                method: 'DELETE'
            });

            if (data.success) {
                window.auth.showMessage('Course deleted successfully!', 'success');
                closeModal('deleteModal');
                this.loadCourses();
                
                // Refresh dashboard if it's visible
                if (window.dashboardModule) {
                    window.dashboardModule.refresh();
                }
            } else {
                window.auth.showMessage(data.message || 'Failed to delete course', 'error');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            window.auth.showMessage('Error deleting course', 'error');
        }
    }

    // Method to get all courses for enrollment form
    async getAllCourses() {
        try {
            const data = await window.auth.apiCall('/api/courses');
            return data.success ? data.data : [];
        } catch (error) {
            console.error('Error loading courses for enrollment:', error);
            return [];
        }
    }
}

// Global functions for HTML onclick handlers
function showAddCourseModal() {
    if (window.coursesModule) {
        window.coursesModule.showAddCourseModal();
    }
}

// Initialize courses module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.coursesModule = new Courses();
});
