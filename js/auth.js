// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Validate inputs
    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }
    
    // Find user
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        if (!user.active) {
            alert('Your account is inactive. Please contact the administrator.');
            return;
        }
        
        // Set current user
        currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        // Show admin panel
        showAdminPanel();
    } else {
        alert('Invalid username or password');
    }
}

// Handle logout
function handleLogout() {
    // Clear current user
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    
    // Show login section
    showLoginSection();
}

// Show login section
function showLoginSection() {
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('adminSection').style.display = 'none';
}

// Show admin panel
function showAdminPanel() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminSection').style.display = 'block';
    
    // Update user info
    document.getElementById('currentUserName').textContent = currentUser.name;
    document.getElementById('currentUserRole').textContent = currentUser.role;
    
    // Add tab identifier to title
    document.title = `${systemSettings.companyName} - ${currentUser.name} (${currentUser.role})`;
    
    // Set permissions based on role
    setPermissions();
    
    // First refresh data
    refreshData();
    
    // Then load initial page
    loadPage('dashboard');
}

// Set permissions based on user role
function setPermissions() {
    const isAdmin = currentUser.role === 'admin';
    const isSubAdmin = currentUser.role === 'subadmin';
    const isVendor = currentUser.role === 'vendor';
    
    // Admin dashboard visibility
    document.getElementById('adminDashboard').style.display = (isAdmin || isSubAdmin) ? 'block' : 'none';
    
    // Users management visibility
    document.getElementById('usersNav').style.display = isAdmin ? 'block' : 'none';
    
    // Settings visibility
    document.getElementById('settingsNav').style.display = isAdmin ? 'block' : 'none';
    
    // Jobs Page visibility - hide jobs "Add" page from vendors
    if (isVendor) {
        const jobsNavItem = document.querySelector('.nav-link[data-page="jobs"]').closest('.nav-item');
        jobsNavItem.style.display = 'none';
    } else {
        const jobsNavItem = document.querySelector('.nav-link[data-page="jobs"]').closest('.nav-item');
        jobsNavItem.style.display = 'block';
    }
    
    // Hide payment form for vendors
    document.addEventListener('DOMContentLoaded', function() {
        if (isVendor) {
            // We'll use setTimeout to ensure this executes after the page is loaded
            setTimeout(function() {
                // Check if we're on the payments page
                const paymentsPage = document.getElementById('payments-page');
                if (paymentsPage && paymentsPage.classList.contains('active')) {
                    // Hide payment form
                    const paymentForm = document.getElementById('paymentForm');
                    if (paymentForm) {
                        paymentForm.closest('.bg-white').style.display = 'none';
                    }
                }
            }, 100);
        }
    });
    
    // Add event listener for nav links to handle payment form visibility when switching to payments page
    const paymentNavLink = document.querySelector('.nav-link[data-page="payments"]');
    if (paymentNavLink) {
        paymentNavLink.addEventListener('click', function() {
            if (isVendor) {
                // When vendor clicks on payments tab, hide the payment form
                setTimeout(function() {
                    const paymentForm = document.getElementById('paymentForm');
                    if (paymentForm) {
                        paymentForm.closest('.bg-white').style.display = 'none';
                    }
                }, 100);
            }
        });
    }
    
    // Edit/Delete buttons visibility
    const actionButtons = document.querySelectorAll('.admin-only');
    actionButtons.forEach(button => {
        button.style.display = isAdmin ? 'inline-block' : 'none';
    });
}

// Handle navigation
function handleNavigation(e) {
    e.preventDefault();
    
    const page = e.target.getAttribute('data-page');
    if (page) {
        loadPage(page);
    }
}

// Load page
function loadPage(page) {
    // Hide all pages
    const pages = document.querySelectorAll('.page-section');
    pages.forEach(p => p.classList.remove('active'));
    
    // Show selected page
    const selectedPage = document.getElementById(page + '-page');
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
    
    // Update active nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        }
    });
} 