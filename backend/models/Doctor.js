const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Doctor = sequelize.define('Doctor', {
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
  branch: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Uzmanlık alanı (örn: Kardiyoloji, Nöroloji)'
  },
  hospitalName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  licenseNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Yıl olarak deneyim'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'doctors'
});

module.exports = Doctor;