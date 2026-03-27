const express = require('express');
const { body } = require('express-validator');
const {
  getProfile,
  updateProfile,
  getDashboardStats,
  changePassword,
  getDoctorPatients
} = require('../controllers/userController');
const {
  authenticateToken,
  requireDoctor,
  requirePatient
} = require('../middleware/auth');

const router = express.Router();

// Tüm rotalar için authentication gerekli
router.use(authenticateToken);

/**
 * @route   GET /api/user/profile
 * @desc    Kullanıcı profil bilgilerini getir
 * @access  Private
 */
router.get('/profile', getProfile);

/**
 * @route   PUT /api/user/profile
 * @desc    Kullanıcı profil bilgilerini güncelle
 * @access  Private
 */
router.put('/profile', [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Geçerli bir e-posta adresi giriniz.')
    .normalizeEmail(),

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter olmalıdır.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir.'),

  // Doctor-specific validation
  body('branch')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Branş alanı 2-255 karakter arasında olmalıdır.'),

  body('hospitalName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Hastane adı 2-255 karakter arasında olmalıdır.'),

  body('phone')
    .optional()
    .trim()
    .isMobilePhone('tr-TR')
    .withMessage('Geçerli bir telefon numarası giriniz.'),

  // Patient-specific validation
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Ad Soyad en az 2, en fazla 255 karakter olmalıdır.'),

  body('tcNo')
    .optional()
    .trim()
    .isLength({ min: 11, max: 11 })
    .withMessage('TC Kimlik No 11 haneli olmalıdır.')
    .isNumeric()
    .withMessage('TC Kimlik No sadece rakamlardan oluşmalıdır.'),

  body('birthDate')
    .optional()
    .isISO8601()
    .withMessage('Geçerli bir doğum tarihi giriniz.')
    .toDate(),

  body('bloodType')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'])
    .withMessage('Geçerli bir kan grubu seçiniz.'),

  body('height')
    .optional()
    .isFloat({ min: 100, max: 250 })
    .withMessage('Boy 100-250 cm arasında olmalıdır.'),

  body('weight')
    .optional()
    .isFloat({ min: 30, max: 200 })
    .withMessage('Kilo 30-200 kg arasında olmalıdır.'),

  body('gender')
    .optional()
    .isIn(['male', 'female'])
    .withMessage('Cinsiyet erkek veya kadın olmalıdır.')
], updateProfile);

/**
 * @route   GET /api/user/dashboard
 * @desc    Dashboard istatistiklerini getir
 * @access  Private
 */
router.get('/dashboard', getDashboardStats);

/**
 * @route   PUT /api/user/change-password
 * @desc    Şifre değiştir
 * @access  Private
 */
router.put('/change-password', [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mevcut şifre alanı boş olamaz.'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Yeni şifre en az 6 karakter olmalıdır.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Yeni şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir.')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('Yeni şifre mevcut şifre ile aynı olamaz.');
      }
      return true;
    })
], changePassword);

/**
 * @route   GET /api/user/my-patients
 * @desc    Doktorun hasta listesini getir
 * @access  Private (Doctor)
 */
router.get('/my-patients', requireDoctor, getDoctorPatients);

/**
 * @route   DELETE /api/user/account
 * @desc    Hesabı sil (Soft delete - deaktif et)
 * @access  Private
 */
router.delete('/account', async (req, res) => {
  try {
    const user = req.user;

    // Hesabı deaktif et (soft delete)
    await user.update({ isActive: false });

    res.status(200).json({
      success: true,
      message: 'Hesabınız başarıyla deaktif edildi.'
    });

  } catch (error) {
    console.error('Account deactivation error:', error);
    res.status(500).json({
      success: false,
      message: 'Hesap deaktif edilirken hata oluştu.',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/user/reactivate
 * @desc    Hesabı yeniden aktif et
 * @access  Private
 */
router.post('/reactivate', async (req, res) => {
  try {
    const user = req.user;

    // Hesabı yeniden aktif et
    await user.update({ isActive: true });

    res.status(200).json({
      success: true,
      message: 'Hesabınız başarıyla aktif edildi.'
    });

  } catch (error) {
    console.error('Account reactivation error:', error);
    res.status(500).json({
      success: false,
      message: 'Hesap aktif edilirken hata oluştu.',
      error: error.message
    });
  }
});

module.exports = router;