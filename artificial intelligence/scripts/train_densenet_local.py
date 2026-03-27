import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import DenseNet121
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
import matplotlib.pyplot as plt
import os

# --- 1. Veri Yolları ve Parametreler ---
# Scriptin bulunduğu klasörden veriye git
base_dir = os.path.join(os.path.dirname(__file__), '../data/DenseNet_chest_xray')
train_dir = os.path.join(base_dir, 'train')
val_dir = os.path.join(base_dir, 'val')
test_dir = os.path.join(base_dir, 'test')

# Klasörlerin varlığını kontrol et
if not os.path.exists(train_dir):
    print(f"HATA: Veri klasörü bulunamadı: {train_dir}")
    exit(1)

IMG_SIZE = (224, 224)
BATCH_SIZE = 16 # Localde bellek sorunu olmaması için düşürdüm
EPOCHS = 5 # Hızlı sonuç için 5 epoch yapalım, gerekirse artırılır

# --- 2. Veri Yükleme (ImageDataGenerator) ---
print("Veriler yükleniyor...")

# Rescale ile 0-1 arasına sıkıştırma
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True
)

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
    shuffle=False
)

# --- 3. Model Mimarisi (Transfer Learning - DenseNet121) ---
print("Model oluşturuluyor...")

# Base model: DenseNet121 (ImageNet ağırlıklarıyla)
base_model = DenseNet121(weights='imagenet', include_top=False, input_shape=(224, 224, 3))

# Base modelin katmanlarını dondur
for layer in base_model.layers:
    layer.trainable = False

# Yeni katmanlar ekle
x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(128, activation='relu')(x) # Ekstra bir dense katman
predictions = Dense(1, activation='sigmoid')(x)

model = Model(inputs=base_model.input, outputs=predictions)

# --- 4. Derleme (Compile) ---
model.compile(optimizer=Adam(learning_rate=0.001),
              loss='binary_crossentropy',
              metrics=['accuracy'])

# --- 5. Eğitim (Training) ---
print(f"Eğitim başlıyor... ({EPOCHS} Epoch)")

# Sınıf Dengesizliğini Giderme (Class Weights)
from sklearn.utils import class_weight
import numpy as np

# Eğitim verisindeki sınıfları al
train_classes = train_generator.classes
class_weights = class_weight.compute_class_weight(
    class_weight='balanced',
    classes=np.unique(train_classes),
    y=train_classes
)
class_weights_dict = dict(enumerate(class_weights))
print(f"Hesaplanan Sınıf Ağırlıkları: {class_weights_dict}")

history = model.fit(
    train_generator,
    epochs=EPOCHS,
    validation_data=val_generator,
    class_weight=class_weights_dict
)

# --- 6. Kaydetme ---
model_dir = os.path.join(os.path.dirname(__file__), '../models')
os.makedirs(model_dir, exist_ok=True)
model_save_path = os.path.join(model_dir, 'densenet_pneumonia_model.h5')

model.save(model_save_path)
print(f"Model kaydedildi: {model_save_path}")

# --- 7. Grafik ve Metrikler ---
# Test seti değerlendirmesi
print("Test seti üzerinde değerlendirme yapılıyor...")
test_loss, test_acc = model.evaluate(test_generator)
print(f"Test Accuracy: {test_acc:.4f}")

# Metrikleri kaydet
metrics_path = os.path.join(model_dir, 'densenet_metrics.txt')
with open(metrics_path, 'w') as f:
    f.write(f"Test Accuracy: {test_acc:.4f}\n")
    f.write(f"Test Loss: {test_loss:.4f}\n")

print("İşlem tamamlandı.")
