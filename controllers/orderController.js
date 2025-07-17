const db = require('../db');

exports.getmyOrders= (req, res) => {
    const userId = req.session.user.userId;
    console.log(userId)
    const sql = `SELECT 
                    p.productId,
                    u.username,
                    p.productName,
                    p.productDescription,
                    p.productImage,
                    p.productPrice,
                    o.orderProductQuantity,
                    o.orderDate
                FROM 
                    order_items o
                JOIN 
                    products p ON p.productId = o.orderProductId
                JOIN 
                    users u ON o.orderUserId = u.userId
                WHERE 
                    o.orderUserId = ?;`;
    // Fetch data from MySQL
    db.query(sql, [userId], (error, results) => {
        if (error) {
            return res.status(500).send('Error retrieving products');
        }

        if (results.length > 0) {
            console.log('All products:', results[0].productName);

            let totalAmount = 0;
            let orderProductQuantity = 0;
            let productPrice = 0;

            for (let i = 0; i < results.length; i++) {
                orderProductQuantity = results[i].orderProductQuantity;
                productPrice = results[i].productPrice;
                totalAmount += orderProductQuantity * productPrice;
            }

            res.render('viewOrders', { orders: results, totalAmount: totalAmount, msg: "" });
        } else {
            // If no product with the given ID was found, 
            //render a 404 page or handle it accordingly
            // res.status(404).send('No orders');

            res.render('viewOrders', { msg: "No orders" });
        }
    });
};


exports.getOrders = (req, res) => {
    const sql = `SELECT o.orderUserId, u.username, p.productId, p.productName, p.productDescription, p.productImage, p.productPrice, o.orderProductQuantity, o.orderDate 
                FROM products p, order_items o, users u
                WHERE  p.productId = o.orderProductId
                AND o.orderUserId = u.userId
                ORDER BY u.username`;

    // Fetch data from MySQL
    db.query(sql, (error, results) => {
        if (error) {
            return res.status(500).send('Error retrieving products');
        }

        console.log("results: " + results.length)
        if (results.length > 0) {
            console.log('All products:', results[0].productName);

            let totalAmount = 0;
            let orderProductQuantity = 0;
            let productPrice = 0;

            for (let i = 0; i < results.length; i++) {
                orderProductQuantity = results[i].orderProductQuantity;
                productPrice = results[i].productPrice;
                totalAmount += orderProductQuantity * productPrice;
            }

            res.render('viewOrders', { orders: results, totalAmount: totalAmount, msg: "" });
        } else {
            // If no product with the given ID was found, 
            //render a 404 page or handle it accordingly
            // res.status(404).send('No orders');

            res.render('viewOrders', { msg: "No orders" });
        }
    });
};
