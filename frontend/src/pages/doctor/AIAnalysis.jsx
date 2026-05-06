import { useState, useEffect } from 'react';
import { Upload, Heart, BrainCircuit, FileText, Activity, AlertCircle, User, ShieldCheck, Zap } from 'lucide-react';
import api from '../../services/api';
import RiskForm from '../../components/ai/RiskForm';
import RiskGauge from '../../components/ai/RiskGauge';

const AIAnalysis = () => {
    const [activeTab, setActiveTab] = useState('heart');
    
    // Individual states for each model
    const [heartResult, setHeartResult] = useState(null);
    const [xrayResult, setXrayResult] = useState(null);
    const [multimodalResult, setMultimodalResult] = useState(null);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);

    // Patient Selection
    const [patients, setPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [loadingPatients, setLoadingPatients] = useState(true);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await api.get('/user/my-patients');
            if (response.data.success) {
                setPatients(response.data.data);
            }
        } catch (err) {
            console.error('Hastalar yüklenemedi:', err);
        } finally {
            setLoadingPatients(false);
        }
    };

    const handleAnalyzeHeart = async (inputString) => {
        if (!selectedPatientId) {
            setError('Lütfen önce bir hasta seçin.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/labs/predict/heart-disease', {
                patientId: selectedPatientId,
                inputString: inputString
            });

            if (response.data.success) {
                setHeartResult(response.data.data);
                // Reset multimodal result when inputs change
                setMultimodalResult(null);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Analiz sırasında bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzeXRay = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!selectedPatientId) {
            setError('Lütfen önce bir hasta seçin.');
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setUploadedImage(objectUrl);

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('patientId', selectedPatientId);

        try {
            const response = await api.post('/labs/predict/pneumonia', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setXrayResult(response.data.data);
                // Reset multimodal result when inputs change
                setMultimodalResult(null);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Görüntü analizi sırasında bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzeMultimodal = async () => {
        if (!selectedPatientId) {
            setError('Lütfen önce bir hasta seçin.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Heart risk is risk_score, X-Ray risk is confidence (if Zatürre) or 1-confidence (if Normal)
            // But actually we have "raw_score" from backend for DenseNet which is prob of class 1.
            const clinicalRisk = heartResult?.risk_score || 0;
            const imageRisk = xrayResult?.raw_score || 0;

            const response = await api.post('/labs/predict/multimodal-fusion', {
                patientId: selectedPatientId,
                clinical_risk: clinicalRisk,
                image_risk: imageRisk
            });

            if (response.data.success) {
                setMultimodalResult(response.data.data);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'SafeNet Füzyonu sırasında bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const renderHeartTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <h3 className="text-lg font-bold text-text-main mb-4">Veri Girişi</h3>
                <p className="text-sm text-text-secondary mb-6">
                    Hastanın klinik verilerini girerek kalp hastalığı riskini analiz edin.
                </p>
                <RiskForm onAnalyze={handleAnalyzeHeart} loading={loading} />
            </div>

            <div className="lg:col-span-1">
                {heartResult ? (
                    <div className="space-y-6 animate-fade-in">
                        <RiskGauge score={heartResult.risk_score} />

                        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-text-main mb-2">AI Tahmini</h4>
                            <div className={`text-lg font-bold ${heartResult.prediction === 'Hasta' ? 'text-red-500' : 'text-green-500'}`}>
                                {heartResult.prediction}
                            </div>
                            <p className="text-xs text-text-secondary mt-2">
                                Model: XGBoost Classifier
                            </p>
                            <p className="text-xs text-green-600 mt-2 font-medium">
                                * Sonuç hasta profiline kaydedildi.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-text-light border-2 border-dashed border-slate-200 rounded-xl">
                        <BrainCircuit size={48} className="mb-4 opacity-20" />
                        <p>Sonuçları görüntülemek için formu doldurup analiz başlatın.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderXRayTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-text-main mb-2">Röntgen Görüntüsü Yükle</h3>
                    <p className="text-text-secondary mb-4">
                        Analiz için akciğer röntgeni görüntüsünü yükleyin.
                    </p>

                    <div className="relative group">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAnalyzeXRay}
                            className="hidden"
                            id="xray-upload"
                            disabled={loading || !selectedPatientId}
                        />
                        <label
                            htmlFor="xray-upload"
                            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all
                                ${uploadedImage
                                    ? 'border-primary bg-primary/5'
                                    : !selectedPatientId
                                        ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                                        : 'border-slate-300 hover:border-primary hover:bg-slate-50'
                                }`}
                        >
                            {uploadedImage ? (
                                <img src={uploadedImage} alt="Preview" className="h-full object-contain p-2" />
                            ) : (
                                <>
                                    <Upload className="w-10 h-10 text-text-light mb-3 group-hover:text-primary transition-colors" />
                                    <span className="text-sm font-medium text-text-secondary">
                                        Dosya seçmek için tıklayın veya sürükleyin
                                    </span>
                                </>
                            )}
                        </label>
                    </div>
                </div>
            </div>

            <div>
                {loading && (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-text-secondary">Görüntü işleniyor ve analiz ediliyor...</p>
                    </div>
                )}

                {xrayResult && !loading && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                            <h4 className="text-lg font-bold text-text-main mb-4">Analiz Sonucu</h4>

                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <span className="block text-sm text-text-secondary mb-1">Tespit</span>
                                    <span className={`text-2xl font-bold ${xrayResult.prediction.includes('Zatürre') ? 'text-red-500' : 'text-green-500'}`}>
                                        {xrayResult.prediction}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-sm text-text-secondary mb-1">Güven Skoru</span>
                                    <span className="text-2xl font-bold text-primary">
                                        {(xrayResult.confidence * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            <div className="relative rounded-lg overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center mt-4">
                                {uploadedImage && (
                                    <img src={uploadedImage} alt="Analiz Edilen Röntgen" className="w-full max-h-80 object-contain p-2 rounded-lg" />
                                )}
                            </div>
                            
                            <p className="text-xs text-green-600 mt-2 text-center font-bold">
                                * Sonuç ve görüntü hasta profiline kaydedildi.
                            </p>
                        </div>
                    </div>
                )}

                {!xrayResult && !loading && !uploadedImage && (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-text-light border-2 border-dashed border-slate-200 rounded-xl">
                        <Activity size={48} className="mb-4 opacity-20" />
                        <p>Sonuçları görüntülemek için bir röntgen görüntüsü yükleyin.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderMultimodalTab = () => {
        const canRunMultimodal = heartResult !== null && xrayResult !== null;

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-bold text-text-main mb-4">SafeNet Multimodal Mimari</h3>
                    <p className="text-sm text-text-secondary mb-6">
                        Multimodal mimari, klinik tabloları (XGBoost) ve radyolojik görüntüleri (DenseNet) tek bir yapıda birleştirerek tıbbi kararları daha güvenilir hale getiren "Geç Füzyon (Late Fusion)" tekniğini kullanır.
                    </p>

                    <div className="space-y-4 mb-6">
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                            <h4 className="font-semibold text-sm text-slate-700 flex items-center gap-2 mb-2">
                                <Activity size={16} className="text-primary"/> 1. Klinik Analiz (Kalp)
                            </h4>
                            {heartResult ? (
                                <p className="text-sm font-medium">Risk: %{(heartResult.risk_score * 100).toFixed(1)} <span className={heartResult.prediction === 'Hasta' ? 'text-red-500' : 'text-green-500'}>({heartResult.prediction})</span></p>
                            ) : (
                                <p className="text-sm text-slate-500 italic">Henüz çalıştırılmadı.</p>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                            <h4 className="font-semibold text-sm text-slate-700 flex items-center gap-2 mb-2">
                                <FileText size={16} className="text-primary"/> 2. Görüntü İşleme (Röntgen)
                            </h4>
                            {xrayResult ? (
                                <p className="text-sm font-medium">Tespit: {xrayResult.prediction} <span className="text-slate-500">(Güven: %{(xrayResult.confidence * 100).toFixed(1)})</span></p>
                            ) : (
                                <p className="text-sm text-slate-500 italic">Henüz çalıştırılmadı.</p>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleAnalyzeMultimodal}
                        disabled={!canRunMultimodal || loading}
                        className={`w-full flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white transition-all rounded-xl shadow-lg hover:shadow-xl ${
                            !canRunMultimodal || loading
                            ? 'bg-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-600'
                        }`}
                    >
                        <ShieldCheck size={20} />
                        {loading ? 'Füzyon Hesaplanıyor...' : 'SafeNet Algoritmasını Çalıştır'}
                    </button>

                    {!canRunMultimodal && (
                        <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
                            <AlertCircle size={14} />
                            SafeNet'in çalışabilmesi için önce yandaki sekmelerden Klinik ve Röntgen analizlerini tamamlamalısınız.
                        </p>
                    )}
                </div>

                <div>
                    {multimodalResult ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-xl font-bold text-slate-800">SafeNet Karar Özeti</h3>
                                    <div className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full flex items-center gap-1">
                                        <Zap size={14} /> SAFENET AKTİF
                                    </div>
                                </div>
                                
                                <RiskGauge score={multimodalResult.final_risk_score} />

                                <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-100">
                                    <span className="block text-xs font-semibold text-slate-500 mb-1">Nihai Karar</span>
                                    <span className="text-lg font-bold text-slate-800">{multimodalResult.decision}</span>
                                </div>

                                <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
                                    <span className="block text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1">
                                        <BrainCircuit size={14} /> SafeNet Durum Raporu
                                    </span>
                                    <span className="text-sm text-blue-900 font-medium leading-relaxed">
                                        {multimodalResult.safenet_status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                         <div className="h-full flex flex-col items-center justify-center p-8 text-center text-text-light border-2 border-dashed border-slate-200 rounded-xl">
                            <ShieldCheck size={48} className="mb-4 opacity-20" />
                            <p>Modelleri çalıştırdıktan sonra, yapay zekaların kararlarını sentezlemek için SafeNet'i başlatın.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-text-main">AI Destekli Analiz</h1>
                <p className="text-text-secondary">Yapay zeka modelleri ile hastalık risk analizi ve görüntü işleme</p>
            </div>

            {/* Patient Selection */}
            <div className="bg-white border text-left rounded-xl p-4 shadow-sm border-slate-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Analiz Yapılacak Hasta
                </label>
                <div className="relative max-w-md">
                    <select
                        value={selectedPatientId}
                        onChange={(e) => setSelectedPatientId(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none bg-white"
                        disabled={loadingPatients}
                    >
                        <option value="">Hasta Seçiniz...</option>
                        {patients.map((patient) => (
                            <option key={patient.id} value={patient.id}>
                                {patient.name} (TC: {patient.tc})
                            </option>
                        ))}
                    </select>
                    <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
                {!selectedPatientId && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                        <AlertCircle size={14} />
                        Modeli çalıştırmak için lütfen bir hasta seçin.
                    </p>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('heart')}
                    className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'heart' ? 'text-primary' : 'text-text-secondary hover:text-text-main'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Activity size={20} /> Kalp Hastalığı Riski
                    </div>
                    {activeTab === 'heart' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('xray')}
                    className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'xray' ? 'text-primary' : 'text-text-secondary hover:text-text-main'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <FileText size={20} /> Akciğer Röntgeni
                    </div>
                    {activeTab === 'xray' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('multimodal')}
                    className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'multimodal' ? 'text-indigo-600' : 'text-text-secondary hover:text-text-main'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={20} /> Multimodal (SafeNet)
                    </div>
                    {activeTab === 'multimodal' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />
                    )}
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white border shadow-sm border-slate-100 rounded-xl p-6 transition-colors duration-300">
                {activeTab === 'heart' && renderHeartTab()}
                {activeTab === 'xray' && renderXRayTab()}
                {activeTab === 'multimodal' && renderMultimodalTab()}
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-3">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}
        </div>
    );
};

export default AIAnalysis;
