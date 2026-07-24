import pandas as pd
import numpy as np
import os
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from imblearn.over_sampling import SMOTE
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

def create_synthetic_dataset(n_samples=5000, save_path=None):
    """Create realistic synthetic disease-symptom dataset"""
    np.random.seed(42)
    
    data = []
    for _ in range(n_samples):
        disease = np.random.choice(DISEASES)
        symptoms = {s: 0 for s in SYMPTOMS}
        
        # Disease-specific symptom patterns
        if disease == "Flu":
            symptoms["fever"] = np.random.choice([1, 1, 1, 0], p=[0.7, 0.2, 0.05, 0.05])
            symptoms["cough"] = np.random.choice([1, 1, 0], p=[0.6, 0.3, 0.1])
            symptoms["fatigue"] = np.random.choice([1, 1, 0], p=[0.7, 0.2, 0.1])
            symptoms["body_ache"] = np.random.choice([1, 0], p=[0.6, 0.4])
            symptoms["chills"] = np.random.choice([1, 0], p=[0.5, 0.5])
            symptoms["sore_throat"] = np.random.choice([1, 0], p=[0.4, 0.6])
            symptoms["runny_nose"] = np.random.choice([1, 0], p=[0.5, 0.5])
            symptoms["headache"] = np.random.choice([1, 0], p=[0.4, 0.6])
            
        elif disease == "Pneumonia":
            symptoms["fever"] = np.random.choice([1, 1, 0], p=[0.8, 0.15, 0.05])
            symptoms["cough"] = np.random.choice([1, 1, 1, 0], p=[0.7, 0.2, 0.05, 0.05])
            symptoms["shortness_of_breath"] = np.random.choice([1, 1, 0], p=[0.7, 0.2, 0.1])
            symptoms["chest_pain"] = np.random.choice([1, 0], p=[0.5, 0.5])
            symptoms["fatigue"] = np.random.choice([1, 0], p=[0.6, 0.4])
            symptoms["sweating"] = np.random.choice([1, 0], p=[0.5, 0.5])
            symptoms["blood_in_sputum"] = np.random.choice([1, 0], p=[0.3, 0.7])
            
        elif disease == "COVID-19":
            symptoms["fever"] = np.random.choice([1, 1, 0], p=[0.7, 0.2, 0.1])
            symptoms["cough"] = np.random.choice([1, 1, 0], p=[0.7, 0.2, 0.1])
            symptoms["loss_of_taste"] = np.random.choice([1, 0], p=[0.6, 0.4])
            symptoms["loss_of_smell"] = np.random.choice([1, 0], p=[0.6, 0.4])
            symptoms["fatigue"] = np.random.choice([1, 0], p=[0.7, 0.3])
            symptoms["shortness_of_breath"] = np.random.choice([1, 0], p=[0.4, 0.6])
            symptoms["body_ache"] = np.random.choice([1, 0], p=[0.5, 0.5])
            symptoms["headache"] = np.random.choice([1, 0], p=[0.4, 0.6])
            
        elif disease == "Diabetes Type 2":
            symptoms["excessive_thirst"] = np.random.choice([1, 1, 0], p=[0.7, 0.2, 0.1])
            symptoms["frequent_urination"] = np.random.choice([1, 1, 0], p=[0.7, 0.2, 0.1])
            symptoms["fatigue"] = np.random.choice([1, 0], p=[0.6, 0.4])
            symptoms["weight_loss"] = np.random.choice([1, 0], p=[0.5, 0.5])
            symptoms["blurred_vision"] = np.random.choice([1, 0], p=[0.4, 0.6])
            symptoms["slow_healing"] = np.random.choice([1, 0], p=[0.4, 0.6])
            symptoms["numbness"] = np.random.choice([1, 0], p=[0.3, 0.7])
            symptoms["dry_mouth"] = np.random.choice([1, 0], p=[0.5, 0.5])
            
        elif disease == "Heart Disease":
            symptoms["chest_pain"] = np.random.choice([1, 1, 0], p=[0.8, 0.15, 0.05])
            symptoms["shortness_of_breath"] = np.random.choice([1, 1, 0], p=[0.7, 0.2, 0.1])
            symptoms["palpitations"] = np.random.choice([1, 0], p=[0.6, 0.4])
            symptoms["fatigue"] = np.random.choice([1, 0], p=[0.6, 0.4])
            symptoms["dizziness"] = np.random.choice([1, 0], p=[0.4, 0.6])
            symptoms["swelling"] = np.random.choice([1, 0], p=[0.4, 0.6])
            symptoms["cold_hands"] = np.random.choice([1, 0], p=[0.3, 0.7])
            
        elif disease == "Depression":
            symptoms["fatigue"] = np.random.choice([1, 1, 0], p=[0.7, 0.2, 0.1])
            symptoms["insomnia"] = np.random.choice([1, 0], p=[0.6, 0.4])
            symptoms["mood_swings"] = np.random.choice([1, 0], p=[0.7, 0.3])
            symptoms["loss_of_appetite"] = np.random.choice([1, 0], p=[0.5, 0.5])
            symptoms["weight_loss"] = np.random.choice([1, 0], p=[0.4, 0.6])
            symptoms["confusion"] = np.random.choice([1, 0], p=[0.3, 0.7])
            symptoms["headache"] = np.random.choice([1, 0], p=[0.4, 0.6])
            symptoms["muscle_pain"] = np.random.choice([1, 0], p=[0.3, 0.7])
            
        else:
            # Random symptoms for other diseases
            n_symptoms = np.random.randint(3, 8)
            selected = np.random.choice(SYMPTOMS, n_symptoms, replace=False)
            for s in selected:
                symptoms[s] = 1
        
        row = {"disease": disease}
        row.update(symptoms)
        data.append(row)
    
    df = pd.DataFrame(data)
    
    if save_path:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        df.to_csv(save_path, index=False)
        print(f"Dataset saved to {save_path}")
    
    return df

def get_or_create_dataset():
    path = "data/disease_symptom_dataset.csv"
    if os.path.exists(path):
        return pd.read_csv(path)
    return create_synthetic_dataset(save_path=path)