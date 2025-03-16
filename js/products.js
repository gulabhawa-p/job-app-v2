// Handle product form submission
document.getElementById('productForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('productName').value;
    const rate = document.getElementById('productRate').value;
    
    // Validate inputs
    if (!name || !rate) {
        alert('Please fill all required fields');
        return;
    }
    
    // Check if product already exists (for new products)
    if (!editingItem && products.some(p => p.name === name)) {
        alert('Product already exists');
        return;
    }
    
    if (editingItem) {
        // Update existing product
        const index = products.findIndex(p => p.name === editingItem);
        if (index !== -1) {
            products[index] = {
                name,
                rate: parseFloat(rate)
            };
            saveDataToLocalStorage();
            refreshProductsList();
            
            // Reset form
            document.getElementById('productForm').reset();
            document.querySelector('#productForm button[type="submit"]').textContent = 'Add Product';
            editingItem = null;
            
            alert('Product updated successfully!');
        }
    } else {
        // Add new product
        const newProduct = {
            name,
            rate: parseFloat(rate)
        };
        
        products.push(newProduct);
        saveDataToLocalStorage();
        refreshProductsList();
        
        // Reset form
        document.getElementById('productForm').reset();
        
        alert('Product added successfully!');
    }
});

// Edit product
window.editProduct = function(name) {
    const product = products.find(p => p.name === name);
    if (product) {
        document.getElementById('productName').value = product.name;
        document.getElementById('productRate').value = product.rate;
        
        document.querySelector('#productForm button[type="submit"]').textContent = 'Update Product';
        
        // Set editing state
        editingItem = name;
        
        // Scroll to form
        document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
    }
};

// Delete product
window.deleteProduct = function(name) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const index = products.findIndex(p => p.name === name);
    if (index !== -1) {
        // Check if product is used in any job
        const isUsed = jobs.some(job => job.products.some(p => p.name === name));
        if (isUsed) {
            alert('Cannot delete product as it is used in one or more jobs');
            return;
        }
        
        products.splice(index, 1);
        saveDataToLocalStorage();
        refreshProductsList();
        alert('Product deleted successfully!');
    }
};

// Function to refresh products list
function refreshProductsList() {
    const productsList = document.getElementById('productsList');
    if (!productsList) return;
    
    productsList.innerHTML = '';
    
    if (products.length === 0) {
        productsList.innerHTML = '<tr><td colspan="3" class="px-4 py-2 text-center text-gray-800 dark:text-gray-300">No products found</td></tr>';
        return;
    }
    
    products.forEach(product => {
        const tr = document.createElement('tr');
        tr.className = 'border-t dark:border-gray-700';
        
        const nameCell = document.createElement('td');
        nameCell.className = 'px-4 py-2 text-gray-800 dark:text-gray-300';
        nameCell.textContent = product.name;
        
        const rateCell = document.createElement('td');
        rateCell.className = 'px-4 py-2 text-gray-800 dark:text-gray-300';
        rateCell.textContent = formatCurrency(product.rate);
        
        const actionsCell = document.createElement('td');
        actionsCell.className = 'px-4 py-2 text-gray-800 dark:text-gray-300';
        
        // Only admin and subadmin can edit/delete products
        if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'subadmin')) {
            const editButton = document.createElement('button');
            editButton.className = 'text-blue-500 hover:text-blue-700 mr-2';
            editButton.innerHTML = '<i class="bi bi-pencil"></i>';
            editButton.onclick = function() { editProduct(product.name); };
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'text-red-500 hover:text-red-700';
            deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
            deleteButton.onclick = function() { deleteProduct(product.name); };
            
            actionsCell.appendChild(editButton);
            actionsCell.appendChild(deleteButton);
        }
        
        tr.appendChild(nameCell);
        tr.appendChild(rateCell);
        tr.appendChild(actionsCell);
        
        productsList.appendChild(tr);
    });
} 