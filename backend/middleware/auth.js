const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * JWT Token doğrulama middleware'i
 * Authorization header'dan token'ı alır ve doğrular
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Erişim reddedildi. Token bulunamadı.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kullanıcı bilgilerini veritabanından çek
    const user = await User.findByPk(decoded.userId, {
      include: [
        { association: 'doctorProfile' },
        { association: 'patientProfile' }
      ]
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token veya hesap devre dışı.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Geçersiz token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: 'Token süresi dolmuş.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Token doğrulama hatası.',
      error: error.message
    });
  }
};

/**
 * Rol bazlı yetkilendirme middleware'i
 * @param {Array} roles - İzin verilen roller (örn: ['doctor', 'patient'])
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Kimlik doğrulama gerekli.'
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz bulunmuyor.'
      });
    }

    next();
  };
};

/**
 * Doktor kontrolü middleware'i
 */
const requireDoctor = (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({
      success: false,
      message: 'Bu işlem sadece doktorlar için geçerlidir.'
    });
  }

  if (!req.user.doctorProfile) {
    return res.status(400).json({
      success: false,
      message: 'Doktor profili bulunamadı.'
    });
  }

  req.doctor = req.user.doctorProfile;
  next();
};

/**
 * Hasta kontrolü middleware'i
 */
const requirePatient = (req, res, next) => {
  if (req.user.role !== 'patient') {
    return res.status(403).json({
      success: false,
      message: 'Bu işlem sadece hastalar için geçerlidir.'
    });
  }

  if (!req.user.patientProfile) {
    return res.status(400).json({
      success: false,
      message: 'Hasta profili bulunamadı.'
    });
  }

  req.patient = req.user.patientProfile;
  next();
};

module.exports = {
  authenticateToken,
  authorize,
  requireDoctor,
  requirePatient
};