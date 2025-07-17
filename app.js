const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const flash = require('connect-flash');
const session = require('express-session');
const app = express();
const categoryController = require('./controllers/categoryController');
const productController = require('./controllers/productController');
const reviewController = require('./controllers/reviewController');
const cartController = require('./controllers/cartController');
const userController = require('./controllers/userController');
const orderController = require('./controllers/orderController');
const paypalController = require('./controllers/paypalController');
const reportController = require('./controllers/reportController');

// Import middleware
const { checkAuthenticated, checkAdmin, checkUser } = require('./middleware/auth');
const { validateRegistration, validateLogin } = require('./middleware/validation');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Set up view engine
app.set('view engine', 'ejs');
//  enable static files
app.use(express.static('public'));
// enable form processing
app.use(express.urlencoded({
    extended: false
}));

//Code for Session Middleware  
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    // Session expires after 1 week of inactivity
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

//This middleware assigns the current session object (req.session) to res.locals.session, making session data accessible within your view templates. 
//This approach is particularly useful when using templating engines like EJS, as it allows you to reference session variables directly in your templates.
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Use connect-flash middleware
app.use(flash()); // Use flash middleware after session middleware

// app.js (add this before your routes)
app.use((req, res, next) => {
    res.locals.sessionUser = req.session.user; // Now available in all templates
    next();
  });

// Define routes here
app.get('/', (req, res) => {

    let loggedIn = false;
    if (req.session.user) {
        loggedIn = true;
    }
    res.render('index', { loggedIn });
});


//Category routes
app.get('/categories', categoryController.getCategories);
app.get('/category/:id', categoryController.getCategory);
app.get('/addCategory', checkAdmin, categoryController.addCategoryForm);
app.post('/addCategory', checkAdmin, upload.single('categoryImage'), categoryController.addCategory);
app.get('/editCategory/:id', checkAdmin, categoryController.editCategoryForm);
app.post('/editCategory/:id', checkAdmin, upload.single('categoryImage'), categoryController.editCategory);
app.get('/deleteCategory/:id', checkAdmin, categoryController.deleteCategory);

//Product routes
app.get('/products', productController.getProducts);
app.get('/category/:id/products', productController.getProductsByCategory);
app.get('/product/:id', productController.getProduct);
app.get('/addProduct', checkAdmin, productController.addProductForm);
app.post('/addProduct', checkAdmin, upload.single('productImage'), productController.addProduct);
app.get('/editProduct/:id', checkAdmin, productController.editProductForm);
app.post('/editProduct/:id', checkAdmin, upload.single('productImage'), productController.editProduct);
app.get('/deleteProduct/:id', checkAdmin, productController.deleteProduct);


//Review routes
app.get('/reviews', reviewController.getReviews);
app.get('/product/:id/reviews', reviewController.getProductReviews);
app.get('/review/:id', reviewController.getReview);
app.get('/addReview/:id', checkAuthenticated, reviewController.addReviewForm);
app.post('/addReview/:id', checkAuthenticated, upload.single('reviewImage'), reviewController.addReview);
app.get('/editReview/:id', checkAuthenticated, reviewController.editReviewForm);
app.post('/editReview/:id', checkAuthenticated, upload.single('reviewImage'), reviewController.editReview);
app.get('/deleteReview/:id', checkAdmin, reviewController.deleteReview);


//Shopping Cart routes
app.get('/cart', [checkAuthenticated, checkUser], cartController.getCart);
app.post('/addToCart/:id', [checkAuthenticated, checkUser], cartController.addToCart);
app.post('/updateCartProduct/:id', [checkAuthenticated, checkUser], cartController.updateCartProduct);
app.get('/removeFromCart/:id', [checkAuthenticated, checkUser], cartController.removeFromCart);
app.get('/checkout', [checkAuthenticated, checkUser], cartController.checkout);

//user
app.get('/login', userController.loginForm);
app.post('/login', validateLogin, userController.login);
app.get('/logout', checkAuthenticated, userController.logout);

app.get('/register', userController.registerForm);
app.post('/register', upload.single('userImage'), validateRegistration, userController.register);

app.get('/users', checkAdmin, userController.getUsers);
app.get('/user/:id', checkAdmin, userController.getUser);
app.get('/editUser/:id', checkAdmin, userController.editUserForm);
app.post('/editUser/:id', checkAdmin, upload.single('userImage'), userController.editUser);
app.get('/deleteUser/:id', checkAdmin, userController.deleteUser);

app.get('/myself', checkAuthenticated, userController.getMyself);
app.get('/editMyself', checkAuthenticated, userController.editMyselfForm);
app.post('/editMyself', checkAuthenticated, upload.single('userImage'), userController.editMyself);

//orders
app.get('/myOrders', checkAuthenticated, orderController.getmyOrders);
app.get('/orders', checkAdmin, orderController.getOrders);



//Paypal Routes
// parse post params sent in body in json format
app.use(express.json());

app.post("/api/orders", paypalController.createOrderHandler);
app.post("/api/orders/:orderID/capture", paypalController.captureOrderHandler);
app.get("/checkout/:paymentMethod/:orderId/:transactionId", cartController.checkout);

// Report generation route
app.get('/generateReport', checkAdmin, reportController.generateReport);


//errors
app.get('/401', (req, res) => {
    res.render('401', { errors: req.flash('error') });
});


//Start express server and bind it to a port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
