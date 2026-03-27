import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true
        });
    }, []);

    return (
        <div className="landing-page-wrapper">
            {/* Header */}
            <header className="header">
                <div className="container nav-wrapper">
                    <a href="#" className="logo">
                        <i className="fa-solid fa-brain"></i>
                        SagDuyu <span>AI</span>
                    </a>

                    <nav>
                        <ul className="nav-links">
                            <li><a href="#about" className="nav-link">Proje Hakkında</a></li>
                            <li><a href="#method" className="nav-link">Yöntem</a></li>
                            <li><a href="#tech" className="nav-link">Altyapı</a></li>
                            <li><a href="#team" className="nav-link">Ekip</a></li>
                        </ul>
                    </nav>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button onClick={() => navigate('/login')} className="login-btn">
                            <i className="fa-solid fa-right-to-bracket"></i> Giriş / Kayıt
                        </button>
                        <div className="tubitak-logo-small">
                            <i className="fa-solid fa-certificate"></i> TÜBİTAK 2209-A
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero-section" id="about">
                <div className="hero-bg-shape"></div>
                <div className="container">
                    <div className="hero-content">
                        {/* Sol Taraf: Metin */}
                        <div className="hero-text" data-aos="fade-right">
                            <div className="badge-pill">
                                <i className="fa-solid fa-check-circle" style={{ marginRight: '8px' }}></i> Proje Kodu: 1919B0123000
                            </div>

                            <h1>Multimodal Yapay Zekâ Destekli <br /><span>Sağlık Asistanı</span></h1>

                            {/* Üniversite Adı Buraya Taşındı */}
                            <div className="university-title">
                                Osmaniye Korkut Ata Üniversitesi <br /> Bilgisayar Mühendisliği Bölümü
                            </div>

                            <p>
                                SagDuyu, yapılandırılmış klinik veriler (kan tahlili, demografi) ile tıbbi görüntüleri (röntgen)
                                bütünleşik olarak işleyen, <strong>DenseNet-121</strong> ve <strong>XGBoost</strong> tabanlı hibrit bir karar destek sistemidir.
                            </p>

                            <div className="project-meta">
                                <div className="meta-item">
                                    <span>Proje Yürütücüsü</span>
                                    <strong>Batuhan Dinç</strong>
                                </div>
                                <div className="meta-item">
                                    <span>Akademik Danışman</span>
                                    <strong>Dr. Öğr. Üyesi Ahmet LOĞOĞLU</strong>
                                </div>
                            </div>
                        </div>

                        {/* Sağ Taraf: Statik Mimari Görseli (Demo Yerine) */}
                        <div className="architecture-visual" data-aos="zoom-in">
                            <div className="arch-badge">Sistem Mimarisi</div>

                            {/* Üst Kısım: Girdiler */}
                            <div className="flow-container">
                                <div className="flow-box">
                                    <i className="fa-solid fa-image" style={{ color: 'var(--primary-color)' }}></i>
                                    <h4>Görüntü Verisi</h4>
                                    <p>DenseNet-121</p>
                                </div>

                                <div className="flow-box">
                                    <i className="fa-solid fa-file-medical" style={{ color: 'var(--secondary-color)' }}></i>
                                    <h4>Klinik Veriler</h4>
                                    <p>XGBoost</p>
                                </div>
                            </div>

                            {/* Orta Kısım: Füzyon */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ height: '30px', width: '2px', background: '#cbd5e1', marginBottom: '-5px' }}></div>
                                <div className="fusion-box">
                                    <i className="fa-solid fa-code-merge"></i>
                                    <div className="fusion-label">Multimodal Füzyon</div>
                                </div>
                                <div style={{ height: '30px', width: '2px', background: '#cbd5e1', marginTop: '-5px' }}></div>
                            </div>

                            {/* Alt Kısım: Sonuç */}
                            <div className="result-box">
                                <i className="fa-solid fa-clipboard-check"></i>
                                Entegre Tanı Kararı
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Method & Technologies */}
            <section className="modules-section" id="method">
                <div className="container">
                    <div className="section-title" data-aos="fade-up">
                        <h2>Proje Yöntemi ve Modeller</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Literatürdeki tek modlu sistemlerin kısıtlamalarını aşan bütünleşik yaklaşım.</p>
                    </div>

                    <div className="cards-grid">
                        {/* Card 1 */}
                        <div className="tech-card" data-aos="fade-up" data-aos-delay="100">
                            <div className="icon-box bg-blue">
                                <i className="fa-solid fa-layer-group"></i>
                            </div>
                            <h3>Görüntü İşleme (CNN)</h3>
                            <p>
                                <strong>DenseNet-121</strong> mimarisi kullanılarak CheXpert veri seti üzerinde eğitilen model, radyolojik görüntülerdeki patolojik bulguları yüksek doğrulukla tespit eder.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="tech-card" data-aos="fade-up" data-aos-delay="200">
                            <div className="icon-box bg-green">
                                <i className="fa-solid fa-table-list"></i>
                            </div>
                            <h3>Yapısal Veri Analizi</h3>
                            <p>
                                <strong>XGBoost</strong> (eXtreme Gradient Boosting) algoritması; hastanın yaşı, cinsiyeti, kan değerleri ve semptomlarını analiz ederek klinik risk skorlaması yapar.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="tech-card" data-aos="fade-up" data-aos-delay="300">
                            <div className="icon-box bg-purple">
                                <i className="fa-solid fa-diagram-project"></i>
                            </div>
                            <h3>Karar Destek Füzyonu</h3>
                            <p>
                                Her iki modelden elde edilen olasılık vektörleri, ağırlıklı <strong>Ensemble Learning</strong> yöntemiyle birleştirilerek tek modelden daha güvenilir bir sonuç üretilir.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technological Infrastructure Section (New) */}
            <section className="tech-stack-section" id="tech">
                <div className="container">
                    <div className="section-title" data-aos="fade-up">
                        <h2>Teknolojik Altyapı</h2>
                    </div>

                    <div className="stack-grid">
                        {/* Frontend */}
                        <div className="stack-item" data-aos="zoom-in" data-aos-delay="100">
                            <i className="fa-brands fa-react stack-icon color-react"></i>
                            <div>
                                <div className="stack-title">Frontend</div>
                                <div className="stack-desc">React (Modern SPA)</div>
                            </div>
                        </div>

                        {/* Backend */}
                        <div className="stack-item" data-aos="zoom-in" data-aos-delay="200">
                            <i className="fa-brands fa-node stack-icon color-node"></i>
                            <div>
                                <div className="stack-title">Backend</div>
                                <div className="stack-desc">Node.js</div>
                            </div>
                        </div>

                        {/* AI Backend */}
                        <div className="stack-item" data-aos="zoom-in" data-aos-delay="300">
                            <i className="fa-brands fa-python stack-icon color-python"></i>
                            <div>
                                <div className="stack-title">AI Backend</div>
                                <div className="stack-desc">Python (Deep Learning)</div>
                            </div>
                        </div>

                        {/* Database */}
                        <div className="stack-item" data-aos="zoom-in" data-aos-delay="400">
                            <i className="fa-solid fa-database stack-icon color-mysql"></i>
                            <div>
                                <div className="stack-title">Database</div>
                                <div className="stack-desc">MySQL (Secure)</div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="stack-item" data-aos="zoom-in" data-aos-delay="500">
                            <i className="fa-solid fa-shield-halved stack-icon color-security"></i>
                            <div>
                                <div className="stack-title">Security</div>
                                <div className="stack-desc">KVKK Uyumlu</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="team">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <h3><i className="fa-solid fa-brain" style={{ color: 'var(--primary-color)' }}></i> SagDuyu</h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                Bu proje, <strong>TÜBİTAK 2209-A Üniversite Öğrencileri Araştırma Projeleri Destekleme Programı</strong> kapsamında desteklenmektedir.
                                Sağlıkta dijital dönüşüm vizyonuyla yerli ve milli yapay zekâ çözümleri geliştirmeyi hedefliyoruz.
                            </p>
                        </div>

                        <div className="footer-info">
                            <h4>Proje Yürütücüsü</h4>
                            <ul className="team-list">
                                <li>
                                    <div className="team-avatar" style={{ background: 'rgba(37, 99, 235, 0.2)', color: 'var(--primary-color)' }}>
                                        <i className="fa-solid fa-user"></i>
                                    </div>
                                    <div>
                                        <strong style={{ display: 'block' }}>Batuhan Dinç</strong>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Bilgisayar Müh. Öğrencisi</span>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="footer-info">
                            <h4>Akademik Danışman</h4>
                            <ul className="team-list">
                                <li>
                                    <div className="team-avatar" style={{ background: 'rgba(5, 150, 105, 0.2)', color: 'var(--secondary-color)' }}>
                                        <i className="fa-solid fa-user-tie"></i>
                                    </div>
                                    <div>
                                        <strong style={{ display: 'block' }}>Dr. Öğr. Üyesi Ahmet LOĞOĞLU</strong>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Osmaniye Korkut Ata Üni.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', borderTop: '1px solid #1e293b', marginTop: '60px', paddingTop: '30px', fontSize: '0.8rem', color: '#475569' }}>
                        &copy; 2025 SagDuyu Projesi. Tüm Hakları Saklıdır.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
