const express = require('express');
const { body } = require('express-validator');
const { register, login, refreshToken, getCurrentUser } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Yeni kullanıcı kaydı
 * @access  Public
 */
router.post('/register', [
  // Email validation
  body('email')
    .isEmail()
    .withMessage('Geçerli bir e-posta adresi giriniz.')
    .normalizeEmail(),
  
  // Password validation
  body('password')
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter olmalıdır.'),
  
  // Role validation
  body('role')
    .isIn(['doctor', 'patient'])
    .withMessage('Rol doktor veya hasta olmalıdır.'),
  
  // Full name validation (for both roles)
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Ad Soyad en az 2, en fazla 255 karakter olmalıdır.'),
  
  // Doctor-specific validations
  body('branch')
    .if(body('role').equals('doctor'))
    .trim()
    .notEmpty()
    .withMessage('Branş alanı zorunludur.'),
  
  body('hospitalName')
    .if(body('role').equals('doctor'))
    .trim()
    .notEmpty()
    .withMessage('Hastane adı zorunludur.'),
  
  body('phone')
    .if(body('role').equals('doctor'))
    .trim()
    .optional()
    .isLength({ min: 10, max: 11 })
    .withMessage('Telefon numarası 10-11 haneli olmalıdır.'),
  
  // Patient-specific validations
  body('tcNo')
    .if(body('role').equals('patient'))
    .trim()
    .isLength({ min: 11, max: 11 })
    .withMessage('TC Kimlik No 11 haneli olmalıdır.')
    .isNumeric()
    .withMessage('TC Kimlik No sadece rakamlardan oluşmalıdır.'),
  
  body('birthDate')
    .if(body('role').equals('patient'))
    .isISO8601()
    .withMessage('Geçerli bir doğum tarihi giriniz.')
    .toDate(),
  
  body('bloodType')
    .if(body('role').equals('patient'))
    .optional({ nullable: true })
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-', ''])
    .withMessage('Geçerli bir kan grubu seçiniz.'),
  
  body('height')
    .if(body('role').equals('patient'))
    .optional({ nullable: true })
    .isFloat({ min: 100, max: 250 })
    .withMessage('Boy 100-250 cm arasında olmalıdır.'),
  
  body('weight')
    .if(body('role').equals('patient'))
    .optional({ nullable: true })
    .isFloat({ min: 30, max: 200 })
    .withMessage('Kilo 30-200 kg arasında olmalıdır.'),
  
  body('gender')
    .if(body('role').equals('patient'))
    .isIn(['male', 'female'])
    .withMessage('Cinsiyet erkek veya kadın olmalıdır.')
], register);

/**
 * @route   POST /api/auth/login
 * @desc    Kullanıcı girişi
 * @access  Public
 */
router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('Geçerli bir e-posta adresi giriniz.')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Şifre alanı boş olamaz.')
], login);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Token yenileme
 * @access  Private
 */
router.post('/refresh-token', authenticateToken, refreshToken);

/**
 * @route   GET /api/auth/me
 * @desc    Mevcut kullanıcı bilgilerini getir
 * @access  Private
 */
router.get('/me', authenticateToken, getCurrentUser);

module.exports = router;