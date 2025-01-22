async function loadProductData(productId) {
    try {
        const response = await fetch('../data/products.json');
        const data = await response.json();
        const product = data.products.find(p => p.id === productId);
        
        if (product) {
            // Update page with product data
            document.title = `${product.name} - Shooop`;
            document.getElementById('productTitle').textContent = product.name;
            document.getElementById('productPrice').textContent = `$${product.price.toFixed(2)}`;
            document.getElementById('productDescription').textContent = product.description;
            
            // Load images
            const mainImage = document.getElementById('mainImage');
            mainImage.src = product.images[0];
            mainImage.alt = product.name;
            
            // Create thumbnails
            const gallery = document.getElementById('thumbnailGallery');
            product.images.forEach(src => {
                const thumb = document.createElement('img');
                thumb.src = src;
                thumb.alt = product.name;
                thumb.className = 'thumbnail';
                thumb.onclick = () => updateMainImage(src);
                gallery.appendChild(thumb);
            });
            
            // Create color options
            const colorContainer = document.querySelector('.color-options');
            createOptionButtons(product.options.colors, colorContainer, 'color');
            
            // Create size options
            const sizeContainer = document.querySelector('.size-options');
            createOptionButtons(product.options.sizes, sizeContainer, 'size');
            
            // Store current product data
            window.currentProduct = product;
        }
    } catch (error) {
        console.error('Error loading product data:', error);
    }
} 