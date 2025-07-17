const db = require('../db');

exports.getReviews = (req, res) => {
    const sql = `SELECT reviewId, reviewContent, reviewRating, reviewImage, reviewedByUserId, u.username, p.productName, p.productImage 
                FROM reviews r, products p, users u
                WHERE r.productId = p.productId
                AND r.reviewedByUserId = u.userId`;
    // Fetch data from MySQL
    db.query(sql, (error, results) => {
        if (error) {
            return res.status(500).send('Error retrieving reviews');
        }

        if (results.length > 0) {
            console.log('All reviews:', results[0].reviewContent);
            res.render('viewAllReviews', { reviews: results });
        } else {
            // If no review with the given ID was found, 
            //render a 404 page or handle it accordingly
            res.status(404).send('No reviews');
        }
    });
};


exports.getProductReviews = (req, res) => {
    const productId = req.params.id;
    const sql = `SELECT reviewId, reviewContent, reviewRating, reviewImage, reviewedByUserId, u.username, p.productDescription, p.productName, p.productImage 
                FROM reviews r, products p , users u
                WHERE r.productId = p.productId 
                AND r.reviewedByUserId = u.userId 
                AND p.productId = ?`;
    // Fetch data from MySQL
    db.query(sql, [productId], (error, results) => {
        if (error) {
            return res.status(500).send('Error retrieving reviews');
        }

        if (results.length > 0) {
            console.log('All reviews:', results[0].reviewContent);
            res.render('viewProductReviews', { reviews: results });
        } else {
            // If no review with the given ID was found, 
            //render a 404 page or handle it accordingly
            res.status(404).send('No reviews');
        }
    });
};


exports.getReview = (req, res) => {
    const reviewId = req.params.id;
    const sql = `SELECT reviewId, reviewContent, reviewRating, reviewImage, reviewedByUserId, u.username, p.productName, p.productImage  
                FROM reviews r, products p , users u
                WHERE r.reviewId = ? 
                AND r.reviewedByUserId = u.userId 
                AND r.productID = p.productID`;
    // Fetch data from MySQL
    db.query(sql, [reviewId], (error, results) => {

        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving review by ID');
        }

        // Check if any review with the given ID was found
        if (results.length > 0) {
            console.log(results[0])
            // Render HTML page with the category data
            res.render('viewReview', { review: results[0] });
        } else {
            // If no review with the given ID was found, 
            //render a 404 page or handle it accordingly
            res.status(404).send('Review not found');
        }
    });
};

exports.addReviewForm = (req, res) => {
    const productId = req.params.id;
    const sql = 'SELECT * FROM products WHERE productId = ?';
    // Fetch data from MySQL
    db.query(sql, [productId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving product');
        }

        if (results.length > 0) {
            console.log('AProduct', results[0]);
            res.render('addReview', { product: results[0] });
            // res.render('viewAllCategories', { categories: results });
        } else {
            // If no review with the given ID was found, 
            //render a 404 page or handle it accordingly
            res.status(404).send('No Reviews');
        }
    });



};


exports.addReview = (req, res) => {
    const productId = req.params.id;
    console.log(productId)
    const { reviewContent, reviewRating } = req.body;
    const reviewedBy = req.session.user.userId;
    let reviewImage;
    if (req.file) {
        reviewImage = req.file.filename; // Save only the filename
    } else {
        reviewImage = null;
    }

    const sql = 'INSERT INTO reviews (reviewContent, reviewRating, reviewImage, reviewedByUserId, productId) VALUES (?, ?, ?, ?, ?)';

    // Insert the new review into the database
    db.query(sql, [reviewContent, reviewRating, reviewImage, reviewedBy, productId], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error adding review:", error);
            res.status(500).send('Error adding Review');
        } else {
            // Send a success response
            res.redirect('/product/' + productId + '/reviews');
        }
    });
};

//edit review form 
exports.editReviewForm = (req, res) => {
    const reviewId = req.params.id;
    console.log("review id: " + reviewId)
    // Once categories are fetched, fetch the review by ID
    const sql = 'SELECT reviewId, reviewContent, reviewRating, reviewImage, reviewedByUserId, p.productId, p.productName, p.productImage, p.productPrice  FROM reviews r, products p WHERE r.reviewId = ? AND r.productID = p.productID';
    db.query(sql, [reviewId], (reviewError, results) => {
        if (reviewError) {
            console.error('Database query error:', reviewError.message);
            return res.status(500).send('Error retrieving review by ID');
        }

        // Check if any review with the given ID was found
        if (results.length > 0) {
            // Render HTML page with the review and categories data
            res.render('editReview', { review: results[0] });
        } else {
            // If no review with the given ID was found, handle accordingly
            res.status(404).send('Review not found');
        }
    });
};


//edit review form processing
exports.editReview = (req, res) => {

    const reviewId = req.params.id;
    const { reviewContent, reviewRating } = req.body;
    let reviewImage = req.body.currentReviewImage; //retrieve current image filename
    if (req.file) { //if new image is uploaded
        reviewImage = req.file.filename; // set image to be new image filename
    }
    console.log("new file: " + reviewImage);
    const sql = 'UPDATE reviews SET reviewContent = ? , reviewRating = ?, reviewImage = ?  WHERE reviewId = ?';

    // Update the review into the database
    db.query(sql, [reviewContent, reviewRating, reviewImage, reviewId], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error updating review:", error);
            res.status(500).send('Error updating review');
        } else {
            // Send a success response
            res.redirect('/reviews');
        }
    });

};

//delete review
exports.deleteReview = (req, res) => {
    const reviewId = req.params.id;
    const sql = 'DELETE FROM reviews WHERE reviewId = ?';
    db.query(sql, [reviewId], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error deleting review:", error);
            res.status(500).send('Error deleting review');
        } else {
            // Send a success response
            res.redirect('/reviews');
        }
    });
}