const fs = require('fs');
const path = require('path');
const db = require('../db');

exports.generateReport = (req, res) => {
    const sql = `SELECT u.username, p.productName, p.productPrice, o.orderProductQuantity, 
                 (p.productPrice * o.orderProductQuantity) AS subtotal, o.orderDate
                 FROM products p
                 JOIN order_items o ON p.productId = o.orderProductId
                 JOIN users u ON o.orderUserId = u.userId
                 ORDER BY o.orderDate DESC`;

    db.query(sql, (error, results) => {
        if (error) {
            return res.status(500).send('Error generating report');
        }

        if (results.length > 0) {
            let csvContent = 'Username,Product Name,Unit Price,Quantity,Subtotal,Order Date\n';
            let totalRevenue = 0;
            let productSales = {};
            let customerOrders = {};

            results.forEach(row => {
                csvContent += `${row.username},"${row.productName}",${row.productPrice},${row.orderProductQuantity},${row.subtotal},"${new Date(row.orderDate).toLocaleDateString('en-US')}"\n`;

                totalRevenue += row.subtotal;

                // Count sales per product
                if (productSales[row.productName]) {
                    productSales[row.productName] += row.orderProductQuantity;
                } else {
                    productSales[row.productName] = row.orderProductQuantity;
                }

                // Count orders per customer
                if (customerOrders[row.username]) {
                    customerOrders[row.username] += row.orderProductQuantity;
                } else {
                    customerOrders[row.username] = row.orderProductQuantity;
                }
            });

            // Find the most sold product
            let mostSoldProduct = Object.keys(productSales).reduce((a, b) => productSales[a] > productSales[b] ? a : b);

            // Find the top customer
            let topCustomer = Object.keys(customerOrders).reduce((a, b) => customerOrders[a] > customerOrders[b] ? a : b);

            // Add insights at the top of the CSV
            let insights = `Total Revenue,$${totalRevenue}\nMost Sold Product,${mostSoldProduct}\nTop Customer,${topCustomer}\n\n`;
            csvContent = insights + csvContent;

            // Ensure reports directory exists
            const reportsDir = path.join(__dirname, '../public/reports');
            if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir, { recursive: true });
            }

            // Save the file
            const filePath = path.join(reportsDir, 'orders_report.csv');
            fs.writeFileSync(filePath, csvContent);

            // Send the file for download
            res.download(filePath, 'orders_report.csv', err => {
                if (err) {
                    console.error('Error sending file:', err);
                }
            });
        } else {
            res.status(404).send('No orders found to generate a report.');
        }
    });
};
