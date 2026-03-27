import { useState, useEffect } from 'react';
import { TestTube, Calendar, Clock, CheckCircle } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PatientHome = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        recentLabs: 0,
        activeAppointments: 0,
        totalAppointments: 0,
        completedAppointments: 0
    });
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const statRes = await api.get('/user/dashboard');
                if (statRes.data.success) {
                    setStats(statRes.data.data);
                }

                const aptRes = await api.get('/appointments/my-appointments');
                if (aptRes.data.success) {
                    const now = new Date();
                    const upcomings = aptRes.data.data.filter(apt => new Date(apt.appointmentDate) >= now && apt.status !== 'cancelled');
                    upcomings.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
                    
                    const formattedApts = upcomings.slice(0, 5).map(apt => ({
                        id: apt.id,
                        doctor: apt.doctor?.full_name || 'Bilinmeyen Doktor',
                        time: new Date(apt.appointmentDate).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
                        type: apt.appointmentType === 'consultation' ? 'Konsültasyon' : 'Kontrol',
                        status: apt.status === 'completed' ? 'Tamamlandı' : apt.status === 'scheduled' ? 'Bekliyor' : apt.status,
                        statusColor: apt.status === 'scheduled' ? 'bg-primary/10 text-primary' : 'bg-green-100 text-green-700'
                    }));
                    setUpcomingAppointments(formattedApts);
                }
            } catch (err) {
                console.error("Dashboard error:", err);
            }
        };

        fetchDashboardData();
    }, []);

    const patientName = user?.patientProfile?.fullName || 'Sayın Hasta';

    return (
        <div className="p-6 lg:p-8">
            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-text-main">Merhaba, {patientName}</h1>
                <p className="mt-2 text-lg text-text-secondary">Sağlık durumunuzun genel özeti</p>
            </div>

            <div className="grid grid-cols-1 gap-8 mb-10 md:grid-cols-3">
                <StatCard
                    icon={<Calendar size={24} />}
                    value={stats.activeAppointments.toString()}
                    label="Aktif Randevular"
                    bgClass="status-success"
                    colorClass="text-success-text"
                />
                <StatCard
                    icon={<TestTube size={24} />}
                    value={stats.recentLabs.toString()}
                    label="Son Tahliller"
                    bgClass="status-warning"
                    colorClass="text-warning-text"
                />
                <StatCard
                    icon={<CheckCircle size={24} />}
                    value={stats.completedAppointments.toString()}
                    label="Tamamlanan Randevular"
                    bgClass="status-info"
                    colorClass="text-info-text"
                />
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Upcoming Appointments */}
                <div className="card-modern">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-text-main">Yaklaşan Randevularım</h3>
                    </div>
                    <div className="space-y-1">
                        {upcomingAppointments.length > 0 ? (
                            upcomingAppointments.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 border border-transparent transition-all rounded-xl hover:bg-slate-50 hover:border-slate-100">
                                    <div>
                                        <h4 className="font-bold text-text-main">{item.doctor}</h4>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
                                            <Clock size={14} />
                                            <span>{item.time}</span>
                                            <span>-</span>
                                            <span>{item.type}</span>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-lg text-xs font-bold ${item.statusColor}`}>
                                        {item.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 italic text-center text-text-secondary">Planlanmış randevunuz bulunmamaktadır.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientHome;
