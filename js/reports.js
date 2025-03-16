// Generate reports
document.getElementById('generateReportBtn').addEventListener('click', function() {
    const reportType = document.getElementById('reportType').value;
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    
    // Validate inputs
    if (!reportType || !startDate || !endDate) {
        alert('Please fill all required fields');
        return;
    }
    
    // Convert dates to timestamps for comparison
    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).getTime();
    
    if (startTimestamp > endTimestamp) {
        alert('Start date cannot be after end date');
        return;
    }
    
    // Generate report based on type
    switch (reportType) {
        case 'jobs':
            generateJobsReport(startDate, endDate);
            break;
        case 'payments':
            generatePaymentsReport(startDate, endDate);
            break;
        case 'vendors':
            generateVendorsReport(startDate, endDate);
            break;
        case 'clients':
            generateClientsReport(startDate, endDate);
            break;
    }
});

// Generate jobs report
function generateJobsReport(startDate, endDate) {
    // Filter jobs by date range
    const filteredJobs = jobs.filter(job => {
        const jobDate = new Date(job.createdAt).toISOString().split('T')[0];
        return jobDate >= startDate && jobDate <= endDate;
    });
    
    // Sort jobs by date
    filteredJobs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    // Calculate totals
    const totalJobs = filteredJobs.length;
    const totalAmount = filteredJobs.reduce((sum, job) => sum + job.totalAmount, 0);
    const completedJobs = filteredJobs.filter(job => job.status === 'completed').length;
    const pendingJobs = filteredJobs.filter(job => job.status === 'pending').length;
    const inProgressJobs = filteredJobs.filter(job => job.status === 'in-progress').length;
    const cancelledJobs = filteredJobs.filter(job => job.status === 'cancelled').length;
    
    // Generate report HTML
    const reportHTML = `
        <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Jobs Report (${startDate} to ${endDate})</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-white dark:bg-gray-800 p-4 rounded shadow">
                <h4 class="font-bold text-gray-700 dark:text-gray-300">Total Jobs</h4>
                <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">${totalJobs}</p>
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded shadow">
                <h4 class="font-bold text-gray-700 dark:text-gray-300">Total Amount</h4>
                <p class="text-2xl font-bold text-green-600 dark:text-green-400">${formatCurrency(totalAmount)}</p>
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded shadow">
                <h4 class="font-bold text-gray-700 dark:text-gray-300">Job Status</h4>
                <div class="flex items-center mt-2">
                    <div class="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span class="text-sm text-gray-700 dark:text-gray-300">Completed: ${completedJobs}</span>
                </div>
                <div class="flex items-center mt-1">
                    <div class="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <span class="text-sm text-gray-700 dark:text-gray-300">Pending: ${pendingJobs}</span>
                </div>
                <div class="flex items-center mt-1">
                    <div class="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span class="text-sm text-gray-700 dark:text-gray-300">In Progress: ${inProgressJobs}</span>
                </div>
                <div class="flex items-center mt-1">
                    <div class="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span class="text-sm text-gray-700 dark:text-gray-300">Cancelled: ${cancelledJobs}</span>
                </div>
            </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
            <table class="min-w-full">
                <thead>
                    <tr class="bg-gray-100 dark:bg-gray-700">
                        <th class="px-4 py-2 text-left text-gray-800 dark:text-gray-300">Date</th>
                        <th class="px-4 py-2 text-left text-gray-800 dark:text-gray-300">Job Title</th>
                        <th class="px-4 py-2 text-left text-gray-800 dark:text-gray-300">Client</th>
                        <th class="px-4 py-2 text-left text-gray-800 dark:text-gray-300">Vendor</th>
                        <th class="px-4 py-2 text-left text-gray-800 dark:text-gray-300">Status</th>
                        <th class="px-4 py-2 text-left text-gray-800 dark:text-gray-300">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredJobs.map(job => `
                        <tr class="border-t dark:border-gray-700">
                            <td class="px-4 py-2 text-gray-800 dark:text-gray-300">${new Date(job.createdAt).toLocaleDateString()}</td>
                            <td class="px-4 py-2 text-gray-800 dark:text-gray-300">${job.title}</td>
                            <td class="px-4 py-2 text-gray-800 dark:text-gray-300">${job.client}</td>
                            <td class="px-4 py-2 text-gray-800 dark:text-gray-300">${job.vendor}</td>
                            <td class="px-4 py-2 text-gray-800 dark:text-gray-300">
                                <span class="px-2 py-1 rounded ${getStatusClass(job.status)}">${job.status.charAt(0).toUpperCase() + job.status.slice(1)}</span>
                            </td>
                            <td class="px-4 py-2 text-gray-800 dark:text-gray-300">${formatCurrency(job.totalAmount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="mt-6 text-right">
            <button id="printReportBtn" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                <i class="bi bi-printer mr-2"></i>Print Report
            </button>
        </div>
    `;
    
    // Display report
    document.getElementById('reportResults').innerHTML = reportHTML;
    
    // Add print button event listener
    document.getElementById('printReportBtn').addEventListener('click', printReport);
}

// Generate payments report
function generatePaymentsReport(startDate, endDate) {
    // Filter payments by date range
    const filteredPayments = payments.filter(payment => {
        return payment.date >= startDate && payment.date <= endDate;
    });
    
    // Sort payments by date
    filteredPayments.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate totals
    const totalPayments = filteredPayments.length;
    const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Group payments by method
    const paymentsByMethod = {};
    filteredPayments.forEach(payment => {
        if (!paymentsByMethod[payment.method]) {
            paymentsByMethod[payment.method] = {
                count: 0,
                amount: 0
            };
        }
        paymentsByMethod[payment.method].count++;
        paymentsByMethod[payment.method].amount += payment.amount;
    });
    
    // Generate report HTML
    const reportHTML = `
        <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Payments Report (${startDate} to ${endDate})</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="bg-white dark:bg-gray-800 p-4 rounded shadow">
                <h4 class="font-bold text-gray-700 dark:text-gray-300">Total Payments</h4>
                <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">${totalPayments}</p>
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded shadow">
                <h4 class="font-bold text-gray-700 dark:text-gray-300">Total Amount</h4>
                <p class="text-2xl font-bold text-green-600 dark:text-green-400">${formatCurrency(totalAmount)}</p>
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="bg-white dark:bg-gray-800 p-4 rounded shadow">
                <h4 class="font-bold text-gray-700 dark:text-gray-300">Payments by Method</h4>
                ${Object.keys(paymentsByMethod).map(method => `
                    <div class="flex justify-between items-center mt-2">
                        <span class="text-gray-700 dark:text-gray-300">${method}</span>
                        <span class="text-gray-700 dark:text-gray-300">${paymentsByMethod[method].count} (${formatCurrency(paymentsByMethod[method].amount)})</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
            <table class="min-w-full">
                <thead>
                    <tr class="bg-gray-100 dark:bg-gray-700">
                        <th class="px-4 py-2 text-left text-gray-800 dark:text-gray-300">Date</th>
                        <th class="px-4 py-2 text-left text-gray-800 dark:text-gray-300">Job</th>
                        <th class="px-4 py-2 text-left text-gray-800 dark:text-gray-300">Client</th>
                        <th class="px-4 py-2 text-left text-gray-800 dark:text-gray-300">Method</th>
                        <th class="px-4 py-2 text-left text-gray-800 dark:text-gray-300">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredPayments.map(payment => {
                        const job = jobs.find(j => j.id === payment.jobId);
                        if (!job) return '';
                        return `
                            <tr class="border-t dark:border-gray-700">
                                <td class="px-4 py-2 text-gray-800 dark:text-gray-300">${payment.date}</td>
                                <td class="px-4 py-2 text-gray-800 dark:text-gray-300">${job.title}</td>
                                <td class="px-4 py-2 text-gray-800 dark:text-gray-300">${job.client}</td>
                                <td class="px-4 py-2 text-gray-800 dark:text-gray-300">${payment.method}</td>
                                <td class="px-4 py-2 text-gray-800 dark:text-gray-300">${formatCurrency(payment.amount)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="mt-6 text-right">
            <button id="printReportBtn" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                <i class="bi bi-printer mr-2"></i>Print Report
            </button>
        </div>
    `;
    
    // Display report
    document.getElementById('reportResults').innerHTML = reportHTML;
    
    // Add print button event listener
    document.getElementById('printReportBtn').addEventListener('click', printReport);
}

// Get status class for job status
function getStatusClass(status) {
    switch (status) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'in-progress':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'completed':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'cancelled':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        default:
            return '';
    }
}

// Print report
function printReport() {
    const reportContent = document.getElementById('reportResults').innerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Report</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                @media print {
                    button { display: none !important; }
                }
            </style>
        </head>
        <body>
            <div class="container mx-auto">
                ${reportContent}
            </div>
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                }
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
} 