import { Services } from './services.js';

// Initialize the main page
async function initializePage() {
    try {
        const products = await Services.store.getProducts();
        
        // Check if we're on the product page
        if (window.location.pathname.includes('product.html')) {
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');
            const product = products.find(p => p.id === productId);
            displayProductDetails(product);
        } else {
            // Display products grid on main page
            displayProducts(products);
        }

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
            <a href="product.html?id=${product.id}" class="product-link">
                <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price.toFixed(2)}</p>
                </div>
            </a>
        </div>
    `).join('');
}

function displayProductDetails(product) {
    if (!product) {
        window.location.href = '404.html';
        return;
    }

    // Update page title and meta description
    document.title = `${product.name} - Shooop`;
    document.querySelector('meta[name="description"]').content = product.description;

    // Update product details
    const productDetails = document.getElementById('product-details');
    productDetails.innerHTML = `
        <div class="product-images">
            <img id="mainImage" src="${product.images[0]}" alt="${product.name}">
            <div id="thumbnailGallery" class="thumbnail-gallery">
                ${product.images.map(img => `
                    <img src="${img}" alt="${product.name}" 
                         onclick="updateMainImage('${img}')"
                         class="thumbnail">
                `).join('')}
            </div>
        </div>
        
        <div class="product-info">
            <h1>${product.name}</h1>
            <p class="price">$${product.price.toFixed(2)}</p>
            
            ${product.colors.length ? `
                <div class="option-section">
                    <h3>Color</h3>
                    <div class="color-options">
                        ${product.colors.map(color => `
                            <button class="color-option" 
                                    data-color="${color}"
                                    style="background-color: ${color}">
                            </button>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${product.sizes.length ? `
                <div class="option-section">
                    <h3>Size</h3>
                    <div class="size-options">
                        ${product.sizes.map(size => `
                            <button class="size-option" data-size="${size}">
                                ${size}
                            </button>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="quantity">
                <label for="quantity">Quantity:</label>
                <input type="number" id="quantity" value="1" min="1">
            </div>
            
            <button class="add-to-cart-btn" 
                    onclick="addToCart('${product.id}')"
                    ${!product.inStock ? 'disabled' : ''}>
                ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            
            <div class="product-description">
                <h2>Description</h2>
                <p>${product.description}</p>
            </div>
        </div>
    `;
}

// Helper functions
window.updateMainImage = function(imgSrc) {
    document.getElementById('mainImage').src = imgSrc;
};

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