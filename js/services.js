import { CONFIG } from '/shooop/js/config.js';  // For GitHub Pages
console.log('CONFIG loaded:', CONFIG);
console.log('Allowed emails:', CONFIG.auth.allowedEmails);

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
                const token = this.decodeToken(response.credential);
                if (!token?.email) throw new Error('Invalid token');

                // Store the credential temporarily
                const tempCredential = response.credential;
                
                // Show password modal
                const modal = document.getElementById('passwordModal');
                const passwordInput = document.getElementById('adminPassword');
                const submitBtn = document.getElementById('submitPassword');
                const cancelBtn = document.getElementById('cancelPassword');
                
                modal.style.display = 'flex';
                
                // Handle submit
                const handleSubmit = () => {
                    const adminPassword = passwordInput.value;
                    
                    // Replace 'your-secure-password' with your actual password
                    if (adminPassword === 'your-secure-password') {
                        Services.utils.cache.set('auth_email', token.email, 24 * 60 * 60 * 1000);
                        Services.utils.cache.set('auth_token', tempCredential, 24 * 60 * 60 * 1000);
                        
                        const baseUrl = window.location.pathname.includes('/shooop') 
                            ? '/shooop' 
                            : '';
                        
                        window.location.href = `${baseUrl}/admin/dashboard.html`;
                    } else {
                        alert('Incorrect admin password');
                    }
                };
                
                // Handle cancel
                const handleCancel = () => {
                    modal.style.display = 'none';
                    passwordInput.value = '';
                };
                
                // Event listeners
                submitBtn.onclick = handleSubmit;
                cancelBtn.onclick = handleCancel;
                
                // Allow Enter key to submit
                passwordInput.onkeyup = (e) => {
                    if (e.key === 'Enter') handleSubmit();
                    if (e.key === 'Escape') handleCancel();
                };
                
            } catch (error) {
                console.error('Login error:', error);
                alert(error.message);
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