const sequelize = require('../config/db.config');
const User = require('./User');
const Doctor = require('./Doctor');
const Patient = require('./Patient');
const LabResult = require('./LabResult');
const Appointment = require('./Appointment');

// Define associations
User.hasOne(Doctor, { foreignKey: 'userId', as: 'doctorProfile' });
Doctor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Patient, { foreignKey: 'userId', as: 'patientProfile' });
Patient.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Doctor - Patient (many-to-many through appointments)
Doctor.belongsToMany(Patient, { 
  through: Appointment, 
  foreignKey: 'doctorId', 
  otherKey: 'patientId',
  as: 'patients' 
});
Patient.belongsToMany(Doctor, { 
  through: Appointment, 
  foreignKey: 'patientId', 
  otherKey: 'doctorId',
  as: 'doctors' 
});

// Lab Results associations
Doctor.hasMany(LabResult, { foreignKey: 'doctorId', as: 'labResults' });
LabResult.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

Patient.hasMany(LabResult, { foreignKey: 'patientId', as: 'labResults' });
LabResult.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

// Appointment associations
Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: 'appointments' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

Patient.hasMany(Appointment, { foreignKey: 'patientId', as: 'appointments' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

const db = {
  sequelize,
  User,
  Doctor,
  Patient,
  LabResult,
  Appointment
};

module.exports = db;