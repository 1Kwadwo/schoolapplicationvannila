// Authentication Module
class Auth {
    constructor() {
        this.isAuthenticated = true; // Always authenticated
        this.currentUser = { username: 'Admin' };
        this.init();
    }

    init() {
        this.showApp(); // Show app directly without login
        this.bindEvents();
    }

    bindEvents() {
        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.showPage(page);
            });
        });
    }

    async logout() {
        // Simple logout that just refreshes the page
        this.isAuthenticated = false;
        this.currentUser = null;
        window.location.reload();
    }

    showApp() {
        // Show the main app directly
        document.getElementById('app').style.display = 'flex';
        
        // Update user display
        if (this.currentUser) {
            document.getElementById('currentUser').textContent = `${this.currentUser.username} (Admin)`;
        }

        // Show dashboard by default
        this.showPage('dashboard');
    }

    showPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected page
        const targetPage = document.getElementById(`${pageName}Page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Add active class to nav link
        const activeLink = document.querySelector(`[data-page="${pageName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Load page data
        this.loadPageData(pageName);
    }

    loadPageData(pageName) {
        switch (pageName) {
            case 'dashboard':
                if (window.dashboardModule) {
                    window.dashboardModule.loadDashboard();
                }
                break;
            case 'students':
                if (window.studentsModule) {
                    window.studentsModule.loadStudents();
                }
                break;
            case 'courses':
                if (window.coursesModule) {
                    window.coursesModule.loadCourses();
                }
                break;
            case 'enrollments':
                if (window.enrollmentsModule) {
                    window.enrollmentsModule.loadEnrollments();
                }
                break;
        }
    }

    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        // Insert at the top of main content
        const mainContent = document.querySelector('.main-content');
        mainContent.insertBefore(messageDiv, mainContent.firstChild);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Utility function to make API calls
    async apiCall(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const finalOptions = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, finalOptions);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    }
}

// Global utility functions
function showPage(pageName) {
    if (window.auth) {
        window.auth.showPage(pageName);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new Auth();
});
