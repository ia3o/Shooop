// Define config separately at the top
const CONFIG = {
    auth: {
        googleClientId: '226067442640-6gkvp0ev0sang6b3epbif7nnqh0qtk4j.apps.googleusercontent.com',
        allowedEmails: ['30adamaguilar@gmail.com']
    },
    cloudinary: {
        cloudName: 'dbonimmnx',
        uploadPreset: 'shooop_products'
    },
    sheets: {
        apiKey: 'AIzaSyARmFYTh_LZeeaJlXT2zC4DtlIjwyiDUiI',
        spreadsheetId: '1Bk4h5MsArYaI4EmKBdUaR_QrfwjWN7yw5FNhWJuIeoQ'
    }
};

// Export Services with config
export const Services = {
    config: CONFIG,

    // Utils
    utils: {
        cache: {
            set: (key, data, duration) => {
                localStorage.setItem(key, JSON.stringify({
                    data,
                    expiry: Date.now() + duration
                }));
            },
            get: (key) => {
                const item = JSON.parse(localStorage.getItem(key) || 'null');
                if (!item) return null;
                if (Date.now() > item.expiry) {
                    localStorage.removeItem(key);
                    return null;
                }
                return item.data;
            }
        },
        
        handleError: (error, context) => {
            console.error(`Error in ${context}:`, error);
            return { error: true, message: error.message };
        }
    },

    // Auth methods
    auth: {
        handleLogin: function(response) {
            try {
                console.log('Google response:', response);

                const token = Services.auth.decodeToken(response.credential);
                console.log('Decoded token:', token);

                if (CONFIG.auth.allowedEmails.includes(token.email)) {
                    Services.utils.cache.set('auth_email', token.email, 24 * 60 * 60 * 1000);
                    Services.utils.cache.set('auth_token', response.credential, 24 * 60 * 60 * 1000);
                    
                    window.location.href = '/admin/dashboard.html';
                } else {
                    console.log('Unauthorized email:', token.email);
                    alert(`Unauthorized email address: ${token.email}`);
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Login failed: ' + error.message);
            }
        },

        decodeToken: function(token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                return JSON.parse(jsonPayload);
            } catch (error) {
                console.error('Token decode error:', error);
                throw new Error('Invalid token format');
            }
        },

        checkAuth: function() {
            const email = Services.utils.cache.get('auth_email');
            const token = Services.utils.cache.get('auth_token');
            
            console.log('Checking auth:', { email, hasToken: !!token });
            
            if (!email || !token) return false;
            return CONFIG.auth.allowedEmails.includes(email);
        },

        logout: function() {
            Services.utils.cache.set('auth_email', null, 0);
            Services.utils.cache.set('auth_token', null, 0);
            window.location.href = '/admin/login.html';
        }
    },

    // Products and Cart Management
    store: {
        async getProducts() {
            try {
                const cached = this.utils.cache.get('products');
                if (cached) return cached;

                const response = await fetch(
                    `https://sheets.googleapis.com/v4/spreadsheets/${this.config.sheets.spreadsheetId}/values/Sheet1!A2:J?key=${this.config.sheets.apiKey}`
                );
                
                const data = await response.json();
                const products = this.parseProducts(data.values);
                
                this.utils.cache.set('products', products, 5 * 60 * 1000);
                return products;
            } catch (error) {
                return this.utils.handleError(error, 'store.getProducts');
            }
        },

        parseProducts(rows) {
            return rows.map(row => ({
                id: row[0],
                name: row[1],
                price: parseFloat(row[2]),
                description: row[3],
                category: row[4],
                colors: row[5].split(',').map(s => s.trim()),
                sizes: row[6].split(',').map(s => s.trim()),
                images: row[7].split(',').map(s => s.trim()),
                inStock: row[8].toLowerCase() === 'true',
                featured: row[9].toLowerCase() === 'true'
            }));
        },

        cart: {
            items: JSON.parse(localStorage.getItem('cart') || '[]'),

            save() {
                localStorage.setItem('cart', JSON.stringify(this.items));
                this.updateUI();
            },

            add(product, quantity = 1) {
                const existing = this.items.find(i => i.id === product.id);
                if (existing) {
                    existing.quantity += quantity;
                } else {
                    this.items.push({ ...product, quantity });
                }
                this.save();
            },

            remove(productId) {
                this.items = this.items.filter(i => i.id !== productId);
                this.save();
            },

            updateUI() {
                const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
                document.querySelector('.cart-count').textContent = count;
            },

            getTotal() {
                return this.items.reduce((sum, item) => 
                    sum + (item.price * item.quantity), 0);
            },

            getSubtotal() {
                return this.items.reduce((sum, item) => 
                    sum + (item.price * item.quantity), 0);
            }
        }
    }
}; 