import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, User, MapPin, Search, Filter } from 'lucide-react';
import api from '../../services/api';
import NewAppointmentModal from '../../components/patient/NewAppointmentModal';

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await api.get('/appointments/my-appointments');
            if (response.data.success) {
                setAppointments(response.data.data);
            }
        } catch (error) {
            console.error('Randevular yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-700';
            case 'confirmed': return 'bg-green-100 text-green-700';
            case 'completed': return 'bg-gray-100 text-gray-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'scheduled': return 'Planlandı';
            case 'confirmed': return 'Onaylandı';
            case 'completed': return 'Tamamlandı';
            case 'cancelled': return 'İptal Edildi';
            default: return status;
        }
    };

    const filteredAppointments = filterStatus === 'all'
        ? appointments
        : appointments.filter(apt => apt.status === filterStatus);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Randevularım</h1>
                    <p className="text-gray-500">Geçmiş ve gelecek randevularınızı yönetin</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                >
                    <Plus size={20} />
                    <span>Yeni Randevu</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['all', 'scheduled', 'completed', 'cancelled'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === status
                                ? 'bg-primary text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-slate-200'
                            }`}
                    >
                        {status === 'all' ? 'Tümü' : getStatusText(status)}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Randevu Bulunamadı</h3>
                    <p className="text-gray-500">Henüz oluşturulmuş bir randevunuz bulunmuyor.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAppointments.map((apt) => (
                        <div key={apt.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{apt.doctor?.full_name}</h3>
                                        <p className="text-sm text-gray-500">{apt.doctor?.branch}</p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                                    {getStatusText(apt.status)}
                                </span>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar size={16} className="text-gray-400" />
                                    <span>{new Date(apt.appointment_date).toLocaleDateString('tr-TR')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock size={16} className="text-gray-400" />
                                    <span>{new Date(apt.appointment_date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin size={16} className="text-gray-400" />
                                    <span>{apt.doctor?.hospital_name}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <p className="text-sm text-gray-500 line-clamp-2">
                                    <span className="font-medium text-gray-700">Şikayet:</span> {apt.reason}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <NewAppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchAppointments}
            />
        </div>
    );
};

export default Appointments;
