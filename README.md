> ### ⚠️ IMPORTANT DISCLAIMER / NOTICE
> **This project is for entertainment, testing, and educational purposes only. Please DO NOT enter any real personal data (such as your actual email address or passwords).**
> 
> This website is developed entirely as a personal project and portfolio piece. It does not serve any commercial purpose. Any data or input submitted to the system is used solely for testing server/database functionality and is not actively processed, stored long-term, or shared with third parties. The developer assumes no responsibility or liability for any data entered by users or for how this open-source code is utilized by others.


# 📚 Fairytale Reading App

https://fairytaleapp.vercel.app/

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
* **Framework:** React 18 built with Vite
* **Routing:** React Router v6 (`react-router-dom`) handling protected dashboards and dynamic library routes
* **Styling:** Tailwind CSS for responsive, utility-first design
* **HTTP Client:** Axios for backend API communication
* **Speech Integration:** Native HTML5 Web Speech API (`SpeechRecognition` & `SpeechSynthesisUtterance`)

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
    ├── index.html         # Vite HTML entry point
    ├── src/
    │   ├── api/
    │   │   └── client.js  # Axios instance configured with environment variables
    │   ├── pages/
    │   │   ├── AuthPage.jsx      # Parent login/registration with KVKK consent
    │   │   ├── Dashboard.jsx     # Profile selection and child creation
    │   │   ├── Library.jsx       # Available catalogue, downloaded books, and reading history
    │   │   ├── ReadingScreen.jsx # Active reading interface with speech recognition and progress tracking
    │   │   └── SummaryScreen.jsx # Post-session accuracy stats and achievement badges
    │   ├── App.jsx        # App routing and global token state management
    │   ├── index.css      # Tailwind imports
    │   └── main.jsx       # React DOM rendering
