const express = require('express');
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');
const {
  createLabResult,
  getMyLabResults,
  getDoctorLabResults,
  getPendingLabResults,
  updateLabResult,
  getLabResultById,
  deleteLabResult
} = require('../controllers/labController');
const {
  authenticateToken,
  requireDoctor,
  requirePatient
} = require('../middleware/auth');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { LabResult, Patient, User } = require('../models');

const router = express.Router();

// Dosya yükleme konfigürasyonu
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/lab-results/')
  },
  filename: function (req, file, cb) {
    // Benzersiz dosya adı oluştur
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'lab-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Sadece PDF, JPG, JPEG, PNG dosyalarına izin ver
  const allowedTypes = /pdf|jpg|jpeg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Sadece PDF, JPG, JPEG ve PNG dosyalarına izin verilir.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

/**
 * @route   POST /api/labs
 * @desc    Doktor - Yeni tahlil sonucu ekle
 * @access  Private (Doctor only)
 */

/**
 * @route   POST /api/labs/predict/:type
 * @desc    AI Modelini çalıştır ve sonucu kaydet
 * @access  Private (Doctor only)
 */
router.post('/predict/:type',
  authenticateToken,
  requireDoctor,
  upload.single('file'), // Multer will handle file upload for pneumonia
  async (req, res) => {
    try {
      const { type } = req.params;
      const { patientId, inputString } = req.body;

      if (!patientId) {
        return res.status(400).json({ success: false, message: 'Hasta seçimi yapılmadı.' });
      }

      // Verify patient exists
      const patient = await Patient.findByPk(patientId, { include: 'user' });
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Hasta bulunamadı.' });
      }

      let aiResponse;
      let labResultData = {
        patientId,
        doctorId: req.doctor.id,
        testDate: new Date(),
        status: 'reviewed', // Auto-reviewed since doctor is running it
        priority: 'high',
        isConfidential: false
      };

      if (type === 'heart-disease') {
        if (!inputString) return res.status(400).json({ message: 'Veri girişi eksik.' });

        // Call Python Service
        try {
          const response = await axios.post('http://localhost:8000/predict/heart-disease', {
            input_string: inputString
          });
          aiResponse = response.data;
        } catch (err) {
          console.error('Python Service Error:', err.message);
          return res.status(503).json({ success: false, message: 'AI servisine erişilemiyor.' });
        }

        labResultData.testType = 'Kardiyoloji AI Analizi';
        labResultData.testName = 'Kalp Hastalığı Risk Analizi (XGBoost)';
        labResultData.resultSummary = `Tahmin: ${aiResponse.prediction}, Risk Skoru: ${aiResponse.risk_score}`;
        labResultData.detailedResults = aiResponse;

      } else if (type === 'pneumonia') {
        if (!req.file) return res.status(400).json({ message: 'Görüntü yüklenmedi.' });

        // Call Python Service
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path));

        try {
          const response = await axios.post('http://localhost:8000/predict/pneumonia', formData, {
            headers: {
              ...formData.getHeaders()
            }
          });
          aiResponse = response.data;
        } catch (err) {
          console.error('Python Service Error:', err.message);
          return res.status(503).json({ success: false, message: 'AI servisine erişilemiyor.' });
        }

        labResultData.testType = 'Radyoloji AI Analizi';
        labResultData.testName = 'Akciğer Röntgeni Analizi (DenseNet)';
        labResultData.resultSummary = `Tespit: ${aiResponse.prediction}, Güven: ${(aiResponse.confidence * 100).toFixed(1)}%`;
        labResultData.detailedResults = aiResponse;
        labResultData.fileUrl = `/uploads/lab-results/${req.file.filename}`;
        labResultData.fileName = req.file.originalname;

      } else {
        return res.status(400).json({ success: false, message: 'Geçersiz model tipi.' });
      }

      // Save to database
      const labResult = await LabResult.create(labResultData);

      res.status(200).json({
        success: true,
        data: aiResponse,
        labResultId: labResult.id,
        message: 'Analiz tamamlandı ve rapora eklendi.'
      });

    } catch (error) {
      console.error('AI Predict Route Error:', error);
      res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
  }
);

router.post('/',
  authenticateToken,
  requireDoctor,
  upload.single('file'),
  [
    body('patientId')
      .isInt({ min: 1 })
      .withMessage('Geçerli bir hasta ID giriniz.'),

    body('testType')
      .trim()
      .isLength({ min: 2, max: 255 })
      .withMessage('Test türü 2-255 karakter arasında olmalıdır.'),

    body('testName')
      .trim()
      .isLength({ min: 2, max: 255 })
      .withMessage('Test adı 2-255 karakter arasında olmalıdır.'),

    body('resultSummary')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Sonuç özeti 10-2000 karakter arasında olmalıdır.'),

    body('testDate')
      .isISO8601()
      .withMessage('Geçerli bir test tarihi giriniz.')
      .toDate(),

    body('priority')
      .optional()
      .isIn(['low', 'normal', 'high', 'urgent'])
      .withMessage('Geçerli bir öncelik seçiniz.'),

    body('notes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Notlar en fazla 1000 karakter olabilir.'),

    body('detailedResults')
      .optional()
      .isJSON()
      .withMessage('Detaylı sonuçlar JSON formatında olmalıdır.')
  ],
  createLabResult
);

/**
 * @route   GET /api/labs/my-results
 * @desc    Hasta - Kendi tahlil sonuçlarını getir
 * @access  Private (Patient only)
 */
router.get('/my-results', authenticateToken, requirePatient, getMyLabResults);

/**
 * @route   GET /api/labs/pending
 * @desc    Doktor - Bekleyen tahlilleri getir
 * @access  Private (Doctor only)
 */
router.get('/pending', authenticateToken, requireDoctor, getPendingLabResults);

/**
 * @route   GET /api/labs/doctor/all
 * @desc    Doktor - Tüm tahlilleri getir
 * @access  Private (Doctor only)
 */
router.get('/doctor/all', authenticateToken, requireDoctor, getDoctorLabResults);


/**
 * @route   GET /api/labs/:id
 * @desc    Tahlil sonucu detayını getir
 * @access  Private
 */
router.get('/:id',
  authenticateToken,
  getLabResultById
);

/**
 * @route   PUT /api/labs/:id
 * @desc    Doktor - Tahlil sonucunu güncelle
 * @access  Private (Doctor only)
 */
router.put('/:id',
  authenticateToken,
  requireDoctor,
  upload.single('file'),
  [
    body('testType')
      .optional()
      .trim()
      .isLength({ min: 2, max: 255 })
      .withMessage('Test türü 2-255 karakter arasında olmalıdır.'),

    body('testName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 255 })
      .withMessage('Test adı 2-255 karakter arasında olmalıdır.'),

    body('resultSummary')
      .optional()
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Sonuç özeti 10-2000 karakter arasında olmalıdır.'),

    body('testDate')
      .optional()
      .isISO8601()
      .withMessage('Geçerli bir test tarihi giriniz.')
      .toDate(),

    body('status')
      .optional()
      .isIn(['pending', 'in_progress', 'completed', 'reviewed'])
      .withMessage('Geçerli bir durum seçiniz.'),

    body('priority')
      .optional()
      .isIn(['low', 'normal', 'high', 'urgent'])
      .withMessage('Geçerli bir öncelik seçiniz.'),

    body('notes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Notlar en fazla 1000 karakter olabilir.'),

    body('detailedResults')
      .optional()
      .isJSON()
      .withMessage('Detaylı sonuçlar JSON formatında olmalıdır.')
  ],
  updateLabResult
);

/**
 * @route   DELETE /api/labs/:id
 * @desc    Doktor - Tahlil sonucunu sil
 * @access  Private (Doctor only)
 */
router.delete('/:id', authenticateToken, requireDoctor, deleteLabResult);

/**
 * @route   GET /api/labs/patient/:patientId
 * @desc    Doktor - Belirli bir hastanın tahlillerini getir
 * @access  Private (Doctor only)
 */
router.get('/patient/:patientId', authenticateToken, requireDoctor, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status, testType, startDate, endDate, page = 1, limit = 10 } = req.query;

    const { LabResult } = require('../models');
    const { Op } = require('sequelize');

    const offset = (page - 1) * limit;
    const whereClause = {
      patientId: parseInt(patientId),
      doctorId: req.doctor.id
    };

    if (status) {
      whereClause.status = status;
    }

    if (testType) {
      whereClause.testType = { [Op.like]: `%${testType}%` };
    }

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
      message: 'Hasta tahlilleri başarıyla getirildi.',
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
    console.error('Get patient labs error:', error);
    res.status(500).json({
      success: false,
      message: 'Hasta tahlilleri getirilirken hata oluştu.',
      error: error.message
    });
  }
});

module.exports = router;