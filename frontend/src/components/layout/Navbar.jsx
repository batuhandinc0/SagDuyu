import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaLaptopMedical, FaBars, FaTimes } from 'react-icons/fa';
import AuthModal from '../auth/AuthModal';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalTab, setAuthModalTab] = useState('login');

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMenu = () => setIsMobileMenuOpen(false);

    const openAuthModal = (tab) => {
        setAuthModalTab(tab);
        setIsAuthModalOpen(true);
        closeMenu();
    };

    return (
        <header className="fixed top-0 z-50 w-full transition-all duration-300 border-b bg-white/80 backdrop-blur-md border-white/30 h-[80px]">
            <div className="container flex items-center justify-between h-full px-6 mx-auto max-w-7xl">
                <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-text-main">
                    <FaLaptopMedical className="text-3xl text-primary" />
                    HealthAI
                </Link>

                <nav className="hidden md:block">
                    <ul className="flex gap-8">
                        <li><a href="#about" className="font-medium transition-colors text-text-secondary hover:text-primary">Proje Hakkında</a></li>
                        <li><a href="#modules" className="font-medium transition-colors text-text-secondary hover:text-primary">Modüller</a></li>
                        <li><a href="#technology" className="font-medium transition-colors text-text-secondary hover:text-primary">Teknoloji</a></li>
                    </ul>
                </nav>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <>
                                {/* User greeting */}
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="text-sm">
                                        <div className="text-text-secondary">Hoşgeldiniz</div>
                                        <div className="font-semibold text-text-main">
                                            {user.role === 'doctor' && user.profile?.fullName 
                                                ? `Dr. ${user.profile.fullName}` 
                                                : user.profile?.fullName || 'Kullanıcı'
                                            }
                                        </div>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => navigate(user.role === 'doctor' ? '/doctor' : '/patient')}
                                    className="px-6 py-3 font-semibold text-white transition-all shadow-lg rounded-xl bg-gradient-to-r from-primary to-accent hover:-translate-y-0.5 hover:shadow-primary/40"
                                >
                                    Panele Git
                                </button>
                                <button
                                    onClick={logout}
                                    className="px-6 py-3 font-semibold transition-colors bg-transparent border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white"
                                >
                                    Çıkış
                                </button>
                            </>
                        ) : (
                            <>
                                <>
                                    <button
                                        onClick={() => setIsAuthModalOpen(true)}
                                        className="px-6 py-3 font-semibold transition-colors bg-transparent border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white"
                                    >
                                        Giriş Yap
                                    </button>
                                    <button
                                        onClick={() => setIsAuthModalOpen(true)}
                                        className="px-6 py-3 font-semibold text-white transition-all shadow-lg rounded-xl bg-gradient-to-r from-primary to-accent hover:-translate-y-0.5 hover:shadow-primary/40"
                                    >
                                        Kayıt Ol
                                    </button>
                                </>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="mobile-menu-btn text-text-main" onClick={toggleMenu}>
                        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="absolute top-[80px] left-0 w-full bg-white border-b border-slate-200 shadow-xl p-6 md:hidden animate-fade-in-down">
                    <nav className="flex flex-col gap-4">
                        <a href="#about" onClick={closeMenu} className="text-lg font-medium text-text-secondary hover:text-primary">Proje Hakkında</a>
                        <a href="#modules" onClick={closeMenu} className="text-lg font-medium text-text-secondary hover:text-primary">Modüller</a>
                        <a href="#technology" onClick={closeMenu} className="text-lg font-medium text-text-secondary hover:text-primary">Teknoloji</a>
                        <hr className="border-slate-100 my-2" />
                        {user ? (
                            <div className="flex flex-col gap-3">
                                {/* Mobile User greeting */}
                                <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="text-sm">
                                        <div className="text-text-secondary">Hoşgeldiniz</div>
                                        <div className="font-semibold text-text-main">
                                            {user.role === 'doctor' && user.profile?.fullName 
                                                ? `Dr. ${user.profile.fullName}` 
                                                : user.profile?.fullName || 'Kullanıcı'
                                            }
                                        </div>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => { navigate(user.role === 'doctor' ? '/doctor' : '/patient'); closeMenu(); }}
                                    className="w-full px-6 py-3 font-semibold text-white transition-all shadow-lg rounded-xl bg-gradient-to-r from-primary to-accent"
                                >
                                    Panele Git
                                </button>
                                <button
                                    onClick={() => { logout(); closeMenu(); }}
                                    className="w-full px-6 py-3 font-semibold text-center transition-colors bg-transparent border-2 border-primary text-primary rounded-xl"
                                >
                                    Çıkış
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => openAuthModal('login')}
                                    className="w-full px-6 py-3 font-semibold text-center transition-colors bg-transparent border-2 border-primary text-primary rounded-xl"
                                >
                                    Giriş Yap
                                </button>
                                <button
                                    onClick={() => openAuthModal('register')}
                                    className="w-full px-6 py-3 font-semibold text-center text-white transition-all shadow-lg rounded-xl bg-gradient-to-r from-primary to-accent"
                                >
                                    Kayıt Ol
                                </button>
                            </div>
                        )}
                    </nav>
                </div>
            )}
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialTab={authModalTab} />
        </header>
    );
};

export default Navbar;
