import { CONFIG } from '/Shooop/js/config.js';  // For GitHub Pages
console.log('CONFIG loaded:', CONFIG);

// Export Services with config
export const Services = {
    config: CONFIG,

    // Utils
    utils: {
        cache: {
            set: (key, data, duration) => {
                try {
                    localStorage.setItem(key, JSON.stringify({
                        data,
                        expiry: Date.now() + duration
                    }));
                } catch (error) {
                    console.error('Cache set error:', error);
                }
            },
            get: (key) => {
                try {
                    const item = JSON.parse(localStorage.getItem(key) || 'null');
                    if (!item) return null;
                    if (Date.now() > item.expiry) {
                        localStorage.removeItem(key);
                        return null;
                    }
                    return item.data;
                } catch (error) {
                    console.error('Cache get error:', error);
                    return null;
                }
            }
        },
        
        handleError: (error, context) => {
            console.error(`Error in ${context}:`, error);
            return { error: true, message: error.message };
        }
    },

    // Auth methods
    auth: {
        handleLogin: function() {
            try {
                const password = document.getElementById('adminPassword').value;
                
                // ShooopThereItIs
                if (password === 'ShooopThereItIs') {
                    Services.utils.cache.set('auth_token', 'admin_authenticated', 24 * 60 * 60 * 1000);
                    
                    const baseUrl = window.location.pathname.includes('/Shooop') 
                        ? '/Shooop'
                        : '';
                    
                    window.location.href = `${baseUrl}/admin/dashboard.html`;
                } else {
                    alert('Incorrect admin password');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert(error.message);
            }
        },

        checkAuth: function() {
            const token = Services.utils.cache.get('auth_token');
            return token === 'admin_authenticated';
        },

        logout: function() {
            Services.utils.cache.set('auth_token', null, 0);
            const baseUrl = window.location.pathname.includes('/Shooop') 
                ? '/Shooop'
                : '';
            window.location.href = `${baseUrl}/admin/login.html`;
        }
    },

    // Products and Cart Management
    store: {
        async getProducts() {
            try {
                const cached = this.utils.cache.get('products');
                if (cached) return cached;

                const response = await fetch(
                    `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.sheets.spreadsheetId}/values/Sheet1!A2:J?key=${CONFIG.sheets.apiKey}`
                );
                
                if (!response.ok) throw new Error('Failed to fetch products');
                
                const data = await response.json();
                const products = this.parseProducts(data.values || []);
                
                this.utils.cache.set('products', products, 5 * 60 * 1000);
                return products;
            } catch (error) {
                console.error('getProducts error:', error);
                return [];
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