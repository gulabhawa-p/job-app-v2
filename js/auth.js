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
        localStorage.setItem('currentUser', JSON.stringify(user));
        
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
    localStorage.removeItem('currentUser');
    
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
    
    // Set permissions based on role
    setPermissions();
    
    // Load initial page
    loadPage('dashboard');
    
    // Refresh data
    refreshData();
}

// Set permissions based on user role
function setPermissions() {
    const isAdmin = currentUser.role === 'admin';
    const isSubAdmin = currentUser.role === 'subadmin';
    
    // Admin dashboard visibility
    document.getElementById('adminDashboard').style.display = (isAdmin || isSubAdmin) ? 'block' : 'none';
    
    // Users management visibility
    document.getElementById('usersNav').style.display = isAdmin ? 'block' : 'none';
    
    // Settings visibility
    document.getElementById('settingsNav').style.display = isAdmin ? 'block' : 'none';
    
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