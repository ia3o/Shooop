class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.updateCartCount();
    }

    // Load cart from localStorage
    loadCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartCount();
    }

    // Add item to cart
    addItem(product) {
        // Check if item already exists with same options
        const existingItem = this.cart.find(item => 
            item.id === product.id && 
            item.color === product.color && 
            item.size === product.size
        );

        if (existingItem) {
            // Update quantity if item exists
            existingItem.quantity += product.quantity;
        } else {
            // Add new item if it doesn't exist
            this.cart.push(product);
        }

        this.saveCart();
        return true;
    }

    // Remove item from cart
    removeItem(index) {
        this.cart.splice(index, 1);
        this.saveCart();
    }

    // Update item quantity
    updateQuantity(index, quantity) {
        if (quantity > 0 && quantity <= 99) {
            this.cart[index].quantity = quantity;
            this.saveCart();
            return true;
        }
        return false;
    }

    // Calculate cart total
    getTotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Get cart count
    getCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    // Update cart count in header
    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = this.getCount();
        }
    }

    // Clear cart
    clearCart() {
        this.cart = [];
        this.saveCart();
    }
}

// Initialize cart manager
const cartManager = new CartManager(); 