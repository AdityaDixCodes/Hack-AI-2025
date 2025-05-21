
# 📊 FinSight (PiFi) – Your AI Financial Coach

FinSight, is a conversational AI platform that transforms complex company financial documents (like 10-Ks, annual reports, and balance sheets) into clear, interactive insights. Built for investors, students, and analysts, FinSight personalizes your experience through a fun onboarding quiz and delivers everything from KPIs to educational mini-quizzes — all within a sleek mobile interface.

---

## ✨ Key Features

### 📄 Upload & Analyze Reports
- Supports PDF uploads of financial documents
- Parses content using NLP to extract key metrics and trends

### 🧠 AI Chat Assistant
- Ask questions like:
  - “What’s the EPS for this company?”
  - “Summarize the risk factors from the annual report”
- Uses vector search + LLMs for contextual, document-aware answers

### 🎯 Personalized Onboarding
- Welcome quiz collects:
  - Name
  - Financial interests (e.g., investing, accounting)
  - Skill level
- Sets tone and depth for insights (e.g., beginner vs. expert explanations)

### 📊 Interactive Visuals
- KPI cards show:
  - Revenue, Profit, ROE, EPS
  - Assets, Equity, Current Assets
- Visually organized with gradients, icons, and trends

### 🧾 Mini Quiz Mode
- Users get quizzed on report data
- Incorrect answers include **detailed explanations with references**
- Gamifies learning about financials

### ⚡ Quick Actions
- Start general chats without uploading
- Revisit and resume previous conversations

---

## 🛠️ Tech Stack

| Layer         | Tech Used                                     |
|---------------|-----------------------------------------------|
| Frontend      | React Native (Expo), Recharts/Victory Charts  |
| Backend       | Node.js, Express.js                           |
| AI/NLP        | Python (LangChain, PyMuPDF, OpenAI API, FAISS)|
| Database      | MongoDB                                       |
| Authentication| JWT, bcrypt                                   |
| Hosting       | Vercel (Frontend), Railway/Render (Backend)   |

---

## 🚀 How to Run Locally

1. Clone the repo:
   ```bash
   git clone https://github.com/your-username/FinSight.git
   cd FinSight
   ```

2. Start the backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. Start the frontend:
   ```bash
   cd frontend
   npm install
   expo start
   ```
---

## 📌 Future Plans

- Exportable PDF insights reports
- Multi-language document parsing
- Live valuation models
---

## 👥 Team

- Dhivyesh Prithiviraj, Kaushik Shivakumar, Adi Dixit, Kartik Emani

---
