import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, TestTube, BrainCircuit, Settings, LogOut, Pill, CalendarDays, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ThemeToggle';

const Sidebar = ({ role }) => {
    const location = useLocation();
    const { logout } = useAuth();

    const doctorLinks = [
        { path: '/doctor', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/doctor/patients', icon: <Users size={20} />, label: 'Hasta Yönetimi' },
        { path: '/doctor/lab-results', icon: <TestTube size={20} />, label: 'Tahlil Sonuçları' },
        { path: '/doctor/lab-analysis', icon: <Activity size={20} />, label: 'Lab Analiz' },
        { path: '/doctor/ai-analysis', icon: <BrainCircuit size={20} />, label: 'Multimodal AI' },
        { path: '/doctor/settings', icon: <Settings size={20} />, label: 'Ayarlar' },
    ];

    const patientLinks = [
        { path: '/patient', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/patient/appointments', icon: <CalendarDays size={20} />, label: 'Randevularım' },
        { path: '/patient/lab-results', icon: <TestTube size={20} />, label: 'Tahlillerim' },
        { path: '/patient/ai-results', icon: <BrainCircuit size={20} />, label: 'AI Analiz Sonuçlarım' },
        { path: '/patient/settings', icon: <Settings size={20} />, label: 'Ayarlar' },
    ];

    const links = role === 'doctor' ? doctorLinks : patientLinks;

    return (
        <div className="flex flex-col w-64 h-screen bg-white border-r border-slate-200 transition-colors duration-300">
            <div className="flex items-center gap-3 p-6">
                <div className="p-2 bg-primary/10 rounded-xl">
                    <BrainCircuit className="text-2xl text-primary" />
                </div>
                <span className="text-xl font-bold text-text-main tracking-tight">SagDuyu</span>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-2">
                {links.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'text-text-secondary hover:bg-slate-50 hover:text-primary'
                                }`}
                        >
                            <span className={`${isActive ? 'text-primary' : 'text-text-secondary group-hover:text-primary'}`}>
                                {link.icon}
                            </span>
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-sm font-medium text-text-secondary">Tema</span>
                    <ThemeToggle />
                </div>
                <button
                    onClick={logout}
                    className="flex items-center w-full gap-3 px-4 py-3 text-text-secondary transition-colors rounded-xl hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut size={20} />
                    <span>Çıkış Yap</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
