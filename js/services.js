import { CONFIG } from './config.js';

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
        handleLogin: async function(response) {
            try {
                console.log('Login response received:', response);
                const token = this.decodeToken(response.credential);
                console.log('Decoded token:', token);
                
                if (!token?.email) throw new Error('Invalid token');

                console.log('Checking email:', token.email);
                console.log('Allowed emails:', CONFIG.auth.allowedEmails);
                
                if (CONFIG.auth.allowedEmails.includes(token.email)) {
                    console.log('Email authorized, setting cache...');
                    Services.utils.cache.set('auth_email', token.email, 24 * 60 * 60 * 1000);
                    Services.utils.cache.set('auth_token', response.credential, 24 * 60 * 60 * 1000);
                    
                    const hostname = window.location.hostname;
                    console.log('Current hostname:', hostname);
                    
                    if (hostname === 'ia3o.github.io') {
                        console.log('Redirecting to GitHub Pages dashboard...');
                        window.location.href = '/shooop/admin/dashboard.html';
                    } else {
                        console.log('Redirecting to local dashboard...');
                        window.location.href = '/admin/dashboard.html';
                    }
                } else {
                    throw new Error(`Unauthorized email: ${token.email}`);
                }
            } catch (error) {
                console.error('Login error:', error);
                console.error('Error stack:', error.stack);
                alert('Login failed. Please check browser console for details.');
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