const { validationResult } = require('express-validator');
const { LabResult, Patient, Doctor, User } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;

/**
 * Doktor - Yeni tahlil sonucu ekle
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const createLabResult = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validasyon hatası',
        errors: errors.array()
      });
    }

    const {
      patientId,
      testType,
      testName,
      resultSummary,
      detailedResults,
      testDate,
      priority,
      notes,
      isConfidential
    } = req.body;

    // Hasta kontrolü
    const patient = await Patient.findByPk(patientId, {
      include: [{ association: 'user' }]
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Hasta bulunamadı.'
      });
    }

    // Dosya yükleme kontrolü
    let fileData = {};
    if (req.file) {
      fileData = {
        fileUrl: `/uploads/${req.file.filename}`,
        fileName: req.file.originalname
      };
    }

    const labResult = await LabResult.create({
      patientId,
      doctorId: req.doctor.id,
      testType,
      testName,
      resultSummary,
      detailedResults: detailedResults ? JSON.parse(detailedResults) : null,
      testDate: new Date(testDate),
      priority: priority || 'normal',
      notes,
      isConfidential: isConfidential || false,
      status: 'pending',
      ...fileData
    });

    // İlişkili verileri getir
    const fullLabResult = await LabResult.findByPk(labResult.id, {
      include: [
        { association: 'patient', include: [{ association: 'user' }] },
        { association: 'doctor', include: [{ association: 'user' }] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Tahlil sonucu başarıyla eklendi.',
      data: fullLabResult
    });

  } catch (error) {
    console.error('Create lab result error:', error);
    res.status(500).json({
      success: false,
      message: 'Tahlil sonucu eklenirken hata oluştu.',
      error: error.message
    });
  }
};

/**
 * Hasta - Kendi tahlil sonuçlarını getir
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getMyLabResults = async (req, res) => {
  try {
    const { status, testType, startDate, endDate, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {
      patientId: req.patient.id
    };

    // Durum filtresi
    if (status) {
      whereClause.status = status;
    }

    // Test türü filtresi
    if (testType) {
      whereClause.testType = { [Op.like]: `%${testType}%` };
    }

    // Tarih aralığı filtresi
    if (startDate || endDate) {
      whereClause.testDate = {};
      if (startDate) {
        whereClause.testDate[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.testDate[Op.lte] = new Date(endDate);
      }
    }

    const { count, rows: labResults } = await LabResult.findAndCountAll({
      where: whereClause,
      include: [
        {
          association: 'doctor',
          include: [{ association: 'user' }]
        }
      ],
      order: [['testDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Hassas bilgileri filtrele
    const sanitizedResults = labResults.map(result => {
      const resultData = result.toJSON();
      // Eğer sonuç gizli ise ve hasta kendi sonucuna bakmıyorsa, detayları gizle
      if (resultData.isConfidential && resultData.doctor) {
        resultData.detailedResults = null;
        resultData.notes = null;
      }
      return resultData;
    });

    res.status(200).json({
      success: true,
      message: 'Tahlil sonuçları başarıyla getirildi.',
      data: {
        labResults: sanitizedResults,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get my lab results error:', error);
    res.status(500).json({
      success: false,
      message: 'Tahlil sonuçları getirilirken hata oluştu.',
      error: error.message
    });
  }
};

/**
 * Doktor - Tüm tahlil sonuçlarını getir
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getDoctorLabResults = async (req, res) => {
  try {
    const { status, testType, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {
      doctorId: req.doctor.id
    };

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (testType) {
      whereClause.testType = { [Op.like]: `%${testType}%` };
    }

    const { count, rows: labResults } = await LabResult.findAndCountAll({
      where: whereClause,
      include: [
        {
          association: 'patient',
          include: [{ association: 'user' }]
        }
      ],
      order: [['testDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      message: 'Tahlil sonuçları başarıyla getirildi.',
      data: {
        labResults,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get doctor lab results error:', error);
    res.status(500).json({
      success: false,
      message: 'Tahlil sonuçları getirilirken hata oluştu.',
      error: error.message
    });
  }
};

/**
 * Doktor - Bekleyen tahlilleri getir
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getPendingLabResults = async (req, res) => {
  try {
    const { priority, testType, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {
      doctorId: req.doctor.id,
      status: 'pending'
    };

    if (priority) {
      whereClause.priority = priority;
    }

    if (testType) {
      whereClause.testType = { [Op.like]: `%${testType}%` };
    }

    const { count, rows: labResults } = await LabResult.findAndCountAll({
      where: whereClause,
      include: [
        {
          association: 'patient',
          include: [{ association: 'user' }]
        }
      ],
      order: [
        ['priority', 'DESC'],
        ['testDate', 'ASC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      message: 'Bekleyen tahliller başarıyla getirildi.',
      data: {
        labResults,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get pending lab results error:', error);
    res.status(500).json({
      success: false,
      message: 'Bekleyen tahliller getirilirken hata oluştu.',
      error: error.message
    });
  }
};

/**
 * Doktor - Tahlil sonucunu güncelle
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const updateLabResult = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validasyon hatası',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const labResult = await LabResult.findByPk(id);

    if (!labResult) {
      return res.status(404).json({
        success: false,
        message: 'Tahlil sonucu bulunamadı.'
      });
    }

    // Sadece kendi tahlillerini güncelleyebilir
    if (labResult.doctorId !== req.doctor.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu tahlil sonucunu güncelleme yetkiniz yok.'
      });
    }

    // Dosya güncelleme kontrolü
    if (req.file) {
      // Eski dosyayı sil
      if (labResult.fileUrl) {
        try {
          const filePath = path.join(__dirname, '..', labResult.fileUrl);
          await fs.unlink(filePath);
        } catch (error) {
          console.warn('Eski dosya silinemedi:', error.message);
        }
      }

      updateData.fileUrl = `/uploads/${req.file.filename}`;
      updateData.fileName = req.file.originalname;
    }

    // JSON alanını parse et
    if (updateData.detailedResults) {
      updateData.detailedResults = JSON.parse(updateData.detailedResults);
    }

    await labResult.update(updateData);

    // Güncellenmiş veriyi getir
    const updatedLabResult = await LabResult.findByPk(id, {
      include: [
        { association: 'patient', include: [{ association: 'user' }] },
        { association: 'doctor', include: [{ association: 'user' }] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Tahlil sonucu başarıyla güncellendi.',
      data: updatedLabResult
    });

  } catch (error) {
    console.error('Update lab result error:', error);
    res.status(500).json({
      success: false,
      message: 'Tahlil sonucu güncellenirken hata oluştu.',
      error: error.message
    });
  }
};

/**
 * Tahlil sonucu detayını getir
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getLabResultById = async (req, res) => {
  try {
    const { id } = req.params;

    const labResult = await LabResult.findByPk(id, {
      include: [
        { association: 'patient', include: [{ association: 'user' }] },
        { association: 'doctor', include: [{ association: 'user' }] }
      ]
    });

    if (!labResult) {
      return res.status(404).json({
        success: false,
        message: 'Tahlil sonucu bulunamadı.'
      });
    }

    // Yetki kontrolü
    const canAccess =
      (req.user.role === 'doctor' && labResult.doctorId === req.doctor?.id) ||
      (req.user.role === 'patient' && labResult.patientId === req.patient?.id);

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Bu tahlil sonucuna erişim yetkiniz yok.'
      });
    }

    const resultData = labResult.toJSON();

    // Gizli sonuç kontrolü
    if (resultData.isConfidential && req.user.role === 'patient') {
      resultData.detailedResults = null;
      resultData.notes = null;
    }

    res.status(200).json({
      success: true,
      message: 'Tahlil sonucu başarıyla getirildi.',
      data: resultData
    });

  } catch (error) {
    console.error('Get lab result by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Tahlil sonucu getirilirken hata oluştu.',
      error: error.message
    });
  }
};

/**
 * Tahlil sonucunu sil (Sadece doktoor)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const deleteLabResult = async (req, res) => {
  try {
    const { id } = req.params;

    const labResult = await LabResult.findByPk(id);

    if (!labResult) {
      return res.status(404).json({
        success: false,
        message: 'Tahlil sonucu bulunamadı.'
      });
    }

    // Sadece kendi tahlillerini silebilir
    if (labResult.doctorId !== req.doctor.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu tahlil sonucunu silme yetkiniz yok.'
      });
    }

    // Dosyayı sil
    if (labResult.fileUrl) {
      try {
        const filePath = path.join(__dirname, '..', labResult.fileUrl);
        await fs.unlink(filePath);
      } catch (error) {
        console.warn('Dosya silinemedi:', error.message);
      }
    }

    await labResult.destroy();

    res.status(200).json({
      success: true,
      message: 'Tahlil sonucu başarıyla silindi.'
    });

  } catch (error) {
    console.error('Delete lab result error:', error);
    res.status(500).json({
      success: false,
      message: 'Tahlil sonucu silinirken hata oluştu.',
      error: error.message
    });
  }
};

module.exports = {
  createLabResult,
  getMyLabResults,
  getDoctorLabResults,
  getPendingLabResults,
  updateLabResult,
  getLabResultById,
  deleteLabResult
};