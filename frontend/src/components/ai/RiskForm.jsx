import React, { useState } from 'react';
import { Wand2 } from 'lucide-react';

const RiskForm = ({ onAnalyze, loading }) => {
    // State to hold all 13 features
    const [formData, setFormData] = useState({
        age: '',
        sex: '1',
        cp: '0',
        trestbps: '',
        chol: '',
        fbs: '0',
        restecg: '0',
        thalach: '',
        exang: '0',
        oldpeak: '',
        slope: '1',
        ca: '0',
        thal: '1'
    });

    // Handle individual input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Auto-fill with a sample diseased patient (from test data)
    const handleFillExample = () => {
        setFormData({
            age: '37',
            sex: '1',
            cp: '2',
            trestbps: '130',
            chol: '250',
            fbs: '0',
            restecg: '1',
            thalach: '187',
            exang: '0',
            oldpeak: '3.5',
            slope: '0',
            ca: '0',
            thal: '2'
        });
    };

    const handleSubmit = () => {
        // Validation: Check if any required fields are empty
        const requiredNumberFields = ['age', 'trestbps', 'chol', 'thalach', 'oldpeak'];
        const missing = requiredNumberFields.filter(field => formData[field] === '');
        
        if (missing.length > 0) {
            alert('Lütfen tüm sayısal alanları (Yaş, Tansiyon, Kolesterol, Nabız, ST Çökmesi) doldurun.');
            return;
        }

        // Construct the CSV string expected by the backend
        const csvString = `${formData.age}, ${formData.sex}, ${formData.cp}, ${formData.trestbps}, ${formData.chol}, ${formData.fbs}, ${formData.restecg}, ${formData.thalach}, ${formData.exang}, ${formData.oldpeak}, ${formData.slope}, ${formData.ca}, ${formData.thal}`;
        
        onAnalyze(csvString);
    };

    return (
        <div className="space-y-6 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">Klinik Değerler</h3>
                <button 
                    onClick={handleFillExample}
                    type="button"
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium transition-colors bg-primary/10 px-3 py-1.5 rounded-lg"
                >
                    <Wand2 size={16} /> Örnek Doldur
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Yaş */}
                <div className="flex flex-col">
                    <label className="mb-1 text-xs font-semibold text-slate-600">Yaş (Age)</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Örn: 55" className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                </div>

                {/* 2. Cinsiyet */}
                <div className="flex flex-col">
                    <label className="mb-1 text-xs font-semibold text-slate-600">Cinsiyet (Sex)</label>
                    <select name="sex" value={formData.sex} onChange={handleChange} className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white">
                        <option value="1">Erkek (1)</option>
                        <option value="0">Kadın (0)</option>
                    </select>
                </div>

                {/* 3. Göğüs Ağrısı */}
                <div className="flex flex-col">
                    <label className="mb-1 text-xs font-semibold text-slate-600">Göğüs Ağrısı (CP)</label>
                    <select name="cp" value={formData.cp} onChange={handleChange} className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white">
                        <option value="0">Tip 0 (Tipik Anjina)</option>
                        <option value="1">Tip 1 (Atipik Anjina)</option>
                        <option value="2">Tip 2 (Anjinal Olmayan)</option>
                        <option value="3">Tip 3 (Asemptomatik)</option>
                    </select>
                </div>

                {/* 4. Dinlenik Tansiyon */}
                <div className="flex flex-col">
                    <label className="mb-1 text-xs font-semibold text-slate-600">Dinlenik Tansiyon (Trestbps)</label>
                    <input type="number" name="trestbps" value={formData.trestbps} onChange={handleChange} placeholder="Örn: 130" className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                </div>

                {/* 5. Kolesterol */}
                <div className="flex flex-col">
                    <label className="mb-1 text-xs font-semibold text-slate-600">Kolesterol (Chol)</label>
                    <input type="number" name="chol" value={formData.chol} onChange={handleChange} placeholder="Örn: 240" className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                </div>

                {/* 6. Açlık Kan Şekeri */}
                <div className="flex flex-col">
                    <label className="mb-1 text-xs font-semibold text-slate-600">Açlık Şekeri {'>'} 120 (FBS)</label>
                    <select name="fbs" value={formData.fbs} onChange={handleChange} className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white">
                        <option value="0">Hayır / Normal (0)</option>
                        <option value="1">Evet / Yüksek (1)</option>
                    </select>
                </div>

                {/* 7. Dinlenik EKG */}
                <div className="flex flex-col">
                    <label className="mb-1 text-xs font-semibold text-slate-600">Dinlenik EKG (RestECG)</label>
                    <select name="restecg" value={formData.restecg} onChange={handleChange} className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white">
                        <option value="0">Normal (0)</option>
                        <option value="1">ST-T Dalga Anormalliği (1)</option>
                        <option value="2">Sol Ventrikül Hipertrofisi (2)</option>
                    </select>
                </div>

                {/* 8. Maksimum Nabız */}
                <div className="flex flex-col">
                    <label className="mb-1 text-xs font-semibold text-slate-600">Maksimum Nabız (Thalach)</label>
                    <input type="number" name="thalach" value={formData.thalach} onChange={handleChange} placeholder="Örn: 150" className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                </div>

                {/* 9. Egzersiz Anjinası */}
                <div className="flex flex-col">
                    <label className="mb-1 text-xs font-semibold text-slate-600">Egzersiz Anjinası (Exang)</label>
                    <select name="exang" value={formData.exang} onChange={handleChange} className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white">
                        <option value="0">Yok (0)</option>
                        <option value="1">Var (1)</option>
                    </select>
                </div>

                {/* 10. ST Çökmesi */}
                <div className="flex flex-col">
                    <label className="mb-1 text-xs font-semibold text-slate-600">ST Çökmesi (Oldpeak)</label>
                    <input type="number" step="0.1" name="oldpeak" value={formData.oldpeak} onChange={handleChange} placeholder="Örn: 1.5" className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                </div>

                {/* 11. Eğim (Slope) */}
                <div className="flex flex-col">
                    <label className="mb-1 text-xs font-semibold text-slate-600">ST Eğimi (Slope)</label>
                    <select name="slope" value={formData.slope} onChange={handleChange} className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white">
                        <option value="0">Yukarı Eğim (0)</option>
                        <option value="1">Düz (1)</option>
                        <option value="2">Aşağı Eğim (2)</option>
                    </select>
                </div>

                {/* 12. Renkli Damar Sayısı */}
                <div className="flex flex-col">
                    <label className="mb-1 text-xs font-semibold text-slate-600">Damar Sayısı (CA)</label>
                    <select name="ca" value={formData.ca} onChange={handleChange} className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white">
                        <option value="0">0 Damar</option>
                        <option value="1">1 Damar</option>
                        <option value="2">2 Damar</option>
                        <option value="3">3 Damar</option>
                    </select>
                </div>

                {/* 13. Talyum Testi */}
                <div className="flex flex-col">
                    <label className="mb-1 text-xs font-semibold text-slate-600">Talyum Testi (Thal)</label>
                    <select name="thal" value={formData.thal} onChange={handleChange} className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white">
                        <option value="0">Normal (0)</option>
                        <option value="1">Sabit Defekt (1)</option>
                        <option value="2">Geri Döndürülebilir Defekt (2)</option>
                    </select>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`w-full px-8 py-3 font-semibold text-white transition-all rounded-xl shadow-lg hover:shadow-xl ${loading
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary'
                        }`}
                >
                    {loading ? 'Analiz Ediliyor...' : 'Risk Analizi Başlat'}
                </button>
            </div>
        </div>
    );
};

export default RiskForm;
