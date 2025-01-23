import { Services } from './services.js';

// Initialize the main page
async function initializePage() {
    try {
        const products = await Services.store.getProducts();
        
        // Display products grid on main page
        displayProducts(products);

        // Initialize cart
        Services.store.cart.updateUI();
        setupSearch();
    } catch (error) {
        console.error('Page initialization error:', error);
    }
}

// Display products in grid
function displayProducts(products) {
    const container = document.getElementById('products-grid');
    if (!container) return;

    // Filter to show only featured products, maximum 3
    const featuredProducts = products
        .filter(product => product.featured)
        .slice(0, 3);

    container.innerHTML = featuredProducts.map(product => `
        <div class="product-card">
            <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">$${product.price.toFixed(2)}</p>
            </div>
        </div>
    `).join('');
}

// Helper functions
window.addToCart = function(productId, event) {
    event?.preventDefault();
    const quantity = parseInt(document.getElementById('quantity')?.value || 1);
    Services.store.cart.add(productId, quantity);
};

// Debounce search function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Improve search functionality
function setupSearch() {
    const searchInput = document.getElementById('search');
    if (!searchInput) return;

    const debouncedSearch = debounce(async (query) => {
        try {
            const products = await Services.store.getProducts();
            const filtered = products.filter(p => 
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query)
            );
            displayProducts(filtered);
        } catch (error) {
            console.error('Search error:', error);
        }
    }, 300);

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        debouncedSearch(query);
    });
}

// Update the handleSearch function to handle base URL
window.handleSearch = function() {
    const searchInput = document.getElementById('search');
    const searchTerm = searchInput.value.trim();
    
    const baseUrl = window.location.pathname.includes('/Shooop') 
        ? '/Shooop' 
        : '';
    
    if (window.location.pathname.includes('index.html') || 
        window.location.pathname === '/' || 
        window.location.pathname === `${baseUrl}/`) {
        // Existing search logic for products page
        const query = searchInput.value.toLowerCase();
        debouncedSearch(query);
    } else {
        // Redirect to index page with search term
        window.location.href = `${baseUrl}/index.html?search=${encodeURIComponent(searchTerm)}`;
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