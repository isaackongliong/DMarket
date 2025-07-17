const db = require('../db');

exports.getProducts = (req, res) => {
    const sql = 'SELECT productId, productName, productDescription, productImage, productPrice, productStock, p.productId, c.categoryName FROM products p, categories c WHERE p.categoryId = c.categoryId';
    // Fetch data from MySQL
    db.query(sql, (error, results) => {
        if (error) {
            return res.status(500).send('Error retrieving products');
        }

        if (results.length > 0) {
            console.log('All products:', results[0].productName);
            res.render('viewAllProducts', { products: results });
        } else {
            // If no product with the given ID was found, 
            //render a 404 page or handle it accordingly
            res.status(404).send('No products');
        }
    });
};

exports.getProductsByCategory = (req, res) => {
    const categoryId = req.params.id;
    const sql = `SELECT 
                    p.productId, 
                    p.productName, 
                    p.productDescription, 
                    p.productImage, 
                    p.productPrice, 
                    p.productStock, 
                    c.categoryName 
                FROM 
                    products p
                JOIN 
                    categories c 
                ON 
                    p.categoryId = c.categoryId 
                WHERE 
                    c.categoryId = ?;`;
    // Fetch data from MySQL
    db.query(sql, [categoryId], (error, results) => {
        if (error) {
            return res.status(500).send('Error retrieving products');
        }

        if (results.length > 0) {
            console.log('All products:', results[0].productName);
            res.render('viewAllProducts', { products: results });
        } else {
            // If no product with the given ID was found, 
            //render a 404 page or handle it accordingly
            res.status(404).send('No products');
        }
    });
};


exports.getProduct = (req, res) => {
    const productId = req.params.id;
    const sql = 'SELECT * FROM products WHERE productId = ?';
    // Fetch data from MySQL
    db.query(sql, [productId], (error, results) => {

        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving category by ID');
        }

        // Check if any product with the given ID was found
        if (results.length > 0) {
            // Render HTML page with the category data
            res.render('viewProduct', { product: results[0] });
        } else {
            // If no product with the given ID was found, 
            //render a 404 page or handle it accordingly
            res.status(404).send('Product not found');
        }
    });
};

exports.addProductForm = (req, res) => {

    const sql = 'SELECT * FROM categories';
    // Fetch data from MySQL
    db.query(sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving categories');
        }

        if (results.length > 0) {
            console.log('All categories:', results[0].categoryName);
            res.render('addProduct', { categories: results });
            // res.render('viewAllCategories', { categories: results });
        } else {
            // If no product with the given ID was found, 
            //render a 404 page or handle it accordingly
            res.status(404).send('No Categories');
        }
    });



};


exports.addProduct = (req, res) => {
    const { productName, productDescription, productPrice, productStock, categoryId } = req.body;
    let productImage;
    if (req.file) {
        productImage = req.file.filename; // Save only the filename
    } else {
        productImage = null;
    }

    const sql = 'INSERT INTO products (productName, productDescription, productImage, productPrice, productStock, categoryId) VALUES (?, ?, ?, ?, ?, ?)';

    // Insert the new product into the database
    db.query(sql, [productName, productDescription, productImage, productPrice, productStock, categoryId], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error adding product:", error);
            res.status(500).send('Error adding Product');
        } else {
            // Send a success response
            res.redirect('/products');
        }
    });
};

//edit product form 
exports.editProductForm = async (req, res) => {
    const productId = req.params.id;
    // First, fetch the categories
    getAllCategories(db, (categoriesError, categories) => {
        if (categoriesError) {
            console.error('Error retrieving categories:', categoriesError.message);
            return res.status(500).send('Error retrieving categories');
        }

        // Once categories are fetched, fetch the product by ID
        const sql = 'SELECT * FROM products WHERE productId = ?';
        db.query(sql, [productId], (productError, results) => {
            if (productError) {
                console.error('Database query error:', productError.message);
                return res.status(500).send('Error retrieving product by ID');
            }

            // Check if any product with the given ID was found
            if (results.length > 0) {
                // Render HTML page with the product and categories data
                res.render('editProduct', { product: results[0], categories: categories });
            } else {
                // If no product with the given ID was found, handle accordingly
                res.status(404).send('Product not found');
            }
        });
    });

};

// Fetch all categories using a callback
const getAllCategories = (db, callback) => {
    const sql = 'SELECT * FROM categories';

    // Fetch data from MySQL
    db.query(sql, (error, results) => {
        if (error) {
            return callback(error, null); // Call callback with error
        }

        if (results.length > 0) {
            return callback(null, results); // Call callback with categories
        } else {
            return callback(null, []); // No categories found, return empty array
        }
    });
};


//edit product form processing
exports.editProduct = (req, res) => {

    const productId = req.params.id;
    const { productName, productDescription, productPrice, productStock, categoryId } = req.body;
    let productImage = req.body.currentImage; //retrieve current image filename
    if (req.file) { //if new image is uploaded
        productImage = req.file.filename; // set image to be new image filename
    }
    console.log("new file: " + productImage);
    const sql = 'UPDATE products SET productName = ? , productDescription = ?, productImage = ?, productPrice = ?, productStock = ?, categoryId = ?  WHERE productId = ?';

    // Updated the product into the database
    db.query(sql, [productName, productDescription, productImage, productPrice, productStock, categoryId, productId], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error updating product:", error);
            res.status(500).send('Error updating product');
        } else {
            // Send a success response
            res.redirect('/products');
        }
    });

};

//delete product
exports.deleteProduct = (req, res) => {
    const productId = req.params.id;
    const sql = 'DELETE FROM products WHERE productId = ?';
    db.query(sql, [productId], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error deleting product:", error);
            res.status(500).send('Error deleting product');
        } else {
            // Send a success response
            res.redirect('/products');
        }
    });
}