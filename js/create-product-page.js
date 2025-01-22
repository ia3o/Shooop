function createProductPage(productId) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Product - Shooop">
    <title>Product - Shooop</title>
    <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="../css/styles.css">
</head>
<body>
    <header>
        <div class="cart-header">
            <div class="logo-container">
                <a href="../index.html" class="logo-link">
                    <h1 class="logo logo-small">Shooop</h1>
                </a>
            </div>
            <div class="cart-container">
                <a href="../cart.html" class="cart-icon">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count">0</span>
                </a>
            </div>
        </div>
    </header>

    <main class="product-page">
        <div class="product-container">
            <div class="product-images">
                <div class="main-image">
                    <img src="" alt="" id="mainImage">
                </div>
                <div class="thumbnail-gallery" id="thumbnailGallery">
                </div>
            </div>

            <div class="product-details">
                <h1 class="product-title" id="productTitle">Product Name</h1>
                <p class="product-price" id="productPrice">$0.00</p>
                
                <div class="product-options">
                    <div class="option-section" id="colorSection">
                        <h3>Color</h3>
                        <div class="color-options">
                        </div>
                    </div>

                    <div class="option-section" id="sizeSection">
                        <h3>Size</h3>
                        <div class="size-options">
                        </div>
                    </div>

                    <div class="quantity-section">
                        <h3>Quantity</h3>
                        <div class="quantity-selector">
                            <button class="quantity-btn" id="decreaseQuantity">-</button>
                            <input type="number" id="quantity" value="1" min="1" max="99">
                            <button class="quantity-btn" id="increaseQuantity">+</button>
                        </div>
                    </div>
                </div>

                <button class="add-to-cart-btn" id="addToCart">
                    Add to Cart
                </button>

                <div class="product-description">
                    <h3>Description</h3>
                    <p id="productDescription"></p>
                </div>
            </div>
        </div>
    </main>

    <script>
        const PRODUCT_ID = '${productId}';
    </script>
    <script src="../js/cart-manager.js"></script>
    <script src="../js/product.js"></script>
    <script src="../js/product-loader.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            loadProductData(PRODUCT_ID);
        });
    </script>
</body>
</html>`;
} 