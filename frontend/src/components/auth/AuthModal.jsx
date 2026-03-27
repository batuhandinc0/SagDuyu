import { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaLock, FaEnvelope, FaHospital, FaStethoscope, FaIdCard, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AuthModal = ({ isOpen, onClose, initialTab = 'login' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [role, setRole] = useState('patient');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const { login, register, user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        branch: '',
        hospital_name: '',
        phone: '',
        tc_no: '',
        birth_date: '',
        blood_type: '',
        height: '',
        weight: '',
        gender: 'male'
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const validate = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.email || !emailRegex.test(formData.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi giriniz.';
        }
        if (!formData.password || formData.password.length < 6) {
            newErrors.password = 'Şifre en az 6 karakter olmalıdır.';
        }

        if (activeTab === 'register') {
            if (!formData.full_name) newErrors.full_name = 'Ad Soyad gereklidir.';

            if (role === 'doctor') {
                if (!formData.branch) newErrors.branch = 'Branş gereklidir.';
                if (!formData.hospital_name) newErrors.hospital_name = 'Hastane adı gereklidir.';
            } else {
                if (!formData.tc_no || formData.tc_no.length !== 11) newErrors.tc_no = '11 haneli TC Kimlik No gereklidir.';
                if (!formData.birth_date) newErrors.birth_date = 'Doğum tarihi gereklidir.';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error when user types
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!validate()) return;

        setLoading(true);
        try {
            if (activeTab === 'login') {
                // Login logic
                const result = await login(formData.email, formData.password);
                if (result.success) {
                    setSuccess('Giriş başarılı! Yönlendiriliyorsunuz...');
                    
                    // Get user data from result
                    const userData = result.user;
                    
                    setTimeout(() => {
                        onClose();
                        
                        // Navigate to appropriate dashboard based on user role
                        if (userData.role === 'doctor') {
                            window.location.href = '/doctor';
                        } else if (userData.role === 'patient') {
                            window.location.href = '/patient';
                        } else {
                            // Fallback - reload page
                            window.location.reload();
                        }
                    }, 1500);
                }
            } else {
                // Register logic
                const registerData = {
                    email: formData.email,
                    password: formData.password,
                    role: role,
                    fullName: formData.full_name,
                    ...(role === 'doctor' ? {
                        branch: formData.branch,
                        hospitalName: formData.hospital_name,
                        phone: formData.phone || '0000000000'
                    } : {
                        tcNo: formData.tc_no,
                        birthDate: formData.birth_date,
                        bloodType: formData.blood_type || 'A+',
                        height: parseFloat(formData.height) || 170,
                        weight: parseFloat(formData.weight) || 70,
                        gender: formData.gender || 'male'
                    })
                };

                const result = await register(registerData);
                if (result.success) {
                    setSuccess('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
                    setTimeout(() => {
                        setActiveTab('login');
                        setFormData({
                            ...formData,
                            password: '',
                            full_name: '',
                            branch: '',
                            hospital_name: '',
                            tc_no: '',
                            birth_date: '',
                            blood_type: '',
                            height: '',
                            weight: ''
                        });
                        setSuccess(null);
                    }, 2000);
                }
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyiniz.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden animate-scale-in">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
                >
                    <FaTimes size={20} />
                </button>

                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                    <button
                        className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'login' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => { setActiveTab('login'); setError(null); }}
                    >
                        Giriş Yap
                    </button>
                    <button
                        className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'register' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => { setActiveTab('register'); setError(null); }}
                    >
                        Kayıt Ol
                    </button>
                </div>

                <div className="p-8">
                    <h2 className="text-2xl font-bold text-text-main mb-2">
                        {activeTab === 'login' ? 'Tekrar Hoşgeldiniz' : 'Hesap Oluşturun'}
                    </h2>
                    <p className="text-text-secondary mb-6 text-sm">
                        {activeTab === 'login' ? 'Hesabınıza erişmek için bilgilerinizi girin.' : 'SagDuyu ailesine katılmak için formu doldurun.'}
                    </p>

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100">
                            {success}
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Role Selection for Register */}
                        {activeTab === 'register' && (
                            <div className="flex gap-4 mb-4">
                                <label className={`flex-1 cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${role === 'patient' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <input type="radio" name="role" value="patient" checked={role === 'patient'} onChange={() => setRole('patient')} className="hidden" />
                                    <FaUser />
                                    <span className="text-sm font-bold">Hasta</span>
                                </label>
                                <label className={`flex-1 cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${role === 'doctor' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <input type="radio" name="role" value="doctor" checked={role === 'doctor'} onChange={() => setRole('doctor')} className="hidden" />
                                    <FaStethoscope />
                                    <span className="text-sm font-bold">Doktor</span>
                                </label>
                            </div>
                        )}

                        {/* Common Fields */}
                        {activeTab === 'register' && (
                            <div className="space-y-1">
                                <div className="relative">
                                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        name="full_name"
                                        placeholder="Ad Soyad"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.full_name ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-primary/20'}`}
                                    />
                                </div>
                                {errors.full_name && <p className="text-xs text-red-500 pl-1">{errors.full_name}</p>}
                            </div>
                        )}

                        <div className="space-y-1">
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="E-posta Adresi"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-primary/20'}`}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 pl-1">{errors.email}</p>}
                        </div>

                        <div className="space-y-1">
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Şifre"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.password ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-primary/20'}`}
                                />
                            </div>
                            {errors.password && <p className="text-xs text-red-500 pl-1">{errors.password}</p>}
                        </div>

                        {/* Doctor Specific Fields */}
                        {activeTab === 'register' && role === 'doctor' && (
                            <>
                                <div className="space-y-1">
                                    <div className="relative">
                                        <FaStethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            name="branch"
                                            placeholder="Uzmanlık Branşı"
                                            value={formData.branch}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.branch ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-primary/20'}`}
                                        />
                                    </div>
                                    {errors.branch && <p className="text-xs text-red-500 pl-1">{errors.branch}</p>}
                                </div>
                                <div className="space-y-1">
                                    <div className="relative">
                                        <FaHospital className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            name="hospital_name"
                                            placeholder="Hastane Adı"
                                            value={formData.hospital_name}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.hospital_name ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-primary/20'}`}
                                        />
                                    </div>
                                    {errors.hospital_name && <p className="text-xs text-red-500 pl-1">{errors.hospital_name}</p>}
                                </div>
                            </>
                        )}

                        {/* Patient Specific Fields */}
                        {activeTab === 'register' && role === 'patient' && (
                            <>
                                <div className="space-y-1">
                                    <div className="relative">
                                        <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            name="tc_no"
                                            placeholder="TC Kimlik No"
                                            maxLength="11"
                                            value={formData.tc_no}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.tc_no ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-primary/20'}`}
                                        />
                                    </div>
                                    {errors.tc_no && <p className="text-xs text-red-500 pl-1">{errors.tc_no}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <input
                                            type="date"
                                            name="birth_date"
                                            value={formData.birth_date}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.birth_date ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-primary/20'}`}
                                        />
                                        {errors.birth_date && <p className="text-xs text-red-500 pl-1">{errors.birth_date}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.gender ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-primary/20'}`}
                                        >
                                            <option value="male">Erkek</option>
                                            <option value="female">Kadın</option>
                                        </select>
                                        {errors.gender && <p className="text-xs text-red-500 pl-1">{errors.gender}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <select
                                            name="blood_type"
                                            value={formData.blood_type}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.blood_type ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-primary/20'}`}
                                        >
                                            <option value="">Kan Grubu</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="0+">0+</option>
                                            <option value="0-">0-</option>
                                        </select>
                                        {errors.blood_type && <p className="text-xs text-red-500 pl-1">{errors.blood_type}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <input
                                            type="number"
                                            name="height"
                                            placeholder="Boy (cm)"
                                            value={formData.height}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.height ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-primary/20'}`}
                                        />
                                        {errors.height && <p className="text-xs text-red-500 pl-1">{errors.height}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <input
                                            type="number"
                                            name="weight"
                                            placeholder="Kilo (kg)"
                                            value={formData.weight}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.weight ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-primary/20'}`}
                                        />
                                        {errors.weight && <p className="text-xs text-red-500 pl-1">{errors.weight}</p>}
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <FaSpinner className="animate-spin" /> : (activeTab === 'login' ? 'Giriş Yap' : 'Kayıt Ol')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
