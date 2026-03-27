import { FaLaptopMedical } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="pt-16 pb-5 mt-20 text-white bg-slate-800">
            <div className="container px-6 mx-auto max-w-7xl">
                <div className="grid grid-cols-1 gap-10 mb-10 md:grid-cols-4">
                    <div className="md:col-span-2">
                        <a href="#" className="flex items-center gap-2 mb-4 text-2xl font-bold text-white">
                            <FaLaptopMedical className="text-primary" />
                            HealthAI
                        </a>
                        <p className="max-w-xs mt-4 text-slate-400">
                            Bu proje TÜBİTAK desteği ile geliştirilmektedir. Sağlık verilerinin gizliliği ve güvenliği esas alınmıştır.
                        </p>
                    </div>

                    <div>
                        <h4 className="mb-5 font-semibold">Hızlı Erişim</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-slate-400 hover:text-white">Ana Sayfa</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white">Proje Raporu</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white">Ekip Üyeleri</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-5 font-semibold">Yasal</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-slate-400 hover:text-white">Gizlilik Politikası</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white">KVKK Metni</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white">Kullanım Koşulları</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-5 text-sm text-center border-t border-slate-700 text-slate-500">
                    <p>&copy; 2025 HealthAI Project. Tüm hakları saklıdır.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
