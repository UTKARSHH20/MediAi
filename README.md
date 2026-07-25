# MediAI: Full-Stack AI Medical Diagnosis Assistant

Welcome to the **MediAI** repository! This project is a complete, production-ready AI medical assistant capable of predicting diseases from symptoms and diagnosing Pneumonia from Chest X-Rays.

**🚀 Live Application:** [Click here to view the live website](https://mediai-frontend-a2t4.onrender.com/)  

---

## 👨‍🏫 For Professors & Reviewers

### 1. The Live Product
The application is fully deployed on the internet using Render. It consists of two separate microservices working together:
- **Frontend (Next.js & React):** Provides a clean, responsive UI for doctors and patients.
- **Backend (FastAPI & Python):** Handles the secure database interactions, user authentication (JWT), and AI model inference.

### 2. Machine Learning Methodology & Training
Due to GitHub's file size limits, the raw medical datasets and the massive 77MB intermediate models were not uploaded to this repository. However, the exact methodology and training pipeline are fully documented and reproducible.

**To review the AI Training Process:**
- 🔗 **[Google Colab Training Notebook](INSERT_YOUR_COLAB_LINK_HERE)**: Click here to view the interactive training code, data preprocessing steps, and evaluation metrics in your browser.
- 💾 **[Raw Dataset & Models Download](INSERT_YOUR_GOOGLE_DRIVE_LINK_HERE)**: Click here to download the `data/` folder and the original large model files via Google Drive.

*The finalized, optimized production models (`xgboost_model.pkl` and `xray_cnn_model.pth`) are tracked in this repository under `backend/app/ml/models/` and are actively used by the live API.*

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, shadcn/ui, React Query
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **Machine Learning**: 
  - **Symptom Prediction:** XGBoost & scikit-learn (Random Forest)
  - **X-Ray Analysis:** PyTorch (MobileNet V2 / ResNet CNN)
  - **Explainability:** SHAP (SHapley Additive exPlanations)

## 📂 Project Structure

- `/backend` - FastAPI application, Database routing, and ML Inference (`/ml`)
- `/frontend` - Next.js application, UI components, and API routing
- `backend/trainer.py` & `backend/xray_trainer.py` - The core model training scripts.
