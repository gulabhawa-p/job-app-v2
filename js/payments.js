// Handle payment form submission
document.getElementById('paymentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const jobId = document.getElementById('paymentJob').value;
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const method = document.getElementById('paymentMethod').value;
    const date = document.getElementById('paymentDate').value;
    const notes = document.getElementById('paymentNotes').value;
    
    // Validate inputs
    if (!jobId || !amount || !method || !date) {
        alert('Please fill all required fields');
        return;
    }
    
    // Find job
    const job = jobs.find(j => j.id === jobId);
    if (!job) {
        alert('Invalid job selected');
        return;
    }
    
    // Calculate remaining amount
    const paidAmount = payments.filter(p => p.jobId === jobId).reduce((sum, p) => sum + p.amount, 0);
    const remainingAmount = job.totalAmount - paidAmount;
    
    // Validate payment amount
    if (amount > remainingAmount) {
        alert('Payment amount cannot exceed remaining amount (' + formatCurrency(remainingAmount) + ')');
        return;
    }
    
    if (editingItem) {
        // Update existing payment
        const index = payments.findIndex(p => p.id === editingItem);
        if (index !== -1) {
            payments[index] = {
                ...payments[index],
                jobId,
                amount,
                method,
                date,
                notes,
                updatedAt: new Date().toISOString()
            };
            saveDataToLocalStorage();
            refreshPaymentsList();
            
            // Reset form
            document.getElementById('paymentForm').reset();
            document.querySelector('#paymentForm button[type="submit"]').textContent = 'Add Payment';
            editingItem = null;
            
            alert('Payment updated successfully!');
        }
    } else {
        // Add new payment
        const newPayment = {
            id: generateId(),
            jobId,
            amount,
            method,
            date,
            notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        payments.push(newPayment);
        saveDataToLocalStorage();
        refreshPaymentsList();
        
        // Reset form
        document.getElementById('paymentForm').reset();
        
        alert('Payment added successfully!');
        
        // Update job status if fully paid
        updateJobStatusIfFullyPaid(jobId);
    }
});

// Update job status if fully paid
function updateJobStatusIfFullyPaid(jobId) {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    const paidAmount = payments.filter(p => p.jobId === jobId).reduce((sum, p) => sum + p.amount, 0);
    
    if (paidAmount >= job.totalAmount && job.status !== 'completed') {
        const index = jobs.findIndex(j => j.id === jobId);
        if (index !== -1) {
            jobs[index].status = 'completed';
            saveDataToLocalStorage();
            refreshJobsList();
        }
    }
}

// Populate job select in payment form
function populateJobSelect() {
    const jobSelect = document.getElementById('paymentJob');
    if (!jobSelect) return;
    
    jobSelect.innerHTML = '';
    
    // Add empty option
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = 'Select Job';
    jobSelect.appendChild(emptyOption);
    
    // Add job options
    jobs.forEach(job => {
        // Calculate remaining amount
        const paidAmount = payments.filter(p => p.jobId === job.id).reduce((sum, p) => sum + p.amount, 0);
        const remainingAmount = job.totalAmount - paidAmount;
        
        // Only show jobs with remaining amount
        if (remainingAmount > 0) {
            const option = document.createElement('option');
            option.value = job.id;
            option.textContent = job.title + ' - ' + job.client + ' (' + formatCurrency(remainingAmount) + ' remaining)';
            jobSelect.appendChild(option);
        }
    });
}

// Edit payment
window.editPayment = function(id) {
    const payment = payments.find(p => p.id === id);
    if (payment) {
        // Populate job select with all jobs
        const jobSelect = document.getElementById('paymentJob');
        jobSelect.innerHTML = '';
        
        // Add empty option
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = 'Select Job';
        jobSelect.appendChild(emptyOption);
        
        // Add job options
        jobs.forEach(job => {
            const option = document.createElement('option');
            option.value = job.id;
            option.textContent = job.title + ' - ' + job.client;
            option.selected = job.id === payment.jobId;
            jobSelect.appendChild(option);
        });
        
        document.getElementById('paymentAmount').value = payment.amount;
        document.getElementById('paymentMethod').value = payment.method;
        document.getElementById('paymentDate').value = payment.date;
        document.getElementById('paymentNotes').value = payment.notes || '';
        
        document.querySelector('#paymentForm button[type="submit"]').textContent = 'Update Payment';
        
        // Set editing state
        editingItem = id;
        
        // Scroll to form
        document.getElementById('paymentForm').scrollIntoView({ behavior: 'smooth' });
    }
};

// Delete payment
window.deletePayment = function(id) {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    
    const index = payments.findIndex(p => p.id === id);
    if (index !== -1) {
        const payment = payments[index];
        payments.splice(index, 1);
        saveDataToLocalStorage();
        refreshPaymentsList();
        
        // Update job status if no longer fully paid
        const job = jobs.find(j => j.id === payment.jobId);
        if (job && job.status === 'completed') {
            const paidAmount = payments.filter(p => p.jobId === payment.jobId).reduce((sum, p) => sum + p.amount, 0);
            if (paidAmount < job.totalAmount) {
                const jobIndex = jobs.findIndex(j => j.id === payment.jobId);
                if (jobIndex !== -1) {
                    jobs[jobIndex].status = 'in-progress';
                    saveDataToLocalStorage();
                    refreshJobsList();
                }
            }
        }
        
        alert('Payment deleted successfully!');
    }
};

// Function to refresh payments list
function refreshPaymentsList() {
    const paymentsList = document.getElementById('paymentsList');
    if (!paymentsList) return;
    
    paymentsList.innerHTML = '';
    
    if (payments.length === 0) {
        paymentsList.innerHTML = '<tr><td colspan="6" class="px-4 py-2 text-center text-gray-800 dark:text-gray-300">No payments found</td></tr>';
        return;
    }
    
    payments.forEach(payment => {
        const job = jobs.find(j => j.id === payment.jobId);
        if (!job) return;
        
        const tr = document.createElement('tr');
        tr.className = 'border-t dark:border-gray-700';
        
        const jobCell = document.createElement('td');
        jobCell.className = 'px-4 py-2 text-gray-800 dark:text-gray-300';
        jobCell.textContent = job.title;
        
        const clientCell = document.createElement('td');
        clientCell.className = 'px-4 py-2 text-gray-800 dark:text-gray-300';
        clientCell.textContent = job.client;
        
        const amountCell = document.createElement('td');
        amountCell.className = 'px-4 py-2 text-gray-800 dark:text-gray-300';
        amountCell.textContent = formatCurrency(payment.amount);
        
        const methodCell = document.createElement('td');
        methodCell.className = 'px-4 py-2 text-gray-800 dark:text-gray-300';
        methodCell.textContent = payment.method;
        
        const dateCell = document.createElement('td');
        dateCell.className = 'px-4 py-2 text-gray-800 dark:text-gray-300';
        dateCell.textContent = payment.date;
        
        const actionsCell = document.createElement('td');
        actionsCell.className = 'px-4 py-2 text-gray-800 dark:text-gray-300';
        
        // Only admin and subadmin can edit/delete payments
        if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'subadmin')) {
            const editButton = document.createElement('button');
            editButton.className = 'text-blue-500 hover:text-blue-700 mr-2';
            editButton.innerHTML = '<i class="bi bi-pencil"></i>';
            editButton.onclick = function() { editPayment(payment.id); };
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'text-red-500 hover:text-red-700';
            deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
            deleteButton.onclick = function() { deletePayment(payment.id); };
            
            actionsCell.appendChild(editButton);
            actionsCell.appendChild(deleteButton);
        }
        
        tr.appendChild(jobCell);
        tr.appendChild(clientCell);
        tr.appendChild(amountCell);
        tr.appendChild(methodCell);
        tr.appendChild(dateCell);
        tr.appendChild(actionsCell);
        
        paymentsList.appendChild(tr);
    });
} 