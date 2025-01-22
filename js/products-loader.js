class ProductsLoader {
    constructor(config) {
        this.config = config;
        this.products = [];
    }

    async loadProducts() {
        try {
            const response = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${this.config.range}?key=${this.config.apiKey}`
            );
            
            const data = await response.json();
            this.products = this.parseProducts(data.values);
            return this.products;
        } catch (error) {
            console.error('Error loading products:', error);
            return [];
        }
    }

    parseProducts(rows) {
        return rows.map(row => ({
            id: row[0],
            name: row[1],
            price: parseFloat(row[2]),
            description: row[3],
            category: row[4],
            colors: row[5].split(',').map(color => color.trim()),
            sizes: row[6].split(',').map(size => size.trim()),
            images: row[7].split(',').map(url => url.trim()),
            inStock: row[8].toLowerCase() === 'true',
            featured: row[9].toLowerCase() === 'true'
        }));
    }

    async getProduct(productId) {
        if (this.products.length === 0) {
            await this.loadProducts();
        }
        return this.products.find(p => p.id === productId);
    }
} 