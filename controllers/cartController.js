const db = require('../db');

exports.getCart = (req, res) => {
    const userId = req.session.user.userId;
    console.log(userId)
    const sql = `SELECT p.productId, p.productName, p.productDescription, p.productImage, p.productPrice, c.cartProductQuantity 
                    FROM products p
                    JOIN cart_items c ON p.productId = c.cartProductId
                    WHERE c.cartUserId = ?;`;
    // Fetch data from MySQL
    db.query(sql, [userId], (error, results) => {
        if (error) {
            return res.status(500).send('Error retrieving products');
        }

        if (results.length > 0) {
            console.log('All products:', results[0].productName);

            let totalAmount = 0;
            let cartProductQuantity = 0;
            let productPrice = 0;

            for (let i = 0; i < results.length; i++) {
                cartProductQuantity = results[i].cartProductQuantity;
                productPrice = results[i].productPrice;
                totalAmount += cartProductQuantity * productPrice;
            }

            res.render('viewCart', { cart_items: results, totalAmount: totalAmount, msg: "" });
        } else {
            res.render('viewCart', { msg: "No products in cart" });
        }
    });
};

exports.addToCart = (req, res) => {
    const productId = req.params.id;
    const { productQuantityToAdd } = req.body
    console.log("product qty to add" + productQuantityToAdd)
    const userId = req.session.user.userId;

    // Check if product is already in the cart for the user
    const checkCartQuery = 'SELECT * FROM cart_items WHERE cartProductId = ? AND cartUserId = ?';
    db.query(checkCartQuery, [productId, userId], (err, cartResult) => {
        if (err) throw err;

        if (cartResult.length > 0) {
            // If the product is already in the cart, update the quantity
            const updateCartQuery = `
                UPDATE cart_items SET cartProductQuantity = cartProductQuantity + ?
                WHERE cartProductId = ? AND cartUserId = ?
            `;
            db.query(updateCartQuery, [productQuantityToAdd, productId, userId], (err, updateResult) => {
                if (err) throw err;
                res.redirect('/cart');
            });
        } else {
            // Otherwise, add a new row in the cart table
            const addToCartQuery = `
                INSERT INTO cart_items (cartProductQuantity, cartProductId, cartUserId)
                VALUES (?, ?, ?)
            `;
            db.query(addToCartQuery, [productQuantityToAdd, productId, userId], (err, insertResult) => {
                if (err) throw err;
                res.redirect('/cart');
            });
        }
    });

};


exports.updateCartProduct = (req, res) => {
    const productId = req.params.id;
    const { cartProductQuantity } = req.body

    const userId = req.session.user.userId;

    const updateCartQuery = ` UPDATE cart_items SET cartProductQuantity = ?
                            WHERE cartProductId = ? AND cartUserId = ?`;
    db.query(updateCartQuery, [cartProductQuantity, productId, userId], (err, updateResult) => {
        if (err) throw err;
        res.redirect('/cart');
    });

};


exports.removeFromCart = (req, res) => {
    const productId = req.params.id;
    const userId = req.session.user.userId;
    const sql = 'DELETE FROM cart_items WHERE cartProductId = ? AND cartUserId = ?';
    db.query(sql, [productId, userId], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error deleting product from cart:", error);
            res.status(500).send('Error deleting product from cart');
        } else {
            // Send a success response
            res.redirect('/cart');
        }
    });
}


exports.checkout = (req, res) => {

    const { paymentMethod, orderId, transactionId } = req.params;
    console.log(`order id: ${orderId} transaction id: ${transactionId}`);

    const userId = req.session.user.userId; // Get userId from session
    console.log(userId);

    // SQL query to fetch cart items for the logged-in user
    const sql = `
        SELECT p.productId, p.productName, p.productDescription, p.productImage, p.productPrice, c.cartProductQuantity
        FROM products p
        JOIN cart_items c ON p.productId = c.cartProductId
        WHERE c.cartUserId = ?;
    `;

    db.query(sql, [userId], (error, cartItems) => {
        if (error) {
            console.error('Error retrieving cart items:', error);
            return res.status(500).send('Error retrieving cart items');
        }

        if (cartItems.length > 0) {
            let totalAmount = 0;

            // Calculate total amount
            cartItems.forEach(item => {
                totalAmount += item.cartProductQuantity * item.productPrice;
            });

            // Insert cart items into 'order_items' table
            const orderItemsSql = `
                    INSERT INTO order_items (orderProductId, orderProductQuantity, orderUserId, orderDate, paymentMethod, orderId, transactionId)
                    VALUES (?, ?, ?, ?, ?, ?, ?);
                `;

            const orderDate = new Date();
            cartItems.forEach(orderItem => {
                console.log(orderItem.productId, orderItem.cartProductQuantity, userId, orderDate)
                console.log(orderItem)
                db.query(orderItemsSql, [
                    orderItem.productId, orderItem.cartProductQuantity, userId, orderDate, paymentMethod, orderId, transactionId
                ]);
            });

            // Clear the cart after transferring items
            const clearCartSql = `DELETE FROM cart_items WHERE cartUserId = ?`;
            db.query(clearCartSql, [userId], (clearCartError) => {
                if (clearCartError) {
                    console.error('Error clearing cart:', clearCartError);
                    return res.status(500).send('Error clearing cart');
                }

                // Render the invoice page (or confirmation page)
                res.render('invoice', {
                    cart_items: cartItems,
                    totalAmount: totalAmount.toFixed(2), // Format total amount to 2 decimal places
                    userId: userId,
                    orderDate: orderDate, // Current date for the invoice
                    paymentMethod: paymentMethod,
                    orderId: orderId,
                    transactionId, transactionId,
                });
            });


        } else {
            // Handle empty cart
            res.status(404).send('Your cart is empty');
        }
    });

};
