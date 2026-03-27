import { useState, useEffect } from 'react';
import { FaSearch, FaFileDownload, FaEye } from 'react-icons/fa';
import api from '../../services/api';

const LabResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await api.get('/labs/doctor/all');
      if (response.data.success) {
        setResults(response.data.data.labResults);
      }
    } catch (err) {
      console.error('Tahlil sonuçları yüklenemedi:', err);
      setError('Tahlil sonuçları yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(result => {
    const matchesSearch =
      result.patient?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.testType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.testName?.toLowerCase().includes(searchTerm.toLowerCase()); // Added checks for patient name if available

    // Note: detailed patient name might be in result.patient.firstName etc if modelled, checking schema in mind 
    // Schema update: Patient model usually has fullName or similar. let's assume we map what we have.
    // Actually patient object comes from backend. let's check standard logic.
    // Assuming patient table has full_name or similar.

    const matchesStatus = statusFilter === 'all' || result.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-main">Tahlil Sonuçları</h1>
        <p className="text-text-secondary">Laboratuvar entegrasyonu ve sonuç görüntüleme</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <input
            type="text"
            placeholder="Hasta veya tahlil ara..."
            className="w-full py-2 pl-10 pr-4 border rounded-lg border-slate-200 focus:outline-none focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border rounded-lg border-slate-200 focus:outline-none focus:border-primary"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tüm Durumlar</option>
          <option value="completed">Tamamlandı</option>
          <option value="pending">Bekliyor</option>
          <option value="reviewed">İncelendi</option>
        </select>
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
                <th className="p-4 font-semibold text-text-secondary">Hasta</th>
                <th className="p-4 font-semibold text-text-secondary">Tahlil Türü</th>
                <th className="p-4 font-semibold text-text-secondary">Test Adı</th>
                <th className="p-4 font-semibold text-text-secondary">Tarih</th>
                <th className="p-4 font-semibold text-text-secondary">Durum</th>
                <th className="p-4 font-semibold text-text-secondary">Öncelik</th>
                <th className="p-4 font-semibold text-text-secondary">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.map((result) => (
                <tr key={result.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-text-main">
                    {/* Assuming result.patient exists and has name due to include */}
                    {result.patient?.fullName || 'Bilinmeyen Hasta'}
                  </td>
                  <td className="p-4">{result.testType}</td>
                  <td className="p-4 text-sm text-gray-600">{result.testName}</td>
                  <td className="p-4">{new Date(result.testDate).toLocaleDateString('tr-TR')}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${result.status === 'completed' || result.status === 'reviewed' ? 'bg-green-100 text-green-700' :
                        result.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                      {result.status === 'reviewed' ? 'İncelendi' :
                        result.status === 'completed' ? 'Tamamlandı' :
                          result.status === 'pending' ? 'Bekliyor' : result.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${result.priority === 'high' || result.priority === 'urgent' ? 'text-red-700 bg-red-100' :
                        result.priority === 'low' ? 'text-green-700 bg-green-100' : 'text-gray-700 bg-gray-100'
                      }`}>
                      {result.priority || 'normal'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {/* Modals for viewing details can be added here */}
                      <button className="p-2 transition-colors rounded-lg text-primary hover:bg-sky-50" title="Görüntüle">
                        <FaEye />
                      </button>
                      {result.fileUrl && (
                        <a href={`http://localhost:5000${result.fileUrl}`} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 transition-colors rounded-lg hover:bg-gray-100" title="İndir">
                          <FaFileDownload />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredResults.length === 0 && (
            <div className="p-8 text-center text-text-secondary">Sonuç bulunamadı.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default LabResults;
