import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import DenseNet121
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
import matplotlib.pyplot as plt
import os

# --- 1. Veri Yolları ve Parametreler ---
# Google Colab'da verilerinizi 'chest_xray' klasörüne yüklediğinizi varsayıyoruz.
# Eğer Drive'dan çekiyorsanız yolu güncelleyin: '/content/drive/MyDrive/chest_xray'
base_dir = 'chest_xray'
train_dir = os.path.join(base_dir, 'train')
val_dir = os.path.join(base_dir, 'val')
test_dir = os.path.join(base_dir, 'test')

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 10

# --- 2. Veri Yükleme (ImageDataGenerator) ---
print("Veriler yükleniyor...")

# Rescale ile 0-1 arasına sıkıştırma
train_datagen = ImageDataGenerator(rescale=1./255)
val_datagen = ImageDataGenerator(rescale=1./255)
test_datagen = ImageDataGenerator(rescale=1./255)

train_generator = train_datagen.flow_from_directory(
    train_dir,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='binary'
)

val_generator = val_datagen.flow_from_directory(
    val_dir,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='binary'
)

test_generator = test_datagen.flow_from_directory(
    test_dir,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='binary',
    shuffle=False # Test için shuffle kapalı
)

# --- 3. Model Mimarisi (Transfer Learning - DenseNet121) ---
print("Model oluşturuluyor...")

# Base model: DenseNet121 (ImageNet ağırlıklarıyla)
base_model = DenseNet121(weights='imagenet', include_top=False, input_shape=(224, 224, 3))

# Base modelin katmanlarını dondur (Eğitilmesin)
for layer in base_model.layers:
    layer.trainable = False

# Yeni katmanlar ekle
x = base_model.output
x = GlobalAveragePooling2D()(x)
predictions = Dense(1, activation='sigmoid')(x) # Binary classification (Normal vs Pneumonia)

model = Model(inputs=base_model.input, outputs=predictions)

# --- 4. Derleme (Compile) ---
model.compile(optimizer=Adam(learning_rate=0.001),
              loss='binary_crossentropy',
              metrics=['accuracy'])

model.summary()

# --- 5. Eğitim (Training) ---
print("Eğitim başlıyor...")

history = model.fit(
    train_generator,
    epochs=EPOCHS,
    validation_data=val_generator
)

# --- 6. Kaydetme ---
model_save_path = 'densenet_pneumonia_model.h5'
model.save(model_save_path)
print(f"Model kaydedildi: {model_save_path}")

# --- 7. Grafik Çizdirme ---
# Doğruluk (Accuracy) Grafiği
plt.figure(figsize=(12, 4))
plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'], label='Eğitim Doğruluğu')
plt.plot(history.history['val_accuracy'], label='Doğrulama Doğruluğu')
plt.title('Eğitim ve Doğrulama Doğruluğu')
plt.xlabel('Epoch')
plt.ylabel('Doğruluk')
plt.legend()

# Kayıp (Loss) Grafiği
plt.subplot(1, 2, 2)
plt.plot(history.history['loss'], label='Eğitim Kaybı')
plt.plot(history.history['val_loss'], label='Doğrulama Kaybı')
plt.title('Eğitim ve Doğrulama Kaybı')
plt.xlabel('Epoch')
plt.ylabel('Kayıp')
plt.legend()

plt.show()

# --- 8. Test Seti Değerlendirmesi ---
print("Test seti üzerinde değerlendirme yapılıyor...")
test_loss, test_acc = model.evaluate(test_generator)
print(f"Test Accuracy: {test_acc:.4f}")
