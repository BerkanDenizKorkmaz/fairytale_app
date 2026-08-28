# Fairytale App 🧚‍♀️📖

An interactive educational reading application designed to help children practice reading aloud. The application utilizes real-time Speech-to-Text (STT) for reading tracking and Text-to-Speech (TTS) for corrective pronunciation support.

## 🚀 Features
* **Secure Authentication:** JWT-based parent account creation and login workflows.
* **Child Profiles:** Picture-based account selection cards for younger users.
* **Reading Engine:** Real-time STT endpoint that processes speech and immediately discards raw audio data for privacy.
* **Pronunciation Support:** TTS endpoint that supplies correct audio pronunciations for struggled words.
* **Privacy First:** Explicit KVKK consent tracking and automated cascading data deletion.

## 🛠️ Tech Stack
* **Backend:** Python, FastAPI, SQLAlchemy, Pydantic
* **Database:** PostgreSQL (Neon Serverless)
* **Authentication:** JSON Web Tokens (JWT), passlib (bcrypt)
* **Deployment:** Vercel (Planned)

---

## 💻 Local Development Setup

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Python 3.9+](https://www.python.org/downloads/)
* [Git](https://git-scm.com/)

### 2. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/fairytale-app.git](https://github.com/YOUR_USERNAME/fairytale-app.git)
cd fairytale-app
