// Global variables
let currentUser = null;
let users = [];
let products = [];
let jobs = [];
let payments = [];
let systemSettings = {
    companyName: 'Job Management System',
    currencySymbol: '₹',
    itemsPerPage: 10,
    sessionTimeout: 30,
    requireStrongPasswords: false
};
let editingItem = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Application initialized');
    
    // Load data from localStorage
    loadDataFromLocalStorage();
    
    // Initialize UI
    initializeUI();
    
    // Setup event listeners
    setupEventListeners();
});

// Load data from localStorage
function loadDataFromLocalStorage() {
    users = JSON.parse(localStorage.getItem('users')) || [];
    products = JSON.parse(localStorage.getItem('products')) || [];
    jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    payments = JSON.parse(localStorage.getItem('payments')) || [];
    systemSettings = JSON.parse(localStorage.getItem('systemSettings')) || systemSettings;
    
    // Create default admin user if no users exist
    if (users.length === 0) {
        users.push({
            id: generateId(),
            username: 'admin',
            password: 'admin123',
            name: 'Administrator',
            role: 'admin',
            email: 'admin@example.com',
            phone: '1234567890',
            active: true
        });
        saveDataToLocalStorage();
    }
}

// Save data to localStorage
function saveDataToLocalStorage() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('jobs', JSON.stringify(jobs));
    localStorage.setItem('payments', JSON.stringify(payments));
    localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
}

// Initialize UI
function initializeUI() {
    // Apply dark mode if saved
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.add('dark');
        if (document.getElementById('darkModeToggle')) {
            document.getElementById('darkModeToggle').checked = true;
        }
    }
    
    // Apply company name to title
    if (systemSettings.companyName) {
        document.title = systemSettings.companyName;
    }
    
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showAdminPanel();
    } else {
        showLoginSection();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', toggleDarkMode);
    }
    
    // Logout button
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format currency
function formatCurrency(amount) {
    return systemSettings.currencySymbol + ' ' + parseFloat(amount).toFixed(2);
}

// Refresh all data
function refreshData() {
    refreshUsersList();
    refreshProductsList();
    refreshJobsList();
    refreshPaymentsList();
    refreshAdminDashboard();
}

// Toggle dark mode
function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
} 