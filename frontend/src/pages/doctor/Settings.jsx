import { useState, useEffect } from 'react';
import { FaUserMd, FaEnvelope, FaHospital, FaSave, FaPhone, FaLock, FaIdCard } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const Settings = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        branch: '',
        hospitalName: '',
        licenseNumber: ''
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
                const fullName = userData.profile?.fullName || '';
                const nameParts = fullName.split(' ');
                
                setFormData({
                    firstName: nameParts[0] || '',
                    lastName: nameParts.slice(1).join(' ') || '',
                    email: userData.email || '',
                    phone: userData.profile?.phone || '',
                    branch: userData.profile?.branch || '',
                    hospitalName: userData.profile?.hospitalName || '',
                    licenseNumber: userData.profile?.licenseNumber || ''
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
            const fullName = `${formData.firstName} ${formData.lastName}`.trim();
            const profileData = {
                fullName,
                phone: formData.phone,
                branch: formData.branch,
                hospitalName: formData.hospitalName,
                licenseNumber: formData.licenseNumber
            };

            await axios.put('http://localhost:5000/api/user/profile', profileData);
            
            // Update password if provided
            if (passwordData.newPassword) {
                await axios.put('http://localhost:5000/api/user/change-password', {
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                });
            }

            alert('Ayarlarınız başarıyla kaydedildi.');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            
            // Refresh profile data
            await fetchUserProfile();
            
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Ayarlar güncellenirken hata oluştu: ' + (error.response?.data?.message || error.message));
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
                <h1 className="text-2xl font-bold text-text-main">Profil ve Ayarlar</h1>
                <p className="text-text-secondary">Hesap bilgilerinizi güncelleyin</p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="p-6 text-center bg-white border shadow-sm border-slate-100 rounded-xl">
                        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 text-4xl rounded-full bg-sky-50 text-primary">
                            <FaUserMd />
                        </div>
                        <h3 className="text-xl font-bold text-text-main">
                            {formData.firstName && formData.lastName ? `Dr. ${formData.firstName} ${formData.lastName}` : 'Dr. Doktor'}
                        </h3>
                        <p className="mb-6 text-text-secondary">{formData.branch || 'Uzmanlık Alanı'}</p>

                        <button className="w-full py-2 mb-6 font-medium transition-colors border rounded-lg text-text-main border-slate-200 hover:bg-slate-50">
                            Fotoğrafı Değiştir
                        </button>

                        <div className="pt-6 text-left border-t border-slate-100 space-y-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1 text-sm font-medium text-text-main">
                                    <FaEnvelope className="text-text-secondary" /> E-posta
                                </div>
                                <div className="text-text-secondary">{formData.email}</div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1 text-sm font-medium text-text-main">
                                    <FaHospital className="text-text-secondary" /> Hastane
                                </div>
                                <div className="text-text-secondary">{formData.hospitalName || 'Belirtilmemiş'}</div>
                            </div>
                            {formData.licenseNumber && (
                                <div>
                                    <div className="flex items-center gap-2 mb-1 text-sm font-medium text-text-main">
                                        <FaIdCard className="text-text-secondary" /> Lisans No
                                    </div>
                                    <div className="text-text-secondary">{formData.licenseNumber}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Settings Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white border shadow-sm border-slate-100 rounded-xl">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-text-main">Kişisel Bilgileri Düzenle</h3>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-text-main">Ad</label>
                                        <input 
                                            type="text" 
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border rounded-lg border-slate-200 focus:outline-none focus:border-primary" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-text-main">Soyad</label>
                                        <input 
                                            type="text" 
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border rounded-lg border-slate-200 focus:outline-none focus:border-primary" 
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block mb-2 text-sm font-medium text-text-main">Telefon Numarası</label>
                                    <div className="relative">
                                        <FaPhone className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                                        <input 
                                            type="tel" 
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-2 border rounded-lg border-slate-200 focus:outline-none focus:border-primary" 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-text-main">Uzmanlık Alanı</label>
                                        <input 
                                            type="text" 
                                            name="branch"
                                            value={formData.branch}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border rounded-lg border-slate-200 focus:outline-none focus:border-primary" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-text-main">Hastane Adı</label>
                                        <div className="relative">
                                            <FaHospital className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                                            <input 
                                                type="text" 
                                                name="hospitalName"
                                                value={formData.hospitalName}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-2 border rounded-lg border-slate-200 focus:outline-none focus:border-primary" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <label className="block mb-2 text-sm font-medium text-text-main">Lisans Numarası</label>
                                    <div className="relative">
                                        <FaIdCard className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                                        <input 
                                            type="text" 
                                            name="licenseNumber"
                                            value={formData.licenseNumber}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-2 border rounded-lg border-slate-200 focus:outline-none focus:border-primary" 
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 mb-6 border-t border-slate-100">
                                    <h4 className="mb-4 text-base font-bold text-text-main">Şifre Değiştir</h4>
                                    <div className="mb-6">
                                        <label className="block mb-2 text-sm font-medium text-text-main">Mevcut Şifre</label>
                                        <div className="relative">
                                            <FaLock className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                                            <input 
                                                type="password" 
                                                name="currentPassword"
                                                value={passwordData.currentPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full pl-10 pr-4 py-2 border rounded-lg border-slate-200 focus:outline-none focus:border-primary" 
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-text-main">Yeni Şifre</label>
                                            <div className="relative">
                                                <FaLock className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                                                <input 
                                                    type="password" 
                                                    name="newPassword"
                                                    value={passwordData.newPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full pl-10 pr-4 py-2 border rounded-lg border-slate-200 focus:outline-none focus:border-primary" 
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-text-main">Yeni Şifre (Tekrar)</label>
                                            <div className="relative">
                                                <FaLock className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                                                <input 
                                                    type="password" 
                                                    name="confirmPassword"
                                                    value={passwordData.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full pl-10 pr-4 py-2 border rounded-lg border-slate-200 focus:outline-none focus:border-primary" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-slate-100">
                                    <button 
                                        type="submit" 
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2 font-semibold text-white transition-colors rounded-lg bg-primary hover:bg-primary-dark disabled:opacity-50"
                                    >
                                        <FaSave /> {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
