import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb
import joblib

DISEASES = [
    "Flu", "Common Cold", "Pneumonia", "Bronchitis", "Asthma",
    "Diabetes Type 2", "Hypertension", "Heart Disease", "Malaria", "Dengue",
    "Typhoid", "Jaundice", "Tuberculosis", "COVID-19", "Migraine",
    "Allergy", "GERD", "Arthritis", "Depression", "Anxiety"
]

SYMPTOMS = [
    "fever", "cough", "headache", "fatigue", "nausea", "chest_pain",
    "shortness_of_breath", "sore_throat", "runny_nose", "body_ache",
    "chills", "sweating", "loss_of_taste", "loss_of_smell", "vomiting",
    "diarrhea", "abdominal_pain", "joint_pain", "rash", "dizziness",
    "blurred_vision", "palpitations", "swelling", "weight_loss",
    "excessive_thirst", "frequent_urination", "dry_mouth", "muscle_pain",
    "confusion", "insomnia", "mood_swings", "loss_of_appetite",
    "yellow_skin", "dark_urine", "wheezing", "chest_tightness",
    "blood_in_sputum", "night_sweats", "persistent_cough", "stiff_neck",
    "sensitivity_to_light", "nose_bleed", "bruising", "cold_hands",
    "excessive_hunger", "slow_healing", "numbness", "tingling",
    "back_pain", "neck_pain"
]

def create_dataset(n_samples=5000):
    np.random.seed(42)
    data = []
    for _ in range(n_samples):
        disease = np.random.choice(DISEASES)
        symptoms = {s: 0 for s in SYMPTOMS}
        patterns = {
            "Flu": ["fever", "cough", "fatigue", "body_ache", "chills", "sore_throat", "runny_nose", "headache"],
            "Pneumonia": ["fever", "cough", "shortness_of_breath", "chest_pain", "fatigue", "sweating", "blood_in_sputum"],
            "COVID-19": ["fever", "cough", "loss_of_taste", "loss_of_smell", "fatigue", "shortness_of_breath", "body_ache", "headache"],
            "Diabetes Type 2": ["excessive_thirst", "frequent_urination", "fatigue", "weight_loss", "blurred_vision", "slow_healing", "numbness", "dry_mouth"],
            "Heart Disease": ["chest_pain", "shortness_of_breath", "palpitations", "fatigue", "dizziness", "swelling", "cold_hands"],
            "Depression": ["fatigue", "insomnia", "mood_swings", "loss_of_appetite", "weight_loss", "confusion", "headache", "muscle_pain"],
        }
        if disease in patterns:
            for symptom in patterns[disease]:
                symptoms[symptom] = np.random.choice([1, 1, 0], p=[0.7, 0.2, 0.1])
            extras = np.random.choice([s for s in SYMPTOMS if s not in patterns[disease]], 3, replace=False)
            for e in extras:
                symptoms[e] = np.random.choice([1, 0], p=[0.15, 0.85])
        else:
            selected = np.random.choice(SYMPTOMS, np.random.randint(4, 10), replace=False)
            for s in selected:
                symptoms[s] = 1
        row = {"disease": disease}
        row.update(symptoms)
        data.append(row)
    return pd.DataFrame(data)

def train_models():
    print("=" * 60)
    print("  MEDICAL AI - MODEL TRAINING")
    print("=" * 60)

    print("\n[1/5] Creating synthetic dataset...")
    os.makedirs("data", exist_ok=True)
    df = create_dataset(n_samples=5000)
    df.to_csv("data/disease_symptom_dataset.csv", index=False)
    print(f"   Dataset: {len(df)} rows, {len(df.columns)-1} symptoms, {df['disease'].nunique()} diseases")

    print("\n[2/5] Preparing train/test split...")
    X = df.drop("disease", axis=1)
    y = df["disease"]
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded)
    print(f"   Train: {len(X_train)} | Test: {len(X_test)}")

    print("\n[3/5] Training XGBoost...")
    xgb_model = xgb.XGBClassifier(
        n_estimators=200, max_depth=6, learning_rate=0.1,
        subsample=0.8, colsample_bytree=0.8, random_state=42, eval_metric="mlogloss"
    )
    xgb_model.fit(X_train, y_train)

    print("\n[4/5] Training Random Forest...")
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)

    print("\n[5/5] Evaluating...")
    xgb_pred = xgb_model.predict(X_test)
    rf_pred = rf_model.predict(X_test)

    print("\n" + "=" * 60)
    print("  RESULTS")
    print("=" * 60)
    print(f"  XGBoost       | Accuracy: {accuracy_score(y_test, xgb_pred):.4f} | F1: {f1_score(y_test, xgb_pred, average='macro'):.4f}")
    print(f"  Random Forest | Accuracy: {accuracy_score(y_test, rf_pred):.4f} | F1: {f1_score(y_test, rf_pred, average='macro'):.4f}")

    print("\n" + "=" * 60)
    print("  SAVING MODELS")
    print("=" * 60)
    os.makedirs("app/ml/models", exist_ok=True)
    joblib.dump(xgb_model, "app/ml/models/xgboost_model.pkl")
    joblib.dump(rf_model, "app/ml/models/rf_model.pkl")
    joblib.dump(list(X.columns), "app/ml/models/feature_names.pkl")
    joblib.dump(le, "app/ml/models/label_encoder.pkl")
    print("  Saved: xgboost_model.pkl")
    print("  Saved: rf_model.pkl")
    print("  Saved: feature_names.pkl")
    print("  Saved: label_encoder.pkl")
    print("\n  Training complete!")

if __name__ == "__main__":
    train_models()