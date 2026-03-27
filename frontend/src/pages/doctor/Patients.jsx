import { useState, useEffect } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';
import api from '../../services/api';

const Patients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await api.get('/user/my-patients');
                if (response.data.success) {
                    setPatients(response.data.data);
                }
            } catch (err) {
                console.error('Hasta listesi yüklenemedi:', err);
                setError('Hasta listesi yüklenirken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.tc?.includes(searchTerm)
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text-main">Hasta Yönetimi</h1>
                    <p className="text-text-secondary">Hasta veritabanı ve kayıtları</p>
                </div>
                {/* <button className="btn-primary">
                    <FaPlus /> Yeni Hasta
                </button> */}
            </div>

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-4 top-1/2" />
                    <input
                        type="text"
                        placeholder="Hasta ara (Ad veya TC)..."
                        className="input-search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* <select className="input-modern">
                    <option value="all">Tüm Hastalar</option>
                    <option value="active">Aktif</option>
                </select> */}
            </div>

            {loading ? (
                <div className="text-center p-8">Yükleniyor...</div>
            ) : error ? (
                <div className="text-center p-8 text-red-500">{error}</div>
            ) : (
                <div className="overflow-hidden bg-white border shadow-sm border-slate-100 rounded-xl">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-4 font-semibold text-text-secondary">T.C. Kimlik</th>
                                <th className="p-4 font-semibold text-text-secondary">Ad Soyad</th>
                                <th className="p-4 font-semibold text-text-secondary">Cinsiyet</th>
                                <th className="p-4 font-semibold text-text-secondary">Telefon</th>
                                <th className="p-4 font-semibold text-text-secondary">Kayıt Tarihi</th>
                                <th className="p-4 font-semibold text-text-secondary">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPatients.map((patient, index) => (
                                <tr key={index} className="hover:bg-slate-50">
                                    <td className="p-4">{patient.tc}</td>
                                    <td className="p-4 font-medium text-text-main">{patient.name}</td>
                                    <td className="p-4">{patient.gender}</td>
                                    <td className="p-4">{patient.phone}</td>
                                    <td className="p-4">{patient.date}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${patient.status === 'Aktif'
                                                ? 'text-green-700 bg-green-100'
                                                : 'text-gray-700 bg-gray-100'
                                            }`}>
                                            {patient.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredPatients.length === 0 && (
                        <div className="p-8 text-center text-text-secondary">Kayıtlı hasta bulunamadı.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Patients;
