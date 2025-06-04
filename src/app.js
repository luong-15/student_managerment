const express = require('express');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
const studentRoutes = require('./routes/studentRoutes');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const authController = require('./controllers/authController');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.css')) {
            res.set('Content-Type', 'text/css');
        }
    }
}));

app.use((err, req, res, next) => {
    console.error('Static file error:', err);
    next(err);
});

app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(authController.checkAuthToken);

const authMiddleware = (req, res, next) => {
    if (req.path.startsWith('/auth/login') || req.path.startsWith('/auth/register')) {
        return next();
    }
    
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }
    next();
};

app.use(authMiddleware);

app.use('/auth', authRoutes);
app.use('/api', authRoutes);

app.use('/', studentRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Not Found'
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}).on('error', (err) => {
    console.error('Server failed to start:', err);
    process.exit(1);
});