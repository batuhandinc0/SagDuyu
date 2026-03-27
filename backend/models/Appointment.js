const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Appointment = sequelize.define('Appointment', {
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
  appointmentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Randevu tarihi ve saati'
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    comment: 'Randevu süresi (dakika)'
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'),
    defaultValue: 'scheduled',
    comment: 'Randevu durumu'
  },
  appointmentType: {
    type: DataTypes.ENUM('consultation', 'follow_up', 'emergency', 'lab_follow_up'),
    allowNull: false,
    comment: 'Randevu türü'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Randevu sebebi'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Ek notlar'
  },
  prescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reçete bilgileri'
  },
  diagnosis: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Tanı'
  },
  treatment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Tedavi planı'
  },
  followUpRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Takip gerekli mi?'
  },
  followUpDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Takip randevu tarihi'
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'İptal tarihi'
  },
  cancellationReason: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'İptal sebebi'
  }
}, {
  tableName: 'appointments'
});

module.exports = Appointment;