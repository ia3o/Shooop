import { Services } from './services.js';
import fs from 'fs/promises';
import path from 'path';

async function generateProductPages() {
    try {
        // Read the template
        const template = await fs.readFile(
            path.join(process.cwd(), 'templates', 'product-page.html'),
            'utf-8'
        );

        // Get products from Google Sheets
        const products = await Services.store.getProducts();

        // Create products directory if it doesn't exist
        await fs.mkdir(path.join(process.cwd(), 'products'), { recursive: true });

        // Generate a page for each product
        for (const product of products) {
            const productPage = template
                .replace('<title>Product Name - Shooop</title>', `<title>${product.name} - Shooop</title>`)
                .replace('<meta name="description" content="Product details - Shooop">', 
                    `<meta name="description" content="${product.description.substring(0, 155)}...">`);

            // Write the file
            await fs.writeFile(
                path.join(process.cwd(), `product-${product.id}.html`),
                productPage,
                'utf-8'
            );

            console.log(`Generated page for product: ${product.name}`);
        }

        console.log('All product pages generated successfully!');

    } catch (error) {
        console.error('Error generating product pages:', error);
    }
}

// Run the generator
generateProductPages(); 