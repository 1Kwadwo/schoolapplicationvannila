// Authentication Module
class Auth {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.bindEvents();
    }

    bindEvents() {
        // Login form submission
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

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

    async checkAuthStatus() {
        try {
            const response = await fetch('/api/auth/check', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success && data.authenticated) {
                this.isAuthenticated = true;
                this.currentUser = data.user;
                this.showApp();
            } else {
                this.showLogin();
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            this.showLogin();
        }
    }

    async login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            this.showMessage('Please enter both username and password', 'error');
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                this.isAuthenticated = true;
                this.currentUser = data.user;
                this.showApp();
                this.showMessage('Login successful!', 'success');
            } else {
                this.showMessage(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('An error occurred during login', 'error');
        }
    }

    async logout() {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                this.isAuthenticated = false;
                this.currentUser = null;
                this.showLogin();
                this.showMessage('Logout successful!', 'success');
            } else {
                this.showMessage('Logout failed', 'error');
            }
        } catch (error) {
            console.error('Logout error:', error);
            this.showMessage('An error occurred during logout', 'error');
        }
    }

    showLogin() {
        document.getElementById('loginModal').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
        document.getElementById('username').focus();
    }

    showApp() {
        document.getElementById('loginModal').style.display = 'none';
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

    // Utility function to make authenticated API calls
    async apiCall(url, options = {}) {
        const defaultOptions = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const finalOptions = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, finalOptions);
            const data = await response.json();

            if (response.status === 401) {
                // Unauthorized - redirect to login
                this.isAuthenticated = false;
                this.currentUser = null;
                this.showLogin();
                throw new Error('Session expired. Please login again.');
            }

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
        modal.style.display = 'none';
    }
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new Auth();
});
