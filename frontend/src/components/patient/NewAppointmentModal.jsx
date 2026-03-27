import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Calendar, Clock, Stethoscope, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const NewAppointmentModal = ({ isOpen, onClose, onSuccess }) => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        doctorId: '',
        date: '',
        time: '',
        reason: '',
        appointmentType: 'consultation'
    });

    useEffect(() => {
        if (isOpen) {
            fetchDoctors();
        }
    }, [isOpen]);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const response = await api.get('/appointments/doctors');
            if (response.data.success) {
                setDoctors(response.data.data);
            }
        } catch (err) {
            setError('Doktor listesi alınamadı.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            // Combine date and time
            const appointmentDate = `${formData.date}T${formData.time}:00`;

            const response = await api.post('/appointments', {
                doctorId: formData.doctorId,
                appointmentDate: appointmentDate,
                reason: formData.reason,
                appointmentType: formData.appointmentType
            });

            if (response.data.success) {
                onSuccess();
                onClose();
                // Reset form
                setFormData({
                    doctorId: '',
                    date: '',
                    time: '',
                    reason: '',
                    appointmentType: 'consultation'
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Randevu oluşturulurken bir hata oluştu.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-slate-100">
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title as="h3" className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Calendar className="text-primary" size={24} />
                                        Yeni Randevu Oluştur
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-500 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Doctor Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Doktor Seçin
                                        </label>
                                        <div className="relative">
                                            <select
                                                required
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none bg-white"
                                                value={formData.doctorId}
                                                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                                            >
                                                <option value="">Doktor Seçiniz...</option>
                                                {doctors.map((doc) => (
                                                    <option key={doc.id} value={doc.id}>
                                                        {doc.full_name} - {doc.branch} ({doc.hospital_name})
                                                    </option>
                                                ))}
                                            </select>
                                            <Stethoscope className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                        </div>
                                    </div>

                                    {/* Date & Time */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tarih
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    required
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                    value={formData.date}
                                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                />
                                                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Saat
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="time"
                                                    required
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                    value={formData.time}
                                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                                />
                                                <Clock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Randevu Türü
                                        </label>
                                        <select
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            value={formData.appointmentType}
                                            onChange={(e) => setFormData({ ...formData, appointmentType: e.target.value })}
                                        >
                                            <option value="consultation">Muayene</option>
                                            <option value="follow_up">Kontrol</option>
                                            <option value="lab_follow_up">Tahlil Sonucu</option>
                                        </select>
                                    </div>

                                    {/* Reason */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Şikayet / Sebep
                                        </label>
                                        <textarea
                                            required
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                            placeholder="Kısaca rahatsızlığınızdan bahsedin..."
                                            value={formData.reason}
                                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        />
                                    </div>

                                    <div className="mt-6 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
                                        >
                                            İptal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? 'Oluşturuluyor...' : 'Randevu Oluştur'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default NewAppointmentModal;
