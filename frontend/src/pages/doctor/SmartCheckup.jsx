import React, { useState, useEffect } from 'react';
import { 
    Activity, FileDigit, HeartPulse, AlertTriangle, CheckCircle, 
    Brain, UserCircle, Stethoscope, Syringe, FileText, 
    RefreshCcw, Play, Loader2, GitMerge, ChevronRight
} from 'lucide-react';
import { predictLabSeverity } from '../../services/labAnalysisService';
import api from '../../services/api';

const initialFormState = {
    patient_id: '',
    hemoglobin: '',
    wbc: '',
    rbc: '',
    hematocrit: '',
    mcv: '',
    mch: '',
    mchc: '',
    platelet_count: '',
    rdw: '',
    neutrophils: '',
    lymphocytes: '',
    monocytes: ''
};

const sampleData = {
    patient_id: '',
    hemoglobin: 9.8,
    wbc: 13500,
    rbc: 4.1,
    hematocrit: 35.0,
    mcv: 78.5,
    mch: 26.2,
    mchc: 32.5,
    platelet_count: 145000,
    rdw: 16.2,
    neutrophils: 75.5,
    lymphocytes: 18.2,
    monocytes: 5.5
};

const inputFields = [
    { name: 'hemoglobin', label: 'Hemoglobin (g/dL)', type: 'number', step: '0.1', placeholder: 'Örn: 14.5' },
    { name: 'wbc', label: 'WBC (cells/µL)', type: 'number', step: '1', placeholder: 'Örn: 7500' },
    { name: 'rbc', label: 'RBC (million/µL)', type: 'number', step: '0.01', placeholder: 'Örn: 4.8' },
    { name: 'hematocrit', label: 'Hematocrit (%)', type: 'number', step: '0.1', placeholder: 'Örn: 43.5' },
    { name: 'mcv', label: 'MCV (fL)', type: 'number', step: '0.1', placeholder: 'Örn: 90.0' },
    { name: 'mch', label: 'MCH (pg)', type: 'number', step: '0.1', placeholder: 'Örn: 30.5' },
    { name: 'mchc', label: 'MCHC (g/dL)', type: 'number', step: '0.1', placeholder: 'Örn: 33.5' },
    { name: 'platelet_count', label: 'Platelet (cells/µL)', type: 'number', step: '1', placeholder: 'Örn: 250000' },
    { name: 'rdw', label: 'RDW (%)', type: 'number', step: '0.1', placeholder: 'Örn: 13.0' },
    { name: 'neutrophils', label: 'Neutrophils (%)', type: 'number', step: '0.1', placeholder: 'Örn: 60.5' },
    { name: 'lymphocytes', label: 'Lymphocytes (%)', type: 'number', step: '0.1', placeholder: 'Örn: 30.5' },
    { name: 'monocytes', label: 'Monocytes (%)', type: 'number', step: '0.1', placeholder: 'Örn: 5.5' },
];

const ParameterBar = ({ label, value, unit, minNormal, maxNormal, minAbs, maxAbs }) => {
    let position = ((value - minAbs) / (maxAbs - minAbs)) * 100;
    if (position < 0) position = 0;
    if (position > 100) position = 100;
    
    let statusColor = "bg-green-500";
    let statusText = "Normal";
    
    if (value < minNormal) {
        statusColor = "bg-blue-500";
        statusText = "Düşük";
    } else if (value > maxNormal) {
        statusColor = "bg-red-500";
        statusText = "Yüksek";
    }
    
    if (value >= minNormal && value < minNormal + (maxNormal-minNormal)*0.1) {
        statusColor = "bg-emerald-500";
        statusText = "Sınırda Düşük";
    } else if (value <= maxNormal && value > maxNormal - (maxNormal-minNormal)*0.1) {
        statusColor = "bg-orange-500";
        statusText = "Sınırda Yüksek";
    }

    return (
        <div className="mb-4">
            <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-700">{label} <span className="font-normal text-slate-400">({unit})</span></span>
                <span className={`font-bold ${statusColor.replace('bg-', 'text-')}`}>{value}</span>
            </div>
            <div className="relative h-2 bg-slate-100 rounded-full w-full">
                <div className="absolute h-full bg-green-100/50 border-x border-green-200" 
                     style={{ 
                         left: `${((minNormal - minAbs) / (maxAbs - minAbs)) * 100}%`,
                         width: `${((maxNormal - minNormal) / (maxAbs - minAbs)) * 100}%` 
                     }}>
                </div>
                <div className={`absolute h-3.5 w-3.5 -mt-[3px] rounded-full border-2 border-white shadow-sm ${statusColor} transition-all`}
                     style={{ left: `calc(${position}% - 6px)` }}>
                </div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 uppercase font-bold tracking-wider">
                <span>{minAbs}</span>
                <span className={`${statusColor.replace('bg-', 'text-')}`}>{statusText}</span>
                <span>{maxAbs}</span>
            </div>
        </div>
    );
};

const SmartCheckup = () => {
    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await api.get('/user/my-patients');
                if (response.data.success) {
                    setPatients(response.data.data);
                }
            } catch (err) {
                console.error("Hastalar yüklenemedi", err);
            }
        };
        fetchPatients();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFillSample = () => {
        setFormData(prev => ({ ...sampleData, patient_id: prev.patient_id }));
        setError('');
        setResult(null);
    };

    const handleClear = () => {
        setFormData(initialFormState);
        setError('');
        setResult(null);
    };

    const validateForm = () => {
        const requiredFields = [
            'hemoglobin', 'wbc', 'rbc', 'hematocrit', 'mcv', 'mch', 
            'mchc', 'platelet_count', 'rdw', 'neutrophils', 'lymphocytes', 'monocytes'
        ];
        for (let field of requiredFields) {
            if (!formData[field] || isNaN(formData[field])) {
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setError('Lütfen seçili alanları eksiksiz ve sayısal olarak doldurun.');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            let patientNameStr = formData.patient_id;
            if (formData.patient_id) {
                const pat = patients.find(p => p.tc === formData.patient_id);
                if (pat) patientNameStr = pat.name;
            }

            const floatData = {
                patient_id: patientNameStr,
                hemoglobin: parseFloat(formData.hemoglobin),
                wbc: parseFloat(formData.wbc),
                rbc: parseFloat(formData.rbc),
                hematocrit: parseFloat(formData.hematocrit),
                mcv: parseFloat(formData.mcv),
                mch: parseFloat(formData.mch),
                mchc: parseFloat(formData.mchc),
                platelet_count: parseFloat(formData.platelet_count),
                rdw: parseFloat(formData.rdw),
                neutrophils: parseFloat(formData.neutrophils),
                lymphocytes: parseFloat(formData.lymphocytes),
                monocytes: parseFloat(formData.monocytes)
            };

            const data = await predictLabSeverity(floatData);
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (score) => {
        if (score <= 30) return 'text-green-500';
        if (score <= 60) return 'text-amber-500';
        return 'text-red-500';
    };

    const getRiskBadge = (level) => {
        switch(level) {
            case 'Düşük Risk': return 'bg-green-100 text-green-700 border-green-200';
            case 'Orta Risk': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Yüksek Risk': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <Activity className="text-primary w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Lab Analiz & Akıllı Check-up</h1>
                        <p className="text-slate-500 mt-1">CBC kan tahlili parametreleriyle hastalık sınıflandırması ve klinik karar destek sistemi (v.02).</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-400"></div>
                        <div className="flex items-center gap-2 mb-6">
                            <FileDigit className="text-primary w-5 h-5" />
                            <h2 className="text-lg font-bold text-slate-800">Tahlil Verileri (CBC)</h2>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="col-span-full">
                                    <label className="block text-xs font-medium text-slate-600 mb-1.5 ml-1">
                                        Hasta Seçimi
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                            <UserCircle className="w-4 h-4" />
                                        </div>
                                        <select 
                                            name="patient_id" 
                                            value={formData.patient_id} 
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 outline-none transition-all focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 pl-10 appearance-none"
                                        >
                                            <option value="">Hasta Seçin (Opsiyonel)</option>
                                            {patients.map(p => (
                                                <option key={p.tc} value={p.tc}>{p.name} - {p.tc}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {inputFields.map((field) => (
                                    <div key={field.name}>
                                        <label className="block text-xs font-medium text-slate-600 mb-1.5 ml-1">
                                            {field.label}
                                        </label>
                                        <input
                                            type={field.type}
                                            step={field.step}
                                            name={field.name}
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                            placeholder={field.placeholder}
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 outline-none transition-all duration-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium px-4 py-3 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Analiz Ediliyor...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-5 h-5" />
                                            <span>Akıllı Analizi Başlat</span>
                                        </>
                                    )}
                                </button>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={handleFillSample}
                                        className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-4 py-2.5 rounded-xl transition-colors border border-blue-100"
                                    >
                                        <Activity className="w-4 h-4" />
                                        <span className="text-sm">Örnek Doldur</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleClear}
                                        className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium px-4 py-2.5 rounded-xl transition-colors"
                                    >
                                        <RefreshCcw className="w-4 h-4" />
                                        <span className="text-sm">Temizle</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="xl:col-span-8 flex flex-col h-full min-h-[500px]">
                    {!result && !loading ? (
                        <div className="flex-1 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                                <Brain className="w-12 h-12 text-primary/40" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Laboratuvar Yapay Zekası Bekleniyor</h3>
                            <p className="text-slate-500 max-w-md">
                                Sol taraftaki hastanızın CBC formunu doldurarak veya örnek butonunu kullanarak kural destekli ve ML tabanlı klinik analizi başlatın.
                            </p>
                        </div>
                    ) : loading ? (
                        <div className="flex-1 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-white via-primary/5 to-white animate-pulse"></div>
                            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4 relative z-10" />
                            <h3 className="text-lg font-bold text-slate-800 relative z-10">Laboratuvar Verileri İşleniyor...</h3>
                            <p className="text-slate-500 relative z-10">Severity modeli ve kural tabanlı motorlar değerlendiriyor.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-start animate-fade-in-up">
                            
                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                                    <div className="text-sm font-medium text-slate-500 mb-4">Hesaplanmış Risk Skoru</div>
                                    <div className="relative w-28 h-28 flex items-center justify-center mb-2">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                                            <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="12" fill="transparent"
                                                className={`transition-all duration-1000 ease-out ${getRiskColor(result.risk_score)}`}
                                                strokeDasharray="301.59"
                                                strokeDashoffset={301.59 - (301.59 * result.risk_score) / 100}
                                                strokeLinecap="round" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className={`text-3xl font-black ${getRiskColor(result.risk_score)}`}>{result.risk_score}</span>
                                            <span className="text-[10px] uppercase font-bold text-slate-400">/ 100</span>
                                        </div>
                                    </div>
                                    <div className={`mt-2 px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full border ${getRiskBadge(result.warning_level)}`}>
                                        {result.warning_level}
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Brain className="w-5 h-5 text-primary" />
                                            <h3 className="text-sm font-bold text-slate-700">Model Çıktısı</h3>
                                        </div>
                                        <div className="text-3xl font-black text-slate-800 capitalize mb-1">{result.predicted_severity} Sınıfı</div>
                                        <p className="text-sm text-slate-500">Mevcut anomali şiddet tahmini.</p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <div className="flex justify-between items-center text-xs mb-1.5">
                                            <span className="font-medium text-slate-500">Sınıflandırma Güveni</span>
                                            <span className="font-bold text-slate-700">{(result.model_confidence * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${result.model_confidence * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Stethoscope className="w-5 h-5 text-blue-500" />
                                            <h3 className="text-sm font-bold text-slate-700">Branş Yönlendirmesi</h3>
                                        </div>
                                        {result.recommended_departments && result.recommended_departments.length > 0 ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-1">Birincil Branş</div>
                                                    <div className="text-xl font-bold text-slate-800">
                                                        {result.recommended_departments[0]}
                                                    </div>
                                                </div>
                                                {result.recommended_departments.length > 1 && (
                                                    <div>
                                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><GitMerge className="w-3 h-3"/> Konsültasyon</div>
                                                        <div className="text-sm font-semibold text-slate-600">
                                                            {result.recommended_departments.slice(1).join(' / ')}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-slate-500 text-sm">Öneri Yok</span>
                                        )}
                                    </div>
                                    {result.patient_id && (
                                        <div className="mt-4 pt-3 border-t border-slate-100 font-mono text-[10px] text-slate-400 flex justify-between">
                                            <span>HASTA ID / İSİM:</span>
                                            <span className="truncate max-w-[120px] text-right font-bold text-slate-500">{result.patient_id}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full col-span-1 lg:col-span-2">
                                <div className="flex items-center gap-2 mb-5">
                                    <Activity className="w-5 h-5 text-indigo-500" />
                                    <h3 className="text-base font-bold text-slate-800">Kritik Parametre Analiz Çubuğu</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                    <ParameterBar label="Hemoglobin (Hb)" value={parseFloat(formData.hemoglobin)} unit="g/dL" minNormal={12.0} maxNormal={16.0} minAbs={5.0} maxAbs={20.0} />
                                    <ParameterBar label="WBC" value={parseFloat(formData.wbc)} unit="cells/µL" minNormal={4000} maxNormal={10000} minAbs={1000} maxAbs={20000} />
                                    <ParameterBar label="Platelet (PLT)" value={parseFloat(formData.platelet_count)} unit="cells/µL" minNormal={150000} maxNormal={450000} minAbs={50000} maxAbs={600000} />
                                    <ParameterBar label="RBC" value={parseFloat(formData.rbc)} unit="million/µL" minNormal={4.0} maxNormal={5.5} minAbs={2.0} maxAbs={8.0} />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
                                <div className="flex items-center gap-2 mb-5">
                                    <FileText className="w-5 h-5 text-amber-500" />
                                    <h3 className="text-base font-bold text-slate-800">Tanı ve Yorum Adayları</h3>
                                </div>
                                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-5 text-amber-900 border-l-4 border-l-amber-400 text-sm leading-relaxed font-medium">
                                    "{result.clinical_comment}"
                                </div>
                                
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Modelin Hedeflediği Olasılık Sistematiği</h4>
                                <ul className="space-y-2.5 flex-1">
                                    {result.possible_diagnoses.map((diag, index) => (
                                        <li key={index} className="flex gap-3 text-sm text-slate-700 items-start">
                                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                            <span className="font-medium">{diag}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
                                <div className="flex items-center gap-2 mb-5">
                                    <Syringe className="w-5 h-5 text-indigo-500" />
                                    <h3 className="text-base font-bold text-slate-800">Önerilen Ek Tetkikler</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-2.5 flex-1">
                                    {result.recommended_tests.map((test, index) => (
                                        <div key={index} className="bg-indigo-50/50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all p-3.5 rounded-xl flex items-center justify-between group cursor-default duration-300">
                                            <span className="font-semibold text-slate-700 text-sm">{test}</span>
                                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-indigo-500 opacity-50 group-hover:opacity-100 transition-opacity shadow-sm">
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-100">
                                    <p className="text-xs text-slate-400 italic flex items-center gap-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                        Bu sonuçlar tanı koydurmaz, sadece hekim karar destek sistemi amaçlıdır.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SmartCheckup;
