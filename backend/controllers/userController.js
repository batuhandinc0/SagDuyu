const { validationResult } = require('express-validator');
const { User, Doctor, Patient, LabResult, Appointment, sequelize } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * Kullanıcı profil bilgilerini getir
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
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

    // Profil verilerini hazırla
    const profileData = {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };

    if (user.role === 'doctor' && user.doctorProfile) {
      profileData.profile = {
        ...user.doctorProfile.toJSON(),
        // Hassas bilgileri gizle
        userId: undefined
      };
    } else if (user.role === 'patient' && user.patientProfile) {
      profileData.profile = {
        ...user.patientProfile.toJSON(),
        // Hassas bilgileri gizle
        userId: undefined,
        tcNo: undefined // TC No'yu da gizleyelim, güvenlik için
      };
    }

    res.status(200).json({
      success: true,
      message: 'Profil bilgileri başarıyla getirildi.',
      data: profileData
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Profil bilgileri alınırken hata oluştu.',
      error: error.message
    });
  }
};

/**
 * Profil bilgilerini güncelle
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validasyon hatası',
        errors: errors.array()
      });
    }

    const { email, password, ...profileData } = req.body;
    const user = await User.findByPk(req.user.id, {
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

    const transaction = await sequelize.transaction();

    try {
      // E-posta güncelleniyorsa kontrol et
      if (email && email !== user.email) {
        const existingUser = await User.findOne({
          where: {
            email,
            id: { [Op.ne]: user.id }
          }
        });

        if (existingUser) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: 'Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.'
          });
        }

        await user.update({ email }, { transaction });
      }

      // Şifre güncelleniyorsa hash'le
      if (password) {
        await user.update({ password }, { transaction });
      }

      // Role göre profil güncelle
      if (user.role === 'doctor' && user.doctorProfile) {
        await user.doctorProfile.update(profileData, { transaction });
      } else if (user.role === 'patient' && user.patientProfile) {
        // TC No güncelleniyorsa kontrol et
        if (profileData.tcNo && profileData.tcNo !== user.patientProfile.tcNo) {
          const existingTc = await Patient.findOne({
            where: {
              tcNo: profileData.tcNo,
              id: { [Op.ne]: user.patientProfile.id }
            }
          });

          if (existingTc) {
            await transaction.rollback();
            return res.status(400).json({
              success: false,
              message: 'Bu TC Kimlik No başka bir kullanıcı tarafından kullanılıyor.'
            });
          }
        }

        await user.patientProfile.update(profileData, { transaction });
      }

      await transaction.commit();

      // Güncellenmiş veriyi getir
      const updatedUser = await User.findByPk(user.id, {
        include: [
          { association: 'doctorProfile' },
          { association: 'patientProfile' }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Profil başarıyla güncellendi.',
        data: updatedUser
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Profil güncellenirken hata oluştu.',
      error: error.message
    });
  }
};

/**
 * Dashboard istatistikleri getir
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getDashboardStats = async (req, res) => {
  try {
    const user = req.user;

    if (user.role === 'doctor' && user.doctorProfile) {
      // Doktor için istatistikler
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [totalPatients, todayAppointments, pendingLabs] = await Promise.all([
        Appointment.count({
          where: { doctorId: user.doctorProfile.id }
        }),
        Appointment.count({
          where: {
            doctorId: user.doctorProfile.id,
            appointmentDate: {
              [Op.gte]: today,
              [Op.lt]: tomorrow
            },
            status: { [Op.in]: ['scheduled', 'confirmed'] }
          }
        }),
        LabResult.count({
          where: {
            doctorId: user.doctorProfile.id,
            status: 'pending'
          }
        })
      ]);

      const stats = {
        totalPatients,
        todayAppointments,
        pendingLabs,
        completedAppointments: await Appointment.count({
          where: {
            doctorId: user.doctorProfile.id,
            status: 'completed'
          }
        })
      };

      res.status(200).json({
        success: true,
        message: 'Doktor dashboard istatistikleri başarıyla getirildi.',
        data: stats
      });

    } else if (user.role === 'patient' && user.patientProfile) {
      // Hasta için istatistikler
      const [recentLabs, activeAppointments, totalAppointments] = await Promise.all([
        LabResult.count({
          where: {
            patientId: user.patientProfile.id,
            createdAt: {
              [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Son 30 gün
            }
          }
        }),
        Appointment.count({
          where: {
            patientId: user.patientProfile.id,
            status: { [Op.in]: ['scheduled', 'confirmed'] },
            appointmentDate: { [Op.gte]: new Date() }
          }
        }),
        Appointment.count({
          where: { patientId: user.patientProfile.id }
        })
      ]);

      const stats = {
        recentLabs,
        activeAppointments,
        totalAppointments,
        completedAppointments: await Appointment.count({
          where: {
            patientId: user.patientProfile.id,
            status: 'completed'
          }
        })
      };

      res.status(200).json({
        success: true,
        message: 'Hasta dashboard istatistikleri başarıyla getirildi.',
        data: stats
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Geçersiz kullanıcı rolü veya profil bulunamadı.'
      });
    }

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Dashboard istatistikleri alınırken hata oluştu.',
      error: error.message
    });
  }
};

/**
 * Hesap güvenliği - Şifre değiştir
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validasyon hatası',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }

    // Mevcut şifre kontrolü
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mevcut şifre hatalı.'
      });
    }

    // Yeni şifre eskisinden farklı olmalı
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'Yeni şifre mevcut şifre ile aynı olamaz.'
      });
    }

    await user.update({ password: newPassword });

    res.status(200).json({
      success: true,
      message: 'Şifre başarıyla değiştirildi.'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Şifre değiştirilirken hata oluştu.',
      error: error.message
    });
  }
};

/**
 * Doktorun hastalarını getir
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getDoctorPatients = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'doctor' || !user.doctorProfile) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem sadece doktorlar içindir.'
      });
    }

    // Doktorun randevusu olan hastaları bul (Distinct)
    const appointments = await Appointment.findAll({
      where: { doctorId: user.doctorProfile.id },
      attributes: ['patientId'],
      group: ['patientId']
    });

    const patientIds = appointments.map(a => a.patientId);

    if (patientIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // Hastaların detaylarını getir
    const patients = await Patient.findAll({
      where: { id: { [Op.in]: patientIds } },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['email', 'lastLogin', 'isActive']
        }
      ]
    });

    // Frontend için formatla
    const formattedPatients = patients.map(p => ({
      id: p.id,
      tc: p.tcNo,
      name: p.fullName,
      gender: p.gender === 'male' ? 'Erkek' : 'Kadın',
      phone: p.user ? 'N/A' : 'N/A',
      email: p.user?.email,
      date: p.createdAt.toISOString().split('T')[0],
      status: p.user?.isActive ? 'Aktif' : 'Pasif'
    }));

    res.status(200).json({
      success: true,
      message: 'Hasta listesi getirildi.',
      data: formattedPatients
    });

  } catch (error) {
    console.error('Get doctor patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Hasta listesi alınırken hata oluştu.',
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getDashboardStats,
  changePassword,
  getDoctorPatients
};