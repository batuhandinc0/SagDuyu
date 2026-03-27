import { useState, useEffect } from 'react';
import { FaFileDownload, FaEye, FaBrain } from 'react-icons/fa';
import api from '../../services/api';

const AIResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const response = await api.get('/labs/my-results');
            if (response.data.success) {
                const aiLabs = response.data.data.labResults.filter(r => r.testType && r.testType.includes('AI'));
                setResults(aiLabs);
            }
        } catch (err) {
            console.error('AI Analiz sonuçları yüklenemedi:', err);
            setError('AI Analiz sonuçları yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-text-main">AI Analiz Sonuçlarım</h1>
                <p className="text-text-secondary">Yapay zeka destekli tıbbi analiz ve değerlendirme raporlarınız</p>
            </div>

            {loading ? (
                <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
            ) : error ? (
                <div className="p-8 text-center text-red-500">{error}</div>
            ) : (
                <div className="overflow-hidden bg-white border shadow-sm border-slate-100 rounded-xl">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-4 font-semibold text-text-secondary">Doktor</th>
                                <th className="p-4 font-semibold text-text-secondary">Analiz Türü</th>
                                <th className="p-4 font-semibold text-text-secondary">Model Adı</th>
                                <th className="p-4 font-semibold text-text-secondary">Tarih</th>
                                <th className="p-4 font-semibold text-text-secondary">Durum</th>
                                <th className="p-4 font-semibold text-text-secondary">Özet</th>
                                <th className="p-4 font-semibold text-text-secondary">Dosya</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {results.map((result) => (
                                <tr key={result.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-medium text-text-main">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-50 text-purple-600">
                                                <FaBrain className="text-sm" />
                                            </div>
                                            {result.doctor?.user?.email || 'Dr. SagDuyu'}
                                        </div>
                                    </td>
                                    <td className="p-4">{result.testType}</td>
                                    <td className="p-4 text-sm text-gray-600">{result.testName}</td>
                                    <td className="p-4">{new Date(result.testDate).toLocaleDateString('tr-TR')}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${result.status === 'completed' || result.status === 'reviewed' ? 'text-green-700 bg-green-100' :
                                                result.status === 'pending' ? 'text-yellow-700 bg-yellow-100' : 'text-gray-700 bg-gray-100'
                                            }`}>
                                            {result.status === 'reviewed' ? 'İncelendi' :
                                                result.status === 'completed' ? 'Tamamlandı' :
                                                    result.status === 'pending' ? 'Bekliyor' : result.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={result.resultSummary}>
                                        {result.resultSummary || '-'}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            {result.fileUrl && (
                                                <a
                                                    href={`http://localhost:5000${result.fileUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-gray-500 transition-colors rounded-lg hover:bg-gray-100"
                                                    title="İndir / Görüntüle"
                                                >
                                                    <FaFileDownload />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {results.length === 0 && (
                        <div className="p-8 text-center text-text-secondary">Kayıtlı AI analiz sonucu bulunamadı.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AIResults;
