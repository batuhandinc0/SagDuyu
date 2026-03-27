import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaSave, FaCalendarAlt, FaRuler, FaWeight } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const Settings = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        tcNo: '',
        birthDate: '',
        bloodType: '',
        height: '',
        weight: '',
        gender: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/user/profile');
            
            if (response.data.success) {
                const userData = response.data.data;
                setFormData({
                    fullName: userData.profile?.fullName || '',
                    email: userData.email || '',
                    phone: userData.profile?.phone || '',
                    tcNo: userData.profile?.tcNo || '',
                    birthDate: userData.profile?.birthDate ? userData.profile.birthDate.split('T')[0] : '',
                    bloodType: userData.profile?.bloodType || '',
                    height: userData.profile?.height?.toString() || '',
                    weight: userData.profile?.weight?.toString() || '',
                    gender: userData.profile?.gender || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            alert('Profil bilgileri yüklenirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword && passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Yeni şifreler eşleşmiyor.');
            return;
        }

        try {
            setSaving(true);
            
            // Update profile
            const profileData = {
                fullName: formData.fullName,
                phone: formData.phone,
                birthDate: formData.birthDate,
                bloodType: formData.bloodType,
                height: parseFloat(formData.height),
                weight: parseFloat(formData.weight),
                gender: formData.gender
            };

            await axios.put('http://localhost:5000/api/user/profile', profileData);
            
            // Update password if provided
            if (passwordData.newPassword) {
                await axios.put('http://localhost:5000/api/user/change-password', {
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                });
            }

            alert('Bilgileriniz başarıyla güncellendi.');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            
            // Refresh profile data
            await fetchUserProfile();
            
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Bilgiler güncellenirken hata oluştu: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-text-secondary">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-text-main">Ayarlar</h1>
                <p className="text-text-secondary">Profil ve hesap ayarlarınızı yönetin</p>
            </div>

            <div className="max-w-3xl bg-white border shadow-sm border-slate-100 rounded-xl">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-text-main">Kişisel Bilgiler</h3>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-text-main">Ad Soyad</label>
                                <div className="relative">
                                    <FaUser className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                                    <input 
                                        type="text" 
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full py-2 pl-10 pr-4 border rounded-lg border-slate-200 focus:outline-none focus:border-primary" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-text-main">E-posta</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                                    <input 
                                        type="email" 
                                        value={formData.email}
                                        disabled
                                        className="w-full py-2 pl-10 pr-4 border rounded-lg border-slate-200 bg-gray-50 text-gray-500" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-text-main">Telefon</label>
                                <div className="relative">
                                    <FaPhone className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                                    <input 
                                        type="tel" 
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full py-2 pl-10 pr-4 border rounded-lg border-slate-200 focus:outline-none focus:border-primary" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-text-main">TC Kimlik No</label>
                                <input 
                                    type="text" 
                                    value={formData.tcNo}
                                    disabled
                                    className="w-full px-4 py-2 border rounded-lg border-slate-200 bg-gray-50 text-gray-500" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-text-main">Doğum Tarihi</label>
                                <div className="relative">
                                    <FaCalendarAlt className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                                    <input 
                                        type="date" 
                                        name="birthDate"
                                        value={formData.birthDate}
                                        onChange={handleInputChange}
                                        className="w-full py-2 pl-10 pr-4 border rounded-lg border-slate-200 focus:outline-none focus:border-primary" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-text-main">Kan Grubu</label>
                                <select 
                                    name="bloodType"
                                    value={formData.bloodType}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg border-slate-200 focus:outline-none focus:border-primary"
                                >
                                    <option value="">Kan Grubu Seçin</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="0+">0+</option>
                                    <option value="0-">0-</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-text-main">Boy (cm)</label>
                                <div className="relative">
                                    <FaRuler className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                                    <input 
                                        type="number" 
                                        name="height"
                                        value={formData.height}
                                        onChange={handleInputChange}
                                        min="100" 
                                        max="250"
                                        className="w-full py-2 pl-10 pr-4 border rounded-lg border-slate-200 focus:outline-none focus:border-primary" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-text-main">Kilo (kg)</label>
                                <div className="relative">
                                    <FaWeight className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                                    <input 
                                        type="number" 
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleInputChange}
                                        min="30" 
                                        max="200"
                                        step="0.1"
                                        className="w-full py-2 pl-10 pr-4 border rounded-lg border-slate-200 focus:outline-none focus:border-primary" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-text-main">Cinsiyet</label>
                                <select 
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg border-slate-200 focus:outline-none focus:border-primary"
                                >
                                    <option value="">Cinsiyet Seçin</option>
                                    <option value="male">Erkek</option>
                                    <option value="female">Kadın</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-6 mb-6 border-t border-slate-100">
                            <h4 className="mb-4 text-base font-bold text-text-main">Şifre Değiştir</h4>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-text-main">Mevcut Şifre</label>
                                    <div className="relative">
                                        <FaLock className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                                        <input 
                                            type="password" 
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full py-2 pl-10 pr-4 border rounded-lg border-slate-200 focus:outline-none focus:border-primary" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-text-main">Yeni Şifre</label>
                                    <div className="relative">
                                        <FaLock className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                                        <input 
                                            type="password" 
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full py-2 pl-10 pr-4 border rounded-lg border-slate-200 focus:outline-none focus:border-primary" 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6">
                                <label className="block mb-2 text-sm font-medium text-text-main">Yeni Şifre (Tekrar)</label>
                                <div className="relative">
                                    <FaLock className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                                    <input 
                                        type="password" 
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full py-2 pl-10 pr-4 border rounded-lg border-slate-200 focus:outline-none focus:border-primary" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2 font-semibold text-white transition-colors rounded-lg bg-primary hover:bg-primary-dark disabled:opacity-50"
                            >
                                <FaSave /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
