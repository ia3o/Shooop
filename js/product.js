document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const mainImage = document.getElementById('mainImage');
    const thumbnailGallery = document.getElementById('thumbnailGallery');
    const colorSection = document.getElementById('colorSection');
    const sizeSection = document.getElementById('sizeSection');
    const quantityInput = document.getElementById('quantity');
    const decreaseBtn = document.getElementById('decreaseQuantity');
    const increaseBtn = document.getElementById('increaseQuantity');
    const addToCartBtn = document.getElementById('addToCart');

    // Quantity Controls
    decreaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });

    increaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue < 99) {
            quantityInput.value = currentValue + 1;
        }
    });

    // Validate quantity input
    quantityInput.addEventListener('change', () => {
        let value = parseInt(quantityInput.value);
        if (isNaN(value) || value < 1) value = 1;
        if (value > 99) value = 99;
        quantityInput.value = value;
    });

    // Image Gallery
    function updateMainImage(thumbnailSrc) {
        mainImage.src = thumbnailSrc;
        // Update thumbnail selection
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.classList.remove('active');
            if (thumb.src === thumbnailSrc) {
                thumb.classList.add('active');
            }
        });
    }

    // Product Options Selection
    function createOptionButtons(options, container, type) {
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = `${type}-option`;
            button.setAttribute('data-value', option);
            
            if (type === 'color') {
                button.style.backgroundColor = option;
                button.title = option;
            } else {
                button.textContent = option;
            }

            button.addEventListener('click', () => {
                // Remove selection from other buttons
                container.querySelectorAll(`.${type}-option`).forEach(btn => {
                    btn.classList.remove('selected');
                });
                // Add selection to clicked button
                button.classList.add('selected');
            });

            container.appendChild(button);
        });
    }

    // Update Add to Cart handler
    addToCartBtn.addEventListener('click', () => {
        const selectedColor = colorSection.querySelector('.color-option.selected')?.getAttribute('data-value');
        const selectedSize = sizeSection.querySelector('.size-option.selected')?.getAttribute('data-value');
        const quantity = parseInt(quantityInput.value);

        if (!selectedColor || !selectedSize) {
            alert('Please select color and size options');
            return;
        }

        const productData = {
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            color: selectedColor,
            size: selectedSize,
            quantity: quantity,
            image: currentProduct.images[0] // Add main image for cart display
        };

        // Add to cart using cart manager
        cartManager.addItem(productData);

        // Show confirmation
        const confirmation = document.createElement('div');
        confirmation.className = 'add-to-cart-confirmation';
        confirmation.innerHTML = `
            <div class="confirmation-content">
                <i class="fas fa-check-circle"></i>
                <p>Added to cart!</p>
                <div class="confirmation-buttons">
                    <button onclick="window.location.href='../cart.html'">View Cart</button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()">Continue Shopping</button>
                </div>
            </div>
        `;
        document.body.appendChild(confirmation);

        // Remove confirmation after 5 seconds
        setTimeout(() => {
            confirmation.remove();
        }, 5000);
    });
}); 