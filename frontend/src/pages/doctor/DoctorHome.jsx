import { useState, useEffect } from 'react';
import { Users, TestTube, AlertTriangle, Calendar, Clock, MapPin, Activity } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import api from '../../services/api';

const DoctorHome = () => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        todayAppointments: 0,
        pendingLabs: 0,
        criticalCases: 0
    });
    const [todaySchedule, setTodaySchedule] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const statRes = await api.get('/user/dashboard');
                if (statRes.data.success) {
                    setStats({
                        totalPatients: statRes.data.data.totalPatients || 0,
                        todayAppointments: statRes.data.data.todayAppointments || 0,
                        pendingLabs: statRes.data.data.pendingLabs || 0,
                        criticalCases: 0 // Backend currently doesn't return criticalCases
                    });
                }

                const aptRes = await api.get('/appointments/my-appointments');
                if (aptRes.data.success) {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const todayApts = aptRes.data.data.filter(apt => apt.appointmentDate && apt.appointmentDate.startsWith(todayStr));
                    
                    const formattedApts = todayApts.map(apt => ({
                        id: apt.id,
                        patient: apt.patient?.fullName || 'Bilinmeyen Hasta',
                        time: new Date(apt.appointmentDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                        type: apt.appointmentType || 'Kontrol',
                        status: apt.status === 'completed' ? 'Tamamlandı' : apt.status === 'scheduled' ? 'Bekliyor' : apt.status,
                        statusColor: apt.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'
                    }));
                    setTodaySchedule(formattedApts);
                }
            } catch (err) {
                console.error("Dashboard error:", err);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="p-6 lg:p-8">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-text-main tracking-tight">Dashboard</h1>
                <p className="text-text-secondary mt-2 text-lg">Genel bakış ve hızlı erişim</p>
            </div>

            <div className="grid grid-cols-1 gap-8 mb-10 md:grid-cols-4">
                <StatCard
                    icon={<Users size={24} />}
                    value={stats.totalPatients.toString()}
                    label="Toplam Hasta"
                    bgClass="status-info"
                    colorClass="text-info-text"
                />
                <StatCard
                    icon={<Calendar size={24} />}
                    value={stats.todayAppointments.toString()}
                    label="Bugünkü Randevular"
                    bgClass="status-success"
                    colorClass="text-success-text"
                />
                <StatCard
                    icon={<TestTube size={24} />}
                    value={stats.pendingLabs.toString()}
                    label="Bekleyen Tahliller"
                    bgClass="status-warning"
                    colorClass="text-warning-text"
                />
                <StatCard
                    icon={<AlertTriangle size={24} />}
                    value={stats.criticalCases.toString()}
                    label="Kritik Durumlar"
                    bgClass="status-danger"
                    colorClass="text-danger-text"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Today's Schedule */}
                <div className="card-modern">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-text-main">Bugünkü Randevular</h3>
                    </div>
                    <div className="space-y-1">
                        {todaySchedule.length > 0 ? todaySchedule.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 border border-transparent transition-all rounded-xl hover:bg-slate-50 hover:border-slate-100">
                                <div>
                                    <h4 className="font-bold text-text-main">{item.patient}</h4>
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
                        )) : (
                            <div className="p-4 italic text-center text-text-secondary">Bugün için randevunuz bulunmamaktadır.</div>
                        )}
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="card-modern">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-text-main">Son Aktiviteler</h3>
                    </div>
                    <div className="space-y-6">
                        <div className="text-center text-text-secondary py-4">
                            Henüz aktivite yok.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorHome;
