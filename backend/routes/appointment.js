const express = require('express');
const router = express.Router();
const { Appointment, Doctor, Patient, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

// Create a new appointment
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { doctorId, appointmentDate, reason, appointmentType } = req.body;

        // Determine patientId (must be the logged in user's patient profile)
        // Assuming auth middleware populates req.user
        const patient = await Patient.findOne({ where: { userId: req.user.id } });

        if (!patient) {
            return res.status(404).json({ success: false, message: 'Hasta profili bulunamadı.' });
        }

        const appointment = await Appointment.create({
            patientId: patient.id,
            doctorId,
            appointmentDate,
            reason,
            appointmentType: appointmentType || 'consultation',
            status: 'scheduled'
        });

        res.status(201).json({
            success: true,
            data: appointment,
            message: 'Randevu başarıyla oluşturuldu.'
        });
    } catch (error) {
        console.error('Randevu oluşturma hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
});

// Get appointments for the logged-in user
router.get('/my-appointments', authenticateToken, async (req, res) => {
    try {
        // Check if user is patient or doctor
        const userRole = req.user.role;
        let whereClause = {};
        let includeClause = [];

        if (userRole === 'patient') {
            const patient = await Patient.findOne({ where: { userId: req.user.id } });
            if (!patient) return res.status(404).json({ message: 'Hasta bulunamadı' });
            whereClause = { patientId: patient.id };
            includeClause = [{ model: Doctor, as: 'doctor', attributes: ['full_name', 'branch', 'hospital_name'] }];
        } else if (userRole === 'doctor') {
            const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
            if (!doctor) return res.status(404).json({ message: 'Doktor bulunamadı' });
            whereClause = { doctorId: doctor.id };
            includeClause = [{ model: Patient, as: 'patient', attributes: ['full_name', 'tc_no'] }];
        }

        const appointments = await Appointment.findAll({
            where: whereClause,
            include: includeClause,
            order: [['appointment_date', 'DESC']]
        });

        res.json({
            success: true,
            data: appointments
        });
    } catch (error) {
        console.error('Randevu getirme hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
});

// Get list of doctors for dropdown
router.get('/doctors', authenticateToken, async (req, res) => {
    try {
        const doctors = await Doctor.findAll({
            attributes: ['id', 'full_name', 'branch', 'hospital_name']
        });
        res.json({ success: true, data: doctors });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Doktorlar getirilemedi.' });
    }
});

module.exports = router;
