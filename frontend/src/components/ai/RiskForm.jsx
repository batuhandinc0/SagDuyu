import React, { useState } from 'react';

const RiskForm = ({ onAnalyze, loading }) => {
    const [inputString, setInputString] = useState('');

    const handleSubmit = () => {
        onAnalyze(inputString);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col">
                <label className="mb-2 text-sm font-medium text-text-secondary">
                    Veri Seti (Virgülle ayrılmış değerler)
                </label>
                <div className="relative">
                    <textarea
                        value={inputString}
                        onChange={(e) => setInputString(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-main font-mono text-sm resize-none shadow-sm"
                        placeholder="Örn: 57.0, 1.0, 0.0, 150.0, 276.0, 0.0, 0.0, 112.0, 1.0, 0.6, 1.0, 1.0, 1.0"
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-text-light bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        CSV Formatı
                    </div>
                </div>
                <p className="mt-2 text-xs text-text-secondary">
                    Sırasıyla: Age, Sex, CP, Trestbps, Chol, FBS, Restecg, Thalach, Exang, Oldpeak, Slope, CA, Thal
                </p>
            </div>

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
    );
};

export default RiskForm;
