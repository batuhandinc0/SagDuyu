const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  tcNo: {
    type: DataTypes.STRING(11),
    allowNull: false,
    unique: true,
    validate: {
      len: [11, 11],
      isNumeric: true
    }
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  bloodType: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'),
    allowNull: false
  },
  height: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Boy (cm)'
  },
  weight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Kilo (kg)'
  },
  gender: {
    type: DataTypes.ENUM('male', 'female'),
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  emergencyContact: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Acil durum kişisi'
  },
  emergencyPhone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  allergies: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Alerjiler'
  },
  chronicDiseases: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Kronik hastalıklar'
  }
}, {
  tableName: 'patients'
});

module.exports = Patient;