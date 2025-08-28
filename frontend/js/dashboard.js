// Dashboard Module
class Dashboard {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Bind any dashboard-specific events here
    }

    async loadDashboard() {
        try {
            const data = await window.auth.apiCall('/api/dashboard/stats');
            
            if (data.success) {
                this.updateStatistics(data.data);
                this.updateRecentEnrollments(data.data.recentEnrollments);
            } else {
                window.auth.showMessage('Failed to load dashboard data', 'error');
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            window.auth.showMessage('Error loading dashboard data', 'error');
        }
    }

    updateStatistics(stats) {
        // Update statistics cards
        document.getElementById('totalStudents').textContent = stats.students || 0;
        document.getElementById('totalCourses').textContent = stats.courses || 0;
        document.getElementById('totalEnrollments').textContent = stats.enrollments || 0;
        
        // Calculate active students (students with enrollments)
        // For now, we'll show the same as total students
        // In a real app, you'd calculate this from the backend
        document.getElementById('activeStudents').textContent = stats.students || 0;
    }

    updateRecentEnrollments(enrollments) {
        const tableBody = document.getElementById('recentEnrollmentsTable');
        
        if (!enrollments || enrollments.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">
                        No recent enrollments found
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = enrollments.map(enrollment => {
            const enrollmentDate = new Date(enrollment.enrollment_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            return `
                <tr>
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
                            <div style="font-weight: 500; color: #2c3e50;">
                                ${enrollment.course_code}
                            </div>
                            <div style="font-size: 12px; color: #7f8c8d;">
                                ${enrollment.course_title}
                            </div>
                        </div>
                    </td>
                    <td>${enrollmentDate}</td>
                    <td>
                        <a href="#" class="action-link" onclick="showPage('enrollments')">
                            View
                        </a>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Method to refresh dashboard data
    refresh() {
        this.loadDashboard();
    }
}

// Initialize dashboard module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardModule = new Dashboard();
});
