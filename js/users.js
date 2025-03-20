// Handle user form submission
document.getElementById('userForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('userUsername').value;
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRole').value;
    
    // Validate inputs
    if (!username || !role) {
        alert('Please fill all required fields');
        return;
    }
    
    // Check if username already exists (for new users)
    if (!editingItem && users.some(u => u.username === username)) {
        alert('Username already exists');
        return;
    }
    
    if (editingItem) {
        // Update existing user
        const index = users.findIndex(u => u.id === editingItem);
        if (index !== -1) {
            // Don't update password if left empty
            const updatedUser = {
                ...users[index],
                username,
                role,
                active: true
            };
            
            if (password) {
                updatedUser.password = password;
            }
            
            users[index] = updatedUser;
            saveDataToLocalStorage();
            refreshUsersList();
            
            // Reset form
            document.getElementById('userForm').reset();
            document.querySelector('#userForm button[type="submit"]').textContent = 'Add User';
            editingItem = null;
            
            alert('User updated successfully!');
        }
    } else {
        // Add new user
        const newUser = {
            id: generateId(),
            username,
            password: password || 'password123',
            name: username,
            email: '',
            phone: '',
            role,
            active: true
        };
        
        users.push(newUser);
        saveDataToLocalStorage();
        refreshUsersList();
        
        // Reset form
        document.getElementById('userForm').reset();
        
        alert('User added successfully!');
    }
});

// Function to refresh users list
function refreshUsersList() {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;
    
    usersList.innerHTML = '';
    
    if (users.length === 0) {
        usersList.innerHTML = '<tr><td colspan="4" class="px-4 py-2 text-center text-gray-800 dark:text-gray-300">No users found</td></tr>';
        return;
    }
    
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.className = 'border-t dark:border-gray-700';
        
        const usernameCell = document.createElement('td');
        usernameCell.className = 'px-4 py-2 text-gray-800 dark:text-gray-300';
        usernameCell.textContent = user.username;
        
        const roleCell = document.createElement('td');
        roleCell.className = 'px-4 py-2 text-gray-800 dark:text-gray-300';
        roleCell.textContent = user.role;
        
        const statusCell = document.createElement('td');
        statusCell.className = 'px-4 py-2 text-gray-800 dark:text-gray-300';
        
        const statusBadge = document.createElement('span');
        statusBadge.className = user.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded';
        statusBadge.textContent = user.active ? 'Active' : 'Inactive';
        statusCell.appendChild(statusBadge);
        
        const actionsCell = document.createElement('td');
        actionsCell.className = 'px-4 py-2 text-gray-800 dark:text-gray-300';
        
        // Only admin can edit/delete users
        if (currentUser && currentUser.role === 'admin') {
            const editButton = document.createElement('button');
            editButton.className = 'text-blue-500 hover:text-blue-700 mr-2';
            editButton.innerHTML = '<i class="bi bi-pencil"></i>';
            editButton.onclick = function() { editUser(user.id); };
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'text-red-500 hover:text-red-700';
            deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
            deleteButton.onclick = function() { deleteUser(user.id); };
            
            actionsCell.appendChild(editButton);
            actionsCell.appendChild(deleteButton);
        }
        
        tr.appendChild(usernameCell);
        tr.appendChild(roleCell);
        tr.appendChild(statusCell);
        tr.appendChild(actionsCell);
        
        usersList.appendChild(tr);
    });
}

// Edit user
window.editUser = function(id) {
    const user = users.find(u => u.id === id);
    if (user) {
        document.getElementById('userUsername').value = user.username;
        document.getElementById('userPassword').value = '';
        document.getElementById('userRole').value = user.role;
        
        document.querySelector('#userForm button[type="submit"]').textContent = 'Update User';
        
        // Set editing state
        editingItem = id;
        
        // Scroll to form
        document.getElementById('userForm').scrollIntoView({ behavior: 'smooth' });
    }
};

// Delete user
window.deleteUser = function(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    // Don't allow deleting the default admin
    const user = users.find(u => u.id === id);
    if (user && user.username === 'admin') {
        alert('Cannot delete the default admin user');
        return;
    }
    
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        users.splice(index, 1);
        saveDataToLocalStorage();
        refreshUsersList();
        alert('User deleted successfully!');
    }
}; 