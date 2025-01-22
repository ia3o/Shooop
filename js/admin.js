import { Services } from './services.js';

// Check authentication on admin pages
function checkAdminAuth() {
    if (!Services.auth.checkAuth()) {
        const baseUrl = window.location.pathname.includes('/shooop') 
            ? '/shooop' 
            : '';
        window.location.href = `${baseUrl}/admin/login.html`;
        return false;
    }
    return true;
}

// Initialize admin dashboard
async function initializeAdmin() {
    if (!checkAdminAuth()) return;
    
    try {
        const products = await Services.store.getProducts();
        displayAdminProducts(products);
        
        // Setup logout
        document.querySelector('.logout-btn')?.addEventListener('click', handleLogout);
    } catch (error) {
        console.error('Admin initialization error:', error);
    }
}

function displayAdminProducts(products) {
    const container = document.getElementById('admin-content');
    if (!container) return;

    container.innerHTML = `
        <h2>Products Management</h2>
        <div class="admin-products-grid">
            ${products.map(product => `
                <div class="admin-product-card">
                    <img src="${product.images[0]}" alt="${product.name}">
                    <div class="product-details">
                        <h3>${product.name}</h3>
                        <p>$${product.price.toFixed(2)}</p>
                        <p>Stock: ${product.inStock ? 'In Stock' : 'Out of Stock'}</p>
                    </div>
                    <div class="actions">
                        <button onclick="editProduct('${product.id}')">Edit</button>
                        <button onclick="deleteProduct('${product.id}')">Delete</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Global functions
window.handleLogout = function() {
    Services.auth.logout();
};

window.editProduct = function(productId) {
    // Implement edit functionality
    console.log('Edit product:', productId);
};

window.deleteProduct = function(productId) {
    // Implement delete functionality
    console.log('Delete product:', productId);
};

// Initialize on load
document.addEventListener('DOMContentLoaded', initializeAdmin);