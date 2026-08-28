# 📚 Fairytale Reading App

An interactive reading and literacy companion designed to help children practice reading aloud with real-time feedback, progress tracking, and parent oversight.

---

## ⚠️ Browser Compatibility Notice

> **Important:** The **Web Speech / Text-to-Speech (TTS) & Speech-to-Text (STT)** browser features are officially supported and tested **only on Google Chrome and Microsoft Edge** (Chromium-based engines). Other browsers (such as Firefox or Safari) may have limited or unsupported Web Speech API implementations.

---

## 🛠️ Tech Stack

### **Backend**
* **Framework:** FastAPI (Python 3.10+)
* **Database & ORM:** PostgreSQL, SQLAlchemy
* **Authentication:** OAuth2 Password Bearer, JWT (`python-jose`), Passlib (`bcrypt`)
* **Validation:** Pydantic (v2)
* **Audio Engine:** FastAPI streaming & endpoints for STT/TTS processing

### **Frontend**
* **Framework:** React 18 built with Vite[cite: 11, 17]
* **Routing:** React Router v6 (`react-router-dom`) handling protected dashboards and dynamic library routes[cite: 9]
* **Styling:** Tailwind CSS for responsive, utility-first design[cite: 10, 12, 13]
* **HTTP Client:** Axios for backend API communication
* **Speech Integration:** Native HTML5 Web Speech API (`SpeechRecognition` & `SpeechSynthesisUtterance`)[cite: 15]

---

## 📂 Project Structure

```text
├── backend/
│   ├── audio.py           # STT & TTS routing & audio byte handling
│   ├── auth.py            # Password hashing, JWT token creation & auth dependencies
│   ├── database.py        # SQLAlchemy engine & session maker
│   ├── main.py            # FastAPI entry point, CORS, and route handlers
│   ├── models.py          # SQLAlchemy database models
│   ├── schemas.py         # Pydantic validation models
│   └── requirements.txt   # Backend dependencies
│
└── frontend/
    ├── index.html         # Vite HTML entry point[cite: 8]
    ├── src/
    │   ├── api/
    │   │   └── client.js  # Axios instance configured with environment variables
    │   ├── pages/
    │   │   ├── AuthPage.jsx      # Parent login/registration with KVKK consent
    │   │   ├── Dashboard.jsx     # Profile selection and child creation[cite: 13]
    │   │   ├── Library.jsx       # Available catalogue, downloaded books, and reading history[cite: 14]
    │   │   ├── ReadingScreen.jsx # Active reading interface with speech recognition and progress tracking[cite: 15]
    │   │   └── SummaryScreen.jsx # Post-session accuracy stats and achievement badges[cite: 16]
    │   ├── App.jsx        # App routing and global token state management[cite: 9]
    │   ├── index.css      # Tailwind imports[cite: 10]
    │   └── main.jsx       # React DOM rendering[cite: 11]