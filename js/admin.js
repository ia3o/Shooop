import { Services } from './services.js';

// Check authentication on admin pages
function checkAdminAuth() {
    if (!Services.auth.checkAuth()) {
        window.location.href = '/admin/login.html';
    }
}

// Initialize admin dashboard
async function initializeAdmin() {
    checkAdminAuth();
    
    const products = await Services.store.getProducts();
    displayAdminProducts(products);
    
    // Setup logout
    document.querySelector('.logout-btn')?.addEventListener('click', () => {
        Services.auth.logout();
    });
}

function displayAdminProducts(products) {
    const container = document.getElementById('admin-products');
    if (!container) return;

    container.innerHTML = products.map(product => `
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
    `).join('');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initializeAdmin);

// Add this to your existing admin.js
window.handleLogout = function() {
    Services.auth.logout();
};