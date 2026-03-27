# SagDuyu - Sağlık Yönetim Sistemi

Modern, güvenli ve kullanıcı dostu bir sağlık yönetim sistemi. Doktorlar ve hastalar için kapsamlı bir platform.

## 🚀 Özellikler

### Doktor Özellikleri
- ✅ Hasta yönetimi ve profiller
- ✅ Tahlil sonuçları ekleme ve yönetimi
- ✅ Randevu takibi ve yönetimi
- ✅ Dashboard istatistikleri
- ✅ Hasta geçmişi görüntüleme

### Hasta Özellikleri  
- ✅ Profil yönetimi ve kişisel bilgiler
- ✅ Tahlil sonuçlarını görüntüleme
- ✅ Randevu alma ve takip etme
- ✅ Sağlık geçmişi görüntüleme
- ✅ Dashboard ile sağlık durumu takibi

### Güvenlik Özellikleri
- 🔐 JWT Token tabanlı kimlik doğrulama
- 🔐 Şifre hashing (bcryptjs)
- 🔐 CORS koruması
- 🔐 Rate limiting
- 🔐 Helmet.js güvenlik başlıkları
- 🔐 Input validasyonu ve sanitization

## 🛠 Teknoloji Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Veritabanı
- **Sequelize** - ORM (Object-Relational Mapping)
- **JWT** - JSON Web Tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library
- **Axios** - HTTP client
- **React Hooks** - State management

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
# Development
npm run dev

# Production
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
- `id` - Primary key
- `email` - E-posta adresi (unique)
- `password` - Hash'li şifre
- `role` - Kullanıcı rolü (doctor/patient)
- `isActive` - Hesap durumu
- `lastLogin` - Son giriş tarihi
- `createdAt`, `updatedAt` - Timestamps

#### `doctors`
- `id` - Primary key
- `userId` - Foreign key to users
- `fullName` - Ad Soyad
- `branch` - Uzmanlık alanı
- `hospitalName` - Hastane adı
- `phone` - Telefon numarası
- `licenseNumber` - Doktor lisans no (opsiyonel)
- `experience` - Deneyim yılı
- `isVerified` - Doğrulama durumu

#### `patients`
- `id` - Primary key
- `userId` - Foreign key to users
- `fullName` - Ad Soyad
- `tcNo` - TC Kimlik No (unique)
- `birthDate` - Doğum tarihi
- `bloodType` - Kan grubu
- `height` - Boy (cm)
- `weight` - Kilo (kg)
- `gender` - Cinsiyet
- `address` - Adres
- `emergencyContact` - Acil durum kişisi
- `emergencyPhone` - Acil durum telefonu
- `allergies` - Alerjiler
- `chronicDiseases` - Kronik hastalıklar

#### `lab_results`
- `id` - Primary key
- `patientId` - Foreign key to patients
- `doctorId` - Foreign key to doctors
- `testType` - Test türü
- `testName` - Test adı
- `resultSummary` - Sonuç özeti
- `detailedResults` - Detaylı sonuçlar (JSON)
- `fileUrl` - Dosya yolu
- `fileName` - Dosya adı
- `testDate` - Test tarihi
- `resultDate` - Sonuçlanma tarihi
- `status` - Durum (pending/in_progress/completed/reviewed)
- `priority` - Öncelik
- `notes` - Doktor notları
- `isConfidential` - Gizli sonuç

#### `appointments`
- `id` - Primary key
- `patientId` - Foreign key to patients
- `doctorId` - Foreign key to doctors
- `appointmentDate` - Randevu tarihi
- `duration` - Süre (dakika)
- `status` - Durum
- `appointmentType` - Randevu türü
- `reason` - Sebep
- `notes` - Notlar
- `prescription` - Reçete
- `diagnosis` - Tanı
- `treatment` - Tedavi planı
- `followUpRequired` - Takip gerekli mi
- `followUpDate` - Takip tarihi
- `cancelledAt` - İptal tarihi
- `cancellationReason` - İptal sebebi

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/register    - Kullanıcı kaydı
POST /api/auth/login       - Kullanıcı girişi
POST /api/auth/refresh-token - Token yenileme
GET  /api/auth/me          - Kullanıcı bilgileri
```

### User Management
```
GET  /api/user/profile     - Profil bilgileri
PUT  /api/user/profile     - Profil güncelle
GET  /api/user/dashboard   - Dashboard istatistikleri
PUT  /api/user/change-password - Şifre değiştir
DELETE /api/user/account   - Hesabı deaktif et
POST /api/user/reactivate  - Hesabı yeniden aktif et
```

### Lab Results
```
POST /api/labs             - Yeni tahlil ekle (doktor)
GET  /api/labs/my-results  - Kendi tahliller (hasta)
GET  /api/labs/pending     - Bekleyen tahliller (doktor)
GET  /api/labs/:id         - Tahlil detayı
PUT  /api/labs/:id         - Tahlil güncelle (doktor)
DELETE /api/labs/:id       - Tahlil sil (doktor)
GET  /api/labs/patient/:patientId - Hastaya ait tahliller (doktor)
```

## 🎨 Frontend Kullanımı

### AuthModal Bileşeni

```jsx
import AuthModal from './components/AuthModal';
import Navbar from './components/Navbar';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthModalOpen(false);
  };

  return (
    <div>
      <Navbar 
        onLoginClick={() => setIsAuthModalOpen(true)}
        user={user}
        onLogout={() => {
          localStorage.clear();
          setUser(null);
        }}
      />
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}
```

### Navbar'da Kullanım

```jsx
import { FiUser, FiLogOut } from 'react-icons/fi';

const Navbar = ({ user, onLoginClick, onLogout }) => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">SagDuyu</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <FiUser className="w-5 h-5" />
                <span>{user.profile.fullName}</span>
                <button onClick={onLogout}>
                  <FiLogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Giriş Yap
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
```

## 🔒 Güvenlik

### Authentication Flow
1. Kullanıcı giriş yapar
2. Backend JWT token oluşturur
3. Token frontend'de localStorage'a kaydedilir
4. Her API isteğinde Authorization header ile token gönderilir
5. Middleware token'ı doğrular ve kullanıcı bilgilerini req.user'a ekler

### Password Security
- bcryptjs ile 12 round hash'leme
- Minimum 6 karakter şartı
- En az bir büyük harf, bir küçük harf ve bir rakam gereksinimi

### Input Validation
- express-validator ile server-side validation
- Client-side React validation
- XSS koruması
- SQL injection koruması (Sequelize ORM)

## 🚀 Deployment

### Backend Deployment
1. Environment variables'ları production için ayarlayın
2. MySQL veritabanını production server'da oluşturun
3. PM2 ile process management kurun:
```bash
npm install -g pm2
pm2 start server.js --name sagduyu-backend
```

### Frontend Deployment
1. Build oluşturun:
```bash
npm run build
```
2. Build klasörünü web server'a yükleyin

## 📝 Geliştirme Notları

### Kodlama Standartları
- ESLint ve Prettier kullanın
- Semantic commit messages
- Code review süreci
- Unit test yazımı

### Database Migration
```bash
# Sequelize sync (development)
npm run migrate

# Production'da manual migration önerilir
```

### Error Handling
- Tüm API endpoints hata yakalama içerir
- User-friendly error messages
- Server logs için console.error kullanımı
- 404 ve 500 error handlers

### Performance Optimization
- Database indexing
- Query optimization
- Caching strategies
- File compression
- Image optimization

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Proje Sahibi**: SagDuyu Team
- **E-posta**: support@sagduyu.com
- **Website**: https://sagduyu.com

## 🙏 Teşekkürler

Bu projeyi geliştirmek için katkıda bulunan tüm geliştiricilere teşekkürlerimizi sunarız.