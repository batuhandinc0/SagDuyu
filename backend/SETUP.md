# SagDuyu Backend - Kurulum Rehberi

## Backend Dosya Yapısı Kontrolü ✅

Backend klasörünüz şu yapıya sahip olmalı:

```
backend/
├── config/
│   └── db.config.js          ✅
├── controllers/
│   ├── authController.js     ✅
│   ├── userController.js     ✅
│   └── labController.js      ✅
├── middleware/
│   └── auth.js               ✅
├── models/
│   ├── User.js              ✅
│   ├── Doctor.js            ✅
│   ├── Patient.js           ✅
│   ├── LabResult.js         ✅
│   ├── Appointment.js       ✅
│   └── index.js             ✅
├── routes/
│   ├── auth.js              ✅
│   ├── user.js              ✅
│   └── lab.js               ✅
├── .env                     ✅
├── package.json             ✅
└── server.js                ✅
```

## 1. Bağımlılıkları Yükleme

Terminal'de backend klasörüne gidin:

```bash
cd backend
npm install
```

## 2. Veritabanı Kurulumu

### MySQL'de Veritabanı Oluşturun:

```bash
# MySQL'e giriş yapın
mysql -u root -p

# Veritabanı kurulum scriptini çalıştırın
source database-setup.sql;
```

### Manuel olarak da yapabilirsiniz:

```sql
-- Veritabanı oluştur
CREATE DATABASE tubitak_sagduyu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Kullanıcı oluştur (isteğe bağlı)
CREATE USER 'sagduyu_user'@'localhost' IDENTIFIED BY 'sagduyu_password_2024';
GRANT ALL PRIVILEGES ON tubitak_sagduyu.* TO 'sagduyu_user'@'localhost';
FLUSH PRIVILEGES;
```

## 3. .env Dosyasını Kontrol Edin

`backend/.env` dosyasındaki veritabanı bilgilerini kontrol edin:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=konya42
MYSQL_DATABASE=tubitak_sagduyu
```

## 4. Uygulamayı Başlatın

```bash
# Development modunda başlat
npm run dev

# Veya normal başlat
npm start
```

## 5. Test Etme

Sunucu başladıktan sonra:

- **Health Check**: http://localhost:5000/health
- **API Docs**: http://localhost:5000/api

## Olası Hatalar ve Çözümler

### MySQL Bağlantı Hatası
```bash
# MySQL servisinin çalıştığını kontrol edin
sudo systemctl status mysql

# MySQL'e giriş testi
mysql -u root -p
```

### Port Zaten Kullanımda
```bash
# Port 5000'i kullanan süreci kontrol edin
netstat -tulpn | grep 5000

# Veya farklı port kullanın
PORT=3001 npm run dev
```

### Bağımlılık Hatası
```bash
# Node_modules'ı temizleyin
rm -rf node_modules package-lock.json

# Yeniden yükleyin
npm install
```

## Güvenlik Önemli Notlar

1. **JWT_SECRET** değiştirin - production'da güçlü bir secret kullanın
2. **Veritabanı parolasını** değiştirin
3. **CORS** ayarlarını production için güncelleyin
4. **Rate limiting** ayarlarını ihtiyacınıza göre ayarlayın

## Başlatma Kontrol Listesi

- [ ] `npm install` başarılı
- [ ] MySQL veritabanı oluşturuldu
- [ ] `.env` dosyası doğru yapılandırıldı
- [ ] `npm run dev` çalışıyor
- [ ] `http://localhost:5000/health` yanıt veriyor

Tüm kontroller tamamlandıktan sonra backend hazır olacak!