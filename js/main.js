import { Services } from './services.js';

// Initialize the main page
async function initializePage() {
    // Load products
    const products = await Services.store.getProducts();
    displayProducts(products);

    // Initialize cart
    Services.store.cart.updateUI();

    // Set up search
    setupSearch();
}

// Display products in grid
function displayProducts(products) {
    const container = document.getElementById('products-grid');
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.images[0]}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">$${product.price.toFixed(2)}</p>
            <button onclick="addToCart('${product.id}')">Add to Cart</button>
        </div>
    `).join('');
}

// Add to cart handler
window.addToCart = async function(productId) {
    const products = await Services.store.getProducts();
    const product = products.find(p => p.id === productId);
    if (product) {
        Services.store.cart.add(product);
    }
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('search');
    if (!searchInput) return;

    searchInput.addEventListener('input', async (e) => {
        const query = e.target.value.toLowerCase();
        const products = await Services.store.getProducts();
        const filtered = products.filter(p => 
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        );
        displayProducts(filtered);
    });
}

// Update the existing handleSearch function
window.handleSearch = function() {
    const searchInput = document.getElementById('search');
    const searchTerm = searchInput.value.trim();
    
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        // Existing search logic for products page
        // Your existing search code here
    } else {
        // Redirect to index page with search term
        window.location.href = `index.html?search=${encodeURIComponent(searchTerm)}`;
    }
}

// Add this to handle search parameters when page loads
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search');
    
    if (searchTerm) {
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.value = searchTerm;
            handleSearch();
        }
    }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', initializePage); 