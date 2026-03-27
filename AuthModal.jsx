import React, { useState } from 'react';
import { 
  FiX, 
  FiUser, 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiPhone, 
  FiBriefcase, 
  FiBuilding, 
  FiHash, 
  FiCalendar, 
  FiHeart,
  FiUserPlus,
  FiArrowRight
} from 'react-icons/fi';
import axios from 'axios';

const AuthModal = ({ isOpen, onClose, onLogin }) => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  // Form states
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    fullName: '',
    branch: '',
    hospitalName: '',
    phone: '',
    tcNo: '',
    birthDate: '',
    bloodType: '',
    height: '',
    weight: '',
    gender: ''
  });

  // Turkish blood types
  const bloodTypes = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'
  ];

  // Reset form
  const resetForms = () => {
    setLoginForm({ email: '', password: '' });
    setRegisterForm({
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      fullName: '',
      branch: '',
      hospitalName: '',
      phone: '',
      tcNo: '',
      birthDate: '',
      bloodType: '',
      height: '',
      weight: '',
      gender: ''
    });
    setErrors({});
    setSuccess('');
  };

  // Close modal
  const handleClose = () => {
    resetForms();
    setActiveTab('login');
    onClose();
  };

  // Form validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (activeTab === 'login') {
      if (!loginForm.email) {
        newErrors.email = 'E-posta adresi gerekli';
      } else if (!validateEmail(loginForm.email)) {
        newErrors.email = 'Geçerli bir e-posta adresi girin';
      }

      if (!loginForm.password) {
        newErrors.password = 'Şifre gerekli';
      } else if (loginForm.password.length < 6) {
        newErrors.password = 'Şifre en az 6 karakter olmalı';
      }
    } else {
      // Register validation
      if (!registerForm.email) {
        newErrors.email = 'E-posta adresi gerekli';
      } else if (!validateEmail(registerForm.email)) {
        newErrors.email = 'Geçerli bir e-posta adresi girin';
      }

      if (!registerForm.password) {
        newErrors.password = 'Şifre gerekli';
      } else if (registerForm.password.length < 6) {
        newErrors.password = 'Şifre en az 6 karakter olmalı';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(registerForm.password)) {
        newErrors.password = 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermeli';
      }

      if (!registerForm.confirmPassword) {
        newErrors.confirmPassword = 'Şifre tekrarı gerekli';
      } else if (registerForm.password !== registerForm.confirmPassword) {
        newErrors.confirmPassword = 'Şifreler eşleşmiyor';
      }

      if (!registerForm.role) {
        newErrors.role = 'Lütfen bir rol seçin';
      }

      if (!registerForm.fullName) {
        newErrors.fullName = 'Ad Soyad gerekli';
      }

      if (registerForm.role === 'doctor') {
        if (!registerForm.branch) {
          newErrors.branch = 'Branş gerekli';
        }
        if (!registerForm.hospitalName) {
          newErrors.hospitalName = 'Hastane adı gerekli';
        }
        if (!registerForm.phone) {
          newErrors.phone = 'Telefon numarası gerekli';
        } else if (!/^[0-9+\-\s()]+$/.test(registerForm.phone)) {
          newErrors.phone = 'Geçerli bir telefon numarası girin';
        }
      } else if (registerForm.role === 'patient') {
        if (!registerForm.tcNo) {
          newErrors.tcNo = 'TC Kimlik No gerekli';
        } else if (registerForm.tcNo.length !== 11) {
          newErrors.tcNo = 'TC Kimlik No 11 haneli olmalı';
        }
        if (!registerForm.birthDate) {
          newErrors.birthDate = 'Doğum tarihi gerekli';
        }
        if (!registerForm.bloodType) {
          newErrors.bloodType = 'Kan grubu gerekli';
        }
        if (!registerForm.height) {
          newErrors.height = 'Boy gerekli';
        } else if (registerForm.height < 100 || registerForm.height > 250) {
          newErrors.height = 'Boy 100-250 cm arasında olmalı';
        }
        if (!registerForm.weight) {
          newErrors.weight = 'Kilo gerekli';
        } else if (registerForm.weight < 30 || registerForm.weight > 200) {
          newErrors.weight = 'Kilo 30-200 kg arasında olmalı';
        }
        if (!registerForm.gender) {
          newErrors.gender = 'Cinsiyet gerekli';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: loginForm.email,
        password: loginForm.password
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // Save token to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setSuccess('Giriş başarılı! Yönlendiriliyorsunuz...');
        
        // Notify parent component
        if (onLogin) {
          onLogin(user, token);
        }
        
        // Close modal after short delay
        setTimeout(() => {
          handleClose();
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: error.response?.data?.message || 'Giriş yapılırken hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle register
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // Prepare registration data based on role
      const registrationData = {
        email: registerForm.email,
        password: registerForm.password,
        role: registerForm.role,
        fullName: registerForm.fullName
      };

      if (registerForm.role === 'doctor') {
        registrationData.branch = registerForm.branch;
        registrationData.hospitalName = registerForm.hospitalName;
        registrationData.phone = registerForm.phone;
      } else if (registerForm.role === 'patient') {
        registrationData.tcNo = registerForm.tcNo;
        registrationData.birthDate = registerForm.birthDate;
        registrationData.bloodType = registerForm.bloodType;
        registrationData.height = parseFloat(registerForm.height);
        registrationData.weight = parseFloat(registerForm.weight);
        registrationData.gender = registerForm.gender;
      }

      const response = await axios.post('http://localhost:5000/api/auth/register', registrationData);

      if (response.data.success) {
        setSuccess('Kayıt başarılı! Giriş yapabilirsiniz.');
        
        // Switch to login tab after successful registration
        setTimeout(() => {
          setActiveTab('login');
          setRegisterForm({ ...registerForm, password: '', confirmPassword: '' });
          setSuccess('');
        }, 2000);
      }
    } catch (error) {
      console.error('Register error:', error);
      const serverErrors = error.response?.data?.errors;
      if (serverErrors && Array.isArray(serverErrors)) {
        // Handle validation errors from server
        const fieldErrors = {};
        serverErrors.forEach(err => {
          fieldErrors[err.path] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({
          general: error.response?.data?.message || 'Kayıt olurken hata oluştu'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Input change handlers
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>

          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">SagDuyu</h2>
              <p className="text-gray-600">Sağlık Yönetim Sistemi</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => {
                setActiveTab('login');
                setErrors({});
                setSuccess('');
              }}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'login'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setErrors({});
                setSuccess('');
              }}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'register'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Kayıt Ol
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Success message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm text-center">{success}</p>
              </div>
            )}

            {/* General error */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm text-center">{errors.general}</p>
              </div>
            )}

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta Adresi
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={loginForm.email}
                      onChange={handleLoginChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="ornek@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şifre
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Giriş yapılıyor...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <FiUser className="w-5 h-5 mr-2" />
                      Giriş Yap
                      <FiArrowRight className="w-5 h-5 ml-2" />
                    </div>
                  )}
                </button>
              </form>
            )}

            {/* Register Form */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-6">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kayıt Tipi
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRegisterForm(prev => ({ ...prev, role: 'doctor' }))}
                      className={`p-4 rounded-lg border-2 transition-all text-center ${
                        registerForm.role === 'doctor'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FiBriefcase className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm font-medium">Doktor</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegisterForm(prev => ({ ...prev, role: 'patient' }))}
                      className={`p-4 rounded-lg border-2 transition-all text-center ${
                        registerForm.role === 'patient'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FiUser className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm font-medium">Hasta</div>
                    </button>
                  </div>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                  )}
                </div>

                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta Adresi
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={registerForm.email}
                        onChange={handleRegisterChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="ornek@email.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad Soyad
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="fullName"
                        value={registerForm.fullName}
                        onChange={handleRegisterChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Ad Soyad"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                    )}
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şifre
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={registerForm.password}
                        onChange={handleRegisterChange}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şifre Tekrarı
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={registerForm.confirmPassword}
                        onChange={handleRegisterChange}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Doctor Specific Fields */}
                {registerForm.role === 'doctor' && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 flex items-center">
                      <FiBriefcase className="w-5 h-5 mr-2" />
                      Doktor Bilgileri
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Branch */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Branş
                        </label>
                        <div className="relative">
                          <FiHeart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="branch"
                            value={registerForm.branch}
                            onChange={handleRegisterChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              errors.branch ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="Kardiyoloji"
                          />
                        </div>
                        {errors.branch && (
                          <p className="mt-1 text-sm text-red-600">{errors.branch}</p>
                        )}
                      </div>

                      {/* Hospital Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hastane Adı
                        </label>
                        <div className="relative">
                          <FiBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="hospitalName"
                            value={registerForm.hospitalName}
                            onChange={handleRegisterChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              errors.hospitalName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="XX Hastanesi"
                          />
                        </div>
                        {errors.hospitalName && (
                          <p className="mt-1 text-sm text-red-600">{errors.hospitalName}</p>
                        )}
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefon Numarası
                      </label>
                      <div className="relative">
                        <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          name="phone"
                          value={registerForm.phone}
                          onChange={handleRegisterChange}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="0555 123 45 67"
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Patient Specific Fields */}
                {registerForm.role === 'patient' && (
                  <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 flex items-center">
                      <FiUser className="w-5 h-5 mr-2" />
                      Hasta Bilgileri
                    </h4>
                    
                    {/* TC No */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        TC Kimlik No
                      </label>
                      <div className="relative">
                        <FiHash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="tcNo"
                          value={registerForm.tcNo}
                          onChange={handleRegisterChange}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            errors.tcNo ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="12345678901"
                          maxLength={11}
                        />
                      </div>
                      {errors.tcNo && (
                        <p className="mt-1 text-sm text-red-600">{errors.tcNo}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Birth Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Doğum Tarihi
                        </label>
                        <div className="relative">
                          <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="date"
                            name="birthDate"
                            value={registerForm.birthDate}
                            onChange={handleRegisterChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              errors.birthDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {errors.birthDate && (
                          <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>
                        )}
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cinsiyet
                        </label>
                        <select
                          name="gender"
                          value={registerForm.gender}
                          onChange={handleRegisterChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            errors.gender ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Seçiniz</option>
                          <option value="male">Erkek</option>
                          <option value="female">Kadın</option>
                        </select>
                        {errors.gender && (
                          <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Blood Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kan Grubu
                        </label>
                        <select
                          name="bloodType"
                          value={registerForm.bloodType}
                          onChange={handleRegisterChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            errors.bloodType ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Seçiniz</option>
                          {bloodTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        {errors.bloodType && (
                          <p className="mt-1 text-sm text-red-600">{errors.bloodType}</p>
                        )}
                      </div>

                      {/* Height */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Boy (cm)
                        </label>
                        <input
                          type="number"
                          name="height"
                          value={registerForm.height}
                          onChange={handleRegisterChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            errors.height ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="175"
                          min="100"
                          max="250"
                        />
                        {errors.height && (
                          <p className="mt-1 text-sm text-red-600">{errors.height}</p>
                        )}
                      </div>

                      {/* Weight */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kilo (kg)
                        </label>
                        <input
                          type="number"
                          name="weight"
                          value={registerForm.weight}
                          onChange={handleRegisterChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            errors.weight ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="70"
                          min="30"
                          max="200"
                          step="0.1"
                        />
                        {errors.weight && (
                          <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={loading || !registerForm.role}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Kayıt yapılıyor...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <FiUserPlus className="w-5 h-5 mr-2" />
                      Kayıt Ol
                      <FiArrowRight className="w-5 h-5 ml-2" />
                    </div>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 rounded-b-2xl">
            <p className="text-center text-sm text-gray-600">
              SagDuyu ile sağlığınızı yönetmeye başlayın
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;