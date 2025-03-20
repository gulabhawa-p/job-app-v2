// Handle job form submission
document.getElementById('jobForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('jobTitle').value;
    const client = document.getElementById('jobClient').value;
    const vendor = document.getElementById('jobVendor').value;
    const dueDate = document.getElementById('jobDueDate').value;
    
    // Get selected products
    const selectedProducts = [];
    const productRows = document.querySelectorAll('#jobProductsTable tbody tr');
    productRows.forEach(row => {
        const productName = row.querySelector('select').value;
        const quantity = parseInt(row.querySelector('input[type="number"]').value);
        
        if (productName && quantity > 0) {
            const product = products.find(p => p.name === productName);
            if (product) {
                selectedProducts.push({
                    name: product.name,
                    rate: product.rate,
                    quantity: quantity,
                    total: product.rate * quantity
                });
            }
        }
    });
    
    // Validate inputs
    if (!title || !client || !vendor || !dueDate || selectedProducts.length === 0) {
        alert('Please fill all required fields and add at least one product');
        return;
    }
    
    // Calculate total amount
    const totalAmount = selectedProducts.reduce((sum, product) => sum + product.total, 0);
    
    if (editingItem) {
        // Update existing job
        const index = jobs.findIndex(j => j.id === editingItem);
        if (index !== -1) {
            jobs[index] = {
                ...jobs[index],
                title,
                client,
                vendor,
                status: 'pending', // Default status
                dueDate,
                products: selectedProducts,
                amount: totalAmount,
                lastUpdated: new Date().toISOString()
            };
            saveDataToLocalStorage();
            refreshJobsList();
            
            // Reset form
            document.getElementById('jobForm').reset();
            document.querySelector('#jobProductsTable tbody').innerHTML = '';
            document.querySelector('#jobForm button[type="submit"]').textContent = 'Add Job';
            editingItem = null;
            
            alert('Job updated successfully!');
        }
    } else {
        // Add new job
        const newJob = {
            id: generateId(),
            title,
            client,
            vendor,
            status: 'pending', // Default status
            dueDate,
            products: selectedProducts,
            amount: totalAmount,
            created: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        
        jobs.push(newJob);
        saveDataToLocalStorage();
        refreshJobsList();
        
        // Reset form
        document.getElementById('jobForm').reset();
        document.querySelector('#jobProductsTable tbody').innerHTML = '';
        
        alert('Job added successfully!');
    }
});

// Load vendors dropdown
function loadVendorsDropdown() {
    const vendorSelect = document.getElementById('jobVendor');
    if (!vendorSelect) return;
    
    // Clear existing options except first one
    while (vendorSelect.options.length > 1) {
        vendorSelect.remove(1);
    }
    
    // Get vendor users
    const vendorUsers = users.filter(user => user.role === 'vendor' && user.active);
    
    // Add vendor options
    vendorUsers.forEach(vendor => {
        const option = document.createElement('option');
        option.value = vendor.username;
        option.textContent = vendor.username;
        vendorSelect.appendChild(option);
    });
}

// Add product row to job form
window.addProductRow = function(existingProduct = null) {
    const tr = document.createElement('tr');
    
    const productCell = document.createElement('td');
    productCell.className = 'px-4 py-2';
    
    const productSelect = document.createElement('select');
    productSelect.className = 'w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white';
    
    // Add empty option
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = 'Select Product';
    productSelect.appendChild(emptyOption);
    
    // Add product options
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.name;
        option.textContent = product.name + ' (' + formatCurrency(product.rate) + ')';
        
        // If we have an existing product, select it
        if (existingProduct && product.name === existingProduct.name) {
            option.selected = true;
        }
        
        productSelect.appendChild(option);
    });
    
    productCell.appendChild(productSelect);
    
    const quantityCell = document.createElement('td');
    quantityCell.className = 'px-4 py-2';
    
    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.min = '1';
    quantityInput.className = 'w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white';
    
    // If we have an existing product, set quantity
    if (existingProduct) {
        quantityInput.value = existingProduct.quantity;
    } else {
        quantityInput.value = '1';
    }
    
    quantityCell.appendChild(quantityInput);
    
    const actionCell = document.createElement('td');
    actionCell.className = 'px-4 py-2';
    
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'text-red-500 hover:text-red-700';
    removeButton.innerHTML = '<i class="bi bi-trash"></i>';
    removeButton.onclick = function() {
        tr.remove();
    };
    
    actionCell.appendChild(removeButton);
    
    tr.appendChild(productCell);
    tr.appendChild(quantityCell);
    tr.appendChild(actionCell);
    
    document.querySelector('#jobProductsTable tbody').appendChild(tr);
};

// Edit job
window.editJob = function(id) {
    const job = jobs.find(j => j.id === id);
    if (job) {
        // Switch to jobs page
        loadPage('jobs');
        
        // Populate form with job data
        document.getElementById('jobTitle').value = job.title;
        document.getElementById('jobClient').value = job.client;
        document.getElementById('jobVendor').value = job.vendor;
        document.getElementById('jobDueDate').value = job.dueDate;
        
        // Clear product rows
        document.querySelector('#jobProductsTable tbody').innerHTML = '';
        
        // Add product rows
        job.products.forEach(product => {
            addProductRow(product);
        });
        
        // Set editing state
        editingItem = job.id;
        
        // Update button text
        document.querySelector('#jobForm button[type="submit"]').textContent = 'Update Job';
        
        // Scroll to form
        document.getElementById('jobForm').scrollIntoView({ behavior: 'smooth' });
    }
};

// Delete job
window.deleteJob = function(id) {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    // Make sure we're on the jobs-list page
    if (!document.getElementById('jobs-list-page').classList.contains('active')) {
        loadPage('jobs-list');
    }
    
    const index = jobs.findIndex(j => j.id === id);
    if (index !== -1) {
        // Check if job has payments
        const hasPayments = payments.some(p => p.jobId === id);
        if (hasPayments) {
            alert('Cannot delete job as it has payments associated with it');
            return;
        }
        
        jobs.splice(index, 1);
        saveDataToLocalStorage();
        refreshJobsList();
        alert('Job deleted successfully!');
    }
};

// Function to refresh jobs list
function refreshJobsList() {
    const jobsList = document.getElementById('jobsList');
    if (!jobsList) return;
    
    jobsList.innerHTML = '';
    
    // Filter jobs for vendors - they can only see jobs assigned to them
    let filteredJobs = jobs;
    if (currentUser && currentUser.role === 'vendor') {
        filteredJobs = jobs.filter(job => job.vendor === currentUser.name);
    }
    
    if (filteredJobs.length === 0) {
        jobsList.innerHTML = '<tr><td colspan="7" class="px-4 py-2 text-center text-gray-800 dark:text-gray-300">No jobs found</td></tr>';
        return;
    }
    
    filteredJobs.forEach(job => {
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
        amountCell.textContent = formatCurrency(job.amount);
        
        const actionsCell = document.createElement('td');
        actionsCell.className = 'px-4 py-2 text-gray-800 dark:text-gray-300';
        
        const viewButton = document.createElement('button');
        viewButton.className = 'text-green-500 hover:text-green-700 mr-2';
        viewButton.innerHTML = '<i class="bi bi-eye"></i>';
        viewButton.onclick = function() { viewJob(job.id); };
        
        const editButton = document.createElement('button');
        editButton.className = 'text-blue-500 hover:text-blue-700 mr-2';
        editButton.innerHTML = '<i class="bi bi-pencil"></i>';
        editButton.onclick = function() { editJob(job.id); };
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'text-red-500 hover:text-red-700';
        deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
        deleteButton.onclick = function() { deleteJob(job.id); };
        
        actionsCell.appendChild(viewButton);
        
        // Only admin and subadmin can edit/delete jobs
        if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'subadmin')) {
            actionsCell.appendChild(editButton);
            actionsCell.appendChild(deleteButton);
        }
        
        tr.appendChild(titleCell);
        tr.appendChild(clientCell);
        tr.appendChild(vendorCell);
        tr.appendChild(statusCell);
        tr.appendChild(dueDateCell);
        tr.appendChild(amountCell);
        tr.appendChild(actionsCell);
        
        jobsList.appendChild(tr);
    });
}

// View job details
window.viewJob = function(id) {
    const job = jobs.find(j => j.id === id);
    if (job) {
        let productsHtml = '';
        job.products.forEach(product => {
            productsHtml += `
                <tr class="border-t dark:border-gray-700">
                    <td class="px-4 py-2 text-gray-800 dark:text-gray-300">${product.name}</td>
                    <td class="px-4 py-2 text-gray-800 dark:text-gray-300">${formatCurrency(product.rate)}</td>
                    <td class="px-4 py-2 text-gray-800 dark:text-gray-300">${product.quantity}</td>
                    <td class="px-4 py-2 text-gray-800 dark:text-gray-300">${formatCurrency(product.total)}</td>
                </tr>
            `;
        });
        
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
        
        const jobDetails = `
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-800 dark:text-white">Job Details</h3>
                    <button onclick="closeJobDetails()" class="text-gray-500 hover:text-red-500">
                        <i class="bi bi-x-circle-fill text-xl"></i>
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <h4 class="font-bold text-gray-800 dark:text-white mb-2">Basic Information</h4>
                        <p class="text-gray-700 dark:text-gray-300"><strong>Title:</strong> ${job.title}</p>
                        <p class="text-gray-700 dark:text-gray-300"><strong>Client:</strong> ${job.client}</p>
                        <p class="text-gray-700 dark:text-gray-300"><strong>Vendor:</strong> ${job.vendor}</p>
                        <p class="text-gray-700 dark:text-gray-300">
                            <strong>Status:</strong> 
                            <span class="${statusClass} px-2 py-1 rounded">
                                ${job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </span>
                        </p>
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-800 dark:text-white mb-2">Payment Details</h4>
                        <p class="text-gray-700 dark:text-gray-300"><strong>Due Date:</strong> ${job.dueDate}</p>
                        <p class="text-gray-700 dark:text-gray-300"><strong>Total Amount:</strong> ${formatCurrency(job.amount)}</p>
                    </div>
                </div>
                
                <h4 class="font-bold text-gray-800 dark:text-white mb-2">Products</h4>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead>
                            <tr class="bg-gray-100 dark:bg-gray-700">
                                <th class="px-4 py-2 text-left text-gray-800 dark:text-gray-300">Product</th>
                                <th class="px-4 py-2 text-left text-gray-800 dark:text-gray-300">Rate</th>
                                <th class="px-4 py-2 text-left text-gray-800 dark:text-gray-300">Quantity</th>
                                <th class="px-4 py-2 text-left text-gray-800 dark:text-gray-300">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // First switch to jobs-list page if we're not already there
        if (!document.getElementById('jobs-list-page').classList.contains('active')) {
            loadPage('jobs-list');
        }

        // Insert job details before the jobs list
        const jobsList = document.querySelector('#jobsList').closest('.bg-white');
        jobsList.insertAdjacentHTML('beforebegin', jobDetails);
        
        // Scroll to job details
        document.querySelector('#jobsList').closest('.bg-white').previousElementSibling.scrollIntoView({ behavior: 'smooth' });
    }
};

// Close job details
window.closeJobDetails = function() {
    const jobDetails = document.querySelector('#jobsList').closest('.bg-white').previousElementSibling;
    if (jobDetails && jobDetails.querySelector('h3').textContent === 'Job Details') {
        jobDetails.remove();
    }
};

// Initialize jobs page
function initializeJobs() {
    // Load vendors dropdown
    loadVendorsDropdown();
    
    // Add empty product row
    if (document.querySelector('#jobProductsTable tbody').children.length === 0) {
        addProductRow();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize jobs page when it's loaded
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            const page = this.getAttribute('data-page');
            if (page === 'jobs') {
                setTimeout(initializeJobs, 100); // Small delay to ensure DOM is updated
            }
        });
    });
    
    // Initialize if we're already on the jobs page
    if (document.getElementById('jobs-page').classList.contains('active')) {
        initializeJobs();
    }
}); 