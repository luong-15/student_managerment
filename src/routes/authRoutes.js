const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

router.use(authController.checkAuthToken);
router.get('/login', authController.getLoginPage);
router.post('/login', authController.login);
router.get('/register', authController.getRegisterPage);
router.post('/register', authController.register);
router.get('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.get('/profile', isAuthenticated, authController.getProfile);
router.post('/profile/update', isAuthenticated, authController.updateProfile);
router.post('/profile/change-password', isAuthenticated, authController.changePassword);
router.post('/profile/update-avatar', isAuthenticated, authController.updateAvatar);
router.get('/information/:id', isAuthenticated, authController.getStudentInformation);
router.put('/update-information/:id', isAuthenticated, authController.updateStudent);
router.post('/create-students', isAuthenticated, authController.createStudent);

module.exports = router;
