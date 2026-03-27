#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
XGBoost Heart Disease Prediction Model Training Script
====================================================

SagDuyu: Multimodal Yapay Zeka Destekli Saglik Asistani
TUBITAK Arastirma Projesi - Kalp Hastaligi Risk Tahmini Modulu

Bu script XGBoost algoritmasini kullanarak kalp hastaligi riskini tahmin eden
optimized bir model egitir ve degerlendirir.

Author: Batuhan Dinç
Tarih: 2025-12-04
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (accuracy_score, precision_score, recall_score, f1_score,
                           confusion_matrix, classification_report, roc_curve, auc, roc_auc_score)
from sklearn.impute import SimpleImputer
import xgboost as xgb
import warnings
import os
from datetime import datetime

# Uyarilari gizle
warnings.filterwarnings('ignore')

# Matplotlib ve seaborn ayarlari
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

class XGBoostHeartDiseaseModel:
    """
    Kalp hastaligi tahmini icin XGBoost model sinifi
    """
    
    def __init__(self, random_state=42):
        self.random_state = random_state
        self.model = None
        self.scaler = None
        self.feature_names = None
        self.results = {}
        
    def load_and_explore_data(self, file_path):
        """Veri setini yukler ve kesifsel veri analizi yapar"""
        print("="*60)
        print("VERI YUKLEME VE KESIF ANALIZI")
        print("="*60)
        
        try:
            self.data = pd.read_csv(file_path)
            print(f"+ Veri basariyla yuklendi: {self.data.shape}")
        except Exception as e:
            print(f"- Veri yukleme hatasi: {e}")
            return False
            
        print(f"\nVeri Seti Bilgileri:")
        print(f"- Satir sayisi: {len(self.data)}")
        print(f"- Sutun sayisi: {len(self.data.columns)}")
        
        # Hedef degisken dagilimi
        target_dist = self.data['target'].value_counts()
        print(f"\nHedef Degisken Dagilimi:")
        print(f"- Sinif 0 (Hastalik Yok): {target_dist[0]} (%{target_dist[0]/len(self.data)*100:.1f})")
        print(f"- Sinif 1 (Hastalik Var): {target_dist[1]} (%{target_dist[1]/len(self.data)*100:.1f})")
        
        return True
        
    def preprocess_data(self):
        """Veri on isleme: eksik deger, aykiri deger, olceklendirme"""
        print("\n" + "="*60)
        print("VERI ON ISLEME")
        print("="*60)
        
        # Ozellikler ve hedef ayrimi
        X = self.data.drop('target', axis=1)
        y = self.data['target']
        
        self.feature_names = X.columns.tolist()
        print(f"Ozellik sayisi: {len(self.feature_names)}")
        
        # Eksik deger kontrolu
        print(f"\n1. Eksik Deger Analizi:")
        missing_info = X.isnull().sum()
        if missing_info.sum() > 0:
            print("Eksik degerler bulundu:")
            for col in missing_info[missing_info > 0].index:
                print(f"  - {col}: {missing_info[col]} eksik deger")
        else:
            print("+ Hic eksik deger bulunamadi")
        
        # Aykiri deger temizleme
        print(f"\n2. Aykiri Deger Temizleme:")
        original_length = len(X)
        
        def remove_outliers_iqr(data, column):
            Q1 = data[column].quantile(0.25)
            Q3 = data[column].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            outliers = data[(data[column] < lower_bound) | (data[column] > upper_bound)]
            return outliers.index
        
        outliers_indices = set()
        numeric_cols = X.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            outlier_idx = remove_outliers_iqr(X, col)
            if len(outlier_idx) > 0:
                print(f"  - {col}: {len(outlier_idx)} aykiri deger")
                outliers_indices.update(outlier_idx)
        
        if len(outliers_indices) > 0:
            X_clean = X.drop(outliers_indices).copy()
            y_clean = y.drop(outliers_indices).copy()
            print(f"  -> {len(outliers_indices)} aykiri deger temizlendi")
        else:
            X_clean = X.copy()
            y_clean = y.copy()
            print("  -> Hic aykiri deger tespit edilmedi")
        
        # Ozellik olceklendirme
        print(f"\n3. Ozellik Olceklendirme:")
        self.scaler = StandardScaler()
        X_scaled = pd.DataFrame(
            self.scaler.fit_transform(X_clean),
            columns=X_clean.columns,
            index=X_clean.index
        )
        print("  -> StandardScaler kullanilarak ozellikler olceklendirildi")
        
        self.X_raw = X_clean
        self.y = y_clean
        self.X_processed = X_scaled
        
        print(f"\nOn Isleme Tamamlandi:")
        print(f"- Final veri boyutu: {self.X_processed.shape}")
        
        return True
        
    def train_model_with_optimization(self):
        """Model egitimi ve hiperparametre optimizasyonu"""
        print("\n" + "="*60)
        print("MODEL EGITIMI VE HIPERPARAMETRE OPTIMIZASYONU")
        print("="*60)
        
        # Veri setini egitim ve test olarak ayir
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            self.X_processed, self.y, 
            test_size=0.2, 
            random_state=self.random_state, 
            stratify=self.y
        )
        
        print(f"Egitim seti: {self.X_train.shape}")
        print(f"Test seti: {self.X_test.shape}")
        
        # XGBoost parametreleri
        base_params = {
            'objective': 'binary:logistic',
            'eval_metric': 'logloss',
            'random_state': self.random_state,
            'n_estimators': 100,
            'max_depth': 6,
            'learning_rate': 0.1,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'gamma': 0,
            'reg_alpha': 0,
            'reg_lambda': 1
        }
        
        # GridSearch parametreleri
        param_grid = {
            'n_estimators': [100, 200, 300],
            'max_depth': [3, 4, 5, 6],
            'learning_rate': [0.05, 0.1, 0.15, 0.2],
            'subsample': [0.8, 0.9, 1.0],
            'colsample_bytree': [0.8, 0.9, 1.0]
        }
        
        print(f"\nGridSearchCV parametreleri optimize ediliyor...")
        xgb_model = xgb.XGBClassifier(**base_params)
        
        # GridSearchCV
        cv_strategy = StratifiedKFold(n_splits=5, shuffle=True, random_state=self.random_state)
        
        grid_search = GridSearchCV(
            estimator=xgb_model,
            param_grid=param_grid,
            cv=cv_strategy,
            scoring='accuracy',
            n_jobs=-1,
            verbose=1
        )
        
        grid_search.fit(self.X_train, self.y_train)
        self.model = grid_search.best_estimator_
        
        print(f"\n+ GridSearchCV tamamlandi")
        print(f"En iyi skor (CV): {grid_search.best_score_:.4f}")
        print(f"En iyi parametreler:")
        for param, value in grid_search.best_params_.items():
            print(f"  - {param}: {value}")
        
        # Performans
        train_pred = self.model.predict(self.X_train)
        test_pred = self.model.predict(self.X_test)
        
        self.results['cv_score'] = grid_search.best_score_
        self.results['train_accuracy'] = accuracy_score(self.y_train, train_pred)
        self.results['test_accuracy'] = accuracy_score(self.y_test, test_pred)
        
        print(f"\nModel Performansi:")
        print(f"  - CV Ortalama Skor: {self.results['cv_score']:.4f}")
        print(f"  - Egitim Dogrulugu: {self.results['train_accuracy']:.4f}")
        print(f"  - Test Dogrulugu: {self.results['test_accuracy']:.4f}")
        
        return True
        
    def evaluate_model(self):
        """Kapsamli model degerlendirmesi"""
        print("\n" + "="*60)
        print("MODEL DEGERLENDIRME")
        print("="*60)
        
        y_pred = self.model.predict(self.X_test)
        y_pred_proba = self.model.predict_proba(self.X_test)[:, 1]
        
        # Metrikleri hesapla
        accuracy = accuracy_score(self.y_test, y_pred)
        precision = precision_score(self.y_test, y_pred)
        recall = recall_score(self.y_test, y_pred)
        f1 = f1_score(self.y_test, y_pred)
        roc_auc = roc_auc_score(self.y_test, y_pred_proba)
        
        self.results.update({
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'roc_auc': roc_auc
        })
        
        print(f"Test Seti Performans Metrikleri:")
        print(f"  + Accuracy:  {accuracy:.4f} (%{accuracy*100:.2f})")
        print(f"  + Precision: {precision:.4f} (%{precision*100:.2f})")
        print(f"  + Recall:    {recall:.4f} (%{recall*100:.2f})")
        print(f"  + F1 Score:  {f1:.4f} (%{f1*100:.2f})")
        print(f"  + ROC AUC:   {roc_auc:.4f} (%{roc_auc*100:.2f})")
        
        # Hedef kontrol
        target_accuracy = 0.85
        if accuracy >= target_accuracy:
            print(f"\n* Hedeflenen dogruluk orani (%{target_accuracy*100}) basarildi!")
        else:
            print(f"\n! Hedeflenen dogruluk orani (%{target_accuracy*100}) asiulamadi.")
            print(f"    Mevcut performans: %{accuracy*100:.2f}")
        
        print(f"\nDetayli Siniflandirma Raporu:")
        print(classification_report(self.y_test, y_pred, target_names=['Hastalik Yok', 'Hastalik Var']))
        
        return True
        
    def create_visualizations(self, save_plots=True):
        """Model performans gorsellestirmeleri"""
        print("\n" + "="*60)
        print("GORSELLESTIRME OLUSTURULUYOR")
        print("="*60)
        
        fig = plt.figure(figsize=(20, 15))
        
        # 1. Confusion Matrix
        plt.subplot(2, 3, 1)
        y_pred = self.model.predict(self.X_test)
        cm = confusion_matrix(self.y_test, y_pred)
        
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=['Hastalik Yok', 'Hastalik Var'],
                   yticklabels=['Hastalik Yok', 'Hastalik Var'])
        plt.title('Confusion Matrix', fontsize=14, fontweight='bold')
        plt.xlabel('Tahmin Edilen')
        plt.ylabel('Gercek')
        
        # 2. ROC Curve
        plt.subplot(2, 3, 2)
        y_pred_proba = self.model.predict_proba(self.X_test)[:, 1]
        fpr, tpr, _ = roc_curve(self.y_test, y_pred_proba)
        roc_auc = auc(fpr, tpr)
        
        plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC Curve (AUC = {roc_auc:.3f})')
        plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--', label='Random Classifier')
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title('ROC Curve', fontsize=14, fontweight='bold')
        plt.legend(loc="lower right")
        plt.grid(True, alpha=0.3)
        
        # 3. Feature Importance
        plt.subplot(2, 3, 3)
        feature_importance = self.model.feature_importances_
        feature_names = self.feature_names
        
        importance_df = pd.DataFrame({
            'feature': feature_names,
            'importance': feature_importance
        }).sort_values('importance', ascending=True)
        
        plt.barh(importance_df['feature'], importance_df['importance'])
        plt.title('Feature Importance', fontsize=14, fontweight='bold')
        plt.xlabel('Onem Skoru')
        plt.tight_layout()
        
        # 4. Performance Metrics
        plt.subplot(2, 3, 4)
        metrics = ['Accuracy', 'Precision', 'Recall', 'F1 Score', 'ROC AUC']
        values = [self.results['accuracy'], self.results['precision'], 
                 self.results['recall'], self.results['f1_score'], self.results['roc_auc']]
        
        bars = plt.bar(metrics, values, color=['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'])
        plt.title('Model Performance Metrics', fontsize=14, fontweight='bold')
        plt.ylim([0, 1])
        plt.xticks(rotation=45)
        
        for bar, value in zip(bars, values):
            plt.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.01, 
                    f'{value:.3f}', ha='center', va='bottom', fontweight='bold')
        
        plt.tight_layout()
        
        # 5. Prediction Distribution
        plt.subplot(2, 3, 5)
        plt.hist(y_pred_proba[self.y_test == 0], bins=30, alpha=0.7, label='Hastalik Yok', color='blue')
        plt.hist(y_pred_proba[self.y_test == 1], bins=30, alpha=0.7, label='Hastalik Var', color='red')
        plt.xlabel('Prediction Probability')
        plt.ylabel('Frequency')
        plt.title('Prediction Probability Distribution', fontsize=14, fontweight='bold')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # 6. Model Summary
        plt.subplot(2, 3, 6)
        plt.axis('off')
        summary_text = f"""
Model Ozeti
{'='*20}

Egitim Tarihi: {datetime.now().strftime('%Y-%m-%d %H:%M')}
Veri Seti: XGBoost_heart.csv
Toplam Ornek: {len(self.data)}
Egitim Ornek: {len(self.X_train)}
Test Ornek: {len(self.X_test)}

En Iyi Parametreler:
- n_estimators: {self.model.n_estimators}
- max_depth: {self.model.max_depth}
- learning_rate: {self.model.learning_rate}
- subsample: {self.model.subsample}
- colsample_bytree: {self.model.colsample_bytree}

Performans (Test Seti):
- Accuracy: {self.results['accuracy']:.4f}
- Precision: {self.results['precision']:.4f}
- Recall: {self.results['recall']:.4f}
- F1 Score: {self.results['f1_score']:.4f}
- ROC AUC: {self.results['roc_auc']:.4f}

CV Ortalama: {self.results['cv_score']:.4f}
        """
        plt.text(0.05, 0.95, summary_text, transform=plt.gca().transAxes, 
                fontsize=10, verticalalignment='top', fontfamily='monospace')
        
        plt.tight_layout()
        
        if save_plots:
            os.makedirs('artificial intelligence/plots', exist_ok=True)
            plt.savefig('artificial intelligence/plots/xgboost_model_analysis.png', 
                       dpi=300, bbox_inches='tight')
            print("Gorsellestirmeler 'artificial intelligence/plots/xgboost_model_analysis.png' olarak kaydedildi")
        
        plt.show()
        
        return True
        
    def cross_validation_analysis(self):
        """5-Fold Cross-Validation analizi"""
        print("\n" + "="*60)
        print("CAPRAZ DOGRULAMA ANALIZI")
        print("="*60)
        
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=self.random_state)
        
        scoring_metrics = ['accuracy', 'precision', 'recall', 'f1', 'roc_auc']
        cv_results = {}
        
        for metric in scoring_metrics:
            scores = cross_val_score(self.model, self.X_processed, self.y, 
                                   cv=cv, scoring=metric, n_jobs=-1)
            cv_results[metric] = {
                'mean': scores.mean(),
                'std': scores.std(),
                'scores': scores
            }
            
            print(f"{metric.upper()} - CV Skorlari:")
            print(f"  Ortalama: {scores.mean():.4f} (+/- {scores.std() * 2:.4f})")
            print(f"  Skorlar: {scores}")
            print()
        
        self.results['cv_results'] = cv_results
        
        return True
        
    def save_model_and_results(self, model_path='artificial intelligence/models/'):
        """Modeli ve sonuclari kaydet"""
        print("\n" + "="*60)
        print("MODEL VE SONUCLARIN KAYDEDILMESI")
        print("="*60)
        
        os.makedirs(model_path, exist_ok=True)
        
        import joblib
        
        model_pipeline = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'results': self.results,
            'training_date': datetime.now().isoformat(),
            'data_shape': self.X_processed.shape,
            'class_distribution': self.y.value_counts().to_dict()
        }
        
        model_file = os.path.join(model_path, 'xgboost_heart_model_improved.pkl')
        joblib.dump(model_pipeline, model_file)
        print(f"+ Model kaydedildi: {model_file}")
        
        # Sonuclari CSV olarak kaydet
        results_df = pd.DataFrame([self.results])
        results_file = os.path.join(model_path, 'model_performance_metrics.csv')
        results_df.to_csv(results_file, index=False)
        print(f"+ Performans metrikleri kaydedildi: {results_file}")
        
        # Ozellik onemini CSV olarak kaydet
        feature_importance = pd.DataFrame({
            'feature': self.feature_names,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        importance_file = os.path.join(model_path, 'feature_importance.csv')
        feature_importance.to_csv(importance_file, index=False)
        print(f"+ Ozellik onemleri kaydedildi: {importance_file}")
        
        return True
        
    def generate_final_report(self):
        """Nihai rapor olustur"""
        print("\n" + "="*80)
        print("XGBOOST KALP HASTALIGI TAHMIN MODELI - NIHAI RAPOR")
        print("="*80)
        
        print(f"""
PROJE BILGILERI
Proje Adi: SagDuyu - Multimodal Yapay Zeka Destekli Saglik Asistani
Alt Proje: XGBoost Kalp Hastaligi Risk Tahmini Modulu
Tarih: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Gelistirici: Kilo Code (AI Assistant)

MODEL PERFORMANSI
+ Test Dogrulugu: {self.results['accuracy']:.4f} (%{self.results['accuracy']*100:.2f})
+ Precision: {self.results['precision']:.4f} (%{self.results['precision']*100:.2f})
+ Recall: {self.results['recall']:.4f} (%{self.results['recall']*100:.2f})
+ F1 Score: {self.results['f1_score']:.4f} (%{self.results['f1_score']*100:.2f})
+ ROC AUC: {self.results['roc_auc']:.4f} (%{self.results['roc_auc']*100:.2f})
+ CV Ortalama: {self.results['cv_score']:.4f} (+/- {self.results['cv_results']['accuracy']['std'] * 2:.4f})

HEDEF BASARI DURUMU
Hedeflenen Dogruluk: %85.00
Mevcut Dogruluk: %{self.results['accuracy']*100:.2f}
Durum: {'BASARILI +' if self.results['accuracy'] >= 0.85 else 'GELISTIRILMELI !'}

EN ONEMLI OZELLIKLER
""")
        
        # En onemli 5 ozelligi goster
        feature_importance = pd.DataFrame({
            'feature': self.feature_names,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        for i, (_, row) in enumerate(feature_importance.head(5).iterrows()):
            print(f"{i+1}. {row['feature']}: {row['importance']:.4f}")
        
        print(f"""
DOSYA YOLLARI
Model Dosyasi: artificial intelligence/models/xgboost_heart_model_improved.pkl
Metrikler: artificial intelligence/models/model_performance_metrics.csv
Ozellik Onemleri: artificial intelligence/models/feature_importance.csv
Gorsellestirmeler: artificial intelligence/plots/xgboost_model_analysis.png

ONERILER
1. Model {'basarili' if self.results['accuracy'] >= 0.85 else 'gelistirme'} durumda
2. En onemli ozellikler: {', '.join(feature_importance.head(3)['feature'].tolist())}
3. Dusenli model guncellemeleri icin veri toplama devam edilmeli
4. A/B testing ile gercek ortamda performans izlenmeli

TEKNIK DETAYLAR
Veri Seti Boyutu: {len(self.data)} ornek
Egitim/Test Orani: 80/20
Cross-Validation: 5-Fold Stratified
Optimizasyon: GridSearchCV
Ozellik Sayisi: {len(self.feature_names)}
        """)
        
        print("="*80)

def main():
    """Ana fonksiyon - Tum pipeline'i calistirir"""
    print("XGBoost Kalp Hastaligi Tahmin Modeli Egitimi Basliyor...")
    print("SagDuyu: Multimodal Yapay Zeka Destekli Saglik Asistani")
    print("TUBITAK Arastirma Projesi")
    print("="*80)
    
    model = XGBoostHeartDiseaseModel(random_state=42)
    
    try:
        if not model.load_and_explore_data('data/XGBoost_heart.csv'):
            print("- Veri yukleme basarisiz!")
            return False
        
        if not model.preprocess_data():
            print("- Veri on isleme basarisiz!")
            return False
        
        if not model.train_model_with_optimization():
            print("- Model egitimi basarisiz!")
            return False
        
        if not model.evaluate_model():
            print("- Model degerlendirmesi basarisiz!")
            return False
        
        if not model.cross_validation_analysis():
            print("- Cross-validation analizi basarisiz!")
            return False
        
        if not model.create_visualizations():
            print("- Gorsellestirme olusturma basarisiz!")
            return False
        
        if not model.save_model_and_results():
            print("- Model kaydetme basarisiz!")
            return False
        
        model.generate_final_report()
        
        print("\n* XGBoost Kalp Hastaligi Tahmin Modeli Basariyla Tamamlandi!")
        return True
        
    except Exception as e:
        print(f"\n- Hata olustu: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    if success:
        print("\n+ Pipeline basariyla tamamlandi!")
    else:
        print("\n- Pipeline basarisiz!")