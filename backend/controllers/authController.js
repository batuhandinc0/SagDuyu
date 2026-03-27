const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Doctor, Patient } = require('../models');
const { sequelize } = require('../models');

/**
 * Kullanıcı kaydı
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const register = async (req, res) => {
  try {
    // Validation kontrolü
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validasyon hatası',
        errors: errors.array()
      });
    }

    const { email, password, role, fullName, branch, hospitalName, phone, tcNo, birthDate, bloodType, height, weight, gender } = req.body;

    // Transaction başlat - veri tutarlılığı için
    const transaction = await sequelize.transaction();

    try {
      // E-posta kontrolü
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Bu e-posta adresi zaten kullanımda.'
        });
      }

      // TC No kontrolü (sadece hasta için)
      if (role === 'patient') {
        const existingTc = await Patient.findOne({ where: { tcNo } });
        if (existingTc) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: 'Bu TC Kimlik No zaten kayıtlı.'
          });
        }
      }

      // Kullanıcı oluştur
      const user = await User.create({
        email,
        password,
        role
      }, { transaction });

      // Role göre profil oluştur
      if (role === 'doctor') {
        await Doctor.create({
          userId: user.id,
          fullName,
          branch,
          hospitalName,
          phone
        }, { transaction });
      } else if (role === 'patient') {
        await Patient.create({
          userId: user.id,
          fullName,
          tcNo,
          birthDate,
          bloodType,
          height,
          weight,
          gender
        }, { transaction });
      }

      await transaction.commit();

      // Başarılı yanıt
      res.status(201).json({
        success: true,
        message: 'Kullanıcı başarıyla kaydedildi.',
        data: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu.',
      error: error.message
    });
  }
};

/**
 * Kullanıcı girişi
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const login = async (req, res) => {
  try {
    // Validation kontrolü
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validasyon hatası',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Kullanıcıyı bul (profil ile birlikte)
    const user = await User.findOne({
      where: { email },
      include: [
        { association: 'doctorProfile' },
        { association: 'patientProfile' }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'E-posta veya şifre hatalı.'
      });
    }

    // Şifre kontrolü
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'E-posta veya şifre hatalı.'
      });
    }

    // Hesap aktiflik kontrolü
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız devre dışı. Lütfen yöneticilerle iletişime geçin.'
      });
    }

    // Son giriş tarihini güncelle
    await user.update({ lastLogin: new Date() });

    // JWT token oluştur
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Yanıt verisi hazırla
    const responseData = {
      id: user.id,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin
    };

    // Role göre profil bilgilerini ekle
    if (user.role === 'doctor' && user.doctorProfile) {
      responseData.profile = {
        fullName: user.doctorProfile.fullName,
        branch: user.doctorProfile.branch,
        hospitalName: user.doctorProfile.hospitalName,
        phone: user.doctorProfile.phone,
        isVerified: user.doctorProfile.isVerified
      };
    } else if (user.role === 'patient' && user.patientProfile) {
      responseData.profile = {
        fullName: user.patientProfile.fullName,
        tcNo: user.patientProfile.tcNo,
        birthDate: user.patientProfile.birthDate,
        bloodType: user.patientProfile.bloodType,
        height: user.patientProfile.height,
        weight: user.patientProfile.weight,
        gender: user.patientProfile.gender
      };
    }

    res.status(200).json({
      success: true,
      message: 'Giriş başarılı.',
      data: {
        user: responseData,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu.',
      error: error.message
    });
  }
};

/**
 * Token yenileme
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const refreshToken = async (req, res) => {
  try {
    const { authenticateToken } = require('../middleware/auth');
    
    // Mevcut token'ı doğrula
    authenticateToken(req, res, async () => {
      // Yeni token oluştur
      const newToken = jwt.sign(
        { userId: req.user.id, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(200).json({
        success: true,
        message: 'Token başarıyla yenilendi.',
        data: {
          token: newToken
        }
      });
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Token yenileme hatası.',
      error: error.message
    });
  }
};

/**
 * Get current user information
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getCurrentUser = async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Get user with profile information
    const user = await User.findOne({
      where: { id: userId },
      include: [
        { association: 'doctorProfile' },
        { association: 'patientProfile' }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }

    // Prepare response data
    const responseData = {
      id: user.id,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin
    };

    // Add profile information based on role
    if (user.role === 'doctor' && user.doctorProfile) {
      responseData.profile = {
        fullName: user.doctorProfile.fullName,
        branch: user.doctorProfile.branch,
        hospitalName: user.doctorProfile.hospitalName,
        phone: user.doctorProfile.phone,
        isVerified: user.doctorProfile.isVerified
      };
    } else if (user.role === 'patient' && user.patientProfile) {
      responseData.profile = {
        fullName: user.patientProfile.fullName,
        tcNo: user.patientProfile.tcNo,
        birthDate: user.patientProfile.birthDate,
        bloodType: user.patientProfile.bloodType,
        height: user.patientProfile.height,
        weight: user.patientProfile.weight,
        gender: user.patientProfile.gender
      };
    }

    res.status(200).json({
      success: true,
      message: 'Kullanıcı bilgileri başarıyla getirildi.',
      data: responseData
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu.',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getCurrentUser
};