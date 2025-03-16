// Handle job form submission
document.getElementById('jobForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('jobTitle').value;
    const client = document.getElementById('jobClient').value;
    const vendor = document.getElementById('jobVendor').value;
    const status = document.getElementById('jobStatus').value;
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
    if (!title || !client || !vendor || !status || !dueDate || selectedProducts.length === 0) {
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
                status,
                dueDate,
                products: selectedProducts,
                totalAmount,
                updatedAt: new Date().toISOString()
            };
            saveDataToLocalStorage();
            refreshJobsList();
            
            // Reset form
            document.getElementById('jobForm').reset();
            document.querySelector('#jobProductsTable tbody').innerHTML = '';
            addProductRow();
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
            status,
            dueDate,
            products: selectedProducts,
            totalAmount,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        jobs.push(newJob);
        saveDataToLocalStorage();
        refreshJobsList();
        
        // Reset form
        document.getElementById('jobForm').reset();
        document.querySelector('#jobProductsTable tbody').innerHTML = '';
        addProductRow();
        
        alert('Job added successfully!');
    }
});

// Add product row to job form
window.addProductRow = function() {
    const tbody = document.querySelector('#jobProductsTable tbody');
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
        productSelect.appendChild(option);
    });
    
    productCell.appendChild(productSelect);
    
    const quantityCell = document.createElement('td');
    quantityCell.className = 'px-4 py-2';
    
    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.min = '1';
    quantityInput.value = '1';
    quantityInput.className = 'w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white';
    
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
    
    tbody.appendChild(tr);
};

// Edit job
window.editJob = function(id) {
    const job = jobs.find(j => j.id === id);
    if (job) {
        document.getElementById('jobTitle').value = job.title;
        document.getElementById('jobClient').value = job.client;
        document.getElementById('jobVendor').value = job.vendor;
        document.getElementById('jobStatus').value = job.status;
        document.getElementById('jobDueDate').value = job.dueDate;
        
        // Clear product rows
        document.querySelector('#jobProductsTable tbody').innerHTML = '';
        
        // Add product rows
        job.products.forEach(product => {
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
            products.forEach(p => {
                const option = document.createElement('option');
                option.value = p.name;
                option.textContent = p.name + ' (' + formatCurrency(p.rate) + ')';
                option.selected = p.name === product.name;
                productSelect.appendChild(option);
            });
            
            productCell.appendChild(productSelect);
            
            const quantityCell = document.createElement('td');
            quantityCell.className = 'px-4 py-2';
            
            const quantityInput = document.createElement('input');
            quantityInput.type = 'number';
            quantityInput.min = '1';
            quantityInput.value = product.quantity;
            quantityInput.className = 'w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white';
            
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
        });
        
        document.querySelector('#jobForm button[type="submit"]').textContent = 'Update Job';
        
        // Set editing state
        editingItem = id;
        
        // Scroll to form
        document.getElementById('jobForm').scrollIntoView({ behavior: 'smooth' });
    }
};

// Delete job
window.deleteJob = function(id) {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
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
    
    if (jobs.length === 0) {
        jobsList.innerHTML = '<tr><td colspan="6" class="px-4 py-2 text-center text-gray-800 dark:text-gray-300">No jobs found</td></tr>';
        return;
    }
    
    jobs.forEach(job => {
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
        
        const amountCell = document.createElement('td');
        amountCell.className = 'px-4 py-2 text-gray-800 dark:text-gray-300';
        amountCell.textContent = formatCurrency(job.totalAmount);
        
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
        tr.appendChild(amountCell);
        tr.appendChild(actionsCell);
        
        jobsList.appendChild(tr);
    });
} 