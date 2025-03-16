// Handle settings form submission
document.getElementById('settingsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const companyName = document.getElementById('companyName').value;
    const currencySymbol = document.getElementById('currencySymbol').value;
    const itemsPerPage = parseInt(document.getElementById('itemsPerPage').value);
    const sessionTimeout = parseInt(document.getElementById('sessionTimeout').value);
    const requireStrongPasswords = document.getElementById('requireStrongPasswords').checked;
    
    // Validate inputs
    if (!companyName || !currencySymbol || !itemsPerPage || !sessionTimeout) {
        alert('Please fill all required fields');
        return;
    }
    
    // Update settings
    systemSettings = {
        companyName,
        currencySymbol,
        itemsPerPage,
        sessionTimeout,
        requireStrongPasswords
    };
    
    // Save settings
    saveDataToLocalStorage();
    
    // Apply company name to title
    document.title = companyName;
    
    // Refresh UI
    refreshData();
    
    alert('Settings saved successfully!');
});

// Load settings into form
function loadSettingsIntoForm() {
    document.getElementById('companyName').value = systemSettings.companyName || '';
    document.getElementById('currencySymbol').value = systemSettings.currencySymbol || '₹';
    document.getElementById('itemsPerPage').value = systemSettings.itemsPerPage || 10;
    document.getElementById('sessionTimeout').value = systemSettings.sessionTimeout || 30;
    document.getElementById('requireStrongPasswords').checked = systemSettings.requireStrongPasswords || false;
    
    // Apply company name to title
    if (systemSettings.companyName) {
        document.title = systemSettings.companyName;
    }
} 