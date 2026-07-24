import os
import csv
import random

def generate_synthetic_data(num_samples=5000):
    diseases = [
        "Flu", "Common Cold", "Pneumonia", "Bronchitis", "Asthma", 
        "Diabetes", "Hypertension", "Heart Disease", "Malaria", "Dengue", 
        "Typhoid", "Jaundice", "Tuberculosis", "COVID-19", "Migraine", 
        "Allergy", "GERD", "Arthritis", "Depression", "Anxiety"
    ]

    symptoms = [
        "fever", "cough", "headache", "fatigue", "nausea", 
        "chest_pain", "shortness_of_breath", "sore_throat", "runny_nose", 
        "body_ache", "chills", "sweating", "loss_of_taste", "loss_of_smell", 
        "vomiting", "diarrhea", "abdominal_pain", "joint_pain", "rash", 
        "dizziness", "blurred_vision", "palpitations", "swelling", 
        "weight_loss", "excessive_thirst", "frequent_urination",
        "muscle_weakness", "stiff_neck", "loss_of_appetite", "wheezing",
        "heartburn", "acid_reflux", "constipation", "sneezing", "itchy_eyes",
        "insomnia", "restlessness", "irritability", "poor_concentration",
        "back_pain", "swollen_lymph_nodes", "pale_skin", "easy_bruising",
        "nosebleeds", "bleeding_gums", "hair_loss", "cold_hands_feet",
        "brittle_nails", "dry_skin", "mouth_ulcers"
    ]

    disease_profiles = {
        "Flu": ["fever", "chills", "body_ache", "fatigue", "headache", "cough"],
        "Common Cold": ["runny_nose", "sore_throat", "sneezing", "cough", "mild_fever"],
        "COVID-19": ["fever", "cough", "loss_of_taste", "loss_of_smell", "shortness_of_breath", "fatigue"],
        "Migraine": ["headache", "nausea", "dizziness", "blurred_vision", "vomiting"],
        "Diabetes": ["excessive_thirst", "frequent_urination", "weight_loss", "fatigue", "blurred_vision"],
        "Hypertension": ["headache", "dizziness", "palpitations", "fatigue", "shortness_of_breath"],
        "Heart Disease": ["chest_pain", "shortness_of_breath", "palpitations", "fatigue", "sweating"],
        "Asthma": ["shortness_of_breath", "wheezing", "chest_pain", "cough"],
        "Pneumonia": ["fever", "cough", "shortness_of_breath", "chills", "chest_pain"],
        "Bronchitis": ["cough", "fatigue", "shortness_of_breath", "chest_pain", "fever"],
        "Malaria": ["fever", "chills", "sweating", "headache", "nausea", "vomiting", "body_ache"],
        "Dengue": ["fever", "headache", "body_ache", "joint_pain", "rash", "nausea", "vomiting"],
        "Typhoid": ["fever", "headache", "abdominal_pain", "constipation", "diarrhea", "loss_of_appetite"],
        "Jaundice": ["fever", "abdominal_pain", "nausea", "vomiting", "weight_loss", "fatigue"],
        "Tuberculosis": ["cough", "weight_loss", "fever", "sweating", "fatigue", "chest_pain"],
        "Allergy": ["sneezing", "runny_nose", "itchy_eyes", "rash", "sore_throat"],
        "GERD": ["heartburn", "acid_reflux", "chest_pain", "nausea", "cough", "sore_throat"],
        "Arthritis": ["joint_pain", "swelling", "stiff_neck", "back_pain", "fatigue"],
        "Depression": ["fatigue", "insomnia", "loss_of_appetite", "poor_concentration", "weight_loss"],
        "Anxiety": ["palpitations", "sweating", "restlessness", "insomnia", "dizziness"]
    }

    data_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'data')
    os.makedirs(data_dir, exist_ok=True)
    file_path = os.path.join(data_dir, 'disease_symptom_dataset.csv')

    with open(file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        # Header
        writer.writerow(symptoms + ['disease'])
        
        for _ in range(num_samples):
            disease = random.choice(diseases)
            row = {s: 0 for s in symptoms}
            
            if disease in disease_profiles:
                for cs in disease_profiles[disease]:
                    if cs in symptoms and random.random() < 0.85:
                        row[cs] = 1
                        
            for s in symptoms:
                if s not in disease_profiles.get(disease, []) and random.random() < 0.05:
                    row[s] = 1
                    
            writer.writerow([row[s] for s in symptoms] + [disease])
            
    print(f"Generated {num_samples} rows of synthetic data at {file_path}")

if __name__ == "__main__":
    generate_synthetic_data()
