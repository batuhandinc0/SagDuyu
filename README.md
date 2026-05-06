# SagDuyu - Sağlık Yönetim Sistemi

Modern, güvenli ve kullanıcı dostu bir sağlık yönetim sistemi. Doktorlar, hastalar ve sağlık kuruluşları için yapay zeka destekli kapsamlı bir platform.

## 🚀 Özellikler

### 🧠 Yapay Zeka (AI) Modülleri ve Model Performansları

SagDuyu platformu, tanı ve klinik karar destek süreçlerini güçlendirmek amacıyla en güncel yapay zeka modelleriyle donatılmıştır:

**1. Kalp Hastalığı Risk Tahmin Modeli (XGBoost)**
- **Algoritma:** XGBoost (Extreme Gradient Boosting)
- **Doğruluk Oranı (Accuracy):** %85.25 (0.8525)
- **ROC-AUC Skoru:** 0.9181
- **Karışıklık Matrisi (Confusion Matrix):** Doğru Negatif (25), Yanlış Pozitif (4), Yanlış Negatif (5), Doğru Pozitif (27)
- **Kullanım Amacı:** Hastanın klinik verilerini (yaş, cinsiyet, tansiyon, kolesterol, fbs, EKG sonuçları vb.) kullanarak erken aşamada kalp hastalığı riskini yüksek doğrulukla analiz etmek.
- **Teknik Çıktı:** Model pipeline nesnesi `heart_disease_pipeline.pkl` ve XGBoost modeli `xgboost_heart_model.json` formatında entegre edilmiştir.

**2. Pnömoni (Zatürre) Tespit Modeli (DenseNet)**
- **Algoritma:** DenseNet (Derin Öğrenme / Evrişimli Sinir Ağları - CNN)
- **Doğruluk Oranı (Test Accuracy):** %89.42 (0.8942)
- **Test Kaybı (Test Loss):** 0.2738
- **Kullanım Amacı:** Tıbbi görüntüleme (Röntgen / X-Ray) verileri üzerinden pnömoni bulgularını saptamak.
- **Teknik Çıktı:** Eğitilmiş ağırlıklar `densenet_pneumonia_model.h5` dosyası üzerinden çalışmaktadır.

**3. Akıllı Check-up (Kural Tabanlı Yorumlama Motoru)**
- **Klinik Analiz & Risk Skorlama:** Hastanın laboratuvar sonuçlarını (Hb, WBC, PLT vb.) analiz ederek referans değerlerle kıyaslar. Anormallikleri tespit eder ve görsel referans çubuklarıyla (horizontal bars) hastanın durumunu değerlendirir.
- **Branş Yönlendirmesi:** Sonuçlara göre hastayı birinci ve ikinci derece ilgili klinik branşlara (Konsültasyon önerileri) otomatik yönlendirir.


### 👨‍⚕️ Doktor Özellikleri
- ✅ Yapay zeka destekli laboratuvar ve görüntüleme analizleri
- ✅ Detaylı hasta yönetimi ve profil görüntüleme
- ✅ Tahlil sonuçları ekleme, yorumlama ve yönetimi
- ✅ Randevu takibi, onay/iptal süreçleri
- ✅ Dashboard üzerinde anlık hasta ve randevu istatistikleri
- ✅ Hasta geçmişi ve kronik rahatsızlık takibi

### 🧑‍🦱 Hasta Özellikleri  
- ✅ Profil yönetimi, demografik ve klinik (boy, kilo, kan grubu) bilgiler
- ✅ Tahlil sonuçlarını yapay zeka analizleriyle (Akıllı Check-up) detaylı görüntüleme
- ✅ Randevu alma ve durumunu takip etme
- ✅ Sağlık geçmişi (alerjiler, geçirilmiş hastalıklar) kayıtları
- ✅ Dashboard ile sağlık verilerinin grafiksel takibi

### 🔒 Güvenlik Özellikleri
- 🔐 JWT (JSON Web Token) tabanlı güvenli kimlik doğrulama
- 🔐 Şifre şifreleme (bcryptjs, 12 round hash)
- 🔐 API CORS koruması
- 🔐 İstek sınırlayıcı (Rate limiting)
- 🔐 Helmet.js ile gelişmiş HTTP güvenlik başlıkları
- 🔐 Girdi doğrulama (Input validation) ve sanitizasyon (XSS ve SQL Injection koruması)

## 🛠 Teknoloji Stack

### Backend
- **Node.js & Express.js** - Sunucu ve API Altyapısı
- **MySQL & Sequelize ORM** - Veritabanı ve Nesne İlişkisel Eşleme
- **JWT & bcryptjs** - Kimlik doğrulama ve şifreleme
- **Multer** - Güvenli dosya ve görüntü yükleme
- **Python / Flask (Opsiyonel)** - Yapay zeka servisleri ile etkileşim için

### Frontend
- **React (Hooks) & Vite** - Yüksek performanslı kullanıcı arayüzü
- **Tailwind CSS** - Modern ve esnek stil sistemi
- **React Icons** - Görsel simge kütüphanesi
- **Axios** - RESTful API istemcisi

### Yapay Zeka (AI)
- **Python, Pandas, Scikit-Learn** - Veri işleme
- **XGBoost** - Makine Öğrenmesi (Tabular veriler)
- **TensorFlow / Keras (DenseNet)** - Derin Öğrenme (Görüntü İşleme)

## 📦 Kurulum

### Backend Kurulumu

1. **Projeyi klonlayın:**
```bash
git clone <repository-url>
cd sagduyu-backend
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Çevre değişkenlerini ayarlayın:**
```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:
```env
PORT=5000
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=tubitak_sagduyu
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

4. **MySQL veritabanını oluşturun:**
```sql
CREATE DATABASE tubitak_sagduyu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. **Uygulamayı başlatın:**
```bash
# Development (Geliştirme)
npm run dev

# Production (Canlı)
npm start
```

### Frontend Kurulumu

1. **Frontend klasörüne gidin:**
```bash
cd sagduyu-frontend
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

## 📊 Veritabanı Mimarisi

### Tablolar

#### `users`
- `id`, `email` (unique), `password` (hash), `role` (doctor/patient), `isActive`, `lastLogin`, `createdAt`, `updatedAt`

#### `doctors`
- `id`, `userId` (FK), `fullName`, `branch`, `hospitalName`, `phone`, `licenseNumber`, `experience`, `isVerified`

#### `patients`
- `id`, `userId` (FK), `fullName`, `tcNo` (unique), `birthDate`, `bloodType`, `height`, `weight`, `gender`, `address`, `emergencyContact`, `emergencyPhone`, `allergies`, `chronicDiseases`

#### `lab_results`
- `id`, `patientId` (FK), `doctorId` (FK), `testType`, `testName`, `resultSummary`, `detailedResults` (JSON), `fileUrl`, `fileName`, `testDate`, `resultDate`, `status`, `priority`, `notes`, `isConfidential`

#### `appointments`
- `id`, `patientId` (FK), `doctorId` (FK), `appointmentDate`, `duration`, `status`, `appointmentType`, `reason`, `notes`, `prescription`, `diagnosis`, `treatment`, `followUpRequired`, `followUpDate`, `cancelledAt`, `cancellationReason`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/refresh-token` - Token yenileme
- `GET /api/auth/me` - Kullanıcı bilgileri

### User Management
- `GET /api/user/profile` - Profil bilgileri
- `PUT /api/user/profile` - Profil güncelle
- `GET /api/user/dashboard` - Dashboard istatistikleri
- `PUT /api/user/change-password` - Şifre değiştir
- `DELETE /api/user/account` - Hesabı deaktif et

### Lab Results & AI
- `POST /api/labs` - Yeni tahlil ekle (doktor)
- `GET /api/labs/my-results` - Kendi tahlilleri ve **Akıllı Check-up** analizleri (hasta)
- `GET /api/labs/pending` - Bekleyen tahliller (doktor)
- `GET /api/labs/:id` - Tahlil detayı
- `PUT /api/labs/:id` - Tahlil güncelle (doktor)

## 🚀 Deployment

### Backend Deployment
1. Environment variables'ları production için ayarlayın.
2. MySQL veritabanını production sunucuda oluşturun.
3. PM2 ile süreci yönetin:
```bash
npm install -g pm2
pm2 start server.js --name sagduyu-backend
```

### Frontend Deployment
1. Build oluşturun:
```bash
npm run build
```
2. Build klasörünü yapılandırılmış (Nginx vb.) web server'a yükleyin.

## 📝 Geliştirme Notları
- Kodlama standartları için **ESLint** ve **Prettier** yapılandırmaları aktiftir.
- Anlamlı (Semantic) commit mesajları kullanılmalıdır.
- Performans iyileştirmesi (Performance Optimization) için Database indexing ve Query optimization uygulanmıştır.

## 📄 Lisans
Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim
- **Proje Sahibi**: Batuhan Dinç
- **E-posta**: batuhandinc@sagduyu.com
- **Website**: https://sagduyu.com