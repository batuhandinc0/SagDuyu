const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const LabResult = sequelize.define('LabResult', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id'
    }
  },
  testType: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Tahlil türü (örn: Kan Tahlili, İdrar Tahlili)'
  },
  testName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Detaylı test adı'
  },
  resultSummary: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Sonuç özeti'
  },
  detailedResults: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Detaylı test sonuçları (JSON formatında)'
  },
  fileUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'PDF veya resim dosyası yolu'
  },
  fileName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Dosya adı'
  },
  testDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Test yapılma tarihi'
  },
  resultDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Sonuçlanma tarihi'
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'reviewed'),
    defaultValue: 'pending',
    comment: 'Durum: bekliyor, işlemde, tamamlandı, gözden geçirildi'
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal',
    comment: 'Öncelik seviyesi'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Doktor notları'
  },
  isConfidential: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Gizli sonuç'
  }
}, {
  tableName: 'lab_results'
});

module.exports = LabResult;