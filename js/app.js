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
    console.log("Loading data from localStorage");
    
    try {
        users = JSON.parse(localStorage.getItem('users')) || [];
        console.log("Loaded users:", users.length);
        
        products = JSON.parse(localStorage.getItem('products')) || [];
        console.log("Loaded products:", products.length);
        
        jobs = JSON.parse(localStorage.getItem('jobs')) || [];
        console.log("Loaded jobs:", jobs.length);
        
        payments = JSON.parse(localStorage.getItem('payments')) || [];
        console.log("Loaded payments:", payments.length);
        
        systemSettings = JSON.parse(localStorage.getItem('systemSettings')) || systemSettings;
        console.log("Loaded system settings");
    } catch (error) {
        console.error("Error loading data from localStorage:", error);
    }
    
    // Create default users if no users exist
    if (users.length === 0) {
        console.log("Creating default users");
        // Admin user
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
        
        // Vendor user
        users.push({
            id: generateId(),
            username: 'vendor',
            password: 'vendor123',
            name: 'Vendor',
            role: 'vendor',
            email: 'vendor@example.com',
            phone: '1234567890',
            active: true
        });
        
        // Save users to localStorage
        saveDataToLocalStorage();
        console.log("Default users created:", users);
    } else {
        console.log("Users already exist:", users.length);
    }
}

// Save data to localStorage
function saveDataToLocalStorage() {
    console.log("Saving data to localStorage");
    
    try {
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('products', JSON.stringify(products));
        localStorage.setItem('jobs', JSON.stringify(jobs));
        localStorage.setItem('payments', JSON.stringify(payments));
        localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
        console.log("Data saved successfully");
    } catch (error) {
        console.error("Error saving data to localStorage:", error);
    }
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
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showAdminPanel();
        
        // Make sure all data is loaded
        refreshData();
        
        // Load initial page (dashboard)
        loadPage('dashboard');
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

// Function to refresh admin dashboard
function refreshAdminDashboard() {
    console.log("Refreshing admin dashboard");
    
    // Update total counts
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalJobs').textContent = jobs.length;
    document.getElementById('dashboardTotalPayments').textContent = payments.length;
    
    // Update recent jobs list
    const recentJobsList = document.getElementById('recentJobsList');
    if (recentJobsList) {
        recentJobsList.innerHTML = '';
        
        // Filter jobs for vendors - they can only see jobs assigned to them
        let filteredJobs = jobs;
        if (currentUser && currentUser.role === 'vendor') {
            filteredJobs = jobs.filter(job => job.vendor === currentUser.name);
        }
        
        if (filteredJobs.length === 0) {
            recentJobsList.innerHTML = '<tr><td colspan="6" class="px-4 py-2 text-center text-gray-800 dark:text-gray-300">No jobs found</td></tr>';
            return;
        }
        
        // Sort jobs by creation date (newest first)
        const sortedJobs = [...filteredJobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Take only the 5 most recent jobs
        const recentJobs = sortedJobs.slice(0, 5);
        
        recentJobs.forEach(job => {
            const tr = document.createElement('tr');
            tr.className = 'border-t dark:border-gray-700';
            
            const titleCell = document.createElement('td');
            titleCell.className = 'px-4 py-2 text-gray-800 dark:text-gray-300';
            titleCell.textContent = job.title;
            
            const clientCell = document.createElement('td');
            clientCell.className = 'px-4 py-2 text-gray-800 dark:text-gray-300';
            clientCell.textContent = job.client;
            
            const vendorCell = document.createElement('td');
            vendorCell.className = 'px-4 py-2 text-gray-800 dark:text-gray-300';
            vendorCell.textContent = job.vendor;
            
            const statusCell = document.createElement('td');
            statusCell.className = 'px-4 py-2 text-gray-800 dark:text-gray-300';
            
            const statusBadge = document.createElement('span');
            let statusClass = '';
            
            switch (job.status) {
                case 'pending':
                    statusClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
                    break;
                case 'in-progress':
                    statusClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
                    break;
                case 'completed':
                    statusClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
                    break;
                case 'cancelled':
                    statusClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
                    break;
            }
            
            statusBadge.className = statusClass + ' px-2 py-1 rounded';
            statusBadge.textContent = job.status.charAt(0).toUpperCase() + job.status.slice(1);
            statusCell.appendChild(statusBadge);
            
            const dueDateCell = document.createElement('td');
            dueDateCell.className = 'px-4 py-2 text-gray-800 dark:text-gray-300';
            dueDateCell.textContent = job.dueDate;
            
            const amountCell = document.createElement('td');
            amountCell.className = 'px-4 py-2 text-gray-800 dark:text-gray-300';
            amountCell.textContent = formatCurrency(job.totalAmount);
            
            tr.appendChild(titleCell);
            tr.appendChild(clientCell);
            tr.appendChild(vendorCell);
            tr.appendChild(statusCell);
            tr.appendChild(dueDateCell);
            tr.appendChild(amountCell);
            
            recentJobsList.appendChild(tr);
        });
    }
} 