import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/auth/AuthModal';

const Login = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        // If user is already authenticated, redirect to appropriate dashboard
        if (isAuthenticated && user) {
            if (user.role === 'doctor') {
                navigate('/doctor');
            } else if (user.role === 'patient') {
                navigate('/patient');
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleLoginClick = () => {
        setShowAuthModal(true);
    };

    const handleCloseModal = () => {
        setShowAuthModal(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        SagDuyu
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Sağlık Yönetim Sistemi
                    </p>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Hoşgeldiniz
                        </h2>
                        <p className="text-gray-600">
                            Hesabınıza erişmek için giriş yapın veya yeni hesap oluşturun.
                        </p>
                    </div>

                    {/* Auth Button */}
                    <button
                        onClick={handleLoginClick}
                        className="w-full bg-primary text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary-dark transition-colors duration-200 shadow-lg hover:shadow-xl"
                    >
                        Giriş Yap / Kayıt Ol
                    </button>

                    {/* Features */}
                    <div className="mt-8 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 text-center">
                            Özellikler
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-2xl mb-1">🏥</div>
                                <p className="text-sm text-gray-700">Doktor Paneli</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-2xl mb-1">👨‍⚕️</div>
                                <p className="text-sm text-gray-700">Hasta Yönetimi</p>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <div className="text-2xl mb-1">🤖</div>
                                <p className="text-sm text-gray-700">AI Analizi</p>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                                <div className="text-2xl mb-1">📊</div>
                                <p className="text-sm text-gray-700">Lab Sonuçları</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Auth Modal */}
            <AuthModal 
                isOpen={showAuthModal} 
                onClose={handleCloseModal}
                initialTab="login"
            />
        </div>
    );
};

export default Login;
